# 01 - Reference sites: BetterOrmoc and BetterGov.ph

Research date: 2026-10-27. Method: raw HTTP fetch of HTML, sitemap.xml, and the GitHub REST API. No headless browser was used, so client-side network calls are inferred from page text and credits, not captured.

## 1. BetterOrmoc (https://www.betterormoc.org)

### Sitemap and navigation
Routes are locale-prefixed: `/en`, `/fil` (Filipino), `/ceb` (Cebuano). Each locale has the same pages:

| Route | Purpose |
|---|---|
| `/{lang}` | Home |
| `/{lang}/services` | Services directory, with detail pages such as `/services/birth-certificate`, `/business-permit-new`, `/real-property-tax-payment`, `/barangay-clearance`, `/health-certificate` |
| `/{lang}/government` | Officials and city government structure |
| `/{lang}/statistics` | City statistics |
| `/{lang}/budget` | Budget and transparency |
| `/{lang}/ordinances`, `/{lang}/resolutions` | Legislative records (the nav label is "Legislative") |
| `/{lang}/contact` | Contact |
| `/{lang}/search` | Site search |
| `/{lang}/about`, `/faq`, `/accessibility`, `/privacy`, `/terms`, `/sitemap` | Static and legal pages |

Top nav: Home, Services, Government, Statistics, Legislative, Budget, Contact, plus a language switcher ("English").

### Home page contents (top to bottom)
1. **Hotline ticker bar** with named numbers: Rescue, Fire Protection, City Police (OCPO HQ), Coast Guard. It also shows the USD to PHP rate, the local temperature, and the date and time in PHT.
2. A **disclaimer banner**: "unofficial community project, not affiliated with the City Government", linked to a Learn more page. The header has links to X and the Official Portal.
3. **Hero**: "Welcome to BetterOrmoc", with Browse Services and Contact Us buttons.
4. **Find a Service search**, with "Popular" chips: Birth Certificate, Business Permit, Real Property Tax.
5. **Popular Services cards**: icon, title, one-line description, and a View All link.
6. **At a Glance stats**: population, number of barangays, land area, and income class. Each stat shows an "As of" year.
7. **Online Services**: outbound links to official LGU e-services and Land Bank e-GPS, each with a category tag (Taxation, Business, Finance). A note says the links redirect to official portals.
8. **Weather and Location widget**: temperature, conditions, humidity, wind, UV index, and a note that it "Updates every 30 seconds". It is credited as "Powered by Open-Meteo" and has a map.
9. **Brief History** of the city, with a Learn More link.
10. **Latest Updates** news list.
11. **Footer**: mission statement, Quick Links (Sitemap, Terms, Privacy, Accessibility, FAQ), and Resources (Open Data Philippines, FOI, the official LGU portal). The footer license line reads "MIT | CC BY 4.0", and it states that all public information is sourced from official portals.

### Live data
- **Open-Meteo** for current weather. It is a free API that needs no key.
- **Forex** (USD to PHP) in the ticker. The source is not credited. It is probably a free FX API or a BetterGov forex feed.
- **Map tiles**: there is a "Loading map..." placeholder, probably Leaflet with OSM. This is unconfirmed.
- Everything else (services, officials, and so on) looks like static content baked into the build.

### Stack and license
- **Next.js App Router**: `/_next/static/chunks`, `next/font` woff2 files, and the hashed favicon pattern are visible. It uses `[locale]` segment i18n with 3 locales.
- License: code MIT, content CC BY 4.0, per the footer. No public repo was located.

## 2. BetterGov.ph (https://bettergov.ph)

### Sitemap and navigation (from sitemap.xml)
| Section | Routes |
|---|---|
| Services | `/services` with `?category=` values: certificates-ids, business-trade, tax, health, education, employment, housing, social-services, contributions, passport-travel, transport-driving, disaster-weather, uncategorized |
| Government | `/government` and its subpages: `/executive` (5), `/departments` (24 subpages, one per department), `/legislative` (6), `/constitutional` (8), `/diplomatic` (4), `/local`, `/salary-grade` |
| Philippines | `/philippines/about`, `/history`, `/regions`, `/map`, `/hotlines`, `/holidays` |
| Data | `/data/weather`, `/data/forex` |
| Flood control | `/flood-control-projects/` with `/table`, `/map`, and `/contractors` views. These are DPWH project transparency pages. |
| Travel | `/travel/visa`, `/travel/visa-types` |
| Misc | `/search`, `/sitemap`, `/about`, `/contribute` |

Satellite subdomains run as separate apps: hotlines.bettergov.ph, budget.bettergov.ph, transparency.bettergov.ph, data.bettergov.ph, saln.bettergov.ph, govchain.bettergov.ph, and fellowship.bettergov.ph.

### Section contents
- **Services**: a categorized directory. Each entry links to the official agency page, with steps and requirements. Users can filter by category and search.
- **Government**: a directory of officials and offices, organized by branch. Each office has contact details and a website. There is also a salary-grade table.
- **Hotlines**: national emergency numbers. These come from the `bettergovph/hotlines` repo.
- **Weather and forex**: dashboards. The weather data is likely from PAGASA or Open-Meteo, and forex from the BSP. Sources are rendered client-side and were not captured.
- **Flood-control projects**: DPWH project data shown as a table, a map, and a contractor list. This is the main transparency feature.
- **Budget**: hosted at budget.bettergov.ph and based on the open-budget-data and open-budget-api repos.

### Stack
- **Vite + React SPA**. The HTML is an empty `<div id="root">` plus `/assets/index-*.js`, so it is client-rendered. That is weak for SEO, which is why the site publishes a static sitemap.xml.
- Font: Figtree (Google Fonts).
- Design system: **`bettergovph/kapwa`**, a TypeScript design system for BetterGov.ph licensed CC0-1.0.
- Docs site: `bettergovph/docs`, built with Fumadocs and Next.js.

### GitHub org (github.com/bettergovph): reusable repos
| Repo | License | Use for Marikina |
|---|---|---|
| kapwa (design system) | CC0-1.0 | UI tokens and components can be reused freely |
| hotlines | none stated | National hotline data. Ask before copying, or cite the source. |
| open-data-portal (data.bettergov.ph) | CC0-1.0 | Free to reuse |
| open-budget-data / open-budget-api | CC0-1.0 | National budget data, including LGU allocations |
| open-congress-data / -api | CC0-1.0 | Data on district representatives (Marikina 1st and 2nd districts) |
| ph-tax-directory, healthcare-providers-api | CC0-1.0 | Health facilities in Marikina |
| flood-watch | none stated | Relevant to Marikina River flood monitoring. Check the code before reusing it. |
| transparency-dashboard | MIT | Pattern for a dashboard |
| saln-tracker-ph, govchain | MIT | Not needed for an MVP |
| petition | NOASSERTION | Avoid |
| openbayan.org | none (Svelte) | Not applicable |

**The main bettergov.ph site repo was not found publicly.** `bettergovph/bettergov` returns 404, and searching the org did not turn it up. It may be private or renamed. Its services and government JSON therefore cannot be pulled directly. Use the CC0 data repos above instead. For any repo without a license, treat it as all-rights-reserved and ask the maintainers before reusing it.

## 3. Design patterns to adopt
- **Unofficial-project disclaimer** shown persistently, plus links to official portals. This matters legally.
- **Emergency hotline ticker** at the very top, visible on every page.
- **Locale-prefixed routes** with a sitemap entry for every locale. BetterOrmoc uses en/fil/ceb; Marikina should use en/fil.
- **Search first**: a search field in the hero, plus popular-service chips.
- **Service cards → detail pages** for local services. Outbound links go to official e-services and carry category tags.
- **"As of YEAR" on every statistic** so readers can judge how fresh the data is.
- A free live weather widget (Open-Meteo) plus a map.
- An **Accessibility page**, FAQ, Privacy, and Terms. The footer states licenses for code and for content separately.
- Mobile: both sites use responsive single-column cards. On bettergov, the government org tree is collapsed into list pages.

## 4. Recommended stack for Better Marikina
Use Next.js App Router with SSG/ISR. Unlike bettergov's SPA, this is SEO-friendly. Add `[locale]` routing (en/fil), JSON/MDX content in the repo, the Open-Meteo weather API, and Leaflet with OSM. Optionally reuse kapwa tokens (CC0). Marikina-specific additions: Marikina River water level / PAGASA flood alerts (the Sto. Niño gauge), and the city's alarm levels.
