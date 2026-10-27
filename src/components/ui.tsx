import Link from "next/link";
import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="border-b border-line bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        {eyebrow && (
          <p className="text-sm font-semibold uppercase tracking-wider text-brand">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display mt-2 text-3xl font-bold sm:text-5xl">{title}</h1>
        {children && (
          <div className="mt-4 max-w-2xl text-lg text-ink-muted">{children}</div>
        )}
      </div>
    </div>
  );
}

export function Section({
  title,
  action,
  children,
  id,
}: {
  title?: string;
  action?: { href: string; label: string };
  children: ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="mx-auto max-w-6xl px-4 pt-12">
      {(title || action) && (
        <div className="mb-5 flex items-end justify-between gap-4">
          {title && <h2 className="font-display text-2xl font-bold">{title}</h2>}
          {action && (
            <Link
              href={action.href}
              className="shrink-0 text-sm font-semibold text-brand hover:underline"
            >
              {action.label} →
            </Link>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-line bg-surface p-5 ${className}`}>
      {children}
    </div>
  );
}

export function Unverified({ children = "Needs verification" }: { children?: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-warn-soft px-2 py-0.5 text-xs font-medium text-warn">
      {children}
    </span>
  );
}

export function SkeletonBlock({ className = "h-40" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl border border-line bg-surface-2 motion-reduce:animate-none ${className}`}
      aria-hidden
    />
  );
}

export function Unavailable({ what, href, linkLabel }: { what: string; href: string; linkLabel: string }) {
  return (
    <Card>
      <p className="text-ink-muted">
        {what} is unavailable right now. Check{" "}
        <a href={href} className="font-medium text-brand underline">
          {linkLabel}
        </a>{" "}
        directly.
      </p>
    </Card>
  );
}
