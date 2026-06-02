"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { isReducedMotion } from "@/lib/motion";

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
    // Bij reduced motion (OS of // static toggle bij laden): GEEN smooth-scroll,
    // gewoon native scroll. We koppelen lenis NIET aan de live toggle: lenis
    // mid-sessie destroyen brak de scroll (ScrollTrigger raakte zijn scroller
    // kwijt). De toggle stopt wel de zichtbare animaties (canvas/grain/reveals).
    if (isReducedMotion()) return;

    let lenis: Lenis | null = null;
    let rafCallback: ((time: number) => void) | null = null;
    let cancelled = false;

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
        // Lenis faalde - native scroll (ScrollTrigger werkt nog)
      }
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
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return <>{children}</>;
}
