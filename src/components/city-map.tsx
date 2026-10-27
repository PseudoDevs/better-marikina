"use client";

import "leaflet/dist/leaflet.css";
import { useMemo, useState } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import type { Amenity, AmenityKind } from "@/lib/live/amenities";

export type RiverPoint = { id: string; name: string; lat: number; lon: number; level: number | null; status: string };

const KINDS: { kind: AmenityKind; label: string; color: string }[] = [
  { kind: "hospital", label: "Hospitals", color: "#c0392b" },
  { kind: "clinic", label: "Clinics", color: "#e67e22" },
  { kind: "police", label: "Police", color: "#2c3e9e" },
  { kind: "fire_station", label: "Fire stations", color: "#b8460b" },
  { kind: "shelter", label: "Shelters", color: "#009228" },
  { kind: "school", label: "Schools", color: "#7d5ba6" },
  { kind: "townhall", label: "Government", color: "#00508a" },
];

export function CityMap({ amenities, river }: { amenities: Amenity[]; river: RiverPoint[] }) {
  const [shown, setShown] = useState<Set<AmenityKind>>(
    () => new Set(["hospital", "police", "fire_station", "shelter", "townhall"]),
  );
  const visible = useMemo(() => amenities.filter((a) => shown.has(a.kind)), [amenities, shown]);
  const counts = useMemo(() => {
    const c = new Map<AmenityKind, number>();
    for (const a of amenities) c.set(a.kind, (c.get(a.kind) ?? 0) + 1);
    return c;
  }, [amenities]);

  const toggle = (k: AmenityKind) =>
    setShown((s) => {
      const n = new Set(s);
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });

  return (
    <div>
      <fieldset className="mb-4 flex flex-wrap gap-2">
        <legend className="sr-only">Show on map</legend>
        {KINDS.map((k) => (
          <label
            key={k.kind}
            className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-line bg-surface px-3 text-sm has-[:checked]:border-ink"
          >
            <input type="checkbox" checked={shown.has(k.kind)} onChange={() => toggle(k.kind)} className="sr-only" />
            <span className="size-3 rounded-full" style={{ background: shown.has(k.kind) ? k.color : "transparent", border: `2px solid ${k.color}` }} />
            {k.label} <span className="text-ink-muted">{counts.get(k.kind) ?? 0}</span>
          </label>
        ))}
      </fieldset>
      <div className="h-[70vh] min-h-96 overflow-hidden rounded-xl border border-line">
        <MapContainer center={[14.6507, 121.1029]} zoom={14} scrollWheelZoom className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {visible.map((a) => {
            const color = KINDS.find((k) => k.kind === a.kind)!.color;
            return (
              <CircleMarker key={a.id} center={[a.lat, a.lon]} radius={7}
                pathOptions={{ color: "#fff", weight: 2, fillColor: color, fillOpacity: 0.95 }}>
                <Popup>
                  <strong>{a.name}</strong>
                  {a.address && <><br />{a.address}</>}
                  <br />
                  <a href={`https://www.openstreetmap.org/${a.id}`} target="_blank" rel="noreferrer">View on OSM</a>
                </Popup>
              </CircleMarker>
            );
          })}
          {river.map((r) => (
            <CircleMarker key={r.id} center={[r.lat, r.lon]} radius={10}
              pathOptions={{ color: "#006fae", weight: 3, fillColor: "#009aeb", fillOpacity: 0.9 }}>
              <Popup>
                <strong>{r.name} river gauge</strong>
                <br />
                {r.level?.toFixed(2) ?? "—"} m · {r.status}
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
