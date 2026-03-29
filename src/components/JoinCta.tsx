"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SectionLabel from "@/components/SectionLabel";
import HoldToJoinButton from "@/components/HoldToJoinButton";

gsap.registerPlugin(ScrollTrigger);

export default function JoinCta() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const priceRef = useRef<HTMLDivElement>(null);
  const subtextRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const sectionTrigger = {
        trigger: sectionRef.current,
        start: "top 80%",
        toggleActions: "play none none none" as const,
      };

      if (headingRef.current) {
        gsap.fromTo(
          headingRef.current,
          { autoAlpha: 0, y: 30 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: sectionTrigger,
          }
        );
      }

      if (priceRef.current) {
        gsap.fromTo(
          priceRef.current,
          { autoAlpha: 0, y: 30 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: sectionTrigger,
            delay: 0.15,
          }
        );
      }

      [subtextRef.current, buttonRef.current].forEach((el, i) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { autoAlpha: 0, y: 30 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: sectionTrigger,
            delay: 0.3 + i * 0.15,
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
      className="relative min-h-[70vh] flex items-center overflow-hidden py-24 md:py-32 lg:py-40 px-6 md:px-12 lg:px-24"
    >
      {/* Background: radial gold glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(245, 158, 11, 0.06) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-[1400px] mx-auto w-full">
        <SectionLabel number="04" label="word lid" />

        {/* Heading */}
        <h2
          ref={headingRef}
          className="invisible font-display text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-bold leading-[1.0] tracking-tight uppercase mt-8"
        >
          Word lid van{" "}
          <span className="text-[var(--color-accent-gold)]">{"{"}</span>
          <span className="text-[var(--color-text)]">SIT</span>
          <span className="text-[var(--color-accent-gold)]">{"}"}</span>
        </h2>

        {/* Price + subtext + button */}
        <div className="grid grid-cols-1 md:grid-cols-12 items-end mt-16 md:mt-28 gap-12">
          {/* Left: giant price */}
          <div ref={priceRef} className="invisible md:col-span-5">
            <div className="flex items-baseline gap-4">
              <span className="font-mono text-7xl md:text-8xl lg:text-9xl font-bold text-[var(--color-accent-gold)]">
                &euro;10
              </span>
            </div>
            <span className="font-mono text-sm text-[var(--color-text-muted)] block mt-2">
              eenmalig — lid voor je hele studiejaar
            </span>
            <span className="font-mono text-[10px] text-[var(--color-accent-red)] block opacity-50 mt-2">
              {"// RangeError: price too low to be real"}
            </span>
          </div>

          {/* Right: subtext + button */}
          <div className="md:col-span-5 md:col-start-8 flex flex-col gap-10">
            <p
              ref={subtextRef}
              className="invisible font-mono text-base md:text-lg text-[var(--color-text-muted)] leading-relaxed max-w-md"
            >
              <span className="text-[var(--color-accent-blue)]">Geen</span> maandelijkse kosten. Toegang tot alle <span className="text-[var(--color-accent-blue)]">events</span>, workshops, borrels en de SIT community.
            </p>

            <div ref={buttonRef} className="invisible">
              <HoldToJoinButton href="https://sitlid.nl" />
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
