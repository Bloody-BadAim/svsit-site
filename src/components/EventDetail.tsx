"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { SitEvent } from "@/components/EventList";
import { generateICSFile } from "@/lib/calendar";

interface EventDetailProps {
  event: SitEvent;
  transitionKey: string;
}

type TransitionPhase = "idle" | "glitchOut" | "black" | "scanIn";

export default function EventDetail({ event, transitionKey }: EventDetailProps) {
  const [displayedEvent, setDisplayedEvent] = useState<SitEvent>(event);
  const [phase, setPhase] = useState<TransitionPhase>("idle");
  const [isHovered, setIsHovered] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef({ rx: 0, ry: 0 });
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const color = displayedEvent.color;

  const clearTimers = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  /* Transition state machine */
  useEffect(() => {
    if (phase === "idle" && displayedEvent === event) return;

    clearTimers();
    setPhase("glitchOut");

    const t1 = setTimeout(() => {
      setPhase("black");
      setDisplayedEvent(event);

      const t2 = setTimeout(() => {
        setPhase("scanIn");

        const t3 = setTimeout(() => {
          setPhase("idle");
        }, 300);
        timeoutsRef.current.push(t3);
      }, 50);
      timeoutsRef.current.push(t2);
    }, 150);
    timeoutsRef.current.push(t1);

    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transitionKey]);

  useEffect(() => {
    setDisplayedEvent(event);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  /* 3D tilt */
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rx = ((y - centerY) / centerY) * -4;
    const ry = ((x - centerX) / centerX) * 4;

    tiltRef.current = { rx, ry };
    panelRef.current.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!panelRef.current) return;
    tiltRef.current = { rx: 0, ry: 0 };
    panelRef.current.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg)";
    setIsHovered(false);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const containerAnimation = (): React.CSSProperties => {
    switch (phase) {
      case "glitchOut":
        return { animation: "glitchOut 150ms ease forwards" };
      case "black":
        return { opacity: 0 };
      case "scanIn":
        return { animation: "scanReveal 300ms ease-out forwards" };
      default:
        return { opacity: 1 };
    }
  };

  /* Calendar download */
  const handleCalendarDownload = () => {
    const year = parseInt(displayedEvent.year);
    const monthMap: Record<string, number> = {
      JAN: 0, FEB: 1, MRT: 2, APR: 3, MEI: 4, JUN: 5,
      JUL: 6, AUG: 7, SEP: 8, OKT: 9, NOV: 10, DEC: 11,
    };
    const month = monthMap[displayedEvent.month] ?? 0;
    const day = parseInt(displayedEvent.day) || 1;
    const [hours, minutes] = (displayedEvent.time !== "TBA" ? displayedEvent.time : "12:00").split(":").map(Number);

    generateICSFile({
      title: displayedEvent.title,
      date: new Date(year, month, day, hours, minutes),
      location: displayedEvent.location,
      description: displayedEvent.description,
    });
  };

  /* CTA button */
  function renderCta() {
    const baseClass = "inline-flex items-center gap-2 px-7 py-3 font-mono text-[13px] font-bold tracking-wider uppercase transition-all duration-200";

    switch (displayedEvent.status) {
      case "completed":
        return (
          <button
            disabled
            className={`${baseClass} bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-white/10 opacity-50 cursor-not-allowed`}
          >
            AFGEROND &#10003;
          </button>
        );
      case "upcoming":
        return (
          <button
            className={`${baseClass} bg-[var(--color-accent-gold)] text-[#09090B] border-none cursor-pointer hover:scale-[1.02] hover:shadow-[0_0_24px_rgba(245,158,11,0.4)]`}
          >
            RSVP &rarr;
          </button>
        );
      case "coming_soon":
        return (
          <button
            disabled
            className={`${baseClass} bg-transparent text-[var(--color-text-muted)] border border-white/10 cursor-default`}
          >
            COMING SOON <span style={{ animation: "statusPulse 1.5s ease-in-out infinite" }}>_</span>
          </button>
        );
      default:
        return null;
    }
  }

  return (
    <div
      ref={panelRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      className="relative overflow-hidden"
      style={{
        background: "var(--color-surface)",
        border: "1px solid rgba(255,255,255,0.1)",
        transition: "transform 0.15s ease-out",
        willChange: "transform",
        pointerEvents: phase !== "idle" ? "none" : "auto",
        ...containerAnimation(),
      }}
    >
      {/* Ambient scanline */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.08), transparent)",
          animation: "ambientScan 8s linear infinite",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      <div style={{ padding: "32px", position: "relative", zIndex: 2 }}>
        {/* Date block */}
        <div style={{ marginBottom: "20px" }}>
          <span
            className="font-display"
            style={{
              fontWeight: 800,
              fontSize: "72px",
              lineHeight: 1,
              color,
              display: "block",
            }}
          >
            {displayedEvent.day}
          </span>
          <span
            className="font-mono"
            style={{
              fontSize: "14px",
              color: "var(--color-text-muted)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              opacity: 0.9,
              marginTop: "4px",
              display: "block",
            }}
          >
            {displayedEvent.month} {displayedEvent.year}
          </span>
        </div>

        {/* Event title */}
        <h2
          className="font-display"
          style={{
            fontSize: "clamp(24px, 3vw, 30px)",
            fontWeight: 700,
            textTransform: "uppercase",
            color: "var(--color-text)",
            lineHeight: 1.2,
            marginBottom: "16px",
          }}
        >
          {displayedEvent.title}
        </h2>

        {/* Accent line */}
        <div
          style={{
            width: isHovered ? "120px" : "80px",
            height: "3px",
            background: color,
            transition: "width 300ms ease",
            marginBottom: "20px",
          }}
        />

        {/* Description */}
        <p
          style={{
            fontSize: "14px",
            lineHeight: 1.7,
            color: "var(--color-text-muted)",
            maxWidth: "32rem",
            marginBottom: "24px",
          }}
        >
          {displayedEvent.description}
        </p>

        {/* Tags */}
        {displayedEvent.tags && displayedEvent.tags.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              marginBottom: "20px",
            }}
          >
            {displayedEvent.tags.map((tag) => (
              <span
                key={tag}
                className="font-mono"
                style={{
                  fontSize: "11px",
                  color,
                  border: "1px solid",
                  borderColor: `color-mix(in srgb, ${color} 20%, transparent)`,
                  background: `color-mix(in srgb, ${color} 5%, transparent)`,
                  borderRadius: "4px",
                  padding: "4px 10px",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Location + time */}
        <div
          className="font-mono"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: "12px",
            color: "var(--color-text-muted)",
            marginBottom: "28px",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: color,
                flexShrink: 0,
              }}
            />
            {displayedEvent.location}
          </span>
          <span style={{ opacity: 0.4 }}>|</span>
          <span>{displayedEvent.time}</span>
        </div>

        {/* CTA + Calendar */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          {renderCta()}
          {displayedEvent.status !== "coming_soon" && (
            <button
              onClick={handleCalendarDownload}
              className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent-gold)] transition-colors cursor-pointer"
            >
              + Toevoegen aan agenda
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
