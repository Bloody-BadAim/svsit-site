"use client";

import { Fragment, useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SectionLabel from "@/components/SectionLabel";
import { BorderTrail } from "@/components/ui/BorderTrail";

/* ═══════════════════════════════════════════════════════════
   Types & Constants
   ═══════════════════════════════════════════════════════════ */

type EventStatus = "DONE" | "NEXT" | "TBA";

interface SitEvent {
  id: string;
  file: string;
  title: string;
  date: Date;
  endDate?: Date;
  location: string;
  time: string;
  description: string;
  status: EventStatus;
  tags: string[];
}

const BRAND = {
  gold: "#F59E0B",
  blue: "#3B82F6",
  red: "#EF4444",
  green: "#22C55E",
} as const;

const EVENT_HEX: Record<string, string> = {
  "alv-xi": BRAND.gold,
  "meet-oc": BRAND.blue,
  "get-together": BRAND.green,
  kroegentocht: BRAND.gold,
  stagemarkt: BRAND.blue,
  hackathon: BRAND.red,
  techborrel: BRAND.green,
  cern: BRAND.gold,
};

function eHex(id: string) {
  return EVENT_HEX[id] || BRAND.gold;
}

const MONTHS = [
  "JAN",
  "FEB",
  "MRT",
  "APR",
  "MEI",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OKT",
  "NOV",
  "DEC",
];
const fDay = (d: Date) => d.getDate().toString().padStart(2, "0");
const fMonth = (d: Date) => MONTHS[d.getMonth()];
const fYear = (d: Date) => d.getFullYear().toString();

/* ═══════════════════════════════════════════════════════════
   Event Data (hardcoded — later Notion API)
   ═══════════════════════════════════════════════════════════ */

const events: SitEvent[] = [
  {
    id: "alv-xi",
    file: "alv.ts",
    title: "ALV Bestuur XI",
    date: new Date("2026-03-20T16:00:00"),
    location: "WBH 5e verdieping",
    time: "16:00",
    description: "Algemene Ledenvergadering, installatie Bestuur XI.",
    status: "DONE",
    tags: ["BESTUUR"],
  },
  {
    id: "meet-oc",
    file: "meetdeoc.ts",
    title: "Meet de OC",
    date: new Date("2026-03-24T16:00:00"),
    location: "WBH 5e verdieping",
    time: "16:00",
    description:
      "Ontmoet de Opleidingscommissie en praat mee over de opleiding.",
    status: "DONE",
    tags: ["EDUCATIE"],
  },
  {
    id: "get-together",
    file: "gettogether.ts",
    title: "Get Together",
    date: new Date("2026-03-27T17:00:00"),
    location: "Common Room, dan Fest",
    time: "17:00",
    description: "De eerste borrel van het nieuwe bestuur.",
    status: "DONE",
    tags: ["SOCIAL"],
  },
  {
    id: "kroegentocht",
    file: "kroegentocht.ts",
    title: "Kroegentocht",
    date: new Date("2026-04-16T20:00:00"),
    location: "Amsterdam Centrum",
    time: "20:00",
    description:
      "Een avond door de beste kroegen van Amsterdam met je medestudenten.",
    status: "NEXT",
    tags: ["SVO", "SOCIAL", "NACHTLEVEN"],
  },
  {
    id: "stagemarkt",
    file: "stagemarkt.ts",
    title: "Stagemarkt HBO-ICT",
    date: new Date("2026-04-17T13:30:00"),
    endDate: new Date("2026-04-17T15:30:00"),
    location: "Kohnstammhuis",
    time: "13:30",
    description: "Ontmoet bedrijven en vind je stageplek.",
    status: "NEXT",
    tags: ["CARRIERE"],
  },
  {
    id: "hackathon",
    file: "hackathon.ts",
    title: "Connectie Code Hackathon",
    date: new Date("2026-05-10T09:00:00"),
    location: "AI House Amsterdam",
    time: "09:00",
    description: "Hackathon met mentoren uit het bedrijfsleven.",
    status: "NEXT",
    tags: ["TECH", "AI"],
  },
  {
    id: "techborrel",
    file: "techborrel.ts",
    title: "Tech + Borrel",
    date: new Date("2026-05-15T16:00:00"),
    location: "met de opleiding",
    time: "TBA",
    description:
      "Tech talks gecombineerd met een borrel, samen met de opleiding.",
    status: "TBA",
    tags: ["TECH", "SOCIAL"],
  },
  {
    id: "cern",
    file: "cern.ts",
    title: "CERN Lezing",
    date: new Date("2026-06-05T16:00:00"),
    location: "HvA Amstelcampus",
    time: "TBA",
    description:
      "Lezing over onderzoek bij CERN, met technische en HR sprekers.",
    status: "TBA",
    tags: ["TECH", "EDUCATIE"],
  },
];

const DEFAULT_ID =
  events.find((e) => e.status === "NEXT")?.id ?? events[0].id;

/* ═══════════════════════════════════════════════════════════
   ICS Calendar Generation (client-side, 0 deps)
   ═══════════════════════════════════════════════════════════ */

const p2 = (n: number) => n.toString().padStart(2, "0");
const icsTs = (d: Date) =>
  `${d.getFullYear()}${p2(d.getMonth() + 1)}${p2(d.getDate())}T${p2(d.getHours())}${p2(d.getMinutes())}00`;

function dlBlob(content: string, name: string) {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function dlSingle(e: SitEvent) {
  const end = e.endDate || new Date(e.date.getTime() + 7200000);
  dlBlob(
    [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//SIT Studievereniging ICT//NL",
      "BEGIN:VEVENT",
      `DTSTART:${icsTs(e.date)}`,
      `DTEND:${icsTs(end)}`,
      `SUMMARY:${e.title}`,
      `LOCATION:${e.location}`,
      `DESCRIPTION:${e.description}`,
      `UID:${e.id}@svsit.nl`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n"),
    `SIT_${e.title.replace(/\s+/g, "_")}.ics`,
  );
}

function dlAll() {
  const items = events
    .filter((e) => e.status !== "DONE")
    .map((e) => {
      const end = e.endDate || new Date(e.date.getTime() + 7200000);
      return [
        "BEGIN:VEVENT",
        `DTSTART:${icsTs(e.date)}`,
        `DTEND:${icsTs(end)}`,
        `SUMMARY:${e.title}`,
        `LOCATION:${e.location}`,
        `DESCRIPTION:${e.description}`,
        `UID:${e.id}@svsit.nl`,
        "END:VEVENT",
      ].join("\r\n");
    });
  dlBlob(
    [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//SIT Studievereniging ICT//NL",
      "X-WR-CALNAME:SIT Events",
      ...items,
      "END:VCALENDAR",
    ].join("\r\n"),
    "SIT_Alle_Events.ics",
  );
}

/* ═══════════════════════════════════════════════════════════
   Energy Lines — converging brand-color diagonals
   ═══════════════════════════════════════════════════════════ */

interface EnergyLine {
  pos: React.CSSProperties;
  color: string;
  thickness: string;
  angle: number;
  mobileAngle: number;
  targetOpacity: number;
  glow: string;
}

const ENERGY_LINES: EnergyLine[] = [
  // Primary lines (bright, with glow)
  {
    pos: { top: "5%", left: "-10%" },
    color: BRAND.gold,
    thickness: "2px",
    angle: 32,
    mobileAngle: 2,
    targetOpacity: 0.25,
    glow: `0 0 8px ${BRAND.gold}4D, 0 0 2px ${BRAND.gold}80`,
  },
  {
    pos: { top: "12%", right: "-8%" },
    color: BRAND.blue,
    thickness: "1.5px",
    angle: -28,
    mobileAngle: -1,
    targetOpacity: 0.2,
    glow: `0 0 8px ${BRAND.blue}4D, 0 0 2px ${BRAND.blue}80`,
  },
  {
    pos: { bottom: "22%", left: "-3%" },
    color: BRAND.red,
    thickness: "1.5px",
    angle: -18,
    mobileAngle: 1,
    targetOpacity: 0.2,
    glow: `0 0 6px ${BRAND.red}40, 0 0 2px ${BRAND.red}66`,
  },
  {
    pos: { bottom: "8%", right: "-5%" },
    color: BRAND.green,
    thickness: "1px",
    angle: 42,
    mobileAngle: -2,
    targetOpacity: 0.15,
    glow: `0 0 6px ${BRAND.green}40, 0 0 2px ${BRAND.green}66`,
  },
  // Secondary lines (dim, for depth)
  {
    pos: { top: "48%", left: "-10%" },
    color: `${BRAND.gold}66`,
    thickness: "1px",
    angle: 12,
    mobileAngle: 0,
    targetOpacity: 0.12,
    glow: "none",
  },
  {
    pos: { top: "60%", right: "-8%" },
    color: `${BRAND.blue}4D`,
    thickness: "1px",
    angle: -52,
    mobileAngle: 0,
    targetOpacity: 0.1,
    glow: "none",
  },
];

/* ═══════════════════════════════════════════════════════════
   Per-card energy connector config
   ═══════════════════════════════════════════════════════════ */

const CONNECTOR_ANGLES = [-25, 20, -15, 30, -35, 15, -20, 25];
const CONNECTOR_WIDTHS = [40, 35, 45, 30, 38, 42, 36, 44];

/* ═══════════════════════════════════════════════════════════
   Terminal Event Card
   ═══════════════════════════════════════════════════════════ */

function EventCard({
  event,
  isActive,
  onSelect,
  onHover,
}: {
  event: SitEvent;
  isActive: boolean;
  onSelect: () => void;
  onHover?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);
  const glitchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const c = eHex(event.id);
  const isNext = event.status === "NEXT";
  const isDone = event.status === "DONE";

  useEffect(
    () => () => {
      if (glitchTimer.current) clearTimeout(glitchTimer.current);
    },
    [],
  );

  const handleMouseEnter = useCallback(() => {
    setHovered(true);
    setIsGlitching(true);
    glitchTimer.current = setTimeout(() => setIsGlitching(false), 80);
    onHover?.();
  }, [onHover]);

  const border = isActive
    ? `${c}50`
    : hovered
      ? `${c}30`
      : isNext
        ? `${BRAND.gold}66`
        : "rgba(255,255,255,0.06)";

  const shadow = isActive
    ? `0 0 30px ${c}15, 0 4px 20px rgba(0,0,0,0.3)`
    : isNext && !hovered
      ? `0 0 20px ${BRAND.gold}14`
      : hovered
        ? `0 4px 20px rgba(0,0,0,0.3), 0 0 12px ${c}10`
        : "none";

  return (
    <button
      onClick={onSelect}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setHovered(false)}
      className="event-card group text-left w-full overflow-hidden cursor-pointer"
      style={{
        background: isActive
          ? "var(--color-surface)"
          : hovered
            ? "var(--color-surface-hover)"
            : "rgba(17,17,19,0.6)",
        border: `1px solid ${border}`,
        boxShadow: shadow,
        opacity: isDone && !isActive ? 0.65 : 1,
        transform: isGlitching
          ? "translate(2px, -1px) scale(1.005)"
          : hovered && !isActive
            ? "translateY(-2px)"
            : "none",
        transition: "all 200ms ease, transform 80ms ease",
      }}
      aria-pressed={isActive}
      aria-label={`${event.title}, ${fDay(event.date)} ${fMonth(event.date)} ${fYear(event.date)}, ${event.status}`}
    >
      {/* BorderTrail on active card */}
      {isActive && (
        <BorderTrail
          className="bg-[var(--color-accent-gold)]"
          size={40}
          transition={{ duration: 4, ease: "linear" }}
          style={{ opacity: 0.6 }}
        />
      )}

      {/* Glitch flash on hover */}
      {isGlitching && (
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: `linear-gradient(90deg, ${c}12, transparent, ${c}0A)`,
            animation: "glitchFlicker 80ms steps(2) forwards",
          }}
        />
      )}

      {/* Energy accent — top edge glow (brighter when active) */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-[2px] pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent, ${c}${isActive ? "80" : hovered ? "50" : "20"}, ${c}${isActive ? "CC" : hovered ? "60" : "25"}, ${c}${isActive ? "80" : hovered ? "50" : "20"}, transparent)`,
          boxShadow: isActive ? `0 0 8px ${c}40` : "none",
          transition: "all 300ms ease",
        }}
      />

      {/* Terminal chrome */}
      <div
        className="flex items-center gap-1.5 border-b"
        style={{
          padding: "8px 14px",
          borderColor: isActive ? `${c}20` : "rgba(255,255,255,0.04)",
        }}
      >
        <span
          className="w-[9px] h-[9px] rounded-full"
          style={{ background: BRAND.red, opacity: 0.6 }}
        />
        <span
          className="w-[9px] h-[9px] rounded-full"
          style={{ background: BRAND.gold, opacity: 0.6 }}
        />
        <span
          className="w-[9px] h-[9px] rounded-full"
          style={{ background: BRAND.green, opacity: 0.6 }}
        />
        <span
          className="font-mono text-[10px] text-[var(--color-text-muted)] ml-2 truncate"
          style={{ opacity: 0.55 }}
        >
          {event.file}
        </span>
        <span
          className="font-mono text-[9px] tracking-[0.12em] uppercase ml-auto shrink-0"
          style={{
            padding: "2px 8px",
            color: c,
            background: `${c}0D`,
            border: `1px solid ${c}1A`,
          }}
        >
          {event.status === "DONE"
            ? "\u2713 DONE"
            : event.status === "NEXT"
              ? "\u25CF NEXT"
              : "\u25CB TBA"}
        </span>
      </div>

      {/* Card body */}
      <div style={{ padding: "16px 20px 20px" }}>
        <div className="flex items-baseline gap-2" style={{ marginBottom: 6 }}>
          <span
            className="font-display text-[26px] font-extrabold leading-none"
            style={{ color: c }}
          >
            {fDay(event.date)}
          </span>
          <span
            className="font-mono text-[10px] text-[var(--color-text-muted)] uppercase tracking-[0.15em]"
            style={{ opacity: 0.55 }}
          >
            {fMonth(event.date)} {fYear(event.date)}
          </span>
        </div>

        <h3
          className="font-display text-[15px] font-bold uppercase leading-tight"
          style={{
            color: isActive ? "var(--color-text)" : "rgba(250,250,250,0.85)",
            transition: "color 200ms",
            marginBottom: 8,
          }}
        >
          {event.title}
        </h3>

        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-1.5 flex-wrap">
            {event.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="font-mono text-[9px] uppercase tracking-wider"
                style={{
                  padding: "1px 6px",
                  color: `${c}CC`,
                  border: `1px solid ${c}15`,
                  background: `${c}08`,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
          <span
            className="font-mono text-[10px] text-[var(--color-text-muted)] shrink-0"
            style={{ opacity: 0.45 }}
          >
            {event.time}
          </span>
        </div>
      </div>
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════
   Detail Panel (glitch transitions + 3D tilt)
   ═══════════════════════════════════════════════════════════ */

type Phase = "idle" | "glitchOut" | "black" | "scanIn";

function DetailPanel({
  event,
  transitionKey,
}: {
  event: SitEvent;
  transitionKey: string;
}) {
  const [shown, setShown] = useState(event);
  const [phase, setPhase] = useState<Phase>("idle");
  const panelRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const c = eHex(shown.id);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  // Transition state machine: glitchOut → black → scanIn → idle
  useEffect(() => {
    if (phase === "idle" && shown === event) return;
    clearTimers();
    setPhase("glitchOut");

    const t1 = setTimeout(() => {
      setPhase("black");
      setShown(event);
      const t2 = setTimeout(() => {
        setPhase("scanIn");
        const t3 = setTimeout(() => setPhase("idle"), 300);
        timers.current.push(t3);
      }, 50);
      timers.current.push(t2);
    }, 150);
    timers.current.push(t1);

    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transitionKey]);

  useEffect(() => {
    setShown(event);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => clearTimers, [clearTimers]);

  // 3D tilt on hover
  const onMove = useCallback((e: React.MouseEvent) => {
    if (!panelRef.current) return;
    const r = panelRef.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    panelRef.current.style.transform = `perspective(800px) rotateX(${y * -4}deg) rotateY(${x * 4}deg)`;
  }, []);

  const onLeave = useCallback(() => {
    if (panelRef.current)
      panelRef.current.style.transform =
        "perspective(800px) rotateX(0) rotateY(0)";
  }, []);

  const phaseStyle = (): React.CSSProperties => {
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

  return (
    <div
      ref={panelRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="relative overflow-hidden"
      style={{
        background: "var(--color-surface)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderLeft: `2px solid ${c}40`,
        transition: "transform 0.15s ease-out",
        willChange: "transform",
        pointerEvents: phase !== "idle" ? "none" : "auto",
        ...phaseStyle(),
      }}
    >
      {/* Ambient scanline */}
      <div
        aria-hidden="true"
        className="absolute top-0 inset-x-0 h-px pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent, ${c}15, transparent)`,
          animation: "ambientScan 8s linear infinite",
          zIndex: 5,
        }}
      />

      {/* Left glow accent */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 w-1 h-full pointer-events-none"
        style={{
          background: `linear-gradient(to bottom, ${c}40, ${c}10, ${c}40)`,
          boxShadow: `0 0 12px ${c}30`,
        }}
      />

      {/* Console header */}
      <div
        className="border-b border-white/5"
        style={{ padding: "12px 20px" }}
      >
        <span className="font-mono text-[11px] text-[var(--color-text-muted)]">
          {">"} event.inspect(
          <span style={{ color: c }}>&quot;{shown.id}&quot;</span>)
        </span>
      </div>

      <div style={{ padding: "24px" }}>
        {/* Big date */}
        <div style={{ marginBottom: 20 }}>
          <span
            className="font-display font-extrabold leading-none block"
            style={{ fontSize: "clamp(60px, 7vw, 76px)", color: c }}
          >
            {fDay(shown.date)}
          </span>
          <span
            className="font-mono text-xs text-[var(--color-text-muted)] tracking-[0.15em] uppercase block"
            style={{ opacity: 0.75, marginTop: 4 }}
          >
            {fMonth(shown.date)} {fYear(shown.date)}
          </span>
        </div>

        {/* Title */}
        <h2
          className="font-display font-bold uppercase leading-tight"
          style={{
            fontSize: "clamp(20px, 2.5vw, 26px)",
            marginBottom: 12,
          }}
        >
          {shown.title}
        </h2>

        {/* Accent line */}
        <div style={{ width: 48, height: 3, background: c, marginBottom: 20 }} />

        {/* Description */}
        <p
          className="text-sm leading-relaxed text-[var(--color-text-muted)]"
          style={{ maxWidth: "28rem", marginBottom: 24 }}
        >
          {shown.description}
        </p>

        {/* Tags */}
        {shown.tags.length > 0 && (
          <div
            className="flex flex-wrap"
            style={{ gap: 8, marginBottom: 20 }}
          >
            {shown.tags.map((tag) => (
              <span
                key={tag}
                className="font-mono text-[11px] uppercase tracking-wider"
                style={{
                  padding: "4px 12px",
                  color: c,
                  border: `1px solid ${c}25`,
                  background: `${c}08`,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Location + time */}
        <div
          className="flex items-center font-mono text-xs text-[var(--color-text-muted)]"
          style={{ gap: 12, marginBottom: 28 }}
        >
          <span className="flex items-center" style={{ gap: 8 }}>
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: c }}
            />
            {shown.location}
          </span>
          <span style={{ opacity: 0.3 }}>|</span>
          <span>{shown.time}</span>
        </div>

        {/* CTA row */}
        <div
          className="flex items-center flex-wrap"
          style={{ gap: 16 }}
        >
          {shown.status === "NEXT" && (
            <a
              href="#"
              className="inline-flex items-center font-mono text-[13px] font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer hover:scale-[1.02]"
              style={{
                padding: "12px 28px",
                gap: 8,
                background: c,
                color: "#09090B",
                boxShadow: `0 0 24px ${c}40`,
              }}
            >
              RSVP &rarr;
            </a>
          )}
          {shown.status === "DONE" && (
            <span
              className="inline-flex items-center font-mono text-[13px] font-bold tracking-wider uppercase border border-white/10 cursor-default"
              style={{ padding: "12px 28px", gap: 8, opacity: 0.5 }}
            >
              AFGEROND &#10003;
            </span>
          )}
          {shown.status === "TBA" && (
            <span
              className="inline-flex items-center font-mono text-[13px] tracking-wider uppercase text-[var(--color-text-muted)] border border-white/10 cursor-default"
              style={{ padding: "12px 28px", gap: 8 }}
            >
              COMING SOON{" "}
              <span style={{ animation: "statusPulse 1.5s ease-in-out infinite" }}>
                _
              </span>
            </span>
          )}

          {shown.status !== "TBA" && (
            <button
              onClick={() => dlSingle(shown)}
              className="font-mono text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent-gold)] transition-colors cursor-pointer"
            >
              + Toevoegen aan agenda
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Main Events Section
   ═══════════════════════════════════════════════════════════ */

export default function Events() {
  const [selectedId, setSelectedId] = useState(DEFAULT_ID);
  const [isDesktop, setIsDesktop] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  const selected = events.find((e) => e.id === selectedId) ?? events[0];

  // Responsive breakpoint
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  // GSAP scroll animations
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      // Energy lines fade in + breathing
      const lines = sectionRef.current?.querySelectorAll(".energy-line");
      if (lines?.length) {
        gsap.fromTo(
          Array.from(lines),
          { opacity: 0 },
          {
            opacity: (i: number) => ENERGY_LINES[i]?.targetOpacity ?? 0.15,
            duration: 1.5,
            stagger: 0.15,
            ease: "power2.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 80%",
              toggleActions: "play none none none",
              once: true,
            },
            onComplete: () => {
              // Breathing animation after entrance
              Array.from(lines).forEach((line, i) => {
                const target = ENERGY_LINES[i]?.targetOpacity ?? 0.15;
                gsap.to(line, {
                  opacity: target * 1.3,
                  duration: 4 + i * 0.5,
                  ease: "sine.inOut",
                  yoyo: true,
                  repeat: -1,
                });
              });
            },
          },
        );
      }

      // Cards stagger entrance
      const cards = sectionRef.current?.querySelectorAll(".event-card");
      if (cards?.length) {
        gsap.fromTo(
          Array.from(cards),
          { autoAlpha: 0, y: 20 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 70%",
              toggleActions: "play none none none",
              once: true,
            },
          },
        );
      }

      // Detail panel entrance (desktop only)
      if (detailRef.current) {
        gsap.fromTo(
          detailRef.current,
          { autoAlpha: 0, x: 30 },
          {
            autoAlpha: 1,
            x: 0,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: {
              trigger: detailRef.current,
              start: "top 85%",
              toggleActions: "play none none none",
              once: true,
            },
          },
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [isDesktop]);

  return (
    <section
      ref={sectionRef}
      id="events"
      className="relative min-h-[70vh] py-24 md:py-32 lg:py-40 px-6 md:px-12 lg:px-24"
    >
      {/* Background overlay */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(9, 9, 11, 0.7)" }}
      />

      {/* ── Energy Lines (converging diagonals) ── */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        {ENERGY_LINES.map((l, i) => (
          <div
            key={i}
            className="energy-line absolute"
            style={{
              ...l.pos,
              width: "110%",
              height: l.thickness,
              background: `linear-gradient(90deg, transparent 5%, ${l.color} 35%, ${l.color} 65%, transparent 95%)`,
              transform: `rotate(${isDesktop ? l.angle : l.mobileAngle}deg)`,
              transformOrigin: "center",
              boxShadow: l.glow,
              opacity: 0,
            }}
          />
        ))}
      </div>

      {/* ── Content ── */}
      <div className="relative z-10">
        <div className="max-w-[1400px] mx-auto">
          <SectionLabel number="03" label="events" />
          <span className="absolute top-0 left-6 md:left-12 lg:left-24 right-6 md:right-12 lg:right-24 h-px bg-gradient-to-r from-[var(--color-accent-gold)] via-[var(--color-accent-gold)] to-transparent origin-left z-10" />

          {/* Section header */}
          <div className="mb-12 md:mb-16">
            <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold uppercase tracking-tight leading-[1.1]">
              Season<br />
              <span className="text-[var(--color-accent-gold)]">2025—2026</span>
            </h2>
            <div className="flex items-center gap-3 mt-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-gold)]" />
              <p className="font-mono text-sm text-[var(--color-text-muted)]">
                Van borrels tot hackathons. Kies je quest.
              </p>
            </div>
          </div>

          {isDesktop ? (
            /* ═══ DESKTOP: 2-col card grid + sticky detail sidebar ═══ */
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 400px",
                gap: "2.5rem",
                alignItems: "start",
              }}
            >
              <div className="grid grid-cols-2" style={{ gap: 16 }}>
                {events.map((event, i) => {
                  const c = eHex(event.id);
                  const isLeft = i % 2 === 0;
                  const connAngle = CONNECTOR_ANGLES[i] ?? 0;
                  const connWidth = CONNECTOR_WIDTHS[i] ?? 36;
                  const isCardActive = event.id === selectedId;

                  return (
                    <div key={event.id} className="relative">
                      {/* Per-card energy connector line */}
                      <div
                        aria-hidden="true"
                        className="absolute pointer-events-none"
                        style={{
                          top: "35%",
                          ...(isLeft
                            ? { right: "100%", transformOrigin: "right center" }
                            : { left: "100%", transformOrigin: "left center" }),
                          width: connWidth,
                          height: "1.5px",
                          background: `linear-gradient(${isLeft ? "to left" : "to right"}, ${c}${isCardActive ? "60" : "30"}, transparent)`,
                          transform: `rotate(${connAngle}deg)`,
                          boxShadow: isCardActive ? `0 0 6px ${c}30` : "none",
                          opacity: isCardActive ? 1 : 0.6,
                          transition: "opacity 300ms, box-shadow 300ms",
                        }}
                      />
                      <EventCard
                        event={event}
                        isActive={isCardActive}
                        onSelect={() => setSelectedId(event.id)}
                        onHover={() => setSelectedId(event.id)}
                      />
                    </div>
                  );
                })}
              </div>

              <div
                ref={detailRef}
                style={{ position: "sticky", top: "5rem", alignSelf: "start" }}
              >
                <DetailPanel event={selected} transitionKey={selectedId} />
              </div>
            </div>
          ) : (
            /* ═══ MOBILE: single column, detail under selected card ═══ */
            <div className="flex flex-col" style={{ gap: 12 }}>
              {events.map((event) => (
                <Fragment key={event.id}>
                  <EventCard
                    event={event}
                    isActive={event.id === selectedId}
                    onSelect={() => setSelectedId(event.id)}
                  />
                  {selectedId === event.id && (
                    <div style={{ animation: "detailSlideIn 0.3s ease-out" }}>
                      <DetailPanel
                        event={event}
                        transitionKey={selectedId}
                      />
                    </div>
                  )}
                </Fragment>
              ))}
            </div>
          )}

          {/* ── Download All Events ── */}
          <div className="flex justify-center" style={{ marginTop: "3rem" }}>
            <button
              onClick={dlAll}
              className="w-full font-mono text-sm cursor-pointer transition-all duration-200"
              style={{
                maxWidth: "32rem",
                padding: "14px 0",
                border: `1px solid ${BRAND.gold}`,
                color: BRAND.gold,
                background: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = BRAND.gold;
                e.currentTarget.style.color = "#09090B";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = BRAND.gold;
              }}
            >
              $ sit events --add-all-to-calendar
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
