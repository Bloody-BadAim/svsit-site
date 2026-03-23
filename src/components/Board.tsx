"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SectionLabel from "@/components/SectionLabel";

gsap.registerPlugin(ScrollTrigger);

interface Character {
  name: string;
  role: string;
  initials: string;
  image: string | null;
  accent: string;
  accentHex: string;
  stats: { code: number; chaos: number; coffee: number; social: number };
  special: string;
  description: string;
}

const characters: Character[] = [
  {
    name: "Matin",
    role: "Voorzitter",
    initials: "MK",
    image: "/bestuur/matin.jpeg",
    accent: "var(--color-accent-gold)",
    accentHex: "#F59E0B",
    stats: { code: 9, chaos: 7, coffee: 10, social: 8 },
    special: "git push --force op production",
    description: "// voorzitter | fullstack dev | ADHD powered",
  },
  {
    name: "Riley",
    role: "Penningmeester",
    initials: "RL",
    image: "/bestuur/riley.png",
    accent: "var(--color-accent-blue)",
    accentHex: "#3B82F6",
    stats: { code: 6, chaos: 4, coffee: 7, social: 9 },
    special: "Budget approved: €0.00",
    description: "// penningmeester | houdt de centen bij",
  },
  {
    name: "Hugo",
    role: "Algemeen bestuurslid",
    initials: "HG",
    image: "/bestuur/hugo.png",
    accent: "var(--color-accent-red)",
    accentHex: "#EF4444",
    stats: { code: 7, chaos: 8, coffee: 6, social: 10 },
    special: "sudo rm -rf /boredom",
    description: "// algemeen bestuurslid | verbindt iedereen",
  },
  {
    name: "Idil",
    role: "Secretaris",
    initials: "ID",
    image: "/bestuur/idil.jpeg",
    accent: "var(--color-accent-green)",
    accentHex: "#22C55E",
    stats: { code: 7, chaos: 5, coffee: 8, social: 9 },
    special: "Notulen.final_final_v3.docx",
    description: "// secretaris | FemIT x SIT",
  },
];

const statLabels: (keyof Character["stats"])[] = ["code", "chaos", "coffee", "social"];

function StatBar({ value, accent, animate }: { value: number; accent: string; animate: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-white/5">
        <div
          className="h-full transition-[width] duration-400 ease-out"
          style={{
            width: animate ? `${value * 10}%` : "0%",
            backgroundColor: accent,
          }}
        />
      </div>
      <span className="font-mono text-xs text-[var(--color-text-muted)] w-9 text-right shrink-0">
        {value}/10
      </span>
    </div>
  );
}

export default function Board() {
  const sectionRef = useRef<HTMLElement>(null);
  const portraitsRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const [selected, setSelected] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [statsAnimated, setStatsAnimated] = useState(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleSelect(index: number) {
    if (index === selected || transitioning) return;
    setTransitioning(true);
    setStatsAnimated(false);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setSelected(index);
      setTransitioning(false);
      // Trigger stat bars after content swap
      requestAnimationFrame(() => setStatsAnimated(true));
    }, 160);
  }

  // Animate stats on first render
  useEffect(() => {
    const t = setTimeout(() => setStatsAnimated(true), 400);
    return () => clearTimeout(t);
  }, []);

  // GSAP scroll animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Section fade in
      if (sectionRef.current) {
        gsap.fromTo(
          sectionRef.current,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      // Portraits stagger
      if (portraitsRef.current) {
        const items = portraitsRef.current.querySelectorAll(".char-portrait");
        gsap.fromTo(
          items,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: portraitsRef.current,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      // Info panel fade
      if (panelRef.current) {
        gsap.fromTo(
          panelRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            delay: 0.4,
            ease: "power3.out",
            scrollTrigger: {
              trigger: panelRef.current,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const current = characters[selected];

  return (
    <section
      ref={sectionRef}
      id="bestuur"
      className="relative pt-48 md:pt-64 pb-48 md:pb-64 px-6 md:px-12 lg:px-24"
    >
      {/* Scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
        }}
      />

      <div className="max-w-[1400px] mx-auto relative">
        <SectionLabel number="04" label="bestuur xi" />

        {/* Title */}
        <div className="mb-10 md:mb-14">
          <h2 className="font-mono text-2xl md:text-3xl font-bold tracking-tight text-[var(--color-text)]">
            SELECT YOUR BESTUURSLID
          </h2>
          <p className="font-mono text-sm text-[var(--color-text-muted)] mt-2">
            BESTUUR XI — 2026
          </p>
        </div>

        {/* Character portraits */}
        <div ref={portraitsRef} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {characters.map((char, i) => {
            const isSelected = selected === i;
            return (
              <button
                key={char.name}
                className="char-portrait relative text-left focus:outline-none group"
                onClick={() => handleSelect(i)}
                onMouseEnter={() => handleSelect(i)}
                aria-label={`Selecteer ${char.name}, ${char.role}`}
                aria-pressed={isSelected}
              >
                {/* Selection indicator */}
                <div
                  className="flex justify-center mb-1 h-5"
                  style={{ opacity: isSelected ? 1 : 0 }}
                >
                  <span
                    className="font-mono text-sm transition-opacity duration-300"
                    style={{ color: char.accent }}
                  >
                    ▼
                  </span>
                </div>

                {/* Portrait box */}
                <div
                  className="relative aspect-square overflow-hidden transition-all duration-300"
                  style={{
                    border: isSelected
                      ? `2px solid ${char.accentHex}`
                      : "2px solid rgba(255,255,255,0.1)",
                    boxShadow: isSelected ? `0 0 20px ${char.accentHex}40` : "none",
                    filter: isSelected ? "brightness(1.1)" : "brightness(0.7)",
                    transform: isSelected ? "scale(1)" : "scale(0.95)",
                  }}
                >
                  {char.image ? (
                    <Image
                      src={char.image}
                      alt={`Portretfoto van ${char.name}, ${char.role} van SIT`}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      quality={85}
                      className="object-cover object-[center_30%]"
                    />
                  ) : (
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ backgroundColor: `${char.accentHex}15` }}
                    >
                      <span
                        className="font-mono font-bold text-4xl md:text-5xl select-none"
                        style={{ color: char.accent }}
                      >
                        {char.initials}
                      </span>
                    </div>
                  )}

                  {/* Breathing animation overlay for selected */}
                  {isSelected && (
                    <div
                      className="absolute inset-0 pointer-events-none animate-breathe"
                      style={{
                        boxShadow: `inset 0 0 0 1px ${char.accentHex}60`,
                      }}
                    />
                  )}
                </div>

                {/* Name + role */}
                <div className="mt-2">
                  <p
                    className="font-mono text-sm font-bold transition-colors duration-300"
                    style={{
                      color: isSelected ? char.accent : "var(--color-text)",
                    }}
                  >
                    {char.name}
                  </p>
                  <p className="font-mono text-[11px] text-[var(--color-text-muted)] uppercase tracking-wider">
                    {char.role}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Info panel */}
        <div
          ref={panelRef}
          className="border border-[var(--color-border)] bg-[var(--color-surface)]/30"
        >
          <div
            className={`flex flex-col md:flex-row gap-6 md:gap-10 p-6 md:p-10 transition-all duration-[80ms] ease-out ${
              transitioning ? "opacity-0 translate-x-1" : "opacity-100 translate-x-0"
            }`}
          >
            {/* Left: large portrait */}
            <div className="shrink-0">
              <div
                className="w-[160px] h-[210px] md:w-[200px] md:h-[260px] overflow-hidden mx-auto md:mx-0"
                style={{
                  border: `2px solid ${current.accentHex}40`,
                }}
              >
                {current.image ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={current.image}
                      alt={`${current.name}, ${current.role}`}
                      fill
                      sizes="200px"
                      quality={90}
                      className="object-cover object-[center_30%]"
                    />
                  </div>
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ backgroundColor: `${current.accentHex}15` }}
                  >
                    <span
                      className="font-mono font-bold text-6xl md:text-7xl select-none"
                      style={{ color: current.accent }}
                    >
                      {current.initials}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: stats */}
            <div className="flex-1 min-w-0">
              <h3
                className="font-mono text-2xl md:text-3xl font-bold tracking-tight"
                style={{ color: current.accent }}
              >
                {current.name.toUpperCase()}
              </h3>
              <p className="font-mono text-sm text-[var(--color-text-muted)] mt-1 mb-6">
                class: {current.role}
              </p>

              {/* Stats header */}
              <p className="font-mono text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
                STATS:
              </p>

              {/* Stat bars */}
              <div className="space-y-3 mb-6">
                {statLabels.map((key) => (
                  <div key={key} className="flex items-center gap-3">
                    <span className="font-mono text-xs uppercase w-14 shrink-0 text-[var(--color-text-muted)]">
                      {key}
                    </span>
                    <div className="flex-1">
                      <StatBar
                        value={current.stats[key]}
                        accent={current.accentHex}
                        animate={statsAnimated}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Special move */}
              <p className="font-mono text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
                SPECIAL MOVE:
              </p>
              <p className="font-mono text-sm" style={{ color: current.accent }}>
                &ldquo;{current.special}&rdquo;
              </p>

              {/* Description */}
              <p className="font-mono text-sm text-[var(--color-text-muted)] mt-4">
                {current.description}
              </p>
            </div>
          </div>
        </div>

        {/* Code tag */}
        <p className="font-mono text-xs text-[var(--color-text-muted)] mt-8 text-center md:text-left opacity-50">
          {"{ bestuur: 'XI', since: 2026, roster: 4 }"}
        </p>
      </div>

    </section>
  );
}
