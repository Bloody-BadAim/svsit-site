"use client";

import { useEffect, useRef, useState } from "react";
import { TextScramble } from "@/components/ui/TextScramble";

export default function SectionLabel({
  number,
  label,
}: {
  number: string;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="mb-14 md:mb-20">
      {/* Eyebrow: number + gold line */}
      <div className="flex items-center gap-4 mb-4">
        <span className="font-mono text-xs text-[var(--color-accent-gold)] tracking-[0.3em] uppercase">
          {number}
        </span>
        <span className="w-12 h-px bg-[var(--color-accent-gold)]" />
      </div>

      {/* Section title — large and readable */}
      <TextScramble
        as="h2"
        className="font-display text-2xl md:text-3xl font-bold text-[var(--color-text)] tracking-tight uppercase"
        trigger={inView}
        duration={0.6}
        speed={0.03}
        characterSet="#{}/<>[]!@$%^&*"
      >
        {label}
      </TextScramble>
    </div>
  );
}
