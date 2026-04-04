"use client";

import { cn } from "@/lib/utils";

export type BorderTrailProps = {
  className?: string;
  size?: number;
  transition?: { duration?: number; ease?: string };
  onAnimationComplete?: () => void;
  style?: React.CSSProperties;
};

export function BorderTrail({
  className,
  size = 60,
  transition,
  style,
}: BorderTrailProps) {
  const duration = transition?.duration ?? 5;
  // size controls the visual "trail length" as a percentage of the circle
  const trailPercent = Math.min(Math.max(size / 4, 5), 20);

  return (
    <div className="pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)]">
      <div
        className={cn("absolute inset-[-100%]", className)}
        style={{
          background: `conic-gradient(from 0deg, transparent 0%, currentColor ${trailPercent / 2}%, transparent ${trailPercent}%)`,
          animation: `borderTrailRotate ${duration}s linear infinite`,
          willChange: "transform",
          ...style,
        }}
      />
    </div>
  );
}
