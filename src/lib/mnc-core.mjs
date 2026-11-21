// Reader for Metro News Central's Marikina edition (marikina.metronewscentral.net).
// Plain JS so the site (src/lib/live/mnc.ts) and the snapshot script
// (scripts/snapshot-mnc.mjs) share one implementation.
//
// Metro News Central is a private news outlet, and its robots.txt declares
// `Content-Signal: use=reference`. So we keep only what a link preview needs
// (headline, date, photo, a short description) and always link to the original.
// Article bodies are never stored or republished.

export const MNC_BASE = "https://marikina.metronewscentral.net";
const UA = "BetterMarikina/1.0 (community civic portal)";
const ARTICLE_RE = /href="(https:\/\/marikina\.metronewscentral\.net\/marikina\/[a-z0-9-]+\/[a-z0-9-]+)"/gi;
const SKIP = /\/city-at-a-glance\//;

const NAMED = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", ndash: "–", mdash: "—", lsquo: "‘", rsquo: "’", ldquo: "“", rdquo: "”", hellip: "…", ntilde: "ñ", Ntilde: "Ñ" };

function decode(s) {
  return s
    .replace(/<[^>]+>/g, " ")
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, code) => {
      if (code[0] === "#") {
        const n = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
        return Number.isFinite(n) ? String.fromCodePoint(n) : whole;
      }
      return NAMED[code] ?? whole;
    })
    .replace(/\s+/g, " ")
    .trim();
}

async function get(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "text/html" },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`metronewscentral.net: HTTP ${res.status} for ${url}`);
  return res.text();
}

/** Marikina article URLs on the homepage, newest first, without duplicates. */
export function parseHome(html) {
  const seen = new Set();
  for (const m of html.matchAll(ARTICLE_RE)) if (!SKIP.test(m[1])) seen.add(m[1]);
  return [...seen];
}

/** Their JSON-LD has raw newlines inside strings, so fields are read with patterns, not JSON.parse. */
function ldField(block, key) {
  const m = block.match(new RegExp(`"${key}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`));
  return m ? m[1].replace(/\\"/g, '"').replace(/\\\//g, "/").trim() : null;
}

function meta(html, prop) {
  const m =
    html.match(new RegExp(`<meta[^>]+property="${prop}"[^>]*content="([^"]*)"`, "i")) ??
    html.match(new RegExp(`<meta[^>]+name="${prop}"[^>]*content="([^"]*)"`, "i"));
  return m ? decode(m[1]) : null;
}

/**
 * "2026-11-14+0809:32:56+08:00" (their format, the zone glued to the time) or
 * a normal ISO timestamp → Manila calendar day "YYYY-MM-DD".
 */
export function parseMncDay(raw) {
  const m = raw?.match(/(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : null;
}

/** First sentences up to ~220 characters, cut at a sentence end when possible. */
function excerpt(text, max = 220) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const end = cut.match(/^(.{80,}[.!?])\s/);
  return end ? end[1] : `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

/**
 * @returns {{ url: string, title: string, date: string | null, image: string | null, excerpt: string, author: string | null } | null}
 */
export function parseArticle(url, html) {
  const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map((m) => m[1])
    .find((b) => b.includes('"NewsArticle"'));
  const title = decode((ld && ldField(ld, "headline")) ?? meta(html, "og:title") ?? "");
  if (!title) return null;
  const description = decode((ld && ldField(ld, "description")) ?? meta(html, "og:description") ?? "");
  const image = ld?.match(/"image"\s*:\s*\[\s*"([^"]+)"/)?.[1] ?? meta(html, "og:image");
  const authorBlock = ld?.match(/"author"\s*:\s*\{[^}]*\}/)?.[0];
  return {
    url,
    title,
    date: parseMncDay(ld ? ldField(ld, "datePublished") : null),
    image: image?.startsWith("https://") ? image : null,
    excerpt: excerpt(description),
    author: authorBlock ? ldField(authorBlock, "name") : null,
  };
}

/** Latest Marikina stories with headline, day, photo and a short description. */
export async function fetchMncNews(limit = 15) {
  const urls = parseHome(await get(`${MNC_BASE}/`)).slice(0, limit);
  const out = [];
  // A few at a time keeps it quick without hammering their server.
  for (let i = 0; i < urls.length; i += 4) {
    const batch = await Promise.all(
      urls.slice(i, i + 4).map(async (url) => {
        try {
          return parseArticle(url, await get(url));
        } catch {
          return null;
        }
      }),
    );
    out.push(...batch.filter(Boolean));
  }
  if (!out.length) throw new Error("metronewscentral.net: no articles could be read");
  return out;
}
