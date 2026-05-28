"use client";

import { useEffect, useRef, useState } from "react";
import { TextScramble } from "@/components/ui/TextScramble";

// ---------------------------------------------------------------------------
// Sponsor data — update here when new sponsors join
// ---------------------------------------------------------------------------

type Tier = "strategisch" | "hoofdsponsor" | "sponsor" | "partner";

interface Sponsor {
  name: string;
  tier: Tier;
  url: string;
  /** One-line description shown on hover / below name */
  tagline: string;
}

const TIER_CONFIG: Record<Tier, { label: string; color: string; bg: string }> = {
  strategisch:  { label: "STRATEGISCH", color: "#F29E18", bg: "rgba(242,158,24,0.12)" },
  hoofdsponsor: { label: "HOOFDSPONSOR", color: "#F29E18", bg: "rgba(242,158,24,0.08)" },
  sponsor:      { label: "SPONSOR", color: "#3B82F6", bg: "rgba(59,130,246,0.08)" },
  partner:      { label: "PARTNER", color: "#22C55E", bg: "rgba(34,197,94,0.08)" },
};

const SPONSORS: Sponsor[] = [
  {
    name: "ChipSoft",
    tier: "sponsor",
    url: "https://www.chipsoft.nl",
    tagline: "Marktleider in zorg-IT",
  },
  {
    name: "Sogeti",
    tier: "partner",
    url: "https://www.sogeti.nl",
    tagline: "Technology & engineering",
  },
];

// ---------------------------------------------------------------------------
// Component
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
    <section
      ref={ref}
      className="relative py-16 md:py-20 px-6 md:px-12 lg:px-24"
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-6 md:left-12 lg:left-24 right-6 md:right-12 lg:right-24 h-px"
        style={{
          background:
            "linear-gradient(90deg, rgba(242,158,24,0.3), rgba(59,130,246,0.2), transparent)",
        }}
      />

      {/* Section label */}
      <div className="mb-8 md:mb-10">
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

      {/* Code-style header */}
      <div className="font-mono text-xs mb-6" style={{ color: "var(--color-text-muted)" }}>
        <span style={{ color: "var(--color-accent-green)" }}>{"// "}</span>
        sponsors.config.ts
      </div>

      {/* Sponsor grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {SPONSORS.map((sponsor, i) => {
          const tier = TIER_CONFIG[sponsor.tier];
          return (
            <a
              key={sponsor.name}
              href={sponsor.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex flex-col gap-3 p-5 rounded-lg border transition-all duration-300"
              style={{
                borderColor: "var(--color-border)",
                backgroundColor: "rgba(255,255,255,0.01)",
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(12px)",
                transition: `all 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${0.2 + i * 0.1}s`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = tier.color;
                e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.03)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--color-border)";
                e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.01)";
              }}
            >
              {/* Tier badge */}
              <span
                className="inline-flex self-start px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider"
                style={{ color: tier.color, backgroundColor: tier.bg }}
              >
                {tier.label}
              </span>

              {/* Name */}
              <span className="text-lg font-bold font-mono text-[var(--color-text)] group-hover:text-white transition-colors">
                {sponsor.name}
              </span>

              {/* Tagline */}
              <span className="text-xs font-mono" style={{ color: "var(--color-text-muted)" }}>
                {sponsor.tagline}
              </span>

              {/* Arrow indicator */}
              <span
                className="absolute top-5 right-5 text-xs font-mono opacity-0 group-hover:opacity-60 transition-opacity"
                style={{ color: tier.color }}
              >
                {"->"}
              </span>
            </a>
          );
        })}

        {/* CTA card — become a partner */}
        <a
          href="mailto:sponsoring@svsit.nl"
          className="group relative flex flex-col justify-center items-center gap-2 p-5 rounded-lg border border-dashed transition-all duration-300 cursor-pointer"
          style={{
            borderColor: "rgba(255,255,255,0.08)",
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(12px)",
            transition: `all 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${0.2 + SPONSORS.length * 0.1}s`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(242,158,24,0.3)";
            e.currentTarget.style.backgroundColor = "rgba(242,158,24,0.03)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <span className="text-lg font-mono" style={{ color: "var(--color-text-muted)" }}>+</span>
          <span className="text-xs font-mono text-center" style={{ color: "var(--color-text-muted)" }}>
            Word partner
          </span>
          <span
            className="text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: "var(--color-accent-gold)" }}
          >
            sponsoring@svsit.nl
          </span>
        </a>
      </div>

      {/* Bottom line — tier legend */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[10px] tracking-wider" style={{ color: "var(--color-text-muted)" }}>
        <span style={{ color: "var(--color-accent-green)" }}>{"// "}</span>
        {Object.entries(TIER_CONFIG).map(([key, config]) => (
          <span key={key} className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.color }} />
            {config.label}
          </span>
        ))}
      </div>
    </section>
  );
}
