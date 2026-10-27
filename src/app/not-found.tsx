import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="font-display text-6xl font-bold text-brand">404</p>
      <h1 className="font-display mt-4 text-2xl font-bold">We couldn&apos;t find that page</h1>
      <p className="mt-2 text-ink-muted">It may have moved. Try the services list or go home.</p>
      <div className="mt-6 flex justify-center gap-3 text-sm font-semibold">
        <Link href="/" className="rounded-lg bg-brand px-4 py-2.5 text-white">Home</Link>
        <Link href="/services" className="rounded-lg border border-line px-4 py-2.5">Services</Link>
      </div>
    </div>
  );
}
