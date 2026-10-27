import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <p className="font-display text-lg font-bold">
            Better <span className="text-brand">Marikina</span>
          </p>
          <p className="mt-2 max-w-md text-sm text-ink-muted">
            A volunteer-built, unofficial guide to Marikina City, inspired by
            BetterGov.ph and BetterOrmoc. Information may be outdated — always confirm
            with the office concerned.
          </p>
          <p className="mt-4 text-sm text-ink-muted">
            Code MIT · Content CC BY 4.0
          </p>
        </div>
        <FooterCol
          title="Find"
          links={[
            ["/services", "Services"],
            ["/hotlines", "Hotlines"],
            ["/government", "Government"],
            ["/our-city", "Our City"],
            ["/barangays", "Barangays"],
            ["/map", "Map"],
            ["/tourism", "Visit Marikina"],
          ]}
        />
        <FooterCol
          title="Transparency"
          links={[
            ["/projects", "Projects & procurement"],
            ["/transparency", "Budget & disclosures"],
            ["/ordinances", "Ordinances"],
            ["/news", "City news"],
          ]}
        />
        <FooterCol
          title="Live data"
          links={[
            ["/flood", "River levels (PAGASA)"],
            ["/weather", "Weather & earthquakes"],
            ["/about#sources", "Data sources"],
            ["/about", "About this project"],
          ]}
        />
      </div>
      <p className="border-t border-line py-4 text-center text-xs text-ink-muted">
        Weather by Open-Meteo.com · River data by PAGASA FFWS · Earthquakes by USGS ·
        Map data © OpenStreetMap contributors
      </p>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="text-sm font-semibold">{title}</p>
      <ul className="mt-3 space-y-2 text-sm text-ink-muted">
        {links.map(([href, label]) => (
          <li key={href}>
            <Link href={href} className="hover:text-ink hover:underline">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
