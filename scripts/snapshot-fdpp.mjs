// Refreshes src/data/fdpp-snapshot.json from the Marikina Full Disclosure
// Policy Portal. The site serves this snapshot when the portal is down.
// Run: npm run snapshot:fdpp
import { writeFileSync } from "node:fs";
import {
  fetchDisclosures,
  fetchOrdinances,
  fetchProcurement,
} from "../src/lib/fdpp-core.mjs";

const snapshot = {
  fetchedAt: new Date().toISOString().slice(0, 10),
  procurement: await fetchProcurement(),
  disclosures: await fetchDisclosures(),
  ordinances: await fetchOrdinances(),
};
writeFileSync(
  new URL("../src/data/fdpp-snapshot.json", import.meta.url),
  JSON.stringify(snapshot) + "\n",
);
console.log(
  `Saved ${snapshot.procurement.length} procurement records, ` +
    `${snapshot.disclosures.length} disclosures, ${snapshot.ordinances.length} ordinances`,
);
