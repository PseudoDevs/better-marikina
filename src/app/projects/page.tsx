import type { Metadata } from "next";
import { Suspense } from "react";
import {
  cleanTitle,
  fdppFileUrl,
  getProcurement,
  PROCUREMENT_STAGES,
  SNAPSHOT_DATE,
} from "@/lib/live/fdpp";
import {
  ProcurementExplorer,
  type ProcurementRow,
} from "@/components/procurement-explorer";
import { Card, PageHeader, Section, SkeletonBlock } from "@/components/ui";

export const metadata: Metadata = {
  title: "Projects & procurement",
  description:
    "Every Marikina City bid opportunity, notice of award and procurement report, searchable, from the city's Full Disclosure Policy Portal.",
};

const STAGE_HELP: [string, string][] = [
  ["Annual Procurement Plan", "Everything the city plans to buy or build this year."],
  ["Notice of Proposed Procurement", "Smaller purchases (shopping, small value) posted for price quotations."],
  ["Bid Opportunities", "Invitations to bid on larger contracts, including infrastructure."],
  ["BAC Resolution", "Decisions of the Bids and Awards Committee, such as who should win."],
  ["Notice of Award", "The contract is awarded to the winning supplier or contractor."],
  ["Notice to Proceed", "The winner may start work or delivery."],
  ["Procurement Monitoring Report", "Status reports on the city's procurement."],
];

export default function ProjectsPage() {
  return (
    <>
      <PageHeader eyebrow="Transparency" title="Projects & procurement">
        What the city is buying and building: every bid, award and report posted on
        Marikina&apos;s Full Disclosure Policy Portal, in one searchable list.
      </PageHeader>
      <Suspense
        fallback={
          <Section>
            <SkeletonBlock className="h-[60vh]" />
          </Section>
        }
      >
        <Procurement />
      </Suspense>
      <Section title="How city procurement works">
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STAGE_HELP.map(([stage, help], i) => (
            <li key={stage}>
              <Card className="h-full">
                <p className="text-sm font-semibold text-brand">Step {i + 1}</p>
                <p className="mt-1 font-semibold">{stage}</p>
                <p className="mt-1 text-sm text-ink-muted">{help}</p>
              </Card>
            </li>
          ))}
        </ol>
      </Section>
    </>
  );
}

async function Procurement() {
  const { items, live } = await getProcurement();
  const rows: ProcurementRow[] = items.map((r) => ({
    id: r.id,
    stage: r.stage,
    type: r.type,
    ref: r.ref,
    title: cleanTitle(r.title),
    date: r.date,
    year: r.year,
    url: fdppFileUrl(r.file),
  }));
  const stages = PROCUREMENT_STAGES.map(([, stage]) => stage).filter((s) =>
    rows.some((r) => r.stage === s),
  );
  const latestYear = Math.max(...rows.map((r) => r.year));
  const thisYear = rows.filter((r) => r.year === latestYear);
  const stats: [string, number][] = [
    [`Notices posted in ${latestYear}`, thisYear.length],
    [`Invitations to bid in ${latestYear}`, thisYear.filter((r) => r.stage === "Bid Opportunities").length],
    [`All notices since ${Math.min(...rows.map((r) => r.year))}`, rows.length],
    ["Contracts awarded (posted)", rows.filter((r) => r.stage === "Notice of Award").length],
  ];

  return (
    <>
      <Section>
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line lg:grid-cols-4">
          {stats.map(([label, value]) => (
            <div key={label} className="bg-surface p-5">
              <dt className="text-sm text-ink-muted">{label}</dt>
              <dd className="font-display mt-1 text-3xl font-bold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-sm text-ink-muted">
          Amounts, bidders and contractors are inside each PDF; the portal does not
          publish them as data.{" "}
          {live
            ? "Updated every 6 hours from fdpp.marikina.gov.ph."
            : `The city portal is not responding, so this is the ${SNAPSHOT_DATE} copy.`}
        </p>
      </Section>
      <Section>
        <ProcurementExplorer rows={rows} stages={stages} />
      </Section>
    </>
  );
}
