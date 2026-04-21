"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useReducedMotion, AnimatePresence } from "motion/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Calendar, MapPin, Clock, ExternalLink, ChevronDown, Zap, Users, Code, Gamepad2, Briefcase } from "lucide-react";
import SectionLabel from "@/components/SectionLabel";
import { TextScramble } from "@/components/ui/TextScramble";

gsap.registerPlugin(ScrollTrigger);

// ─── Types ────────────────────────────────────────────────────────────────────

type EventStatus = "DONE" | "NEXT" | "TBA";

type EventCategory = "Social" | "Code" | "Game" | "Career";

interface SitEvent {
  id: string;
  title: string;
  date: Date;
  endDate?: Date;
  location: string;
  time?: string;
  description?: string;
  link?: string;
  status: EventStatus;
  type: string;
  category: EventCategory;
  color: string;
}

interface NotionEventResponse {
  id: string;
  name: string;
  date: string;
  dateEnd?: string;
  time?: string;
  location?: string;
  description?: string;
  link?: string;
  status: "done" | "next" | "tba";
  type: string;
  category: EventCategory;
  color: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BRAND = {
  gold: "#F59E0B",
  blue: "#3B82F6",
  red: "#EF4444",
  green: "#22C55E",
} as const;

const MONTHS = [
  "JAN","FEB","MRT","APR","MEI","JUN",
  "JUL","AUG","SEP","OKT","NOV","DEC",
];

const isValidDate = (d: Date) => !isNaN(d.getTime());
const fDay = (d: Date) => isValidDate(d) ? d.getDate() : "?";
const fMonth = (d: Date) => isValidDate(d) ? MONTHS[d.getMonth()] : "TBA";

const CATEGORY_FILTERS: { key: string; label: string; icon: typeof Zap }[] = [
  { key: "all", label: "ALLES", icon: Zap },
  { key: "Social", label: "SOCIAL", icon: Users },
  { key: "Code", label: "CODE", icon: Code },
  { key: "Game", label: "GAME", icon: Gamepad2 },
  { key: "Career", label: "CAREER", icon: Briefcase },
];

const CATEGORY_LABELS: Record<EventCategory, string> = {
  Social: "SOCIAL",
  Code: "CODE",
  Game: "GAME",
  Career: "CAREER",
};

const CATEGORY_COLORS: Record<string, string> = {
  Social: BRAND.gold,
  Code: BRAND.green,
  Game: BRAND.red,
  Career: BRAND.blue,
};

const FALLBACK_EVENTS: SitEvent[] = [
  {
    id: "kroegentocht",
    title: "Kroegentocht (SVO)",
    date: new Date("2026-04-16T20:00:00"),
    location: "Amsterdam Centrum",
    time: "20:00",
    status: "NEXT",
    type: "SVO gezamenlijk",
    category: "Social",
    color: BRAND.gold,
  },
  {
    id: "hackathon",
    title: "Connectie Code Hackathon",
    date: new Date("2026-05-10T09:00:00"),
    location: "AI House Amsterdam",
    time: "09:00",
    status: "NEXT",
    type: "SIT eigen",
    category: "Code",
    color: BRAND.green,
  },
  {
    id: "dnd",
    title: "SIT x MODUS D&D Avond",
    date: new Date("2026-05-15T18:00:00"),
    location: "WBH 5e verdieping",
    time: "18:00",
    status: "TBA",
    type: "Samenwerking",
    category: "Game",
    color: BRAND.red,
  },
  {
    id: "cern",
    title: "CERN Lezing",
    date: new Date("2026-06-05T16:00:00"),
    location: "HvA Amstelcampus",
    status: "TBA",
    type: "Samenwerking",
    category: "Career",
    color: BRAND.blue,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function notionToSitEvent(e: NotionEventResponse): SitEvent {
  const statusMap: Record<NotionEventResponse["status"], EventStatus> = {
    done: "DONE",
    next: "NEXT",
    tba: "TBA",
  };
  return {
    id: e.id,
    title: e.name,
    date: new Date(e.date),
    endDate: e.dateEnd ? new Date(e.dateEnd) : undefined,
    location: e.location || "TBA",
    time: e.time,
    description: e.description,
    link: e.link,
    status: statusMap[e.status] ?? "TBA",
    type: e.type || "SIT eigen",
    category: e.category || "Social",
    color: e.color || BRAND.gold,
  };
}

function ticketLabel(event: SitEvent): { text: string; color: string; clickable: boolean } {
  if (event.status === "DONE") {
    return { text: "AFGEROND", color: "rgba(255,255,255,0.2)", clickable: false };
  }
  if (event.link) {
    return { text: "TICKETS OPEN", color: BRAND.green, clickable: true };
  }
  return { text: "BINNENKORT", color: BRAND.gold, clickable: false };
}

const pad2 = (n: number) => String(n).padStart(2, "0");
const fmtIcal = (d: Date) =>
  `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}` +
  `T${pad2(d.getHours())}${pad2(d.getMinutes())}00`;

function eventEndDate(e: SitEvent): Date {
  return e.endDate ?? new Date(e.date.getTime() + 2 * 60 * 60 * 1000);
}

function downloadIcs(e: SitEvent) {
  const start = fmtIcal(e.date);
  const end = fmtIcal(eventEndDate(e));

  const content = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SIT//svsit.nl//NL",
    "BEGIN:VEVENT",
    `UID:${e.id}@svsit.nl`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${e.title}`,
    `LOCATION:${e.location}`,
    e.description ? `DESCRIPTION:${e.description.replace(/\n/g, "\\n")}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");

  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${e.id}-sit.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

function googleCalendarUrl(e: SitEvent): string {
  const start = fmtIcal(e.date);
  const end = fmtIcal(eventEndDate(e));
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: e.title,
    dates: `${start}/${end}`,
    location: e.location,
    details: e.description ?? `Event van SIT — ${e.title}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function outlookCalendarUrl(e: SitEvent): string {
  const startIso = e.date.toISOString();
  const endIso = eventEndDate(e).toISOString();
  const params = new URLSearchParams({
    subject: e.title,
    startdt: startIso,
    enddt: endIso,
    location: e.location,
    body: e.description ?? `Event van SIT — ${e.title}`,
    path: "/calendar/action/compose",
    rru: "addevent",
  });
  return `https://outlook.live.com/calendar/0/action/compose?${params.toString()}`;
}

// ─── AddToCalendarDropdown ───────────────────────────────────────────────────

function AddToCalendarDropdown({
  event,
  size = "sm",
}: {
  event: SitEvent;
  size?: "sm" | "lg";
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(ev: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(ev.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(ev: KeyboardEvent) {
      if (ev.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  const isLg = size === "lg";

  return (
    <div ref={dropdownRef} className="relative inline-block">
      <button
        onClick={(ev) => {
          ev.stopPropagation();
          setOpen((v) => !v);
        }}
        className={`inline-flex items-center gap-1.5 rounded-md font-mono uppercase tracking-wider text-[var(--color-text-muted)] transition-all duration-200 hover:text-[var(--color-text)] hover:border-[var(--color-text-muted)] ${
          isLg ? "px-4 py-2.5 text-xs" : "px-3 py-1.5 text-[10px]"
        }`}
        style={{ border: "1px solid var(--color-border)" }}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Calendar size={isLg ? 11 : 9} />
        + Agenda
        <ChevronDown
          size={isLg ? 10 : 8}
          className="transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 bottom-full mb-1.5 z-50 min-w-[180px] rounded-lg overflow-hidden"
            style={{
              background: "rgba(9, 9, 11, 0.97)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.6), 0 0 1px rgba(255,255,255,0.1)",
              backdropFilter: "blur(12px)",
            }}
          >
            {/* Google Calendar */}
            <a
              href={googleCalendarUrl(event)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2.5 font-mono text-[11px] tracking-wide text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-white/[0.04] transition-all duration-150"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M3 10h18" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M9 14l2 2 4-4" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Google Calendar
            </a>

            {/* Divider */}
            <div className="h-px mx-2" style={{ background: "rgba(255,255,255,0.06)" }} />

            {/* Outlook */}
            <a
              href={outlookCalendarUrl(event)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2.5 font-mono text-[11px] tracking-wide text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-white/[0.04] transition-all duration-150"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M3 10h18" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <rect x="8" y="13" width="3" height="3" rx="0.5" fill="#3B82F6" />
              </svg>
              Outlook
            </a>

            {/* Divider */}
            <div className="h-px mx-2" style={{ background: "rgba(255,255,255,0.06)" }} />

            {/* Download .ics */}
            <button
              onClick={(ev) => {
                ev.stopPropagation();
                downloadIcs(event);
                setOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 font-mono text-[11px] tracking-wide text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-white/[0.04] transition-all duration-150 text-left"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                <path d="M12 3v12m0 0l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Download .ics
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── DateStub ─────────────────────────────────────────────────────────────────
// Ticket-stub style date display with colored top bar

function DateStub({ event, size = "sm" }: { event: SitEvent; size?: "sm" | "lg" }) {
  const isLg = size === "lg";
  return (
    <div
      className="relative flex-shrink-0 flex flex-col items-center overflow-hidden rounded-md"
      style={{
        width: isLg ? 64 : 48,
        background: `${event.color}0a`,
        border: `1px solid ${event.color}25`,
      }}
    >
      {/* Top color bar */}
      <div
        className="w-full"
        style={{
          height: isLg ? 3 : 2,
          background: event.color,
        }}
      />
      {/* Day */}
      <span
        className="font-display font-bold leading-none"
        style={{
          fontSize: isLg ? 28 : 20,
          color: event.color,
          paddingTop: isLg ? 6 : 4,
        }}
      >
        {fDay(event.date)}
      </span>
      {/* Month */}
      <span
        className="font-mono tracking-[0.15em] uppercase opacity-70 pb-1"
        style={{
          fontSize: isLg ? 10 : 8,
          color: event.color,
        }}
      >
        {fMonth(event.date)}
      </span>
    </div>
  );
}

// ─── FeaturedCard ─────────────────────────────────────────────────────────────

function FeaturedCard({ event, inView }: { event: SitEvent; inView: boolean }) {
  const ticket = ticketLabel(event);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative rounded-xl overflow-hidden mb-3 group/featured"
      style={{
        /* Animated gradient border via padding + background trick */
        background: `
          linear-gradient(var(--color-bg), var(--color-bg)) padding-box,
          conic-gradient(from var(--event-border-angle, 0deg), ${event.color}, ${event.color}40, rgba(255,255,255,0.06), ${event.color}40, ${event.color}) border-box
        `,
        border: "1.5px solid transparent",
        animation: "eventBorderRotate 8s linear infinite",
      }}
    >
      {/* Inner card with glass effect */}
      <div
        className="relative rounded-[10px] overflow-hidden"
        style={{
          background: `linear-gradient(145deg, ${event.color}10 0%, rgba(9,9,11,0.97) 40%, rgba(9,9,11,0.99) 100%)`,
        }}
      >
        {/* Ambient glow behind the card (top-right) */}
        <div
          className="absolute -top-20 -right-20 w-60 h-60 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${event.color}15 0%, transparent 70%)`,
            animation: "eventGlowPulse 4s ease-in-out infinite",
          }}
        />

        {/* Spotlight sweep overlay -- visible on hover */}
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden opacity-0 group-hover/featured:opacity-100 transition-opacity duration-500"
        >
          <div
            className="absolute inset-0 w-[40%]"
            style={{
              background: `linear-gradient(90deg, transparent, ${event.color}08, transparent)`,
              animation: "eventSpotlightSweep 3s ease-in-out infinite",
            }}
          />
        </div>

        {/* Scanline effect (composited via transform) */}
        <div
          className="absolute top-0 left-0 right-0 h-[1px] pointer-events-none opacity-[0.07]"
          style={{
            background: event.color,
            animation: "eventScanline 4s linear infinite",
            boxShadow: `0 0 8px ${event.color}`,
            willChange: "transform",
          }}
        />

        {/* Corner decorations -- SVG bracket shapes */}
        <svg className="absolute top-3 left-3 w-4 h-4 opacity-30" viewBox="0 0 16 16" style={{ color: event.color }}>
          <path d="M0 6V0h6" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <svg className="absolute top-3 right-3 w-4 h-4 opacity-30" viewBox="0 0 16 16" style={{ color: event.color }}>
          <path d="M16 6V0h-6" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <svg className="absolute bottom-3 left-3 w-4 h-4 opacity-30" viewBox="0 0 16 16" style={{ color: event.color }}>
          <path d="M0 10v6h6" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <svg className="absolute bottom-3 right-3 w-4 h-4 opacity-30" viewBox="0 0 16 16" style={{ color: event.color }}>
          <path d="M16 10v6h-6" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>

        <div className="relative p-6 md:p-8 lg:p-10">
          {/* "Volgende event" badge */}
          <div className="flex items-center gap-2.5 mb-5">
            <span className="relative flex items-center justify-center w-2.5 h-2.5">
              {/* Outer ping */}
              <span
                className="absolute inset-0 rounded-full animate-ping"
                style={{ backgroundColor: BRAND.green, opacity: 0.4 }}
              />
              {/* Inner dot */}
              <span
                className="relative w-2 h-2 rounded-full"
                style={{ backgroundColor: BRAND.green }}
              />
            </span>
            <span
              className="font-mono text-[11px] tracking-[0.2em] uppercase font-medium"
              style={{ color: BRAND.green }}
            >
              Volgende event
            </span>
          </div>

          {/* Title + Date row */}
          <div className="flex items-start gap-5 mb-6">
            <DateStub event={event} size="lg" />
            <div className="flex-1 min-w-0">
              {/* Title with TextScramble */}
              <TextScramble
                as="h3"
                className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-[var(--color-text)] mb-3 leading-tight uppercase"
                trigger={inView}
                duration={0.6}
                speed={0.03}
                characterSet="#{}/<>[]!@$%^&*"
              >
                {event.title}
              </TextScramble>

              {/* Meta row */}
              <div className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-sm text-[var(--color-text-muted)]">
                {event.time && (
                  <span className="flex items-center gap-1.5">
                    <Clock size={13} style={{ color: event.color }} />
                    {event.time}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} style={{ color: event.color }} />
                  {event.location}
                </span>
              </div>
            </div>
          </div>

          {/* Category + Type badges */}
          <div className="flex flex-wrap gap-2 mb-5">
            <span
              className="font-mono text-[10px] tracking-widest px-2.5 py-1 rounded uppercase"
              style={{
                color: event.color,
                border: `1px solid ${event.color}40`,
                background: `${event.color}12`,
                boxShadow: `0 0 12px ${event.color}08`,
              }}
            >
              {CATEGORY_LABELS[event.category]}
            </span>
            {event.type && (
              <span
                className="font-mono text-[10px] tracking-widest px-2.5 py-1 rounded uppercase"
                style={{
                  color: "rgba(255,255,255,0.35)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.02)",
                }}
              >
                {event.type}
              </span>
            )}
          </div>

          {/* Description */}
          {event.description && (
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-6 max-w-xl">
              {event.description}
            </p>
          )}

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            {ticket.clickable && event.link ? (
              <a
                href={event.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md font-mono text-xs uppercase tracking-wider font-semibold transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: BRAND.green,
                  color: "#000",
                  boxShadow: `0 0 20px ${BRAND.green}30`,
                }}
              >
                <ExternalLink size={12} />
                {ticket.text}
              </a>
            ) : (
              <span
                className="inline-flex items-center px-5 py-2.5 rounded-md font-mono text-xs uppercase tracking-wider"
                style={{
                  color: ticket.color,
                  border: `1px solid ${ticket.color}60`,
                  background: `${ticket.color}08`,
                }}
              >
                {ticket.text}
              </span>
            )}

            <AddToCalendarDropdown event={event} size="lg" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── CompactItem ──────────────────────────────────────────────────────────────

function CompactItem({ event, index }: { event: SitEvent; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const ticket = ticketLabel(event);
  const isDone = event.status === "DONE";

  return (
    <motion.div
      className="relative event-node group/compact"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: isDone ? 0.4 : 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: "easeOut" }}
    >
      {/* Clickable row */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-4 py-3.5 px-3 -mx-3 text-left rounded-lg transition-all duration-200 hover:bg-white/[0.02]"
        aria-expanded={expanded}
        style={{
          borderLeft: "2px solid transparent",
        }}
        onMouseEnter={(e) => {
          if (!isDone) {
            (e.currentTarget as HTMLElement).style.borderLeftColor = `${event.color}60`;
          }
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.borderLeftColor = "transparent";
        }}
      >
        {/* Date stub */}
        <DateStub event={event} size="sm" />

        {/* Title + location */}
        <div className="flex-1 min-w-0">
          <span className="block font-mono text-sm text-[var(--color-text)] group-hover/compact:text-white transition-colors truncate">
            {event.title}
          </span>
          <span className="block font-mono text-[10px] text-[var(--color-text-muted)] mt-0.5 truncate">
            <MapPin size={9} className="inline mr-1 -mt-px" style={{ color: event.color }} />
            {event.location}
          </span>
        </div>

        {/* Category tag */}
        <span
          className="hidden sm:inline-flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase px-2.5 py-1 rounded flex-shrink-0 transition-all duration-200"
          style={{
            color: event.color,
            border: `1px solid ${event.color}30`,
            background: `${event.color}08`,
          }}
        >
          {CATEGORY_LABELS[event.category]}
        </span>

        {/* Time */}
        {event.time && (
          <span
            className="hidden md:flex items-center gap-1 font-mono text-[10px] text-[var(--color-text-muted)] flex-shrink-0"
          >
            <Clock size={10} style={{ color: event.color, opacity: 0.6 }} />
            {event.time}
          </span>
        )}

        {/* Chevron */}
        <ChevronDown
          size={14}
          className="flex-shrink-0 text-[var(--color-text-muted)] transition-transform duration-200"
          style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {/* Expanded area */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div
              className="ml-[4rem] mb-4 pl-4 py-3 rounded-md"
              style={{
                borderLeft: `2px solid ${event.color}50`,
                background: `linear-gradient(135deg, ${event.color}08 0%, transparent 60%)`,
              }}
            >
              <div className="flex flex-wrap gap-4 mb-3 font-mono text-xs text-[var(--color-text-muted)]">
                {event.time && (
                  <span className="flex items-center gap-1.5">
                    <Clock size={11} style={{ color: event.color }} />
                    {event.time}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <MapPin size={11} style={{ color: event.color }} />
                  {event.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={11} style={{ color: event.color }} />
                  {fDay(event.date)} {fMonth(event.date)}
                </span>
              </div>

              {event.description && (
                <p className="text-xs text-[var(--color-text-muted)] leading-relaxed mb-3 max-w-lg">
                  {event.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2">
                {ticket.clickable && event.link ? (
                  <a
                    href={event.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md font-mono text-[10px] uppercase tracking-wider font-semibold transition-all duration-200 hover:opacity-80 hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      background: BRAND.green,
                      color: "#000",
                      boxShadow: `0 0 12px ${BRAND.green}20`,
                    }}
                  >
                    <ExternalLink size={10} />
                    {ticket.text}
                  </a>
                ) : (
                  <span
                    className="inline-flex items-center px-3.5 py-1.5 rounded-md font-mono text-[10px] uppercase tracking-wider"
                    style={{
                      color: ticket.color,
                      border: `1px solid ${ticket.color}50`,
                      background: `${ticket.color}08`,
                    }}
                  >
                    {ticket.text}
                  </span>
                )}

                {!isDone && (
                  <AddToCalendarDropdown event={event} size="sm" />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── NoEventsPlaceholder ──────────────────────────────────────────────────────

function NoEventsPlaceholder() {
  return (
    <div
      className="py-10 px-6 rounded-xl text-center font-mono text-sm text-[var(--color-text-muted)]"
      style={{
        border: "1px dashed var(--color-border)",
        background: "rgba(255,255,255,0.01)",
      }}
    >
      <p className="mb-1">Meer events worden binnenkort aangekondigd</p>
      <p className="text-xs opacity-60">Volg @svsit op Instagram voor updates</p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Events() {
  const [events, setEvents] = useState<SitEvent[]>(FALLBACK_EVENTS);
  const [filter, setFilter] = useState("all");
  const [inView, setInView] = useState(false);
  const [showDone, setShowDone] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // ── Fetch from API ──
  useEffect(() => {
    fetch("/api/events/public")
      .then((r) => r.json())
      .then((data: NotionEventResponse[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setEvents(data.map(notionToSitEvent));
        }
      })
      .catch(() => {
        // silently keep fallback events
      });
  }, []);

  // ── IntersectionObserver for inView ──
  useEffect(() => {
    if (!sectionRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // ── GSAP energy line + dots ──
  useEffect(() => {
    if (shouldReduceMotion || !lineRef.current) return;

    let ctx: gsap.Context | null = null;
    let cancelled = false;

    // Defer ScrollTrigger setup until after first paint
    const hasIdleCb = "requestIdleCallback" in window;
    const idleId: number = hasIdleCb
      ? window.requestIdleCallback(initGsap)
      : (setTimeout(initGsap, 1) as unknown as number);

    function initGsap() {
      if (cancelled) return;

      ctx = gsap.context(() => {
        gsap.fromTo(
          lineRef.current,
          { clipPath: "inset(100% 0 0 0)" },
          {
            clipPath: "inset(0% 0 0 0)",
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 70%",
              once: true,
            },
          }
        );

        gsap.fromTo(
          ".event-node-dot",
          { scale: 0, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.4,
            stagger: 0.1,
            ease: "back.out(2)",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 60%",
              once: true,
            },
          }
        );
      }, sectionRef);
    }

    return () => {
      cancelled = true;
      if (hasIdleCb) {
        window.cancelIdleCallback(idleId);
      } else {
        clearTimeout(idleId);
      }
      ctx?.revert();
    };
  }, [shouldReduceMotion, events]);

  // ── Filter logic ──
  const filterFn = useCallback(
    (event: SitEvent) => {
      if (filter === "all") return true;
      return event.category === filter;
    },
    [filter]
  );

  const filtered = events.filter(filterFn);
  const featured = filtered.find((e) => e.status === "NEXT") ?? null;
  const upcomingList = filtered.filter((e) => e !== featured && e.status !== "DONE");
  const doneList = filtered.filter((e) => e.status === "DONE");

  const featuredColor = featured?.color ?? BRAND.gold;

  return (
    <section
      ref={sectionRef}
      id="events"
      className="relative pt-28 md:pt-40 pb-20 md:pb-28 px-6 md:px-12 lg:px-24"
    >
      <SectionLabel number="03" label="Events" />

      {/* ── Filter pills with icons ── */}
      <div className="flex flex-wrap gap-2 mb-10">
        {CATEGORY_FILTERS.map((f) => {
          const active = filter === f.key;
          const color = f.key === "all" ? BRAND.gold : (CATEGORY_COLORS[f.key] ?? BRAND.gold);
          const Icon = f.icon;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="relative font-mono text-[11px] tracking-widest uppercase px-3.5 py-2 rounded-md transition-all duration-300 flex items-center gap-2 overflow-hidden"
              style={{
                background: active ? `${color}18` : "transparent",
                color: active ? color : "var(--color-text-muted)",
                border: active
                  ? `1px solid ${color}50`
                  : "1px solid var(--color-border)",
                boxShadow: active ? `0 0 16px ${color}10` : "none",
              }}
            >
              <Icon size={12} style={{ opacity: active ? 1 : 0.5 }} />
              {f.label}
              {/* Active indicator underline */}
              {active && (
                <span
                  className="absolute bottom-0 left-2 right-2 h-[1.5px] rounded-full"
                  style={{
                    background: color,
                    animation: "eventFilterSlide 0.3s ease-out forwards",
                    transformOrigin: "left",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Main content with energy line ── */}
      <div className="relative pl-8 md:pl-12">
        {/* Energy line -- thicker with glow */}
        <div
          ref={lineRef}
          className="absolute left-0 md:left-4 top-0 bottom-0 w-[2px] pointer-events-none"
          style={{
            background: `linear-gradient(180deg, ${featuredColor}, ${featuredColor}50 25%, ${featuredColor}20 50%, rgba(255,255,255,0.06) 80%, transparent)`,
            clipPath: shouldReduceMotion ? "none" : "inset(100% 0 0 0)",
          }}
        />
        {/* Energy line glow layer */}
        <div
          className="absolute left-0 md:left-4 top-0 bottom-0 w-[6px] -ml-[2px] pointer-events-none"
          style={{
            background: `linear-gradient(180deg, ${featuredColor}40, ${featuredColor}10 40%, transparent 80%)`,
            filter: "blur(4px)",
            clipPath: shouldReduceMotion ? "none" : "inset(100% 0 0 0)",
            animation: shouldReduceMotion ? "none" : "eventEnergyPulse 3s ease-in-out infinite",
          }}
        />

        {/* ── Featured card ── */}
        <div className="relative mb-10">
          {featured && (
            <span
              className="event-node-dot absolute w-3.5 h-3.5 rounded-full"
              style={{
                left: "calc(-2rem + 1px)",
                top: 8,
                backgroundColor: featured.color,
                boxShadow: `0 0 12px ${featured.color}80, 0 0 24px ${featured.color}30`,
                transform: "translateX(-50%)",
                border: `2px solid ${featured.color}`,
              }}
            />
          )}

          {featured ? (
            <FeaturedCard event={featured} inView={inView} />
          ) : (
            <NoEventsPlaceholder />
          )}
        </div>

        {/* ── Upcoming list ── */}
        {upcomingList.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[var(--color-text-muted)]">
                BINNENKORT
              </span>
              <span
                className="flex-1 h-px"
                style={{
                  background: "linear-gradient(90deg, var(--color-border), transparent)",
                }}
              />
            </div>

            <div className="space-y-0 divide-y divide-[var(--color-border)]">
              {upcomingList.map((event, i) => (
                <div key={event.id} className="relative">
                  <span
                    className="event-node-dot absolute w-2.5 h-2.5 rounded-full"
                    style={{
                      left: "calc(-2rem - 3px)",
                      top: 18,
                      backgroundColor: event.color,
                      boxShadow: `0 0 8px ${event.color}50`,
                      transform: "translateX(-50%)",
                      border: `1.5px solid ${event.color}80`,
                    }}
                  />
                  <CompactItem event={event} index={i} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Done events toggle ── */}
        {doneList.length > 0 && (
          <div className="mb-6">
            <button
              onClick={() => setShowDone((v) => !v)}
              className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors mb-3 px-2 py-1 -mx-2 rounded-md hover:bg-white/[0.02]"
            >
              <ChevronDown
                size={12}
                className="transition-transform duration-200"
                style={{ transform: showDone ? "rotate(180deg)" : "rotate(0deg)" }}
              />
              {showDone ? "Verberg" : "Toon"} afgeronde events ({doneList.length})
            </button>

            <AnimatePresence>
              {showDone && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="space-y-0 divide-y divide-[var(--color-border)] opacity-60">
                    {doneList.map((event, i) => (
                      <div key={event.id} className="relative">
                        <span
                          className="event-node-dot absolute w-2 h-2 rounded-full"
                          style={{
                            left: "calc(-2rem - 3px)",
                            top: 18,
                            border: `1.5px dashed ${event.color}60`,
                            transform: "translateX(-50%)",
                          }}
                        />
                        <CompactItem event={event} index={i} />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ── TBA placeholder at end ── */}
        <div className="relative flex items-center gap-4 py-4">
          <span
            className="event-node-dot absolute w-2 h-2 rounded-full"
            style={{
              left: "calc(-2rem - 3px)",
              top: "50%",
              marginTop: -4,
              border: "1.5px dashed rgba(255,255,255,0.15)",
              transform: "translateX(-50%)",
            }}
          />
          <p className="font-mono text-xs text-[var(--color-text-muted)] opacity-40 italic">
            Meer events worden aangekondigd...
          </p>
        </div>
      </div>
    </section>
  );
}
