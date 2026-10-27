import type { Metadata } from "next";
import Image from "next/image";
import { offices, overview, telHref } from "@/lib/data";
import { imageUrl, ourCity, SNAPSHOT_DATE, type CityOfficial } from "@/lib/live/citygov";
import { Card, PageHeader, Section } from "@/components/ui";

export const metadata: Metadata = {
  title: "Government",
  description: "Marikina City elected officials (2025–2028) and department contact numbers.",
};

export default function GovernmentPage() {
  const { officials } = ourCity;
  const executive = officials.filter((o) => o.role === "Mayor" || o.role === "Vice Mayor");
  const reps = officials.filter((o) => o.role === "Representative");
  const council = (d: number) => officials.filter((o) => o.role === "Councilor" && o.district === d);

  return (
    <>
      <PageHeader eyebrow="Government" title="Who runs the city">
        Elected officials for the 2025–2028 term and the offices that handle your
        transactions.
      </PageHeader>

      <Section title="Executive">
        <div className="grid gap-4 sm:grid-cols-2">
          {executive.map((o) => (
            <OfficialCard key={o.name} o={o} large />
          ))}
        </div>
      </Section>

      <Section title="City Council (Sangguniang Panlungsod)">
        {[1, 2].map((d) => (
          <div key={d} className="mb-8">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-ink-muted">
              District {d}
            </h3>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {council(d).map((o) => (
                <li key={o.name}>
                  <OfficialCard o={o} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Section>

      <Section title="House of Representatives">
        <div className="grid gap-4 sm:grid-cols-2">
          {reps.map((o) => (
            <OfficialCard key={o.name} o={o} large />
          ))}
        </div>
        <p className="mt-4 text-sm text-ink-muted">
          Names and photos from the City Government&apos;s{" "}
          <a href="https://www.marikina.gov.ph/our-city" className="text-brand underline">
            Our City
          </a>{" "}
          page, copied {SNAPSHOT_DATE}.
        </p>
      </Section>

      <Section title="City offices" id="offices">
        <Card className="!p-0">
          <ul className="divide-y divide-line">
            {offices.map((o) => (
              <li key={o.name} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 py-3">
                <span className="font-medium">{o.name}</span>
                <span className="flex flex-wrap gap-3">
                  {o.phone.map((p) => (
                    <a key={p} href={telHref(p)} className="tabular-nums text-brand hover:underline">
                      {p}
                    </a>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </Card>
        <p className="mt-3 text-sm text-ink-muted">
          City Hall: {overview.cityHall.address} · {overview.cityHall.phone} ·{" "}
          {overview.cityHall.email} · {overview.cityHall.hours}
        </p>
      </Section>
    </>
  );
}

function OfficialCard({ o, large }: { o: CityOfficial; large?: boolean }) {
  const photo = imageUrl(o.photo);
  const title =
    o.role === "Representative" ? `Representative, District ${o.district}` : (o.role ?? "");
  return (
    <Card className={`h-full ${large ? "flex items-center gap-5" : "!p-4 text-center"}`}>
      <div
        className={`relative shrink-0 overflow-hidden rounded-full bg-surface-2 ${
          large ? "size-24" : "mx-auto size-20"
        }`}
      >
        {photo && (
          <Image src={photo} alt="" fill sizes="96px" className="object-cover object-top" />
        )}
      </div>
      <div className={large ? "" : "mt-3"}>
        <p className="text-sm text-ink-muted">{title}</p>
        <p className={`font-semibold ${large ? "font-display mt-0.5 text-xl" : "mt-0.5 text-sm"}`}>
          {o.name}
        </p>
      </div>
    </Card>
  );
}
