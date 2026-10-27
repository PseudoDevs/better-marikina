import type { Metadata } from "next";
import { Suspense } from "react";
import { getAmenities, SNAPSHOT_DATE } from "@/lib/live/amenities";
import { getRiverLevels } from "@/lib/live/river";
import { CityMapLoader } from "@/components/city-map-loader";
import { PageHeader, Section, SkeletonBlock } from "@/components/ui";

export const metadata: Metadata = {
  title: "Map",
  description: "Hospitals, clinics, police, fire stations, shelters and river gauges in Marikina.",
};

export default function MapPage() {
  return (
    <>
      <PageHeader eyebrow="Map" title="Marikina on a map">
        Hospitals, police and fire stations, shelters and river gauges. Places come
        from OpenStreetMap — if something is missing or wrong, you can fix it there.
      </PageHeader>
      <Section>
        <Suspense fallback={<SkeletonBlock className="h-[70vh] min-h-96" />}>
          <MapData />
        </Suspense>
        <p className="mt-3 text-sm text-ink-muted">
          Evacuation centers are not fully mapped in OpenStreetMap. Ask your barangay
          hall or Marikina CDRRMO for your assigned center.
        </p>
      </Section>
    </>
  );
}

async function MapData() {
  const [{ amenities, live }, river] = await Promise.all([getAmenities(), getRiverLevels()]);
  const gauges = river.ok
    ? river.stations
        .filter((s) => s.marikina && s.lat !== null && s.lon !== null)
        .map((s) => ({ id: s.id, name: s.name, lat: s.lat!, lon: s.lon!, level: s.level, status: s.status }))
    : [];
  return (
    <>
      {!live && (
        <p className="mb-3 text-sm text-ink-muted">
          OpenStreetMap is slow to respond, so places are from the {SNAPSHOT_DATE} snapshot.
        </p>
      )}
      <CityMapLoader amenities={amenities} river={gauges} />
    </>
  );
}
