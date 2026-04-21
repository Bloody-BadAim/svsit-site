"use client";

import { useEffect, useRef } from "react";
import Lenis from "@studio-freight/lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Single registration point for ScrollTrigger — all other components
// import ScrollTrigger for API calls but do NOT register it again.
gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ limitCallbacks: true });

// Polyfill requestIdleCallback for Safari
const hasIdleCb = typeof window !== "undefined" && "requestIdleCallback" in window;

function scheduleIdle(cb: () => void): number {
  return hasIdleCb
    ? window.requestIdleCallback(cb)
    : (setTimeout(cb, 1) as unknown as number);
}

function cancelIdle(id: number): void {
  if (hasIdleCb) {
    window.cancelIdleCallback(id);
  } else {
    clearTimeout(id);
  }
}

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      return;
    }

    let lenis: Lenis | null = null;
    let rafCallback: ((time: number) => void) | null = null;
    let cancelled = false;

    // Defer Lenis + ScrollTrigger wiring until after first paint
    // to avoid forced reflows during initial render
    const idleId = scheduleIdle(() => {
      if (cancelled) return;

      try {
        lenis = new Lenis({
          duration: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
        });
        lenisRef.current = lenis;

        lenis.on("scroll", ScrollTrigger.update);
        rafCallback = (time: number) => lenis!.raf(time * 1000);
        gsap.ticker.add(rafCallback);
        gsap.ticker.lagSmoothing(0);
      } catch {
        // Lenis failed — fall back to native scroll (ScrollTrigger still works)
      }

      // Batch a single ScrollTrigger.refresh() after everything is wired up
      requestAnimationFrame(() => {
        if (!cancelled) ScrollTrigger.refresh();
      });
    });

    return () => {
      cancelled = true;
      cancelIdle(idleId);
      if (rafCallback) gsap.ticker.remove(rafCallback);
      if (lenis) {
        lenis.destroy();
        lenisRef.current = null;
      }
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return <>{children}</>;
}
