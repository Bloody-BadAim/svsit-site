"use client";

import { useEffect, useRef } from "react";
import Lenis from "@studio-freight/lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Respect user motion preferences
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      // Still register ScrollTrigger for layout but skip smooth scrolling
      return;
    }

    let lenis: Lenis | null = null;
    try {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });
      lenisRef.current = lenis;

      // Connect Lenis to GSAP ScrollTrigger
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => lenis!.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    } catch {
      // Lenis failed — fall back to native scroll (ScrollTrigger still works)
    }

    // Force ScrollTrigger to recalculate after layout settles
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    });

    return () => {
      if (lenis) {
        lenis.destroy();
        lenisRef.current = null;
      }
    };
  }, []);

  return <>{children}</>;
}
