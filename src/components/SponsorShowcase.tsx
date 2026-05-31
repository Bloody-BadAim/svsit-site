"use client";

import { useEffect, useRef, useState } from "react";
import { PARTNERS, TIER_META } from "@/lib/partners";
import { TextScramble } from "@/components/ui/TextScramble";
import { InfiniteSlider } from "@/components/motion-primitives/infinite-slider";
import { ProgressiveBlur } from "@/components/motion-primitives/progressive-blur";

// ---------------------------------------------------------------------------
// Homepage Partners section.
// Merges the partner wordmark wall with an infinite marquee of partner names.
// Names only - no event labels. Data comes from @/lib/partners.
// Full network lives on /partners.
// ---------------------------------------------------------------------------

export default function SponsorShowcase() {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

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

  return (
    <section ref={ref} className="relative py-24 md:py-32 overflow-hidden">
      {/* Background shield - keeps section darkness consistent over the circuit bg */}
      <div className="absolute inset-0 bg-[var(--color-bg)]/70 pointer-events-none" />

      <div className="relative z-[1]">
        {/* Header block (padded) */}
        <div className="px-6 md:px-12 lg:px-24">
          {/* Top accent line */}
          <div
            className="absolute top-0 left-6 md:left-12 lg:left-24 right-6 md:right-12 lg:right-24 h-px"
            style={{
              background:
                "linear-gradient(90deg, rgba(242,158,24,0.3), rgba(59,130,246,0.2), transparent)",
            }}
          />

          {/* Section label */}
          <div className="mb-7 md:mb-9">
            <div className="flex items-center gap-4 mb-4">
              <span className="font-mono text-xs text-[var(--color-accent-gold)] tracking-[0.3em] uppercase">
                05
              </span>
              <span className="w-12 h-px bg-[var(--color-accent-gold)]" />
            </div>
            <TextScramble
              as="h2"
              className="font-display text-2xl md:text-3xl font-bold text-[var(--color-text)] tracking-tight uppercase"
              trigger={inView}
              duration={0.6}
              speed={0.03}
              characterSet="#{}/<>[]!@$%^&*"
            >
              Partners
            </TextScramble>
          </div>

          {/* Code-style subheader */}
          <div
            className="font-mono text-xs mb-10 md:mb-12"
            style={{ color: "var(--color-text-muted)" }}
          >
            <span style={{ color: "var(--color-accent-green)" }}>{"// "}</span>
            verbonden aan 100+ ICT-studenten
          </div>
        </div>

        {/* Full-bleed partner marquee */}
        <div
          className="relative"
          style={{
            opacity: inView ? 1 : 0,
            transition: "opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s",
          }}
        >
          <div className="relative h-[64px] md:h-[88px] w-full overflow-hidden flex items-center">
            <InfiniteSlider
              className="flex h-full w-full items-center"
              gap={0}
              speed={32}
              speedOnHover={6}
            >
              {PARTNERS.map((p, i) => {
                const tierColor = TIER_META[p.tier].color;
                const nameEl = (
                  <span
                    className="partner-name font-display text-2xl md:text-4xl font-semibold uppercase tracking-[0.12em] whitespace-nowrap leading-none transition-colors duration-300"
                    style={{ color: "var(--color-text-muted)" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = tierColor;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "var(--color-text-muted)";
                    }}
                  >
                    {p.name}
                  </span>
                );
                return (
                  <div
                    key={`${p.slug}-${i}`}
                    className="flex items-center gap-7 md:gap-10 shrink-0 px-7 md:px-10"
                  >
                    {/* Diamond separator */}
                    <span
                      aria-hidden="true"
                      className="block w-1.5 h-1.5 rotate-45 shrink-0"
                      style={{ backgroundColor: tierColor, opacity: 0.4 }}
                    />
                    {p.url ? (
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="outline-none"
                      >
                        {nameEl}
                      </a>
                    ) : (
                      nameEl
                    )}
                  </div>
                );
              })}
            </InfiniteSlider>

            <ProgressiveBlur
              className="pointer-events-none absolute top-0 left-0 h-full w-[80px] md:w-[200px]"
              direction="left"
              blurIntensity={1}
            />
            <ProgressiveBlur
              className="pointer-events-none absolute top-0 right-0 h-full w-[80px] md:w-[200px]"
              direction="right"
              blurIntensity={1}
            />
          </div>
        </div>

        {/* CTA → full network (padded) */}
        <div className="px-6 md:px-12 lg:px-24">
          <a
            href="/partners"
            className="group inline-flex items-center gap-2 mt-10 md:mt-12 font-mono text-sm text-[var(--color-accent-gold)] hover:text-[var(--color-text)] transition-colors duration-300"
          >
            <span style={{ color: "var(--color-accent-green)" }}>$</span>
            <span>bekijk partnernetwerk</span>
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
