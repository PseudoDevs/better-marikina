import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ExternalLink, FileText } from "lucide-react";
import { fdppFileUrl, getDisclosures, SNAPSHOT_DATE, type Disclosure } from "@/lib/live/fdpp";
import { Card, PageHeader, Section, SkeletonBlock } from "@/components/ui";

export const metadata: Metadata = {
  title: "Transparency",
  description:
    "Marikina City budgets, financial statements, fund utilization and official online services, from the Full Disclosure Policy Portal.",
};

/** Plain-language meaning of each Full Disclosure Policy document, by title prefix. */
const DOCS: { match: RegExp; group: string; help: string }[] = [
  { match: /^Annual Budget/i, group: "City money", help: "How the city plans to spend its money this year." },
  { match: /^Statement of Receipts/i, group: "City money", help: "Money actually collected and spent." },
  { match: /^Cash Flow/i, group: "City money", help: "Cash coming in and going out, per quarter." },
  { match: /^Statement of Indebtedness/i, group: "City money", help: "Loans the city still owes." },
  { match: /^Unliquidated Cash Advance/i, group: "City money", help: "Cash advances not yet accounted for." },
  { match: /^20% Component/i, group: "Special funds", help: "The 20% of the national tax allotment that must go to development projects." },
  { match: /^SEF/i, group: "Special funds", help: "Special Education Fund (from property tax) spent on public schools." },
  { match: /^LDRRMF/i, group: "Special funds", help: "Disaster risk reduction and management fund spending." },
  { match: /^Trust fund/i, group: "Special funds", help: "Trust funds, including congressional (PDAF) allocations." },
  { match: /^Annual GAD/i, group: "Special funds", help: "Gender and development programs and what they achieved." },
  { match: /Procurement Plan/i, group: "Procurement", help: "What the city planned to buy and build." },
  { match: /^Bid Result/i, group: "Procurement", help: "Results of bids for works, goods and consulting services." },
  { match: /^Manpower/i, group: "People", help: "Number of city employees by position and status." },
];
const GROUPS = ["City money", "Special funds", "Procurement", "People"];

const SERVICES = [
  ["Pay online", "Real property tax, business tax and fees", "https://payment.marikina.gov.ph/"],
  ["Business Portal (BPLO)", "Apply for or renew a business permit", "https://bplo.marikina.gov.ph/client/index"],
  ["Track a document", "Follow up on papers filed at City Hall", "http://dts.marikina.gov.ph/client/"],
  ["Download forms", "Application forms from city offices", "https://www.marikina.gov.ph/download-forms"],
  ["Citizen's Charter", "Official steps, fees and processing times", "https://fdpp.marikina.gov.ph/citizen-charter"],
  ["City jobs", "Government positions (HRMO)", "https://hrmo.marikina.gov.ph/careers/"],
  ["Private jobs (PESO)", "Company job listings in Marikina", "https://fdpp.marikina.gov.ph/jobs-opportunities"],
  ["City news", "Official news releases", "https://www.marikina.gov.ph/news"],
] as const;

const FACTS = [
  ["Ecological Profile", "Ecological-Profile.pdf"],
  ["Marikina 2023 Facts and Figures", "2023 Facts and Figures.pdf"],
  ["District 1 profile", "District 1.pdf"],
  ["District 2 profile", "District 2.pdf"],
  ["Registered footwear businesses, 1991–2025", "Statistical Report Registered - Footwear (1991-2025).pdf"],
  ["Registered businesses, 2021–2025", "Statistical Report Registered Business - 2021-2025.pdf"],
  ["Businesses by ownership type, 2021–2025", "Statistical Report Registered Business - Ownership Type 2021-2025.pdf"],
  ["Business establishments masterlist 2026 (Q2)", "List of Business Establishment 2026 (Masterlist) - 2nd Qtr.pdf"],
] as const;

export default function TransparencyPage() {
  return (
    <>
      <PageHeader eyebrow="Transparency" title="Where the city's money goes">
        Budgets, financial statements and fund reports the city must publish under
        the Full Disclosure Policy, sorted by year and explained in plain language.
      </PageHeader>

      <Section>
        <div className="grid gap-4 md:grid-cols-2">
          <Link href="/projects" className="group rounded-xl border border-line bg-surface p-5 hover:border-brand">
            <p className="font-display text-xl font-bold group-hover:text-brand">Projects & procurement →</p>
            <p className="mt-1 text-ink-muted">Every bid, award and notice to proceed, searchable.</p>
          </Link>
          <Link href="/ordinances" className="group rounded-xl border border-line bg-surface p-5 hover:border-brand">
            <p className="font-display text-xl font-bold group-hover:text-brand">Ordinances & resolutions →</p>
            <p className="mt-1 text-ink-muted">Local laws passed by the City Council, with full text.</p>
          </Link>
        </div>
      </Section>

      <Section title="Full Disclosure documents">
        <Suspense fallback={<SkeletonBlock className="h-96" />}>
          <Disclosures />
        </Suspense>
      </Section>

      <Section title="Official online services">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map(([name, text, href]) => (
            <li key={href}>
              <a href={href} className="group flex h-full flex-col rounded-xl border border-line bg-surface p-5 hover:border-brand">
                <span className="flex items-center gap-1.5 font-semibold group-hover:text-brand">
                  {name} <ExternalLink className="size-3.5" aria-hidden />
                </span>
                <span className="mt-1 text-sm text-ink-muted">{text}</span>
              </a>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Facts & figures">
        <Card className="!p-0">
          <ul className="divide-y divide-line">
            {FACTS.map(([name, file]) => (
              <li key={file}>
                <a
                  href={`https://www.marikina.gov.ph/facts/${encodeURI(file)}`}
                  className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-surface-2"
                >
                  <span>{name}</span>
                  <FileText className="size-4 shrink-0 text-brand" aria-label="PDF" />
                </a>
              </li>
            ))}
          </ul>
        </Card>
        <p className="mt-3 text-sm text-ink-muted">
          More reports at{" "}
          <a href="https://www.marikina.gov.ph/facts-and-figures" className="text-brand underline">
            marikina.gov.ph/facts-and-figures
          </a>
          .
        </p>
      </Section>
    </>
  );
}

async function Disclosures() {
  const { items, live } = await getDisclosures();
  const years = [...new Set(items.map((d) => d.year).filter((y): y is number => y !== null))].sort(
    (a, b) => b - a,
  );

  return (
    <>
      <div className="space-y-3">
        {years.map((year, i) => (
          <details
            key={year}
            open={i === 0}
            className="group rounded-xl border border-line bg-surface [&_summary::-webkit-details-marker]:hidden"
          >
            <summary className="flex min-h-14 cursor-pointer items-center justify-between px-5 font-display text-xl font-bold">
              {year}
              <span className="text-sm font-normal text-ink-muted group-open:hidden">
                {items.filter((d) => d.year === year).length} documents · show
              </span>
            </summary>
            <YearDocs docs={items.filter((d) => d.year === year)} />
          </details>
        ))}
      </div>
      <p className="mt-3 text-sm text-ink-muted">
        Files are hosted by the City Government at fdpp.marikina.gov.ph. Some are large
        scanned PDFs (the annual budget is about 35 MB).{" "}
        {!live && `The portal is not responding, so this list is the ${SNAPSHOT_DATE} copy.`}
      </p>
    </>
  );
}

function YearDocs({ docs }: { docs: Disclosure[] }) {
  const meta = (d: Disclosure) => DOCS.find((x) => x.match.test(d.title));
  return (
    <div className="grid gap-6 border-t border-line p-5 md:grid-cols-2">
      {GROUPS.map((group) => {
        const list = docs.filter((d) => (meta(d)?.group ?? "City money") === group);
        if (!list.length) return null;
        return (
          <div key={group}>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-muted">{group}</h3>
            <ul className="mt-2 space-y-1">
              {list.map((d) => (
                <li key={d.file}>
                  <a
                    href={fdppFileUrl(d.file)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex gap-3 rounded-lg p-2 -mx-2 hover:bg-surface-2"
                  >
                    <FileText className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
                    <span>
                      <span className="block font-medium text-brand">{d.title}</span>
                      {meta(d) && <span className="block text-sm text-ink-muted">{meta(d)!.help}</span>}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
