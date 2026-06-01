"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { isReducedMotion, onMotionChange } from "@/lib/motion";

// Single registration point for ScrollTrigger - all other components
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
    let lenis: Lenis | null = null;
    let rafCallback: ((time: number) => void) | null = null;
    let idleId: number | null = null;
    let cancelled = false;

    const startLenis = () => {
      if (lenis || isReducedMotion()) return;
      idleId = scheduleIdle(() => {
        if (cancelled || isReducedMotion()) return;
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
          // Lenis failed - native scroll (ScrollTrigger still works)
        }
        requestAnimationFrame(() => {
          if (!cancelled) ScrollTrigger.refresh();
        });
      });
    };

    const stopLenis = () => {
      if (idleId != null) { cancelIdle(idleId); idleId = null; }
      if (rafCallback) { gsap.ticker.remove(rafCallback); rafCallback = null; }
      if (lenis) { lenis.destroy(); lenis = null; lenisRef.current = null; }
      // Native scroll herstellen + ScrollTrigger herberekenen
      requestAnimationFrame(() => { if (!cancelled) ScrollTrigger.refresh(); });
    };

    // Live reageren op de // static toggle: smooth-scroll uit onder reduced motion
    const sync = () => (isReducedMotion() ? stopLenis() : startLenis());
    sync();
    const unsub = onMotionChange(sync);

    return () => {
      cancelled = true;
      unsub();
      if (idleId != null) cancelIdle(idleId);
      if (rafCallback) gsap.ticker.remove(rafCallback);
      if (lenis) { lenis.destroy(); lenisRef.current = null; }
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return <>{children}</>;
}
