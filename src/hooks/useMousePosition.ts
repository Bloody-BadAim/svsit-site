"use client";

import { useEffect, useRef, useCallback } from "react";

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export interface MouseState {
  x: number;
  y: number;
  normX: number; // 0–1
  normY: number; // 0–1
  active: boolean;
}

export function useMousePosition(
  containerRef: React.RefObject<HTMLElement | null>,
  lerpFactor = 0.08
): MouseState {
  const stateRef = useRef<MouseState>({ x: 0, y: 0, normX: 0.5, normY: 0.5, active: false });
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const callbacksRef = useRef<Set<(state: MouseState) => void>>(new Set());
  const rafRef = useRef(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Skip on touch devices
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch) return;

    const onMove = (e: MouseEvent) => {
      targetRef.current.x = e.clientX;
      targetRef.current.y = e.clientY;
      stateRef.current.active = true;
    };

    const onLeave = () => {
      stateRef.current.active = false;
    };

    const tick = () => {
      const c = currentRef.current;
      const t = targetRef.current;

      if (stateRef.current.active) {
        c.x = lerp(c.x, t.x, lerpFactor);
        c.y = lerp(c.y, t.y, lerpFactor);
      }

      const rect = el.getBoundingClientRect();
      stateRef.current.x = c.x;
      stateRef.current.y = c.y;
      stateRef.current.normX = rect.width ? (c.x - rect.left) / rect.width : 0.5;
      stateRef.current.normY = rect.height ? (c.y - rect.top) / rect.height : 0.5;

      // Notify registered callbacks (HeroBackground reads this via ref)
      callbacksRef.current.forEach((cb) => cb(stateRef.current));

      rafRef.current = requestAnimationFrame(tick);
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(rafRef.current);
    };
  }, [containerRef, lerpFactor]);

  // Method to subscribe to updates without causing re-renders
  const subscribe = useCallback((cb: (state: MouseState) => void) => {
    callbacksRef.current.add(cb);
    return () => { callbacksRef.current.delete(cb); };
  }, []);

  // Attach subscribe to the state object for external access
  (stateRef.current as MouseState & { subscribe: typeof subscribe }).subscribe = subscribe;

  return stateRef.current;
}
