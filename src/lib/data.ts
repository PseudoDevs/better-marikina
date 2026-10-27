import raw from "@/data/marikina.json";

export type Barangay = {
  name: string;
  district: 1 | 2;
  psgc: string;
  psgc10: string;
  population2020: number;
  areaHa: number;
  zip: string;
  phone?: string;
};

export type Hotline = { name: string; numbers: string[]; category: string };
export type Office = { name: string; phone: string[] };

export type Service = {
  id: string;
  name: string;
  office: string;
  requirements: string[];
  notes?: string;
  verified: boolean;
};

export type Place = { name: string; location?: string; description: string };
export type TimelineEvent = { year: string | number; event: string };
export type AlarmLevel = {
  level: number | null;
  heightM: number;
  name: string;
  meaning: string;
};

const data = raw as unknown as {
  overview: typeof raw.overview;
  barangays: Barangay[];
  hotlines: Hotline[];
  offices: Office[];
  services: Service[];
  tourism: Place[];
  timeline: TimelineEvent[];
  riverAlarmLevels: AlarmLevel[];
  sources: string[];
};

export const overview = data.overview;
export const barangays = [...data.barangays].sort((a, b) =>
  a.name.localeCompare(b.name),
);
export const hotlines = data.hotlines;
export const offices = data.offices;
export const services = data.services.map((s) => ({
  ...s,
  requirements: s.requirements ?? [],
}));
export const tourism = data.tourism;
export const timeline = data.timeline;
export const riverAlarmLevels = data.riverAlarmLevels;
export const sources = data.sources;

export function slugify(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function getBarangay(slug: string) {
  return barangays.find((b) => slugify(b.name) === slug);
}

export function getService(id: string) {
  return services.find((s) => s.id === id);
}

/** Phone numbers in the source mix 7-digit Metro Manila landlines and mobiles. */
export function telHref(n: string) {
  const first = n.split(/\s+to\s+/i)[0];
  let digits = first.replace(/[^0-9]/g, "");
  if (digits.length === 7) digits = "028" + digits; // old 7-digit NCR landline
  else if (digits.length === 8 && digits.startsWith("8")) digits = "02" + digits;
  return `tel:${digits}`;
}
