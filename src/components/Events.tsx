"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SectionLabel from "@/components/SectionLabel";

gsap.registerPlugin(ScrollTrigger);

const accentMap = {
  gold: "#F59E0B",
  blue: "#3B82F6",
  red: "#EF4444",
  green: "#22C55E",
} as const;

const events = [
  {
    title: "Meet de OC",
    day: "24",
    month: "mrt",
    year: "2026",
    time: "16:00",
    location: "WBH 5e verdieping",
    description:
      "Ontmoet de Opleidingscommissie en praat mee over de opleiding.",
    status: "DEZE WEEK",
    accent: "gold" as const,
    side: "left" as const,
  },
  {
    title: "Kroegentocht",
    day: "16",
    month: "apr",
    year: "2026",
    time: "20:00",
    location: "Amsterdam Centrum",
    description:
      "Een avond door de beste kroegen van Amsterdam met je medestudenten.",
    status: "OPEN",
    accent: "blue" as const,
    side: "right" as const,
  },
  {
    title: "Tech + Borrel",
    day: "—",
    month: "mei",
    year: "2026",
    time: "TBA",
    location: "met de opleiding",
    description:
      "Tech talks gecombineerd met een borrel, samen met de opleiding.",
    status: "COMING SOON",
    accent: "red" as const,
    side: "left" as const,
  },
];

type Event = (typeof events)[number];

function EventCard({ event }: { event: Event }) {
  const color = accentMap[event.accent];

  return (
    <div
      className="group relative w-full border border-[var(--color-border)] transition-all duration-300 hover:border-current hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
      style={{ background: "var(--color-surface)", color }}
    >
      {/* Top accent line — grows on hover */}
      <div
        className="h-[2px] w-16 group-hover:w-full transition-all duration-500"
        style={{
          background: `linear-gradient(to right, ${color}, ${color}66, transparent)`,
        }}
      />

      {/* Hover inner glow */}
      <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="relative p-8 md:p-10">
        {/* Mobile date — shown only on small screens */}
        <div className="flex items-baseline gap-3 mb-4 md:hidden">
          <span
            className="font-mono text-3xl font-bold"
            style={{ color }}
          >
            {event.day}
          </span>
          <span className="font-mono text-sm text-[var(--color-text-muted)] tracking-wide">
            {event.month} {event.year}
          </span>
        </div>

        <span
          className="inline-block font-mono text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 mb-5 transition-all duration-300"
          style={{ background: color, color: "#09090B" }}
        >
          {event.status}
        </span>

        <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--color-text)] mb-3">
          {event.title}
        </h3>

        <p className="font-mono text-sm text-[var(--color-text-muted)] leading-relaxed mb-5 max-w-sm">
          {event.description}
        </p>

        <div className="flex items-center gap-4 font-mono text-xs text-[var(--color-text-muted)] group-hover:text-[var(--color-text)] transition-colors duration-300">
          <span className="flex items-center gap-1.5">
            <span style={{ color }} className="text-sm">&#9679;</span>
            {event.location}
          </span>
          <span className="opacity-40">|</span>
          <span>{event.time}</span>
        </div>
      </div>
    </div>
  );
}

function DateBlock({ event }: { event: Event }) {
  const color = accentMap[event.accent];

  return (
    <div className="hidden md:flex flex-col items-center justify-center h-full">
      <span
        className="font-mono text-6xl md:text-8xl font-bold leading-none"
        style={{ color }}
      >
        {event.day}
      </span>
      <span className="font-mono text-sm text-[var(--color-text-muted)] tracking-[0.2em] uppercase mt-2">
        {event.month} {event.year}
      </span>
    </div>
  );
}

export default function Events() {
  const sectionRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dateRefs = useRef<(HTMLDivElement | null)[]>([]);
  const connectorRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      dotRefs.current.forEach((el) => el && gsap.set(el, { scale: 0 }));
      cardRefs.current.forEach((el) => el && gsap.set(el, { autoAlpha: 0 }));
      dateRefs.current.forEach((el) => el && gsap.set(el, { autoAlpha: 0 }));
      connectorRefs.current.forEach((el) => el && gsap.set(el, { scaleX: 0 }));

      // Line grows top → bottom with scroll
      if (lineRef.current) {
        gsap.fromTo(
          lineRef.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: timelineRef.current,
              start: "top 80%",
              end: "bottom 20%",
              scrub: true,
            },
          }
        );
      }

      // Per-event: dot → connector → date → card
      const isMobile = window.innerWidth < 768;

      events.forEach((event, i) => {
        const dot = dotRefs.current[i];
        const card = cardRefs.current[i];
        const date = dateRefs.current[i];
        const connector = connectorRefs.current[i];
        const cardDir = isMobile ? 60 : event.side === "left" ? -60 : 60;
        const dateDir = isMobile ? 0 : event.side === "left" ? 60 : -60;

        if (dot) {
          gsap.to(dot, {
            scale: 1,
            duration: 0.5,
            ease: "back.out(1.7)",
            scrollTrigger: {
              trigger: dot,
              start: "top 75%",
              toggleActions: "play none none reverse",
            },
          });
        }

        if (connector) {
          gsap.to(connector, {
            scaleX: 1,
            duration: 0.4,
            ease: "power2.out",
            scrollTrigger: {
              trigger: connector,
              start: "top 72%",
              toggleActions: "play none none reverse",
            },
          });
        }

        if (date) {
          gsap.fromTo(
            date,
            { autoAlpha: 0, x: dateDir },
            {
              autoAlpha: 1,
              x: 0,
              duration: 0.5,
              ease: "power2.out",
              scrollTrigger: {
                trigger: date,
                start: "top 72%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }

        if (card) {
          gsap.fromTo(
            card,
            { autoAlpha: 0, x: cardDir },
            {
              autoAlpha: 1,
              x: 0,
              duration: 0.6,
              ease: "power2.out",
              scrollTrigger: {
                trigger: card,
                start: "top 70%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="events" className="relative pt-48 md:pt-64 pb-48 md:pb-64">
      <div className="px-6 md:px-12 lg:px-24 mb-16 md:mb-24">
        <div className="max-w-[1400px] mx-auto">
          <SectionLabel number="03" label="events" />
        </div>
      </div>

      <div ref={timelineRef} className="relative max-w-[1200px] mx-auto px-6 md:px-12">
        {/* Vertical line — left on mobile, center on desktop */}
        <div
          ref={lineRef}
          className="absolute w-[2px] origin-top left-6 md:left-1/2 md:-translate-x-px top-0 bottom-0"
          style={{
            background: "linear-gradient(to bottom, #F59E0B, #3B82F6, #EF4444)",
          }}
        />

        <div className="flex flex-col gap-16 md:gap-20">
          {events.map((event, i) => {
            const color = accentMap[event.accent];
            const isLeft = event.side === "left";

            return (
              <div
                key={event.title}
                className="grid grid-cols-[40px_1fr] md:grid-cols-[1fr_60px_1fr] items-center"
              >
                {/* Date block — opposite side of card (desktop only) */}
                <div
                  ref={(el) => { dateRefs.current[i] = el; }}
                  className={`hidden md:block ${
                    isLeft ? "md:col-start-3" : "md:col-start-1"
                  } row-start-1`}
                >
                  <DateBlock event={event} />
                </div>

                {/* Dot column */}
                <div className="col-start-1 row-start-1 md:col-start-2 flex justify-center pt-6 relative">
                  <div
                    ref={(el) => { dotRefs.current[i] = el; }}
                    className="w-3 h-3 rounded-full z-10 shrink-0"
                    style={{
                      background: color,
                      boxShadow: `0 0 12px ${color}`,
                    }}
                  />
                  {/* Connector line from dot toward card */}
                  <div
                    ref={(el) => { connectorRefs.current[i] = el; }}
                    className={`absolute top-[27px] h-px w-5
                      left-[calc(50%+8px)] origin-left
                      ${isLeft
                        ? "md:right-[calc(50%+8px)] md:left-auto md:origin-right"
                        : "md:left-[calc(50%+8px)] md:right-auto md:origin-left"
                      }
                    `}
                    style={{ background: color, opacity: 0.4 }}
                  />
                </div>

                {/* Card */}
                <div
                  ref={(el) => { cardRefs.current[i] = el; }}
                  className={`col-start-2 row-start-1 ${
                    isLeft ? "md:col-start-1" : "md:col-start-3"
                  }`}
                >
                  <EventCard event={event} />
                </div>
              </div>
            );
          })}
        </div>

        <p className="font-mono text-sm text-[var(--color-accent-green)] text-center mt-16 md:mt-20 opacity-60">
          {"// meer events coming soon..."}
        </p>
      </div>
    </section>
  );
}
