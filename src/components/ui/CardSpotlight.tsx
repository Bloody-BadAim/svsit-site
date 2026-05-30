"use client";

import React, { MouseEvent as ReactMouseEvent, useRef } from "react";
import { cn } from "@/lib/utils";

export const CardSpotlight = ({
  children,
  radius = 350,
  color = "#262626",
  revealColors,
  className,
  ...props
}: {
  radius?: number;
  color?: string;
  revealColors?: number[][];
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) => {
  const spotlightRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  // Derive a dot color from revealColors or fallback
  const dotColor = revealColors?.[0]
    ? `rgb(${revealColors[0][0]}, ${revealColors[0][1]}, ${revealColors[0][2]})`
    : "rgb(59, 130, 246)";

  function handleMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: ReactMouseEvent<HTMLDivElement>) {
    const { left, top } = currentTarget.getBoundingClientRect();
    const x = clientX - left;
    const y = clientY - top;
    if (spotlightRef.current) {
      const mask = `radial-gradient(${radius}px circle at ${x}px ${y}px, white, transparent 80%)`;
      spotlightRef.current.style.maskImage = mask;
      spotlightRef.current.style.webkitMaskImage = mask;
    }
    if (dotRef.current) {
      dotRef.current.style.background = `radial-gradient(circle at ${x}px ${y}px, ${dotColor}20 0%, transparent 60%)`;
    }
  }

  return (
    <div
      className={cn("group/spotlight relative overflow-hidden", className)}
      onMouseMove={handleMouseMove}
      {...props}
    >
      {/* Spotlight overlay - CSS radial gradient, no three.js */}
      <div
        ref={spotlightRef}
        className="pointer-events-none absolute z-0 -inset-px opacity-0 transition duration-300 group-hover/spotlight:opacity-100"
        style={{ backgroundColor: color }}
      />
      {/* Dot glow layer - replaces CanvasRevealEffect */}
      <div
        ref={dotRef}
        className="pointer-events-none absolute z-0 -inset-px opacity-0 transition duration-300 group-hover/spotlight:opacity-60"
      />
      {children}
    </div>
  );
};
