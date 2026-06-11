import type { Metadata, Viewport } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import dynamic from "next/dynamic";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ToastProvider } from "@/components/Toast";
import { SITE_CONFIG } from "@/lib/constants";

// Non-critical UI enhancement: HUD cursor, fine-pointer devices only
const CustomCursor = dynamic(() => import("@/components/CustomCursor"));

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
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

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const isEn = locale === "en";
  const title = "{SIT} - Studievereniging ICT";
  const description = isEn
    ? "The student association for HBO-ICT students at Amsterdam University of Applied Sciences. By students. For students. In tech."
    : "De studievereniging voor HBO-ICT studenten aan de Hogeschool van Amsterdam. Door studenten. Voor studenten. In tech.";
  const ogDescription = isEn
    ? "The student association for HBO-ICT students at the HvA. Events, community, and everything that makes your study time better."
    : "De studievereniging voor HBO-ICT studenten aan de HvA. Events, community, en alles wat je studietijd beter maakt.";
  return {
    title,
    metadataBase: new URL("https://svsit.nl"),
    description,
    openGraph: {
      title,
      description: ogDescription,
      siteName: "{SIT}",
      locale: isEn ? "en_US" : "nl_NL",
      type: "website",
      url: "https://svsit.nl",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: ogDescription,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  const t = await getTranslations("common");
  return (
    <html
      lang={locale}
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
          {t("skipToContent")}
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "SIT - Studievereniging ICT",
              alternateName: "SIT",
              url: "https://svsit.nl",
              logo: "https://svsit.nl/icon.svg",
              description:
                "De studievereniging voor HBO-ICT studenten aan de Hogeschool van Amsterdam.",
              foundingDate: "2014",
              email: SITE_CONFIG.email,
              sameAs: [
                SITE_CONFIG.socials.instagram.url,
                SITE_CONFIG.socials.tiktok.url,
                SITE_CONFIG.socials.linkedin.url,
                SITE_CONFIG.socials.discord.url,
              ],
              parentOrganization: {
                "@type": "EducationalOrganization",
                name: "Hogeschool van Amsterdam",
                url: "https://www.hva.nl",
              },
            }),
          }}
        />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ToastProvider>
            {children}
          </ToastProvider>
        </NextIntlClientProvider>
        <CustomCursor />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
