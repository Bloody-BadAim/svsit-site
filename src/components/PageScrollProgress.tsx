"use client";

import { ScrollProgress } from "@/components/ui/ScrollProgress";

export default function PageScrollProgress() {
  return (
    <ScrollProgress className="fixed top-0 z-[100] bg-[linear-gradient(to_right,var(--color-accent-gold),var(--color-accent-green),var(--color-accent-blue),var(--color-accent-red))] shadow-[0_0_8px_var(--color-accent-gold),0_0_16px_var(--color-accent-gold)/0.3]" />
  );
}
