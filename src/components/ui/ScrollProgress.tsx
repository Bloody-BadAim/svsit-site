"use client";

import { motion, useScroll, useSpring, type SpringOptions } from "motion/react";
import { cn } from "@/lib/utils";

export type ScrollProgressProps = {
  className?: string;
  springOptions?: SpringOptions;
};

const DEFAULT_SPRING_OPTIONS: SpringOptions = {
  stiffness: 200,
  damping: 50,
  restDelta: 0.001,
};

export function ScrollProgress({
  className,
  springOptions,
}: ScrollProgressProps) {
  const { scrollYProgress } = useScroll();

  const scaleX = useSpring(scrollYProgress, {
    ...DEFAULT_SPRING_OPTIONS,
    ...(springOptions ?? {}),
  });

  return (
    <motion.div
      className={cn("inset-x-0 top-0 h-[3px] origin-left", className)}
      style={{
        scaleX,
      }}
    />
  );
}
