"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { SearchItem } from "@/lib/search-index";

function norm(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function SiteSearch({
  items,
  popular,
}: {
  items: SearchItem[];
  popular: { label: string; href: string }[];
}) {
  const [q, setQ] = useState("");
  const listId = useId();

  const results = useMemo(() => {
    const terms = norm(q).split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    return items
      .map((it) => {
        const title = norm(it.title);
        const text = norm(it.text);
        let score = 0;
        for (const t of terms) {
          if (title.includes(t)) score += 3;
          else if (text.includes(t)) score += 1;
          else return null;
        }
        return { it, score };
      })
      .filter((r): r is { it: SearchItem; score: number } => r !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((r) => r.it);
  }, [q, items]);

  return (
    <div className="relative text-ink">
      <label htmlFor={`${listId}-input`} className="sr-only">
        Search services, offices, barangays and hotlines
      </label>
      <div className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 shadow-sm focus-within:border-brand">
        <Search className="size-5 shrink-0 text-ink-muted" aria-hidden />
        <input
          id={`${listId}-input`}
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Try “business permit”, “Concepcion Uno”, or “ambulance”"
          className="h-14 w-full bg-transparent text-base outline-none placeholder:text-ink-muted"
          aria-controls={listId}
          autoComplete="off"
        />
      </div>
      {q.trim() && (
        <ul
          id={listId}
          className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-line bg-surface shadow-xl"
        >
          {results.length === 0 ? (
            <li className="px-4 py-3 text-ink-muted">
              No matches. Call City Hall at{" "}
              <a href="tel:0286460462" className="font-medium text-brand underline">
                (02) 8646-0462
              </a>
              .
            </li>
          ) : (
            results.map((r) => (
              <li key={r.kind + r.title}>
                <Link
                  href={r.href}
                  className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-surface-2"
                >
                  <span className="font-medium">{r.title}</span>
                  <span className="shrink-0 text-xs text-ink-muted">{r.kind}</span>
                </Link>
              </li>
            ))
          )}
        </ul>
      )}
      <div className="mt-3 flex flex-wrap gap-2 text-sm">
        <span className="py-1 text-white/85">Popular:</span>
        {popular.map((p) => (
          <Link
            key={p.href}
            href={p.href}
            className="rounded-full border border-line bg-surface px-3 py-1 text-ink hover:border-brand hover:text-brand"
          >
            {p.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
