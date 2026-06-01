"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { isReducedMotion, onMotionChange } from "@/lib/motion";
import HboIctVormtaal from "@/components/HboIctVormtaal";

// ---------------------------------------------------------------------------
// HboIctSection — co-branding sectie op de homepage. Fuseert de SIT-identiteit
// (donker, terminal/circuit, mono labels, gouden accent, scherpe hoeken) met
// de HBO-ICT huisstijl (scherpe chevron-vormtaal + accentkleuren + wit logo).
//
// SIT-goud blijft het dominante accent; HBO-ICT-kleuren zijn secundair.
// Reduced motion: eindstaat is altijd zichtbaar; animatie wordt overgeslagen.
// ---------------------------------------------------------------------------

export default function HboIctSection() {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [reduced, setReduced] = useState(true);

  // Reduced-motion: start als "reduced" (SSR-veilig), corrigeer client-side.
  useEffect(() => {
    const update = () => setReduced(isReducedMotion());
    update();
    return onMotionChange(update);
  }, []);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  // Zichtbaar = altijd onder reduced motion; anders pas bij in-view.
  const shown = reduced || inView;

  return (
    <section
      ref={ref}
      className="relative py-24 md:py-32 overflow-hidden"
      aria-labelledby="hboict-heading"
    >
      {/* Donkere SIT-laag boven de circuit-achtergrond */}
      <div className="absolute inset-0 bg-[var(--color-bg)]/70 pointer-events-none" />

      {/* Vormtaal-band bovenaan, full-bleed accent */}
      <div
        className="absolute top-0 left-0 right-0 h-8 md:h-10 pointer-events-none overflow-hidden"
        style={{
          opacity: shown ? 0.4 : 0,
          transition: reduced
            ? undefined
            : "opacity 0.8s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <HboIctVormtaal className="w-full h-full" />
      </div>

      {/* Dunne goud -> indigo divider die de twee merken "fuseert" */}
      <div
        className="absolute top-8 md:top-10 left-0 right-0 h-px pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, var(--color-accent-gold), var(--hboict-blue) 55%, transparent)",
          opacity: shown ? 0.7 : 0,
          transition: reduced
            ? undefined
            : "opacity 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s",
        }}
      />

      <div className="relative z-[1] px-6 md:px-12 lg:px-24">
        <div
          className="relative grid gap-10 lg:gap-16 lg:grid-cols-[1.2fr_1fr] items-center border border-[var(--color-border)] bg-[var(--color-surface)]/60 p-8 md:p-12"
          style={{
            opacity: shown ? 1 : 0,
            transform: shown || reduced ? "translateY(0)" : "translateY(16px)",
            transition: reduced
              ? undefined
              : "opacity 0.7s cubic-bezier(0.16,1,0.3,1) 0.15s, transform 0.7s cubic-bezier(0.16,1,0.3,1) 0.15s",
          }}
        >
          {/* Zij-accent: smalle verticale vormtaal-strip op desktop */}
          <div
            aria-hidden="true"
            className="hidden lg:block absolute right-0 top-0 bottom-0 w-1.5 overflow-hidden"
            style={{ opacity: 0.6 }}
          >
            <HboIctVormtaal
              className="h-full w-full"
              style={{ transform: "rotate(90deg) scale(2.4)" }}
            />
          </div>

          {/* Tekstkolom */}
          <div>
            {/* Mono eyebrow in goud */}
            <div className="flex items-center gap-4 mb-5">
              <span className="font-mono text-xs text-[var(--color-accent-gold)] tracking-[0.3em] uppercase">
                {"> officieel.partner"}
              </span>
              <span className="w-12 h-px bg-[var(--color-accent-gold)]" />
            </div>

            {/* Display headline, Big Shoulders, uppercase */}
            <h2
              id="hboict-heading"
              className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--color-text)] tracking-tight uppercase leading-[0.95]"
            >
              Dé studievereniging van HBO-ICT
            </h2>

            {/* Paragraaf */}
            <p className="mt-6 max-w-xl text-sm md:text-base text-[var(--color-text-muted)] leading-relaxed">
              SIT is de officiële studievereniging van HBO-ICT aan de
              Hogeschool van Amsterdam. Gebouwd door en voor HBO-ICT
              studenten. We verbinden de opleiding met de community en het
              werkveld zodat je verder komt.
            </p>

            {/* Payoff in SIT-mono, caps, HBO-ICT accentkleur */}
            <div className="mt-8 flex items-center gap-3">
              <span
                aria-hidden="true"
                className="block w-2 h-2 rotate-45"
                style={{ backgroundColor: "var(--hboict-red)" }}
              />
              <span
                className="font-mono text-xs md:text-sm uppercase tracking-[0.4em]"
                style={{ color: "var(--hboict-cyan)" }}
              >
                Creating Tomorrow
              </span>
            </div>
          </div>

          {/* Logo-kolom: wit HBO-ICT lockup op donkere surface */}
          <div className="flex lg:justify-end">
            <div className="relative border border-[var(--color-border)] bg-[var(--color-bg)]/60 px-6 py-7 md:px-8 md:py-9 w-full lg:w-auto">
              {/* Hoek-accent in HBO-ICT indigo */}
              <span
                aria-hidden="true"
                className="absolute -top-px -left-px w-4 h-4 border-t border-l"
                style={{ borderColor: "var(--hboict-blue-accent)" }}
              />
              <span
                aria-hidden="true"
                className="absolute -bottom-px -right-px w-4 h-4 border-b border-r"
                style={{ borderColor: "var(--color-accent-gold)" }}
              />
              <Image
                src="/hbo-ict-wit.png"
                alt="HBO-ICT - Hogeschool van Amsterdam"
                width={240}
                height={41}
                className="h-auto w-[200px] md:w-[240px]"
                priority={false}
              />
              <p className="mt-4 font-mono text-[var(--color-text-muted)] text-xs">
                <span style={{ color: "var(--color-accent-green)" }}>
                  {"// "}
                </span>
                aangesloten bij de opleiding
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
