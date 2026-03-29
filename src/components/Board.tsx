"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SectionLabel from "@/components/SectionLabel";

gsap.registerPlugin(ScrollTrigger);

interface Member {
  name: string;
  role: string;
  image: string | null;
  initials: string;
  accent: string;
  accentHex: string;
}

const members: Member[] = [
  {
    name: "Matin",
    role: "Voorzitter",
    image: "/bestuur/matin.jpeg",
    initials: "MK",
    accent: "var(--color-accent-gold)",
    accentHex: "#F59E0B",
  },
  {
    name: "Riley",
    role: "Penningmeester",
    image: "/bestuur/riley.png",
    initials: "RL",
    accent: "var(--color-accent-blue)",
    accentHex: "#3B82F6",
  },
  {
    name: "Hugo",
    role: "Algemeen bestuurslid",
    image: "/bestuur/hugo.png",
    initials: "HG",
    accent: "var(--color-accent-red)",
    accentHex: "#EF4444",
  },
  {
    name: "Idil",
    role: "Secretaris",
    image: "/bestuur/idil.jpeg",
    initials: "ID",
    accent: "var(--color-accent-green)",
    accentHex: "#22C55E",
  },
];

export default function Board() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

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
        <SectionLabel number="01" label="bestuur xi" />

        <div className="mb-12 md:mb-16">
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight uppercase">
            Bestuur XI
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-3">
            2025/2026
          </p>
        </div>

        {/* Member cards — 4 columns desktop, 2 mobile */}
        <div ref={cardsRef} className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {members.map((member) => (
            <div
              key={member.name}
              className="member-card group relative bg-[var(--color-surface)] border border-[var(--color-border)] p-0 overflow-hidden hover:border-opacity-30 transition-all duration-300"
              style={{
                borderColor: "var(--color-border)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${member.accentHex}4D`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--color-border)";
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
                    loading="lazy"
                    className="object-cover object-[center_30%] group-hover:scale-[1.02] transition-transform duration-500"
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
