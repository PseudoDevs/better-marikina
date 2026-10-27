import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Officials' photos and news images hosted by the City Government
    remotePatterns: [{ protocol: "https", hostname: "www.marikina.gov.ph", pathname: "/images/**" }],
  },
  // Lifetimes for the live public feeds (seconds). River and quake feeds
  // update every few minutes; weather hourly; OSM amenities rarely.
  cacheLife: {
    river: { stale: 60, revalidate: 300, expire: 3600 },
    quakes: { stale: 60, revalidate: 300, expire: 3600 },
    weather: { stale: 300, revalidate: 900, expire: 7200 },
    daily: { stale: 3600, revalidate: 86400, expire: 604800 },
    // City transparency portal: notices are posted a few times a week.
    portal: { stale: 3600, revalidate: 21600, expire: 172800 },
    // A failed upstream request: refetch in the background after a minute.
    // Expire stays above 5 minutes so the result can still be prerendered.
    retry: { stale: 30, revalidate: 60, expire: 600 },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
