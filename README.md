# Better Marikina

An unofficial, community-built guide to Marikina City, in the spirit of
[BetterGov.ph](https://bettergov.ph) and [BetterOrmoc](https://www.betterormoc.org).
It is not affiliated with the City Government of Marikina.

Built with Next.js 16 (App Router, Cache Components), Tailwind CSS 4 and Leaflet.

## Pages

| Route | What it shows |
|---|---|
| `/` | Search, live river + weather cards, common services, city stats |
| `/services`, `/services/[id]` | Requirements for common city transactions |
| `/hotlines` | Rescue 161, police, fire, health and barangay hall numbers (tap to call) |
| `/flood` | Live Marikina River levels, upstream gauges, alarm levels, safety tips |
| `/weather` | Current weather, air quality, 24 h rain chance, 7-day forecast, nearby earthquakes |
| `/government` | Elected officials (2025–2028) and city office numbers |
| `/barangays`, `/barangays/[slug]` | All 16 barangays by district |
| `/map` | Hospitals, clinics, police, fire stations, shelters, schools and river gauges |
| `/projects` | Every procurement notice (bids, awards, notices to proceed, reports), searchable and filterable |
| `/transparency` | Full Disclosure Policy documents by year (budget, debt, fund utilization) with plain-language notes, official online services, facts & figures |
| `/ordinances` | Searchable ordinances and resolutions with links to the full text |
| `/news`, `/news/[id]` | City news releases from marikina.gov.ph, with full article text |
| `/our-city` | The city's official history, location and land area text, quick facts, timeline |
| `/tourism`, `/about` | Places to visit, project info, data sources |
| `/api/river` | JSON mirror of the PAGASA river feed, with CORS enabled |

## Live data

All calls are made on the server and cached with `"use cache"` + `cacheLife`
profiles defined in `next.config.ts`. Failed requests throw inside the cached
function, so they are never cached; the page shows a fallback instead.

| Data | Source | Refresh |
|---|---|---|
| River levels | PAGASA Pasig–Marikina–Tullahan FFWS (`/water/main_list.do`, undocumented) | 5 min |
| Weather, air quality | Open-Meteo (CC BY 4.0) | 15 min |
| Earthquakes | USGS FDSN event API, 300 km radius | 5 min |
| Map places | OpenStreetMap via Overpass (ODbL), with a committed snapshot fallback | daily |
| Procurement, disclosures, ordinances | Marikina Full Disclosure Policy Portal (fdpp.marikina.gov.ph), with a committed snapshot fallback | 6 h |
| News releases | marikina.gov.ph `POST /fetch_news_side` (needs session cookie + CSRF), article pages parsed to plain text | 6 h list, 1 day per article |
| Officials, Our City text | marikina.gov.ph/our-city, served from the committed snapshot | `npm run snapshot:citygov` |

Every cached reader picks its lifetime with a conditional `cacheLife`: the
normal profile on success, a one-minute `retry` profile on failure. Cached
functions never throw, so a slow government server cannot fail a build; the
page shows the snapshot and says so.

Article bodies from marikina.gov.ph are reduced to plain-text paragraphs and
lists (`src/lib/citygov-core.mjs`); the site never renders the city's HTML.

The procurement list comes from the portal's `POST /getBids` DataTables
endpoint, which needs the session cookie and CSRF token from the bids page.
Disclosures and ordinances are parsed from the portal's HTML. All three share
`src/lib/fdpp-core.mjs` with `npm run snapshot:fdpp`. The portal publishes no
amounts or contractor names as data; those are only inside the PDFs.

PAGASA's server omits its intermediate TLS certificate, which Node rejects. The
missing GlobalSign intermediate is bundled in `src/lib/live/pagasa-ca.ts`
(expires 2029-06-23) and added to the trusted list for that request only;
certificate verification stays on.

## Content

City facts live in `src/data/marikina.json`, researched 2026-10-27 (see
`docs/research/`). Entries with `"verified": false` are shown with a
"Needs verification" label. Before launch, check them against:

- service requirements and fees: the [Citizen's Charter](https://fdpp.marikina.gov.ph/citizen-charter)
- river alarm levels (17 m vs 18 m for the third alarm) and evacuation centers: Marikina CDRRMO
- the 1st district representative and the councilor list: COMELEC's final 2025 results
- phone numbers: the contact page is dated 2023 and some landlines lack the "8" prefix

## Development

```bash
npm install
npm run dev                  # http://localhost:3000
npm run build && npm start
npm run snapshot:amenities   # refresh the OSM fallback snapshot
npm run snapshot:fdpp        # refresh the transparency-portal fallback snapshot
npm run snapshot:citygov     # refresh officials, Our City text and news (retries slow pages)
```

Code MIT · Content CC BY 4.0
