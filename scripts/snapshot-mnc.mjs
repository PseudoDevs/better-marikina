// Refreshes src/data/mnc-snapshot.json: headline, day, photo URL and short
// description of the latest Marikina stories on Metro News Central. The site
// fetches these live and falls back to this file. Run: npm run snapshot:mnc
import { writeFileSync } from "node:fs";
import { fetchMncNews } from "../src/lib/mnc-core.mjs";

const OUT = new URL("../src/data/mnc-snapshot.json", import.meta.url);
const items = await fetchMncNews();
writeFileSync(OUT, JSON.stringify({ fetchedAt: new Date().toISOString().slice(0, 10), items }, null, 2) + "\n");
console.log(`mnc-snapshot.json: ${items.length} stories, newest ${items[0]?.date} "${items[0]?.title}"`);
