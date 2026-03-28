"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const marqueeItems = [
  { text: "@svsit", accent: "var(--color-accent-gold)", type: "handle" },
  { text: "×", accent: "var(--color-accent-red)", type: "separator" },
  { text: "VOLG ONS OP INSTAGRAM", accent: "var(--color-text-muted)", type: "cta" },
  { text: "×", accent: "var(--color-accent-green)", type: "separator" },
  { text: "BORRELS", accent: "var(--color-accent-blue)", type: "tag" },
  { text: "×", accent: "var(--color-accent-gold)", type: "separator" },
  { text: "HACKATHONS", accent: "var(--color-accent-red)", type: "tag" },
  { text: "×", accent: "var(--color-accent-blue)", type: "separator" },
  { text: "@svsit", accent: "var(--color-accent-gold)", type: "handle" },
  { text: "×", accent: "var(--color-accent-green)", type: "separator" },
  { text: "GAME NIGHTS", accent: "var(--color-accent-green)", type: "tag" },
  { text: "×", accent: "var(--color-accent-red)", type: "separator" },
  { text: "TECH TALKS", accent: "var(--color-accent-blue)", type: "tag" },
  { text: "×", accent: "var(--color-accent-gold)", type: "separator" },
  { text: "KROEGENTOCHTEN", accent: "var(--color-accent-red)", type: "tag" },
  { text: "×", accent: "var(--color-accent-green)", type: "separator" },
  { text: "CTF CHALLENGES", accent: "var(--color-accent-green)", type: "tag" },
  { text: "×", accent: "var(--color-accent-blue)", type: "separator" },
];

function MarqueeContent({ direction }: { direction: "left" | "right" }) {
  return (
    <div className="flex items-center gap-10 md:gap-14 shrink-0 px-6">
      {marqueeItems.map((item, i) => {
        if (item.type === "separator") {
          return (
            <span
              key={`${direction}-${i}`}
              className="text-lg font-bold opacity-50"
              style={{ color: item.accent }}
            >
              {item.text}
            </span>
          );
        }

        if (item.type === "handle") {
          return (
            <a
              key={`${direction}-${i}`}
              href="https://instagram.com/svsit"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-2xl md:text-4xl font-bold tracking-tight hover:scale-110 transition-transform duration-200"
              style={{ color: item.accent }}
            >
              {item.text}
            </a>
          );
        }

        if (item.type === "cta") {
          return (
            <a
              key={`${direction}-${i}`}
              href="https://instagram.com/svsit"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm md:text-base tracking-[0.3em] opacity-50 hover:opacity-100 transition-opacity duration-200"
              style={{ color: item.accent }}
            >
              {item.text}
            </a>
          );
        }

        return (
          <span
            key={`${direction}-${i}`}
            className="font-mono text-sm md:text-lg tracking-[0.15em] font-bold opacity-25"
            style={{ color: item.accent }}
          >
            {item.text}
          </span>
        );
      })}
    </div>
  );
}

export default function SocialMarquee() {
  const containerRef = useRef<HTMLDivElement>(null);
  const track1Ref = useRef<HTMLDivElement>(null);
  const track2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion || !track1Ref.current || !track2Ref.current) return;

    // Top track: scroll left
    const tl1 = gsap.to(track1Ref.current, {
      xPercent: -50,
      duration: 40,
      ease: "none",
      repeat: -1,
    });

    // Bottom track: scroll right (opposite)
    const tl2 = gsap.to(track2Ref.current, {
      xPercent: 50,
      duration: 35,
      ease: "none",
      repeat: -1,
    });

    // Speed up on scroll
    const scrollTrigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        const velocity = Math.abs(self.getVelocity()) / 1000;
        const speedMultiplier = 1 + Math.min(velocity, 3);
        tl1.timeScale(speedMultiplier);
        tl2.timeScale(speedMultiplier);
      },
    });

    return () => {
      tl1.kill();
      tl2.kill();
      scrollTrigger.kill();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden select-none"
      style={{ paddingTop: "3.5rem", paddingBottom: "3.5rem" }}
      aria-hidden="true"
    >
      {/* Edge fades */}
      <div className="absolute left-0 top-0 bottom-0 z-10 pointer-events-none"
        style={{ width: "12rem", background: "linear-gradient(to right, var(--color-bg), transparent)" }}
      />
      <div className="absolute right-0 top-0 bottom-0 z-10 pointer-events-none"
        style={{ width: "12rem", background: "linear-gradient(to left, var(--color-bg), transparent)" }}
      />

      {/* Accent lines */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: "linear-gradient(to right, transparent, var(--color-accent-gold), var(--color-accent-blue), transparent)",
          opacity: 0.2,
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: "linear-gradient(to right, transparent, var(--color-accent-blue), var(--color-accent-gold), transparent)",
          opacity: 0.2,
        }}
      />

      {/* Track 1: left scroll */}
      <div className="flex overflow-hidden" style={{ marginBottom: "1.5rem" }}>
        <div ref={track1Ref} className="flex shrink-0">
          <MarqueeContent direction="left" />
          <MarqueeContent direction="left" />
          <MarqueeContent direction="left" />
          <MarqueeContent direction="left" />
        </div>
      </div>

      {/* Track 2: right scroll (offset start) */}
      <div className="flex overflow-hidden">
        <div ref={track2Ref} className="flex shrink-0 -translate-x-1/2">
          <MarqueeContent direction="right" />
          <MarqueeContent direction="right" />
          <MarqueeContent direction="right" />
          <MarqueeContent direction="right" />
        </div>
      </div>
    </div>
  );
}
