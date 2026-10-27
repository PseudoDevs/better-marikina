"use client";

import { useMemo, useState } from "react";
import { FileText, Search } from "lucide-react";

export type OrdinanceRow = {
  number: string;
  kind: "Ordinance" | "Resolution";
  year: number | null;
  title: string;
  url: string;
};

const PAGE = 30;

function norm(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/** Titles are published in capitals; sentence case reads more easily. */
function sentenceCase(s: string) {
  const lower = s.toLowerCase().replace(/\bmarikina\b/g, "Marikina");
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

export function OrdinanceList({ rows }: { rows: OrdinanceRow[] }) {
  const [q, setQ] = useState("");
  const [year, setYear] = useState("");
  const [kind, setKind] = useState("");
  const [shown, setShown] = useState(PAGE);

  const years = useMemo(
    () => [...new Set(rows.map((r) => r.year).filter((y): y is number => y !== null))].sort((a, b) => b - a),
    [rows],
  );

  const filtered = useMemo(() => {
    const terms = norm(q).split(/\s+/).filter(Boolean);
    return rows.filter((r) => {
      if (year && String(r.year) !== year) return false;
      if (kind && r.kind !== kind) return false;
      const hay = norm(`${r.number} ${r.title}`);
      return terms.every((t) => hay.includes(t));
    });
  }, [rows, q, year, kind]);

  const reset = (fn: () => void) => {
    fn();
    setShown(PAGE);
  };

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <label className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3 focus-within:border-brand">
          <Search className="size-4 shrink-0 text-ink-muted" aria-hidden />
          <span className="sr-only">Search ordinances</span>
          <input
            type="search"
            value={q}
            onChange={(e) => reset(() => setQ(e.target.value))}
            placeholder="Search: tax, traffic, garbage, senior…"
            className="h-11 w-full bg-transparent outline-none placeholder:text-ink-muted"
          />
        </label>
        <select
          value={kind}
          onChange={(e) => reset(() => setKind(e.target.value))}
          aria-label="Ordinance or resolution"
          className="h-11 rounded-xl border border-line bg-surface px-3"
        >
          <option value="">Ordinances & resolutions</option>
          <option value="Ordinance">Ordinances</option>
          <option value="Resolution">Resolutions</option>
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

      <p className="mt-4 text-sm text-ink-muted" aria-live="polite">
        {filtered.length} results
      </p>

      <ul className="mt-2 divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
        {filtered.slice(0, shown).map((r) => (
          <li key={r.url}>
            <a
              href={r.url}
              target="_blank"
              rel="noreferrer"
              className="flex gap-4 px-5 py-4 hover:bg-surface-2"
            >
              <FileText className="mt-1 size-4 shrink-0 text-brand" aria-hidden />
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-brand">{r.number}</span>
                <span className="mt-0.5 block">{sentenceCase(r.title)}</span>
              </span>
            </a>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="px-5 py-8 text-center text-ink-muted">Nothing matches these filters.</li>
        )}
      </ul>

      {shown < filtered.length && (
        <button
          type="button"
          onClick={() => setShown((n) => n + PAGE)}
          className="mt-4 min-h-11 w-full rounded-xl border border-line bg-surface font-semibold text-brand hover:border-brand"
        >
          Show more ({filtered.length - shown} left)
        </button>
      )}
    </div>
  );
}
