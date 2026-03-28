"use client";

import { useEffect, useRef, useState } from "react";
import { GlowEffect } from "@/components/ui/GlowEffect";
import HeroBackground from "@/components/HeroBackground";

const codeLines = [
  "import { SIT } from '@hva/verenigingen';",
  "",
  "const sit = new Vereniging({",
  "  naam: 'Studievereniging HBO-ICT',",
  "  bestuur: 'XI',",
  "  missie: 'tech + fun',",
  "});",
  "",
  "sit.events = [",
  "  'borrels', 'hackathons',",
  "  'workshops', 'kroegentochten',",
  "  'game nights', 'tech talks',",
  "];",
  "",
  "sit.voor = [",
  "  'software engineers',",
  "  'cyber security',",
  "  'game developers',",
  "  'business IT',",
  "  'technische informatica',",
  "];",
  "",
  "await sit.launch();",
];

function colorize(line: string) {
  return line
    .replace(
      /\b(import|from|const|new|await)\b/g,
      '<span style="color: var(--color-accent-blue)">$1</span>'
    )
    .replace(
      /('[^']*'|`[^`]*`)/g,
      '<span style="color: var(--color-accent-gold)">$1</span>'
    )
    .replace(
      /(\/\/.*$)/,
      '<span style="color: var(--color-accent-green)">$1</span>'
    )
    .replace(
      /(\.\w+)/g,
      '<span style="color: var(--color-accent-red)">$1</span>'
    );
}

function CodeSnippet({ phase }: { phase: "typing" | "done" }) {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    if (phase !== "done") return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setVisibleLines(i);
      if (i >= codeLines.length) clearInterval(interval);
    }, 180);
    return () => clearInterval(interval);
  }, [phase]);

  return (
    <div className="hidden lg:block absolute right-12 xl:right-24 top-1/2 -translate-y-1/2 z-10 w-[420px] opacity-0 animate-[fadeIn_1s_ease_1.5s_forwards]">
      {/* Terminal window chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border border-[var(--color-border)] border-b-0 bg-[var(--color-surface)]">
        <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent-red)] opacity-60" />
        <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent-gold)] opacity-60" />
        <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent-green)] opacity-60" />
        <span className="ml-3 font-mono text-[10px] text-[var(--color-text-muted)]">
          sit.config.ts
        </span>
      </div>
      {/* Code content */}
      <div className="bg-[var(--color-surface)]/50 backdrop-blur-sm border border-[var(--color-border)] p-5 font-mono text-xs leading-[1.9]">
        {codeLines.map((line, i) => (
          <div
            key={i}
            className="flex gap-4 transition-all duration-300"
            style={{
              opacity: i < visibleLines ? 1 : 0,
              transform: i < visibleLines ? "translateX(0)" : "translateX(10px)",
            }}
          >
            <span className="text-[var(--color-text-muted)] opacity-30 select-none w-5 text-right shrink-0">
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
            <span className="w-5 shrink-0" />
            <span className="inline-block w-[7px] h-[14px] bg-[var(--color-accent-gold)] animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
}

export default function Hero() {
  const [typedText, setTypedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [phase, setPhase] = useState<"typing" | "done">("typing");
  const heroRef = useRef<HTMLDivElement>(null);

  const fullText = "{SIT}";

  // Typing animation
  useEffect(() => {
    let i = 0;
    const typeInterval = setInterval(() => {
      if (i < fullText.length) {
        setTypedText(fullText.slice(0, i + 1));
        i++;
      } else {
        setPhase("done");
        clearInterval(typeInterval);
      }
    }, 180);

    return () => clearInterval(typeInterval);
  }, []);

  // Cursor blink
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);
    return () => clearInterval(blinkInterval);
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative flex items-center justify-center min-h-screen overflow-hidden"
    >
      {/* Epic animated background */}
      <HeroBackground />

      {/* Content — shifted above dead center */}
      <div className="relative z-10 flex flex-col items-start px-6 md:px-12 lg:px-24 w-full max-w-[1400px] mb-[8vh]">
        {/* Terminal-style line number gutter */}
        <div className="flex items-start gap-4 md:gap-8">
          <div className="hidden md:flex flex-col font-mono text-[var(--color-text-muted)] text-sm leading-[1.8] select-none opacity-30">
            <span>01</span>
            <span>02</span>
            <span>03</span>
            <span>04</span>
            <span>05</span>
            <span>06</span>
          </div>

          <div className="flex flex-col">
            {/* Comment line */}
            <p className="font-mono text-[11px] sm:text-sm md:text-base text-[var(--color-accent-green)] mb-2 opacity-0 animate-[fadeIn_0.5s_ease_0.8s_forwards]">
              <span className="hidden sm:inline">{"// "}studievereniging HBO-ICT — Hogeschool van Amsterdam</span>
              <span className="sm:hidden">{"// "}studievereniging HBO-ICT — HvA</span>
            </p>

            {/* Main logo */}
            <h1
              className={`font-mono text-[clamp(4rem,15vw,12rem)] font-bold leading-none tracking-tighter mb-6 transition-opacity duration-500`}
            >
              <span className="text-[var(--color-accent-gold)]">
                {typedText.slice(0, 1)}
              </span>
              <span className="text-[var(--color-text)]">
                {typedText.slice(1, 4)}
              </span>
              <span className="text-[var(--color-accent-gold)]">
                {typedText.slice(4)}
              </span>
              <span
                className={`inline-block w-[3px] h-[0.85em] bg-[var(--color-accent-gold)] ml-1 align-middle ${showCursor ? "opacity-100" : "opacity-0"
                  }`}
              />
            </h1>

            {/* Tagline */}
            <p
              className={`font-mono text-lg md:text-xl text-[var(--color-text-muted)] max-w-lg leading-relaxed mb-10 opacity-0 ${phase === "done" ? "animate-[fadeIn_0.6s_ease_0.2s_forwards]" : ""
                }`}
            >
              <span className="text-[var(--color-accent-blue)]">Door</span> studenten. <span className="text-[var(--color-accent-blue)]">Voor</span> studenten.
              <span className="text-[var(--color-accent-gold)]"> In tech.</span>
            </p>

            {/* CTAs */}
            <div
              className={`flex flex-col sm:flex-row gap-4 opacity-0 ${phase === "done" ? "animate-[fadeIn_0.6s_ease_0.5s_forwards]" : ""
                }`}
            >
              <a
                href="/#join"
                className="group relative px-8 py-4 bg-[var(--color-accent-gold)] text-[var(--color-bg)] font-mono font-bold text-sm tracking-wide overflow-hidden transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <GlowEffect
                  colors={["#F59E0B", "#D97706", "#FBBF24", "#F59E0B"]}
                  mode="breathe"
                  blur="soft"
                  duration={3}
                />
                <span className="relative z-10">WORD LID</span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </a>
              <a
                href="/#events"
                className="group/events relative px-8 py-4 border border-[var(--color-border)] text-[var(--color-text-muted)] font-mono text-sm tracking-wide overflow-hidden hover:border-[var(--color-accent-gold)] hover:text-[var(--color-text)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="absolute inset-0 bg-[var(--color-accent-gold)]/10 translate-x-[-101%] group-hover/events:translate-x-0 transition-transform duration-400" />
                <span className="relative z-10">BEKIJK EVENTS</span>
                <span className="relative z-10 inline-block ml-2 transition-transform duration-300 group-hover/events:translate-x-2">
                  →
                </span>
              </a>
            </div>

            {/* Amsterdam × marks — brand identity (red, green, blue) */}
            <div
              className={`flex items-center gap-3 mt-16 font-mono text-sm opacity-0 ${phase === "done" ? "animate-[fadeIn_0.6s_ease_0.8s_forwards]" : ""
                }`}
            >
              <span className="w-8 h-px bg-[var(--color-text-muted)] opacity-40" />
              <span className="text-[var(--color-accent-red)] font-bold">×</span>
              <span className="text-[var(--color-accent-green)] font-bold">×</span>
              <span className="text-[var(--color-accent-blue)] font-bold">×</span>
              <span className="w-8 h-px bg-[var(--color-text-muted)] opacity-40" />
            </div>
          </div>
        </div>
      </div>

      {/* Floating code snippet on the right */}
      <CodeSnippet phase={phase} />

      {/* Scroll indicator — terminal style */}
      <div
        className={`absolute bottom-12 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 opacity-0 ${phase === "done" ? "animate-[fadeIn_0.6s_ease_1.2s_forwards]" : ""
          }`}
      >
        <span className="font-mono text-xs text-[var(--color-text-muted)] tracking-wider">
          <span className="text-[var(--color-accent-gold)]">{"$ "}</span>
          <span className="opacity-70">scroll down</span>
        </span>
        <div className="flex flex-col items-center gap-1">
          <div className="w-px h-6 bg-gradient-to-b from-[var(--color-accent-gold)]/60 to-transparent" />
          <span className="font-mono text-xs text-[var(--color-accent-gold)] opacity-70 animate-bounce">▼</span>
        </div>
      </div>
    </section>
  );
}
