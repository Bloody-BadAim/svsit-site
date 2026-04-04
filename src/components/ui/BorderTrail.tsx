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

  return (
    <div className="pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)]">
      <div
        className={cn("absolute aspect-square bg-zinc-500", className)}
        style={{
          width: size,
          offsetPath: `rect(0 auto auto 0 round ${size}px)`,
          animation: `borderTrailMove ${duration}s linear infinite`,
          ...style,
        }}
      />
    </div>
  );
}
