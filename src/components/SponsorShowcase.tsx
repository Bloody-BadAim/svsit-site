"use client";

import { useEffect, useRef, useState } from "react";
import { PARTNERS } from "@/lib/partners";
import { TextScramble } from "@/components/ui/TextScramble";

// ---------------------------------------------------------------------------
// Homepage teaser - minimal partner logo-wall.
// Full network lives on /partners. Data comes from @/lib/partners.
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
    <section ref={ref} className="relative py-24 md:py-32 px-6 md:px-12 lg:px-24">
      {/* Background shield - keeps section darkness consistent over the circuit bg */}
      <div className="absolute inset-0 bg-[var(--color-bg)]/70 pointer-events-none" />

      <div className="relative z-[1]">
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
        <div className="font-mono text-xs mb-8" style={{ color: "var(--color-text-muted)" }}>
          <span style={{ color: "var(--color-accent-green)" }}>{"// "}</span>
          verbonden aan 100+ ICT-studenten
        </div>

        {/* Logo wall - wordmarks */}
        <div className="flex flex-wrap items-center gap-x-8 gap-y-5 md:gap-x-12">
          {PARTNERS.map((p, i) => {
            const wordmark = (
              <span className="font-display text-xl md:text-2xl font-extrabold uppercase tracking-tight transition-colors duration-300">
                {p.name}
              </span>
            );
            const common = {
              style: {
                color: "var(--color-text-muted)",
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(8px)",
                transition: `all 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${0.15 + i * 0.06}s`,
              } as React.CSSProperties,
              onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
                e.currentTarget.style.color = "var(--color-text)";
              },
              onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
                e.currentTarget.style.color = "var(--color-text-muted)";
              },
            };
            return p.url ? (
              <a key={p.slug} href={p.url} target="_blank" rel="noopener noreferrer" {...common}>
                {wordmark}
              </a>
            ) : (
              <span key={p.slug} {...common}>
                {wordmark}
              </span>
            );
          })}
        </div>

        {/* CTA → full network */}
        <a
          href="/partners"
          className="group inline-flex items-center gap-2 mt-10 font-mono text-sm text-[var(--color-accent-gold)] hover:text-[var(--color-text)] transition-colors duration-300"
        >
          <span style={{ color: "var(--color-accent-green)" }}>$</span>
          <span>bekijk partnernetwerk</span>
          <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </a>
      </div>
    </section>
  );
}
