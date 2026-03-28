"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { SitEvent } from "@/components/EventList";

interface EventDetailProps {
  event: SitEvent;
  transitionKey: string;
}

type TransitionPhase = "idle" | "glitchOut" | "black" | "scanIn" | "typewriter";

/* ── Build the terminal code string for a given event ── */
function buildCodeString(event: SitEvent): string {
  return [
    `const event = {`,
    `  naam: "${event.title}",`,
    `  tijd: "${event.time}",`,
    `  locatie: "${event.location}",`,
    `  status: "${event.status}",`,
    `};`,
  ].join("\n");
}

/* ── Syntax-highlighted code renderer ────────────────── */
function HighlightedCode({ code }: { code: string }) {
  const nodes: React.ReactNode[] = [];

  // Tokenize line-by-line for readability
  const lines = code.split("\n");
  lines.forEach((line, li) => {
    const lineNodes: React.ReactNode[] = [];
    let remaining = line;

    // keyword: const
    if (remaining.startsWith("const ")) {
      lineNodes.push(
        <span key={`kw-${li}`} style={{ color: "var(--color-accent-blue)" }}>
          const
        </span>
      );
      remaining = remaining.slice(5); // keep the space
    }

    // string values: "..."
    const parts = remaining.split(/("(?:[^"\\]|\\.)*")/g);
    parts.forEach((part, pi) => {
      if (part.startsWith('"') && part.endsWith('"')) {
        lineNodes.push(
          <span key={`s-${li}-${pi}`} style={{ color: "var(--color-accent-gold)" }}>
            {part}
          </span>
        );
      } else {
        // Punctuation in muted, identifiers in text color
        const subParts = part.split(/([{}:,;=])/g);
        subParts.forEach((sub, si) => {
          if (/^[{}:,;=]$/.test(sub)) {
            lineNodes.push(
              <span key={`p-${li}-${pi}-${si}`} style={{ color: "var(--color-text-muted)" }}>
                {sub}
              </span>
            );
          } else if (sub.trim()) {
            lineNodes.push(
              <span key={`t-${li}-${pi}-${si}`} style={{ color: "var(--color-text)", opacity: 0.9 }}>
                {sub}
              </span>
            );
          } else {
            lineNodes.push(<span key={`w-${li}-${pi}-${si}`}>{sub}</span>);
          }
        });
      }
    });

    nodes.push(<span key={`line-${li}`}>{lineNodes}</span>);
    if (li < lines.length - 1) nodes.push(<br key={`br-${li}`} />);
  });

  return <>{nodes}</>;
}

/* ── Main component ──────────────────────────────────── */
export default function EventDetail({ event, transitionKey }: EventDetailProps) {
  /* Displayed event — swapped during "black" phase */
  const [displayedEvent, setDisplayedEvent] = useState<SitEvent>(event);
  const [phase, setPhase] = useState<TransitionPhase>("idle");
  const [typedLength, setTypedLength] = useState<number>(0);
  const [isHovered, setIsHovered] = useState(false);

  /* Refs for tilt */
  const panelRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef({ rx: 0, ry: 0 });

  /* Refs for cleanup */
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const color = displayedEvent.color;
  const codeString = buildCodeString(displayedEvent);

  /* ── Clear all running timers ─────────────────────── */
  const clearTimers = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  /* ── Transition state machine ─────────────────────── */
  useEffect(() => {
    // Skip initial render
    if (phase === "idle" && displayedEvent === event) return;

    // Only fire when transitionKey actually changes and we're idle or re-entering
    clearTimers();

    setPhase("glitchOut");

    const t1 = setTimeout(() => {
      setPhase("black");
      setDisplayedEvent(event);

      const t2 = setTimeout(() => {
        setPhase("scanIn");
        setTypedLength(0);

        const t3 = setTimeout(() => {
          setPhase("typewriter");
        }, 300);
        timeoutsRef.current.push(t3);
      }, 50);
      timeoutsRef.current.push(t2);
    }, 150);
    timeoutsRef.current.push(t1);

    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transitionKey]);

  /* ── Typewriter interval ──────────────────────────── */
  useEffect(() => {
    if (phase !== "typewriter") return;

    const fullLength = buildCodeString(displayedEvent).length;
    setTypedLength(0);

    intervalRef.current = setInterval(() => {
      setTypedLength((prev) => {
        if (prev >= fullLength) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = null;
          setPhase("idle");
          return fullLength;
        }
        return prev + 1;
      });
    }, 30);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [phase, displayedEvent]);

  /* ── Initialize displayedEvent on first mount ─────── */
  useEffect(() => {
    setDisplayedEvent(event);
    setTypedLength(buildCodeString(event).length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Cleanup on unmount ───────────────────────────── */
  useEffect(() => clearTimers, [clearTimers]);

  /* ── 3D tilt handlers ─────────────────────────────── */
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

  /* ── Animation style for container ────────────────── */
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

  /* ── Determine code to show ───────────────────────── */
  const visibleCode =
    phase === "typewriter" ? codeString.slice(0, typedLength) : codeString;

  const showCursor = phase === "typewriter";

  /* ── CTA button ───────────────────────────────────── */
  function renderCta() {
    const baseStyle: React.CSSProperties = {
      padding: "12px 28px",
      fontFamily: "var(--font-mono, monospace)",
      fontSize: "13px",
      fontWeight: 700,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      transition: "all 0.2s ease",
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
    };

    switch (displayedEvent.status) {
      case "completed":
        return (
          <button
            disabled
            className="font-mono"
            style={{
              ...baseStyle,
              background: "var(--color-surface)",
              color: "var(--color-text-muted)",
              border: "1px solid rgba(255,255,255,0.1)",
              opacity: 0.5,
              cursor: "not-allowed",
            }}
          >
            AFGEROND <span style={{ fontSize: "16px" }}>&#10003;</span>
          </button>
        );
      case "upcoming":
        return (
          <button
            className="font-mono"
            style={{
              ...baseStyle,
              background: "var(--color-accent-gold)",
              color: "#09090B",
              border: "none",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.02)";
              e.currentTarget.style.boxShadow = "0 0 24px rgba(245,158,11,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            RSVP <span>&rarr;</span>
          </button>
        );
      case "coming_soon":
        return (
          <button
            disabled
            className="font-mono"
            style={{
              ...baseStyle,
              background: "transparent",
              color: "var(--color-text-muted)",
              border: "1px solid rgba(255,255,255,0.1)",
              cursor: "default",
            }}
          >
            COMING SOON{" "}
            <span style={{ animation: "statusPulse 1.5s ease-in-out infinite" }}>_</span>
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
        {/* 1. Comment line with colored dot */}
        <div
          className="font-mono"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "24px",
          }}
        >
          <span
            style={{
              fontSize: "12px",
              color: "var(--color-text-muted)",
              opacity: 0.9,
            }}
          >
            {"// event.details"}
          </span>
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: color,
              flexShrink: 0,
            }}
          />
        </div>

        {/* 2. Large date block */}
        <div style={{ marginBottom: "20px" }}>
          <span
            style={{
              fontFamily: "var(--font-big-shoulders)",
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

        {/* 3. Event title */}
        <h2
          className="font-mono"
          style={{
            fontSize: "clamp(24px, 3vw, 30px)",
            fontWeight: 700,
            textTransform: "uppercase",
            color: "var(--color-text)",
            lineHeight: 1.2,
            marginBottom: "16px",
            opacity: 0.95,
          }}
        >
          {displayedEvent.title}
        </h2>

        {/* 4. Accent line (grows on hover) */}
        <div
          style={{
            width: isHovered ? "120px" : "80px",
            height: "3px",
            background: color,
            transition: "width 300ms ease",
            marginBottom: "20px",
          }}
        />

        {/* 5. Description */}
        <p
          className="font-mono"
          style={{
            fontSize: "14px",
            lineHeight: 1.7,
            color: "var(--color-text-muted)",
            maxWidth: "32rem",
            marginBottom: "28px",
            opacity: 0.9,
          }}
        >
          {displayedEvent.description}
        </p>

        {/* 6. Code block (terminal style) */}
        <div
          style={{
            background: "var(--color-bg)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "4px",
            overflow: "hidden",
            marginBottom: "24px",
          }}
        >
          {/* Terminal chrome bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "10px 14px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <span
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "var(--color-accent-red)",
              }}
            />
            <span
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "var(--color-accent-gold)",
              }}
            />
            <span
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "var(--color-accent-green)",
              }}
            />
            <span
              className="font-mono"
              style={{
                fontSize: "11px",
                color: "var(--color-text-muted)",
                marginLeft: "8px",
                opacity: 0.7,
              }}
            >
              event.ts
            </span>
          </div>

          {/* Code content */}
          <pre
            className="font-mono"
            style={{
              padding: "16px",
              fontSize: "13px",
              lineHeight: 1.7,
              margin: 0,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            <code>
              <HighlightedCode code={visibleCode} />
              {showCursor && (
                <span
                  style={{
                    color: "var(--color-accent-gold)",
                    animation: "statusPulse 1s ease-in-out infinite",
                    fontWeight: 400,
                  }}
                >
                  |
                </span>
              )}
            </code>
          </pre>
        </div>

        {/* 7. Tags row */}
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
                  border: `1px solid`,
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

        {/* 8. Location + time row */}
        <div
          className="font-mono"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: "12px",
            color: "var(--color-text-muted)",
            marginBottom: "28px",
            opacity: 0.9,
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

        {/* 9. CTA button */}
        {renderCta()}
      </div>
    </div>
  );
}
