"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

/** Page numbers to show: first, last, and a window around the current page. */
function pageList(page: number, count: number): (number | "…")[] {
  const keep = new Set([1, count, page - 1, page, page + 1]);
  const out: (number | "…")[] = [];
  for (let p = 1; p <= count; p++) {
    if (keep.has(p)) out.push(p);
    else if (out.at(-1) !== "…") out.push("…");
  }
  return out;
}

export function Pagination({
  page,
  pageCount,
  onChange,
  label = "Pages",
}: {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
  label?: string;
}) {
  if (pageCount <= 1) return null;
  const btn =
    "inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border px-3 text-sm font-semibold";
  const idle = "border-line bg-surface hover:border-brand hover:text-brand";

  return (
    <nav aria-label={label} className="mt-4 flex items-center justify-between gap-2">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className={`${btn} ${idle} gap-1 disabled:pointer-events-none disabled:opacity-40`}
      >
        <ChevronLeft className="size-4" aria-hidden /> Previous
      </button>

      <ol className="hidden items-center gap-1.5 sm:flex">
        {pageList(page, pageCount).map((p, i) =>
          p === "…" ? (
            <li key={`gap-${i}`} className="px-1 text-ink-muted" aria-hidden>
              …
            </li>
          ) : (
            <li key={p}>
              <button
                type="button"
                onClick={() => onChange(p)}
                aria-current={p === page ? "page" : undefined}
                aria-label={`Page ${p}`}
                className={`${btn} tabular-nums ${
                  p === page ? "border-brand bg-brand text-white" : idle
                }`}
              >
                {p}
              </button>
            </li>
          ),
        )}
      </ol>
      <p className="text-sm text-ink-muted sm:hidden">
        Page {page} of {pageCount}
      </p>

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page === pageCount}
        className={`${btn} ${idle} gap-1 disabled:pointer-events-none disabled:opacity-40`}
      >
        Next <ChevronRight className="size-4" aria-hidden />
      </button>
    </nav>
  );
}
