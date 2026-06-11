"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useReducedMotion } from "motion/react";
import { Film, ArrowRight } from "lucide-react";
import SectionLabel from "@/components/SectionLabel";
import { InfiniteSlider } from "@/components/motion-primitives/infinite-slider";
import { ProgressiveBlur } from "@/components/motion-primitives/progressive-blur";
import type { RecapPhoto } from "@/app/api/events/recaps/route";
import "./eventRecap.css";

// ---------------------------------------------------------------------------
// Homepage "terugblik" (section 04). A film-strip / contact-sheet marquee of
// photos from past published recaps. Every frame links to the full recap list
// on the events page (/events#terugblik). Mirrors SponsorShowcase's shell:
// padded header + full-bleed marquee + padded CTA, over the circuit bg shield.
// ---------------------------------------------------------------------------

const RECAP_ANCHOR = "/events#terugblik";

type FetchState = "loading" | "ready";

export default function EventRecap() {
  const t = useTranslations("eventRecap");
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [photos, setPhotos] = useState<RecapPhoto[]>([]);
  const [state, setState] = useState<FetchState>("loading");
  const shouldReduceMotion = useReducedMotion();

  // ── Fetch the recap photo feed on mount (same shape as Events.tsx) ──
  useEffect(() => {
    let active = true;
    fetch("/api/events/recaps")
      .then((r) => r.json())
      .then((res: { data: RecapPhoto[] | null }) => {
        if (!active) return;
        setPhotos(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {
        if (active) setPhotos([]);
      })
      .finally(() => {
        if (active) setState("ready");
      });
    return () => {
      active = false;
    };
  }, []);

  // ── IntersectionObserver: reveal once ──
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const hasPhotos = photos.length > 0;
  // Reduced motion -> static strip (no auto-scroll, no hover zoom).
  const speed = shouldReduceMotion ? 0 : 28;
  const speedOnHover = shouldReduceMotion ? 0 : 6;

  return (
    <section ref={ref} className="relative py-24 md:py-32 overflow-hidden">
      {/* Background shield - keeps section darkness consistent over the circuit bg */}
      <div className="absolute inset-0 bg-[var(--color-bg)]/70 pointer-events-none" />

      <div className="relative z-[1]">
        {/* Header block (padded) */}
        <div className="px-6 md:px-12 lg:px-24">
          <SectionLabel number="04" label={t("label")} />

          {/* Code-style subheader */}
          <div
            className="font-mono text-xs -mt-4 mb-10 md:mb-12"
            style={{ color: "var(--color-text-muted)" }}
          >
            <span style={{ color: "var(--color-accent-green)" }}>{"// "}</span>
            {t("subheader")}
          </div>
        </div>

        {/* Full-bleed film strip */}
        <div
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(16px)",
            transition: shouldReduceMotion
              ? "opacity 0.4s ease"
              : "opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s",
          }}
        >
          <div className="frecap-strip relative w-full overflow-hidden">
            {/* Sprocket-hole perforations (decorative) */}
            <span aria-hidden="true" className="frecap-perf frecap-perf--top" />
            <span aria-hidden="true" className="frecap-perf frecap-perf--bottom" />
            {/* Film grain (decorative) */}
            <span aria-hidden="true" className="frecap-grain" />

            {/* Vertical padding leaves room for the perforation gutters. */}
            <div className="relative py-5 md:py-7">
              {state === "loading" ? (
                <StripSkeleton />
              ) : hasPhotos ? (
                <InfiniteSlider
                  className="flex w-full items-center"
                  gap={14}
                  speed={speed}
                  speedOnHover={speedOnHover}
                >
                  {photos.map((photo, i) => (
                    <FilmFrame key={`${photo.eventId}-${i}`} photo={photo} index={i} />
                  ))}
                </InfiniteSlider>
              ) : (
                <EmptyStrip />
              )}
            </div>

            {/* Edge blur (mirror SponsorShowcase) */}
            <ProgressiveBlur
              className="pointer-events-none absolute top-0 left-0 h-full w-[70px] md:w-[180px] z-[2]"
              direction="left"
              blurIntensity={1}
            />
            <ProgressiveBlur
              className="pointer-events-none absolute top-0 right-0 h-full w-[70px] md:w-[180px] z-[2]"
              direction="right"
              blurIntensity={1}
            />
          </div>
        </div>

        {/* CTA -> full recap list (padded) */}
        <div className="px-6 md:px-12 lg:px-24">
          <Link
            href={RECAP_ANCHOR}
            className="group inline-flex items-center gap-2 mt-10 md:mt-12 font-mono text-sm text-[var(--color-accent-gold)] hover:text-[var(--color-text)] transition-colors duration-300"
          >
            <Film
              size={14}
              className="text-[var(--color-accent-gold)] group-hover:text-[var(--color-text)] transition-colors duration-300"
              aria-hidden="true"
            />
            <span>{t("cta")}</span>
            <ArrowRight
              size={14}
              className="transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── A single film frame (one recap photo) ──────────────────────────────────

function FilmFrame({ photo, index }: { photo: RecapPhoto; index: number }) {
  const t = useTranslations("eventRecap");
  const frameNo = String(index + 1).padStart(2, "0");
  return (
    <Link
      href="/events#terugblik"
      className="frecap-frame h-40 w-60 md:h-56 md:w-80 shrink-0"
      style={{ ["--frecap-accent" as string]: photo.color }}
      aria-label={t("frameAria", { title: photo.title })}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.url}
        alt={t("photoAlt", { title: photo.title })}
        loading="lazy"
        className="frecap-photo"
      />

      {/* Frame index (contact-sheet motif) */}
      <span className="frecap-index font-mono text-[9px] md:text-[10px]" aria-hidden="true">
        {frameNo}
      </span>

      {/* Caption: accent dot + truncated event title */}
      <span className="frecap-caption font-mono text-[10px] md:text-xs">
        <span className="frecap-caption-dot" aria-hidden="true" />
        <span className="frecap-caption-text">{photo.title}</span>
      </span>
    </Link>
  );
}

// ─── Loading skeleton row (matches frame footprint) ─────────────────────────

function StripSkeleton() {
  return (
    <div className="flex w-full items-center gap-[14px] px-6 md:px-12 overflow-hidden">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="frecap-frame h-40 w-60 md:h-56 md:w-80 shrink-0 animate-pulse"
          style={{
            ["--frecap-accent" as string]: "var(--color-accent-gold)",
            background: "var(--color-surface)",
          }}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

// ─── Empty state: film-strip-styled placeholder frame ───────────────────────

function EmptyStrip() {
  const t = useTranslations("eventRecap");
  return (
    <div className="flex w-full items-center justify-center px-6">
      <div className="frecap-empty h-40 w-full max-w-xl md:h-56 px-6">
        <p className="font-mono text-xs md:text-sm text-[var(--color-text-muted)]">
          <span style={{ color: "var(--color-accent-green)" }}>{"// "}</span>
          {t("empty.lead")} &mdash; {t("empty.follow")}{" "}
          <a
            href="https://instagram.com/sv.sit"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-accent-gold)] hover:text-[var(--color-text)] transition-colors"
          >
            @sv.sit
          </a>{" "}
          {t("empty.tail")}
        </p>
      </div>
    </div>
  );
}
