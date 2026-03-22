"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BorderTrail } from "@/components/ui/BorderTrail";
import SectionLabel from "@/components/SectionLabel";

gsap.registerPlugin(ScrollTrigger);

const events = [
  {
    title: "Meet de OC",
    description: "Ontmoet de Opleidingscommissie en praat mee over de opleiding.",
    date: "24 MRT",
    year: "2026",
    time: "16:00",
    location: "WBH 5e verdieping",
    badge: "DEZE WEEK",
    badgeColor: "#F59E0B",
    accent: "#F59E0B",
  },
  {
    title: "Kroegentocht",
    description: "Een avond door de beste kroegen van Amsterdam met je medestudenten.",
    date: "16 APR",
    year: "2026",
    time: "20:00",
    location: "Amsterdam Centrum",
    badge: "OPEN",
    badgeColor: "#3B82F6",
    accent: "#3B82F6",
  },
  {
    title: "Tech + Borrel",
    description: "Tech talks gecombineerd met een borrel, samen met de opleiding.",
    date: "MEI",
    year: "2026",
    time: "TBA",
    location: "met de opleiding",
    badge: "COMING SOON",
    badgeColor: "#71717A",
    accent: "#EF4444",
  },
];

export default function Events() {
  const sectionRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const timelineLineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!triggerRef.current || !trackRef.current) return;

      const getScrollDistance = () => {
        if (!trackRef.current) return 0;
        // Measure the actual overflow: how far the track extends beyond the viewport
        const trackWidth = trackRef.current.scrollWidth;
        const viewportWidth = window.innerWidth;
        return Math.max(0, trackWidth - viewportWidth);
      };

      // Main horizontal scroll — pin + scrub
      gsap.to(trackRef.current, {
        x: () => -getScrollDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: triggerRef.current,
          pin: true,
          pinType: "transform",
          scrub: 0.5,
          start: "top top",
          end: () => `+=${getScrollDistance()}`,
          invalidateOnRefresh: true,
        },
      });

      // Timeline line grows as you scroll
      if (timelineLineRef.current) {
        gsap.fromTo(
          timelineLineRef.current,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
              trigger: triggerRef.current,
              scrub: 0.5,
              start: "top top",
              end: () => `+=${getScrollDistance()}`,
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="events" className="relative">
      {/* Section label above the pinned area */}
      <div className="pt-40 md:pt-56 pb-12 px-6 md:px-12 lg:px-24">
        <div className="max-w-[1400px] mx-auto">
          <SectionLabel number="03" label="events" />
        </div>
      </div>

      {/* Horizontal scroll container — pinned by GSAP */}
      <div ref={triggerRef} className="relative h-screen flex items-center">
        <div
          ref={trackRef}
          className="flex items-start gap-0"
          style={{ paddingLeft: "clamp(24px, 4vw, 96px)", paddingRight: "30vw", width: "max-content" }}
        >
          {events.map((event, i) => (
            <div
              key={event.title}
              className="flex flex-col items-center"
              style={{ width: "clamp(350px, 35vw, 600px)", flexShrink: 0, marginRight: i < events.length - 1 ? "clamp(60px, 8vw, 140px)" : 0 }}
            >
              {/* Card */}
              <div className="relative w-full border border-[var(--color-border)] bg-[#111113] hover:border-[var(--color-text-muted)]/30 transition-all duration-500">
                <BorderTrail
                  size={80}
                  className="bg-gradient-to-l from-transparent via-current to-transparent"
                  style={{ color: event.accent }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                />

                <div className="p-8 md:p-10">
                  {/* Badge */}
                  <span
                    className="inline-block font-mono text-[10px] px-3 py-1 border mb-6 tracking-wider"
                    style={{ borderColor: event.badgeColor, color: event.badgeColor }}
                  >
                    {event.badge}
                  </span>

                  {/* Title */}
                  <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
                    {event.title}
                  </h3>

                  {/* Description */}
                  <p className="font-mono text-sm text-[var(--color-text-muted)] leading-relaxed mb-6">
                    {event.description}
                  </p>

                  {/* Location */}
                  <div className="font-mono text-xs text-[var(--color-text-muted)] opacity-60">
                    <span className="text-[var(--color-text)]">{event.location}</span>
                    <span className="mx-2">&middot;</span>
                    <span>{event.time}</span>
                  </div>
                </div>
              </div>

              {/* Connector line from card to timeline */}
              <div
                className="w-px h-8 md:h-12"
                style={{ background: event.accent, opacity: 0.5 }}
              />

              {/* Timeline dot */}
              <div
                className="w-3 h-3 rounded-full shadow-[0_0_12px_currentColor]"
                style={{ background: event.accent, color: event.accent }}
              />

              {/* Date chip below timeline */}
              <div className="mt-4">
                <span
                  className="font-mono text-xs font-bold px-3 py-1.5 border tracking-wider"
                  style={{ borderColor: `${event.accent}40`, color: event.accent }}
                >
                  {event.date}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Horizontal timeline line */}
        <div className="absolute left-0 right-0 pointer-events-none" style={{ bottom: "calc(50% - 120px)" }}>
          <div
            ref={timelineLineRef}
            className="h-px w-full origin-left"
            style={{
              background: "linear-gradient(to right, #F59E0B, #3B82F6, #EF4444)",
            }}
          />
        </div>
      </div>
    </section>
  );
}
