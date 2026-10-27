import type { Metadata } from "next";
import Link from "next/link";
import { sources } from "@/lib/data";
import { Card, PageHeader, Section } from "@/components/ui";

export const metadata: Metadata = {
  title: "About",
  description: "About Better Marikina and the data sources behind it.",
};

const LIVE_SOURCES = [
  ["River levels", "PAGASA Pasig–Marikina–Tullahan Flood Forecasting & Warning System", "https://pasig-marikina-tullahanffws.pagasa.dost.gov.ph/", "every 5 min"],
  ["Weather & air quality", "Open-Meteo (CC BY 4.0)", "https://open-meteo.com", "every 15 min"],
  ["Earthquakes", "USGS Earthquake Hazards Program", "https://earthquake.usgs.gov", "every 5 min"],
  ["Map places", "OpenStreetMap via Overpass API (ODbL)", "https://www.openstreetmap.org", "daily"],
  ["Barangay codes", "PSA Philippine Standard Geographic Code", "https://psa.gov.ph/classification/psgc", "static"],
] as const;

export default function AboutPage() {
  return (
    <>
      <PageHeader eyebrow="About" title="About Better Marikina">
        A community-built guide to Marikina City. For the city&apos;s history, see{" "}
        <Link href="/our-city" className="text-brand underline">Our City</Link>.
      </PageHeader>

      <Section title="About this project">
        <Card>
          <div className="max-w-3xl space-y-3">
            <p>
              Better Marikina is an <strong>unofficial</strong>, volunteer-built guide in
              the spirit of BetterGov.ph and BetterOrmoc. It is not affiliated with the
              City Government of Marikina.
            </p>
            <p>
              Items marked <em>Needs verification</em> came from secondary sources or
              national rules and have not yet been checked against the city&apos;s own
              Citizen&apos;s Charter. Corrections are welcome.
            </p>
          </div>
        </Card>
      </Section>

      <Section title="Data sources" id="sources">
        <div className="overflow-x-auto rounded-xl border border-line bg-surface">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-surface-2 text-left text-ink-muted">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Data</th>
                <th className="px-4 py-2.5 font-semibold">Source</th>
                <th className="px-4 py-2.5 font-semibold">Refreshed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {LIVE_SOURCES.map(([what, who, href, when]) => (
                <tr key={what}>
                  <td className="px-4 py-2.5 font-medium">{what}</td>
                  <td className="px-4 py-2.5"><a href={href} className="text-brand hover:underline">{who}</a></td>
                  <td className="px-4 py-2.5 text-ink-muted">{when}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-6 text-sm font-semibold">Reference sources for city information</p>
        <ul className="mt-2 space-y-1 text-sm">
          {sources.map((s) => (
            <li key={s}>
              <a href={s} className="break-all text-brand hover:underline">{s}</a>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-ink-muted">
          Developers: Marikina River levels are available as JSON with CORS at{" "}
          <code className="rounded bg-surface-2 px-1.5 py-0.5">/api/river</code>.
        </p>
      </Section>
    </>
  );
}
