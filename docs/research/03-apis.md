# 03 — Public APIs & Data Sources for Better Marikina

Tested 2026-10-27 with curl from Windows (Git Bash). "Verified" = real HTTP 200 with the shape shown. CORS column = `Access-Control-Allow-Origin` observed.

**General rule:** call everything from Next.js server code (Route Handlers / Server Components) with `fetch(url, { next: { revalidate: N } })`. This hides upstream flakiness, avoids CORS, keeps keys secret and keeps the load on government servers low. Always render a "last updated / source" line and degrade gracefully when the upstream is down.

## Summary

| # | Source | Status | Auth | CORS | Suggested revalidate |
|---|--------|--------|------|------|----------------------|
| 1 | Open-Meteo forecast | VERIFIED | none | `*` | 900 s |
| 1 | Open-Meteo air quality | VERIFIED | none | `*` | 3600 s |
| 1 | PAGASA bulletins (pubfiles) | VERIFIED (dir listing, PDFs) | none | n/a | 1800 s |
| 1 | OpenWeatherMap | needs key (401 without) | API key | yes | skip — Open-Meteo is enough |
| 2 | **PAGASA FFWS water level JSON** | **VERIFIED** | none | **none** (server-side only) | 300–600 s |
| 2 | Project NOAH API | no public API found | — | — | use as link-out |
| 3 | USGS FDSN GeoJSON | VERIFIED | none | `*` | 300 s |
| 3 | PHIVOLCS | HTML only (scrape) | none | n/a | 600 s |
| 4 | PSGC (psgc.gitlab.io) | VERIFIED | none | `*` | 1 week / static |
| 4 | psgc.cloud | VERIFIED | none | ? | static |
| 5 | Nager.Date holidays | VERIFIED | none | `*` | 1 day |
| 5 | Frankfurter (api.frankfurter.dev) | VERIFIED | none | yes | 6 h |
| 5 | open.er-api.com | VERIFIED | none | yes | 6 h |
| 5 | Fuel prices | no API (DOE PDFs) | — | — | manual/CMS |
| 6 | Overpass API | VERIFIED (159 features) | none | yes | 1 day, or snapshot at build |
| 7 | data.gov.ph | SPA, no CKAN API reachable | — | — | link-out |
| 8 | GeoRiskPH / HazardHunterPH | site up; no documented public API | — | — | link-out / embed |

---

## 1. Weather

### Open-Meteo — VERIFIED
- Forecast: `https://api.open-meteo.com/v1/forecast?latitude=14.6507&longitude=121.1029&current=temperature_2m,precipitation,weather_code&hourly=precipitation_probability&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Asia/Manila`
- Air quality: `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=14.6507&longitude=121.1029&current=pm2_5,pm10,us_aqi&timezone=Asia/Manila`
- Auth none; free tier non-commercial, ~10k calls/day; data CC BY 4.0 (attribute "Weather data by Open-Meteo.com"). Commercial use requires a paid plan — a city/civic non-profit portal is generally fine, confirm if monetised.
- Sample (trimmed):
```json
{"latitude":14.657293,"longitude":121.11524,"timezone":"Asia/Manila","elevation":15.0,
 "current_units":{"temperature_2m":"°C","precipitation":"mm","weather_code":"wmo code"},
 "current":{"time":"2026-10-27T15:45","temperature_2m":..., "precipitation":..., "weather_code":...}}
```
```json
{"latitude":14.700005,"longitude":121.100006,"current_units":{"pm2_5":"μg/m³","us_aqi":"USAQI"},"current":{"time":"2026-10-27T07:00",...}}
```
Note the air-quality endpoint defaults to GMT — pass `timezone=Asia/Manila`.

### PAGASA
- No official public JSON API. `https://pubfiles.pagasa.dost.gov.ph/tamss/weather/bulletin/` is an open nginx directory listing of tropical cyclone bulletin PDFs (e.g. `IWS#2_pilandok.pdf`) — VERIFIED 200. Usable to detect "an active bulletin exists" by parsing the listing and linking to the newest PDF.
- `bagong.pagasa.dost.gov.ph` is HTML only (scrapeable but brittle). Rainfall/thunderstorm advisories for NCR appear there.
- Radar tiles referenced by FFWS page: `https://pmtrb-geoserver.pagasa.dost.gov.ph:8080/radar/siteRadarTile.do` (undocumented, port 8080 — don't depend on it).
- License: government work; attribute PAGASA-DOST.

### OpenWeatherMap
- `api.openweathermap.org/data/2.5/weather` returns `401 Invalid API key` without key. Free key: 60 calls/min, 1M/month. Not needed; skip unless Open-Meteo fails.

## 2. Marikina River water level

### PAGASA Pasig–Marikina–Tullahan Flood Forecasting & Warning System — VERIFIED (best find)
- `GET https://pasig-marikina-tullahanffws.pagasa.dost.gov.ph/water/main_list.do` → JSON array, 21 stations, 10-min updates.
- `POST .../water/table_list.do` (form `ymdhm=`) → same stations with `wl30m/wl1h/wl2h` history. Also `.../water/detail_list.do` (used by the site's table page).
- `.../rain/main_list.do` exists but returned empty body in testing.
- Auth none. **No CORS headers** → must be fetched server-side. Undocumented/unofficial: no SLA, could change; cache and show stale data with timestamp. Attribute PAGASA.
- Sample element:
```json
{"obscd":"11105201","agctype":"002","obsnm":"Angono","lon":121.1423667,"lat":14.5268306,
 "ymdhm":"202610271530","timestr":"2026-10-27 15:30","wl":"11.76","wl10m":"11.76","wl30m":"11.75",
 "wl1h":"11.75","wl2h":"11.75","wlchange":"0.01","alertwl":null,"alarmwl":null,"criticalwl":null,"icon":null}
```
- Marikina-relevant stations (2026-10-27 15:30, metres above datum):

| obscd | name | wl | alert | alarm | critical |
|---|---|---|---|---|---|
| 11104204 | Sto Nino (MMDA) — the "Sto. Niño" gauge the city uses | 12.48 | 15.00 | 16.00 | 17.00 |
| 11104201 | Sto Nino (PAGASA, no coords) | 12.09(*) | – | – | – |
| 11103203 | Tumana Bridge | 12.87 | 17.26 | 18.26 | 19.26 |
| 11103202 | Nangka | 15.76 | 16.50 | 17.10 | 17.70 |
| 11103201 | San Mateo-1 | 14.07 | 18.00 | 19.00 | 20.00 |
| 11102202 | Montalban (upstream) | 22.20 | 22.40 | 23.00 | 23.60 |
| 11102201 / 11102203 | Rodriguez / Burgos (upstream) | 27.21 / 27.22 | 28.80 / 27.40 | … | … |

- Parsing gotchas: values are **strings**; a trailing `(*)` marks a suspect/missing reading (e.g. `"0.00(*)"`) — strip it and flag as stale; some stations have `null` lat/lon. Map to levels: `wl >= criticalwl` → 3rd alarm/forced evacuation, `>= alarmwl` → 2nd alarm/prepare to evacuate, `>= alertwl` → 1st alarm (Marikina's 15/16/17 m convention at Sto. Niño).
- Recommendation: Route Handler `/api/river` with `revalidate: 300`; also persist each reading to DB (cron) to draw your own trend chart, since the API only gives ~2 h of history.

### Project NOAH (noah.up.edu.ph)
- Site is an Angular SPA; `api.noah.up.edu.ph` did not resolve. No documented public API. Use as a link-out ("View hazard maps on NOAH").

### Marikina City / ASTI
- No public city river-level feed found. ASTI's DOST sensor portal (repo.pscigrid.gov.ph / predict) historically required registration; not verified. Treat FFWS as the source of truth.

## 3. Earthquakes

### USGS FDSN Event API — VERIFIED
- `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&latitude=14.65&longitude=121.10&maxradiuskm=300&minmagnitude=3&orderby=time&limit=20`
- Auth none, CORS `*`, public domain. Rate limits: be polite; prefer `starttime=` window. Also static feeds e.g. `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson` (filter by distance yourself).
- Sample:
```json
{"type":"FeatureCollection","metadata":{"title":"USGS Earthquakes","status":200,"api":"2.8.2","limit":2},
 "features":[{"type":"Feature","properties":{"mag":4.6,"place":"17 km NNE of Santa Cruz, Philippines","time":1791537438680,"url":"https://earthquake.usgs.gov/earthquakes/..."},"geometry":{"type":"Point","coordinates":[lon,lat,depth]}}]}
```
- Revalidate 300 s.

### PHIVOLCS
- `https://earthquake.phivolcs.dost.gov.ph/` returns a ~120 KB HTML table (has TLS chain issues — needed `-k`). No JSON/RSS feed. PHIVOLCS is authoritative for PH magnitudes/intensity; option: scrape server-side (revalidate 600) and show alongside USGS, or just link out. Note the Valley Fault System runs through Marikina — link to PHIVOLCS FaultFinder.

## 4. PSGC — VERIFIED
- City: `https://psgc.gitlab.io/api/cities/137402000/`
```json
{"code":"137402000","name":"City of Marikina","isCapital":false,"provinceCode":false,"districtCode":"137400000","regionCode":"130000000","islandGroupCode":"luzon","psgc10DigitCode":"1380700000"}
```
- Barangays: `https://psgc.gitlab.io/api/cities/137402000/barangays/` → array of 16
```json
[{"code":"137402001","name":"Barangka","cityCode":"137402000","districtCode":"137400000","regionCode":"130000000","psgc10DigitCode":"1380700001"},{"code":"137402002","name":"Calumpang",...}]
```
- Auth none, CORS `*`, served as `text/html` content-type (parse with `res.json()` anyway). Alternative `https://psgc.cloud/api/...` uses 10-digit codes (Marikina = `1380700000`).
- Recommendation: data is static — snapshot to `data/barangays.json` at build time; no runtime dependency.

## 5. Holidays, FX, fuel

- **Nager.Date** — VERIFIED `https://date.nager.at/api/v3/PublicHolidays/2026/PH`, CORS `*`, no auth.
  `[{"date":"2026-01-01","localName":"Bagong Taon","name":"New Year's Day","countryCode":"PH","types":["Public"]},{"date":"2026-02-17","localName":"Chinese New Year",...}]`
  Caveat: PH special non-working days are set by yearly Proclamation and moved holidays (e.g. Eid) are often missing — keep an admin override table; add local holidays manually (Marikina City Founding Anniversary, Apr 16; Marikina Shoe Festival etc.).
- **Frankfurter** — VERIFIED `https://api.frankfurter.dev/v1/latest?base=USD&symbols=PHP` → `{"amount":1.0,"base":"USD","date":"2026-10-26","rates":{"PHP":63.944}}`. ECB reference rates, no auth. The old `api.frankfurter.app` now 301-redirects.
- **open.er-api.com** — VERIFIED `https://open.er-api.com/v6/latest/USD`, no key, daily update, attribution required.
- **BSP** reference rate: HTML/Excel only on bsp.gov.ph, no API. exchangerate.host now requires a key.
- **Fuel prices:** no API. DOE publishes weekly Metro Manila price monitoring PDFs (doe.gov.ph). Use an admin-maintained CMS entry.

## 6. Maps

- Tiles: `https://tile.openstreetmap.org/{z}/{x}/{y}.png` — OK for low traffic per OSMF tile usage policy (must show "© OpenStreetMap contributors", valid User-Agent/Referer, no heavy usage). For production prefer a provider (MapTiler/Stadia/Protomaps self-hosted PMTiles). Use Leaflet/MapLibre client-side.
- **Overpass — VERIFIED** (`https://overpass-api.de/api/interpreter`, POST `data=`), 159 features returned:
```
[out:json][timeout:60];
area["name"="Marikina"]["admin_level"="6"]->.a;
(
  nwr["amenity"~"^(hospital|school|police|clinic|fire_station)$"](area.a);
  nwr["emergency"="assembly_point"](area.a);
  nwr["social_facility"="shelter"](area.a);
);
out tags center;
```
Counts: school 86, clinic 34, hospital 13, police 12, fire_station 7, shelter 6 (+1 social_facility). Evacuation centers are poorly tagged in OSM — curate the city's official list into your own DB and use OSM only as a base.
- License ODbL (attribute). Overpass is a shared public instance: ~10k queries/day guidance, 2 concurrent slots; do NOT call per page view — run at build/cron and store GeoJSON (revalidate 86400).

## 7. Open data / transparency

- **data.gov.ph** — now an Angular SPA; the CKAN `/api/3/action/package_search` path returns the SPA HTML (no API). Link out only.
- **bettergov.ph** — site up (Vite SPA). Their data is open-source on GitHub (bettergov org) — check repos for JSON datasets (government directory, hotlines) rather than calling the site.
- **PhilGEPS** (philgeps.gov.ph) — search UI only; open-data CSV dumps of awards sometimes published on its "Open Data" page. Link out filtered by "City Government of Marikina".
- **COA** — annual audit reports per LGU are PDFs at coa.gov.ph (Reports > Annual Audit Reports > NCR > Marikina). Link list maintained in CMS.
- **DBM** — LGU budget data (Local Budget Memoranda, IRA/NTA allocations) in PDF/Excel; no API.
- **Marikina Transparency Seal / Full Disclosure Policy** — marikina.gov.ph PDF postings; also DILG FDP portal (fdpp.dilg.gov.ph). Mirror links in the CMS.

## 8. Hazard maps

- **GeoRiskPH / HazardHunterPH** (hazardhunter.georisk.gov.ph) — site up, ArcGIS-based. No documented public API; underlying ArcGIS REST services exist but are not officially for third-party use. Recommend link-out ("Check your address on HazardHunterPH") or iframe if permitted.
- **NOAH flood hazard layers** — not publicly exposed as WMS anymore. Alternative: download NOAH/MGB hazard shapefiles where published, convert to vector tiles, host yourself (check license; UP NOAH data is generally CC BY).
- MGB geohazard maps (gdis.mgb.gov.ph) — PDF/ArcGIS viewer.

## Recommended implementation

```ts
// app/api/river/route.ts
export const revalidate = 300;
export async function GET() {
  const r = await fetch("https://pasig-marikina-tullahanffws.pagasa.dost.gov.ph/water/main_list.do",
    { next: { revalidate: 300 }, headers: { "User-Agent": "BetterMarikina/1.0" } });
  const all = await r.json();
  const ids = ["11104204","11103203","11103202","11103201","11102202"];
  const num = (v: string|null) => v == null ? null : parseFloat(v.replace("(*)",""));
  return Response.json(all.filter((s: any) => ids.includes(s.obscd)).map((s: any) => ({
    id: s.obscd, name: s.obsnm, at: s.timestr, wl: num(s.wl), suspect: String(s.wl).includes("(*)"),
    alert: num(s.alertwl), alarm: num(s.alarmwl), critical: num(s.criticalwl),
  })));
}
```
Wrap every upstream in try/catch returning the last good cached value + `stale: true`.
