import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "{SIT} — Studievereniging ICT",
  description:
    "De studievereniging voor HBO-ICT studenten aan de Hogeschool van Amsterdam. Door studenten. Voor studenten. In tech.",
  icons: {
    icon: "/icon.svg",
  },
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
      className={`${geistSans.variable} ${jetbrainsMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        {/* Skip link for keyboard navigation */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[var(--color-accent-gold)] focus:text-[var(--color-bg)] focus:font-bold focus:text-sm"
        >
          Ga naar hoofdinhoud
        </a>
        {children}
      </body>
    </html>
  );
}
