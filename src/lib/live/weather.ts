import { cacheLife } from "next/cache";

// Open-Meteo: free, no key, CC BY 4.0. Point is Marikina City Hall area.
const LAT = 14.6507;
const LON = 121.1029;

const FORECAST_URL =
  `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
  "&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m" +
  "&hourly=temperature_2m,precipitation_probability,precipitation" +
  "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,uv_index_max" +
  "&forecast_days=7&timezone=Asia%2FManila";

const AIR_URL =
  `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${LAT}&longitude=${LON}` +
  "&current=pm2_5,pm10,us_aqi&timezone=Asia%2FManila";

export type Weather = {
  current: {
    time: string;
    temp: number;
    feelsLike: number;
    humidity: number;
    precipitation: number;
    code: number;
    wind: number;
  };
  hourly: { time: string; temp: number; rainChance: number; rain: number }[];
  daily: {
    date: string;
    code: number;
    max: number;
    min: number;
    rain: number;
    rainChance: number;
    uv: number;
  }[];
  air: { pm25: number; pm10: number; aqi: number } | null;
};

/** Never throws; a failure is cached only briefly ("retry"). */
export async function getWeather(): Promise<Weather | null> {
  "use cache";
  try {
    const weather = await fetchWeather();
    cacheLife("weather");
    return weather;
  } catch {
    cacheLife("retry");
    return null;
  }
}

async function fetchWeather(): Promise<Weather> {
  const [fRes, aRes] = await Promise.all([
    fetch(FORECAST_URL, { signal: AbortSignal.timeout(10_000) }),
    fetch(AIR_URL, { signal: AbortSignal.timeout(10_000) }).catch(() => null),
  ]);
  if (!fRes.ok) throw new Error(`Open-Meteo ${fRes.status}`);
  const f = await fRes.json();
  const a = aRes?.ok ? await aRes.json() : null;

  // Next 24 hours from the current hour
  const nowHour = (f.current.time as string).slice(0, 13);
  const start = Math.max(
    0,
    (f.hourly.time as string[]).findIndex((t) => t.startsWith(nowHour)),
  );

  return {
    current: {
      time: f.current.time,
      temp: f.current.temperature_2m,
      feelsLike: f.current.apparent_temperature,
      humidity: f.current.relative_humidity_2m,
      precipitation: f.current.precipitation,
      code: f.current.weather_code,
      wind: f.current.wind_speed_10m,
    },
    hourly: (f.hourly.time as string[]).slice(start, start + 24).map((t, i) => ({
      time: t,
      temp: f.hourly.temperature_2m[start + i],
      rainChance: f.hourly.precipitation_probability[start + i] ?? 0,
      rain: f.hourly.precipitation[start + i] ?? 0,
    })),
    daily: (f.daily.time as string[]).map((d, i) => ({
      date: d,
      code: f.daily.weather_code[i],
      max: f.daily.temperature_2m_max[i],
      min: f.daily.temperature_2m_min[i],
      rain: f.daily.precipitation_sum[i],
      rainChance: f.daily.precipitation_probability_max[i] ?? 0,
      uv: f.daily.uv_index_max[i],
    })),
    air: a?.current
      ? { pm25: a.current.pm2_5, pm10: a.current.pm10, aqi: a.current.us_aqi }
      : null,
  };
}

/** WMO weather interpretation codes, condensed. */
export function describeWeather(code: number): string {
  if (code === 0) return "Clear sky";
  if (code <= 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code <= 48) return "Fog";
  if (code <= 57) return "Drizzle";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Rain showers";
  if (code <= 86) return "Snow showers";
  return "Thunderstorm";
}

export function describeAqi(aqi: number): { label: string; tone: "good" | "fair" | "poor" } {
  if (aqi <= 50) return { label: "Good", tone: "good" };
  if (aqi <= 100) return { label: "Moderate", tone: "fair" };
  if (aqi <= 150) return { label: "Unhealthy for sensitive groups", tone: "poor" };
  return { label: "Unhealthy", tone: "poor" };
}
