import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Public_Sans } from "next/font/google";
import { HotlineBar } from "@/components/hotline-bar";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

const body = Public_Sans({ variable: "--font-body", subsets: ["latin"] });
const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://bettermarikina.org"),
  title: {
    default: "Better Marikina — services, hotlines and live river levels",
    template: "%s · Better Marikina",
  },
  description:
    "An unofficial, community-built guide to Marikina City: government services, emergency hotlines, barangays, officials, and live Marikina River and weather data.",
  openGraph: { siteName: "Better Marikina", locale: "en_PH", type: "website" },
};

export const viewport: Viewport = {
  themeColor: "#00508a",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${body.variable} ${display.variable}`}>
      <body className="min-h-dvh flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-surface focus:px-3 focus:py-2"
        >
          Skip to content
        </a>
        <HotlineBar />
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
