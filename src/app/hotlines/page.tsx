import type { Metadata } from "next";
import { Phone } from "lucide-react";
import { barangays, hotlines, telHref } from "@/lib/data";
import { Card, PageHeader, Section } from "@/components/ui";

export const metadata: Metadata = {
  title: "Emergency hotlines",
  description: "Marikina Rescue 161, police, fire, hospital and barangay hall numbers.",
};

const CATEGORY_LABEL: Record<string, string> = {
  rescue: "Rescue",
  national: "National",
  police: "Police",
  fire: "Fire",
  health: "Health",
  hospital: "Hospital",
  safety: "Public safety",
};

export default function HotlinesPage() {
  return (
    <>
      <PageHeader eyebrow="Emergency" title="Hotlines">
        Tap a number to call. For any emergency in Marikina, dial{" "}
        <a href="tel:161" className="font-semibold text-danger underline">161</a>.
      </PageHeader>
      <Section>
        <ul className="grid gap-4 md:grid-cols-2">
          {hotlines.map((h) => (
            <li key={h.name}>
              <Card className="h-full">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-semibold">{h.name}</h2>
                  <span className="shrink-0 rounded-full bg-surface-2 px-2 py-0.5 text-xs text-ink-muted">
                    {CATEGORY_LABEL[h.category] ?? h.category}
                  </span>
                </div>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {h.numbers.map((n) => (
                    <li key={n}>
                      <a
                        href={telHref(n)}
                        className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-line px-3 font-semibold tabular-nums hover:border-brand hover:text-brand"
                      >
                        <Phone className="size-4" aria-hidden />
                        {n}
                      </a>
                    </li>
                  ))}
                </ul>
              </Card>
            </li>
          ))}
        </ul>
      </Section>
      <Section title="Barangay halls">
        <Card className="!p-0">
          <ul className="grid divide-y divide-line sm:grid-cols-2 sm:divide-y-0">
            {barangays.map((b) => (
              <li key={b.psgc} className="flex items-center justify-between gap-3 border-line px-5 py-3 sm:border-b">
                <span>{b.name}</span>
                {b.phone ? (
                  <a href={telHref(b.phone)} className="font-semibold tabular-nums text-brand hover:underline">
                    {b.phone}
                  </a>
                ) : (
                  <span className="text-sm text-ink-muted">No number listed</span>
                )}
              </li>
            ))}
          </ul>
        </Card>
        <p className="mt-3 text-sm text-ink-muted">
          Numbers from marikina.gov.ph. Some 7-digit landlines may now need the
          &ldquo;8&rdquo; prefix (e.g. 8646-0462).
        </p>
      </Section>
    </>
  );
}
