import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { barangays, getBarangay, slugify, telHref } from "@/lib/data";
import { Card, PageHeader, Section } from "@/components/ui";

export function generateStaticParams() {
  return barangays.map((b) => ({ slug: slugify(b.name) }));
}

export async function generateMetadata({
  params,
}: PageProps<"/barangays/[slug]">): Promise<Metadata> {
  const b = getBarangay((await params).slug);
  return b ? { title: `Barangay ${b.name}` } : {};
}

const fmt = new Intl.NumberFormat("en-PH");

export default async function BarangayPage({ params }: PageProps<"/barangays/[slug]">) {
  const b = getBarangay((await params).slug);
  if (!b) notFound();
  const density = Math.round(b.population2020 / (b.areaHa / 100));
  const mapQuery = encodeURIComponent(`Barangay ${b.name}, Marikina City`);

  return (
    <>
      <PageHeader eyebrow={`District ${b.district} · Marikina City`} title={b.name} />
      <Section>
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <dl className="grid grid-cols-2 gap-px self-start overflow-hidden rounded-xl border border-line bg-line">
            {[
              ["Population (2020)", fmt.format(b.population2020)],
              ["Land area", `${b.areaHa} ha`],
              ["Density", `${fmt.format(density)} / km²`],
              ["ZIP code", b.zip],
              ["PSGC code", b.psgc10],
              ["District", String(b.district)],
            ].map(([l, v]) => (
              <div key={l} className="bg-surface p-5">
                <dt className="text-sm text-ink-muted">{l}</dt>
                <dd className="font-display mt-1 text-2xl font-bold tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
          <aside className="space-y-4">
            <Card>
              <p className="text-sm text-ink-muted">Barangay hall</p>
              {b.phone ? (
                <a href={telHref(b.phone)} className="font-display mt-1 block text-2xl font-bold text-brand">
                  {b.phone}
                </a>
              ) : (
                <p className="mt-1">No number listed</p>
              )}
              <a
                href={`https://www.openstreetmap.org/search?query=${mapQuery}`}
                className="mt-3 inline-block text-sm font-semibold text-brand hover:underline"
              >
                Find on OpenStreetMap →
              </a>
            </Card>
            <Card>
              <p className="text-sm">
                Barangay clearance, indigency certificates and small disputes
                (Katarungang Pambarangay) are handled at the barangay hall.
              </p>
              <Link href="/services/barangay-clearance" className="mt-2 inline-block text-sm font-semibold text-brand hover:underline">
                Barangay clearance requirements →
              </Link>
            </Card>
            <Link href="/barangays" className="block text-sm font-semibold text-brand hover:underline">
              ← All barangays
            </Link>
          </aside>
        </div>
      </Section>
    </>
  );
}
