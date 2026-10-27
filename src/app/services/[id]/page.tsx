import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getService, services } from "@/lib/data";
import { Card, PageHeader, Section } from "@/components/ui";

export function generateStaticParams() {
  return services.map((s) => ({ id: s.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/services/[id]">): Promise<Metadata> {
  const { id } = await params;
  const s = getService(id);
  return s ? { title: s.name, description: `Requirements for ${s.name} in Marikina City.` } : {};
}

export default async function ServicePage({ params }: PageProps<"/services/[id]">) {
  const { id } = await params;
  const s = getService(id);
  if (!s) notFound();

  return (
    <>
      <PageHeader eyebrow={s.office} title={s.name} />
      <Section>
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            {!s.verified && (
              <div role="note" className="rounded-xl border border-warn/40 bg-warn-soft p-4 text-sm">
                <strong className="text-warn">Needs verification.</strong> This list is
                based on national rules (Local Government Code and related laws), not
                yet checked against Marikina&apos;s Citizen&apos;s Charter. Bring extra
                copies and confirm with the office.
              </div>
            )}
            <Card>
              <h2 className="font-display text-xl font-bold">Requirements</h2>
              {s.requirements.length === 0 && (
                <p className="mt-3 text-ink-muted">
                  Requirements change with each application period. Watch the City
                  Government&apos;s announcements or call the office below.
                </p>
              )}
              <ol className="mt-4 space-y-3">
                {s.requirements.map((r, i) => (
                  <li key={r} className="flex gap-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold text-brand">
                      {i + 1}
                    </span>
                    <span className="pt-0.5">{r}</span>
                  </li>
                ))}
              </ol>
            </Card>
            {s.notes && (
              <Card>
                <h2 className="font-display text-xl font-bold">Good to know</h2>
                <p className="mt-3">{s.notes}</p>
              </Card>
            )}
          </div>
          <aside className="space-y-4">
            <Card>
              <p className="text-sm text-ink-muted">Where to go</p>
              <p className="mt-1 font-semibold">{s.office}</p>
              <p className="mt-3 text-sm">
                Marikina City Hall, Shoe Avenue, Sta. Elena
                <br />
                Mon–Fri, 8:00 AM–5:00 PM
              </p>
              <a href="tel:0286460462" className="mt-3 inline-block text-sm font-semibold text-brand hover:underline">
                Call City Hall (02) 8646-0462
              </a>
            </Card>
            <Card>
              <p className="text-sm text-ink-muted">Official source</p>
              <a
                href="https://fdpp.marikina.gov.ph/citizen-charter"
                className="mt-1 block font-semibold text-brand hover:underline"
              >
                Marikina Citizen&apos;s Charter →
              </a>
            </Card>
            <Link href="/services" className="block text-sm font-semibold text-brand hover:underline">
              ← All services
            </Link>
          </aside>
        </div>
      </Section>
    </>
  );
}
