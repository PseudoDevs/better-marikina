"use client";

import dynamic from "next/dynamic";
import { SkeletonBlock } from "./ui";

// Leaflet touches `window` on import, so it only loads in the browser.
export const CityMapLoader = dynamic(
  () => import("./city-map").then((m) => m.CityMap),
  { ssr: false, loading: () => <SkeletonBlock className="h-[70vh] min-h-96" /> },
);
