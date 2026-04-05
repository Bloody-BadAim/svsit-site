"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  bestuur,
  commissies,
  getPersonById,
  getPersonCommissies,
  getCommissieMembers,
  type Person,
  type Commissie,
} from "./orgData";

// ═══════════════════════════════════════════════════════════
//  OrgTree — RPG Skill Tree Style Organisation Chart
// ═══════════════════════════════════════════════════════════

// Color map for bestuur → commissie connections
const BESTUUR_COLORS = ["#F59E0B", "#3B82F6", "#EF4444", "#22C55E"];

export default function OrgTree() {
  const sectionRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredPerson, setHoveredPerson] = useState<string | null>(null);
  const [hoveredCommissie, setHoveredCommissie] = useState<string | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);

  // GSAP entry animations
  useEffect(() => {
    if (!sectionRef.current) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Bestuur nodes stagger
      gsap.fromTo(
        "[data-bestuur-node]",
        { autoAlpha: 0, y: 30, scale: 0.9 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.15,
          ease: "back.out(1.4)",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            toggleActions: "play none none none",
          },
        }
      );

      // SVG lines draw-on
      gsap.fromTo(
        "[data-connection-line]",
        { strokeDashoffset: 200 },
        {
          strokeDashoffset: 0,
          duration: 1.2,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: "[data-connections-svg]",
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );

      // Commissie clusters stagger
      gsap.fromTo(
        "[data-commissie-cluster]",
        { autoAlpha: 0, y: 40 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "[data-commissie-grid]",
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Determine which nodes are "connected" to hovered item
  const isConnected = useCallback(
    (personId: string, commissieId?: string) => {
      if (!hoveredPerson && !hoveredCommissie) return true;

      if (hoveredPerson) {
        if (personId === hoveredPerson) return true;
        const person = getPersonById(hoveredPerson);
        if (!person) return false;
        if (commissieId) return person.commissies.includes(commissieId);
        const target = getPersonById(personId);
        if (!target) return false;
        return target.commissies.some((c) => person.commissies.includes(c));
      }

      if (hoveredCommissie) {
        const members = getCommissieMembers(hoveredCommissie);
        if (commissieId === hoveredCommissie) return true;
        return members.some((m) => m.id === personId);
      }

      return true;
    },
    [hoveredPerson, hoveredCommissie]
  );

  // Check if a specific connection line should glow
  const isLineActive = useCallback(
    (bestuurId: string, commissieId: string) => {
      if (!hoveredPerson && !hoveredCommissie) return false;
      if (hoveredPerson === bestuurId) {
        const person = getPersonById(bestuurId);
        return person?.commissies.includes(commissieId) ?? false;
      }
      if (hoveredCommissie === commissieId) {
        const person = getPersonById(bestuurId);
        return person?.commissies.includes(commissieId) ?? false;
      }
      return false;
    },
    [hoveredPerson, hoveredCommissie]
  );

  const handlePersonClick = useCallback((id: string) => {
    setSelectedPerson((prev) => (prev === id ? null : id));
  }, []);

  // Build connection data: bestuur member → their commissies
  const connections: { bestuurIdx: number; commissieIdx: number; color: string; bestuurId: string; commissieId: string }[] = [];
  bestuur.forEach((person, bIdx) => {
    person.commissies.forEach((cId) => {
      const cIdx = commissies.findIndex((c) => c.id === cId);
      if (cIdx !== -1) {
        connections.push({
          bestuurIdx: bIdx,
          commissieIdx: cIdx,
          color: person.accentColor,
          bestuurId: person.id,
          commissieId: cId,
        });
      }
    });
  });

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen py-32 md:py-40 px-6 md:px-12 lg:px-24"
    >
      {/* ── Background: Grid + Ambient glows ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(245, 158, 11, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(245, 158, 11, 0.02) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 30%, black 20%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 30%, black 20%, transparent 70%)",
        }}
      />

      {/* Ambient glow orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div
          className="absolute rounded-full blur-[120px]"
          style={{ top: "10%", left: "5%", width: "30%", height: "25%", background: "rgba(245, 158, 11, 0.06)" }}
        />
        <div
          className="absolute rounded-full blur-[100px]"
          style={{ top: "40%", right: "5%", width: "25%", height: "20%", background: "rgba(59, 130, 246, 0.05)" }}
        />
        <div
          className="absolute rounded-full blur-[100px]"
          style={{ bottom: "15%", left: "20%", width: "20%", height: "20%", background: "rgba(239, 68, 68, 0.04)" }}
        />
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto">
        {/* ── Header ── */}
        <div className="mb-16 md:mb-24">
          <div className="flex items-center gap-4 mb-4">
            <span className="font-mono text-xs text-[var(--color-accent-gold)] tracking-[0.3em] uppercase">
              03
            </span>
            <span className="w-12 h-px bg-[var(--color-accent-gold)]" />
          </div>
          <h1
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold uppercase tracking-tight leading-[0.95]"
            style={{ fontFamily: "'Big Shoulders Display', var(--font-geist-sans), sans-serif" }}
          >
            De{" "}
            <span className="text-[var(--color-accent-gold)]">Stamboom</span>
          </h1>
          <p className="font-mono text-base md:text-lg text-[var(--color-text-muted)] mt-6 max-w-lg leading-relaxed">
            Bestuur XI en de commissies die SIT draaiende houden.
            Klik op een naam voor meer info.
          </p>
        </div>

        {/* ── Bestuur Row ── */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-6">
            <span
              className="w-2 h-2 rounded-full bg-[var(--color-accent-gold)]"
              style={{ animation: "statusPulse 2s ease-in-out infinite" }}
            />
            <span className="font-mono text-xs text-[var(--color-accent-gold)] tracking-[0.2em] uppercase">
              Bestuur XI — Kern
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-[900px] mx-auto">
            {bestuur.map((person) => (
              <BestuurNode
                key={person.id}
                person={person}
                isConnected={isConnected(person.id)}
                isActive={hoveredPerson === person.id || selectedPerson === person.id}
                onHover={setHoveredPerson}
                onClick={handlePersonClick}
              />
            ))}
          </div>
        </div>

        {/* ── SVG Connection Lines (desktop only) ── */}
        <div className="hidden md:block relative" style={{ height: "120px" }}>
          <svg
            ref={svgRef}
            data-connections-svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              {/* Glow filters per color */}
              {BESTUUR_COLORS.map((color, i) => (
                <filter key={i} id={`glow-${i}`} x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              ))}
            </defs>

            {connections.map((conn, i) => {
              // Calculate start X (bestuur position: 4 columns)
              const startX = (conn.bestuurIdx + 0.5) * (1200 / 4);
              // Calculate end X (commissie position: 3 columns on desktop, wraps at row 3)
              const col = conn.commissieIdx % 3;
              const endX = (col + 0.5) * (1200 / 3);
              const active = isLineActive(conn.bestuurId, conn.commissieId);
              const anyHover = hoveredPerson !== null || hoveredCommissie !== null;
              const dimmed = anyHover && !active;

              // Curved path
              const midY = 60;
              const path = `M ${startX} 0 C ${startX} ${midY}, ${endX} ${midY}, ${endX} 120`;

              return (
                <g key={i}>
                  {/* Deep ambient glow */}
                  <path
                    d={path}
                    fill="none"
                    stroke={conn.color}
                    strokeWidth={active ? 6 : 3}
                    opacity={dimmed ? 0.03 : active ? 0.15 : 0.06}
                    filter={`url(#glow-${conn.bestuurIdx})`}
                    style={{ transition: "opacity 0.3s ease, stroke-width 0.3s ease" }}
                  />
                  {/* Core line */}
                  <path
                    data-connection-line
                    d={path}
                    fill="none"
                    stroke={conn.color}
                    strokeWidth={active ? 2 : 1}
                    strokeDasharray="200"
                    opacity={dimmed ? 0.05 : active ? 0.7 : 0.15}
                    style={{ transition: "opacity 0.3s ease, stroke-width 0.3s ease" }}
                  />
                  {/* Bright inner (active only) */}
                  {active && (
                    <path
                      d={path}
                      fill="none"
                      stroke="white"
                      strokeWidth={0.5}
                      opacity={0.4}
                      style={{ transition: "opacity 0.3s ease" }}
                    />
                  )}
                </g>
              );
            })}
          </svg>

          {/* Center label */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono text-[10px] text-[var(--color-text-muted)] tracking-[0.2em] uppercase bg-[var(--color-bg)] px-4 relative z-10">
              Commissies
            </span>
          </div>
        </div>

        {/* Mobile connection divider */}
        <div className="md:hidden flex items-center gap-3 my-8">
          <div
            className="flex-1 h-px"
            style={{
              background: "linear-gradient(to right, var(--color-accent-gold), var(--color-accent-blue), transparent)",
              opacity: 0.3,
            }}
          />
          <span className="font-mono text-[10px] text-[var(--color-text-muted)] tracking-[0.2em] uppercase shrink-0">
            Commissies
          </span>
          <div
            className="flex-1 h-px"
            style={{
              background: "linear-gradient(to left, var(--color-accent-red), var(--color-accent-green), transparent)",
              opacity: 0.3,
            }}
          />
        </div>

        {/* ── Commissie Grid ── */}
        <div
          data-commissie-grid
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 mb-16 md:mb-24 max-w-[1000px] mx-auto"
        >
          {commissies.map((commissie) => (
            <CommissieCluster
              key={commissie.id}
              commissie={commissie}
              isConnected={isConnected("", commissie.id)}
              isActive={hoveredCommissie === commissie.id}
              hoveredPerson={hoveredPerson}
              onHoverCommissie={setHoveredCommissie}
              onHoverPerson={setHoveredPerson}
              onClickPerson={handlePersonClick}
              isPersonConnected={isConnected}
            />
          ))}
        </div>
      </div>

        {/* ── Commissie Aanmelding CTA ── */}
        <div className="text-center mt-16 md:mt-24 pb-8">
          <h2
            className="text-2xl md:text-4xl font-bold uppercase tracking-tight mb-4"
            style={{ fontFamily: "'Big Shoulders Display', var(--font-geist-sans), sans-serif", color: 'var(--color-text)' }}
          >
            Wil je meedoen?
          </h2>
          <p className="font-mono text-sm md:text-base text-[var(--color-text-muted)] mb-8 max-w-md mx-auto leading-relaxed">
            Onze commissies zoeken altijd nieuwe leden.
            Geen ervaring nodig, alleen motivatie.
          </p>
          <a
            href="https://forms.office.com/Pages/ResponsePage.aspx?id=HrsHCfwhb0eIQwLQnOtZp5Gb5Qz7gPZNhhsylBIlKC9UN01YN1EzTEFBMVFaRkhNSVdOU1pDRVpRNC4u"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-4 font-mono font-bold text-base tracking-wide transition-transform hover:scale-[1.03]"
            style={{
              backgroundColor: 'var(--color-accent-gold)',
              color: 'var(--color-bg)',
            }}
          >
            MELD JE AAN
          </a>
          <p className="font-mono text-xs text-[#71717A] mt-4">
            Of stuur een mail naar{" "}
            <a href="mailto:bestuur@svsit.nl" className="hover:text-[var(--color-text)] transition-colors">
              bestuur@svsit.nl
            </a>
          </p>
        </div>

      {/* ── Selected Person Card Overlay ── */}
      <AnimatePresence>
        {selectedPerson && (
          <NodeCard
            personId={selectedPerson}
            onClose={() => setSelectedPerson(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════
//  BestuurNode — Hexagonal bestuurslid node
// ═══════════════════════════════════════════════════════════

function BestuurNode({
  person,
  isConnected,
  isActive,
  onHover,
  onClick,
}: {
  person: Person;
  isConnected: boolean;
  isActive: boolean;
  onHover: (id: string | null) => void;
  onClick: (id: string) => void;
}) {
  const initials = person.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <motion.button
      data-bestuur-node
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      onMouseEnter={() => onHover(person.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(person.id)}
      className="relative flex flex-col items-center gap-3 p-5 md:p-6 border cursor-pointer text-left w-full transition-all duration-300 focus-visible:outline-2 focus-visible:outline-[var(--color-accent-gold)] focus-visible:outline-offset-2"
      style={{
        borderColor: isActive ? person.accentColor : "var(--color-border)",
        background: isActive
          ? `color-mix(in srgb, ${person.accentColor} 5%, var(--color-surface))`
          : "var(--color-surface)",
        opacity: isConnected ? 1 : 0.25,
        boxShadow: isActive
          ? `0 0 20px color-mix(in srgb, ${person.accentColor} 20%, transparent), inset 0 1px 0 color-mix(in srgb, ${person.accentColor} 10%, transparent)`
          : "none",
      }}
      aria-label={`${person.name}, ${person.role}`}
    >
      {/* Active pulse ring */}
      {isActive && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            border: `1px solid ${person.accentColor}`,
            opacity: 0.3,
            animation: "statusPulse 2s ease-in-out infinite",
          }}
        />
      )}

      {/* Hex avatar */}
      <div
        className="relative w-14 h-14 md:w-16 md:h-16 flex items-center justify-center font-mono text-lg md:text-xl font-bold"
        style={{
          color: person.accentColor,
          background: `color-mix(in srgb, ${person.accentColor} 10%, transparent)`,
          border: `2px solid color-mix(in srgb, ${person.accentColor} 40%, transparent)`,
          clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
        }}
      >
        {initials}
      </div>

      {/* Name & role */}
      <div className="text-center">
        <p className="font-mono text-sm font-bold text-[var(--color-text)]">
          {person.name}
        </p>
        <p
          className="font-mono text-[10px] tracking-[0.1em] uppercase mt-0.5"
          style={{ color: person.accentColor }}
        >
          {person.role}
        </p>
      </div>

      {/* Commissie count badge */}
      <span
        className="font-mono text-[10px] tracking-[0.15em] uppercase"
        style={{ color: "var(--color-text-muted)" }}
      >
        {person.commissies.length} commissie{person.commissies.length !== 1 ? "s" : ""}
      </span>
    </motion.button>
  );
}

// ═══════════════════════════════════════════════════════════
//  CommissieIcon — SVG node icon per commissie
// ═══════════════════════════════════════════════════════════

function CommissieIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
      <circle cx="10" cy="10" r="8" stroke={color} strokeWidth="1" opacity="0.2" />
      <circle cx="10" cy="10" r="4" fill={color} opacity="0.8" />
      <circle cx="10" cy="10" r="1.5" fill="white" opacity="0.9" />
      <line x1="10" y1="2" x2="10" y2="0" stroke={color} strokeWidth="1" opacity="0.3" />
      <line x1="18" y1="10" x2="20" y2="10" stroke={color} strokeWidth="1" opacity="0.3" />
      <line x1="10" y1="18" x2="10" y2="20" stroke={color} strokeWidth="1" opacity="0.3" />
      <line x1="2" y1="10" x2="0" y2="10" stroke={color} strokeWidth="1" opacity="0.3" />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════
//  CommissieCluster — Commissie group with members
// ═══════════════════════════════════════════════════════════

function CommissieCluster({
  commissie,
  isConnected,
  isActive,
  hoveredPerson,
  onHoverCommissie,
  onHoverPerson,
  onClickPerson,
  isPersonConnected,
}: {
  commissie: Commissie;
  isConnected: boolean;
  isActive: boolean;
  hoveredPerson: string | null;
  onHoverCommissie: (id: string | null) => void;
  onHoverPerson: (id: string | null) => void;
  onClickPerson: (id: string) => void;
  isPersonConnected: (personId: string, commissieId?: string) => boolean;
}) {
  const allMemberIds = [...commissie.voorzitters, ...commissie.leden];
  const uniqueMembers = [...new Set(allMemberIds)];

  return (
    <div
      data-commissie-cluster
      className="relative border p-4 md:p-5 transition-all duration-300"
      style={{
        borderColor: isActive ? commissie.color : "var(--color-border)",
        background: isActive
          ? `color-mix(in srgb, ${commissie.color} 3%, var(--color-surface))`
          : "var(--color-surface)",
        opacity: isConnected ? 1 : 0.2,
        boxShadow: isActive
          ? `0 0 16px color-mix(in srgb, ${commissie.color} 15%, transparent)`
          : "none",
      }}
      onMouseEnter={() => onHoverCommissie(commissie.id)}
      onMouseLeave={() => onHoverCommissie(null)}
    >
      {/* Glow top accent */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: commissie.color,
          opacity: isActive ? 0.8 : 0.3,
          transition: "opacity 0.3s ease",
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CommissieIcon color={commissie.color} />
          <h3
            className="font-display text-base md:text-lg font-bold uppercase tracking-wide"
            style={{ color: commissie.color }}
          >
            {commissie.name}
          </h3>
        </div>
        {commissie.status && (
          <span
            className="font-mono text-[9px] px-2 py-0.5 tracking-[0.1em] uppercase"
            style={{
              color: commissie.color,
              border: `1px solid color-mix(in srgb, ${commissie.color} 30%, transparent)`,
              background: `color-mix(in srgb, ${commissie.color} 5%, transparent)`,
            }}
          >
            {commissie.status}
          </span>
        )}
      </div>

      {/* Members */}
      <div className="flex flex-wrap gap-2">
        {uniqueMembers.map((memberId) => {
          const person = getPersonById(memberId);
          if (!person) return null;
          const isVoorzitter = commissie.voorzitters.includes(memberId);
          const memberConnected = isPersonConnected(memberId, commissie.id);

          return (
            <motion.button
              key={memberId}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              onMouseEnter={() => onHoverPerson(memberId)}
              onMouseLeave={() => onHoverPerson(null)}
              onClick={() => onClickPerson(memberId)}
              className="flex items-center gap-2 px-3 py-1.5 border cursor-pointer transition-all duration-200 focus-visible:outline-2 focus-visible:outline-[var(--color-accent-gold)] focus-visible:outline-offset-1"
              style={{
                borderColor: hoveredPerson === memberId ? person.accentColor : "var(--color-border)",
                background: hoveredPerson === memberId
                  ? `color-mix(in srgb, ${person.accentColor} 8%, transparent)`
                  : "transparent",
                opacity: memberConnected ? 1 : 0.3,
              }}
              aria-label={`${person.name}${isVoorzitter ? " (voorzitter)" : ""}`}
            >
              {isVoorzitter && (
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: "#F59E0B" }}
                  title="Voorzitter"
                />
              )}
              <span className="font-mono text-xs text-[var(--color-text)]">
                {person.name.split(" ")[0]}
              </span>
              {person.type === "bestuur" && (
                <span
                  className="font-mono text-[8px] px-1 py-px uppercase tracking-wider"
                  style={{
                    color: person.accentColor,
                    border: `1px solid color-mix(in srgb, ${person.accentColor} 20%, transparent)`,
                  }}
                >
                  B
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  NodeCard — Expanded info overlay
// ═══════════════════════════════════════════════════════════

function NodeCard({
  personId,
  onClose,
}: {
  personId: string;
  onClose: () => void;
}) {
  const person = getPersonById(personId);
  if (!person) return null;

  const personCommissies = getPersonCommissies(personId);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-[var(--color-bg)]/80 backdrop-blur-sm" />

      <motion.div
        initial={{ scale: 0.95, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 10 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md border bg-[var(--color-surface)] overflow-hidden"
        style={{ borderColor: person.accentColor }}
      >
        <div className="h-1" style={{ background: person.accentColor }} />

        <div
          className="flex items-center justify-between px-5 py-3 border-b border-[var(--color-border)]"
          style={{ background: `color-mix(in srgb, ${person.accentColor} 3%, var(--color-bg))` }}
        >
          <span className="font-mono text-xs text-[var(--color-text-muted)]">
            {">"} person.inspect(
            <span style={{ color: person.accentColor }}>
              &quot;{person.name.split(" ")[0].toLowerCase()}&quot;
            </span>
            )
          </span>
          <button
            onClick={onClose}
            className="font-mono text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
            aria-label="Sluiten"
          >
            [×]
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 flex items-center justify-center font-mono text-xl font-bold shrink-0"
              style={{
                color: person.accentColor,
                background: `color-mix(in srgb, ${person.accentColor} 10%, transparent)`,
                border: `2px solid color-mix(in srgb, ${person.accentColor} 40%, transparent)`,
                clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
              }}
            >
              {person.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div>
              <h3 className="font-mono text-lg font-bold text-[var(--color-text)]">
                {person.name}
              </h3>
              {person.role && (
                <p className="font-mono text-sm" style={{ color: person.accentColor }}>
                  {person.role}
                </p>
              )}
              <p className="font-mono text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mt-0.5">
                {person.type === "bestuur" ? "Bestuur XI" : "Commissielid"}
              </p>
            </div>
          </div>

          {personCommissies.length > 0 && (
            <div>
              <p className="font-mono text-[10px] text-[var(--color-text-muted)] tracking-[0.2em] uppercase mb-2">
                Commissies
              </p>
              <div className="flex flex-wrap gap-2">
                {personCommissies.map((c) => {
                  const isVz =
                    c.voorzitters.includes(personId) ||
                    (person.voorzitterVan?.includes(c.id) ?? false);
                  return (
                    <span
                      key={c.id}
                      className="font-mono text-xs px-2.5 py-1 border"
                      style={{
                        color: c.color,
                        borderColor: `color-mix(in srgb, ${c.color} 30%, transparent)`,
                        background: `color-mix(in srgb, ${c.color} 5%, transparent)`,
                      }}
                    >
                      {c.name}
                      {isVz && (
                        <span className="ml-1 text-[var(--color-accent-gold)]">★</span>
                      )}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {person.contactVoor && person.contactVoor.length > 0 && (
            <div>
              <p className="font-mono text-[10px] text-[var(--color-text-muted)] tracking-[0.2em] uppercase mb-2">
                Contact voor
              </p>
              <div className="flex flex-wrap gap-1.5">
                {person.contactVoor.map((item) => (
                  <span
                    key={item}
                    className="font-mono text-xs px-2 py-0.5 text-[var(--color-text)] border border-[var(--color-border)] bg-[var(--color-bg)]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
