import { cacheLife } from "next/cache";
import snapshot from "@/data/mnc-snapshot.json";
import { fetchMncNews, MNC_BASE } from "@/lib/mnc-core.mjs";

export { MNC_BASE };

export type MncItem = {
  url: string;
  title: string;
  date: string | null;
  image: string | null;
  excerpt: string;
  author: string | null;
};

export const MNC_SNAPSHOT_DATE = snapshot.fetchedAt;

// Same pattern as the city feed: a cached function that never throws, a short
// "retry" lifetime on failure, and the committed snapshot (npm run snapshot:mnc)
// served meanwhile.
async function cachedMnc(): Promise<MncItem[] | null> {
  "use cache";
  try {
    const items = (await fetchMncNews()) as MncItem[];
    cacheLife("portal");
    return items;
  } catch {
    cacheLife("retry");
    return null;
  }
}

export async function getMncNews(): Promise<{ items: MncItem[]; live: boolean }> {
  const items = await cachedMnc();
  return items ? { items, live: true } : { items: snapshot.items as MncItem[], live: false };
}
