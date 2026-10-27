import { cacheLife } from "next/cache";
import snapshot from "@/data/fdpp-snapshot.json";
import {
  fetchDisclosures,
  fetchOrdinances,
  fetchProcurement,
} from "@/lib/fdpp-core.mjs";

export { fdppFileUrl, FDPP_BASE, PROCUREMENT_STAGES } from "@/lib/fdpp-core.mjs";

export type ProcurementRecord = {
  id: number;
  stage: string;
  type: string | null;
  ref: string;
  title: string;
  date: string;
  year: number;
  file: string;
};

export type Disclosure = { year: number | null; title: string; file: string };

export type Ordinance = {
  number: string;
  kind: "Ordinance" | "Resolution";
  year: number | null;
  title: string;
  file: string;
};

export const SNAPSHOT_DATE = snapshot.fetchedAt;

/** Drop the reference number and NOA/NTP prefixes repeated at the start of titles. */
export function cleanTitle(title: string) {
  const t = title
    .replace(/^Mkna-GSO-\d{2}-\d{3,4}[A-Z-]*\.?\s*[-–:]?\s*/i, "")
    .replace(/^RES \d{2}-\d+\.?\s*/i, "")
    .replace(/^(NOA|NTP)\s*-\s*/i, "");
  return t || title;
}

// A failed request is cached only briefly ("retry") and the snapshot
// (npm run snapshot:fdpp) is served meanwhile. Cached functions never throw,
// so a slow portal cannot fail a build.

async function cachedProcurement(): Promise<ProcurementRecord[] | null> {
  "use cache";
  try {
    const items = await fetchProcurement();
    cacheLife("portal");
    return items;
  } catch {
    cacheLife("retry");
    return null;
  }
}

async function cachedDisclosures(): Promise<Disclosure[] | null> {
  "use cache";
  try {
    const items = await fetchDisclosures();
    cacheLife("portal");
    return items;
  } catch {
    cacheLife("retry");
    return null;
  }
}

async function cachedOrdinances(): Promise<Ordinance[] | null> {
  "use cache";
  try {
    const items = (await fetchOrdinances()) as Ordinance[];
    cacheLife("portal");
    return items;
  } catch {
    cacheLife("retry");
    return null;
  }
}

async function withSnapshot<T>(read: () => Promise<T | null>, fallback: T) {
  const items = await read();
  return items ? { items, live: true } : { items: fallback, live: false };
}

export function getProcurement() {
  return withSnapshot(cachedProcurement, snapshot.procurement as ProcurementRecord[]);
}

export function getDisclosures() {
  return withSnapshot(cachedDisclosures, snapshot.disclosures as Disclosure[]);
}

export function getOrdinances() {
  return withSnapshot(cachedOrdinances, snapshot.ordinances as Ordinance[]);
}
