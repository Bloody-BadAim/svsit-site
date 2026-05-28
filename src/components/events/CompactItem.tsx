"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, Clock, Calendar, ChevronDown, ExternalLink } from "lucide-react";
import type { SitEvent } from "./types";
import { BRAND, CATEGORY_LABELS, fDay, fMonth } from "./types";
import { ticketLabel } from "./calendarHelpers";
import DateStub from "./DateStub";
import AddToCalendarDropdown from "./AddToCalendarDropdown";

export default function CompactItem({ event, index }: { event: SitEvent; index: number }) {
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
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-4 py-3.5 px-3 -mx-3 text-left rounded-lg transition-all duration-200 hover:bg-white/[0.02]"
        aria-expanded={expanded}
        style={{ borderLeft: "2px solid transparent" }}
        onMouseEnter={(e) => {
          if (!isDone) {
            (e.currentTarget as HTMLElement).style.borderLeftColor = `${event.color}60`;
          }
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.borderLeftColor = "transparent";
        }}
      >
        <DateStub event={event} size="sm" />

        <div className="flex-1 min-w-0">
          <span className="block font-mono text-sm text-[var(--color-text)] group-hover/compact:text-white transition-colors truncate">
            {event.title}
          </span>
          <span className="block font-mono text-[10px] text-[var(--color-text-muted)] mt-0.5 truncate">
            <MapPin size={9} className="inline mr-1 -mt-px" style={{ color: event.color }} />
            {event.location}
          </span>
        </div>

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

        {event.time && (
          <span className="hidden md:flex items-center gap-1 font-mono text-[10px] text-[var(--color-text-muted)] flex-shrink-0">
            <Clock size={10} style={{ color: event.color, opacity: 0.6 }} />
            {event.time}
          </span>
        )}

        <ChevronDown
          size={14}
          className="flex-shrink-0 text-[var(--color-text-muted)] transition-transform duration-200"
          style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

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
