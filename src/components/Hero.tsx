"use client";

import { useEffect, useRef, useState } from "react";
import { GlowEffect } from "@/components/ui/GlowEffect";

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

  // Particle network with code characters
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let mouseX = -1000;
    let mouseY = -1000;

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

    const chars = ["{", "}", "[", "]", ";", "/", "*", "<", ">", "=", "(", ")", "0", "1", "//", "=>", "&&", "||", "<?", "/>", "++", "!=", "AI", "GG", "#", ">>", "01"];
    const particleCount = 140;
    const connectionDist = 180;
    const mousePushDist = 250;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      char: string;
      size: number;
      baseOpacity: number;
    }

    const particles: Particle[] = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      char: chars[Math.floor(Math.random() * chars.length)],
      size: 11 + Math.random() * 7,
      baseOpacity: 0.15 + Math.random() * 0.2,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update & draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Mouse repulsion
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mousePushDist && dist > 0) {
          const force = (1 - dist / mousePushDist) * 2;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        // Friction
        p.vx *= 0.98;
        p.vy *= 0.98;

        // Drift back to base speed
        p.vx += (Math.random() - 0.5) * 0.02;
        p.vy += (Math.random() - 0.5) * 0.02;

        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.x < -20) p.x = canvas.width + 20;
        if (p.x > canvas.width + 20) p.x = -20;
        if (p.y < -20) p.y = canvas.height + 20;
        if (p.y > canvas.height + 20) p.y = -20;

        // Brightness boost near mouse
        const mouseDist = Math.sqrt((p.x - mouseX) ** 2 + (p.y - mouseY) ** 2);
        const mouseGlow = mouseDist < 350 ? (1 - mouseDist / 350) * 0.5 : 0;
        const opacity = p.baseOpacity + mouseGlow;

        // Draw character
        ctx.font = `${p.size}px "JetBrains Mono", monospace`;
        ctx.fillStyle = `rgba(245, 158, 11, ${opacity})`;
        ctx.fillText(p.char, p.x, p.y);

        // Draw connection lines to nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const cdx = p.x - p2.x;
          const cdy = p.y - p2.y;
          const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
          if (cdist < connectionDist) {
            const lineOpacity = (1 - cdist / connectionDist) * 0.12;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(245, 158, 11, ${lineOpacity})`;
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

      {/* Floating code fragments — fill the upper dead space */}
      <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden" aria-hidden="true">
        {[
          { text: "// TODO: meer pizza bij events", top: "8%", left: "12%", delay: "0s", duration: "18s", color: "var(--color-accent-green)" },
          { text: "> nmap -sV svsit.nl", top: "14%", left: "65%", delay: "2s", duration: "22s", color: "var(--color-accent-red)" },
          { text: "player.score += 100; // GG", top: "22%", left: "38%", delay: "5s", duration: "20s", color: "var(--color-accent-blue)" },
          { text: "$ npm run borrel", top: "6%", left: "82%", delay: "8s", duration: "24s", color: "var(--color-text-muted)" },
          { text: "ai.generate('study_tips')", top: "18%", left: "5%", delay: "3s", duration: "19s", color: "var(--color-accent-gold)" },
          { text: "SELECT * FROM studenten WHERE motivation = 'high'", top: "12%", left: "48%", delay: "6s", duration: "21s", color: "var(--color-text-muted)" },
          { text: "ERR: cannot read property 'sleep' of student", top: "26%", left: "70%", delay: "10s", duration: "23s", color: "var(--color-accent-red)" },
        ].map((frag, i) => (
          <span
            key={i}
            className="absolute font-mono text-[10px] md:text-[11px] whitespace-nowrap"
            style={{
              top: frag.top,
              left: frag.left,
              color: frag.color,
              opacity: 0,
              animation: `floatCode ${frag.duration} ease-in-out ${frag.delay} infinite`,
            }}
          >
            {frag.text}
          </span>
        ))}
      </div>

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
            <p className="font-mono text-sm md:text-base text-[var(--color-accent-green)] mb-2 opacity-0 animate-[fadeIn_0.5s_ease_0.8s_forwards]">
              {"// "}studievereniging HBO-ICT — Hogeschool van Amsterdam
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
                className="group/events relative px-8 py-4 border border-[var(--color-border)] text-[var(--color-text-muted)] font-mono text-sm tracking-wide overflow-hidden hover:border-[var(--color-accent-gold)] hover:text-[var(--color-text)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="absolute inset-0 bg-[var(--color-accent-gold)]/10 translate-x-[-101%] group-hover/events:translate-x-0 transition-transform duration-400" />
                <span className="relative z-10">BEKIJK EVENTS</span>
                <span className="relative z-10 inline-block ml-2 transition-transform duration-300 group-hover/events:translate-x-2">
                  →
                </span>
              </a>
            </div>

            {/* Decorative dashes line (from logo: — x x x —) */}
            <div
              className={`flex items-center gap-3 mt-16 font-mono text-xs text-[var(--color-text-muted)] opacity-0 ${phase === "done" ? "animate-[fadeIn_0.6s_ease_0.8s_forwards]" : ""
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

      {/* Scroll indicator — terminal style */}
      <div
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3 opacity-0 ${phase === "done" ? "animate-[fadeIn_0.6s_ease_1.2s_forwards]" : ""
          }`}
      >
        <span className="font-mono text-[10px] text-[var(--color-text-muted)] tracking-wide">
          <span className="text-[var(--color-accent-gold)] opacity-60">{"$ "}</span>
          <span className="opacity-50">git pull</span>
          <span className="opacity-30">{" --scroll"}</span>
        </span>
        <div className="flex flex-col items-center gap-1">
          <div className="w-px h-4 bg-gradient-to-b from-[var(--color-accent-gold)]/40 to-transparent" />
          <span className="font-mono text-[8px] text-[var(--color-accent-gold)] opacity-40 animate-bounce">▼</span>
        </div>
      </div>
    </section>
  );
}
