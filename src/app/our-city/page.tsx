import type { Metadata } from "next";
import Link from "next/link";
import { overview, slugify, timeline } from "@/lib/data";
import { ourCity } from "@/lib/live/citygov";
import { Blocks } from "@/components/blocks";
import { Card, PageHeader, Section } from "@/components/ui";

export const metadata: Metadata = {
  title: "Our City",
  description:
    "The story of Marikina, the Shoe Capital of the Philippines: history, geography and key dates.",
};

const fmt = new Intl.NumberFormat("en-PH");

export default function OurCityPage() {
  return (
    <>
      <PageHeader eyebrow="Our City" title="Marikina, the Shoe Capital">
        {overview.incomeClass} in the National Capital Region. Founded{" "}
        {overview.founded.slice(0, 4)}, chartered as a city on December 8,{" "}
        {overview.cityhood.slice(0, 4)}.
      </PageHeader>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
          <div className="space-y-12">
            {ourCity.sections.map((s) => (
              <section key={s.title} id={slugify(s.title)} aria-labelledby={`h-${slugify(s.title)}`}>
                <h2 id={`h-${slugify(s.title)}`} className="font-display text-2xl font-bold">
                  {s.title}
                </h2>
                <div className="mt-4 max-w-3xl">
                  <Blocks blocks={s.blocks} />
                </div>
              </section>
            ))}
            <p className="border-t border-line pt-4 text-sm text-ink-muted">
              Text from the City Government&apos;s{" "}
              <a href="https://www.marikina.gov.ph/our-city" className="text-brand underline">
                Our City
              </a>{" "}
              page.
            </p>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
            <Card>
              <h2 className="font-semibold">Quick facts</h2>
              <dl className="mt-3 space-y-3 text-sm">
                {[
                  ["Population", `${fmt.format(overview.population)} (${overview.populationCensus})`],
                  ["Land area", `${overview.landAreaKm2} km²`],
                  ["Barangays", `${overview.barangayCount} in ${overview.districts} districts`],
                  ["Motto", overview.motto],
                  ["People", overview.demonym],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-ink-muted">{k}</dt>
                    <dd className="font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            </Card>
            <Card>
              <h2 className="font-semibold">On this page</h2>
              <ul className="mt-2 space-y-1.5 text-sm">
                {ourCity.sections.map((s) => (
                  <li key={s.title}>
                    <a href={`#${slugify(s.title)}`} className="text-brand hover:underline">
                      {s.title}
                    </a>
                  </li>
                ))}
                <li>
                  <a href="#timeline" className="text-brand hover:underline">Timeline</a>
                </li>
              </ul>
            </Card>
            <Card>
              <ul className="space-y-1.5 text-sm">
                <li><Link href="/government" className="font-semibold text-brand hover:underline">City officials →</Link></li>
                <li><Link href="/barangays" className="font-semibold text-brand hover:underline">The 16 barangays →</Link></li>
                <li><Link href="/tourism" className="font-semibold text-brand hover:underline">Places to visit →</Link></li>
              </ul>
            </Card>
          </aside>
        </div>
      </Section>

      <Section title="Timeline" id="timeline">
        <ol className="relative space-y-6 border-l-2 border-line pl-6">
          {timeline.map((t) => (
            <li key={`${t.year}-${t.event.slice(0, 20)}`} className="relative">
              <span className="absolute -left-[31px] top-1.5 size-3 rounded-full border-2 border-paper bg-brand" aria-hidden />
              <p className="font-display text-lg font-bold text-brand">{t.year}</p>
              <p className="mt-1 max-w-2xl">{t.event}</p>
            </li>
          ))}
        </ol>
      </Section>
    </>
  );
}
