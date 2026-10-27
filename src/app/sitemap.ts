import type { MetadataRoute } from "next";
import { barangays, services, slugify } from "@/lib/data";
import { snapshotNewsIds } from "@/lib/live/citygov";

const BASE = "https://bettermarikina.org";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/services", "/hotlines", "/flood", "/weather", "/government", "/barangays", "/map", "/tourism", "/about", "/projects", "/transparency", "/ordinances", "/news", "/our-city"];
  return [
    ...pages.map((p) => ({ url: BASE + p })),
    ...snapshotNewsIds().map((id) => ({ url: `${BASE}/news/${id}` })),
    ...services.map((s) => ({ url: `${BASE}/services/${s.id}` })),
    ...barangays.map((b) => ({ url: `${BASE}/barangays/${slugify(b.name)}` })),
  ];
}
