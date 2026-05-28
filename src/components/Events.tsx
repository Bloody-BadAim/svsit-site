"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useReducedMotion, AnimatePresence } from "motion/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronDown } from "lucide-react";
import SectionLabel from "@/components/SectionLabel";
import type { NotionEventResponse, SitEvent } from "./events/types";
import { BRAND, CATEGORY_FILTERS, CATEGORY_COLORS } from "./events/types";
import { notionToSitEvent } from "./events/calendarHelpers";
import FeaturedCard from "./events/FeaturedCard";
import CompactItem from "./events/CompactItem";

gsap.registerPlugin(ScrollTrigger);

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
      <p className="text-xs opacity-60">Volg @sv.sit op Instagram voor updates</p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Events() {
  const [events, setEvents] = useState<SitEvent[]>([]);
  const [loading, setLoading] = useState(true);
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
      .catch(() => {})
      .finally(() => setLoading(false));
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

      {/* ── Filter pills ── */}
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
        {/* Energy line */}
        <div
          ref={lineRef}
          className="absolute left-0 md:left-4 top-0 bottom-0 w-[2px] pointer-events-none"
          style={{
            background: `linear-gradient(180deg, ${featuredColor}, ${featuredColor}50 25%, ${featuredColor}20 50%, rgba(255,255,255,0.06) 80%, transparent)`,
            clipPath: shouldReduceMotion ? "none" : "inset(100% 0 0 0)",
          }}
        />
        {/* Energy line glow */}
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

          {loading ? (
            <div className="h-48 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--color-surface)' }} />
          ) : featured ? (
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

        {/* ── TBA placeholder ── */}
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
