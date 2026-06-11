"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Clock, MapPin, ExternalLink } from "lucide-react";
import { TextScramble } from "@/components/ui/TextScramble";
import type { SitEvent } from "./types";
import { BRAND, CATEGORY_LABELS } from "./types";
import { ticketLabel } from "./calendarHelpers";
import DateStub from "./DateStub";
import AddToCalendarDropdown from "./AddToCalendarDropdown";

export default function FeaturedCard({ event, inView }: { event: SitEvent; inView: boolean }) {
  const t = useTranslations("eventFeaturedCard");
  const ticket = ticketLabel(event);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative rounded-xl overflow-hidden mb-3 group/featured"
      style={{
        background: `
          linear-gradient(var(--color-bg), var(--color-bg)) padding-box,
          conic-gradient(from var(--event-border-angle, 0deg), ${event.color}, ${event.color}40, rgba(255,255,255,0.06), ${event.color}40, ${event.color}) border-box
        `,
        border: "1.5px solid transparent",
        animation: "eventBorderRotate 8s linear infinite",
      }}
    >
      <div
        className="relative rounded-[10px] overflow-hidden"
        style={{
          background: `linear-gradient(145deg, ${event.color}10 0%, rgba(9,9,11,0.97) 40%, rgba(9,9,11,0.99) 100%)`,
        }}
      >
        {/* Ambient glow */}
        <div
          className="absolute -top-20 -right-20 w-60 h-60 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${event.color}15 0%, transparent 70%)`,
            animation: "eventGlowPulse 4s ease-in-out infinite",
          }}
        />

        {/* Spotlight sweep */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-0 group-hover/featured:opacity-100 transition-opacity duration-500">
          <div
            className="absolute inset-0 w-[40%]"
            style={{
              background: `linear-gradient(90deg, transparent, ${event.color}08, transparent)`,
              animation: "eventSpotlightSweep 3s ease-in-out infinite",
            }}
          />
        </div>

        {/* Scanline */}
        <div
          className="absolute top-0 left-0 right-0 h-[1px] pointer-events-none opacity-[0.07]"
          style={{
            background: event.color,
            animation: "eventScanline 4s linear infinite",
            boxShadow: `0 0 8px ${event.color}`,
            willChange: "transform",
          }}
        />

        {/* Corner brackets */}
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
              <span
                className="absolute inset-0 rounded-full animate-ping"
                style={{ backgroundColor: BRAND.green, opacity: 0.4 }}
              />
              <span
                className="relative w-2 h-2 rounded-full"
                style={{ backgroundColor: BRAND.green }}
              />
            </span>
            <span
              className="font-mono text-[11px] tracking-[0.2em] uppercase font-medium"
              style={{ color: BRAND.green }}
            >
              {t("nextEvent")}
            </span>
          </div>

          {/* Title + Date row */}
          <div className="flex items-start gap-5 mb-6">
            <DateStub event={event} size="lg" />
            <div className="flex-1 min-w-0">
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
