"use client";

import { useEffect, useRef, useState } from "react";
import { GlowEffect } from "@/components/ui/GlowEffect";

const codeLines = [
  "import { SIT } from '@hva/verenigingen';",
  "",
  "const bestuur = new Bestuur({",
  "  jaar: 'XI',",
  "  missie: 'community building',",
  "  leden: await fetchStudenten(),",
  "});",
  "",
  "bestuur.on('event', (e) => {",
  "  console.log(`${e.naam} @ ${e.locatie}`);",
  "  e.aanwezigen.forEach(s => s.enjoy());",
  "});",
  "",
  "await sit.launch();",
];

function colorize(line: string) {
  return line
    .replace(
      /\b(import|from|const|new|await)\b/g,
      '<span style="color: var(--color-accent-red)">$1</span>'
    )
    .replace(
      /('[^']*'|`[^`]*`)/g,
      '<span style="color: var(--color-accent-gold)">$1</span>'
    )
    .replace(
      /(\/\/.*$)/,
      '<span style="color: var(--color-text-muted)">$1</span>'
    )
    .replace(
      /(\.\w+\()/g,
      '<span style="color: var(--color-accent-blue)">$1</span>'
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
    }, 250);
    return () => clearInterval(interval);
  }, [phase]);

  return (
    <div className="hidden lg:block absolute right-12 xl:right-24 top-1/2 -translate-y-1/2 z-10 w-[420px] opacity-0 animate-[fadeIn_1s_ease_1.5s_forwards]">
      {/* Terminal window chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border border-[var(--color-border)] border-b-0 bg-[var(--color-surface)]">
        <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent-red)] opacity-60" />
        <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent-gold)] opacity-60" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-60" />
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
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

  // Animated grid background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let mouseX = 0;
    let mouseY = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener("mousemove", onMouseMove);

    const gridSize = 60;
    let time = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.005;

      const cols = Math.ceil(canvas.width / gridSize) + 1;
      const rows = Math.ceil(canvas.height / gridSize) + 1;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * gridSize;
          const y = j * gridSize;

          // Distance from mouse
          const dx = x - mouseX;
          const dy = y - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 300;
          const influence = Math.max(0, 1 - dist / maxDist);

          // Base opacity with wave
          const wave = Math.sin(time + i * 0.3 + j * 0.2) * 0.5 + 0.5;
          const baseOpacity = 0.02 + wave * 0.02;
          const opacity = baseOpacity + influence * 0.12;

          // Draw intersection dot
          const dotSize = 1 + influence * 2;
          ctx.beginPath();
          ctx.arc(x, y, dotSize, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(245, 158, 11, ${opacity})`;
          ctx.fill();

          // Draw grid lines (very subtle)
          if (i < cols - 1) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + gridSize, y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${baseOpacity * 0.5})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
          if (j < rows - 1) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x, y + gridSize);
            ctx.strokeStyle = `rgba(255, 255, 255, ${baseOpacity * 0.5})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative flex items-center justify-center min-h-screen overflow-hidden"
    >
      {/* Animated grid canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0"
        aria-hidden="true"
      />

      {/* Radial gradient overlay */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, var(--color-bg) 70%)",
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-start px-6 md:px-12 lg:px-24 w-full max-w-[1400px]">
        {/* Terminal-style line number gutter */}
        <div className="flex items-start gap-4 md:gap-8">
          <div className="hidden md:flex flex-col font-mono text-[var(--color-text-muted)] text-sm leading-[1.8] select-none opacity-30">
            <span>01</span>
            <span>02</span>
            <span>03</span>
            <span>04</span>
            <span>05</span>
          </div>

          <div className="flex flex-col">
            {/* Comment line */}
            <p className="font-mono text-sm md:text-base text-[var(--color-text-muted)] mb-2 opacity-0 animate-[fadeIn_0.5s_ease_0.8s_forwards]">
              <span className="text-[var(--color-text-muted)]">{"// "}</span>
              studievereniging ICT — Hogeschool van Amsterdam
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
                className={`inline-block w-[3px] h-[0.85em] bg-[var(--color-accent-gold)] ml-1 align-middle ${
                  showCursor ? "opacity-100" : "opacity-0"
                }`}
              />
            </h1>

            {/* Tagline */}
            <p
              className={`font-mono text-lg md:text-xl text-[var(--color-text-muted)] max-w-lg leading-relaxed mb-10 opacity-0 ${
                phase === "done" ? "animate-[fadeIn_0.6s_ease_0.2s_forwards]" : ""
              }`}
            >
              Door studenten. Voor studenten.
              <span className="text-[var(--color-accent-gold)]"> In code.</span>
            </p>

            {/* CTAs */}
            <div
              className={`flex flex-col sm:flex-row gap-4 opacity-0 ${
                phase === "done" ? "animate-[fadeIn_0.6s_ease_0.5s_forwards]" : ""
              }`}
            >
              <a
                href="#join"
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
                href="#events"
                className="px-8 py-4 border border-[var(--color-border)] text-[var(--color-text-muted)] font-mono text-sm tracking-wide hover:border-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-all duration-200"
              >
                BEKIJK EVENTS
                <span className="inline-block ml-2 transition-transform duration-200 group-hover:translate-x-1">
                  →
                </span>
              </a>
            </div>

            {/* Decorative dashes line (from logo: — x x x —) */}
            <div
              className={`flex items-center gap-3 mt-16 font-mono text-xs text-[var(--color-text-muted)] opacity-0 ${
                phase === "done" ? "animate-[fadeIn_0.6s_ease_0.8s_forwards]" : ""
              }`}
            >
              <span className="w-8 h-px bg-[var(--color-text-muted)]" />
              <span>x</span>
              <span>x</span>
              <span>x</span>
              <span className="w-8 h-px bg-[var(--color-text-muted)]" />
            </div>
          </div>
        </div>
      </div>

      {/* Floating code snippet on the right */}
      <CodeSnippet phase={phase} />

      {/* Scroll indicator — code themed */}
      <div
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 opacity-0 ${
          phase === "done" ? "animate-[fadeIn_0.6s_ease_1.2s_forwards]" : ""
        }`}
      >
        <span className="font-mono text-[10px] text-[var(--color-text-muted)] tracking-wide">
          <span className="opacity-50">{"// "}</span>scroll down
        </span>
        <div className="w-px h-8 bg-gradient-to-b from-[var(--color-text-muted)] to-transparent animate-pulse" />
      </div>
    </section>
  );
}
