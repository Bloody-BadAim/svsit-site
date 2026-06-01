import type { Metadata } from "next";
import Image from "next/image";
import { Cpu } from "lucide-react";
import Navbar from "@/components/Navbar";
import Moederbord from "@/components/Moederbord";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import HboIctVormtaal from "@/components/HboIctVormtaal";

export const metadata: Metadata = {
  title: "Het Moederbord - Bestuur & Commissies - {SIT}",
  description:
    "Het Moederbord: bestuur en commissies van SIT in één organigram. Bestuur XII is de kern, elke commissie een module die je kunt aansluiten. Sluit jezelf aan.",
  openGraph: {
    title: "Het Moederbord - Bestuur & Commissies - {SIT}",
    description:
      "Bestuur XII vormt de kern, elke commissie is een module. Ontdek de organisatie van SIT en sluit je aan.",
    siteName: "{SIT}",
    locale: "nl_NL",
    type: "website",
    url: "https://svsit.nl/over-ons",
  },
  twitter: {
    card: "summary_large_image",
    title: "Het Moederbord - Bestuur & Commissies - {SIT}",
    description:
      "Bestuur XII en de commissies van SIT als één moederbord. Sluit je aan.",
  },
  alternates: { canonical: "https://svsit.nl/over-ons" },
};

// Slanke HBO-ICT co-brand band tussen navbar en het organigram. pt-28/pt-32
// duwt de band ONDER de fixed navbar (zelfde offset-conventie als .cb-head in
// moederbord.css, padding-top clamp 88-128px). Compact en bold: wit HBO-ICT
// lockup links, gouden eyebrow + korte regel rechts, vormtaal als bold rand.
// Statisch -> eindstaat altijd zichtbaar, geen JS nodig.
function HboIctCoBrandStrip() {
  return (
    <section
      className="relative pt-28 md:pt-32 px-6 md:px-12 lg:px-24"
      aria-labelledby="overons-cobrand-heading"
    >
      <div className="relative flex items-stretch border border-[var(--color-border)] bg-[var(--color-surface)]/60 overflow-hidden min-h-[100px] md:min-h-[120px]">
        {/* Vormtaal als bold verticale accent-rand links */}
        <div
          aria-hidden="true"
          className="relative w-3 md:w-4 shrink-0 self-stretch overflow-hidden"
        >
          <HboIctVormtaal
            variant="bands"
            count={6}
            opacity={0.9}
            className="w-full h-full"
          />
        </div>

        {/* Logo-blok: wit HBO-ICT lockup */}
        <div className="flex items-center px-5 md:px-8 border-r border-[var(--color-border)]">
          <Image
            src="/hbo-ict-wit.png"
            alt="HBO-ICT - Hogeschool van Amsterdam"
            width={220}
            height={37}
            className="h-auto w-[150px] md:w-[190px]"
            priority={false}
          />
        </div>

        {/* Tekstkolom */}
        <div className="flex flex-1 flex-col justify-center px-5 md:px-8 py-4">
          <div className="flex items-center gap-3 mb-1.5">
            <Cpu
              className="w-3.5 h-3.5 text-[var(--color-accent-gold)]"
              strokeWidth={2.5}
              aria-hidden="true"
            />
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--color-accent-gold)]">
              {"// onderdeel_van"}
            </span>
          </div>
          <p
            id="overons-cobrand-heading"
            className="font-display text-base md:text-xl font-bold uppercase tracking-tight leading-[1.1] text-[var(--color-text)]"
          >
            Het Moederbord van SIT. Dé officiële studievereniging van HBO-ICT
          </p>
        </div>

        {/* Bold vormtaal-triangle accent rechts, alleen op breder scherm */}
        <div
          aria-hidden="true"
          className="relative hidden lg:block w-28 shrink-0 self-stretch overflow-hidden"
          style={{
            maskImage: "linear-gradient(90deg, transparent, #000 60%)",
            WebkitMaskImage: "linear-gradient(90deg, transparent, #000 60%)",
          }}
        >
          <HboIctVormtaal
            variant="triangles"
            count={6}
            opacity={0.85}
            className="w-full h-full"
          />
        </div>
      </div>
    </section>
  );
}

export default function OverOns() {
  return (
    <SmoothScroll>
      <div className="page-public">
        <Navbar />
        <main id="main-content">
          <HboIctCoBrandStrip />
          <Moederbord />
        </main>
        <Footer />
      </div>
    </SmoothScroll>
  );
}
