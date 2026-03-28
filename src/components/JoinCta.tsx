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
      className="relative min-h-[70vh] flex items-center overflow-hidden"
      style={{ paddingTop: "9rem", paddingBottom: "11rem", paddingLeft: "1.5rem", paddingRight: "1.5rem" }}
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
        <SectionLabel number="04" label="word lid" />

        {/* Heading — ENORMOUS */}
        <h2
          ref={headingRef}
          className="invisible text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-bold leading-[1.0] tracking-tight"
          style={{ marginTop: "2rem" }}
        >
          Word lid van{" "}
          <span className="text-[var(--color-accent-gold)]">{"{"}</span>
          <span className="text-[var(--color-text)]">SIT</span>
          <span className="text-[var(--color-accent-gold)]">{"}"}</span>
        </h2>

        {/* Price + subtext + button row */}
        <div className="grid grid-cols-1 md:grid-cols-12 items-end" style={{ marginTop: "7rem", gap: "3rem" }}>
          {/* Left: giant price */}
          <div ref={priceRef} className="invisible md:col-span-5">
            <div className="flex items-baseline" style={{ gap: "1rem" }}>
              <span className="font-mono text-7xl md:text-8xl lg:text-9xl font-bold text-[var(--color-accent-gold)]">
                &euro;10
              </span>
            </div>
            <span className="font-mono text-sm text-[var(--color-text-muted)] block" style={{ marginTop: "0.5rem" }}>
              eenmalig — lid voor je hele studiejaar
            </span>
            <span className="font-mono text-[10px] text-[var(--color-accent-red)] block opacity-50" style={{ marginTop: "0.5rem" }}>
              {"// RangeError: price too low to be real"}
            </span>
          </div>

          {/* Right: subtext + button */}
          <div className="md:col-span-5 md:col-start-8 flex flex-col" style={{ gap: "3.5rem" }}>
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
