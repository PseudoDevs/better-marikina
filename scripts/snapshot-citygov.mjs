// Refreshes src/data/citygov-snapshot.json from www.marikina.gov.ph: the Our
// City page (history, geography, officials) and News Releases with full
// article text. Our City is served from this snapshot; news is fetched live
// and falls back to it. Run: npm run snapshot:citygov
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fetchNewsArticle, fetchNewsList, fetchOurCity } from "../src/lib/citygov-core.mjs";

const OUT = new URL("../src/data/citygov-snapshot.json", import.meta.url);
const previous = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : null;

// The city server is sometimes slow; retry before giving up.
async function retry(fn, label, attempts = 3) {
  for (let i = 1; ; i++) {
    try {
      return await fn();
    } catch (e) {
      if (i >= attempts) throw e;
      console.warn(`${label}: ${e.message}, retrying (${i}/${attempts - 1})`);
    }
  }
}

const news = await retry(fetchNewsList, "news list");
const articles = {};
for (const n of news) {
  try {
    articles[n.id] = await retry(() => fetchNewsArticle(n.id), `article ${n.id.slice(0, 8)}`);
  } catch (e) {
    if (!previous?.articles?.[n.id]) throw e;
    console.warn(`article ${n.id.slice(0, 8)}: kept the previous copy (${e.message})`);
    articles[n.id] = previous.articles[n.id];
  }
}

const snapshot = {
  fetchedAt: new Date().toISOString().slice(0, 10),
  ourCity: await retry(fetchOurCity, "our city"),
  news,
  articles,
};
writeFileSync(OUT, JSON.stringify(snapshot, null, 1) + "\n");
console.log(
  `Saved ${snapshot.ourCity.sections.length} Our City sections, ` +
    `${snapshot.ourCity.officials.length} officials, ${news.length} news articles`,
);
