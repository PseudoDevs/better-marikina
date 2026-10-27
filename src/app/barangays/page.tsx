import type { Metadata } from "next";
import Link from "next/link";
import { barangays, slugify } from "@/lib/data";
import { PageHeader, Section } from "@/components/ui";

export const metadata: Metadata = {
  title: "Barangays",
  description: "All 16 barangays of Marikina City by district, with population and hall numbers.",
};

const fmt = new Intl.NumberFormat("en-PH");

export default function BarangaysPage() {
  return (
    <>
      <PageHeader eyebrow="Barangays" title="16 barangays, 2 districts">
        Find your barangay hall, ZIP code and population.
      </PageHeader>
      {([1, 2] as const).map((d) => {
        const list = barangays.filter((b) => b.district === d);
        const pop = list.reduce((s, b) => s + b.population2020, 0);
        return (
          <Section key={d} title={`District ${d}`}>
            <p className="-mt-3 mb-4 text-sm text-ink-muted">
              {list.length} barangays · {fmt.format(pop)} residents (2020 census)
            </p>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((b) => (
                <li key={b.psgc}>
                  <Link
                    href={`/barangays/${slugify(b.name)}`}
                    className="group flex h-full items-center justify-between gap-3 rounded-xl border border-line bg-surface p-5 hover:border-brand"
                  >
                    <span>
                      <span className="block font-semibold group-hover:text-brand">{b.name}</span>
                      <span className="text-sm text-ink-muted">ZIP {b.zip}</span>
                    </span>
                    <span className="text-right text-sm tabular-nums text-ink-muted">
                      {fmt.format(b.population2020)}
                      <span className="block text-xs">residents</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Section>
        );
      })}
    </>
  );
}
