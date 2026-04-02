"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SectionLabel from "@/components/SectionLabel";
import { CardSpotlight } from "@/components/ui/card-spotlight";

const achievements = [
  {
    title: "Events & Activiteiten",
    desc: "Van borrels en kroegentochten tot hackathons, game nights, CTF challenges en tech talks. Of je nu wil netwerken of gewoon een biertje drinken.",
    stat: "20+",
    statLabel: "per jaar",
    color: "#F59E0B",
    rgb: [245, 158, 11] as number[],
  },
  {
    title: "Netwerk Opbouwen",
    desc: "Leer studenten uit alle richtingen kennen: Software Engineering, Cyber Security, Game Dev, Business IT en Technische Informatica. Plus alumni en bedrijven.",
    stat: "5",
    statLabel: "specialisaties",
    color: "#3B82F6",
    rgb: [59, 130, 246] as number[],
  },
  {
    title: "Skills Ontwikkelen",
    desc: "Win een CTF, bouw een AI project, pitch je startup idee, of organiseer een event. Dingen die op je CV knallen.",
    stat: "∞",
    statLabel: "mogelijkheden",
    color: "#EF4444",
    rgb: [239, 68, 68] as number[],
  },
  {
    title: "Maar 10 Euro",
    desc: "Eenmalig. Geen maandelijkse kosten. Lid voor het hele jaar. Inclusief toegang tot alle events en de volledige SIT community.",
    stat: "€10",
    statLabel: "that's it",
    color: "#22C55E",
    rgb: [34, 197, 94] as number[],
  },
];

function AchievementRing({
  number,
  color,
  size = 72,
}: {
  number: number;
  color: string;
  size?: number;
}) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className="absolute inset-0 rounded-full"
        aria-hidden="true"
        style={{ boxShadow: `0 0 20px ${color}30, 0 0 40px ${color}15` }}
      />
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={4}
        />
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
      <span
        className="absolute inset-0 flex items-center justify-center font-display text-lg font-bold"
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
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      if (cardsRef.current) {
        const cards = cardsRef.current.querySelectorAll(".achievement-card");
        cards.forEach((card) => {
          (card as HTMLElement).style.opacity = "1";
          (card as HTMLElement).style.transform = "none";
        });
      }
      return;
    }

    const ctx = gsap.context(() => {
      if (!cardsRef.current) return;
      const cards = cardsRef.current.querySelectorAll(".achievement-card");

      cards.forEach((card, i) => {
        const fromX = i % 2 === 0 ? -40 : 40;

        gsap.fromTo(
          card,
          { opacity: 0, x: fromX, y: 20 },
          {
            opacity: 1,
            x: 0,
            y: 0,
            duration: 0.7,
            ease: "back.out(1.2)",
            scrollTrigger: {
              trigger: card,
              start: "top 88%",
              toggleActions: "play none none none",
            },
            delay: i * 0.08,
          }
        );

        // Ring fill
        const ring = card.querySelector(".achievement-ring");
        if (ring) {
          const size = 72;
          const r = (size - 8) / 2;
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
                start: "top 88%",
                toggleActions: "play none none none",
              },
              delay: 0.3 + i * 0.08,
            }
          );
        }

        // Stat counter
        const statEl = card.querySelector(".stat-value") as HTMLElement | null;
        if (statEl) {
          const rawStat = statEl.getAttribute("data-stat") || "";
          let target = 0;
          let prefix = "";
          let suffix = "";

          if (rawStat === "20+") {
            target = 20;
            suffix = "+";
          } else if (rawStat === "5") {
            target = 5;
          } else if (rawStat === "€10") {
            target = 10;
            prefix = "€";
          }

          if (target > 0) {
            const proxy = { val: 0 };
            gsap.to(proxy, {
              val: target,
              duration: target > 10 ? 1.5 : 1.2,
              ease: "power2.out",
              scrollTrigger: {
                trigger: card,
                start: "top 88%",
                toggleActions: "play none none none",
              },
              delay: 0.4 + i * 0.08,
              onUpdate() {
                statEl.textContent = prefix + Math.round(proxy.val) + suffix;
              },
            });
          }
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="whyjoin"
      className="relative min-h-[70vh] py-24 md:py-32 lg:py-40 px-6 md:px-12 lg:px-24"
    >
      <div className="absolute inset-0 bg-[var(--color-bg)]/70" />

      {/* Background depth glows */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 600px 600px at 20% 50%, rgba(245, 158, 11, 0.04), transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 600px 600px at 80% 85%, rgba(59, 130, 246, 0.03), transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      <div className="relative max-w-[1400px] mx-auto">
        <SectionLabel number="02" label="waarom lid worden" />

        <div className="mb-12 md:mb-16">
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold uppercase tracking-tight leading-[1.1]">
            Achievements
            <br />
            <span className="text-[var(--color-accent-gold)]">Unlocked</span>
          </h2>
          <p className="font-mono text-sm text-[var(--color-text-muted)] mt-4">
            Wat je krijgt als SIT lid. Allemaal inbegrepen.
          </p>
        </div>

        {/* 2×2 CardSpotlight grid */}
        <div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          {achievements.map((a, i) => (
            <div key={i} className="achievement-card">
              <CardSpotlight
                color={`${a.color}18`}
                radius={300}
                revealColors={[a.rgb]}
                className="h-full p-8 border border-[var(--color-border)] bg-[var(--color-surface)]"
              >
                {/* Top row: ring + stat */}
                <div className="relative z-20 flex items-start justify-between mb-6">
                  <AchievementRing number={i + 1} color={a.color} size={72} />
                  <div className="flex flex-col items-end">
                    <span
                      className="stat-value font-mono text-3xl md:text-4xl font-bold leading-none"
                      style={{ color: a.color }}
                      data-stat={a.stat}
                    >
                      {a.stat}
                    </span>
                    <span className="font-mono text-[10px] text-[var(--color-text-muted)] mt-1 uppercase tracking-wider">
                      {a.statLabel}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="relative z-20 font-display text-xl md:text-2xl font-bold uppercase tracking-tight leading-tight mb-3">
                  {a.title}
                </h3>

                {/* Description */}
                <p className="relative z-20 font-mono text-sm leading-relaxed text-[var(--color-text-muted)]">
                  {a.desc}
                </p>

                {/* Bottom accent line */}
                <div
                  className="relative z-20 mt-6 h-px w-12"
                  style={{ background: `${a.color}40` }}
                  aria-hidden="true"
                />
              </CardSpotlight>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
