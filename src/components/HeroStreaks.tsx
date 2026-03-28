"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";

const STREAKS = [
  { color: "#3B82F6", left: 20 },
  { color: "#22C55E", left: 40 },
  { color: "#EF4444", left: 60 },
  { color: "#F29E18", left: 80 },
] as const;

export interface HeroStreaksHandle {
  container: HTMLDivElement | null;
  streaks: (HTMLDivElement | null)[];
}

const HeroStreaks = forwardRef<HeroStreaksHandle>(function HeroStreaks(_, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const streak0 = useRef<HTMLDivElement>(null);
  const streak1 = useRef<HTMLDivElement>(null);
  const streak2 = useRef<HTMLDivElement>(null);
  const streak3 = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    container: containerRef.current,
    streaks: [streak0.current, streak1.current, streak2.current, streak3.current],
  }));

  const streakRefs = [streak0, streak1, streak2, streak3];

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden"
      aria-hidden="true"
      style={{ zIndex: 2 }}
    >
      {STREAKS.map((streak, i) => (
        <div
          key={i}
          ref={streakRefs[i]}
          className="absolute"
          style={{
            left: `${streak.left}%`,
            top: "-20%",
            width: "3px",
            height: "140%",
            background: `linear-gradient(180deg, transparent 0%, ${streak.color} 30%, ${streak.color} 70%, transparent 100%)`,
            transform: "rotate(-20deg)",
            transformOrigin: "center center",
            opacity: 0,
            willChange: "transform, opacity",
          }}
        />
      ))}
    </div>
  );
});

export default HeroStreaks;
