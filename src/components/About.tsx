"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SectionLabel from "@/components/SectionLabel";

gsap.registerPlugin(ScrollTrigger);

const codeLines = [
  "// sit.config.ts",
  "const sit = new Vereniging({",
  "  naam: 'SIT',",
  "  bestuur: 'XI',",
  "  missie: 'tech + fun',",
  "});",
  "",
  "await sit.launch();",
];

function colorize(line: string) {
  return line
    .replace(
      /\b(const|new|await)\b/g,
      '<span style="color: var(--color-accent-blue)">$1</span>'
    )
    .replace(
      /('[^']*')/g,
      '<span style="color: var(--color-accent-gold)">$1</span>'
    )
    .replace(
      /(\/\/.*$)/,
      '<span style="color: var(--color-accent-green)">$1</span>'
    )
    .replace(
      /(\d+)/g,
      '<span style="color: var(--color-accent-red)">$1</span>'
    );
}

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLDivElement>(null);
  const accentRef = useRef<HTMLDivElement>(null);
  const [visibleLines, setVisibleLines] = useState(0);
  const [codeInView, setCodeInView] = useState(false);

  // Code block line reveal when in view
  useEffect(() => {
    if (!codeInView) return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setVisibleLines(i);
      if (i >= codeLines.length) clearInterval(interval);
    }, 120);
    return () => clearInterval(interval);
  }, [codeInView]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      [line1Ref.current, line2Ref.current].forEach((line, i) => {
        if (!line) return;
        gsap.fromTo(
          line,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: line,
              start: "top 85%",
              toggleActions: "play none none none",
            },
            delay: i * 0.15,
          }
        );
      });

      if (textRef.current) {
        gsap.fromTo(
          textRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: textRef.current,
              start: "top 85%",
              toggleActions: "play none none none",
            },
            delay: 0.3,
          }
        );
      }

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

      // Observe code block for line-by-line reveal
      if (codeRef.current) {
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              setCodeInView(true);
              observer.disconnect();
            }
          },
          { threshold: 0.3 }
        );
        observer.observe(codeRef.current);
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative py-24 md:py-32 lg:py-40 px-6 md:px-12 lg:px-24"
    >
      {/* Background shield */}
      <div className="absolute inset-0 bg-[var(--color-bg)]/70" />

      <div
        ref={accentRef}
        className="absolute top-0 left-6 md:left-12 lg:left-24 right-6 md:right-12 lg:right-24 h-px bg-gradient-to-r from-[var(--color-accent-gold)] via-[var(--color-accent-gold)] to-transparent origin-left z-10"
      />

      <div className="relative max-w-[1400px] mx-auto">
        <SectionLabel number="01" label="over sit" />

        {/* Heading */}
        <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight uppercase mb-12 md:mb-16">
          <span ref={line1Ref} className="block">
            De studievereniging voor
          </span>
          <span ref={line2Ref} className="block mt-2">
            <span className="text-[var(--color-accent-gold)]">ICT studenten</span> aan de HvA.
          </span>
        </h2>

        {/* Two columns: text left, code block right */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
          {/* Left: body text */}
          <div ref={textRef}>
            <p className="font-mono text-base md:text-lg leading-relaxed text-[var(--color-text-muted)]">
              We organiseren <span className="text-[var(--color-accent-blue)]">events</span>, bouwen een <span className="text-[var(--color-accent-green)]">community</span>, en maken je studietijd
              beter. Of je nu <span className="text-[var(--color-accent-blue)]">codeert</span>, <span className="text-[var(--color-accent-red)]">hackt</span>, gamet, of onderneemt.
            </p>
          </div>

          {/* Right: sit.config.ts code block */}
          <div ref={codeRef}>
            <div className="border border-[var(--color-border)] bg-[var(--color-surface)]">
              {/* Terminal chrome */}
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[var(--color-border)]">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent-red)] opacity-60" />
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent-gold)] opacity-60" />
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent-green)] opacity-60" />
                <span className="font-mono text-[10px] text-[var(--color-text-muted)] ml-2">
                  sit.config.ts
                </span>
              </div>
              {/* Code */}
              <div className="p-5 font-mono text-xs md:text-sm leading-[1.9]">
                {codeLines.map((line, i) => (
                  <div
                    key={i}
                    className="flex gap-4 transition-all duration-300"
                    style={{
                      opacity: i < visibleLines ? 1 : 0,
                      transform: i < visibleLines ? "translateX(0)" : "translateX(8px)",
                    }}
                  >
                    <span className="text-[var(--color-text-muted)] opacity-30 select-none w-4 text-right shrink-0">
                      {i + 1}
                    </span>
                    <span
                      dangerouslySetInnerHTML={{ __html: colorize(line) }}
                      className="text-[var(--color-text)] opacity-80"
                    />
                  </div>
                ))}
                {visibleLines > 0 && visibleLines < codeLines.length && (
                  <div className="flex gap-4">
                    <span className="w-4 shrink-0" />
                    <span className="inline-block w-[7px] h-[14px] bg-[var(--color-accent-gold)] animate-pulse" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
