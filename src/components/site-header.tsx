import Image from "next/image";
import Link from "next/link";
import { MobileNav } from "./mobile-nav";

export const NAV = [
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/transparency", label: "Transparency" },
  { href: "/news", label: "News" },
  { href: "/flood", label: "Flood watch" },
  { href: "/government", label: "Government" },
  { href: "/our-city", label: "Our City" },
  { href: "/map", label: "Map" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-line bg-paper/90 backdrop-blur supports-[backdrop-filter]:bg-paper/75 sticky top-0 z-40">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <Mark />
          <span className="font-display text-lg font-bold leading-none">
            Better <span className="text-brand">Marikina</span>
          </span>
        </Link>
        <nav aria-label="Main" className="ml-auto hidden lg:block">
          <ul className="flex items-center gap-1 text-[15px]">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  className="rounded-md px-3 py-2 text-ink-muted hover:bg-surface-2 hover:text-ink"
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <MobileNav items={NAV} />
      </div>
      <div className="border-t border-line bg-brand-soft text-[13px] text-ink-muted">
        <p className="mx-auto max-w-6xl px-4 py-1.5">
          Unofficial community project, not run by the City Government. For official
          transactions visit{" "}
          <a
            href="https://www.marikina.gov.ph"
            className="font-medium text-brand underline underline-offset-2"
          >
            marikina.gov.ph
          </a>
          .
        </p>
      </div>
    </header>
  );
}

/** City seal (public domain, Wikimedia Commons: Marikina_City_Seal.svg). */
function Mark() {
  return (
    <Image
      src="/marikina-seal.svg"
      alt=""
      width={40}
      height={40}
      priority
      className="size-10"
    />
  );
}
