"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SectionLabel from "@/components/SectionLabel";
import { BorderTrail } from "@/components/ui/BorderTrail";

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

const HEADING_WORDS_1 = ["De", "studievereniging", "voor"];
const HEADING_GOLD = "ICT studenten";
const HEADING_WORDS_2_POST = "aan de HvA.";

const STATS = [
  { value: 50, suffix: "+", label: "leden", color: "var(--color-accent-gold)" },
  { value: 20, suffix: "+", label: "events per jaar", color: "var(--color-accent-blue)" },
  { value: 2016, suffix: "", label: "opgericht", color: "var(--color-accent-green)" },
];

interface FloatingFragment {
  text: string;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  opacity: number;
  size: string;
}

const FLOATING_FRAGMENTS: FloatingFragment[] = [
  { text: "const", top: "15%", left: "5%", opacity: 0.05, size: "14px" },
  { text: "=>", top: "70%", right: "8%", opacity: 0.06, size: "18px" },
  { text: "{}", bottom: "20%", left: "12%", opacity: 0.04, size: "16px" },
  { text: "//", top: "40%", right: "15%", opacity: 0.05, size: "12px" },
];

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLDivElement>(null);
  const accentRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const fragmentsRef = useRef<HTMLDivElement>(null);
  const [visibleLines, setVisibleLines] = useState(0);
  const [codeInView, setCodeInView] = useState(false);
  const [highlightLine, setHighlightLine] = useState(-1);

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

  // Code block idle highlight cycle after reveal
  useEffect(() => {
    if (visibleLines < codeLines.length) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    let current = 0;
    const interval = setInterval(() => {
      current = (current + 1) % codeLines.length;
      // Skip empty lines
      if (codeLines[current] === "") current = (current + 1) % codeLines.length;
      setHighlightLine(current);
    }, 3000);
    return () => clearInterval(interval);
  }, [visibleLines]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      // Word-by-word heading reveal
      if (headingRef.current) {
        const words = headingRef.current.querySelectorAll(".heading-word");
        if (words.length && !prefersReducedMotion) {
          gsap.fromTo(
            Array.from(words),
            { opacity: 0, y: 24, rotateX: -15 },
            {
              opacity: 1,
              y: 0,
              rotateX: 0,
              duration: 0.6,
              stagger: 0.06,
              ease: "back.out(1.4)",
              scrollTrigger: {
                trigger: headingRef.current,
                start: "top 85%",
                toggleActions: "play none none none",
              },
            }
          );
        }

        // Gold text glow pulse on the ICT studenten words
        const goldWords = headingRef.current.querySelectorAll(".heading-gold");
        if (goldWords.length && !prefersReducedMotion) {
          gsap.fromTo(
            Array.from(goldWords),
            { textShadow: "0 0 0px rgba(245, 158, 11, 0)" },
            {
              textShadow: "0 0 20px rgba(245, 158, 11, 0.4)",
              duration: 0.5,
              delay: HEADING_WORDS_1.length * 0.06 + 0.3,
              scrollTrigger: {
                trigger: headingRef.current,
                start: "top 85%",
                toggleActions: "play none none none",
              },
              onComplete: function () {
                gsap.to(Array.from(goldWords), {
                  textShadow: "0 0 0px rgba(245, 158, 11, 0)",
                  duration: 0.8,
                  ease: "power2.out",
                });
              },
            }
          );
        }
      }

      // Body text clip-path reveal
      if (textRef.current && !prefersReducedMotion) {
        gsap.fromTo(
          textRef.current,
          { clipPath: "inset(0 100% 0 0)" },
          {
            clipPath: "inset(0 0% 0 0)",
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

      // Accent line scale
      if (accentRef.current && !prefersReducedMotion) {
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

      // Stats counter animation
      if (statsRef.current && !prefersReducedMotion) {
        const statEls = statsRef.current.querySelectorAll(".stat-value");
        statEls.forEach((el, i) => {
          const target = STATS[i].value;
          const proxy = { val: 0 };
          gsap.to(proxy, {
            val: target,
            duration: target > 100 ? 2 : 1.5,
            ease: "power2.out",
            scrollTrigger: {
              trigger: statsRef.current,
              start: "top 90%",
              toggleActions: "play none none none",
            },
            delay: i * 0.15,
            onUpdate: () => {
              (el as HTMLElement).textContent =
                Math.round(proxy.val).toString() + STATS[i].suffix;
            },
          });
        });
      }

      // Floating fragments parallax
      if (fragmentsRef.current && !prefersReducedMotion) {
        const frags = fragmentsRef.current.querySelectorAll(".floating-frag");
        frags.forEach((frag) => {
          gsap.to(frag, {
            y: -40,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          });
        });
      }
    }, sectionRef);

    // Observe code block for line-by-line reveal (outside GSAP context for proper cleanup)
    let codeObserver: IntersectionObserver | null = null;
    if (codeRef.current) {
      codeObserver = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setCodeInView(true);
            codeObserver?.disconnect();
          }
        },
        { threshold: 0.3 }
      );
      codeObserver.observe(codeRef.current);
    }

    return () => {
      ctx.revert();
      codeObserver?.disconnect();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative min-h-[70vh] py-24 md:py-32 lg:py-40 px-6 md:px-12 lg:px-24 overflow-hidden"
    >
      {/* ── Background depth layers ── */}

      {/* Layer 0: Background shield */}
      <div className="absolute inset-0 bg-[var(--color-bg)]/70" />

      {/* Layer 0.5: Radial glow near code block */}
      <div
        className="absolute pointer-events-none"
        aria-hidden="true"
        style={{
          top: "20%",
          right: "5%",
          width: "50%",
          height: "60%",
          background: "radial-gradient(ellipse at center, rgba(245, 158, 11, 0.04) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Layer 1: Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage:
            "linear-gradient(rgba(245, 158, 11, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(245, 158, 11, 0.02) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(ellipse 60% 50% at 50% 50%, black 10%, transparent 60%)",
          WebkitMaskImage: "radial-gradient(ellipse 60% 50% at 50% 50%, black 10%, transparent 60%)",
          opacity: 0.6,
        }}
      />

      {/* Layer 2: Floating code fragments */}
      <div ref={fragmentsRef} className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {FLOATING_FRAGMENTS.map((f, i) => (
          <span
            key={i}
            className="floating-frag absolute font-mono select-none text-[var(--color-accent-gold)]"
            style={{
              top: f.top,
              left: f.left,
              right: f.right,
              bottom: f.bottom,
              opacity: f.opacity,
              fontSize: f.size,
            }}
          >
            {f.text}
          </span>
        ))}
      </div>

      {/* Accent line */}
      <div
        ref={accentRef}
        className="absolute top-0 left-6 md:left-12 lg:left-24 right-6 md:right-12 lg:right-24 h-px bg-gradient-to-r from-[var(--color-accent-gold)] via-[var(--color-accent-gold)] to-transparent origin-left z-10"
      />

      <div className="relative max-w-[1400px] mx-auto">
        <SectionLabel number="01" label="over sit" />

        {/* Heading — word-by-word reveal */}
        <div ref={headingRef} className="mb-12 md:mb-16" style={{ perspective: "600px" }}>
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight uppercase">
            <span className="block">
              {HEADING_WORDS_1.map((word, i) => (
                <span
                  key={i}
                  className="heading-word inline-block mr-[0.3em]"
                  style={{ transformOrigin: "bottom center" }}
                >
                  {word}
                </span>
              ))}
            </span>
            <span className="block mt-2">
              <span
                className="heading-word heading-gold inline-block mr-[0.3em] text-[var(--color-accent-gold)]"
                style={{ transformOrigin: "bottom center" }}
              >
                {HEADING_GOLD}
              </span>
              <span
                className="heading-word inline-block"
                style={{ transformOrigin: "bottom center" }}
              >
                {HEADING_WORDS_2_POST}
              </span>
            </span>
          </h2>
        </div>

        {/* Two columns: text left, code block right */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
          {/* Left: body text with clip-path reveal */}
          <div ref={textRef}>
            <p className="font-mono text-base md:text-lg leading-relaxed text-[var(--color-text-muted)]">
              We organiseren <span className="text-[var(--color-accent-blue)]">events</span>, bouwen een <span className="text-[var(--color-accent-green)]">community</span>, en maken je studietijd
              beter. Of je nu <span className="text-[var(--color-accent-blue)]">codeert</span>, <span className="text-[var(--color-accent-red)]">hackt</span>, gamet, of onderneemt.
            </p>
          </div>

          {/* Right: sit.config.ts code block with BorderTrail */}
          <div ref={codeRef} className="relative">
            <div className="relative border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
              <BorderTrail
                className="bg-[var(--color-accent-gold)]"
                size={60}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />
              {/* Terminal chrome */}
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[var(--color-border)]">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent-red)] opacity-60" />
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent-gold)] opacity-60" />
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent-green)] opacity-60" />
                <span className="font-mono text-[10px] text-[var(--color-text-muted)] ml-2">
                  sit.config.ts
                </span>
              </div>
              {/* Code with idle highlight cycle */}
              <div className="p-5 font-mono text-xs md:text-sm leading-[1.9]">
                {codeLines.map((line, i) => (
                  <div
                    key={i}
                    className="flex gap-4 transition-all duration-300"
                    style={{
                      opacity: i < visibleLines ? 1 : 0,
                      transform: i < visibleLines ? "translateX(0)" : "translateX(8px)",
                      background: highlightLine === i ? "rgba(245, 158, 11, 0.04)" : "transparent",
                      marginLeft: -4,
                      marginRight: -4,
                      paddingLeft: 4,
                      paddingRight: 4,
                      borderRadius: 2,
                    }}
                  >
                    <span
                      className="select-none w-4 text-right shrink-0 transition-colors duration-300"
                      style={{
                        color: highlightLine === i ? "var(--color-accent-gold)" : "var(--color-text-muted)",
                        opacity: highlightLine === i ? 0.7 : 0.3,
                      }}
                    >
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

        {/* Stats row */}
        <div
          ref={statsRef}
          className="grid grid-cols-3 gap-8 mt-16 md:mt-20 pt-12 border-t border-[var(--color-border)]"
        >
          {STATS.map((stat, i) => (
            <div key={i} className="text-center md:text-left">
              <span
                className="stat-value font-display text-4xl md:text-5xl lg:text-6xl font-bold block leading-none"
                style={{ color: stat.color }}
              >
                0{stat.suffix}
              </span>
              <span className="font-mono text-[10px] md:text-xs text-[var(--color-text-muted)] uppercase tracking-[0.15em] mt-2 block">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
