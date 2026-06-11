"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Calendar, ChevronDown } from "lucide-react";
import type { SitEvent } from "./types";
import { downloadIcs, googleCalendarUrl, outlookCalendarUrl } from "./calendarHelpers";

export default function AddToCalendarDropdown({
  event,
  size = "sm",
}: {
  event: SitEvent;
  size?: "sm" | "lg";
}) {
  const t = useTranslations("eventCalendar");
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
        {t("addToCalendar")}
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

            <div className="h-px mx-2" style={{ background: "rgba(255,255,255,0.06)" }} />

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

            <div className="h-px mx-2" style={{ background: "rgba(255,255,255,0.06)" }} />

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
              {t("downloadIcs")}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
