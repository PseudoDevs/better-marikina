<p align="center">
  <img src="public/banner.webp" alt="Better Marikina: what if we could make Marikina better, together?" width="100%">
</p>

<h3 align="center">What if we could make Marikina better, together?</h3>

<p align="center">
  A free, community-built guide to Marikina City. One place to find city services, hotlines,
  live river levels, weather, projects, ordinances and news, written so anyone can use it.
</p>

<p align="center">
  <a href="https://better-marikina-gilt.vercel.app"><b>Visit the site →</b></a>
  ·
  <a href="#run-it-yourself">Run it yourself</a>
  ·
  <a href="#help-make-it-better">Help make it better</a>
</p>

---

## Why this exists

When the Marikina River rises, people need the water level now, not three clicks deep in a
PDF. When a family needs a barangay clearance, they need the requirements in plain words. And
when the city spends money, every resident has the right to see where it goes.

The information is already public. It's just scattered across government sites, data feeds
and documents. **Better Marikina gathers it in one fast, mobile-friendly place** so residents
can stay informed, stay safe and take part.

This is a volunteer project in the spirit of [BetterGov.ph](https://bettergov.ph) and
[BetterOrmoc](https://www.betterormoc.org). It is **not affiliated with the City Government of
Marikina**.

## What you'll find

**Stay safe**
- 🌊 **Flood watch** (`/flood`): live Marikina River levels, upstream gauges, alarm levels and safety tips
- ☁️ **Weather** (`/weather`): current conditions, air quality, 24-hour rain chance, 7-day forecast and nearby earthquakes
- 📞 **Hotlines** (`/hotlines`): Rescue 161, police, fire, health and barangay hall numbers, tap to call
- 🗺️ **Map** (`/map`): hospitals, clinics, police, fire stations, shelters, schools and river gauges

**Get things done**
- 📋 **Services** (`/services`): what to bring for common city transactions
- 🏘️ **Barangays** (`/barangays`): all 16 barangays by district
- 🏛️ **Government** (`/government`): elected officials (2025–2028) and city office numbers

**See how the city works**
- 🔎 **Projects** (`/projects`): every procurement notice (bids, awards, notices to proceed, reports), searchable and filterable
- 📊 **Transparency** (`/transparency`): Full Disclosure Policy documents by year (budget, debt, fund utilization) with plain-language notes
- 📜 **Ordinances** (`/ordinances`): searchable ordinances and resolutions, linked to the full text
- 📰 **News** (`/news`): city news releases from marikina.gov.ph with the full article text

**Love your city**
- 🏞️ **Our City and Tourism** (`/our-city`, `/tourism`): history, quick facts, a timeline and places to visit

For developers there's also `/api/river`, a JSON mirror of the PAGASA river feed with CORS enabled.

## Built to stay up when it matters

A flood is exactly when government servers get slow. So the site is built to keep working anyway:

- Every external request runs on the server and is cached with `"use cache"` + `cacheLife`
  profiles defined in `next.config.ts`.
- A failed request is never cached. That reader switches to a one-minute `retry` profile and
  the page shows a committed snapshot, with a note saying so.
- Cached functions never throw, so a slow government server can't fail a build.
- Article bodies from marikina.gov.ph are reduced to plain-text paragraphs and lists
  (`src/lib/citygov-core.mjs`). The site never renders the city's HTML.

| Data | Source | Refresh |
|---|---|---|
| River levels | PAGASA Pasig–Marikina–Tullahan FFWS (`/water/main_list.do`, undocumented) | 5 min |
| Weather, air quality | Open-Meteo (CC BY 4.0) | 15 min |
| Earthquakes | USGS FDSN event API, 300 km radius | 5 min |
| Map places | OpenStreetMap via Overpass (ODbL), with a committed snapshot fallback | daily |
| Procurement, disclosures, ordinances | Marikina Full Disclosure Policy Portal (fdpp.marikina.gov.ph), with a committed snapshot fallback | 6 h |
| News releases | marikina.gov.ph `POST /fetch_news_side` (needs session cookie + CSRF), article pages parsed to plain text | 6 h list, 1 day per article |
| Officials, Our City text | marikina.gov.ph/our-city, served from the committed snapshot | `npm run snapshot:citygov` |

<details>
<summary><b>Notes on the government data sources</b></summary>

- The procurement list comes from the portal's `POST /getBids` DataTables endpoint, which needs
  the session cookie and CSRF token from the bids page. Disclosures and ordinances are parsed
  from the portal's HTML. All three share `src/lib/fdpp-core.mjs` with `npm run snapshot:fdpp`.
  The portal publishes no amounts or contractor names as data; those are only inside the PDFs.
- PAGASA's server omits its intermediate TLS certificate, which Node rejects. The missing
  GlobalSign intermediate is bundled in `src/lib/live/pagasa-ca.ts` (expires 2029-06-23) and
  added to the trusted list for that request only. Certificate verification stays on.

</details>

## Run it yourself

Built with **Next.js 16** (App Router, Cache Components), **Tailwind CSS 4** and **Leaflet**.

```bash
npm install
npm run dev                  # http://localhost:3000
npm run build && npm start
npm run snapshot:amenities   # refresh the OSM fallback snapshot
npm run snapshot:fdpp        # refresh the transparency-portal fallback snapshot
npm run snapshot:citygov     # refresh officials, Our City text and news (retries slow pages)
```

## Help make it better

Better Marikina gets better every time someone who knows the city checks a fact or shares an
idea. You don't need to write code to help:

- **Check the facts.** City facts live in `src/data/marikina.json` (researched 2026-10-27; see
  `docs/research/`). Entries marked `"verified": false` show a "Needs verification" label on the
  site. These still need checking:
  - service requirements and fees, against the [Citizen's Charter](https://fdpp.marikina.gov.ph/citizen-charter)
  - river alarm levels (17 m vs 18 m for the third alarm) and evacuation centers, with Marikina CDRRMO
  - the 1st district representative and the councilor list, against COMELEC's final 2025 results
  - phone numbers: the city's contact page is dated 2023 and some landlines lack the "8" prefix
- **Share ideas.** Open an issue with what you wish the site could tell you.
- **Build with us.** Pull requests are welcome, from typo fixes to new pages.

## License

Code is [MIT](LICENSE). Original text in `src/data` and `docs/` is
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Material republished from the City
Government of Marikina and other sources remains theirs and is credited where it appears. The
Marikina City seal is public domain (Wikimedia Commons). Live data belongs to its providers:
PAGASA, Open-Meteo (CC BY 4.0), USGS, and OpenStreetMap contributors (ODbL).

<p align="center"><i>Made with ❤️ for Marikina.</i></p>
