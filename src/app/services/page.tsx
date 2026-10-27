import type { Metadata } from "next";
import Link from "next/link";
import { services } from "@/lib/data";
import { PageHeader, Section, Unverified } from "@/components/ui";

export const metadata: Metadata = {
  title: "Services",
  description: "Requirements and offices for common Marikina City government services.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHeader eyebrow="Services" title="What do you need to do?">
        Requirements for the transactions Marikeños ask about most. Fees and steps
        change, so confirm with the office before you go.
      </PageHeader>
      <Section>
        <ul className="grid gap-3 md:grid-cols-2">
          {services.map((s) => (
            <li key={s.id}>
              <Link
                href={`/services/${s.id}`}
                className="group block h-full rounded-xl border border-line bg-surface p-5 hover:border-brand"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold group-hover:text-brand">{s.name}</p>
                  {!s.verified && <Unverified />}
                </div>
                <p className="mt-1 text-sm text-ink-muted">{s.office}</p>
                <p className="mt-3 text-sm text-ink-muted">
                  {s.requirements.length
                    ? `${s.requirements.length} requirements`
                    : "Requirements vary per call"}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
