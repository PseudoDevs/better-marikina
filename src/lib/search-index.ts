import { barangays, hotlines, offices, services, slugify, tourism } from "./data";

export type SearchItem = { title: string; href: string; kind: string; text: string };

export const searchIndex: SearchItem[] = [
  ...services.map((s) => ({
    title: s.name,
    href: `/services/${s.id}`,
    kind: "Service",
    text: `${s.name} ${s.office} ${s.requirements.join(" ")}`,
  })),
  ...barangays.map((b) => ({
    title: `Barangay ${b.name}`,
    href: `/barangays/${slugify(b.name)}`,
    kind: `District ${b.district}`,
    text: `${b.name} barangay ${b.zip}`,
  })),
  ...hotlines.map((h) => ({
    title: h.name,
    href: "/hotlines",
    kind: "Hotline",
    text: `${h.name} ${h.category} ${h.numbers.join(" ")}`,
  })),
  ...offices.map((o) => ({
    title: o.name,
    href: "/government#offices",
    kind: "Office",
    text: `${o.name} ${o.phone.join(" ")}`,
  })),
  ...tourism.map((t) => ({
    title: t.name,
    href: "/tourism",
    kind: "Visit",
    text: `${t.name} ${t.location ?? ""} ${t.description}`,
  })),
  { title: "Projects & procurement", href: "/projects", kind: "Transparency", text: "projects proyekto bids bidding award contract infrastructure procurement kontrata" },
  { title: "City budget & financial reports", href: "/transparency", kind: "Transparency", text: "budget badyet full disclosure finances utang debt expenditures sef ldrrmf gad" },
  { title: "Ordinances & resolutions", href: "/ordinances", kind: "Transparency", text: "ordinance ordinansa resolution batas law city council sangguniang" },
  { title: "City news releases", href: "/news", kind: "News", text: "news balita announcement anunsyo updates pio" },
  { title: "Our City: history of Marikina", href: "/our-city", kind: "About", text: "history kasaysayan shoe capital kapitan moy geography location land area our city" },
  { title: "City officials", href: "/government", kind: "Government", text: "mayor vice mayor councilor konsehal congressman officials teodoro" },
  { title: "Marikina River water level", href: "/flood", kind: "Live", text: "flood baha river level alarm sto nino evacuation" },
  { title: "Weather forecast", href: "/weather", kind: "Live", text: "weather panahon rain ulan typhoon bagyo forecast air quality" },
  { title: "Earthquakes near Marikina", href: "/weather#earthquakes", kind: "Live", text: "earthquake lindol phivolcs" },
  { title: "Map of hospitals, schools and police", href: "/map", kind: "Map", text: "map hospital school police fire evacuation clinic" },
];
