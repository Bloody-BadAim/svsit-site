"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { isReducedMotion, onMotionChange } from "@/lib/motion";
import HboIctVormtaal from "@/components/HboIctVormtaal";

// ---------------------------------------------------------------------------
// HboIctSection - compacte co-brand banner. Diagonale split: links de donkere
// SIT terminal-surface met de copy, rechts een bold HBO-ICT triangle-veld dat
// via een scherpe diagonale rand in de SIT-laag snijdt. Dit is de ene plek waar
// HBO-ICT kleur luid mag zijn. SIT-goud blijft het accent op de tekstkant.
// Reduced motion: eindstaat is altijd zichtbaar; animatie wordt overgeslagen.
// ---------------------------------------------------------------------------

export default function HboIctSection() {
  const t = useTranslations("hboIctSection");
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
      { threshold: 0.3 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  // Zichtbaar = altijd onder reduced motion; anders pas bij in-view.
  const shown = reduced || inView;
  const ease = "cubic-bezier(0.16,1,0.3,1)";

  return (
    <section
      ref={ref}
      className="relative px-6 md:px-12 lg:px-24 py-16 md:py-20"
      aria-labelledby="hboict-heading"
    >
      <div
        className="relative mx-auto max-w-7xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg)]"
        style={{
          opacity: shown ? 1 : 0,
          transform: shown || reduced ? "translateY(0)" : "translateY(20px)",
          transition: reduced
            ? undefined
            : `opacity 0.7s ${ease}, transform 0.7s ${ease}`,
        }}
      >
        <div className="relative grid md:grid-cols-[1.15fr_1fr] min-h-[320px] md:h-[360px]">
          {/* ---- Kopkant: donkere SIT terminal-surface met copy ---- */}
          <div className="relative z-[2] flex flex-col justify-center gap-5 bg-[var(--color-surface)] p-7 md:p-10 lg:p-12">
            {/* Mono eyebrow in goud */}
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-[var(--color-accent-gold)] tracking-[0.3em] uppercase">
                {t("eyebrow")}
              </span>
              <span className="h-px w-10 bg-[var(--color-accent-gold)]" />
            </div>

            {/* Display headline, Big Shoulders, uppercase */}
            <h2
              id="hboict-heading"
              className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--color-text)] tracking-tight uppercase leading-[0.92]"
            >
              {t("heading")}
            </h2>

            {/* Eén korte punchy regel (studententoon, geen dashes/komma's) */}
            <p className="max-w-md text-sm md:text-base text-[var(--color-text-muted)] leading-snug">
              {t("body")}
            </p>

            {/* Payoff in mono caps, HBO-ICT cyaan accent */}
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="block h-2 w-2 rotate-45"
                style={{ backgroundColor: "var(--hboict-red)" }}
              />
              <span
                className="font-mono text-xs md:text-sm uppercase tracking-[0.4em]"
                style={{ color: "var(--hboict-cyan)" }}
              >
                {t("payoff")}
              </span>
              <ArrowUpRight
                className="h-4 w-4"
                style={{ color: "var(--hboict-cyan)" }}
                aria-hidden="true"
              />
            </div>
          </div>

          {/* ---- Bold HBO-ICT triangle-veld rechts ---- */}
          <div aria-hidden="true" className="relative">
            <HboIctVormtaal
              variant="triangles"
              count={10}
              opacity={shown ? 1 : 0}
              className="absolute inset-0 h-full w-full"
              style={{
                transition: reduced ? undefined : `opacity 0.8s ${ease} 0.15s`,
              }}
            />
          </div>

          {/* ---- Scherpe diagonale rand die de twee merken fuseert ---- */}
          {/* SIT-surface snijdt schuin in het vormtaal-veld (alleen desktop) */}
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-0 right-0 z-[1] hidden md:block bg-[var(--color-surface)]"
            style={{
              clipPath: "polygon(0 0, 60% 0, 48% 100%, 0 100%)",
            }}
          />
          {/* Goud -> indigo lichtlijn langs de diagonaal */}
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-0 right-0 z-[3] hidden md:block"
            style={{
              clipPath:
                "polygon(59.4% 0, 60% 0, 48% 100%, 47.4% 100%)",
              background:
                "linear-gradient(180deg, var(--color-accent-gold), var(--hboict-blue-accent))",
              opacity: shown ? 0.9 : 0,
              transition: reduced ? undefined : `opacity 0.8s ${ease} 0.25s`,
            }}
          />

          {/* ---- Wit HBO-ICT logo, drijvend op het vormtaal-veld ---- */}
          <div className="absolute z-[4] bottom-5 right-5 md:bottom-7 md:right-7">
            <div className="relative border border-white/30 bg-[var(--color-bg)]/85 px-4 py-3 backdrop-blur-sm">
              <span
                aria-hidden="true"
                className="absolute -top-px -left-px h-3 w-3 border-t border-l"
                style={{ borderColor: "var(--color-accent-gold)" }}
              />
              <span
                aria-hidden="true"
                className="absolute -bottom-px -right-px h-3 w-3 border-b border-r"
                style={{ borderColor: "var(--hboict-cyan)" }}
              />
              <Image
                src="/hbo-ict-wit.png"
                alt={t("logoAlt")}
                width={240}
                height={41}
                className="h-auto w-[150px] md:w-[180px]"
                priority={false}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
