import { cacheLife } from "next/cache";

// USGS FDSN event service. PHIVOLCS has no machine-readable feed, so USGS is
// used for the list and PHIVOLCS is linked for official local bulletins.
const QUAKES_URL =
  "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson" +
  "&latitude=14.65&longitude=121.10&maxradiuskm=300&minmagnitude=3&orderby=time&limit=15";

export type Quake = {
  id: string;
  mag: number;
  place: string;
  time: number;
  depthKm: number;
  url: string;
  distanceKm: number;
};

function distanceKm(lat: number, lon: number) {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat - 14.65);
  const dLon = toRad(lon - 121.1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(14.65)) * Math.cos(toRad(lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/** Never throws; a failure is cached only briefly ("retry"). */
export async function getQuakes(): Promise<Quake[] | null> {
  "use cache";
  try {
    const quakes = await fetchQuakes();
    cacheLife("quakes");
    return quakes;
  } catch {
    cacheLife("retry");
    return null;
  }
}

async function fetchQuakes(): Promise<Quake[]> {
  const res = await fetch(QUAKES_URL, { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`USGS ${res.status}`);
  const json = await res.json();
  return json.features.map(
    (f: {
      id: string;
      properties: { mag: number; place: string; time: number; url: string };
      geometry: { coordinates: [number, number, number] };
    }) => {
      const [lon, lat, depth] = f.geometry.coordinates;
      return {
        id: f.id,
        mag: f.properties.mag,
        place: f.properties.place,
        time: f.properties.time,
        depthKm: depth,
        url: f.properties.url,
        distanceKm: Math.round(distanceKm(lat, lon)),
      };
    },
  );
}
