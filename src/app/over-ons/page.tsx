import type { Metadata } from "next";
import Image from "next/image";
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

// Compacte HBO-ICT co-brand strip boven het organigram. Geen full duplicate
// van de homepage-sectie: een slanke band die SIT-goud (dominant) fuseert met
// de HBO-ICT vormtaal/kleuren (secundair). Statisch -> eindstaat altijd
// zichtbaar, ook onder reduced motion; geen JS-animatie nodig.
function HboIctCoBrandStrip() {
  return (
    <section
      className="relative overflow-hidden border-b border-[var(--color-border)] bg-[var(--color-surface)]/60"
      aria-labelledby="overons-cobrand-heading"
    >
      {/* Vormtaal-accent als smalle band bovenaan, terughoudend */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-6 md:h-7 overflow-hidden pointer-events-none"
        style={{ opacity: 0.35 }}
      >
        <HboIctVormtaal className="w-full h-full" />
      </div>

      {/* Dunne goud -> indigo divider die de twee merken fuseert */}
      <div
        aria-hidden="true"
        className="absolute top-6 md:top-7 left-0 right-0 h-px pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, var(--color-accent-gold), var(--hboict-blue) 55%, transparent)",
          opacity: 0.7,
        }}
      />

      <div className="relative z-[1] px-6 md:px-12 lg:px-24 pt-12 md:pt-14 pb-8 md:pb-10">
        <div className="flex flex-col gap-7 md:flex-row md:items-center md:justify-between md:gap-12">
          {/* Tekstkolom */}
          <div className="max-w-2xl">
            <div className="flex items-center gap-4 mb-3">
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--color-accent-gold)]">
                {"// onderdeel_van"}
              </span>
              <span className="w-10 h-px bg-[var(--color-accent-gold)]" />
            </div>
            <p
              id="overons-cobrand-heading"
              className="font-display text-xl md:text-2xl font-bold uppercase tracking-tight leading-[1.05] text-[var(--color-text)]"
            >
              Het Moederbord van SIT - de officiële studievereniging van HBO-ICT
              aan de HvA
            </p>
          </div>

          {/* Logo-blok: wit HBO-ICT lockup op donkere surface */}
          <div className="flex md:justify-end">
            <div className="relative border border-[var(--color-border)] bg-[var(--color-bg)]/60 px-5 py-4 md:px-6 md:py-5">
              <span
                aria-hidden="true"
                className="absolute -top-px -left-px w-3.5 h-3.5 border-t border-l"
                style={{ borderColor: "var(--hboict-blue-accent)" }}
              />
              <span
                aria-hidden="true"
                className="absolute -bottom-px -right-px w-3.5 h-3.5 border-b border-r"
                style={{ borderColor: "var(--color-accent-gold)" }}
              />
              <Image
                src="/hbo-ict-wit.png"
                alt="HBO-ICT - Hogeschool van Amsterdam"
                width={220}
                height={37}
                className="h-auto w-[180px] md:w-[200px]"
                priority={false}
              />
            </div>
          </div>
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
