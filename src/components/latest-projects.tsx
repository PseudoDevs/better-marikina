import { FileText } from "lucide-react";
import { cleanTitle, fdppFileUrl, getProcurement } from "@/lib/live/fdpp";

const DATE = new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeZone: "Asia/Manila" });

/** The newest bid opportunities and awards from the city's procurement portal. */
export async function LatestProjects() {
  const { items } = await getProcurement();
  const latest = items
    .filter((r) => r.stage === "Bid Opportunities" || r.stage === "Notice of Award" || r.stage === "Notice to Proceed")
    .slice(0, 5);

  return (
    <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
      {latest.map((r) => (
        <li key={r.id}>
          <a
            href={fdppFileUrl(r.file)}
            target="_blank"
            rel="noreferrer"
            className="flex gap-4 px-5 py-4 hover:bg-surface-2"
          >
            <FileText className="mt-1 size-4 shrink-0 text-brand" aria-hidden />
            <span className="min-w-0">
              <span className="block text-sm text-ink-muted">
                {DATE.format(new Date(r.date))} · {r.stage}
              </span>
              <span className="mt-0.5 block font-medium">{cleanTitle(r.title)}</span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
