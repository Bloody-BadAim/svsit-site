"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * BackgroundStreaks — Flowing energy curves with glow, motion, and parallax.
 *
 * Organic SVG bezier curves replace the old static diagonal lines.
 * Each "energy stream" has three visual layers:
 *   1. Glow — wide, CSS-blurred duplicate for soft aura
 *   2. Core — thin sharp line with animated dash-flow
 *   3. Secondary core — even thinner, offset timing for density
 *
 * Plus:
 *   - Gold stream forks into a thinner branch (splitting effect)
 *   - Ambient aurora glows (large soft radial gradients)
 *   - Floating orbs with continuous GSAP float + scroll parallax
 *   - All respects prefers-reduced-motion
 *
 * Brand colors: Gold #F29E18, Blue #3B82F6, Red #EF4444, Green #22C55E
 */

interface EnergyStream {
  id: string;
  color: string;
  path: string;
  fork?: string;
  strokeCore: number;
  strokeGlow: number;
  opacityCore: number;
  opacityGlow: number;
  dashLength: number;
  dashGap: number;
  flowDuration: number;
  parallaxY: number;
  scrubSpeed: number;
}

const streams: EnergyStream[] = [
  {
    id: "gold",
    color: "#F29E18",
    path: "M -100 250 C 300 50, 600 500, 900 280 C 1200 60, 1500 450, 1800 200 C 2000 80, 2200 350, 2400 280",
    fork: "M 900 280 C 1100 400, 1300 180, 1600 360 C 1800 500, 2000 300, 2200 440",
    strokeCore: 3.5,
    strokeGlow: 28,
    opacityCore: 0.14,
    opacityGlow: 0.05,
    dashLength: 800,
    dashGap: 1200,
    flowDuration: 20,
    parallaxY: -220,
    scrubSpeed: 1,
  },
  {
    id: "blue",
    color: "#3B82F6",
    path: "M -200 550 C 100 350, 500 750, 800 500 C 1100 250, 1400 650, 1700 420 C 1900 300, 2100 520, 2400 380",
    strokeCore: 3,
    strokeGlow: 24,
    opacityCore: 0.11,
    opacityGlow: 0.04,
    dashLength: 600,
    dashGap: 1400,
    flowDuration: 26,
    parallaxY: -160,
    scrubSpeed: 1.3,
  },
  {
    id: "red",
    color: "#EF4444",
    path: "M 400 -80 C 600 200, 800 -50, 1100 300 C 1300 550, 1500 200, 1800 420 C 2000 560, 2200 300, 2400 460",
    strokeCore: 2.5,
    strokeGlow: 20,
    opacityCore: 0.09,
    opacityGlow: 0.035,
    dashLength: 500,
    dashGap: 1500,
    flowDuration: 22,
    parallaxY: -180,
    scrubSpeed: 1.5,
  },
  {
    id: "green",
    color: "#22C55E",
    path: "M -150 750 C 200 550, 500 850, 800 650 C 1100 450, 1400 780, 1700 550 C 1900 400, 2100 630, 2400 480",
    strokeCore: 2,
    strokeGlow: 16,
    opacityCore: 0.08,
    opacityGlow: 0.03,
    dashLength: 400,
    dashGap: 1600,
    flowDuration: 28,
    parallaxY: -130,
    scrubSpeed: 1.8,
  },
];

interface Orb {
  color: string;
  size: number;
  x: string;
  y: string;
  delay: number;
  duration: number;
  blur: number;
}

const orbs: Orb[] = [
  { color: "#F29E18", size: 8, x: "15%", y: "20%", delay: 0, duration: 12, blur: 20 },
  { color: "#3B82F6", size: 6, x: "72%", y: "35%", delay: 3, duration: 15, blur: 15 },
  { color: "#EF4444", size: 7, x: "42%", y: "62%", delay: 6, duration: 18, blur: 18 },
  { color: "#22C55E", size: 5, x: "88%", y: "18%", delay: 2, duration: 14, blur: 12 },
  { color: "#F29E18", size: 5, x: "28%", y: "78%", delay: 8, duration: 16, blur: 14 },
  { color: "#3B82F6", size: 7, x: "62%", y: "52%", delay: 4, duration: 20, blur: 16 },
  { color: "#EF4444", size: 4, x: "92%", y: "72%", delay: 10, duration: 13, blur: 10 },
  { color: "#22C55E", size: 6, x: "8%", y: "48%", delay: 7, duration: 17, blur: 14 },
  { color: "#F29E18", size: 4, x: "50%", y: "10%", delay: 5, duration: 19, blur: 10 },
  { color: "#3B82F6", size: 5, x: "35%", y: "88%", delay: 9, duration: 14, blur: 12 },
];

export default function BackgroundStreaks() {
  const containerRef = useRef<HTMLDivElement>(null);
  const streamRefs = useRef<(HTMLDivElement | null)[]>([]);
  const orbRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Scroll parallax — each stream drifts up at its own rate
      streams.forEach((stream, i) => {
        const el = streamRefs.current[i];
        if (!el) return;
        gsap.to(el, {
          y: stream.parallaxY,
          ease: "none",
          scrollTrigger: {
            trigger: document.body,
            start: "top top",
            end: "bottom bottom",
            scrub: stream.scrubSpeed,
          },
        });
      });

      // Orbs: continuous gentle float + scroll parallax
      orbRefs.current.forEach((el, i) => {
        if (!el) return;
        const orb = orbs[i];

        // Gentle hovering motion
        gsap.to(el, {
          y: `-=${15 + Math.random() * 25}`,
          x: `+=${8 + Math.random() * 16}`,
          duration: orb.duration * 0.4,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: orb.delay * 0.3,
        });

        // Opacity pulse
        gsap.to(el, {
          opacity: 0.15 + Math.random() * 0.2,
          duration: orb.duration * 0.3,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: orb.delay * 0.5,
        });

        // Scroll drift
        gsap.to(el, {
          y: -60 - Math.random() * 80,
          ease: "none",
          scrollTrigger: {
            trigger: document.body,
            start: "top top",
            end: "bottom bottom",
            scrub: 2 + i * 0.2,
          },
        });
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
      {/* ── Ambient aurora glows ── */}
      <div
        className="absolute rounded-full"
        style={{
          width: 800,
          height: 800,
          top: "5%",
          left: "10%",
          background: "radial-gradient(circle, #F29E18, transparent 70%)",
          opacity: 0.015,
          filter: "blur(80px)",
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: 600,
          height: 600,
          top: "50%",
          right: "5%",
          background: "radial-gradient(circle, #3B82F6, transparent 70%)",
          opacity: 0.012,
          filter: "blur(60px)",
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: 500,
          height: 500,
          bottom: "10%",
          left: "30%",
          background: "radial-gradient(circle, #EF4444, transparent 70%)",
          opacity: 0.01,
          filter: "blur(70px)",
        }}
      />

      {/* ── Energy streams ── */}
      {streams.map((stream, i) => (
        <div
          key={stream.id}
          ref={(el) => {
            streamRefs.current[i] = el;
          }}
          className="absolute -left-[5%] -top-[20%] w-[115%] h-[140%]"
        >
          {/* Glow layer — CSS blur for GPU performance */}
          <div
            className="absolute inset-0 energy-glow"
            style={{ filter: `blur(${stream.strokeGlow * 0.7}px)` }}
          >
            <svg
              viewBox="0 0 2500 1000"
              className="w-full h-full"
              preserveAspectRatio="xMidYMid slice"
              fill="none"
            >
              <path
                d={stream.path}
                stroke={stream.color}
                strokeWidth={stream.strokeGlow}
                strokeLinecap="round"
                opacity={stream.opacityGlow}
              />
              {stream.fork && (
                <path
                  d={stream.fork}
                  stroke={stream.color}
                  strokeWidth={stream.strokeGlow * 0.6}
                  strokeLinecap="round"
                  opacity={stream.opacityGlow * 0.6}
                />
              )}
            </svg>
          </div>

          {/* Core lines with flowing dash animation */}
          <div className="absolute inset-0">
            <svg
              viewBox="0 0 2500 1000"
              className="w-full h-full"
              preserveAspectRatio="xMidYMid slice"
              fill="none"
            >
              {/* Primary core */}
              <path
                d={stream.path}
                stroke={stream.color}
                strokeWidth={stream.strokeCore}
                strokeLinecap="round"
                opacity={stream.opacityCore}
                strokeDasharray={`${stream.dashLength} ${stream.dashGap}`}
                className="energy-core"
                style={{
                  animationDuration: `${stream.flowDuration}s`,
                }}
              />
              {/* Secondary core — offset timing, thinner */}
              <path
                d={stream.path}
                stroke={stream.color}
                strokeWidth={stream.strokeCore * 0.5}
                strokeLinecap="round"
                opacity={stream.opacityCore * 0.4}
                strokeDasharray={`${stream.dashLength * 0.5} ${stream.dashGap * 1.3}`}
                className="energy-core"
                style={{
                  animationDuration: `${stream.flowDuration * 1.3}s`,
                  animationDelay: `-${stream.flowDuration * 0.4}s`,
                }}
              />
              {/* Fork branch — splits from main path */}
              {stream.fork && (
                <path
                  d={stream.fork}
                  stroke={stream.color}
                  strokeWidth={stream.strokeCore * 0.7}
                  strokeLinecap="round"
                  opacity={stream.opacityCore * 0.6}
                  strokeDasharray={`${stream.dashLength * 0.4} ${stream.dashGap * 1.5}`}
                  className="energy-core"
                  style={{
                    animationDuration: `${stream.flowDuration * 1.1}s`,
                    animationDelay: `-${stream.flowDuration * 0.2}s`,
                  }}
                />
              )}
            </svg>
          </div>
        </div>
      ))}

      {/* ── Floating orbs ── */}
      {orbs.map((orb, i) => (
        <div
          key={i}
          ref={(el) => {
            orbRefs.current[i] = el;
          }}
          className="absolute rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            background: orb.color,
            boxShadow: `0 0 ${orb.blur}px ${orb.color}60, 0 0 ${orb.blur * 2}px ${orb.color}20`,
            opacity: 0.35,
          }}
        />
      ))}
    </div>
  );
}
