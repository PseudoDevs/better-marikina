// Readers for the Marikina Full Disclosure Policy Portal (fdpp.marikina.gov.ph).
// Plain JS so the site (src/lib/live/fdpp.ts) and the snapshot script
// (scripts/snapshot-fdpp.mjs) share one implementation.

export const FDPP_BASE = "https://fdpp.marikina.gov.ph";
const UA = "BetterMarikina/1.0 (community civic portal)";

/**
 * getBids category ids, in the order a procurement moves through them. An
 * array, because objects with numeric keys always iterate in numeric order.
 * @type {[number, string][]}
 */
export const PROCUREMENT_STAGES = [
  [1002, "Annual Procurement Plan"],
  [1006, "Notice of Proposed Procurement"],
  [1004, "Bid Opportunities"],
  [1008, "Other Notices"],
  [1003, "BAC Resolution"],
  [1005, "Notice of Award"],
  [1007, "Notice to Proceed"],
  [1009, "Procurement Monitoring Report"],
];

const decode = (s) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();

/** Absolute URL for a portal file path such as "file/procurement/X.pdf". */
export function fdppFileUrl(file) {
  return `${FDPP_BASE}/${encodeURI(file)}`;
}

async function page(path) {
  const res = await fetch(FDPP_BASE + path, {
    headers: { "User-Agent": UA },
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`fdpp ${path} returned ${res.status}`);
  return res;
}

export async function fetchProcurement() {
  // getBids is a Laravel DataTables endpoint: it needs the session cookie and
  // CSRF token issued with the bids page.
  const res = await page("/bids-and-awards");
  const html = await res.text();
  const token = html.match(/name="csrf-token" content="([^"]+)"/)?.[1];
  if (!token) throw new Error("fdpp: no CSRF token on bids page");
  const cookie = res.headers
    .getSetCookie()
    .map((c) => c.split(";")[0])
    .join("; ");

  const out = [];
  for (const [id, stage] of PROCUREMENT_STAGES) {
    const r = await fetch(FDPP_BASE + "/getBids", {
      method: "POST",
      headers: {
        "User-Agent": UA,
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Requested-With": "XMLHttpRequest",
        "X-CSRF-TOKEN": token,
        Cookie: cookie,
      },
      body: new URLSearchParams({
        draw: "1",
        start: "0",
        length: "5000",
        "search[value]": "",
        bids_id: String(id),
        _token: token,
      }),
      signal: AbortSignal.timeout(20_000),
    });
    if (!r.ok) throw new Error(`fdpp getBids ${id} returned ${r.status}`);
    const json = await r.json();
    for (const d of json.data) {
      if (d.deleted) continue;
      out.push({
        id: d.id,
        stage,
        type:
          d.file_sub_category && d.file_sub_category !== "OTHER"
            ? decode(d.file_sub_category)
            : null,
        ref: decode(d.file_name ?? ""),
        title: decode(d.file_description ?? ""),
        date: d.date_posted,
        year: d.file_year,
        file: d.file_link,
      });
    }
  }
  return out.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
}

export async function fetchDisclosures() {
  const html = await (await page("/full-disclosure")).text();
  return [...html.matchAll(/data-url="([^"]+)"\s+data-title="([^"]*)"/g)].map((m) => ({
    year: Number(m[1].match(/\/(\d{4})_/)?.[1]) || null,
    title: decode(m[2]),
    file: m[1],
  }));
}

export async function fetchOrdinances() {
  const html = await (await page("/city-ordinance")).text();
  return [
    ...html.matchAll(
      /data-url="([^"]+)"\s+data-title="([^"]*)">\s*<span[^>]*>\s*([^<]+?)\s*<\/span>/g,
    ),
  ].map((m) => {
    const number = decode(m[3]);
    return {
      number,
      kind: /^RESOLUTION/i.test(number) ? "Resolution" : "Ordinance",
      year: Number(number.match(/(\d{4})\s*$/)?.[1]) || null,
      title: decode(m[2]),
      file: m[1],
    };
  });
}
