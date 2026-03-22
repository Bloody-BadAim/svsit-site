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
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!triggerRef.current || !trackRef.current) return;

      const getScrollDistance = () => {
        if (!trackRef.current) return 0;
        const trackWidth = trackRef.current.scrollWidth;
        const viewportWidth = window.innerWidth;
        return Math.max(0, trackWidth - viewportWidth);
      };

      // Main horizontal scroll — pin + scrub
      const mainTrigger = ScrollTrigger.create({
        trigger: triggerRef.current,
        pin: true,
        pinType: "transform",
        scrub: 0.5,
        start: "top top",
        end: () => `+=${getScrollDistance()}`,
        invalidateOnRefresh: true,
        animation: gsap.to(trackRef.current, {
          x: () => -getScrollDistance(),
          ease: "none",
        }),
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

      // Animate each card in as it enters the viewport during horizontal scroll
      cardRefs.current.forEach((card) => {
        if (!card) return;
        gsap.fromTo(
          card,
          { opacity: 0, scale: 0.8 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            ease: "back.out(1.4)",
            scrollTrigger: {
              trigger: card,
              containerAnimation: mainTrigger.animation!,
              start: "left 85%",
              toggleActions: "play none none none",
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="events" className="relative">
      {/* Section label above the pinned area */}
      <div className="pt-48 md:pt-64 pb-12 px-6 md:px-12 lg:px-24">
        <div className="max-w-[1400px] mx-auto">
          <SectionLabel number="03" label="events" />
        </div>
      </div>

      {/* Horizontal scroll container — pinned by GSAP */}
      <div ref={triggerRef} className="relative h-screen flex items-center overflow-hidden">
        {/* Horizontal timeline line — sits at center */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 pointer-events-none z-0">
          <div
            ref={timelineLineRef}
            className="h-px w-full origin-left"
            style={{
              background: "linear-gradient(to right, #F59E0B, #3B82F6, #EF4444)",
            }}
          />
        </div>

        <div
          ref={trackRef}
          className="flex items-center gap-0 relative z-10"
          style={{ paddingLeft: "clamp(24px, 6vw, 120px)", paddingRight: "40vw", width: "max-content" }}
        >
          {events.map((event, i) => {
            const isAbove = i % 2 === 0; // 0, 2 above — 1 below
            return (
              <div
                key={event.title}
                className="relative flex flex-col items-center"
                style={{
                  width: "clamp(350px, 35vw, 550px)",
                  flexShrink: 0,
                  marginRight: i < events.length - 1 ? "clamp(200px, 20vw, 300px)" : 0,
                  height: "70vh",
                }}
              >
                {/* TOP HALF */}
                <div className="flex-1 flex flex-col justify-end items-center pb-4">
                  {isAbove ? (
                    <>
                      {/* Card above the line */}
                      <div
                        ref={(el) => { cardRefs.current[i] = el; }}
                        className="event-card relative w-full border border-[var(--color-border)] bg-[#111113] opacity-0"
                      >
                        <BorderTrail
                          size={80}
                          className="bg-gradient-to-l from-transparent via-current to-transparent"
                          style={{ color: event.accent }}
                          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        />
                        <div className="p-8 md:p-10">
                          <span
                            className="inline-block font-mono text-[10px] px-3 py-1 border mb-5 tracking-wider"
                            style={{ borderColor: event.badgeColor, color: event.badgeColor }}
                          >
                            {event.badge}
                          </span>
                          <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
                            {event.title}
                          </h3>
                          <p className="font-mono text-sm text-[var(--color-text-muted)] leading-relaxed mb-5">
                            {event.description}
                          </p>
                          <div className="font-mono text-xs text-[var(--color-text-muted)] opacity-60">
                            <span className="text-[var(--color-text)]">{event.location}</span>
                            <span className="mx-2">&middot;</span>
                            <span>{event.time}</span>
                          </div>
                        </div>
                      </div>
                      {/* Connector down to timeline */}
                      <div
                        className="w-px h-8"
                        style={{ background: event.accent, opacity: 0.5 }}
                      />
                    </>
                  ) : (
                    <>
                      {/* Date chip above the line (when card is below) */}
                      <span
                        className="font-mono text-xs font-bold px-3 py-1.5 border tracking-wider mb-4"
                        style={{ borderColor: `${event.accent}40`, color: event.accent }}
                      >
                        {event.date}
                      </span>
                      {/* Connector down to timeline */}
                      <div
                        className="w-px h-8"
                        style={{ background: event.accent, opacity: 0.3 }}
                      />
                    </>
                  )}
                </div>

                {/* TIMELINE DOT — centered on the line */}
                <div
                  className="w-3.5 h-3.5 rounded-full shadow-[0_0_12px_currentColor] z-10 shrink-0"
                  style={{ background: event.accent, color: event.accent }}
                />

                {/* BOTTOM HALF */}
                <div className="flex-1 flex flex-col justify-start items-center pt-4">
                  {!isAbove ? (
                    <>
                      {/* Connector down from timeline */}
                      <div
                        className="w-px h-8"
                        style={{ background: event.accent, opacity: 0.5 }}
                      />
                      {/* Card below the line */}
                      <div
                        ref={(el) => { cardRefs.current[i] = el; }}
                        className="event-card relative w-full border border-[var(--color-border)] bg-[#111113] opacity-0"
                      >
                        <BorderTrail
                          size={80}
                          className="bg-gradient-to-l from-transparent via-current to-transparent"
                          style={{ color: event.accent }}
                          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        />
                        <div className="p-8 md:p-10">
                          <span
                            className="inline-block font-mono text-[10px] px-3 py-1 border mb-5 tracking-wider"
                            style={{ borderColor: event.badgeColor, color: event.badgeColor }}
                          >
                            {event.badge}
                          </span>
                          <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
                            {event.title}
                          </h3>
                          <p className="font-mono text-sm text-[var(--color-text-muted)] leading-relaxed mb-5">
                            {event.description}
                          </p>
                          <div className="font-mono text-xs text-[var(--color-text-muted)] opacity-60">
                            <span className="text-[var(--color-text)]">{event.location}</span>
                            <span className="mx-2">&middot;</span>
                            <span>{event.time}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Connector down from timeline */}
                      <div
                        className="w-px h-8"
                        style={{ background: event.accent, opacity: 0.3 }}
                      />
                      {/* Date chip below the line (when card is above) */}
                      <span
                        className="font-mono text-xs font-bold px-3 py-1.5 border tracking-wider mt-4"
                        style={{ borderColor: `${event.accent}40`, color: event.accent }}
                      >
                        {event.date}
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
