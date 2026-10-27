import { get } from "node:https";
import { rootCertificates } from "node:tls";
import { cacheLife } from "next/cache";
import { GLOBALSIGN_GCC_R46_OV_2025 } from "./pagasa-ca";

// PAGASA Pasig–Marikina–Tullahan Flood Forecasting & Warning System.
// Undocumented public JSON, no CORS headers, so it is only read on the server.
const FFWS_URL =
  "https://pasig-marikina-tullahanffws.pagasa.dost.gov.ph/water/main_list.do";

type RawStation = {
  obscd: string;
  obsnm: string;
  lat: number | null;
  lon: number | null;
  timestr: string;
  wl: string | null;
  wl10m: string | null;
  wl30m: string | null;
  wl1h: string | null;
  wl2h: string | null;
  wlchange: string | null;
  alertwl: string | number | null;
  alarmwl: string | number | null;
  criticalwl: string | number | null;
};

export type RiverStatus = "normal" | "alert" | "alarm" | "critical" | "unknown";

export type RiverStation = {
  id: string;
  name: string;
  lat: number | null;
  lon: number | null;
  time: string;
  level: number | null;
  suspect: boolean;
  change: number | null;
  history: { label: string; level: number | null }[];
  alert: number | null;
  alarm: number | null;
  critical: number | null;
  status: RiverStatus;
  marikina: boolean;
};

/** Marikina River gauges, upstream (Rizal) to downstream (Marikina). */
export const MARIKINA_STATIONS = [
  "11102201", // Rodriguez
  "11102203", // Burgos
  "11102202", // Montalban
  "11103201", // San Mateo-1
  "11103202", // Nangka
  "11103203", // Tumana Bridge
  "11104204", // Sto. Niño (MMDA) — the gauge the city's alarms use
  "11104201", // Sto. Niño (PAGASA)
];
export const STO_NINO = "11104204";

function num(v: string | number | null | undefined): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = parseFloat(String(v).replace("(*)", ""));
  return Number.isFinite(n) ? n : null;
}

export function riverStatus(
  level: number | null,
  t: { alert: number | null; alarm: number | null; critical: number | null },
): RiverStatus {
  if (level === null || t.alert === null) return "unknown";
  if (t.critical !== null && level >= t.critical) return "critical";
  if (t.alarm !== null && level >= t.alarm) return "alarm";
  if (level >= t.alert) return "alert";
  return "normal";
}

function normalize(s: RawStation): RiverStation {
  const level = num(s.wl);
  const thresholds = {
    alert: num(s.alertwl),
    alarm: num(s.alarmwl),
    critical: num(s.criticalwl),
  };
  return {
    id: s.obscd,
    name: s.obsnm
      .trim()
      .replace(/^Sto\.? ?Nino/i, "Sto. Niño")
      .replace(/(\S)\(/, "$1 ("),
    lat: s.lat,
    lon: s.lon,
    time: s.timestr,
    level,
    // "(*)" marks a reading PAGASA flags as missing or not yet validated
    suspect: String(s.wl ?? "").includes("(*)") || level === 0,
    change: num(s.wlchange),
    history: [
      { label: "2h ago", level: num(s.wl2h) },
      { label: "1h ago", level: num(s.wl1h) },
      { label: "30m ago", level: num(s.wl30m) },
      { label: "10m ago", level: num(s.wl10m) },
      { label: "Now", level },
    ],
    ...thresholds,
    status: riverStatus(level, thresholds),
    marikina: MARIKINA_STATIONS.includes(s.obscd),
  };
}

const CA = [...rootCertificates, GLOBALSIGN_GCC_R46_OV_2025];

/** fetch() can't take extra CAs, so this uses node:https with the full chain. */
function getJson<T>(url: string, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const req = get(
      url,
      { ca: CA, headers: { Accept: "application/json", "User-Agent": "BetterMarikina/1.0" } },
      (res) => {
        if (res.statusCode !== 200) {
          res.resume();
          reject(new Error(`PAGASA returned ${res.statusCode}`));
          return;
        }
        let body = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(body) as T);
          } catch {
            reject(new Error("PAGASA returned invalid JSON"));
          }
        });
      },
    );
    req.setTimeout(timeoutMs, () => req.destroy(new Error("PAGASA request timed out")));
    req.on("error", reject);
  });
}

export type RiverResult =
  | { ok: true; stations: RiverStation[]; fetchedAt: string }
  | { ok: false; error: string };

/** Never throws; a failure is cached only briefly ("retry"). */
export async function getRiverLevels(): Promise<RiverResult> {
  "use cache";
  try {
    const json = await getJson<RawStation[]>(FFWS_URL, 10_000);
    const stations = json.map(normalize).sort((a, b) => {
      const ai = MARIKINA_STATIONS.indexOf(a.id);
      const bi = MARIKINA_STATIONS.indexOf(b.id);
      return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi) || a.name.localeCompare(b.name);
    });
    cacheLife("river");
    return { ok: true, stations, fetchedAt: new Date().toISOString() };
  } catch (e) {
    cacheLife("retry");
    return { ok: false, error: e instanceof Error ? e.message : "Request failed" };
  }
}
