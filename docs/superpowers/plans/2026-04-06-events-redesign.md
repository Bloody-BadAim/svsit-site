# Events Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current Events component with a hybrid Featured + Compact List layout including Signal Pulse wow animations, Notion integration, and full error handling.

**Architecture:** Single component replacement — `Events.tsx` gets rewritten from scratch. Reuses existing `TextScramble` for title decode, existing `SectionLabel` for header, GSAP ScrollTrigger for energy line draw, Framer Motion for list stagger. Notion data flows through existing `/api/events/public` route. Two new Notion properties (Link, Beschrijving) added for CTA and detail expand.

**Tech Stack:** Next.js, React, GSAP + ScrollTrigger, Framer Motion, TypeScript, Notion API

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `src/components/Events.tsx` | Replace | Hybrid featured+list layout, all event rendering |
| `src/lib/notion.ts` | Modify | Add Link + Beschrijving property extraction |
| `src/app/globals.css` | Modify | Add `nodeGlow` keyframe |
| `src/components/EventList.tsx` | Delete | Functionality absorbed into new Events.tsx |

---

### Task 1: Add Notion properties and update data layer

**Files:**
- Modify: `src/lib/notion.ts`

- [ ] **Step 1: Add Link and Beschrijving to NotionEvent interface and extraction**

In `src/lib/notion.ts`, update the interface and the mapping function:

```typescript
// In the NotionEvent interface, add:
export interface NotionEvent {
  id: string
  name: string
  date: string
  dateEnd?: string
  time?: string
  location?: string
  description?: string
  link?: string            // NEW
  status: 'done' | 'next' | 'tba'
  type: string
  tags: string[]
  color: string
}
```

Add a URL property extractor after the existing helpers:

```typescript
function getUrl(prop: unknown): string | undefined {
  return (prop as { url?: string })?.url || undefined
}
```

In the `return` block inside `response.results.map`, change:

```typescript
      return {
        id: page.id,
        name: getTitle(props.Name),
        date: dateInfo.start || '',
        dateEnd: dateInfo.end,
        time,
        location: getRichText(props.Location),
        description: getRichText(props.Beschrijving),  // was: undefined
        link: getUrl(props.Link),                       // NEW
        status,
        type,
        tags,
        color: getEventColor(tags),
      }
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors (Beschrijving and Link properties may not exist in Notion yet, but the extractors return undefined gracefully)

- [ ] **Step 3: Commit**

```bash
git add src/lib/notion.ts
git commit -m "feat: add Link and Beschrijving extraction to Notion events"
```

---

### Task 2: Add nodeGlow keyframe to globals.css

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add the keyframe**

Add after the existing `matrixRain` keyframe in `globals.css`:

```css
@keyframes nodeGlow {
  0%   { box-shadow: 0 0 0 0 currentColor; }
  50%  { box-shadow: 0 0 12px 4px currentColor; }
  100% { box-shadow: 0 0 0 0 currentColor; }
}

@keyframes energyDraw {
  from { clip-path: inset(100% 0 0 0); }
  to   { clip-path: inset(0 0 0 0); }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: add nodeGlow and energyDraw keyframes for events"
```

---

### Task 3: Build the new Events component — data fetching and types

**Files:**
- Replace: `src/components/Events.tsx`

- [ ] **Step 1: Write the component scaffold with types, constants, data fetching, and fallback**

Replace the entire `src/components/Events.tsx` with:

```tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useReducedMotion, AnimatePresence } from "motion/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Calendar, MapPin, Clock, ExternalLink, ChevronDown } from "lucide-react";
import SectionLabel from "@/components/SectionLabel";
import { TextScramble } from "@/components/ui/TextScramble";

gsap.registerPlugin(ScrollTrigger);

/* ═══════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════ */

type EventStatus = "DONE" | "NEXT" | "TBA";

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
  tags: string[];
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
  tags: string[];
  color: string;
}

/* ═══════════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════════ */

const BRAND = {
  gold: "#F59E0B",
  blue: "#3B82F6",
  red: "#EF4444",
  green: "#22C55E",
} as const;

const MONTHS = ["JAN","FEB","MRT","APR","MEI","JUN","JUL","AUG","SEP","OKT","NOV","DEC"];
const fDay = (d: Date) => d.getDate();
const fMonth = (d: Date) => MONTHS[d.getMonth()];

const CATEGORY_FILTERS = [
  { key: "all", label: "ALLES" },
  { key: "social", label: "SOCIAL", match: ["SIT", "SOCIAL", "SVO"] },
  { key: "tech", label: "TECH", match: ["TECH", "AI"] },
  { key: "edu", label: "EDUCATIE", match: ["COLLAB", "EXTERN", "EDUCATIE", "CARRIERE"] },
] as const;

const FALLBACK_EVENTS: SitEvent[] = [
  { id: "kroegentocht", title: "Kroegentocht (SVO)", date: new Date("2026-04-16T20:00:00"), location: "Amsterdam Centrum", time: "20:00", status: "NEXT", type: "SVO gezamenlijk", tags: ["SVO", "SOCIAL"], color: BRAND.gold },
  { id: "hackathon", title: "Connectie Code Hackathon", date: new Date("2026-05-10T09:00:00"), location: "AI House Amsterdam", time: "09:00", status: "NEXT", type: "SIT eigen", tags: ["SIT", "SOCIAL"], color: BRAND.gold },
  { id: "techborrel", title: "Tech + Borrel", date: new Date("2026-05-15T16:00:00"), location: "met de opleiding", status: "TBA", type: "SIT eigen", tags: ["SIT", "SOCIAL"], color: BRAND.gold },
  { id: "cern", title: "CERN Lezing", date: new Date("2026-06-05T16:00:00"), location: "HvA Amstelcampus", status: "TBA", type: "Samenwerking", tags: ["COLLAB"], color: BRAND.blue },
];

/* ═══════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════ */

function notionToSitEvent(e: NotionEventResponse): SitEvent {
  const statusMap: Record<string, EventStatus> = { done: "DONE", next: "NEXT", tba: "TBA" };
  return {
    id: e.id,
    title: e.name,
    date: new Date(e.date),
    endDate: e.dateEnd ? new Date(e.dateEnd) : undefined,
    location: e.location || "TBA",
    time: e.time,
    description: e.description,
    link: e.link,
    status: statusMap[e.status] || "TBA",
    type: e.type,
    tags: e.tags,
    color: e.color,
  };
}

function ticketLabel(event: SitEvent): { text: string; color: string; clickable: boolean } {
  if (event.status === "DONE") return { text: "AFGEROND", color: "rgba(255,255,255,0.2)", clickable: false };
  if (event.link) return { text: "TICKETS OPEN", color: BRAND.green, clickable: true };
  if (event.status === "TBA") return { text: "BINNENKORT", color: BRAND.gold, clickable: false };
  return { text: "BINNENKORT", color: BRAND.gold, clickable: false };
}

/* ═══════════════════════════════════════════════════════════
   ICS Calendar (reused from original)
   ═══════════════════════════════════════════════════════════ */

const p2 = (n: number) => n.toString().padStart(2, "0");
const icsTs = (d: Date) =>
  `${d.getFullYear()}${p2(d.getMonth() + 1)}${p2(d.getDate())}T${p2(d.getHours())}${p2(d.getMinutes())}00`;

function downloadIcs(e: SitEvent) {
  const end = e.endDate || new Date(e.date.getTime() + 7200000);
  const content = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//SIT Studievereniging ICT//NL",
    "BEGIN:VEVENT", `DTSTART:${icsTs(e.date)}`, `DTEND:${icsTs(end)}`,
    `SUMMARY:${e.title}`, `LOCATION:${e.location}`, `DESCRIPTION:${e.description || ""}`,
    `UID:${e.id}@svsit.nl`, "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `SIT_${e.title.replace(/\s+/g, "_")}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

// --- COMPONENT CONTINUES IN TASK 4 ---
```

- [ ] **Step 2: Verify it compiles (component is incomplete but types check)**

This is a partial write — the default export will be added in the next task.

- [ ] **Step 3: Commit**

```bash
git add src/components/Events.tsx
git commit -m "feat(events): scaffold new Events component with types, data, helpers"
```

---

### Task 4: Build the new Events component — FeaturedCard, CompactItem, main render

**Files:**
- Modify: `src/components/Events.tsx` (append remaining code)

- [ ] **Step 1: Add FeaturedCard subcomponent**

Append after the ICS helper section:

```tsx
/* ═══════════════════════════════════════════════════════════
   Featured Card (next upcoming event, large)
   ═══════════════════════════════════════════════════════════ */

function FeaturedCard({ event, inView }: { event: SitEvent; inView: boolean }) {
  const ticket = ticketLabel(event);

  return (
    <div
      className="relative overflow-hidden"
      style={{
        border: `1px solid ${event.color}30`,
        background: `${event.color}05`,
      }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, ${event.color}, transparent)` }}
      />

      {/* Corner brackets */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: event.color }} />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2" style={{ borderColor: `${event.color}40` }} />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2" style={{ borderColor: `${event.color}20` }} />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: `${event.color}20` }} />

      <div className="p-6 md:p-8">
        {/* Status label */}
        <div className="flex items-center gap-2 mb-4">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: BRAND.green, boxShadow: `0 0 8px ${BRAND.green}88` }}
          />
          <span
            className="font-mono text-[10px] uppercase tracking-[0.25em]"
            style={{ color: BRAND.green }}
          >
            Volgende event
          </span>
        </div>

        {/* Title with scramble */}
        <TextScramble
          as="h3"
          className="font-display text-xl md:text-2xl font-bold text-[var(--color-text)] uppercase tracking-tight mb-3"
          trigger={inView}
          duration={0.6}
          speed={0.03}
          characterSet="#{}/<>[]!@$%^&*"
        >
          {event.title}
        </TextScramble>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-4">
          <span className="flex items-center gap-1.5 font-mono text-xs" style={{ color: "var(--color-text-muted)" }}>
            <Calendar size={12} style={{ color: event.color }} />
            {fDay(event.date)} {fMonth(event.date)} {event.date.getFullYear()}
          </span>
          {event.time && (
            <span className="flex items-center gap-1.5 font-mono text-xs" style={{ color: "var(--color-text-muted)" }}>
              <Clock size={12} style={{ color: event.color }} />
              {event.time}
            </span>
          )}
          <span className="flex items-center gap-1.5 font-mono text-xs" style={{ color: "var(--color-text-muted)" }}>
            <MapPin size={12} style={{ color: event.color }} />
            {event.location}
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {event.tags.map((tag) => (
            <span
              key={tag}
              className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5"
              style={{
                color: event.color,
                border: `1px solid ${event.color}30`,
                background: `${event.color}10`,
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Description if available */}
        {event.description && (
          <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--color-text-muted)" }}>
            {event.description}
          </p>
        )}

        {/* CTA row */}
        <div className="flex items-center gap-3">
          {ticket.clickable && event.link ? (
            <a
              href={event.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider px-5 py-2.5 transition-opacity hover:opacity-80"
              style={{ backgroundColor: ticket.color, color: "var(--color-bg)" }}
            >
              {ticket.text}
              <ExternalLink size={12} />
            </a>
          ) : (
            <span
              className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider px-5 py-2.5"
              style={{ border: `1px solid ${ticket.color}40`, color: ticket.color }}
            >
              {ticket.text}
            </span>
          )}
          <button
            onClick={() => downloadIcs(event)}
            className="font-mono text-[10px] uppercase tracking-wider px-3 py-2 transition-opacity hover:opacity-70 cursor-pointer"
            style={{ border: "1px solid rgba(255,255,255,0.08)", color: "var(--color-text-muted)" }}
          >
            + Agenda
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Compact Event Item (list row)
   ═══════════════════════════════════════════════════════════ */

function CompactItem({ event, index }: { event: SitEvent; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const ticket = ticketLabel(event);
  const isDone = event.status === "DONE";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      style={{ opacity: isDone ? 0.4 : 1 }}
    >
      {/* Main row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 md:gap-4 px-4 py-3 transition-colors cursor-pointer text-left group"
        style={{
          border: `1px solid ${expanded ? event.color + "30" : "rgba(255,255,255,0.04)"}`,
          background: expanded ? `${event.color}05` : "transparent",
        }}
      >
        {/* Date */}
        <div className="shrink-0 w-16 text-right">
          <span className="font-mono text-xs font-bold" style={{ color: event.color }}>
            {fDay(event.date)} {fMonth(event.date)}
          </span>
        </div>

        {/* Dot */}
        <div
          className="shrink-0 w-2 h-2 rounded-full"
          style={{
            backgroundColor: isDone ? "transparent" : event.color,
            border: isDone ? `1px dashed ${event.color}40` : "none",
            boxShadow: isDone ? "none" : `0 0 6px ${event.color}44`,
          }}
        />

        {/* Title */}
        <span className="flex-1 font-medium text-sm truncate" style={{ color: "var(--color-text)" }}>
          {event.title}
        </span>

        {/* Type tag */}
        <span
          className="hidden sm:inline font-mono text-[8px] uppercase tracking-wider px-1.5 py-0.5 shrink-0"
          style={{ color: `${event.color}99`, border: `1px solid ${event.color}20` }}
        >
          {event.tags[0]}
        </span>

        {/* Chevron */}
        <ChevronDown
          size={14}
          className="shrink-0 transition-transform duration-200"
          style={{
            color: "rgba(255,255,255,0.2)",
            transform: expanded ? "rotate(180deg)" : "rotate(0)",
          }}
        />
      </button>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div
              className="px-4 py-4 space-y-3"
              style={{
                borderLeft: `2px solid ${event.color}40`,
                borderRight: `1px solid rgba(255,255,255,0.04)`,
                borderBottom: `1px solid rgba(255,255,255,0.04)`,
                marginLeft: "calc(4rem + 12px)",
                background: `${event.color}03`,
              }}
            >
              {/* Details */}
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {event.time && (
                  <span className="flex items-center gap-1.5 font-mono text-[11px]" style={{ color: "var(--color-text-muted)" }}>
                    <Clock size={11} /> {event.time}
                  </span>
                )}
                <span className="flex items-center gap-1.5 font-mono text-[11px]" style={{ color: "var(--color-text-muted)" }}>
                  <MapPin size={11} /> {event.location}
                </span>
              </div>

              {event.description && (
                <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                  {event.description}
                </p>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1">
                {ticket.clickable && event.link && (
                  <a
                    href={event.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 transition-opacity hover:opacity-80"
                    style={{ backgroundColor: ticket.color, color: "var(--color-bg)" }}
                  >
                    {ticket.text} <ExternalLink size={10} />
                  </a>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); downloadIcs(event); }}
                  className="font-mono text-[10px] uppercase tracking-wider px-2 py-1.5 transition-opacity hover:opacity-70 cursor-pointer"
                  style={{ border: "1px solid rgba(255,255,255,0.08)", color: "var(--color-text-muted)" }}
                >
                  + Agenda
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Placeholder (no upcoming events)
   ═══════════════════════════════════════════════════════════ */

function NoEventsPlaceholder() {
  return (
    <div
      className="p-6 md:p-8 text-center"
      style={{ border: "1px dashed rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}
    >
      <p className="font-mono text-xs uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
        Meer events worden binnenkort aangekondigd
      </p>
      <p className="font-mono text-[10px] mt-2" style={{ color: "rgba(255,255,255,0.2)" }}>
        Volg @svsit op Instagram voor updates
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Add the main Events export with energy line, filters, and Signal Pulse animation**

Append at the end of the file:

```tsx
/* ═══════════════════════════════════════════════════════════
   Main Events Section
   ═══════════════════════════════════════════════════════════ */

export default function Events() {
  const shouldReduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const [events, setEvents] = useState<SitEvent[]>(FALLBACK_EVENTS);
  const [filter, setFilter] = useState<string>("all");
  const [inView, setInView] = useState(false);

  // Fetch events from Notion
  useEffect(() => {
    fetch("/api/events/public")
      .then((res) => {
        if (!res.ok) throw new Error("fetch failed");
        return res.json();
      })
      .then((data: NotionEventResponse[]) => {
        if (data && data.length > 0) {
          setEvents(data.map(notionToSitEvent));
        }
      })
      .catch(() => {
        // Keep fallback events — homepage never empty
      });
  }, []);

  // IntersectionObserver for inView (triggers TextScramble + energy line)
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

  // GSAP energy line draw animation
  useEffect(() => {
    if (shouldReduceMotion || !lineRef.current || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Energy line draws itself
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

      // Node dots glow stagger
      const nodes = sectionRef.current?.querySelectorAll(".event-node");
      if (nodes?.length) {
        gsap.fromTo(
          Array.from(nodes),
          { scale: 0, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.4,
            stagger: 0.1,
            ease: "back.out(2)",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 65%",
              once: true,
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [shouldReduceMotion, events]);

  // Filter events
  const filtered = events.filter((e) => {
    if (filter === "all") return true;
    const filterDef = CATEGORY_FILTERS.find((f) => f.key === filter);
    if (!filterDef || !("match" in filterDef)) return true;
    return e.tags.some((tag) => filterDef.match.includes(tag));
  });

  // Split: featured (first NEXT) + rest
  const featured = filtered.find((e) => e.status === "NEXT");
  const listEvents = filtered.filter((e) => e !== featured);
  const upcomingList = listEvents.filter((e) => e.status !== "DONE");
  const doneList = listEvents.filter((e) => e.status === "DONE");
  const [showDone, setShowDone] = useState(false);

  return (
    <section
      ref={sectionRef}
      id="events"
      className="relative py-20 md:py-28 px-6 md:px-12 lg:px-24"
    >
      <SectionLabel number="03" label="Events" />

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORY_FILTERS.map((f) => {
          const isActive = filter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 cursor-pointer transition-all duration-150"
              style={{
                color: isActive ? "var(--color-bg)" : "var(--color-text-muted)",
                backgroundColor: isActive ? "var(--color-accent-gold)" : "transparent",
                border: `1px solid ${isActive ? "var(--color-accent-gold)" : "rgba(255,255,255,0.08)"}`,
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Main content with energy line */}
      <div className="relative pl-8 md:pl-12">
        {/* Energy line */}
        <div
          ref={lineRef}
          className="absolute left-0 md:left-4 top-0 bottom-0 w-[2px] pointer-events-none"
          style={{
            background: featured
              ? `linear-gradient(180deg, ${featured.color}, ${featured.color}40 30%, rgba(255,255,255,0.06) 80%, transparent)`
              : "linear-gradient(180deg, var(--color-accent-gold), rgba(255,255,255,0.06), transparent)",
            clipPath: shouldReduceMotion ? "none" : "inset(100% 0 0 0)",
          }}
        />

        {/* Featured event or placeholder */}
        {featured ? (
          <div className="relative mb-8">
            {/* Node dot for featured */}
            <div
              className="event-node absolute -left-8 md:-left-12 top-8 w-3 h-3 rounded-full"
              style={{
                backgroundColor: featured.color,
                boxShadow: `0 0 10px ${featured.color}66`,
                transform: "translateX(-50%)",
                left: "calc(-2rem + 1px)",
              }}
            />
            <FeaturedCard event={featured} inView={inView} />
          </div>
        ) : (
          <NoEventsPlaceholder />
        )}

        {/* Upcoming list */}
        {upcomingList.length > 0 && (
          <div className="mb-6">
            <span
              className="font-mono text-[9px] uppercase tracking-[0.25em] mb-3 block"
              style={{ color: "rgba(255,255,255,0.25)" }}
            >
              Binnenkort
            </span>
            <div className="space-y-1">
              {upcomingList.map((event, i) => (
                <div key={event.id} className="relative">
                  {/* Node dot */}
                  <div
                    className="event-node absolute top-4 w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: event.color,
                      boxShadow: `0 0 6px ${event.color}44`,
                      left: "calc(-2rem - 3px)",
                    }}
                  />
                  <CompactItem event={event} index={i} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Done events (toggle) */}
        {doneList.length > 0 && (
          <div>
            <button
              onClick={() => setShowDone(!showDone)}
              className="font-mono text-[10px] uppercase tracking-wider px-2 py-1 mb-2 cursor-pointer transition-opacity hover:opacity-70"
              style={{ color: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              {showDone ? "Verberg" : "Toon"} afgeronde events ({doneList.length})
            </button>
            <AnimatePresence>
              {showDone && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden space-y-1"
                >
                  {doneList.map((event, i) => (
                    <div key={event.id} className="relative">
                      <div
                        className="event-node absolute top-4 w-2 h-2 rounded-full"
                        style={{
                          border: `1px dashed ${event.color}40`,
                          left: "calc(-2rem - 3px)",
                        }}
                      />
                      <CompactItem event={event} index={i} />
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* TBA placeholder at end */}
        {filtered.length > 0 && (
          <div className="relative mt-4">
            <div
              className="absolute top-3 w-2 h-2 rounded-full"
              style={{ border: "1px dashed rgba(255,255,255,0.15)", left: "calc(-2rem - 3px)" }}
            />
            <p
              className="font-mono text-[10px] px-4 py-3"
              style={{ color: "rgba(255,255,255,0.15)" }}
            >
              Meer events worden aangekondigd...
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add src/components/Events.tsx
git commit -m "feat(events): complete hybrid layout with featured card, compact list, signal pulse"
```

---

### Task 5: Delete EventList.tsx and verify build

**Files:**
- Delete: `src/components/EventList.tsx`

- [ ] **Step 1: Check if EventList is imported anywhere**

Run: `grep -rn "EventList" src/ --include="*.tsx" --include="*.ts"`

If it's imported somewhere besides Events.tsx, update that import. The old Events.tsx used it but the new one doesn't.

- [ ] **Step 2: Delete the file**

```bash
rm src/components/EventList.tsx
```

- [ ] **Step 3: Full build check**

Run: `npm run build`
Expected: build succeeds, no import errors

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor: remove EventList.tsx, absorbed into new Events component"
```

---

### Task 6: Manual verification and final adjustments

- [ ] **Step 1: Start dev server and test**

Run: `npm run dev`

Verify on http://localhost:3000:
1. Events section renders with SectionLabel "Events"
2. Filter pills work (ALLES/SOCIAL/TECH/EDUCATIE)
3. Featured card shows next upcoming event with text scramble animation
4. Energy line draws itself on scroll-in
5. Node dots appear with stagger
6. Compact list items expand on click
7. ICS download works
8. "Toon afgeronde events" toggle works
9. Mobile responsive (energy line hidden, stacked layout)
10. `prefers-reduced-motion`: no animations, instant render

- [ ] **Step 2: Verify Notion data loads**

Check browser console for `[notion] Failed to fetch events:` error. If it appears, fallback events should be showing. If Notion works, real events replace fallbacks.

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: events redesign complete — hybrid featured + compact list with signal pulse"
```
