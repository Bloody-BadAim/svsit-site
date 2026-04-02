"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * BackgroundStreaks — Brand kit diagonal lines with ICT/network data flow.
 *
 * Concept: diagonal lines at -22° (matching Figma brand kit) start perfectly
 * straight, then develop subtle bends as you scroll. Small "data packets"
 * pulse along the lines like network traffic flowing through digital veins.
 *
 * Brand colors: Gold #F59E0B, Blue #3B82F6, Red #EF4444, Green #22C55E
 * Angle: -22° (from brand kit Design Elements)
 */

// ── Line definitions matching brand kit exactly ──
// Left bundle: 5 lines at different thicknesses and opacities
// Right echo: 4 fainter lines
interface Streak {
  color: string;
  width: number;
  opacity: number;
  x: number; // horizontal offset within bundle
  glowSize: number;
}

const leftBundle: Streak[] = [
  { color: "#3B82F6", width: 8, opacity: 0.5, x: 0, glowSize: 16 },
  { color: "#22C55E", width: 6, opacity: 0.6, x: 40, glowSize: 12 },
  { color: "#EF4444", width: 10, opacity: 0.7, x: 75, glowSize: 20 },
  { color: "#F59E0B", width: 5, opacity: 0.8, x: 100, glowSize: 14 },
  { color: "#EF4444", width: 3, opacity: 0.4, x: 115, glowSize: 8 },
];

const rightEcho: Streak[] = [
  { color: "#3B82F6", width: 5, opacity: 0.08, x: 0, glowSize: 10 },
  { color: "#22C55E", width: 4, opacity: 0.09, x: 32, glowSize: 8 },
  { color: "#EF4444", width: 6, opacity: 0.1, x: 55, glowSize: 12 },
  { color: "#F59E0B", width: 3, opacity: 0.12, x: 75, glowSize: 6 },
];

// ── Data packets that flow along the lines ──
interface Packet {
  lineIndex: number;
  bundle: "left" | "right";
  speed: number; // seconds for full traverse
  size: number;
  delay: number;
}

// Reduced from 6 to 3 packets for better desktop performance
const packets: Packet[] = [
  { lineIndex: 0, bundle: "left", speed: 10, size: 3, delay: 0 },
  { lineIndex: 2, bundle: "left", speed: 8, size: 4, delay: 3 },
  { lineIndex: 0, bundle: "right", speed: 14, size: 2, delay: 6 },
];

export default function BackgroundStreaks() {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const packetsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const isMobile = window.innerWidth < 768;
    if (prefersReducedMotion || isMobile) return;

    const ctx = gsap.context(() => {
      // ── Scroll-based bend: lines slightly shift on scroll ──
      if (leftRef.current) {
        gsap.to(leftRef.current, {
          skewX: -3,
          y: -120,
          ease: "none",
          scrollTrigger: {
            trigger: document.body,
            start: "top top",
            end: "bottom bottom",
            scrub: 1.5,
          },
        });
      }

      if (rightRef.current) {
        gsap.to(rightRef.current, {
          skewX: 2,
          y: -80,
          ease: "none",
          scrollTrigger: {
            trigger: document.body,
            start: "top top",
            end: "bottom bottom",
            scrub: 2,
          },
        });
      }

      // ── Data packet animations ──
      packetsRef.current.forEach((el, i) => {
        if (!el) return;
        const packet = packets[i];

        // Infinite loop: travel from top to bottom along the line
        gsap.fromTo(
          el,
          { y: "-10vh", opacity: 0 },
          {
            y: "120vh",
            opacity: 0,
            duration: packet.speed,
            ease: "none",
            repeat: -1,
            delay: packet.delay,
            keyframes: [
              { y: "-10vh", opacity: 0 },
              { y: "10vh", opacity: 0.8 },
              { y: "50vh", opacity: 1 },
              { y: "90vh", opacity: 0.6 },
              { y: "120vh", opacity: 0 },
            ],
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* ── Left bundle: 5 brand-color diagonal lines ── */}
      <div
        ref={leftRef}
        className="absolute -left-16 -top-[30%] w-[500px] h-[160%]"
        style={{ transform: "rotate(-22deg)", transformOrigin: "top left", willChange: "transform" }}
      >
        {leftBundle.map((streak, i) => (
          <div key={`left-${i}`} className="absolute h-full" style={{ left: streak.x }}>
            {/* Glow layer */}
            <div
              className="absolute inset-0"
              style={{
                width: streak.glowSize,
                background: streak.color,
                opacity: streak.opacity * 0.15,
                filter: `blur(${streak.glowSize}px)`,
              }}
            />
            {/* Core line */}
            <div
              className="absolute inset-0"
              style={{
                width: streak.width,
                background: streak.color,
                opacity: streak.opacity,
                borderRadius: streak.width / 2,
              }}
            />
          </div>
        ))}

        {/* Data packets on left bundle */}
        {packets
          .filter((p) => p.bundle === "left")
          .map((packet, i) => {
            const streak = leftBundle[packet.lineIndex];
            if (!streak) return null;
            const globalIndex = packets.findIndex(
              (p) => p === packet
            );
            return (
              <div
                key={`packet-left-${i}`}
                ref={(el) => {
                  packetsRef.current[globalIndex] = el;
                }}
                className="absolute"
                style={{
                  left: streak.x + streak.width / 2 - packet.size / 2,
                  width: packet.size,
                  height: packet.size * 8,
                  borderRadius: packet.size,
                  background: `linear-gradient(to bottom, transparent, ${streak.color}, transparent)`,
                  boxShadow: `0 0 ${packet.size * 4}px ${streak.color}80`,
                  opacity: 0,
                }}
              />
            );
          })}
      </div>

      {/* ── Right echo: fainter diagonal lines ── */}
      <div
        ref={rightRef}
        className="absolute -right-8 -top-[40%] w-[300px] h-[160%]"
        style={{ transform: "rotate(-22deg)", transformOrigin: "top right", willChange: "transform" }}
      >
        {rightEcho.map((streak, i) => (
          <div key={`right-${i}`} className="absolute h-full" style={{ left: streak.x }}>
            {/* Glow layer */}
            <div
              className="absolute inset-0"
              style={{
                width: streak.glowSize,
                background: streak.color,
                opacity: streak.opacity * 0.3,
                filter: `blur(${streak.glowSize}px)`,
              }}
            />
            {/* Core line */}
            <div
              className="absolute inset-0"
              style={{
                width: streak.width,
                background: streak.color,
                opacity: streak.opacity,
                borderRadius: streak.width / 2,
              }}
            />
          </div>
        ))}

        {/* Data packets on right bundle */}
        {packets
          .filter((p) => p.bundle === "right")
          .map((packet, i) => {
            const streak = rightEcho[packet.lineIndex];
            if (!streak) return null;
            const globalIndex = packets.findIndex(
              (p) => p === packet
            );
            return (
              <div
                key={`packet-right-${i}`}
                ref={(el) => {
                  packetsRef.current[globalIndex] = el;
                }}
                className="absolute"
                style={{
                  left: streak.x + streak.width / 2 - packet.size / 2,
                  width: packet.size,
                  height: packet.size * 6,
                  borderRadius: packet.size,
                  background: `linear-gradient(to bottom, transparent, ${streak.color}, transparent)`,
                  boxShadow: `0 0 ${packet.size * 3}px ${streak.color}60`,
                  opacity: 0,
                }}
              />
            );
          })}
      </div>

      {/* ── Ambient glow zones ── */}
      <div
        className="absolute rounded-full"
        style={{
          width: 600,
          height: 600,
          top: "10%",
          left: "5%",
          background: "radial-gradient(circle, #F59E0B, transparent 70%)",
          opacity: 0.015,
          filter: "blur(80px)",
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: 500,
          height: 500,
          top: "55%",
          right: "0%",
          background: "radial-gradient(circle, #3B82F6, transparent 70%)",
          opacity: 0.012,
          filter: "blur(60px)",
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: 400,
          height: 400,
          bottom: "15%",
          left: "25%",
          background: "radial-gradient(circle, #EF4444, transparent 70%)",
          opacity: 0.01,
          filter: "blur(70px)",
        }}
      />
    </div>
  );
}
