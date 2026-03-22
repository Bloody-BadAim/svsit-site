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
    <div ref={ref} className="flex items-center gap-4 mb-16 md:mb-24">
      <span className="font-mono text-xs text-[var(--color-accent-gold)] tracking-[0.3em] uppercase">
        {number}
      </span>
      <span className="w-12 h-px bg-[var(--color-accent-gold)]" />
      <TextScramble
        as="span"
        className="font-mono text-xs text-[var(--color-text-muted)] tracking-[0.2em] uppercase"
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
