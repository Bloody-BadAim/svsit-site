"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useReducedMotion, AnimatePresence } from "motion/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Calendar, MapPin, Clock, ExternalLink, ChevronDown } from "lucide-react";
import SectionLabel from "@/components/SectionLabel";
import { TextScramble } from "@/components/ui/TextScramble";

gsap.registerPlugin(ScrollTrigger);

// ─── Types ────────────────────────────────────────────────────────────────────

type EventStatus = "DONE" | "NEXT" | "TBA";

type EventCategory = "social" | "workshop" | "gaming" | "kennis";

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

const fDay = (d: Date) => d.getDate();
const fMonth = (d: Date) => MONTHS[d.getMonth()];

const CATEGORY_FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "ALLES" },
  { key: "social", label: "SOCIAL" },
  { key: "workshop", label: "WORKSHOP" },
  { key: "gaming", label: "GAMING" },
  { key: "kennis", label: "KENNIS" },
];

const CATEGORY_LABELS: Record<EventCategory, string> = {
  social: "SOCIAL",
  workshop: "WORKSHOP",
  gaming: "GAMING",
  kennis: "KENNIS",
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
    category: "social",
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
    category: "workshop",
    color: BRAND.red,
  },
  {
    id: "dnd",
    title: "SIT x MODUS D&D Avond",
    date: new Date("2026-05-15T18:00:00"),
    location: "WBH 5e verdieping",
    time: "18:00",
    status: "TBA",
    type: "Samenwerking",
    category: "gaming",
    color: BRAND.green,
  },
  {
    id: "cern",
    title: "CERN Lezing",
    date: new Date("2026-06-05T16:00:00"),
    location: "HvA Amstelcampus",
    status: "TBA",
    type: "Samenwerking",
    category: "kennis",
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
    category: e.category || "social",
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

function downloadIcs(e: SitEvent) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const fmt = (d: Date) =>
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` +
    `T${pad(d.getHours())}${pad(d.getMinutes())}00`;

  const start = fmt(e.date);
  const end = e.endDate
    ? fmt(e.endDate)
    : fmt(new Date(e.date.getTime() + 2 * 60 * 60 * 1000));

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

// ─── FeaturedCard ─────────────────────────────────────────────────────────────

function FeaturedCard({ event, inView }: { event: SitEvent; inView: boolean }) {
  const ticket = ticketLabel(event);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative rounded-lg overflow-hidden mb-3"
      style={{
        background: `linear-gradient(135deg, ${event.color}12 0%, rgba(9,9,11,0.95) 60%)`,
        border: `1px solid ${event.color}40`,
      }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: `linear-gradient(90deg, ${event.color}, ${event.color}00)`,
        }}
      />

      {/* Corner brackets */}
      <span
        className="absolute top-3 left-3 text-xs font-mono select-none"
        style={{ color: event.color, opacity: 0.5 }}
      >
        [
      </span>
      <span
        className="absolute top-3 right-3 text-xs font-mono select-none"
        style={{ color: event.color, opacity: 0.5 }}
      >
        ]
      </span>

      <div className="p-6 md:p-8">
        {/* "Volgende event" badge */}
        <div className="flex items-center gap-2 mb-4">
          <span
            className="inline-block w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: BRAND.green }}
          />
          <span
            className="font-mono text-xs tracking-[0.2em] uppercase"
            style={{ color: BRAND.green }}
          >
            Volgende event
          </span>
        </div>

        {/* Title with TextScramble */}
        <TextScramble
          as="h3"
          className="font-display text-2xl md:text-3xl font-bold text-[var(--color-text)] mb-5 leading-tight uppercase"
          trigger={inView}
          duration={0.6}
          speed={0.03}
          characterSet="#{}/<>[]!@$%^&*"
        >
          {event.title}
        </TextScramble>

        {/* Meta row */}
        <div className="flex flex-wrap gap-4 mb-5 font-mono text-sm text-[var(--color-text-muted)]">
          <span className="flex items-center gap-1.5">
            <Calendar size={13} style={{ color: event.color }} />
            {fDay(event.date)} {fMonth(event.date)}
          </span>
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

        {/* Category + Type */}
        <div className="flex flex-wrap gap-2 mb-5">
          <span
            className="font-mono text-[10px] tracking-widest px-2 py-0.5 rounded-sm uppercase"
            style={{
              color: event.color,
              border: `1px solid ${event.color}50`,
              background: `${event.color}10`,
            }}
          >
            {CATEGORY_LABELS[event.category]}
          </span>
          {event.type && (
            <span
              className="font-mono text-[10px] tracking-widest px-2 py-0.5 rounded-sm uppercase"
              style={{
                color: "rgba(255,255,255,0.35)",
                border: "1px solid rgba(255,255,255,0.08)",
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
              className="inline-flex items-center gap-2 px-4 py-2 rounded font-mono text-xs uppercase tracking-wider font-semibold transition-opacity hover:opacity-80"
              style={{ background: BRAND.green, color: "#000" }}
            >
              <ExternalLink size={12} />
              {ticket.text}
            </a>
          ) : (
            <span
              className="inline-flex items-center px-4 py-2 rounded font-mono text-xs uppercase tracking-wider"
              style={{
                color: ticket.color,
                border: `1px solid ${ticket.color}`,
              }}
            >
              {ticket.text}
            </span>
          )}

          <button
            onClick={() => downloadIcs(event)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded font-mono text-xs uppercase tracking-wider text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
            style={{ border: "1px solid var(--color-border)" }}
          >
            <Calendar size={11} />
            + Agenda
          </button>
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
      className="relative event-node"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: isDone ? 0.4 : 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: "easeOut" }}
    >
      {/* Clickable row */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-4 py-3 text-left group"
        aria-expanded={expanded}
      >
        {/* Date block */}
        <div
          className="font-mono text-sm leading-none w-[3.5rem] flex-shrink-0 text-right"
          style={{ color: event.color }}
        >
          <div className="text-lg font-bold leading-none">{fDay(event.date)}</div>
          <div className="text-[10px] tracking-widest mt-0.5 opacity-70">{fMonth(event.date)}</div>
        </div>

        {/* Separator dot */}
        <span
          className="w-1 h-1 rounded-full flex-shrink-0 opacity-40"
          style={{ background: event.color }}
        />

        {/* Title */}
        <span className="flex-1 font-mono text-sm text-[var(--color-text)] group-hover:text-white transition-colors truncate">
          {event.title}
        </span>

        {/* Category tag */}
        <span
          className="hidden sm:inline font-mono text-[10px] tracking-widest uppercase px-2 py-0.5 rounded-sm flex-shrink-0"
          style={{
            color: event.color,
            border: `1px solid ${event.color}40`,
            background: `${event.color}0d`,
          }}
        >
          {CATEGORY_LABELS[event.category]}
        </span>

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
              className="ml-[4.5rem] mb-4 pl-4 py-3 rounded-r"
              style={{
                borderLeft: `2px solid ${event.color}60`,
                background: `${event.color}08`,
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
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-[10px] uppercase tracking-wider font-semibold transition-opacity hover:opacity-80"
                    style={{ background: BRAND.green, color: "#000" }}
                  >
                    <ExternalLink size={10} />
                    {ticket.text}
                  </a>
                ) : (
                  <span
                    className="inline-flex items-center px-3 py-1.5 rounded font-mono text-[10px] uppercase tracking-wider"
                    style={{ color: ticket.color, border: `1px solid ${ticket.color}` }}
                  >
                    {ticket.text}
                  </span>
                )}

                {!isDone && (
                  <button
                    onClick={(ev) => {
                      ev.stopPropagation();
                      downloadIcs(event);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                    style={{ border: "1px solid var(--color-border)" }}
                  >
                    <Calendar size={9} />
                    + Agenda
                  </button>
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
      className="py-10 px-6 rounded-lg text-center font-mono text-sm text-[var(--color-text-muted)]"
      style={{ border: "1px dashed var(--color-border)" }}
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

    const ctx = gsap.context(() => {
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

    return () => ctx.revert();
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
      className="relative py-20 md:py-28 px-6 md:px-12 lg:px-24"
    >
      <SectionLabel number="03" label="Events" />

      {/* ── Filter pills ── */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORY_FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="font-mono text-[11px] tracking-widest uppercase px-3 py-1.5 rounded transition-all duration-200"
              style={{
                background: active ? `${BRAND.gold}20` : "transparent",
                color: active ? BRAND.gold : "var(--color-text-muted)",
                border: active
                  ? `1px solid ${BRAND.gold}60`
                  : "1px solid var(--color-border)",
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* ── Main content with energy line ── */}
      <div className="relative pl-8 md:pl-12">
        {/* Energy line */}
        <div
          ref={lineRef}
          className="absolute left-0 md:left-4 top-0 bottom-0 w-[2px] pointer-events-none"
          style={{
            background: `linear-gradient(180deg, ${featuredColor}, ${featuredColor}40 30%, rgba(255,255,255,0.06) 80%, transparent)`,
            clipPath: shouldReduceMotion ? "none" : "inset(100% 0 0 0)",
          }}
        />

        {/* ── Featured card ── */}
        <div className="relative mb-8">
          {featured && (
            <span
              className="event-node-dot absolute w-3 h-3 rounded-full"
              style={{
                left: "calc(-2rem + 1px)",
                top: 8,
                backgroundColor: featured.color,
                boxShadow: `0 0 8px ${featured.color}80`,
                transform: "translateX(-50%)",
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
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[var(--color-text-muted)]">
                BINNENKORT
              </span>
              <span
                className="flex-1 h-px"
                style={{ background: "var(--color-border)" }}
              />
            </div>

            <div className="space-y-0 divide-y divide-[var(--color-border)]">
              {upcomingList.map((event, i) => (
                <div key={event.id} className="relative">
                  <span
                    className="event-node-dot absolute w-2 h-2 rounded-full"
                    style={{
                      left: "calc(-2rem - 3px)",
                      top: 16,
                      backgroundColor: event.color,
                      boxShadow: `0 0 6px ${event.color}60`,
                      transform: "translateX(-50%)",
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
              className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors mb-3"
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
                            top: 16,
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
              border: "1.5px dashed rgba(255,255,255,0.2)",
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
