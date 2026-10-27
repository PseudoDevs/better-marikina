import Link from "next/link";
import { Suspense } from "react";
import {
  Building2,
  FileText,
  HeartPulse,
  Landmark,
  Map,
  Phone,
  Receipt,
  Users,
} from "lucide-react";
import { overview, services } from "@/lib/data";
import { searchIndex } from "@/lib/search-index";
import { RiverCard } from "@/components/river";
import { WeatherCard } from "@/components/weather";
import { SiteSearch } from "@/components/site-search";
import { LatestProjects } from "@/components/latest-projects";
import { Card, Section, SkeletonBlock } from "@/components/ui";

const POPULAR = [
  { label: "Business permit", href: "/services/business-permit" },
  { label: "Birth certificate", href: "/services/civil-registry" },
  { label: "Real property tax", href: "/services/rpt" },
  { label: "Senior citizen ID", href: "/services/senior-id" },
  { label: "River level", href: "/flood" },
];

const SERVICE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "business-permit": Building2,
  cedula: Receipt,
  "civil-registry": FileText,
  rpt: Landmark,
  "building-permit": Building2,
  "barangay-clearance": FileText,
  "senior-id": Users,
  "pwd-id": HeartPulse,
  "solo-parent-id": Users,
  scholarship: FileText,
};

const fmt = new Intl.NumberFormat("en-PH");

export default function Home() {
  return (
    <>
      <section className="bg-brand-strong text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:py-16 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-white/80">
              Lungsod ng Marikina
            </p>
            <h1 className="font-display mt-3 text-4xl font-extrabold leading-[1.05] sm:text-6xl">
              City services, without the guesswork.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-white/85">
              Requirements, offices, hotlines and live Marikina River levels for
              Marikeños, all in one place.
            </p>
          </div>
          <SiteSearch items={searchIndex} popular={POPULAR} />
        </div>
      </section>

      <Section title="Right now">
        <div className="grid gap-5 md:grid-cols-2">
          <Suspense fallback={<SkeletonBlock className="h-96" />}>
            <RiverCard />
          </Suspense>
          <Suspense fallback={<SkeletonBlock className="h-96" />}>
            <WeatherCard />
          </Suspense>
        </div>
      </Section>

      <Section title="Common services" action={{ href: "/services", label: "All services" }}>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {services.slice(0, 6).map((s) => {
            const Icon = SERVICE_ICONS[s.id] ?? FileText;
            return (
              <li key={s.id}>
                <Link
                  href={`/services/${s.id}`}
                  className="group flex h-full gap-4 rounded-xl border border-line bg-surface p-5 hover:border-brand"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
                    <Icon className="size-5" />
                  </span>
                  <span>
                    <span className="block font-semibold group-hover:text-brand">{s.name}</span>
                    <span className="mt-1 block text-sm text-ink-muted">{s.office}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Section>

      <Section title="Latest city projects & bids" action={{ href: "/projects", label: "All projects" }}>
        <Suspense fallback={<SkeletonBlock className="h-80" />}>
          <LatestProjects />
        </Suspense>
        <p className="mt-3 text-sm text-ink-muted">
          From Marikina&apos;s Full Disclosure Policy Portal. See also the{" "}
          <Link href="/transparency" className="text-brand underline">budget and financial reports</Link>.
        </p>
      </Section>

      <Section title="Marikina at a glance" action={{ href: "/our-city", label: "Our City" }}>
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line lg:grid-cols-4">
          {[
            [fmt.format(overview.population), `Population (${overview.populationCensus})`],
            [`${overview.landAreaKm2} km²`, "Land area"],
            [String(overview.barangayCount), `Barangays in ${overview.districts} districts`],
            [overview.founded.slice(0, 4), `Founded · city since ${overview.cityhood.slice(0, 4)}`],
          ].map(([v, l]) => (
            <div key={l} className="bg-surface p-5">
              <dt className="text-sm text-ink-muted">{l}</dt>
              <dd className="font-display mt-1 text-3xl font-bold tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section>
        <div className="grid gap-5 md:grid-cols-3">
          <QuickLink href="/hotlines" icon={<Phone />} title="Emergency hotlines"
            text="Rescue 161, police, fire, hospitals — tap to call." />
          <QuickLink href="/government" icon={<Landmark />} title="Officials & offices"
            text="Mayor, council, district representatives and department numbers." />
          <QuickLink href="/map" icon={<Map />} title="City map"
            text="Hospitals, schools, police and fire stations from OpenStreetMap." />
        </div>
      </Section>

      <Section>
        <Card className="!bg-brand-soft !border-transparent">
          <p className="font-display text-xl font-bold">Doing an official transaction?</p>
          <p className="mt-2 text-ink-muted">
            Use the City Government&apos;s own channels for payments and applications.
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
            <a className="rounded-lg bg-brand px-4 py-2.5 text-white" href="https://www.marikina.gov.ph">
              marikina.gov.ph
            </a>
            <a className="rounded-lg border border-brand px-4 py-2.5 text-brand" href="https://fdpp.marikina.gov.ph/citizen-charter">
              Citizen&apos;s Charter
            </a>
          </div>
        </Card>
      </Section>
    </>
  );
}

function QuickLink({ href, icon, title, text }: { href: string; icon: React.ReactNode; title: string; text: string }) {
  return (
    <Link href={href} className="group rounded-xl border border-line bg-surface p-5 hover:border-brand">
      <span className="flex size-10 items-center justify-center rounded-lg bg-surface-2 text-brand [&>svg]:size-5" aria-hidden>
        {icon}
      </span>
      <p className="mt-4 font-semibold group-hover:text-brand">{title}</p>
      <p className="mt-1 text-sm text-ink-muted">{text}</p>
    </Link>
  );
}
