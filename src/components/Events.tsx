"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import EventTimeline from "@/components/EventTimeline";
import EventDetail from "@/components/EventDetail";
import type { SitEvent } from "@/components/EventList";

gsap.registerPlugin(ScrollTrigger);

// ─── Events data ─────────────────────────────────────────
const events: SitEvent[] = [
  {
    id: "alv",
    title: "ALV Bestuur XI",
    day: "20",
    month: "MRT",
    year: "2026",
    time: "16:00",
    location: "WBH 5e verdieping",
    description: "Het nieuwe bestuur is officieel geinstalleerd.",
    status: "completed",
    color: "var(--color-accent-gold)",
    tags: ["bestuur", "officieel"],
  },
  {
    id: "meetdeoc",
    title: "Meet de OC",
    day: "24",
    month: "MRT",
    year: "2026",
    time: "16:00",
    location: "WBH 5e verdieping",
    description:
      "Ontmoet de Opleidingscommissie en praat mee over de opleiding.",
    status: "completed",
    color: "var(--color-accent-blue)",
    tags: ["opleiding", "community"],
  },
  {
    id: "gettogether",
    title: "Get Together",
    day: "27",
    month: "MRT",
    year: "2026",
    time: "17:00",
    location: "Common Room, dan Fest",
    description: "Casual borrel met het nieuwe bestuur. Neem gerust iemand mee.",
    status: "completed",
    color: "var(--color-accent-green)",
    tags: ["borrel", "social"],
  },
  {
    id: "kroegentocht",
    title: "Kroegentocht",
    day: "16",
    month: "APR",
    year: "2026",
    time: "20:00",
    location: "Amsterdam Centrum",
    description:
      "Een avond door de beste kroegen van Amsterdam met je medestudenten.",
    status: "upcoming",
    color: "var(--color-accent-gold)",
    tags: ["SVO", "social", "nachtleven"],
  },
  {
    id: "stagemarkt",
    title: "Stagemarkt HBO-ICT",
    day: "17",
    month: "APR",
    year: "2026",
    time: "13:30",
    location: "Kohnstammhuis",
    description:
      "Ontmoet bedrijven en vind je stage. SIT en FemIT zijn aanwezig.",
    status: "upcoming",
    color: "var(--color-accent-blue)",
    tags: ["stage", "carriere", "netwerk"],
  },
  {
    id: "hackathon",
    title: "Connectie Code Hackathon",
    day: "10",
    month: "MEI",
    year: "2026",
    time: "09:00",
    location: "AI House Amsterdam",
    description:
      "AI hackathon met 8 studieverenigingen. SIT en FemIT leveren mentoren.",
    status: "upcoming",
    color: "var(--color-accent-red)",
    tags: ["AI", "hackathon", "code"],
  },
  {
    id: "techborrel",
    title: "Tech + Borrel",
    day: "TBA",
    month: "MEI",
    year: "2026",
    time: "TBA",
    location: "met de opleiding",
    description:
      "Tech talks gecombineerd met een borrel, samen met de opleiding.",
    status: "coming_soon",
    color: "var(--color-accent-green)",
    tags: ["tech", "borrel", "opleiding"],
  },
  {
    id: "cern",
    title: "CERN Lezing",
    day: "05",
    month: "JUN",
    year: "2026",
    time: "TBA",
    location: "HvA Amstelcampus",
    description:
      "2-3 sprekers van CERN over techniek en carriere in particle physics.",
    status: "coming_soon",
    color: "var(--color-accent-gold)",
    tags: ["tech", "lezing", "wetenschap"],
  },
];

// CSS var → hex for glow effects
const CSS_TO_HEX: Record<string, string> = {
  "var(--color-accent-gold)": "#F59E0B",
  "var(--color-accent-blue)": "#3B82F6",
  "var(--color-accent-red)": "#EF4444",
  "var(--color-accent-green)": "#22C55E",
};

// Default selected: first upcoming event
const defaultSelected =
  events.find((e) => e.status === "upcoming")?.id ?? events[0].id;

export default function Events() {
  const [selectedId, setSelectedId] = useState(defaultSelected);
  const [isDesktop, setIsDesktop] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  const selectedEvent = events.find((e) => e.id === selectedId) ?? events[0];
  const hex = CSS_TO_HEX[selectedEvent.color] || "#F59E0B";

  // Responsive layout — sidebar detail only on wide screens
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1100);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // GSAP header entrance
  useEffect(() => {
    const ctx = gsap.context(() => {
      const headerElements = [
        numberRef.current,
        titleRef.current,
        lineRef.current,
      ].filter(Boolean);
      if (headerElements.length) {
        gsap.fromTo(
          headerElements,
          { autoAlpha: 0, y: 20 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: headerRef.current,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          },
        );
      }

      // Detail panel entrance
      if (detailRef.current) {
        gsap.fromTo(
          detailRef.current,
          { autoAlpha: 0, x: isDesktop ? 30 : 0, scale: isDesktop ? 1 : 0.97 },
          {
            autoAlpha: 1,
            x: 0,
            scale: 1,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: {
              trigger: detailRef.current,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          },
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [isDesktop]);

  // ─── Detail sidebar (shared between layouts) ───
  const renderDetailPanel = () => (
    <div
      ref={detailRef}
      style={{
        ...(isDesktop
          ? {
              position: "sticky" as const,
              top: "5rem",
              alignSelf: "start",
            }
          : {
              marginTop: "3rem",
            }),
      }}
    >
      {/* ── Signal connection indicator (desktop only) ── */}
      {isDesktop && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "16px",
          }}
        >
          {/* Animated connection dot */}
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: selectedEvent.color,
              boxShadow: `0 0 12px ${hex}80`,
              animation: "statusPulse 1.5s ease-in-out infinite",
              flexShrink: 0,
            }}
          />
          {/* Connection line */}
          <div
            style={{
              flex: 1,
              height: "1px",
              background: `linear-gradient(90deg, ${hex}40, ${hex}10, transparent)`,
            }}
          />
          <span
            className="font-mono"
            style={{
              fontSize: "10px",
              color: selectedEvent.color,
              opacity: 0.6,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            LINKED
          </span>
        </div>
      )}

      {/* Console header */}
      <div
        className="font-mono"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "12px",
          fontSize: "11px",
          color: "var(--color-text-muted)",
          opacity: 0.6,
        }}
      >
        <span style={{ color: "var(--color-accent-green)" }}>&gt;</span>
        <span>event.loadDetails(</span>
        <span style={{ color: selectedEvent.color }}>
          &quot;{selectedEvent.id}&quot;
        </span>
        <span>)</span>
        <div
          style={{
            flex: 1,
            height: "1px",
            background:
              "linear-gradient(90deg, rgba(255,255,255,0.06), transparent)",
            marginLeft: "8px",
          }}
        />
      </div>

      {/* Glowing left accent border wrapper (desktop) */}
      <div
        style={{
          position: "relative",
          ...(isDesktop
            ? {
                borderLeft: `2px solid ${hex}50`,
                paddingLeft: "0px",
              }
            : {}),
        }}
      >
        {/* Left border glow */}
        {isDesktop && (
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: 0,
              left: "-1px",
              width: "4px",
              height: "100%",
              background: `linear-gradient(to bottom, ${hex}40, ${hex}10, ${hex}40)`,
              filter: "blur(4px)",
              pointerEvents: "none",
            }}
          />
        )}

        <EventDetail event={selectedEvent} transitionKey={selectedId} />
      </div>
    </div>
  );

  return (
    <section
      ref={sectionRef}
      id="events"
      className="relative"
      style={{ paddingTop: "6rem", paddingBottom: "6rem" }}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 40%, rgba(242,158,24,0.04) 0%, transparent 70%)",
        }}
      />

      <div
        style={{ paddingLeft: "1.5rem", paddingRight: "1.5rem" }}
        className="md:px-12 lg:px-24"
      >
        <div className="max-w-[1400px] mx-auto">
          {/* ─── Section header ─── */}
          <div ref={headerRef} style={{ marginBottom: "3rem" }}>
            <span
              ref={numberRef}
              style={{
                fontFamily: "'Big Shoulders Display', sans-serif",
                fontWeight: 800,
                fontSize: "48px",
                color: "var(--color-accent-gold)",
                opacity: 0.5,
                display: "block",
                lineHeight: 1,
              }}
            >
              04
            </span>
            <h2
              ref={titleRef}
              style={{
                fontFamily: "'Big Shoulders Display', sans-serif",
                fontWeight: 800,
                fontSize: "clamp(48px, 8vw, 80px)",
                color: "var(--color-text)",
                lineHeight: 0.9,
                letterSpacing: "0.02em",
                marginTop: "4px",
              }}
            >
              EVENTS
            </h2>
            <div
              ref={lineRef}
              style={{
                width: "80px",
                height: "4px",
                background: "var(--color-accent-gold)",
                marginTop: "16px",
              }}
            />
          </div>

          {/* ═══════════ DESKTOP: two-column layout ═══════════ */}
          {isDesktop ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 380px",
                gap: "2.5rem",
                alignItems: "start",
              }}
            >
              {/* Left: Glitch Energy Timeline */}
              <EventTimeline
                events={events}
                activeId={selectedId}
                onSelect={setSelectedId}
              />

              {/* Right: Sticky Mission Brief Console */}
              {renderDetailPanel()}
            </div>
          ) : (
            /* ═══════════ MOBILE/TABLET: stacked layout ═══════════ */
            <>
              <EventTimeline
                events={events}
                activeId={selectedId}
                onSelect={setSelectedId}
              />
              {renderDetailPanel()}
            </>
          )}

          {/* Bottom comment lines */}
          <div style={{ textAlign: "center", marginTop: "4rem" }}>
            <p
              className="font-mono text-sm"
              style={{ color: "var(--color-accent-green)", opacity: 0.6 }}
            >
              {"// meer events coming soon..."}
            </p>
            <p
              className="font-mono text-xs"
              style={{
                color: "var(--color-accent-red)",
                opacity: 0.4,
                marginTop: "0.5rem",
              }}
            >
              {"// TODO: fix bug waar events.length altijd te laag is"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
