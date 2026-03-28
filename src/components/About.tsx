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
  const statsRef = useRef<HTMLDivElement>(null);

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

      // Stats count-up
      if (statsRef.current) {
        const counters = statsRef.current.querySelectorAll<HTMLElement>("[data-target]");
        counters.forEach((el) => {
          const target = parseFloat(el.dataset.target ?? "0");
          const obj = { val: 0 };
          gsap.to(obj, {
            val: target,
            duration: 1.5,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions: "play none none none",
            },
            onUpdate: () => {
              const prefix = el.dataset.prefix ?? "";
              const suffix = el.dataset.suffix ?? "";
              el.textContent = prefix + Math.round(obj.val) + suffix;
            },
          });
        });

        // Fade in stat items
        const items = statsRef.current.querySelectorAll(".stat-item");
        gsap.fromTo(
          items,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: statsRef.current,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      // Parallax: right column drifts up slowly
      const rightCol = sectionRef.current?.querySelector('.about-right-col');
      if (rightCol) {
        gsap.to(rightCol, {
          y: -40,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative pt-32 md:pt-44 pb-36 md:pb-48 px-6 md:px-12 lg:px-24"
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
          <div className="about-right-col md:col-span-4 md:col-start-9 md:pt-16 lg:pt-24">
            <p
              ref={line3Ref}
              className="opacity-0 font-mono text-base md:text-lg leading-relaxed text-[var(--color-text-muted)]"
            >

              We organiseren <span className="text-[var(--color-accent-blue)]">events</span>, bouwen een community, en maken je studietijd
              beter. Of je nu <span className="text-[var(--color-accent-blue)]">codeert</span>, hackt, gamet, of onderneemt.
            </p>

            {/* Error comment */}
            <p className="font-mono text-xs text-[var(--color-accent-red)] opacity-50 mt-3">
              {"// ERROR: te weinig pizza bij events"}
            </p>

            {/* Stats grid */}
            <div ref={statsRef} className="mt-16 grid grid-cols-2 gap-10">
              <div className="stat-item opacity-0">
                <span
                  className="block font-mono text-4xl md:text-5xl font-bold text-[var(--color-accent-gold)]"
                  data-target="2015"
                >
                  0
                </span>
                <span className="font-mono text-sm text-[var(--color-text-muted)] mt-1 block">
                  <span className="text-[var(--color-accent-blue)] opacity-60">const</span> sinds
                </span>
              </div>
              <div className="stat-item opacity-0 group/spec cursor-default">
                <span
                  className="block font-mono text-4xl md:text-5xl font-bold text-[var(--color-accent-blue)]"
                  data-target="5"
                  data-suffix="+"
                >
                  0
                </span>
                <span className="font-mono text-sm text-[var(--color-text-muted)] mt-1 block">
                  specialisaties
                </span>
                <div className="overflow-hidden max-h-0 group-hover/spec:max-h-40 transition-all duration-500 ease-out">
                  <div className="flex flex-wrap gap-1.5 pt-3 font-mono text-[10px] text-[var(--color-text-muted)]">
                    <span className="px-1.5 py-0.5 border border-[var(--color-border)]">SE</span>
                    <span className="px-1.5 py-0.5 border border-[var(--color-border)]">Cyber</span>
                    <span className="px-1.5 py-0.5 border border-[var(--color-border)]">Game Dev</span>
                    <span className="px-1.5 py-0.5 border border-[var(--color-border)]">Business IT</span>
                    <span className="px-1.5 py-0.5 border border-[var(--color-border)]">TI</span>
                  </div>
                </div>
              </div>
              <div className="stat-item opacity-0">
                <span
                  className="block font-mono text-4xl md:text-5xl font-bold text-[var(--color-accent-red)]"
                  data-target="20"
                  data-suffix="+"
                >
                  0
                </span>
                <span className="font-mono text-sm text-[var(--color-text-muted)] mt-1 block">
                  events per jaar
                </span>
              </div>
              <div className="stat-item opacity-0">
                <span
                  className="block font-mono text-4xl md:text-5xl font-bold text-[var(--color-accent-green)]"
                  data-target="10"
                  data-prefix="€"
                >
                  0
                </span>
                <span className="font-mono text-sm text-[var(--color-text-muted)] mt-1 block">
                  lidmaatschap
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
