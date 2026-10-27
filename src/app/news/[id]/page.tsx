import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { CITYGOV_BASE, getArticle, imageUrl, snapshotNewsIds } from "@/lib/live/citygov";
import { Blocks } from "@/components/blocks";
import { Section } from "@/components/ui";
import { formatDay } from "@/lib/format";

export function generateStaticParams() {
  return snapshotNewsIds().map((id) => ({ id }));
}

export async function generateMetadata({ params }: PageProps<"/news/[id]">): Promise<Metadata> {
  const article = await getArticle((await params).id);
  return article?.title ? { title: article.title } : {};
}

export default async function ArticlePage({ params }: PageProps<"/news/[id]">) {
  const { id } = await params;
  const article = await getArticle(id);
  if (!article?.title) notFound();
  const img = imageUrl(article.image);
  // The body often repeats the headline as its first line
  const blocks =
    article.blocks[0]?.text === article.title ? article.blocks.slice(1) : article.blocks;

  return (
    <article>
      <header className="border-b border-line bg-surface">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <Link href="/news" className="text-sm font-semibold text-brand hover:underline">
            ← City news
          </Link>
          <h1 className="font-display mt-3 text-3xl font-bold sm:text-4xl">{article.title}</h1>
          {article.date && (
            <time dateTime={article.date} className="mt-3 block text-ink-muted">
              {formatDay(article.date)} · City Government of Marikina
            </time>
          )}
        </div>
      </header>
      <Section>
        <div className="mx-auto max-w-3xl">
          {img && (
            <Image
              src={img}
              alt=""
              width={1200}
              height={750}
              sizes="(min-width: 768px) 720px, 100vw"
              className="mb-8 h-auto w-full rounded-xl border border-line"
            />
          )}
          {blocks.length > 0 ? (
            <Blocks blocks={blocks} />
          ) : (
            <p className="text-ink-muted">
              This announcement is mostly an image; see the original post.
            </p>
          )}
          {article.links.length > 0 && (
            <ul className="mt-8 space-y-2">
              {article.links.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="inline-flex items-center gap-1.5 font-semibold text-brand hover:underline"
                  >
                    {l.label} <ExternalLink className="size-3.5" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-10 border-t border-line pt-4 text-sm text-ink-muted">
            Republished from{" "}
            <a href={`${CITYGOV_BASE}/page/${id}`} className="text-brand underline">
              the original post on marikina.gov.ph
            </a>
            . Formatting simplified.
          </p>
        </div>
      </Section>
    </article>
  );
}
