import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ExternalLink } from "lucide-react";
import { getNews, imageUrl, SNAPSHOT_DATE } from "@/lib/live/citygov";
import { getMncNews, MNC_SNAPSHOT_DATE } from "@/lib/live/mnc";
import { formatDay } from "@/lib/format";
import { PageHeader, Section, SkeletonBlock } from "@/components/ui";

export const metadata: Metadata = {
  title: "News",
  description: "Marikina City news: City Government releases and local news coverage, newest first.",
};

type Entry = {
  key: string;
  source: "city" | "mnc";
  title: string;
  date: string | null;
  image: string | null;
  excerpt: string;
  href: string;
};

const SOURCE_LABEL = { city: "City Government", mnc: "Metro News Central" } as const;

/** Many posts use the headline itself as the opening line of the excerpt. */
function repeatsTitle(excerpt: string, title: string) {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");
  return norm(excerpt).startsWith(norm(title).slice(0, 40));
}

export default function NewsPage() {
  return (
    <>
      <PageHeader eyebrow="News" title="Marikina news">
        City Government releases from marikina.gov.ph and local coverage from Metro News Central,
        newest first. The City Public Information Office posts day-to-day updates on{" "}
        <a href="https://www.facebook.com/MarikinaPIO" className="text-brand underline">
          Facebook
        </a>
        .
      </PageHeader>
      <Section>
        <Suspense fallback={<SkeletonBlock className="h-[60vh]" />}>
          <NewsList />
        </Suspense>
      </Section>
    </>
  );
}

async function NewsList() {
  const [city, mnc] = await Promise.all([getNews(), getMncNews()]);
  const entries: Entry[] = [
    ...city.items.map((n) => ({
      key: `city-${n.id}`,
      source: "city" as const,
      title: n.title,
      date: n.date,
      image: imageUrl(n.image),
      excerpt: n.excerpt,
      href: `/news/${n.id}`,
    })),
    ...mnc.items.map((n) => ({
      key: n.url,
      source: "mnc" as const,
      title: n.title,
      date: n.date,
      image: n.image,
      excerpt: n.excerpt,
      href: n.url,
    })),
  ].sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));

  return (
    <>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map((n) => {
          const external = n.source === "mnc";
          const card = (
            <>
              <div className="relative aspect-[16/10] bg-surface-2">
                {n.image && (
                  <Image
                    src={n.image}
                    alt=""
                    fill
                    // metronewscentral.net refuses Vercel's image optimizer
                    // (502 OPTIMIZED_EXTERNAL_IMAGE_REQUEST_UNAUTHORIZED) but
                    // serves browsers fine, so load those photos directly.
                    unoptimized={external}
                    sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <p className="flex flex-wrap items-center gap-x-2 text-sm text-ink-muted">
                  <span className={n.source === "city" ? "font-semibold text-brand" : "font-semibold text-ink"}>
                    {SOURCE_LABEL[n.source]}
                  </span>
                  {n.date && (
                    <>
                      <span aria-hidden>·</span>
                      <time dateTime={n.date}>{formatDay(n.date)}</time>
                    </>
                  )}
                </p>
                <p className="mt-1 font-semibold group-hover:text-brand">
                  {n.title}
                  {external && <ExternalLink className="ml-1.5 inline size-3.5 align-baseline text-ink-muted" aria-label="(opens metronewscentral.net)" />}
                </p>
                {n.excerpt && !repeatsTitle(n.excerpt, n.title) && (
                  <p className="mt-2 line-clamp-3 text-sm text-ink-muted">{n.excerpt}</p>
                )}
              </div>
            </>
          );
          const className =
            "group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-surface hover:border-brand";
          return (
            <li key={n.key}>
              {external ? (
                <a href={n.href} className={className} rel="noopener">
                  {card}
                </a>
              ) : (
                <Link href={n.href} className={className}>
                  {card}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
      <p className="mt-6 text-sm text-ink-muted">
        Metro News Central stories open on metronewscentral.net; headlines, photos and summaries
        are theirs.
        {!city.live && ` marikina.gov.ph is not responding, so city releases are the ${SNAPSHOT_DATE} copy.`}
        {!mnc.live && ` Metro News Central is not responding, so its stories are the ${MNC_SNAPSHOT_DATE} copy.`}
      </p>
    </>
  );
}
