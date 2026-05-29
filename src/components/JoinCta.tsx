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
    if (prefersReducedMotion) return;

    let ctx: gsap.Context | null = null;
    let cancelled = false;

    const hasIdleCb = "requestIdleCallback" in window;
    const idleId: number = hasIdleCb
      ? window.requestIdleCallback(initGsap)
      : (setTimeout(initGsap, 1) as unknown as number);

    function initGsap() {
      if (cancelled) return;

      ctx = gsap.context(() => {
        const sectionTrigger = {
          trigger: sectionRef.current,
          start: "top 80%",
          toggleActions: "play none none none" as const,
          once: true,
        };

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
    }

    return () => {
      cancelled = true;
      if (hasIdleCb) {
        window.cancelIdleCallback(idleId);
      } else {
        clearTimeout(idleId);
      }
      ctx?.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="join"
      className="relative flex items-center overflow-hidden py-28 md:py-36 lg:py-44 px-6 md:px-12 lg:px-24"
    >
      {/* Background layers */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(242, 158, 24, 0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(242, 158, 24, 0.015) 1px, transparent 1px)",
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
          background: "radial-gradient(ellipse at center, rgba(242, 158, 24, 0.08) 0%, transparent 70%)",
          filter: "blur(40px)",
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
          {/* Left: pitch */}
          <div ref={leftRef}>
            <div data-animate className="flex items-center gap-2 mb-8">
              <span
                className="w-2 h-2 rounded-full bg-[var(--color-accent-green)]"
                style={{ animation: "statusPulse 1.5s ease-in-out infinite" }}
              />
              <span className="font-mono text-xs text-[var(--color-text-muted)]">
                SIT is actief — Bestuur XI
              </span>
            </div>

            <div data-animate>
              <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight uppercase">
                Jouw Community
                <br />
                <span className="text-[var(--color-accent-gold)]">Wacht</span>
              </h2>
            </div>

            <p data-animate className="font-mono text-base md:text-lg text-[var(--color-text-muted)] leading-relaxed mt-6 max-w-lg">
              Events, borrels, hackathons, workshops en een netwerk van{" "}
              <span className="text-[var(--color-text)]">HBO-ICT studenten</span>{" "}
              die dezelfde opleiding doorlopen. Van Software Engineering tot Game Dev, iedereen zit hier.
            </p>

            <div data-animate className="mt-10">
              <div className="flex items-baseline gap-3">
                <span className="font-display text-5xl md:text-6xl font-bold text-[var(--color-accent-gold)]">
                  &euro;9,99
                </span>
                <span className="font-mono text-sm text-[var(--color-text-muted)]">
                  per jaar — geen verborgen kosten
                </span>
              </div>
            </div>
          </div>

          {/* Right: clean member card */}
          <div ref={cardRef} className="flex justify-center lg:justify-end">
            <MemberCard
              className="w-full max-w-[400px]"
              data={{
                name: 'JOUW NAAM',
                role: 'member',
                commissie: null,
                total_xp: 0,
                skin: 'skin_default',
                activeBadges: [],
                dynamicStats: { code: 0, social: 0, career: 0, game: 0 },
              }}
              equipment={{
                frameColor: 'var(--color-accent-gold)',
                accentColor: 'var(--color-accent-gold)',
                stickers: [],
              }}
            >
              <HoldToJoinButton href="/login" />
              <p className="font-mono text-[11px] text-[var(--color-text-muted)] opacity-40 mt-3 text-center">
                100+ studenten gingen je voor
              </p>
              <p className="font-mono text-[11px] text-[var(--color-text-muted)] mt-2 text-center">
                Al lid?{" "}
                <a href="/login" className="text-[var(--color-accent-blue)] hover:underline">Log in</a>
                {" · "}
                <a href="/commissies" className="text-[var(--color-accent-gold)] hover:underline">Bekijk commissies</a>
              </p>
            </MemberCard>
          </div>
        </div>
      </div>
    </section>
  );
}
