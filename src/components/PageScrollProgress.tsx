"use client";

import { ScrollProgress } from "@/components/ui/ScrollProgress";

export default function PageScrollProgress() {
  return (
    <ScrollProgress className="fixed top-0 z-[100] bg-gradient-to-r from-[var(--color-accent-gold)] via-[var(--color-accent-blue)] to-[var(--color-accent-red)]" />
  );
}
