import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { getNews, imageUrl, SNAPSHOT_DATE } from "@/lib/live/citygov";
import { formatDay } from "@/lib/format";
import { PageHeader, Section, SkeletonBlock } from "@/components/ui";

export const metadata: Metadata = {
  title: "News releases",
  description: "News releases and announcements from the City Government of Marikina.",
};

/** Many posts use the headline itself as the opening line of the excerpt. */
function repeatsTitle(excerpt: string, title: string) {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");
  return norm(excerpt).startsWith(norm(title).slice(0, 40));
}

export default function NewsPage() {
  return (
    <>
      <PageHeader eyebrow="News" title="City news releases">
        Announcements posted on marikina.gov.ph. The City Public Information Office
        posts day-to-day updates on{" "}
        <a href="https://www.facebook.com/MarikinaCityPIO" className="text-brand underline">
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
  const { items, live } = await getNews();
  return (
    <>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((n) => {
          const img = imageUrl(n.image);
          return (
            <li key={n.id}>
              <Link
                href={`/news/${n.id}`}
                className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-surface hover:border-brand"
              >
                <div className="relative aspect-[16/10] bg-surface-2">
                  {img && (
                    <Image
                      src={img}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  {n.date && (
                    <time dateTime={n.date} className="text-sm text-ink-muted">
                      {formatDay(n.date)}
                    </time>
                  )}
                  <p className="mt-1 font-semibold group-hover:text-brand">{n.title}</p>
                  {n.excerpt && !repeatsTitle(n.excerpt, n.title) && (
                    <p className="mt-2 line-clamp-3 text-sm text-ink-muted">{n.excerpt}</p>
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
      {!live && (
        <p className="mt-4 text-sm text-ink-muted">
          marikina.gov.ph is not responding, so this is the {SNAPSHOT_DATE} copy.
        </p>
      )}
    </>
  );
}
