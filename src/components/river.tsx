import Link from "next/link";
import { ArrowDownRight, ArrowRight, ArrowUpRight, Waves } from "lucide-react";
import {
  getRiverLevels,
  STO_NINO,
  type RiverStation,
  type RiverStatus,
} from "@/lib/live/river";
import { Card, Unavailable } from "./ui";

export const STATUS_META: Record<
  RiverStatus,
  { label: string; badge: string; bar: string; advice: string }
> = {
  normal: {
    label: "Normal",
    badge: "bg-ok-soft text-ok",
    bar: "bg-ok",
    advice: "No flood alarm in effect.",
  },
  alert: {
    label: "1st alarm",
    badge: "bg-warn-soft text-warn",
    bar: "bg-warn",
    advice: "Alert. Prepare for possible evacuation and monitor updates.",
  },
  alarm: {
    label: "2nd alarm",
    badge: "bg-alarm-soft text-alarm",
    bar: "bg-alarm",
    advice: "Prepare to evacuate. Residents of low-lying areas should move now.",
  },
  critical: {
    label: "Critical",
    badge: "bg-danger-soft text-danger",
    bar: "bg-danger",
    advice: "Evacuate. Follow instructions from Rescue 161 and barangay officials.",
  },
  unknown: {
    label: "No thresholds",
    badge: "bg-surface-2 text-ink-muted",
    bar: "bg-ink-muted",
    advice: "",
  },
};

export function StatusBadge({ status }: { status: RiverStatus }) {
  const m = STATUS_META[status];
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${m.badge}`}>
      {m.label}
    </span>
  );
}

export function Trend({ change }: { change: number | null }) {
  if (change === null) return null;
  const Icon = change > 0.005 ? ArrowUpRight : change < -0.005 ? ArrowDownRight : ArrowRight;
  const word = change > 0.005 ? "rising" : change < -0.005 ? "falling" : "steady";
  return (
    <span className="inline-flex items-center gap-1 text-sm text-ink-muted">
      <Icon className="size-4" aria-hidden />
      {word} {change !== 0 && `${change > 0 ? "+" : ""}${change.toFixed(2)} m`}
    </span>
  );
}

/** Vertical gauge with threshold ticks; range fixed so changes are visible. */
export function Gauge({ station }: { station: RiverStation }) {
  const lo = Math.min(10, (station.level ?? 10) - 1);
  const hi = Math.max((station.critical ?? 18) + 1.5, (station.level ?? 0) + 0.5);
  const pct = (v: number) => ((v - lo) / (hi - lo)) * 100;
  const ticks = [
    { v: station.alert, label: "1st" },
    { v: station.alarm, label: "2nd" },
    { v: station.critical, label: "Crit." },
  ].filter((t): t is { v: number; label: string } => t.v !== null);

  return (
    <div className="relative h-44 w-16 shrink-0" role="img"
      aria-label={`Water level ${station.level?.toFixed(2) ?? "unknown"} metres`}>
      <div className="absolute inset-y-0 left-0 w-6 overflow-hidden rounded-md border border-line bg-surface-2">
        {station.level !== null && (
          <div
            className={`absolute inset-x-0 bottom-0 ${STATUS_META[station.status].bar} opacity-80 transition-[height]`}
            style={{ height: `${Math.min(100, Math.max(0, pct(station.level)))}%` }}
          />
        )}
      </div>
      {ticks.map((t) => (
        <div
          key={t.label}
          className="absolute left-0 flex w-full items-center"
          style={{ bottom: `${pct(t.v)}%` }}
        >
          <span className="h-px w-7 bg-ink" />
          <span className="ml-1 text-[10px] leading-none text-ink-muted">
            {t.label} {t.v}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Homepage card: Sto. Niño gauge plus upstream stations. */
export async function RiverCard() {
  const data = await getRiverLevels();
  if (!data.ok)
    return (
      <Unavailable
        what="Marikina River data"
        href="https://pasig-marikina-tullahanffws.pagasa.dost.gov.ph/"
        linkLabel="PAGASA FFWS"
      />
    );
  const sto = data.stations.find((s) => s.id === STO_NINO);
  const upstream = data.stations.filter(
    (s) => s.marikina && s.id !== STO_NINO && s.alert !== null,
  );

  return (
    <Card className="h-full">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-semibold text-ink-muted">
          <Waves className="size-4 text-brand" aria-hidden /> Marikina River · Sto. Niño
        </p>
        {sto && <StatusBadge status={sto.status} />}
      </div>
      {sto ? (
        <div className="mt-4 flex gap-6">
          <Gauge station={sto} />
          <div className="min-w-0">
            <p className="font-display text-5xl font-bold tabular-nums">
              {sto.level?.toFixed(2) ?? "—"}
              <span className="ml-1 text-xl font-semibold text-ink-muted">m</span>
            </p>
            <Trend change={sto.change} />
            <p className="mt-3 text-sm">{STATUS_META[sto.status].advice}</p>
            <p className="mt-3 text-xs text-ink-muted">
              As of {sto.time} · PAGASA FFWS
              {sto.suspect && " · reading flagged as unvalidated"}
            </p>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-ink-muted">Sto. Niño gauge not in the latest feed.</p>
      )}
      {upstream.length > 0 && (
        <div className="mt-5 border-t border-line pt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Upstream — water reaches Marikina after these
          </p>
          <ul className="mt-2 divide-y divide-line text-sm">
            {upstream.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 py-1.5">
                <span>{s.name}</span>
                <span className="flex items-center gap-2 tabular-nums">
                  {s.level?.toFixed(2) ?? "—"} m <StatusBadge status={s.status} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <Link href="/flood" className="mt-4 inline-block text-sm font-semibold text-brand hover:underline">
        Full flood watch →
      </Link>
    </Card>
  );
}
