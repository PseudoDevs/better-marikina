"use client";

import { useMemo, useRef, useState } from "react";
import { FileText, Search } from "lucide-react";
import { Pagination } from "./pagination";

export type ProcurementRow = {
  id: number;
  stage: string;
  type: string | null;
  ref: string;
  title: string;
  date: string;
  year: number;
  url: string;
};

const TYPE_LABEL: Record<string, string> = {
  INFRA: "Infrastructure",
  GOODS: "Goods",
  CONSULTING: "Consulting",
  SHOPPING: "Shopping",
  "SMALL VALUE PROCUREMENT": "Small value",
  "INVITATION TO BID": "Invitation to bid",
  "BID BULLETIN": "Bid bulletin",
};

export const typeLabel = (t: string | null) => (t ? (TYPE_LABEL[t] ?? t) : null);

const STAGE_TONE: Record<string, string> = {
  "Notice of Award": "bg-ok-soft text-ok",
  "Notice to Proceed": "bg-ok-soft text-ok",
  "Bid Opportunities": "bg-brand-soft text-brand",
  "BAC Resolution": "bg-warn-soft text-warn",
};

const DATE = new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeZone: "Asia/Manila" });
const PAGE = 10;

function norm(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function ProcurementExplorer({
  rows,
  stages,
}: {
  rows: ProcurementRow[];
  stages: string[];
}) {
  const [q, setQ] = useState("");
  const [stage, setStage] = useState("");
  const [type, setType] = useState("");
  const [year, setYear] = useState("");
  const [page, setPage] = useState(1);
  const listTop = useRef<HTMLParagraphElement>(null);

  const years = useMemo(
    () => [...new Set(rows.map((r) => r.year))].sort((a, b) => b - a),
    [rows],
  );
  const types = useMemo(
    () => [...new Set(rows.map((r) => r.type).filter((t): t is string => !!t))],
    [rows],
  );

  const filtered = useMemo(() => {
    const terms = norm(q).split(/\s+/).filter(Boolean);
    return rows.filter((r) => {
      if (stage && r.stage !== stage) return false;
      if (type && r.type !== type) return false;
      if (year && String(r.year) !== year) return false;
      if (!terms.length) return true;
      const hay = norm(`${r.title} ${r.ref}`);
      return terms.every((t) => hay.includes(t));
    });
  }, [rows, q, stage, type, year]);

  const reset = (fn: () => void) => {
    fn();
    setPage(1);
  };

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE));
  const current = Math.min(page, pageCount);
  const start = (current - 1) * PAGE;
  const pageRows = filtered.slice(start, start + PAGE);

  const goTo = (p: number) => {
    setPage(p);
    listTop.current?.scrollIntoView({ block: "start" });
  };

  const stageCount = (s: string) => rows.filter((r) => r.stage === s).length;

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by stage">
        {["", ...stages].map((s) => (
          <button
            key={s || "all"}
            type="button"
            onClick={() => reset(() => setStage(s))}
            aria-pressed={stage === s}
            className={`min-h-11 rounded-full border px-3.5 text-sm ${
              stage === s
                ? "border-brand bg-brand text-white"
                : "border-line bg-surface hover:border-brand hover:text-brand"
            }`}
          >
            {s || "All"}{" "}
            <span className={stage === s ? "text-white/80" : "text-ink-muted"}>
              {s ? stageCount(s) : rows.length}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <label className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3 focus-within:border-brand">
          <Search className="size-4 shrink-0 text-ink-muted" aria-hidden />
          <span className="sr-only">Search projects</span>
          <input
            type="search"
            value={q}
            onChange={(e) => reset(() => setQ(e.target.value))}
            placeholder="Search: road, school, Concepcion, ambulance…"
            className="h-11 w-full bg-transparent outline-none placeholder:text-ink-muted"
          />
        </label>
        <select
          value={type}
          onChange={(e) => reset(() => setType(e.target.value))}
          aria-label="Procurement type"
          className="h-11 rounded-xl border border-line bg-surface px-3"
        >
          <option value="">All types</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {typeLabel(t)}
            </option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => reset(() => setYear(e.target.value))}
          aria-label="Year"
          className="h-11 rounded-xl border border-line bg-surface px-3"
        >
          <option value="">All years</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <p ref={listTop} className="mt-4 scroll-mt-36 text-sm text-ink-muted" aria-live="polite">
        {filtered.length === 0
          ? "0 notices"
          : `Showing ${start + 1}–${start + pageRows.length} of ${filtered.length} ${
              filtered.length === 1 ? "notice" : "notices"
            }`}
      </p>

      <ul className="mt-2 divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
        {pageRows.map((r) => (
          <li key={r.id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-start sm:gap-5">
            <div className="shrink-0 text-sm text-ink-muted sm:w-28">{DATE.format(new Date(r.date))}</div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    STAGE_TONE[r.stage] ?? "bg-surface-2 text-ink-muted"
                  }`}
                >
                  {r.stage}
                </span>
                {r.type && (
                  <span className="rounded-full border border-line px-2 py-0.5 text-xs text-ink-muted">
                    {typeLabel(r.type)}
                  </span>
                )}
              </div>
              <p className="mt-1.5 font-medium">{r.title}</p>
              <p className="mt-0.5 text-xs text-ink-muted">{r.ref}</p>
            </div>
            <a
              href={r.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 shrink-0 items-center gap-1.5 self-start rounded-lg border border-line px-3 text-sm font-semibold text-brand hover:border-brand"
            >
              <FileText className="size-4" aria-hidden /> PDF
              <span className="sr-only">: {r.title}</span>
            </a>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="px-5 py-8 text-center text-ink-muted">No notices match these filters.</li>
        )}
      </ul>

      <Pagination page={current} pageCount={pageCount} onChange={goTo} label="Notice pages" />
    </div>
  );
}
