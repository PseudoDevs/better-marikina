import { cacheLife } from "next/cache";
import snapshot from "@/data/amenities-snapshot.json";

// OpenStreetMap via Overpass (ODbL). Public instances are slow (15–45 s) and
// rate-limited, so results are cached for a day and a committed snapshot is
// served when every mirror fails. Refresh it with `npm run snapshot:amenities`.
const MIRRORS = [
  "https://overpass-api.de/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
];

export const AMENITY_QUERY = `[out:json][timeout:60];
area["name"="Marikina"]["admin_level"="6"]->.a;
(
  nwr["amenity"~"^(hospital|clinic|school|police|fire_station|townhall)$"](area.a);
  nwr["emergency"="assembly_point"](area.a);
  nwr["social_facility"="shelter"](area.a);
);
out tags center;`;

export type AmenityKind =
  | "hospital"
  | "clinic"
  | "school"
  | "police"
  | "fire_station"
  | "townhall"
  | "shelter";

export type Amenity = {
  id: string;
  name: string;
  kind: AmenityKind;
  lat: number;
  lon: number;
  address?: string;
};

export type OsmElement = {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

function kindOf(tags: Record<string, string>): AmenityKind | null {
  if (tags.emergency === "assembly_point" || tags.social_facility === "shelter")
    return "shelter";
  const a = tags.amenity;
  if (
    a === "hospital" ||
    a === "clinic" ||
    a === "school" ||
    a === "police" ||
    a === "fire_station" ||
    a === "townhall"
  )
    return a;
  return null;
}

export function toAmenities(elements: OsmElement[]): Amenity[] {
  const out: Amenity[] = [];
  for (const el of elements) {
    const tags = el.tags ?? {};
    const kind = kindOf(tags);
    const lat = el.lat ?? el.center?.lat;
    const lon = el.lon ?? el.center?.lon;
    if (!kind || lat === undefined || lon === undefined) continue;
    const street = [tags["addr:housenumber"], tags["addr:street"]]
      .filter(Boolean)
      .join(" ");
    out.push({
      id: `${el.type}/${el.id}`,
      name: tags.name ?? tags["name:en"] ?? `Unnamed ${kind.replace("_", " ")}`,
      kind,
      lat,
      lon,
      address: street || undefined,
    });
  }
  return out;
}

/** Tries each mirror in turn; throws when all of them fail. */
async function fetchAmenities(): Promise<Amenity[]> {
  let lastError: unknown;
  for (const url of MIRRORS) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "BetterMarikina/1.0 (community civic portal)",
        },
        body: "data=" + encodeURIComponent(AMENITY_QUERY),
        signal: AbortSignal.timeout(60_000),
      });
      if (!res.ok) throw new Error(`Overpass ${res.status}`);
      const json = (await res.json()) as { elements: OsmElement[] };
      return toAmenities(json.elements);
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError;
}

/** Never throws; a failure is cached only briefly ("retry") and the snapshot is served. */
export async function getAmenities(): Promise<{ amenities: Amenity[]; live: boolean }> {
  "use cache";
  try {
    const amenities = await fetchAmenities();
    cacheLife("daily");
    return { amenities, live: true };
  } catch {
    cacheLife("retry");
    return { amenities: snapshot.amenities as Amenity[], live: false };
  }
}

export const SNAPSHOT_DATE = snapshot.fetchedAt;
