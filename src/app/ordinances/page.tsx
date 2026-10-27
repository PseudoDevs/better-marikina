import type { Metadata } from "next";
import { Suspense } from "react";
import { fdppFileUrl, getOrdinances, SNAPSHOT_DATE } from "@/lib/live/fdpp";
import { OrdinanceList } from "@/components/ordinance-list";
import { PageHeader, Section, SkeletonBlock } from "@/components/ui";

export const metadata: Metadata = {
  title: "Ordinances & resolutions",
  description: "Search Marikina City ordinances and resolutions, with links to the full text.",
};

export default function OrdinancesPage() {
  return (
    <>
      <PageHeader eyebrow="Transparency" title="Ordinances & resolutions">
        Local laws and resolutions of the Sangguniang Panlungsod, as published on the
        city&apos;s Full Disclosure Policy Portal.
      </PageHeader>
      <Section>
        <Suspense fallback={<SkeletonBlock className="h-[60vh]" />}>
          <Ordinances />
        </Suspense>
      </Section>
    </>
  );
}

async function Ordinances() {
  const { items, live } = await getOrdinances();
  const rows = items.map((o) => ({
    number: o.number,
    kind: o.kind,
    year: o.year,
    title: o.title,
    url: fdppFileUrl(o.file),
  }));
  return (
    <>
      <OrdinanceList rows={rows} />
      <p className="mt-4 text-sm text-ink-muted">
        The portal lists selected ordinances, not the complete code. For a certified
        copy, ask the City Council Secretariat at (02) 8289-8961.{" "}
        {!live && `The portal is not responding, so this list is the ${SNAPSHOT_DATE} copy.`}
      </p>
    </>
  );
}
