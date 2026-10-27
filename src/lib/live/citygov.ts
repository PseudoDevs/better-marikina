import { cacheLife } from "next/cache";
import snapshot from "@/data/citygov-snapshot.json";
import { citygovUrl, fetchNewsArticle, fetchNewsList } from "@/lib/citygov-core.mjs";

export { citygovUrl, CITYGOV_BASE } from "@/lib/citygov-core.mjs";

export type Block = { t: "p" | "li"; text: string };

export type NewsItem = {
  id: string;
  title: string;
  date: string | null;
  image: string | null;
  excerpt: string;
};

export type NewsArticle = {
  id: string;
  title: string | null;
  date: string | null;
  image: string | null;
  blocks: Block[];
  links: { href: string; label: string }[];
};

export type CityOfficial = {
  name: string;
  role: string | null;
  district: number | null;
  photo: string | null;
};

export const SNAPSHOT_DATE = snapshot.fetchedAt;

/** Our City text and the officials roster change rarely: served from the snapshot. */
export const ourCity = snapshot.ourCity as {
  sections: { title: string; blocks: Block[] }[];
  officials: CityOfficial[];
};

// A failed request is cached only briefly ("retry") and the snapshot
// (npm run snapshot:citygov) is served meanwhile. Cached functions never
// throw, so a slow city server cannot fail a build.

async function cachedNews(): Promise<NewsItem[] | null> {
  "use cache";
  try {
    const items = await fetchNewsList();
    cacheLife("portal");
    return items;
  } catch {
    cacheLife("retry");
    return null;
  }
}

async function cachedArticle(id: string): Promise<NewsArticle | null> {
  "use cache";
  try {
    const article = (await fetchNewsArticle(id)) as NewsArticle;
    cacheLife("daily");
    return article;
  } catch {
    cacheLife("retry");
    return null;
  }
}

const snapshotNews = snapshot.news as NewsItem[];
const snapshotArticles = snapshot.articles as Record<string, NewsArticle>;

export async function getNews(): Promise<{ items: NewsItem[]; live: boolean }> {
  const items = await cachedNews();
  return items ? { items, live: true } : { items: snapshotNews, live: false };
}

export async function getArticle(id: string): Promise<NewsArticle | null> {
  if (!/^[A-Za-z0-9]+$/.test(id)) return null;
  return (await cachedArticle(id)) ?? snapshotArticles[id] ?? null;
}

export function snapshotNewsIds() {
  return snapshotNews.map((n) => n.id);
}

export function imageUrl(path: string | null) {
  return path ? citygovUrl(path) : null;
}
