"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function MobileNav({ items }: { items: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="ml-auto lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="mobile-nav"
        className="flex size-11 items-center justify-center rounded-md hover:bg-surface-2"
      >
        {open ? <X aria-hidden /> : <Menu aria-hidden />}
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
      </button>
      {open && (
        <nav
          id="mobile-nav"
          aria-label="Main"
          className="absolute inset-x-0 top-full border-b border-line bg-paper shadow-lg"
        >
          <ul className="mx-auto max-w-6xl px-4 py-2">
            {[
              ...items,
              { href: "/weather", label: "Weather" },
              { href: "/barangays", label: "Barangays" },
              { href: "/ordinances", label: "Ordinances" },
              { href: "/hotlines", label: "Hotlines" },
              { href: "/tourism", label: "Visit" },
              { href: "/about", label: "About" },
            ].map(
              (n) => (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-md px-3 py-3 hover:bg-surface-2"
                  >
                    {n.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </nav>
      )}
    </div>
  );
}
