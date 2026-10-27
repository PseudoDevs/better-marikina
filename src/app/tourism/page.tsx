import type { Metadata } from "next";
import { MapPin } from "lucide-react";
import { tourism } from "@/lib/data";
import { Card, PageHeader, Section } from "@/components/ui";

export const metadata: Metadata = {
  title: "Visit Marikina",
  description: "Things to see in Marikina: the Shoe Museum, Marikina River Park, heritage churches and more.",
};

export default function TourismPage() {
  return (
    <>
      <PageHeader eyebrow="Visit" title="Things to see in the Shoe Capital">
        Heritage houses, a river park, and the shoemaking history that put Marikina
        on the map.
      </PageHeader>
      <Section>
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tourism.map((p) => (
            <li key={p.name}>
              <Card className="h-full">
                <h2 className="font-display text-xl font-bold">{p.name}</h2>
                {p.location && (
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-muted">
                    <MapPin className="size-3.5" aria-hidden /> {p.location}
                  </p>
                )}
                <p className="mt-3">{p.description}</p>
                <a
                  href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(p.name + ", Marikina")}`}
                  className="mt-3 inline-block text-sm font-semibold text-brand hover:underline"
                >
                  Directions →
                </a>
              </Card>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-ink-muted">
          Opening hours and fees change — check with the venue before visiting.
        </p>
      </Section>
    </>
  );
}
