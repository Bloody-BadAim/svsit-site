"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GlowEffect } from "@/components/ui/GlowEffect";
import { Magnetic } from "@/components/ui/Magnetic";
import SectionLabel from "@/components/SectionLabel";

gsap.registerPlugin(ScrollTrigger);

export default function JoinCta() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const priceRef = useRef<HTMLDivElement>(null);
  const subtextRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Use the section as trigger for all animations — more reliable after pins
      const sectionTrigger = {
        trigger: sectionRef.current,
        start: "top 80%",
        toggleActions: "play none none none" as const,
      };

      // Heading: fast scale-up entrance
      if (headingRef.current) {
        gsap.fromTo(
          headingRef.current,
          { autoAlpha: 0, scale: 0.85, y: 60 },
          {
            autoAlpha: 1,
            scale: 1,
            y: 0,
            duration: 0.7,
            ease: "back.out(1.4)",
            scrollTrigger: sectionTrigger,
          }
        );
      }

      // Price: slide in from right
      if (priceRef.current) {
        gsap.fromTo(
          priceRef.current,
          { autoAlpha: 0, x: 80 },
          {
            autoAlpha: 1,
            x: 0,
            duration: 0.6,
            ease: "power3.out",
            scrollTrigger: sectionTrigger,
            delay: 0.2,
          }
        );
      }

      // Subtext + button: fade up
      [subtextRef.current, buttonRef.current].forEach((el, i) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { autoAlpha: 0, y: 30 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.6,
            ease: "power3.out",
            scrollTrigger: sectionTrigger,
            delay: 0.35 + i * 0.15,
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="join"
      className="relative min-h-[80vh] flex items-center px-6 md:px-12 lg:px-24 py-32 md:py-40 overflow-hidden"
    >
      {/* Background: radial gold glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(245, 158, 11, 0.06) 0%, transparent 70%)",
        }}
      />

      {/* Subtle noise overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
        }}
      />

      <div className="relative z-10 max-w-[1400px] mx-auto w-full">
        <SectionLabel number="05" label="word lid" />

        {/* Heading — ENORMOUS */}
        <h2
          ref={headingRef}
          className="invisible text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-bold leading-[1.0] tracking-tight mt-8"
        >
          Word lid van{" "}
          <span className="text-[var(--color-accent-gold)]">
            {"{"}SIT{"}"}
          </span>
        </h2>

        {/* Price + subtext + button row */}
        <div className="mt-16 md:mt-20 grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-0 items-end">
          {/* Left: giant price */}
          <div ref={priceRef} className="invisible md:col-span-5">
            <div className="flex items-baseline gap-4">
              <span className="font-mono text-7xl md:text-8xl lg:text-9xl font-bold text-[var(--color-accent-gold)]">
                &euro;10
              </span>
            </div>
            <span className="font-mono text-sm text-[var(--color-text-muted)] mt-2 block">
              eenmalig — lid voor je hele studietijd
            </span>
          </div>

          {/* Right: subtext + button */}
          <div className="md:col-span-5 md:col-start-8 flex flex-col gap-10">
            <p
              ref={subtextRef}
              className="invisible font-mono text-base md:text-lg text-[var(--color-text-muted)] leading-relaxed max-w-md"
            >
              Geen maandelijkse kosten. Toegang tot alle events, workshops, borrels en de SIT community.
            </p>

            <div ref={buttonRef} className="invisible">
              <Magnetic intensity={0.3} range={120}>
                <a
                  href="https://sitlid.nl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative inline-block px-14 py-6 bg-[var(--color-accent-gold)] text-[var(--color-bg)] font-mono font-bold text-base tracking-wide overflow-hidden transition-transform duration-200 hover:scale-[1.03] active:scale-[0.97]"
                >
                  <GlowEffect
                    colors={["#F59E0B", "#D97706", "#FBBF24", "#F59E0B"]}
                    mode="breathe"
                    blur="medium"
                    duration={3}
                    scale={1.2}
                  />
                  <span className="relative z-10">WORD LID →</span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </a>
              </Magnetic>
            </div>

            {/* Code decoration */}
            <div className="font-mono text-xs text-[var(--color-text-muted)] opacity-40">
              <span className="text-[var(--color-accent-blue)]">await</span>{" "}
              <span className="text-[var(--color-text)]">sit</span>
              <span className="text-[var(--color-accent-blue)]">.join</span>
              <span className="text-[var(--color-text-muted)]">(</span>
              <span className="text-[var(--color-accent-gold)]">&apos;jij&apos;</span>
              <span className="text-[var(--color-text-muted)]">);</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
