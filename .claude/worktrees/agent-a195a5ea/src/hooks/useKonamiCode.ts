"use client";

import { useState, useEffect, useCallback } from "react";

const KONAMI_SEQUENCE = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
  "b", "a",
] as const;

interface KonamiState {
  progress: number;
  total: number;
  activated: boolean;
}

export function useKonamiCode(onActivate: () => void): KonamiState {
  const [progress, setProgress] = useState(0);
  const [activated, setActivated] = useState(false);

  const stableOnActivate = useCallback(onActivate, [onActivate]);

  useEffect(() => {
    // Skip on touch devices (no keyboard)
    if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    const handler = (e: KeyboardEvent) => {
      setProgress((prev) => {
        const expected = KONAMI_SEQUENCE[prev];
        const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;

        if (key === expected || key === expected?.toLowerCase()) {
          const next = prev + 1;
          if (next === KONAMI_SEQUENCE.length) {
            setActivated(true);
            stableOnActivate();
            fetch('/api/easter-egg', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ triggerId: 'konami' }),
            }).catch(() => {/* silently ignore — user may not be logged in */});
            return 0;
          }
          return next;
        }
        // If wrong key but matches start of sequence, reset to 1
        return key === KONAMI_SEQUENCE[0] ? 1 : 0;
      });
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [stableOnActivate]);

  return {
    progress,
    total: KONAMI_SEQUENCE.length,
    activated,
  };
}
