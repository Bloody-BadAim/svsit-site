"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { InfiniteSlider } from "@/components/ui/InfiniteSlider";

const slidesA = [
  { label: "Workshop", color: "#3B82F6" },
  { label: "Hackathon", color: "#F59E0B" },
  { label: "Borrel", color: "#EF4444" },
  { label: "Tech Talk", color: "#3B82F6" },
  { label: "Code Review", color: "#F59E0B" },
  { label: "Pizza Night", color: "#EF4444" },
];

const slidesB = [
  { label: "SIT Event", color: "#F59E0B" },
  { label: "Game Night", color: "#EF4444" },
  { label: "Study Jam", color: "#F59E0B" },
  { label: "Network Event", color: "#3B82F6" },
  { label: "LAN Party", color: "#EF4444" },
  { label: "Demo Day", color: "#3B82F6" },
];

function SlideCard({ label, color }: { label: string; color: string }) {
  return (
    <div
      className="w-[120px] h-[90px] flex items-center justify-center border border-[var(--color-border)]"
      style={{ background: `${color}08` }}
    >
      <span
        className="font-mono text-[10px] tracking-wider"
        style={{ color, opacity: 0.7 }}
      >
        {label}
      </span>
    </div>
  );
}

export default function EventStrip() {
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!stripRef.current) return;

    // Show when WhyJoin section enters
    const showTrigger = ScrollTrigger.create({
      trigger: "#about",
      start: "bottom 80%",
      onEnter: () => {
        if (stripRef.current) gsap.to(stripRef.current, { opacity: 1, duration: 0.6 });
      },
      onLeaveBack: () => {
        if (stripRef.current) gsap.to(stripRef.current, { opacity: 0, duration: 0.4 });
      },
    });

    // Hide before Word Lid CTA
    const hideTrigger = ScrollTrigger.create({
      trigger: "#join",
      start: "top bottom",
      onEnter: () => {
        if (stripRef.current) gsap.to(stripRef.current, { opacity: 0, duration: 0.4 });
      },
      onLeaveBack: () => {
        if (stripRef.current) gsap.to(stripRef.current, { opacity: 1, duration: 0.6 });
      },
    });

    return () => {
      showTrigger.kill();
      hideTrigger.kill();
    };
  }, []);

  return (
    <div
      ref={stripRef}
      className="hidden lg:flex fixed right-0 top-0 bottom-0 z-20 gap-3 pr-2 opacity-0"
      style={{ pointerEvents: "none" }}
    >
      <div
        className="flex gap-3 h-full"
        style={{
          maskImage: "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
        }}
      >
        {/* Column 1: scrolls up */}
        <InfiniteSlider direction="vertical" speed={25} gap={14} className="h-full opacity-[0.3]">
          {slidesA.map((slide, i) => (
            <SlideCard key={i} label={slide.label} color={slide.color} />
          ))}
        </InfiniteSlider>

        {/* Column 2: scrolls down (reverse) */}
        <InfiniteSlider direction="vertical" speed={20} gap={14} reverse className="h-full opacity-[0.3]">
          {slidesB.map((slide, i) => (
            <SlideCard key={i} label={slide.label} color={slide.color} />
          ))}
        </InfiniteSlider>
      </div>

      <div className="absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-[var(--color-bg)] to-transparent pointer-events-none" />
    </div>
  );
}
