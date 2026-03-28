"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { SitEvent } from "@/components/EventList";

gsap.registerPlugin(ScrollTrigger);

// ─── Layout config: organic, non-uniform spacing ──────────
const ROW_GAPS = [0, 20, 36, 12, 44, 20, 28, 16];
const H_OFFSETS = [0, 32, 12, 56, 8, 44, 24, 0];
const BLOCK_MAX_W = [440, 400, 460, 380, 450, 410, 430, 420];

// CSS var → hex for SVG
const CSS_TO_HEX: Record<string, string> = {
  "var(--color-accent-gold)": "#F59E0B",
  "var(--color-accent-blue)": "#3B82F6",
  "var(--color-accent-red)": "#EF4444",
  "var(--color-accent-green)": "#22C55E",
};

// ─── Catmull-Rom → Cubic Bezier smooth path ───────────────
function buildSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return "";
  const TENSION = 3.5;
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(i + 2, points.length - 1)];
    const cp1x = p1.x + (p2.x - p0.x) / TENSION;
    const cp1y = p1.y + (p2.y - p0.y) / TENSION;
    const cp2x = p2.x - (p3.x - p1.x) / TENSION;
    const cp2y = p2.y - (p3.y - p1.y) / TENSION;
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

// ─── Timeline Node ────────────────────────────────────────
function TimelineNode({
  event,
  isActive,
}: {
  event: SitEvent;
  isActive: boolean;
}) {
  const size = isActive ? 18 : 12;
  const hex = CSS_TO_HEX[event.color] || "#F59E0B";

  return (
    <div
      data-timeline-node
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 40,
        height: 40,
        flexShrink: 0,
      }}
    >
      {isActive && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: `1.5px solid ${event.color}`,
            opacity: 0.35,
            animation: "statusPulse 2s ease-in-out infinite",
          }}
        />
      )}
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background:
            event.status === "completed" ? event.color : "var(--color-bg)",
          border: `2px solid ${event.color}`,
          boxShadow: `0 0 ${isActive ? 20 : 6}px ${hex}80`,
          transition: "all 300ms ease",
          zIndex: 3,
          ...(event.status === "upcoming"
            ? { animation: "statusPulse 1.5s ease-in-out infinite" }
            : {}),
          ...(event.status === "coming_soon"
            ? { borderStyle: "dashed", opacity: 0.5 }
            : {}),
        }}
      />
    </div>
  );
}

// ─── Timeline Block (COMPACT — no expand/collapse) ────────
function TimelineBlock({
  event,
  isLeft,
  isActive,
  maxWidth,
  hOffset,
  onActivate,
}: {
  event: SitEvent;
  isLeft: boolean;
  isActive: boolean;
  maxWidth: number;
  hOffset: number;
  onActivate: () => void;
}) {
  const [isGlitching, setIsGlitching] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const glitchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (glitchTimer.current) clearTimeout(glitchTimer.current);
    },
    [],
  );

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    setIsGlitching(true);
    glitchTimer.current = setTimeout(() => setIsGlitching(false), 80);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const hex = CSS_TO_HEX[event.color] || "#F59E0B";

  return (
    <div
      data-timeline-block
      role="button"
      tabIndex={0}
      onClick={onActivate}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onActivate();
        }
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        position: "relative",
        maxWidth,
        width: "100%",
        padding: "20px 24px",
        background: isActive
          ? "var(--color-surface)"
          : isHovered
            ? "var(--color-surface-hover)"
            : "rgba(17,17,19,0.5)",
        border: `1px solid ${
          isActive
            ? hex + "50"
            : isHovered
              ? hex + "30"
              : "rgba(255,255,255,0.06)"
        }`,
        cursor: "pointer",
        transition: "all 250ms ease, transform 80ms ease",
        transform: isGlitching
          ? `translate(${isLeft ? 4 : -4}px, -3px) scale(1.01)`
          : isHovered
            ? "translateY(-4px) scale(1.01)"
            : "none",
        boxShadow: isActive
          ? `0 0 40px ${hex}15, 0 4px 30px rgba(0,0,0,0.3)`
          : isHovered
            ? `0 8px 30px rgba(0,0,0,0.4), 0 0 20px ${hex}12`
            : "none",
        ...(isLeft
          ? { marginLeft: `${hOffset}px` }
          : { marginLeft: "auto", marginRight: `${hOffset}px` }),
      }}
    >
      {/* Glitch flash */}
      {isGlitching && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(90deg, ${hex}10, transparent, #3B82F610)`,
            pointerEvents: "none",
            animation: "glitchFlicker 80ms steps(2) forwards",
          }}
        />
      )}

      {/* Active scanline */}
      {isActive && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "1px",
            background: `linear-gradient(90deg, transparent, ${hex}30, transparent)`,
            animation: "ambientScan 6s linear infinite",
            pointerEvents: "none",
          }}
        />
      )}

      {/* ── Header: date + status ── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
          <span
            style={{
              fontFamily: "'Big Shoulders Display', sans-serif",
              fontWeight: 800,
              fontSize: "36px",
              lineHeight: 0.9,
              color: event.color,
            }}
          >
            {event.day}
          </span>
          <span
            className="font-mono"
            style={{
              fontSize: "10px",
              color: "var(--color-text-muted)",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            {event.month} {event.year}
          </span>
        </div>

        <span
          className="font-mono"
          style={{
            fontSize: "9px",
            padding: "3px 8px",
            color: event.color,
            border: `1px solid color-mix(in srgb, ${event.color} 25%, transparent)`,
            background: `color-mix(in srgb, ${event.color} 8%, transparent)`,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            lineHeight: 1.4,
          }}
        >
          {event.status === "completed"
            ? "\u2713 DONE"
            : event.status === "upcoming"
              ? "\u25CF NEXT"
              : "\u25CB TBA"}
        </span>
      </div>

      {/* ── Title ── */}
      <h3
        className="font-mono"
        style={{
          fontSize: "15px",
          fontWeight: 700,
          textTransform: "uppercase",
          color: isActive ? "var(--color-text)" : "rgba(250,250,250,0.85)",
          lineHeight: 1.3,
          letterSpacing: "0.02em",
          marginBottom: "8px",
        }}
      >
        {event.title}
      </h3>

      {/* ── Tags + location (always compact) ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
          {event.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="font-mono"
              style={{
                fontSize: "9px",
                color: `color-mix(in srgb, ${event.color} 80%, white)`,
                border: `1px solid color-mix(in srgb, ${event.color} 15%, transparent)`,
                background: `color-mix(in srgb, ${event.color} 5%, transparent)`,
                padding: "2px 7px",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        <div
          className="font-mono"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "10px",
            color: "var(--color-text-muted)",
            opacity: 0.7,
          }}
        >
          <span
            style={{
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: event.color,
              flexShrink: 0,
            }}
          />
          <span>{event.time}</span>
        </div>
      </div>

      {/* Active indicator bar */}
      {isActive && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: "20%",
            right: "20%",
            height: "2px",
            background: `linear-gradient(90deg, transparent, ${event.color}, transparent)`,
            opacity: 0.6,
          }}
        />
      )}
    </div>
  );
}

// ─── Main Timeline ────────────────────────────────────────
interface EventTimelineProps {
  events: SitEvent[];
  activeId: string;
  onSelect: (id: string) => void;
}

export default function EventTimeline({
  events,
  activeId,
  onSelect,
}: EventTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pathData, setPathData] = useState("");
  const [svgSize, setSvgSize] = useState({ width: 0, height: 0 });
  const [nodePositions, setNodePositions] = useState<
    { x: number; y: number }[]
  >([]);
  const [isMobile, setIsMobile] = useState(false);

  // Mobile detection
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ── Measure nodes → build SVG path (NO activeId dependency) ──
  useEffect(() => {
    const updatePath = () => {
      if (!containerRef.current) return;
      const nodes =
        containerRef.current.querySelectorAll("[data-timeline-node]");
      if (nodes.length < 2) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      setSvgSize({
        width: containerRect.width,
        height: containerRect.height,
      });

      const pts: { x: number; y: number }[] = [];
      nodes.forEach((node) => {
        const rect = node.getBoundingClientRect();
        pts.push({
          x: rect.left + rect.width / 2 - containerRect.left,
          y: rect.top + rect.height / 2 - containerRect.top,
        });
      });

      setNodePositions(pts);
      const extended = [...pts];
      if (pts.length >= 2) {
        extended.unshift({ x: pts[0].x, y: pts[0].y - 80 });
        extended.push({
          x: pts[pts.length - 1].x,
          y: pts[pts.length - 1].y + 80,
        });
      }
      setPathData(buildSmoothPath(extended));
    };

    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(updatePath);
    });

    const ro = new ResizeObserver(() => {
      requestAnimationFrame(updatePath);
    });
    if (containerRef.current) ro.observe(containerRef.current);

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      ro.disconnect();
    };
  }, [events, isMobile]); // NO activeId — blocks don't change height

  // ── GSAP scroll entrance ──
  useEffect(() => {
    const ctx = gsap.context(() => {
      const blocks =
        containerRef.current?.querySelectorAll("[data-timeline-block]");
      if (blocks?.length) {
        gsap.fromTo(
          Array.from(blocks),
          { autoAlpha: 0, y: 40, scale: 0.96 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            stagger: 0.12,
            ease: "power2.out",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          },
        );
      }

      const corePath = containerRef.current?.querySelector(
        "[data-energy-core]",
      ) as SVGPathElement | null;
      if (corePath) {
        const length = corePath.getTotalLength?.() || 3000;
        gsap.fromTo(
          corePath,
          { strokeDashoffset: length },
          {
            strokeDashoffset: 0,
            duration: 2,
            ease: "power1.inOut",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          },
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [isMobile, pathData]);

  // ── SVG layers ──
  const renderSvg = () => {
    if (!pathData || svgSize.width === 0) return null;
    const stops = events.map((e, i) => ({
      offset: `${(i / Math.max(events.length - 1, 1)) * 100}%`,
      color: CSS_TO_HEX[e.color] || "#F59E0B",
    }));

    return (
      <svg
        className="absolute top-0 left-0 pointer-events-none"
        width={svgSize.width}
        height={svgSize.height}
        style={{
          zIndex: 1,
          maskImage:
            "linear-gradient(to bottom, transparent 0%, black 4%, black 96%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 4%, black 96%, transparent 100%)",
        }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id="tlEnergyGrad"
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            {stops.map((s, i) => (
              <stop key={i} offset={s.offset} stopColor={s.color} />
            ))}
          </linearGradient>
        </defs>

        <path
          d={pathData}
          fill="none"
          stroke="url(#tlEnergyGrad)"
          strokeWidth="32"
          opacity="0.06"
          style={{ filter: "blur(20px)" }}
        />
        <path
          d={pathData}
          fill="none"
          stroke="url(#tlEnergyGrad)"
          strokeWidth="10"
          opacity="0.18"
          style={{ filter: "blur(6px)" }}
        />
        <path
          data-energy-core
          d={pathData}
          fill="none"
          stroke="url(#tlEnergyGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="energy-core"
          style={{ strokeDasharray: "18 12", animationDuration: "20s" }}
        />
        <path
          d={pathData}
          fill="none"
          stroke="url(#tlEnergyGrad)"
          strokeWidth="1"
          opacity="0.7"
        />

        {nodePositions.map((pos, i) => {
          const isLeft = isMobile ? false : i % 2 === 0;
          const branchLen = isMobile ? 24 : 60;
          const branchX = isLeft ? pos.x - branchLen : pos.x + branchLen;
          const hex = CSS_TO_HEX[events[i]?.color] || "#F59E0B";
          return (
            <line
              key={`branch-${i}`}
              x1={pos.x}
              y1={pos.y}
              x2={branchX}
              y2={pos.y}
              stroke={hex}
              strokeWidth="1.5"
              opacity="0.4"
            />
          );
        })}

        {nodePositions.map((pos, i) => {
          const hex = CSS_TO_HEX[events[i]?.color] || "#F59E0B";
          const isActiveNode = events[i]?.id === activeId;
          return (
            <circle
              key={`glow-${i}`}
              cx={pos.x}
              cy={pos.y}
              r={isActiveNode ? 22 : 12}
              fill={hex}
              opacity={isActiveNode ? 0.15 : 0.06}
              style={{ filter: "blur(10px)" }}
            />
          );
        })}
      </svg>
    );
  };

  // ═══════════ MOBILE ═══════════
  if (isMobile) {
    return (
      <div ref={containerRef} className="relative">
        {renderSvg()}
        {events.map((event, i) => (
          <div
            key={event.id}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              paddingLeft: "8px",
              marginTop: i === 0 ? 0 : `${(ROW_GAPS[i] || 48) * 0.5}px`,
              position: "relative",
              zIndex: 2,
            }}
          >
            <div style={{ paddingTop: "20px", flexShrink: 0 }}>
              <TimelineNode
                event={event}
                isActive={event.id === activeId}
              />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <TimelineBlock
                event={event}
                isLeft={false}
                isActive={event.id === activeId}
                maxWidth={9999}
                hOffset={0}
                onActivate={() => onSelect(event.id)}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ═══════════ DESKTOP ═══════════
  return (
    <div ref={containerRef} className="relative">
      {renderSvg()}
      {events.map((event, i) => {
        const isLeft = i % 2 === 0;
        const isActive = event.id === activeId;
        return (
          <div
            key={event.id}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 80px 1fr",
              alignItems: "center",
              marginTop: i === 0 ? 0 : `${ROW_GAPS[i] || 48}px`,
              position: "relative",
              zIndex: 2,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                paddingRight: "20px",
              }}
            >
              {isLeft ? (
                <TimelineBlock
                  event={event}
                  isLeft
                  isActive={isActive}
                  maxWidth={BLOCK_MAX_W[i]}
                  hOffset={H_OFFSETS[i]}
                  onActivate={() => onSelect(event.id)}
                />
              ) : null}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: isLeft ? "flex-end" : "flex-start",
                position: "relative",
              }}
            >
              <TimelineNode event={event} isActive={isActive} />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
                paddingLeft: "20px",
              }}
            >
              {!isLeft ? (
                <TimelineBlock
                  event={event}
                  isLeft={false}
                  isActive={isActive}
                  maxWidth={BLOCK_MAX_W[i]}
                  hOffset={H_OFFSETS[i]}
                  onActivate={() => onSelect(event.id)}
                />
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
