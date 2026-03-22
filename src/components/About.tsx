"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SectionLabel from "@/components/SectionLabel";

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const line3Ref = useRef<HTMLParagraphElement>(null);
  const accentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Stagger reveal each line
      const lines = [line1Ref.current, line2Ref.current, line3Ref.current];

      lines.forEach((line, i) => {
        if (!line) return;
        gsap.fromTo(
          line,
          { opacity: 0, y: 40, skewY: 2 },
          {
            opacity: 1,
            y: 0,
            skewY: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: line,
              start: "top 85%",
              end: "top 60%",
              toggleActions: "play none none none",
            },
            delay: i * 0.15,
          }
        );
      });

      // Accent line grows in
      if (accentRef.current) {
        gsap.fromTo(
          accentRef.current,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: accentRef.current,
              start: "top 85%",
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
      id="about"
      className="relative pt-48 md:pt-64 pb-56 md:pb-80 px-6 md:px-12 lg:px-24"
    >
      {/* Top border accent */}
      <div
        ref={accentRef}
        className="absolute top-0 left-6 md:left-12 lg:left-24 right-6 md:right-12 lg:right-24 h-px bg-gradient-to-r from-[var(--color-accent-gold)] via-[var(--color-accent-gold)] to-transparent origin-left"
      />

      <div className="max-w-[1400px] mx-auto">
        <SectionLabel number="01" label="over sit" />

        {/* Main text — large, bold, asymmetric */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16">
          {/* Left column: big statement */}
          <div className="md:col-span-7 md:col-start-1">
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
              <span ref={line1Ref} className="block opacity-0">
                De studievereniging voor
              </span>
              <span ref={line2Ref} className="block opacity-0 mt-2">
                <span className="text-[var(--color-accent-gold)]">ICT studenten</span> aan de HvA.
              </span>
            </h2>
          </div>

          {/* Right column: supporting text, offset down */}
          <div className="md:col-span-4 md:col-start-9 md:pt-16 lg:pt-24">
            <p
              ref={line3Ref}
              className="opacity-0 font-mono text-base md:text-lg leading-relaxed text-[var(--color-text-muted)]"
            >
              We organiseren events, bouwen een community, en maken je studietijd
              beter. Gerund door studenten die weten wat ze doen.
            </p>

            {/* Code-style decoration */}
            <div className="mt-10 font-mono text-xs text-[var(--color-text-muted)] opacity-50">
              <span className="text-[var(--color-accent-blue)]">const</span>{" "}
              <span className="text-[var(--color-text)]">sit</span>{" "}
              <span className="text-[var(--color-accent-gold)]">=</span>{" "}
              <span className="text-[var(--color-accent-red)]">new</span>{" "}
              <span className="text-[var(--color-accent-blue)]">Vereniging</span>
              <span className="text-[var(--color-text-muted)]">();</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
