import Link from "next/link";
import { CloudRain, Droplets, Thermometer, Wind } from "lucide-react";
import { describeAqi, describeWeather, getWeather } from "@/lib/live/weather";
import { getQuakes } from "@/lib/live/quakes";
import { Card, Unavailable } from "./ui";

const AQI_TONE = {
  good: "bg-ok-soft text-ok",
  fair: "bg-warn-soft text-warn",
  poor: "bg-danger-soft text-danger",
};

export async function WeatherCard() {
  const w = await getWeather();
  if (!w)
    return <Unavailable what="Weather" href="https://www.pagasa.dost.gov.ph" linkLabel="PAGASA" />;
  const rainSoon = w.hourly.slice(0, 6).reduce((m, h) => Math.max(m, h.rainChance), 0);
  const aqi = w.air ? describeAqi(w.air.aqi) : null;

  return (
    <Card className="h-full">
      <p className="text-sm font-semibold text-ink-muted">Weather now · Marikina</p>
      <div className="mt-3 flex items-end gap-3">
        <p className="font-display text-5xl font-bold tabular-nums">
          {Math.round(w.current.temp)}°
        </p>
        <div className="pb-1.5">
          <p className="font-semibold">{describeWeather(w.current.code)}</p>
          <p className="text-sm text-ink-muted">
            Feels like {Math.round(w.current.feelsLike)}°
          </p>
        </div>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <Stat icon={<CloudRain className="size-4" />} label="Rain chance, 6h" value={`${rainSoon}%`} />
        <Stat icon={<Droplets className="size-4" />} label="Humidity" value={`${w.current.humidity}%`} />
        <Stat icon={<Wind className="size-4" />} label="Wind" value={`${Math.round(w.current.wind)} km/h`} />
        <Stat
          icon={<Thermometer className="size-4" />}
          label="Today"
          value={`${Math.round(w.daily[0].min)}°–${Math.round(w.daily[0].max)}°`}
        />
      </dl>
      {w.air && aqi && (
        <p className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          Air quality
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${AQI_TONE[aqi.tone]}`}>
            {aqi.label} · AQI {w.air.aqi}
          </span>
          <span className="text-ink-muted">PM2.5 {w.air.pm25.toFixed(1)} µg/m³</span>
        </p>
      )}
      <Link href="/weather" className="mt-4 inline-block text-sm font-semibold text-brand hover:underline">
        7-day forecast →
      </Link>
    </Card>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-surface-2 px-3 py-2">
      <dt className="flex items-center gap-1.5 text-xs text-ink-muted">
        <span aria-hidden>{icon}</span>
        {label}
      </dt>
      <dd className="mt-0.5 font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

const DAY = new Intl.DateTimeFormat("en-PH", { weekday: "short", month: "short", day: "numeric", timeZone: "Asia/Manila" });
const HOUR = new Intl.DateTimeFormat("en-PH", { hour: "numeric", timeZone: "Asia/Manila" });
const WHEN = new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Manila" });

export async function Forecast() {
  const w = await getWeather();
  if (!w)
    return <Unavailable what="The forecast" href="https://www.pagasa.dost.gov.ph" linkLabel="PAGASA" />;
  const maxRain = Math.max(1, ...w.hourly.map((h) => h.rainChance));

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="font-semibold">Next 24 hours — chance of rain</h3>
        <ol className="mt-4 flex h-36 items-end gap-1" aria-label="Hourly rain chance">
          {w.hourly.map((h) => (
            <li key={h.time} className="flex flex-1 flex-col items-center justify-end gap-1 h-full">
              <span className="text-[10px] tabular-nums text-ink-muted">
                {h.rainChance >= 20 ? `${h.rainChance}` : ""}
              </span>
              <span
                className="w-full rounded-t bg-brand"
                style={{ height: `${(h.rainChance / maxRain) * 80 + 2}%` }}
                title={`${HOUR.format(new Date(h.time + "+08:00"))}: ${h.rainChance}% rain, ${Math.round(h.temp)}°`}
              />
              <span className="text-[10px] text-ink-muted">
                {new Date(h.time + "+08:00").getHours() % 6 === 0
                  ? HOUR.format(new Date(h.time + "+08:00"))
                  : ""}
              </span>
            </li>
          ))}
        </ol>
      </Card>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
        {w.daily.map((d) => (
          <li key={d.date}>
            <Card className="h-full !p-4">
              <p className="text-sm font-semibold">{DAY.format(new Date(d.date + "T12:00:00+08:00"))}</p>
              <p className="mt-1 text-sm text-ink-muted">{describeWeather(d.code)}</p>
              <p className="mt-2 font-display text-2xl font-bold tabular-nums">
                {Math.round(d.max)}°<span className="text-base text-ink-muted"> / {Math.round(d.min)}°</span>
              </p>
              <p className="mt-1 text-xs text-ink-muted">
                Rain {d.rainChance}% · {d.rain.toFixed(1)} mm · UV {Math.round(d.uv)}
              </p>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function QuakeList() {
  const quakes = await getQuakes();
  if (!quakes)
    return <Unavailable what="Earthquake data" href="https://www.phivolcs.dost.gov.ph" linkLabel="PHIVOLCS" />;
  if (quakes.length === 0)
    return <Card><p className="text-ink-muted">No M3+ earthquakes within 300 km recently.</p></Card>;

  return (
    <Card className="!p-0">
      <ul className="divide-y divide-line">
        {quakes.map((q) => (
          <li key={q.id} className="flex items-center gap-4 px-5 py-3">
            <span
              className={`flex size-12 shrink-0 items-center justify-center rounded-lg font-display text-lg font-bold tabular-nums ${
                q.mag >= 5 ? "bg-danger-soft text-danger" : q.mag >= 4 ? "bg-warn-soft text-warn" : "bg-surface-2"
              }`}
            >
              {q.mag.toFixed(1)}
            </span>
            <div className="min-w-0 flex-1">
              <a href={q.url} className="font-medium hover:underline">{q.place}</a>
              <p className="text-sm text-ink-muted">
                {WHEN.format(q.time)} · {q.distanceKm} km from Marikina · {Math.round(q.depthKm)} km deep
              </p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
