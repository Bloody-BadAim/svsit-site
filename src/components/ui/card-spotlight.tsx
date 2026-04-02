"use client";

import { useMotionValue, motion, useMotionTemplate } from "motion/react";
import React, { MouseEvent as ReactMouseEvent, useState, lazy, Suspense } from "react";
import { cn } from "@/lib/utils";

// Lazy-load Three.js canvas effect — ~100KB saved from initial bundle
const CanvasRevealEffect = lazy(() =>
  import("@/components/ui/canvas-reveal-effect").then((m) => ({
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
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  function handleMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: ReactMouseEvent<HTMLDivElement>) {
    let { left, top } = currentTarget.getBoundingClientRect();

    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const [isHovering, setIsHovering] = useState(false);
  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => setIsHovering(false);
  return (
    <div
      className={cn(
        "group/spotlight relative overflow-hidden",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      <motion.div
        className="pointer-events-none absolute z-0 -inset-px opacity-0 transition duration-300 group-hover/spotlight:opacity-100"
        style={{
          backgroundColor: color,
          maskImage: useMotionTemplate`
            radial-gradient(
              ${radius}px circle at ${mouseX}px ${mouseY}px,
              white,
              transparent 80%
            )
          `,
        }}
      >
        {isHovering && (
          <Suspense fallback={null}>
            <CanvasRevealEffect
              animationSpeed={5}
              containerClassName="bg-transparent absolute inset-0 pointer-events-none"
              colors={revealColors || [
                [59, 130, 246],
                [139, 92, 246],
              ]}
              dotSize={3}
              showGradient={false}
            />
          </Suspense>
        )}
      </motion.div>
      {children}
    </div>
  );
};
