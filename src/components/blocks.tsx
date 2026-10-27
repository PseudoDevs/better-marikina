import type { Block } from "@/lib/live/citygov";

/** Renders plain-text blocks, grouping consecutive list items into one list. */
export function Blocks({ blocks }: { blocks: Block[] }) {
  const groups: (Block | Block[])[] = [];
  for (const b of blocks) {
    const last = groups.at(-1);
    if (b.t === "li" && Array.isArray(last)) last.push(b);
    else groups.push(b.t === "li" ? [b] : b);
  }
  return (
    <div className="space-y-4 text-[17px] leading-relaxed">
      {groups.map((g, i) =>
        Array.isArray(g) ? (
          <ul key={i} className="list-disc space-y-2 pl-6">
            {g.map((li, j) => (
              <li key={j}>{li.text}</li>
            ))}
          </ul>
        ) : (
          <p key={i}>{g.text}</p>
        ),
      )}
    </div>
  );
}
