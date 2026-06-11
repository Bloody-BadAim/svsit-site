"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { Plus, ArrowRight } from "lucide-react";
import { PARTNERS, TIER_META, TIER_ORDER } from "@/lib/partners";
import { SITE_CONFIG } from "@/lib/constants";
import { TextScramble } from "@/components/ui/TextScramble";
import "./sponsorShowcase.css";

// ---------------------------------------------------------------------------
// Homepage Partners teaser — "SPONSOR-BUS".
// Partners ride a slow auto-scrolling PCB data bus: chip-cards cruise
// left→right on a seamless loop so all 9 sponsors cycle into view and the
// strategisch tier is never permanently clipped. Tier hierarchy is visible
// (paid tiers are bigger + glow harder). Hover slows the marquee for clicking
// and intensifies that chip's glow. The full network lives on /partners.
// Data comes from @/lib/partners (single source of truth).
// ---------------------------------------------------------------------------

const TILT = 7;

// Sort partners by tier so the bus reads strategisch → partner left-to-right.
const ORDERED_PARTNERS = [...PARTNERS].sort(
  (a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier)
);

function Corners() {
  return (
    <>
      <i className="sbus-cnr tl" />
      <i className="sbus-cnr tr" />
      <i className="sbus-cnr bl" />
      <i className="sbus-cnr br" />
    </>
  );
}

// Render one chip. `inView` drives the name scramble. `decorative` clones are
// hidden from assistive tech / tab order (they only exist for the seamless loop).
function PartnerChip({
  slug,
  name,
  tier,
  tagline,
  url,
  inView,
  decorative,
}: {
  slug: string;
  name: string;
  tier: (typeof PARTNERS)[number]["tier"];
  tagline: string;
  url?: string;
  inView: boolean;
  decorative?: boolean;
}) {
  const t = useTranslations("sponsorShowcase");
  const meta = TIER_META[tier];
  const isHboIct = slug === "hbo-ict";
  const isBig = tier === "strategisch" || tier === "hoofdsponsor";
  const chipStyle = { ["--c" as string]: meta.color } as CSSProperties;
  const chipClass = `sbus-chip t-${tier}`;

  const inner = (
    <>
      <span className="sbus-via l" aria-hidden="true" />
      <span className="sbus-via r" aria-hidden="true" />
      <span className="sbus-solder" aria-hidden="true" />
      {isBig && <Corners />}
      <div className="sbus-spot" aria-hidden="true" />

      <div className="sbus-chip-head">
        <span className="sbus-badge">{isHboIct ? t("homebase") : meta.label}</span>
        <span className="sbus-onl" aria-hidden="true" />
      </div>

      <h3 className="sbus-name">
        {decorative ? (
          name
        ) : (
          <TextScramble as="span" trigger={inView} duration={0.6} speed={0.03}>
            {name}
          </TextScramble>
        )}
      </h3>

      <p className="sbus-tag">{tagline}</p>

      <div className="sbus-foot">
        <span className="sbus-addr">
          node://<b>{slug}</b>
        </span>
        {url && (
          <span className="sbus-go" aria-hidden="true">
            {t("connect")}
          </span>
        )}
      </div>
    </>
  );

  // Decorative clones never receive focus or expose links.
  if (decorative) {
    return (
      <div className={chipClass} style={chipStyle} aria-hidden="true">
        {inner}
      </div>
    );
  }

  return url ? (
    <a
      className={chipClass}
      style={chipStyle}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
    >
      {inner}
    </a>
  ) : (
    <div className={chipClass} style={chipStyle}>
      {inner}
    </div>
  );
}

function SlotChip({ decorative }: { decorative?: boolean }) {
  const t = useTranslations("sponsorShowcase");
  const href = `mailto:${SITE_CONFIG.sponsoringEmail}?subject=Partner%20worden%20bij%20SIT`;
  const inner = (
    <>
      <span className="sbus-via l" aria-hidden="true" />
      <span className="sbus-via r" aria-hidden="true" />
      <span className="sbus-solder" aria-hidden="true" />
      <div className="sbus-spot" aria-hidden="true" />
      <span className="sbus-slot-icon" aria-hidden="true">
        <Plus size={20} strokeWidth={2} />
      </span>
      <span className="sbus-slot-cmd">
        <span className="g">$</span> {t("slotCmd")}
        <span className="cur" aria-hidden="true" />
      </span>
      <span className="sbus-slot-sub">{t("slotSub")}</span>
    </>
  );
  if (decorative) {
    return (
      <div className="sbus-chip sbus-slot t-partner" aria-hidden="true">
        {inner}
      </div>
    );
  }
  return (
    <a className="sbus-chip sbus-slot t-partner" href={href}>
      {inner}
    </a>
  );
}

export default function SponsorShowcase() {
  const t = useTranslations("sponsorShowcase");
  const ref = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  // One IntersectionObserver: trigger the TextScramble + staggered chip reveal.
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  // Cursor spotlight + subtle 3D tilt on chips (pointer-driven, no rAF loop).
  // Attaches to every chip (real + clone) so hovering any card lights it up.
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const reduce =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.documentElement.classList.contains("reduce-motion");
    const chips = Array.from(rail.querySelectorAll<HTMLElement>(".sbus-chip"));
    const cleanups: Array<() => void> = [];

    chips.forEach((chip) => {
      const move = (e: PointerEvent) => {
        const r = chip.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        chip.style.setProperty("--mx", `${px * 100}%`);
        chip.style.setProperty("--my", `${py * 100}%`);
        if (reduce) {
          chip.style.transform = "translateY(-5px)";
          return;
        }
        const rx = (0.5 - py) * TILT;
        const ry = (px - 0.5) * TILT;
        chip.style.transform = `translateY(-5px) perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      };
      const leave = () => {
        chip.style.transform = "";
      };
      chip.addEventListener("pointerenter", move);
      chip.addEventListener("pointermove", move);
      chip.addEventListener("pointerleave", leave);
      cleanups.push(() => {
        chip.removeEventListener("pointerenter", move);
        chip.removeEventListener("pointermove", move);
        chip.removeEventListener("pointerleave", leave);
      });
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  const connected = PARTNERS.length;

  // The marquee streams two identical sequences. The first carries the real,
  // focusable links; the second is an aria-hidden clone purely for the loop.
  const sequence = (decorative: boolean) => (
    <div className="sbus-seq" aria-hidden={decorative || undefined}>
      {ORDERED_PARTNERS.map((p) => (
        <PartnerChip
          key={`${decorative ? "clone" : "real"}-${p.slug}`}
          slug={p.slug}
          name={p.name}
          tier={p.tier}
          tagline={p.tagline}
          url={p.url}
          inView={inView}
          decorative={decorative}
        />
      ))}
      <SlotChip decorative={decorative} />
    </div>
  );

  return (
    <section
      ref={ref}
      id="partners"
      className="sbus relative py-24 md:py-32 overflow-hidden"
    >
      {/* Background shield — keeps section darkness consistent over the circuit bg */}
      <div className="absolute inset-0 bg-[var(--color-bg)]/70 pointer-events-none" />

      {/* Faint PCB substrate + live traces feeding the bus */}
      <div className="sbus-pcb" aria-hidden="true">
        <div className="sbus-pcb-glow" />
        <svg viewBox="0 0 1280 460" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="sbus-trace" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#F29E18" stopOpacity="0" />
              <stop offset="0.5" stopColor="#F29E18" stopOpacity="0.5" />
              <stop offset="1" stopColor="#3B82F6" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g stroke="#1F1F23" strokeWidth="1.2" fill="none" opacity="0.7">
            <path d="M120 70 V210 H300" />
            <path d="M1160 80 V230 H980" />
            <path d="M120 390 V250 H360" />
            <path d="M1160 380 V250 H940" />
            <path d="M640 40 V230" />
          </g>
          <g fill="#1F1F23">
            <circle cx="300" cy="210" r="3" />
            <circle cx="980" cy="230" r="3" />
            <circle cx="360" cy="250" r="3" />
            <circle cx="640" cy="230" r="3" />
          </g>
          <path
            className="sbus-live-trace"
            d="M120 70 V210 H300"
            stroke="url(#sbus-trace)"
            strokeWidth="1.6"
            fill="none"
          />
          <path
            className="sbus-live-trace"
            style={{ animationDelay: "1.6s" }}
            d="M1160 80 V230 H980"
            stroke="url(#sbus-trace)"
            strokeWidth="1.6"
            fill="none"
          />
          <path
            className="sbus-live-trace"
            style={{ animationDelay: "2.8s" }}
            d="M120 390 V250 H360"
            stroke="url(#sbus-trace)"
            strokeWidth="1.6"
            fill="none"
          />
        </svg>
      </div>

      <div className="relative z-[1]">
        {/* ── Header (padded) ── */}
        <div className="px-6 md:px-12 lg:px-24">
          <div className="mb-7 md:mb-9">
            <div className="flex items-center gap-4 mb-4">
              <span className="font-mono text-xs text-[var(--color-accent-gold)] tracking-[0.3em] uppercase">
                06
              </span>
              <span className="w-12 h-px bg-[var(--color-accent-gold)]" />
            </div>
            <TextScramble
              as="h2"
              className="font-display text-2xl md:text-3xl font-bold text-[var(--color-text)] tracking-tight uppercase"
              trigger={inView}
              duration={0.6}
              speed={0.03}
              characterSet="#{}/<>[]!@$%^&*"
            >
              {t("heading")}
            </TextScramble>
          </div>

          {/* Code-style subheader */}
          <div
            className="font-mono text-xs"
            style={{ color: "var(--color-text-muted)" }}
          >
            <span style={{ color: "var(--color-accent-green)" }}>{"// "}</span>
            {t("subPre")}
            <span className="text-[#52525B]"> · </span>
            <span style={{ color: "var(--color-text)" }}>{connected}</span> {t("subConnected")}
            <span className="text-[#52525B]"> · </span>
            {t("subStudents")}
          </div>
        </div>

        {/* ── THE BUS — auto-scrolling marquee (full-bleed) ── */}
        <div className="sbus-track">
          {/* the soldered copper bus line with travelling current (static layer) */}
          <span className="sbus-line" aria-hidden="true" />

          <div
            ref={railRef}
            className={`sbus-marquee${inView ? " in" : ""}`}
          >
            <div className="sbus-stream">
              {sequence(false)}
              {sequence(true)}
            </div>
          </div>
        </div>

        {/* ── Legend + CTA (padded) ── */}
        <div className="px-6 md:px-12 lg:px-24 mt-9 md:mt-11 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="sbus-legend">
            <span className="g">{t("legend")}</span>
            {TIER_ORDER.filter((t) => t !== "hoofdsponsor").map((t) => (
              <span className="tier" key={t}>
                <i style={{ background: TIER_META[t].color }} aria-hidden="true" />
                {TIER_META[t].label.charAt(0) +
                  TIER_META[t].label.slice(1).toLowerCase()}
              </span>
            ))}
          </div>

          <a
            href="/partners"
            className="group inline-flex items-center gap-2 font-mono text-sm text-[var(--color-accent-gold)] hover:text-[var(--color-text)] transition-colors duration-300 self-start md:self-auto"
          >
            <span style={{ color: "var(--color-accent-green)" }}>$</span>
            <span>{t("cta")}</span>
            <ArrowRight
              size={15}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </a>
        </div>
      </div>
    </section>
  );
}
