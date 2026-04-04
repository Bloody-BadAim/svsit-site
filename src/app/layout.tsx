import type { Metadata, Viewport } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const bigShoulders = localFont({
  src: "../fonts/BigShouldersDisplay-latin.woff2",
  variable: "--font-big-shoulders",
  display: "swap",
  weight: "700 800",
});


export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "{SIT} — Studievereniging ICT",
  metadataBase: "https://svsit.nl",
  description:
    "De studievereniging voor HBO-ICT studenten aan de Hogeschool van Amsterdam. Door studenten. Voor studenten. In tech.",
  openGraph: {
    title: "{SIT} — Studievereniging ICT",
    description:
      "De studievereniging voor HBO-ICT studenten aan de HvA. Events, community, en alles wat je studietijd beter maakt.",
    siteName: "{SIT}",
    locale: "nl_NL",
    type: "website",
    url: "https://svsit.nl",
  },
  twitter: {
    card: "summary_large_image",
    title: "{SIT} — Studievereniging ICT",
    description:
      "De studievereniging voor HBO-ICT studenten aan de HvA. Events, community, en alles wat je studietijd beter maakt.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="nl"
      className={cn("antialiased", geistSans.variable, jetbrainsMono.variable, bigShoulders.variable, "font-mono")}
      suppressHydrationWarning
    >
      <head />
      <body>
        {/* Skip link for keyboard navigation */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[var(--color-accent-gold)] focus:text-[var(--color-bg)] focus:font-bold focus:text-sm"
        >
          Ga naar hoofdinhoud
        </a>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
