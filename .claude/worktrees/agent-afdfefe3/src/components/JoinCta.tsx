"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SectionLabel from "@/components/SectionLabel";
import HoldToJoinButton from "@/components/HoldToJoinButton";
import MemberCard from "@/components/MemberCard";

export default function JoinCta() {
  const sectionRef = useRef<HTMLElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) return;

      const sectionTrigger = {
        trigger: sectionRef.current,
        start: "top 80%",
        toggleActions: "play none none none" as const,
        once: true,
      };

      // Left column stagger entrance
      if (leftRef.current) {
        const els = leftRef.current.querySelectorAll("[data-animate]");
        gsap.fromTo(
          Array.from(els),
          { autoAlpha: 0, y: 24 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.7,
            ease: "power3.out",
            stagger: 0.1,
            scrollTrigger: sectionTrigger,
          }
        );
      }

      // Card entrance
      if (cardRef.current) {
        gsap.fromTo(
          cardRef.current,
          { autoAlpha: 0, y: 40, scale: 0.96 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: sectionTrigger,
            delay: 0.2,
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="join"
      className="relative flex items-center overflow-hidden py-20 md:py-24 lg:py-28 px-6 md:px-12 lg:px-24"
    >
      {/* Background layers */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(245, 158, 11, 0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(245, 158, 11, 0.015) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 50%, black 30%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 50%, black 30%, transparent 80%)",
        }}
      />

      <div
        aria-hidden="true"
        className="absolute pointer-events-none"
        style={{
          top: "20%",
          left: "20%",
          width: "60%",
          height: "60%",
          background: "radial-gradient(ellipse at center, rgba(245, 158, 11, 0.08) 0%, transparent 70%)",
          filter: "blur(80px)",
          animation: "joinPulse 6s ease-in-out infinite alternate",
          willChange: "transform",
        }}
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[var(--color-bg)]/70 pointer-events-none"
      />

      {/* Content */}
      <div className="relative z-10 max-w-[1400px] mx-auto w-full">
        <SectionLabel number="04" label="word lid" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center mt-8">
          {/* Left: pitch — clean vertical flow */}
          <div ref={leftRef}>
            {/* Active indicator */}
            <div data-animate className="flex items-center gap-2 mb-8">
              <span
                className="w-2 h-2 rounded-full bg-[var(--color-accent-green)]"
                style={{ animation: "statusPulse 1.5s ease-in-out infinite" }}
              />
              <span className="font-mono text-xs text-[var(--color-text-muted)]">
                SIT is actief — Bestuur XI
              </span>
            </div>

            {/* Heading */}
            <div data-animate>
              <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight uppercase">
                Start Je
                <br />
                <span className="text-[var(--color-accent-gold)]">Avontuur</span>
              </h2>
            </div>

            {/* Description */}
            <p data-animate className="font-mono text-base md:text-lg text-[var(--color-text-muted)] leading-relaxed mt-6 max-w-lg">
              Word lid en ontvang je eigen digitale
              <br />
              <span className="text-[var(--color-text)]">SIT member card</span>.
              {" "}Toegang tot alle events, workshops en de community.
            </p>

            {/* Price */}
            <div data-animate className="mt-10">
              <div className="flex items-baseline gap-3">
                <span className="font-display text-5xl md:text-6xl font-bold text-[var(--color-accent-gold)]">
                  &euro;10
                </span>
                <span className="font-mono text-sm text-[var(--color-text-muted)]">
                  eenmalig — lid voor je hele studiejaar
                </span>
              </div>
            </div>
          </div>

          {/* Right: member card */}
          <div ref={cardRef} className="flex justify-center lg:justify-end">
            <MemberCard className="w-full max-w-[400px]" data={{ name: 'Jouw Naam', role: 'member', commissie: null, total_xp: 0, skin: 'skin_gold' }}>
              <HoldToJoinButton href="/login" />
              <p className="font-mono text-[11px] text-[var(--color-text-muted)] opacity-40 mt-3 text-center">
                200+ studenten gingen je voor
              </p>
              <p className="font-mono text-[11px] text-[var(--color-text-muted)] mt-2 text-center">
                Al lid?{" "}
                <a href="/login" className="text-[var(--color-accent-blue)] hover:underline">Log in</a>
                {" · "}
                <a href="/organisatie" className="text-[var(--color-accent-gold)] hover:underline">Bekijk commissies →</a>
              </p>
            </MemberCard>
          </div>
        </div>
      </div>
    </section>
  );
}
