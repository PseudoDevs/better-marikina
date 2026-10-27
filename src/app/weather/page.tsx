import type { Metadata } from "next";
import { Suspense } from "react";
import { Forecast, QuakeList, WeatherCard } from "@/components/weather";
import { PageHeader, Section, SkeletonBlock } from "@/components/ui";

export const metadata: Metadata = {
  title: "Weather & earthquakes",
  description: "Marikina City weather forecast, air quality and recent earthquakes nearby.",
};

export default function WeatherPage() {
  return (
    <>
      <PageHeader eyebrow="Weather" title="Weather, air & earthquakes">
        Forecasts from Open-Meteo for Marikina. For typhoon signals and rainfall
        warnings, PAGASA is the official source.
      </PageHeader>
      <Section>
        <div className="grid gap-5 lg:grid-cols-[1fr_2fr]">
          <Suspense fallback={<SkeletonBlock className="h-80" />}>
            <WeatherCard />
          </Suspense>
          <div className="space-y-3 self-start rounded-xl border border-line bg-surface p-5 text-sm">
            <p className="font-semibold">Official warnings</p>
            <ul className="space-y-2">
              <li><a className="text-brand hover:underline" href="https://www.pagasa.dost.gov.ph/weather/weather-advisory">PAGASA weather advisories →</a></li>
              <li><a className="text-brand hover:underline" href="https://www.pagasa.dost.gov.ph/tropical-cyclone/severe-weather-bulletin">Tropical cyclone bulletins →</a></li>
              <li><a className="text-brand hover:underline" href="https://www.pagasa.dost.gov.ph/regional-forecast/ncrprsd">Rainfall warnings (NCR) →</a></li>
              <li><a className="text-brand hover:underline" href="https://noah.up.edu.ph">Project NOAH hazard maps →</a></li>
            </ul>
          </div>
        </div>
      </Section>
      <Section title="Forecast">
        <Suspense fallback={<SkeletonBlock className="h-72" />}>
          <Forecast />
        </Suspense>
      </Section>
      <Section title="Recent earthquakes within 300 km" id="earthquakes">
        <p className="-mt-3 mb-4 text-sm text-ink-muted">
          Magnitude 3+ from USGS. Marikina sits on the West Valley Fault — see{" "}
          <a href="https://www.phivolcs.dost.gov.ph" className="text-brand underline">PHIVOLCS</a>{" "}
          for official local bulletins.
        </p>
        <Suspense fallback={<SkeletonBlock className="h-80" />}>
          <QuakeList />
        </Suspense>
      </Section>
    </>
  );
}
