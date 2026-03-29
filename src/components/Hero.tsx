"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { GlowEffect } from "@/components/ui/GlowEffect";
import gsap from "gsap";

export default function Hero() {
  const [typedText, setTypedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [phase, setPhase] = useState<"typing" | "done">("typing");
  const [reducedMotion, setReducedMotion] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const glowDotsRef = useRef<HTMLDivElement>(null);

  const fullText = "{SIT}";

  // Check reduced motion once
  useEffect(() => {
    setReducedMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }, []);

  // Typing animation (skip if reduced motion)
  useEffect(() => {
    if (reducedMotion) {
      setTypedText(fullText);
      setPhase("done");
      return;
    }
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
  }, [reducedMotion]);

  // Cursor blink
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);
    return () => clearInterval(blinkInterval);
  }, []);

  // GSAP: subtle glow dot pulse on grid intersections
  useEffect(() => {
    if (reducedMotion || !glowDotsRef.current) return;

    const container = glowDotsRef.current;
    const dots: HTMLDivElement[] = [];

    for (let i = 0; i < 5; i++) {
      const dot = document.createElement("div");
      const col = Math.floor(Math.random() * 12) + 2;
      const row = Math.floor(Math.random() * 8) + 2;
      dot.style.cssText = `
        position: absolute;
        left: ${col * 60}px;
        top: ${row * 60}px;
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: rgba(245, 158, 11, 0.4);
        box-shadow: 0 0 12px rgba(245, 158, 11, 0.3), 0 0 24px rgba(245, 158, 11, 0.15);
        opacity: 0;
        will-change: opacity;
      `;
      container.appendChild(dot);
      dots.push(dot);
    }

    const tl = gsap.timeline({ repeat: -1 });
    dots.forEach((dot, i) => {
      tl.to(
        dot,
        {
          opacity: 1,
          duration: 2,
          ease: "sine.inOut",
          yoyo: true,
          repeat: 1,
        },
        i * 1.5
      );
    });

    return () => {
      tl.kill();
      dots.forEach((d) => d.remove());
    };
  }, [reducedMotion]);

  return (
    <section
      ref={heroRef}
      className="relative flex items-center justify-center min-h-screen overflow-hidden"
    >
      {/* ── Layer 0: Aurora brand color blobs ── */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        >
          {/* Gold blob — top left */}
          <motion.div
            className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full blur-[120px]"
            style={{ background: "rgba(245, 158, 11, 0.12)" }}
            animate={
              reducedMotion
                ? {}
                : {
                    x: [-40, 60, -40],
                    y: [-20, 30, -20],
                    scale: [1, 1.2, 1],
                  }
            }
            transition={{
              duration: 30,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            }}
          />
          {/* Blue blob — bottom right */}
          <motion.div
            className="absolute -bottom-[15%] -right-[10%] w-[45%] h-[45%] rounded-full blur-[120px]"
            style={{ background: "rgba(59, 130, 246, 0.10)" }}
            animate={
              reducedMotion
                ? {}
                : {
                    x: [40, -50, 40],
                    y: [20, -30, 20],
                    scale: [1, 1.3, 1],
                  }
            }
            transition={{
              duration: 35,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            }}
          />
          {/* Red blob — center left */}
          <motion.div
            className="absolute top-[30%] left-[15%] w-[30%] h-[30%] rounded-full blur-[100px]"
            style={{ background: "rgba(239, 68, 68, 0.08)" }}
            animate={
              reducedMotion
                ? {}
                : {
                    x: [20, -30, 20],
                    y: [-25, 25, -25],
                  }
            }
            transition={{
              duration: 40,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            }}
          />
          {/* Green blob — bottom center */}
          <motion.div
            className="absolute bottom-[10%] right-[25%] w-[25%] h-[25%] rounded-full blur-[100px]"
            style={{ background: "rgba(34, 197, 94, 0.07)" }}
            animate={
              reducedMotion
                ? {}
                : {
                    x: [-30, 30, -30],
                    y: [15, -15, 15],
                    scale: [1, 1.15, 1],
                  }
            }
            transition={{
              duration: 32,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            }}
          />
        </motion.div>
      </div>

      {/* ── Layer 1: CSS Grid background ── */}
      <div className="hero-grid" aria-hidden="true" />
      <div className="hero-glow-dots" aria-hidden="true" />
      <div ref={glowDotsRef} className="absolute inset-0 pointer-events-none" aria-hidden="true" />

      {/* ── Layer 2: Noise overlay ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        aria-hidden="true"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
        }}
      />

      {/* ── Layer 3: Content ── */}
      <div className="relative z-10 flex flex-col items-start px-6 md:px-12 lg:px-24 w-full max-w-[1400px] mb-[8vh]">
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
            {/* Comment line — kept in hero */}
            <p className="font-mono text-[11px] sm:text-sm md:text-base text-[var(--color-accent-green)] mb-2 opacity-0 animate-[fadeIn_0.5s_ease_0.8s_forwards]">
              <span className="hidden sm:inline">{"// "}studievereniging HBO-ICT — Hogeschool van Amsterdam</span>
              <span className="sm:hidden">{"// "}studievereniging HBO-ICT — HvA</span>
            </p>

            {/* Main logo */}
            <h1
              className="font-mono text-[clamp(4rem,15vw,12rem)] font-bold leading-none tracking-tighter mb-6 transition-opacity duration-500"
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

            {/* Amsterdam x marks — brand identity */}
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

      {/* Scroll indicator */}
      <div
        className={`absolute bottom-12 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 opacity-0 ${phase === "done" ? "animate-[fadeIn_0.6s_ease_1.2s_forwards]" : ""
          }`}
      >
        <span className="font-mono text-xs text-[var(--color-text-muted)] tracking-wider opacity-70">
          scroll down
        </span>
        <div className="flex flex-col items-center gap-1">
          <div className="w-px h-6 bg-gradient-to-b from-[var(--color-accent-gold)]/60 to-transparent" />
          <span className="font-mono text-xs text-[var(--color-accent-gold)] opacity-70 animate-bounce">▼</span>
        </div>
      </div>
    </section>
  );
}
