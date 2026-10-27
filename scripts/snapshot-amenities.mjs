// Refreshes src/data/amenities-snapshot.json from Overpass, the fallback the
// map uses when live Overpass requests fail. Run: npm run snapshot:amenities
import { writeFileSync } from "node:fs";

const QUERY = `[out:json][timeout:90];
area["name"="Marikina"]["admin_level"="6"]->.a;
(
  nwr["amenity"~"^(hospital|clinic|school|police|fire_station|townhall)$"](area.a);
  nwr["emergency"="assembly_point"](area.a);
  nwr["social_facility"="shelter"](area.a);
);
out tags center;`;

const KINDS = new Set(["hospital", "clinic", "school", "police", "fire_station", "townhall"]);

const res = await fetch("https://overpass-api.de/api/interpreter", {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    "User-Agent": "BetterMarikina/1.0 (community civic portal)",
  },
  body: "data=" + encodeURIComponent(QUERY),
  signal: AbortSignal.timeout(120_000),
});
if (!res.ok) throw new Error(`Overpass returned ${res.status}`);
const { elements } = await res.json();

const amenities = [];
for (const el of elements) {
  const t = el.tags ?? {};
  const kind =
    t.emergency === "assembly_point" || t.social_facility === "shelter"
      ? "shelter"
      : KINDS.has(t.amenity)
        ? t.amenity
        : null;
  const lat = el.lat ?? el.center?.lat;
  const lon = el.lon ?? el.center?.lon;
  if (!kind || lat === undefined || lon === undefined) continue;
  const address = [t["addr:housenumber"], t["addr:street"]].filter(Boolean).join(" ");
  amenities.push({
    id: `${el.type}/${el.id}`,
    name: t.name ?? t["name:en"] ?? `Unnamed ${kind.replace("_", " ")}`,
    kind,
    lat,
    lon,
    ...(address && { address }),
  });
}

writeFileSync(
  new URL("../src/data/amenities-snapshot.json", import.meta.url),
  JSON.stringify({ fetchedAt: new Date().toISOString().slice(0, 10), amenities }, null, 1) + "\n",
);
console.log(`Saved ${amenities.length} places`);
