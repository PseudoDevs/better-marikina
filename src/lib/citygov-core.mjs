// Readers for the City Government website (www.marikina.gov.ph): the Our City
// page and News Releases. Plain JS so the site (src/lib/live/citygov.ts) and
// the snapshot script (scripts/snapshot-citygov.mjs) share one implementation.
// Article bodies are reduced to plain-text blocks; the site never renders the
// city's HTML directly.

export const CITYGOV_BASE = "https://www.marikina.gov.ph";
const UA = "BetterMarikina/1.0 (community civic portal)";

const decode = (s) =>
  s
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#0?39;|&apos;|&rsquo;|&lsquo;/g, "'")
    .replace(/&quot;|&ldquo;|&rdquo;/g, '"')
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—")
    .replace(/&ntilde;/g, "ñ")
    .replace(/&Ntilde;/g, "Ñ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** Absolute URL for a path on the city site, e.g. "images/x.jpg" or "/page/abc". */
export function citygovUrl(path) {
  return new URL(encodeURI(decodeURI(path)), CITYGOV_BASE + "/").href;
}

/**
 * HTML fragment → [{ t: "p" | "li", text }]. Lines that only point at
 * JavaScript-driven buttons ("CLICK HERE…") are dropped.
 * @returns {{ t: "p" | "li", text: string }[]}
 */
export function toBlocks(html) {
  const marked = html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, "")
    .replace(/<li[^>]*>/gi, "\n\u0001")
    .replace(/<br\s*\/?>|<\/(p|li|h\d|div|ul|ol|tr)>|<(p|h\d|div|ul|ol|tr)(\s[^>]*)?>/gi, "\n");
  const out = [];
  for (const line of marked.split("\n")) {
    const text = decode(line.replace("\u0001", ""));
    // Skip empties, JS-only buttons, and markup some posts contain as literal text
    if (
      !text ||
      /^click here/i.test(text) ||
      /<\/?[a-z][^>]*$|style\s*=|mso-|font-family:|=""/i.test(text)
    )
      continue;
    out.push({ t: line.includes("\u0001") ? "li" : "p", text });
  }
  return out;
}

async function get(path, init) {
  const res = await fetch(CITYGOV_BASE + path, {
    ...init,
    headers: { "User-Agent": UA, ...init?.headers },
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`marikina.gov.ph ${path} returned ${res.status}`);
  return res;
}

const OUR_CITY_SECTIONS = [
  "The Shoe Capital of the Philippines",
  "Marikina Historical Development",
  "Geography",
  "Location",
  "Land Area",
];

export async function fetchOurCity() {
  const html = await (await get("/our-city")).text();
  const headings = [...html.matchAll(/<h([1-5])[^>]*>([\s\S]*?)<\/h[1-5]>/g)].map((m) => ({
    text: decode(m[2]),
    start: m.index,
    end: m.index + m[0].length,
  }));

  const sections = [];
  for (const title of OUR_CITY_SECTIONS) {
    const i = headings.findIndex((h) => h.text === title);
    if (i < 0) continue;
    // Tables on this page hold old population estimates; keep the prose only.
    const body = html
      .slice(headings[i].end, headings[i + 1]?.start ?? html.length)
      .replace(/<table[\s\S]*?<\/table>/gi, "");
    const blocks = toBlocks(body).filter((b) => !/^Note: Estimated population/i.test(b.text));
    if (blocks.length) sections.push({ title, blocks });
  }

  // Officials: each photo is followed by an "Hon. …" name heading and a role
  // heading; "DISTRICT 1/2" and "CITY COUNCIL" headings set the context.
  const tokens = [
    ...[...html.matchAll(/<img[^>]+src="([^"]*city officials\/[^"]+)"/g)].map((m) => ({
      kind: "img",
      value: m[1],
      at: m.index,
    })),
    ...headings.map((h) => ({ kind: "h", value: h.text, at: h.start })),
  ].sort((a, b) => a.at - b.at);

  const officials = [];
  let inCouncil = false;
  let councilDistrict = null;
  let photo = null;
  for (const tok of tokens) {
    if (tok.kind === "img") {
      photo = tok.value;
      continue;
    }
    const v = tok.value;
    const last = officials.at(-1);
    if (/^CITY COUNCIL$/i.test(v)) inCouncil = true;
    else if (/^Congressman$/i.test(v) && last) {
      // Representatives follow the council: "Hon. X", "Congressman", "District N"
      last.role = "Representative";
      last.district = null;
      inCouncil = false;
    } else if (/^DISTRICT ([12])$/i.test(v)) {
      const n = Number(v.slice(-1));
      if (last?.role === "Representative" && last.district === null) last.district = n;
      else councilDistrict = n;
    } else if (/^Hon\./.test(v)) {
      officials.push({
        name: v.replace(/^Hon\.\s*/, ""),
        role: inCouncil ? "Councilor" : null,
        district: inCouncil ? councilDistrict : null,
        photo,
      });
      photo = null;
    } else if (/Mayor/i.test(v) && last && !last.role) {
      last.role = v.replace(/^City\s+/i, "");
    }
  }
  return { sections, officials };
}

/** The news list is an AJAX fragment that needs the session cookie and CSRF token. */
export async function fetchNewsList() {
  const res = await get("/news");
  const html = await res.text();
  const token = html.match(/name="csrf-token" content="([^"]+)"/)?.[1];
  if (!token) throw new Error("marikina.gov.ph: no CSRF token on news page");
  const cookie = res.headers
    .getSetCookie()
    .map((c) => c.split(";")[0])
    .join("; ");
  const fragment = await (
    await get("/fetch_news_side", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Requested-With": "XMLHttpRequest",
        "X-CSRF-TOKEN": token,
        Cookie: cookie,
      },
      body: "idfam=",
    })
  ).text();

  return fragment
    .split("<tr>")
    .slice(1)
    .map((row) => {
      const href = row.match(/<h4><a href="([^"]+)"/)?.[1] ?? "";
      const [mm, dd, yyyy] = (row.match(/Post Date :\s*(\d{2})-(\d{2})-(\d{4})/) ?? []).slice(1);
      return {
        id: href.replace(/^\/?page\//, ""),
        title: decode(row.match(/<h4><a[^>]*>([\s\S]*?)<\/a>/)?.[1] ?? ""),
        date: yyyy ? `${yyyy}-${mm}-${dd}` : null,
        image: row.match(/<img src="([^"]+)"/)?.[1] ?? null,
        excerpt: decode(row.match(/<p class="text-content">([\s\S]*?)<a /)?.[1] ?? "")
          .replace(/^click here to view\s*/i, "")
          .replace(/\.\.\.$/, "…"),
      };
    })
    .filter((n) => n.id && n.title);
}

export async function fetchNewsArticle(id) {
  if (!/^[A-Za-z0-9]+$/.test(id)) throw new Error("invalid news id");
  const html = await (await get(`/page/${id}`)).text();
  const start = html.indexOf("post-meta");
  const end = html.indexOf('class="col-md-4"', start);
  if (start < 0) throw new Error("news article layout not recognised");
  const region = html.slice(start, end < 0 ? undefined : end);
  const head = html.slice(0, start);
  const title = [...head.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/g)].at(-1)?.[1];
  const image = region.match(/<img src="([^"]*image_post[^"]*)"/)?.[1] ?? null;
  const marker = region.indexOf("justify-content-between");
  const bodyStart = marker < 0 ? -1 : region.indexOf(">", marker) + 1;
  const links = [...region.matchAll(/<a[^>]+href="([^"#][^"]*)"[^>]*>([\s\S]*?)<\/a>/g)]
    .map((m) => ({ href: m[1], label: decode(m[2]) }))
    .filter((l) => /^https?:|\.pdf$/i.test(l.href) && l.label);
  return {
    id,
    title: title ? decode(title) : null,
    image,
    date: region.match(/post-date[^>]*>(?:<[^>]+>)*\s*(\d{4}-\d{2}-\d{2})/)?.[1] ?? null,
    blocks: toBlocks(bodyStart < 0 ? region : region.slice(bodyStart)),
    links,
  };
}
