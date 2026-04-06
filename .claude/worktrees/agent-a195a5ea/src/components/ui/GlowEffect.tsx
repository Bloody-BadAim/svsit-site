"use client";

import { cn } from "@/lib/utils";

export type GlowEffectProps = {
  className?: string;
  style?: React.CSSProperties;
  colors?: string[];
  mode?: "rotate" | "pulse" | "breathe" | "colorShift" | "flowHorizontal" | "static";
  blur?: number | "softest" | "soft" | "medium" | "strong" | "stronger" | "strongest" | "none";
  scale?: number;
  duration?: number;
};

export function GlowEffect({
  className,
  style,
  colors = ["#FF5733", "#33FF57", "#3357FF", "#F1C40F"],
  mode = "rotate",
  blur = "medium",
  scale = 1,
  duration = 5,
}: GlowEffectProps) {
  const getBackground = (): string => {
    switch (mode) {
      case "rotate":
        return `conic-gradient(from var(--glow-angle, 0deg) at 50% 50%, ${colors.join(", ")})`;
      case "pulse":
      case "breathe":
        return `radial-gradient(circle at 50% 50%, ${colors[0]} 0%, transparent 100%)`;
      case "colorShift":
        return `conic-gradient(from 0deg at 50% 50%, ${colors.join(", ")})`;
      case "flowHorizontal":
        return `linear-gradient(to right, ${colors.join(", ")})`;
      case "static":
        return `linear-gradient(to right, ${colors.join(", ")})`;
      default:
        return `radial-gradient(circle at 50% 50%, ${colors[0]} 0%, transparent 100%)`;
    }
  };

  const getAnimation = (): string => {
    switch (mode) {
      case "rotate":
      case "colorShift":
        return `glowRotate ${duration}s linear infinite`;
      case "pulse":
        return `glowPulse ${duration}s ease-in-out infinite alternate`;
      case "breathe":
        return `glowBreathe ${duration}s ease-in-out infinite alternate`;
      case "flowHorizontal":
        return `glowRotate ${duration}s linear infinite alternate`;
      default:
        return "none";
    }
  };

  const getBlurClass = (b: GlowEffectProps["blur"]) => {
    if (typeof b === "number") return `blur-[${b}px]`;
    const presets: Record<string, string> = {
      softest: "blur-xs", soft: "blur-sm", medium: "blur-md",
      strong: "blur-lg", stronger: "blur-xl", strongest: "blur-xl", none: "blur-none",
    };
    return presets[b as string];
  };

  return (
    <div
      style={{
        ...style,
        background: getBackground(),
        animation: getAnimation(),
        "--glow-scale": scale,
        willChange: "transform",
        backfaceVisibility: "hidden",
      } as React.CSSProperties}
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full",
        `scale-[${scale}] transform-gpu`,
        getBlurClass(blur),
        className
      )}
    />
  );
}
