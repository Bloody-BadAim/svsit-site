"use client";

import React, { MouseEvent as ReactMouseEvent, useState, useRef, lazy, Suspense } from "react";
import { cn } from "@/lib/utils";

const CanvasRevealEffect = lazy(() =>
  import("@/components/ui/CanvasRevealEffect").then((m) => ({
    default: m.CanvasRevealEffect,
  }))
);

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
  const [isHovering, setIsHovering] = useState(false);

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
  }

  return (
    <div
      className={cn("group/spotlight relative overflow-hidden", className)}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      {...props}
    >
      <div
        ref={spotlightRef}
        className="pointer-events-none absolute z-0 -inset-px opacity-0 transition duration-300 group-hover/spotlight:opacity-100"
        style={{ backgroundColor: color }}
      >
        {isHovering && (
          <Suspense fallback={null}>
            <CanvasRevealEffect
              animationSpeed={5}
              containerClassName="bg-transparent absolute inset-0 pointer-events-none"
              colors={
                revealColors || [
                  [59, 130, 246],
                  [139, 92, 246],
                ]
              }
              dotSize={3}
              showGradient={false}
            />
          </Suspense>
        )}
      </div>
      {children}
    </div>
  );
};
