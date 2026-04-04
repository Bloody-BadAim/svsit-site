"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SectionLabel from "@/components/SectionLabel";

interface Member {
  name: string;
  role: string;
  image: string | null;
  initials: string;
  accent: string;
  accentHex: string;
  stats: { code: number; chaos: number; coffee: number; social: number };
  special: string;
}

const members: Member[] = [
  {
    name: "Matin",
    role: "Voorzitter",
    image: "/bestuur/matin.jpeg",
    initials: "MK",
    accent: "var(--color-accent-gold)",
    accentHex: "#F59E0B",
    stats: { code: 9, chaos: 7, coffee: 10, social: 8 },
    special: "git push --force",
  },
  {
    name: "Riley",
    role: "Penningmeester",
    image: "/bestuur/riley.png",
    initials: "RL",
    accent: "var(--color-accent-blue)",
    accentHex: "#3B82F6",
    stats: { code: 6, chaos: 4, coffee: 7, social: 9 },
    special: "Budget approved: €0.00",
  },
  {
    name: "Hugo",
    role: "Algemeen bestuurslid",
    image: "/bestuur/hugo.png",
    initials: "HG",
    accent: "var(--color-accent-red)",
    accentHex: "#EF4444",
    stats: { code: 7, chaos: 8, coffee: 6, social: 10 },
    special: "sudo rm -rf /boredom",
  },
  {
    name: "Idil",
    role: "Secretaris",
    image: "/bestuur/idil.jpeg",
    initials: "ID",
    accent: "var(--color-accent-green)",
    accentHex: "#22C55E",
    stats: { code: 7, chaos: 5, coffee: 8, social: 9 },
    special: "Notulen.final_final_v3.docx",
  },
];

function InspectOverlay({ member, visible }: { member: Member; visible: boolean }) {
  const stats = Object.entries(member.stats);

  return (
    <div
      className="absolute inset-0 z-10 flex items-end transition-all duration-300 pointer-events-none"
      style={{
        opacity: visible ? 1 : 0,
        backdropFilter: visible ? "blur(4px)" : "blur(0px)",
        background: visible ? "rgba(9, 9, 11, 0.75)" : "transparent",
      }}
    >
      <div className="w-full p-4 font-mono text-xs leading-relaxed">
        <p style={{ color: member.accent }}>
          {">"} inspect({member.name.toLowerCase()})
        </p>
        <p className="text-[var(--color-text-muted)]">{"{"}</p>
        <p className="text-[var(--color-text-muted)] pl-3">
          <span className="text-[var(--color-accent-blue)]">role</span>: <span className="text-[var(--color-accent-gold)]">&apos;{member.role}&apos;</span>,
        </p>
        {stats.map(([key, val]) => (
          <p key={key} className="text-[var(--color-text-muted)] pl-3">
            <span className="text-[var(--color-accent-blue)]">{key}</span>: <span className="text-[var(--color-accent-red)]">{val}</span>,
          </p>
        ))}
        <p className="text-[var(--color-text-muted)] pl-3">
          <span className="text-[var(--color-accent-blue)]">move</span>: <span className="text-[var(--color-accent-gold)]">&apos;{member.special}&apos;</span>
        </p>
        <p className="text-[var(--color-text-muted)]">{"}"}</p>
      </div>
    </div>
  );
}

export default function Board() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (cardsRef.current) {
        const cards = cardsRef.current.querySelectorAll(".member-card");
        gsap.fromTo(
          cards,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.12,
            ease: "power3.out",
            scrollTrigger: {
              trigger: cardsRef.current,
              start: "top 80%",
              toggleActions: "play none none none",
              once: true,
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="bestuur"
      className="relative py-24 md:py-32 lg:py-40 px-6 md:px-12 lg:px-24"
    >
      <div className="max-w-[1400px] mx-auto">
        <SectionLabel number="05" label="bestuur xi" />

        <div className="mb-12 md:mb-16">
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight uppercase">
            Bestuur XI
          </h2>
          <p className="font-mono text-sm text-[var(--color-text-muted)] mt-3">
            2025/2026
          </p>
        </div>

        <div ref={cardsRef} className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {members.map((member, i) => (
            <div
              key={member.name}
              className="member-card group relative bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden transition-all duration-300 cursor-pointer"
              aria-label={`${member.name}, ${member.role} — klik voor stats`}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => setHoveredIndex(hoveredIndex === i ? null : i)}
              style={{
                borderColor: hoveredIndex === i ? `${member.accentHex}4D` : "var(--color-border)",
              }}
            >
              {/* Photo */}
              <div className="aspect-[3/4] overflow-hidden relative">
                {member.image ? (
                  <Image
                    src={member.image}
                    alt={`${member.name}, ${member.role} van SIT`}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    quality={85}
                    loading={i === 0 ? "eager" : "lazy"}
                    priority={i === 0}
                    className="object-cover object-[center_30%] transition-transform duration-500"
                    style={{
                      transform: hoveredIndex === i ? "scale(1.02)" : "scale(1)",
                    }}
                  />
                ) : (
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ backgroundColor: `${member.accentHex}15` }}
                  >
                    <span
                      className="font-mono font-bold text-5xl select-none"
                      style={{ color: member.accent }}
                    >
                      {member.initials}
                    </span>
                  </div>
                )}

                {/* RPG stats hover overlay */}
                <InspectOverlay member={member} visible={hoveredIndex === i} />
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-display text-lg font-bold uppercase">
                  {member.name}
                </h3>
                <p className="text-sm text-[var(--color-text-muted)] font-mono">
                  {member.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
