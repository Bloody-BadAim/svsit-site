"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SectionLabel from "@/components/SectionLabel";

gsap.registerPlugin(ScrollTrigger);

/**
 * WhyJoin — Achievement Unlock Cards
 *
 * Styled like gaming achievement notifications. Each reason is an
 * "achievement" you unlock by joining SIT. Large achievement ring
 * with number, title, description, and XP value. Scroll-triggered
 * slide-in from left with glow pulse.
 */

const achievements = [
  {
    title: "Events & Activiteiten",
    desc: "Van borrels en kroegentochten tot hackathons, game nights, CTF challenges en tech talks. Of je nu wil netwerken of gewoon een biertje drinken.",
    stat: "20+",
    statLabel: "per jaar",
    color: "#F59E0B",
    colorVar: "var(--color-accent-gold)",
    ring: 100,
  },
  {
    title: "Netwerk Opbouwen",
    desc: "Leer studenten uit alle richtingen kennen: Software Engineering, Cyber Security, Game Dev, Business IT en Technische Informatica. Plus alumni en bedrijven.",
    stat: "5",
    statLabel: "specialisaties",
    color: "#3B82F6",
    colorVar: "var(--color-accent-blue)",
    ring: 100,
  },
  {
    title: "Skills Ontwikkelen",
    desc: "Win een CTF, bouw een AI project, pitch je startup idee, of organiseer een event. Dingen die op je CV knallen.",
    stat: "∞",
    statLabel: "mogelijkheden",
    color: "#EF4444",
    colorVar: "var(--color-accent-red)",
    ring: 100,
  },
  {
    title: "Maar 10 Euro",
    desc: "Eenmalig. Geen maandelijkse kosten. Lid voor het hele jaar. Inclusief toegang tot alle events en de volledige SIT community.",
    stat: "€10",
    statLabel: "that's it",
    color: "#22C55E",
    colorVar: "var(--color-accent-green)",
    ring: 100,
  },
];

function AchievementRing({ number, color, size = 72 }: { number: number; color: string; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {/* Glow */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          boxShadow: `0 0 20px ${color}30, 0 0 40px ${color}15`,
        }}
      />
      <svg width={size} height={size} className="rotate-[-90deg]">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={4}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={0}
          className="achievement-ring"
        />
      </svg>
      {/* Number */}
      <span
        className="absolute inset-0 flex items-center justify-center font-display text-xl font-bold"
        style={{ color }}
      >
        {String(number).padStart(2, "0")}
      </span>
    </div>
  );
}

export default function WhyJoin() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!cardsRef.current) return;
      const cards = cardsRef.current.querySelectorAll(".achievement-card");

      cards.forEach((card, i) => {
        // Card slides in from left
        gsap.fromTo(
          card,
          { opacity: 0, x: -60 },
          {
            opacity: 1,
            x: 0,
            duration: 0.7,
            ease: "back.out(1.2)",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              toggleActions: "play none none none",
            },
            delay: i * 0.1,
          }
        );

        // Ring fills on scroll
        const ring = card.querySelector(".achievement-ring");
        if (ring) {
          const r = 32;
          const circ = 2 * Math.PI * r;
          gsap.fromTo(
            ring,
            { strokeDashoffset: circ },
            {
              strokeDashoffset: 0,
              duration: 1.2,
              ease: "power2.out",
              scrollTrigger: {
                trigger: card,
                start: "top 85%",
                toggleActions: "play none none none",
              },
              delay: 0.3 + i * 0.1,
            }
          );
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="whyjoin"
      className="relative py-24 md:py-32 lg:py-40 px-6 md:px-12 lg:px-24"
    >
      <div className="absolute inset-0 bg-[var(--color-bg)]/70" />

      <div className="relative max-w-[1400px] mx-auto">
        <SectionLabel number="02" label="waarom lid worden" />

        {/* Header */}
        <div className="mb-12 md:mb-16">
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold uppercase tracking-tight leading-[1.1]">
            Achievements<br />
            <span className="text-[var(--color-accent-gold)]">Unlocked</span>
          </h2>
          <p className="font-mono text-sm text-[var(--color-text-muted)] mt-4">
            Wat je krijgt als SIT lid. Allemaal inbegrepen.
          </p>
        </div>

        {/* Achievement cards */}
        <div ref={cardsRef} className="flex flex-col gap-4">
          {achievements.map((a, i) => (
            <div
              key={i}
              className="achievement-card group relative overflow-hidden"
            >
              {/* Left color bar */}
              <div
                className="absolute left-0 top-0 bottom-0 w-1"
                style={{ background: a.color }}
              />

              <div
                className="bg-[var(--color-surface)] border border-[var(--color-border)] border-l-0 transition-all duration-300"
                style={{
                  borderColor: "var(--color-border)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = `${a.color}30`;
                  (e.currentTarget as HTMLElement).style.boxShadow = `inset 0 0 60px ${a.color}05, 0 0 30px ${a.color}08`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }}
              >
                <div className="flex items-center gap-6 md:gap-8 p-6 md:p-8">
                  {/* Achievement ring */}
                  <AchievementRing number={i + 1} color={a.color} />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-xl md:text-2xl font-bold uppercase tracking-tight leading-tight mb-2 group-hover:translate-x-1 transition-transform duration-300">
                      {a.title}
                    </h3>
                    <p className="font-mono text-sm leading-relaxed text-[var(--color-text-muted)] group-hover:text-[var(--color-text)]/70 transition-colors duration-300">
                      {a.desc}
                    </p>
                  </div>

                  {/* Stat badge */}
                  <div className="hidden sm:flex flex-col items-end shrink-0">
                    <span
                      className="font-mono text-3xl md:text-4xl font-bold leading-none"
                      style={{ color: a.color }}
                    >
                      {a.stat}
                    </span>
                    <span className="font-mono text-[10px] text-[var(--color-text-muted)] mt-1 uppercase tracking-wider">
                      {a.statLabel}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
