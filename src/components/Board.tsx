"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SectionLabel from "@/components/SectionLabel";

gsap.registerPlugin(ScrollTrigger);

const members = [
  { name: "Matin", role: "Voorzitter", initials: "MK", image: "/matin.jpeg" },
  { name: "Riley", role: "Penningmeester", initials: "RL", image: null },
  { name: "Hugo", role: "Secretaris", initials: "HG", image: null },
  { name: "Idil", role: "Bestuurslid", initials: "ID", image: null },
];

export default function Board() {
  const sectionRef = useRef<HTMLElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!stripRef.current) return;

      const items = stripRef.current.querySelectorAll(".board-member");
      gsap.fromTo(
        items,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: stripRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="bestuur"
      className="relative pt-40 md:pt-56 pb-32 md:pb-48 px-6 md:px-12 lg:px-24"
    >
      <div className="max-w-[1400px] mx-auto">
        <SectionLabel number="04" label="bestuur xi" />

        {/* Horizontal strip layout */}
        <div
          ref={stripRef}
          className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[var(--color-border)]"
        >
          {members.map((member) => (
            <div
              key={member.name}
              className="board-member group relative bg-[var(--color-bg)] flex flex-col justify-between min-h-[220px] md:min-h-[280px] overflow-hidden transition-colors duration-300"
            >
              {/* Photo background (only for members with image) */}
              {member.image ? (
                <>
                  <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-500 group-hover:brightness-110 group-hover:contrast-105"
                    style={{ backgroundImage: `url(${member.image})` }}
                  />
                  {/* Dark gradient overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)] via-[var(--color-bg)]/60 to-[var(--color-bg)]/20" />
                  {/* Subtle initials over photo */}
                  <span className="relative z-10 p-8 md:p-10 font-mono text-3xl md:text-4xl font-bold text-white/10 group-hover:text-[var(--color-accent-gold)]/20 transition-all duration-300">
                    {member.initials}
                  </span>
                </>
              ) : (
                <>
                  <div className="absolute inset-0 group-hover:bg-[var(--color-surface)] transition-colors duration-300" />
                  <span className="relative z-10 p-8 md:p-10 font-mono text-3xl md:text-4xl font-bold text-[var(--color-text-muted)] opacity-20 group-hover:opacity-40 group-hover:text-[var(--color-accent-gold)] transition-all duration-300">
                    {member.initials}
                  </span>
                </>
              )}

              <div className="relative z-10 mt-auto p-8 md:p-10 pt-0">
                <h3 className="text-xl md:text-2xl font-bold tracking-tight mb-1">
                  {member.name}
                </h3>
                <span className="font-mono text-xs text-[var(--color-text-muted)] tracking-wide">
                  {member.role}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bestuur tag — more spacing */}
        <div className="mt-16 md:mt-20 font-mono text-xs text-[var(--color-text-muted)] opacity-40">
          <span className="text-[var(--color-accent-gold)]">{"{"}</span>
          {" bestuur: 'XI', since: 2026 "}
          <span className="text-[var(--color-accent-gold)]">{"}"}</span>
        </div>
      </div>
    </section>
  );
}
