import type { Metadata } from "next";
import { Suspense } from "react";
import { riverAlarmLevels } from "@/lib/data";
import { getRiverLevels, STO_NINO } from "@/lib/live/river";
import { Gauge, StatusBadge, STATUS_META, Trend } from "@/components/river";
import { Card, PageHeader, Section, SkeletonBlock, Unavailable } from "@/components/ui";

export const metadata: Metadata = {
  title: "Flood watch — Marikina River water level",
  description:
    "Live Marikina River water level at Sto. Niño and upstream gauges from PAGASA, with the city's alarm levels.",
};

export default function FloodPage() {
  return (
    <>
      <PageHeader eyebrow="Flood watch" title="Marikina River water level">
        Readings from PAGASA&apos;s Pasig–Marikina–Tullahan flood warning system,
        refreshed every 5 minutes. Rain in Rizal reaches Marikina hours later, so
        watch the upstream gauges too.
      </PageHeader>
      <Suspense
        fallback={
          <Section>
            <SkeletonBlock className="h-80" />
          </Section>
        }
      >
        <RiverReadings />
      </Suspense>

      <Section title="What the alarms mean">
        <ol className="grid gap-3 md:grid-cols-4">
          {riverAlarmLevels.map((a) => (
            <li key={a.heightM}>
              <Card className="h-full">
                <p className="font-display text-3xl font-bold tabular-nums">{a.heightM} m</p>
                <p className="mt-1 font-semibold">{a.name}</p>
                <p className="mt-2 text-sm text-ink-muted">{a.meaning}</p>
              </Card>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-sm text-ink-muted">
          Measured at the Sto. Niño gauge. Sources differ on whether 17 m or 18 m
          triggers the third alarm; follow announcements from Marikina CDRRMO and
          Rescue 161.
        </p>
      </Section>

      <Section title="If the river is rising">
        <Card>
          <ul className="list-disc space-y-2 pl-5">
            <li>Prepare a go-bag: water, food for 3 days, medicine, IDs in a plastic bag, flashlight, power bank.</li>
            <li>Move vehicles and valuables to higher ground at the first alarm.</li>
            <li>Leave early if you live along the riverbanks or in a low-lying area — don&apos;t wait for the forced-evacuation alarm.</li>
            <li>Never cross floodwater. 15 cm of fast water can knock you down.</li>
            <li>Call <a href="tel:161" className="font-semibold text-danger underline">161</a> for rescue.</li>
          </ul>
        </Card>
      </Section>
    </>
  );
}

async function RiverReadings() {
  const data = await getRiverLevels();
  if (!data.ok)
    return (
      <Section>
        <Unavailable
          what="River data"
          href="https://pasig-marikina-tullahanffws.pagasa.dost.gov.ph/"
          linkLabel="PAGASA FFWS"
        />
      </Section>
    );

  const sto = data.stations.find((s) => s.id === STO_NINO);
  const marikina = data.stations.filter((s) => s.marikina && s.id !== STO_NINO);
  const others = data.stations.filter((s) => !s.marikina);

  return (
    <>
      {sto && (
        <Section>
          <Card>
            <div className="flex flex-col gap-8 sm:flex-row sm:items-center">
              <Gauge station={sto} />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="font-semibold">Sto. Niño gauge</h2>
                  <StatusBadge status={sto.status} />
                </div>
                <p className="font-display mt-2 text-6xl font-bold tabular-nums">
                  {sto.level?.toFixed(2) ?? "—"}
                  <span className="ml-1 text-2xl text-ink-muted">m</span>
                </p>
                <Trend change={sto.change} />
                <p className="mt-3 text-lg">{STATUS_META[sto.status].advice}</p>
                <p className="mt-2 text-sm text-ink-muted">As of {sto.time}</p>
              </div>
              <History history={sto.history} />
            </div>
          </Card>
        </Section>
      )}
      <Section title="Marikina River gauges (upstream → downstream)">
        <StationTable stations={marikina} />
      </Section>
      <Section title="Other Pasig–Marikina–Tullahan stations">
        <StationTable stations={others} />
      </Section>
    </>
  );
}

function History({ history }: { history: { label: string; level: number | null }[] }) {
  return (
    <div className="sm:w-56">
      <p className="text-sm font-semibold text-ink-muted">Last 2 hours</p>
      <ul className="mt-2 space-y-1 text-sm">
        {history.map((h) => (
          <li key={h.label} className="flex justify-between tabular-nums">
            <span className="text-ink-muted">{h.label}</span>
            <span>{h.level?.toFixed(2) ?? "—"} m</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StationTable({
  stations,
}: {
  stations: Awaited<ReturnType<typeof getRiverLevels>> extends infer R
    ? R extends { ok: true; stations: infer S } ? S : never
    : never;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-surface">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="bg-surface-2 text-left text-ink-muted">
          <tr>
            <th className="px-4 py-2.5 font-semibold">Station</th>
            <th className="px-4 py-2.5 text-right font-semibold">Level</th>
            <th className="px-4 py-2.5 text-right font-semibold">Change</th>
            <th className="px-4 py-2.5 text-right font-semibold">Alert / Alarm / Critical</th>
            <th className="px-4 py-2.5 font-semibold">Status</th>
            <th className="px-4 py-2.5 font-semibold">Time</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {stations.map((s) => (
            <tr key={s.id}>
              <td className="px-4 py-2.5 font-medium">{s.name}</td>
              <td className="px-4 py-2.5 text-right tabular-nums">
                {s.level?.toFixed(2) ?? "—"} m
                {s.suspect && <span className="ml-1 text-warn" title="Unvalidated reading">*</span>}
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums text-ink-muted">
                {s.change === null ? "—" : `${s.change > 0 ? "+" : ""}${s.change.toFixed(2)}`}
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums text-ink-muted">
                {s.alert === null ? "—" : `${s.alert} / ${s.alarm ?? "—"} / ${s.critical ?? "—"}`}
              </td>
              <td className="px-4 py-2.5"><StatusBadge status={s.status} /></td>
              <td className="px-4 py-2.5 tabular-nums text-ink-muted">{s.time.slice(11)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
