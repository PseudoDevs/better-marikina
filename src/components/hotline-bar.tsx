import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { telHref } from "@/lib/data";

// Fewer numbers on narrow screens instead of a hidden horizontal scroll;
// "All hotlines" stays visible at every width.
const QUICK = [
  { short: "Rescue", label: "Marikina Rescue", number: "161", show: "inline-flex" },
  { short: "Emergency", label: "Emergency", number: "911", show: "inline-flex" },
  { short: "Rescue mobile", label: "Rescue mobile", number: "0917-584-2168", show: "hidden md:inline-flex" },
  { short: "Fire", label: "Fire (BFP)", number: "681-0233", show: "hidden lg:inline-flex" },
  { short: "Police", label: "Police", number: "646-1622", show: "hidden lg:inline-flex" },
];

export function HotlineBar() {
  return (
    <div className="bg-brand-strong text-white">
      <div className="mx-auto flex max-w-6xl items-center gap-x-1 px-2 py-1 text-sm sm:gap-x-2 sm:px-4">
        <Phone className="mx-1 size-4 shrink-0 sm:mx-1.5" aria-hidden />
        <span className="sr-only">Emergency hotlines:</span>
        {QUICK.map((h) => (
          <a
            key={h.number}
            href={telHref(h.number)}
            className={`${h.show} min-h-9 items-center gap-1 whitespace-nowrap rounded-md px-2 hover:bg-white/10`}
          >
            <span className="text-white/85 sm:hidden">{h.short}</span>
            <span className="hidden text-white/85 sm:inline">{h.label}</span>
            <strong className="font-semibold">{h.number}</strong>
          </a>
        ))}
        <Link
          href="/hotlines"
          className="ml-auto inline-flex min-h-8 shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-white/15 px-3 font-semibold hover:bg-white/25"
        >
          <span className="sm:hidden">Hotlines</span>
          <span className="hidden sm:inline">All hotlines</span>
          <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
