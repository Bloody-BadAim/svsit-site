"use client";

import React from "react";
import { Star, Check, X } from "lucide-react";
import { ROLLEN } from "@/lib/constants";
import { getLevelForXp, getLevelProgress, getBadgeSlotCount } from "@/lib/levelEngine";
import type { Role } from "@/types/database";
import QRCode from "react-qr-code";
import { getSkin } from "@/lib/cardSkins";
import BadgeIcon from "@/components/badges/BadgeIcon";
import { getBadgeDef, getRarityColor } from "@/lib/badgeDefs";
import { PET_MAP } from "@/components/pets";

// Maps DB effect names (case-insensitive) to internal render keys
const EFFECT_MAP: Record<string, string> = {
  sparkle: "sparkles",
  sparkles: "sparkles",
  "matrix rain": "matrix",
  matrix: "matrix",
  snow: "snow",
  scanlines: "scanlines",
  smoke: "smoke",
};

const BARCODE_BARS = [
  2, 1, 3, 1, 2, 1, 1, 3, 2, 1, 3, 1, 1, 2, 1, 3, 1, 2, 2, 1, 1, 3, 1, 2, 1, 1, 3, 2, 1, 2,
];
const BARCODE_OPACITIES = [
  0.7, 0.4, 0.8, 0.5, 0.6, 0.3, 0.7, 0.9, 0.5, 0.4, 0.8, 0.6, 0.3, 0.7, 0.5, 0.9, 0.4, 0.6,
  0.8, 0.3, 0.7, 0.5, 0.4, 0.8, 0.6, 0.3, 0.9, 0.5, 0.7, 0.4,
];

const DEFAULT_STATS = [
  { label: "code", color: "var(--color-accent-green)", fill: 65 },
  { label: "social", color: "var(--color-accent-gold)", fill: 45 },
  { label: "chaos", color: "var(--color-accent-red)", fill: 80 },
];

const DEFAULT_BADGES = [
  { unlocked: true, label: "Joined" },
  { unlocked: false, label: "First Event" },
  { unlocked: false, label: "Hackathon" },
  { unlocked: false, label: "Legend" },
];

export interface MemberCardData {
  name: string;
  role: Role;
  commissie: string | null;
  total_xp: number;
  memberId?: string;
  email?: string;
  stats?: { label: string; color: string; fill: number }[];
  badges?: { unlocked: boolean; label: string }[];
  skin?: string;
  activeBadges?: string[];
  dynamicStats?: { code: number; social: number; learn: number; impact: number };
}

export interface MemberCardEquipment {
  frameColor?: string;
  petEmoji?: string;
  effectName?: string;
  stickers?: Array<{ id: string; x: number; y: number; emoji: string }>;
  accentColor?: string;
  customTitle?: string;
}

export default function MemberCard({
  className = "",
  style,
  children,
  data,
  showQR = false,
  equipment,
}: {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  data?: MemberCardData;
  showQR?: boolean;
  equipment?: MemberCardEquipment;
}) {
  // Placeholder or real data
  const name = data?.name || "Jouw Naam";
  const role = data?.role || "member";
  const commissie = data?.commissie;
  const points = data?.total_xp ?? 0;
  const levelDef = getLevelForXp(points);
  const levelProg = getLevelProgress(points);
  const xpPercent = levelProg.percent;
  const rolLabel = data ? (ROLLEN[role]?.naam || role) : "Undecided";
  const isPlaceholder = !data;

  // Skin
  const skinDef = getSkin(data?.skin || "default");

  // Stats: dynamicStats > data.stats > DEFAULT_STATS
  const stats = data?.dynamicStats
    ? [
        { label: "CODE", color: "var(--color-accent-green)", fill: Math.min(data.dynamicStats.code * 10, 100) },
        { label: "SOCIAL", color: "var(--color-accent-green)", fill: Math.min(data.dynamicStats.social * 10, 100) },
        { label: "LEARN", color: "var(--color-accent-gold)", fill: Math.min(data.dynamicStats.learn * 10, 100) },
        { label: "IMPACT", color: "var(--color-accent-red)", fill: Math.min(data.dynamicStats.impact * 10, 100) },
      ]
    : (data?.stats || DEFAULT_STATS);

  // Badges: activeBadges prop > data.badges > DEFAULT_BADGES
  const activeBadges = data?.activeBadges;
  const badges = data?.badges || DEFAULT_BADGES;

  // Border wrapper: frame color overrides default skin border
  const frameColor = equipment?.frameColor;
  // For animated skins, we render a rotating child div using transform: rotate()
  // (GPU-composited) instead of animating --border-angle on the background property.
  const borderWrapperStyle: React.CSSProperties = frameColor
    ? {
        background: frameColor,
        boxShadow: `0 0 16px 2px ${frameColor}66, 0 0 32px 4px ${frameColor}33`,
      }
    : {
        background: skinDef.animated ? "transparent" : skinDef.border,
      };

  // XP bar color: accentColor override or default gold
  const xpBarColor = equipment?.accentColor
    ? `linear-gradient(90deg, ${equipment.accentColor}, ${equipment.accentColor}CC)`
    : "linear-gradient(90deg, var(--color-accent-gold), #FBBF24)";
  const xpBarGlow = equipment?.accentColor
    ? `0 0 8px ${equipment.accentColor}66`
    : "0 0 8px rgba(245, 158, 11, 0.4)";

  // Visible stickers: max 3
  const visibleStickers = equipment?.stickers?.slice(0, 3) ?? [];

  const qrData = data?.memberId
    ? JSON.stringify({ id: data.memberId, email: data.email })
    : "";

  return (
    <div className={`relative ${className}`} style={style}>
      {/* Glow */}
      <div
        className="absolute -inset-6 pointer-events-none"
        aria-hidden="true"
        style={{
          background: `radial-gradient(ellipse at center, ${skinDef.glowColor} 0%, transparent 70%)`,
        }}
      />

      {/* Gradient border */}
      <div
        className="relative p-[2px] overflow-hidden"
        style={borderWrapperStyle}
      >
        {/* Animated border: rotating conic gradient using transform (GPU composited) */}
        {!frameColor && skinDef.animated && (
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              background: skinDef.border,
              animation: "borderTrailRotate 8s linear infinite",
              willChange: "transform",
              transformOrigin: "center center",
            }}
          />
        )}
        {/* Card body */}
        <div
          className="relative overflow-hidden"
          style={{
            background: skinDef.background,
            backdropFilter: "blur(8px)",
          }}
        >
          {/* Shine */}
          <div
            className="absolute inset-0 pointer-events-none z-10"
            aria-hidden="true"
            style={{
              background:
                "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.04) 40%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.04) 60%, transparent 70%)",
              willChange: "transform",
              ...(skinDef.animated ? { animation: "cardShine 6s ease-in-out infinite" } : {}),
            }}
          />

          {/* Noise */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            aria-hidden="true"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              backgroundRepeat: "repeat",
              backgroundSize: "128px 128px",
            }}
          />

          {/* Skin overlay pattern */}
          {skinDef.overlay && (
            <div
              className="absolute inset-0 pointer-events-none z-[5]"
              aria-hidden="true"
              style={{
                backgroundImage: skinDef.overlay,
                backgroundSize: skinDef.overlay.includes('radial') ? '16px 16px' : undefined,
                opacity: skinDef.overlayOpacity ?? 0.5,
              }}
            />
          )}

          {/* Inner border frame */}
          <div
            className="absolute pointer-events-none z-20"
            aria-hidden="true"
            style={{ inset: 10, border: `1px solid ${skinDef.innerBorder || 'rgba(255,255,255,0.05)'}` }}
          />

          {/* Frame corner decorations — only if frame equipped */}
          {equipment?.frameColor && (
            <>
              {/* Top-left corner bracket */}
              <div style={{
                position: 'absolute', top: 6, left: 6, width: 16, height: 16, zIndex: 25,
                borderTop: `2px solid ${equipment.frameColor}`,
                borderLeft: `2px solid ${equipment.frameColor}`,
                opacity: 0.7,
                pointerEvents: 'none',
              }} aria-hidden="true" />
              {/* Top-right corner bracket */}
              <div style={{
                position: 'absolute', top: 6, right: 6, width: 16, height: 16, zIndex: 25,
                borderTop: `2px solid ${equipment.frameColor}`,
                borderRight: `2px solid ${equipment.frameColor}`,
                opacity: 0.7,
                pointerEvents: 'none',
              }} aria-hidden="true" />
              {/* Bottom-left corner bracket */}
              <div style={{
                position: 'absolute', bottom: 6, left: 6, width: 16, height: 16, zIndex: 25,
                borderBottom: `2px solid ${equipment.frameColor}`,
                borderLeft: `2px solid ${equipment.frameColor}`,
                opacity: 0.7,
                pointerEvents: 'none',
              }} aria-hidden="true" />
              {/* Bottom-right corner bracket */}
              <div style={{
                position: 'absolute', bottom: 6, right: 6, width: 16, height: 16, zIndex: 25,
                borderBottom: `2px solid ${equipment.frameColor}`,
                borderRight: `2px solid ${equipment.frameColor}`,
                opacity: 0.7,
                pointerEvents: 'none',
              }} aria-hidden="true" />
              {/* Center horizontal lines */}
              <div style={{
                position: 'absolute', left: 6, right: 6, top: '50%', height: 1, zIndex: 25,
                background: `linear-gradient(90deg, ${equipment.frameColor}33, transparent 20%, transparent 80%, ${equipment.frameColor}33)`,
                pointerEvents: 'none',
              }} aria-hidden="true" />
            </>
          )}

          {/* Skin stamp */}
          {skinDef.stamp && (
            <div
              className="absolute top-4 right-4 z-20 font-mono text-[8px] font-bold uppercase tracking-[0.2em] pointer-events-none"
              aria-hidden="true"
              style={{ color: skinDef.accent, opacity: 0.3 }}
            >
              {skinDef.stamp}
            </div>
          )}

          {/* ── Header ── */}
          <div
            className="flex items-center justify-between border-b relative"
            style={{ padding: "20px 32px", borderColor: "rgba(255,255,255,0.06)" }}
          >
            {/* Header accent line */}
            {skinDef.headerGradient && (
              <div
                className="absolute bottom-0 left-0 right-0 h-[1px]"
                style={{ background: skinDef.headerGradient, opacity: 0.4 }}
              />
            )}
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.15em]">
              <span className="text-[var(--color-accent-gold)]">{"{"}</span>
              <span className="text-[var(--color-text)]">SIT</span>
              <span className="text-[var(--color-accent-gold)]">{"}"}</span>
              <span className="text-[var(--color-text-muted)] ml-1.5">MEMBER CARD</span>
            </span>
            <span className="font-mono text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider opacity-60">
              Bestuur XI
            </span>
          </div>

          {/* ── Content ── */}
          <div className="relative z-20" style={{ padding: "32px 32px 28px" }}>
            {/* Avatar/QR + player info */}
            <div className="flex items-start gap-4 mb-7">
              {/* Avatar or QR */}
              <div
                className="w-20 h-20 shrink-0 flex items-center justify-center overflow-hidden"
                style={{
                  background: showQR && qrData ? "#ffffff" : "rgba(255,255,255,0.03)",
                  border: showQR && qrData ? "none" : "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 8,
                  position: 'relative',
                }}
              >
                {showQR && qrData ? (
                  <QRCode
                    value={qrData}
                    size={72}
                    level="M"
                    bgColor="#ffffff"
                    fgColor="#09090B"
                  />
                ) : visibleStickers.length > 0 ? (
                  <span style={{ fontSize: 36, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }}>
                    {visibleStickers[0].emoji}
                  </span>
                ) : (
                  <span style={{
                    fontSize: 24, fontWeight: 'bold', fontFamily: 'monospace',
                    color: 'rgba(255,255,255,0.15)', letterSpacing: 2,
                  }}>
                    {isPlaceholder ? "??" : (data?.name || '??').slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-col gap-1 min-w-0 pt-0.5">
                <span className="font-mono text-base text-[var(--color-text)] font-bold tracking-wide">
                  {name}
                </span>
                {equipment?.customTitle && (
                  <span
                    className="font-mono text-[10px] uppercase tracking-[0.15em]"
                    style={{ color: equipment.accentColor ?? "var(--color-accent-gold)", opacity: 0.8 }}
                  >
                    {equipment.customTitle}
                  </span>
                )}
                <span className="font-mono text-[11px] text-[var(--color-text-muted)]">
                  CLASS:{" "}
                  <span className={isPlaceholder ? "opacity-50" : ""}>
                    {rolLabel}
                  </span>
                </span>
                {commissie && (
                  <span className="font-mono text-[10px] text-[var(--color-text-muted)]">
                    GUILD:{" "}
                    <span style={{ color: "var(--color-accent-blue)" }}>
                      {commissie}
                    </span>
                  </span>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-[11px] text-[var(--color-accent-gold)] font-bold">
                    LVL {String(levelDef.level).padStart(2, "0")}
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[11px]" style={{ color: levelDef.color }}>
                    <Star size={10} fill="currentColor" />
                    {levelDef.title.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* XP Bar */}
            <div className="mb-7">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">
                  Experience
                </span>
                <span className="font-mono text-[10px] text-[var(--color-text-muted)]">
                  {levelProg.current} / {levelProg.max} xp
                </span>
              </div>
              <div
                className="h-2 w-full overflow-hidden"
                style={{ background: "rgba(255,255,255,0.05)" }}
              >
                <div
                  className="h-full transition-[width] duration-700"
                  style={{
                    width: `${xpPercent}%`,
                    background: xpBarColor,
                    boxShadow: xpBarGlow,
                  }}
                />
              </div>
            </div>

            {/* Stats section */}
            <div className="mb-7">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="h-px flex-1"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                />
                <span className="font-mono text-[9px] text-[var(--color-text-muted)] uppercase tracking-[0.2em]">
                  Stats
                </span>
                <div
                  className="h-px flex-1"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                />
              </div>

              <div className="flex flex-col gap-2.5">
                {stats.map((stat) => (
                  <div key={stat.label} className="flex items-center gap-3">
                    <span className="font-mono text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider w-12">
                      {stat.label}
                    </span>
                    <div
                      className="flex-1 h-1.5 overflow-hidden"
                      style={{ background: "rgba(255,255,255,0.05)" }}
                    >
                      <div
                        className="h-full transition-[width] duration-700"
                        style={{
                          width: `${stat.fill}%`,
                          background: stat.color,
                          opacity: isPlaceholder ? 0.3 : 0.7,
                        }}
                      />
                    </div>
                    <span className="font-mono text-[10px] text-[var(--color-text-muted)] opacity-40 w-8 text-right">
                      {isPlaceholder ? "?/10" : `${Math.round(stat.fill / 10)}/10`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Badges section */}
            <div className="mb-7">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="h-px flex-1"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                />
                <span className="font-mono text-[9px] text-[var(--color-text-muted)] uppercase tracking-[0.2em]">
                  Badges
                </span>
                <div
                  className="h-px flex-1"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                />
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {activeBadges
                  ? (() => {
                      const badgeSlots = Math.max(activeBadges.length, getBadgeSlotCount(levelDef.level));
                      const slots: React.ReactNode[] = activeBadges
                        .map((badgeId) => {
                          const badgeDef = getBadgeDef(badgeId);
                          const rarity = badgeDef?.rarity ?? 'common';
                          const rarityColor = getRarityColor(rarity);
                          return (
                            <div
                              key={badgeId}
                              style={{
                                borderRadius: 2,
                                boxShadow: `0 0 8px ${rarityColor}66`,
                                display: 'inline-flex',
                              }}
                            >
                              <BadgeIcon badgeId={badgeId} size={16} locked={false} rarity={rarity} />
                            </div>
                          );
                        });
                      for (let i = slots.length; i < badgeSlots; i++) {
                        slots.push(
                          <BadgeIcon key={`locked-${i}`} badgeId="badge_joined" size={16} locked={true} />
                        );
                      }
                      return slots;
                    })()
                  : badges.map((badge, i) => (
                      <div
                        key={i}
                        className="w-7 h-7 flex items-center justify-center"
                        title={badge.label}
                        style={{
                          border: badge.unlocked
                            ? "1px solid var(--color-accent-gold)"
                            : "1px dashed rgba(255,255,255,0.08)",
                          background: badge.unlocked
                            ? "rgba(245, 158, 11, 0.08)"
                            : "transparent",
                        }}
                      >
                        {badge.unlocked ? (
                          <Check
                            className="w-2.5 h-2.5 text-[var(--color-accent-gold)]"
                            aria-hidden="true"
                          />
                        ) : (
                          <X
                            className="w-2.5 h-2.5 text-[var(--color-text-muted)] opacity-20"
                            aria-hidden="true"
                          />
                        )}
                      </div>
                    ))}
              </div>
            </div>

            {/* Separator */}
            <div
              className="h-px mb-6"
              style={{
                background:
                  "linear-gradient(to right, var(--color-accent-gold), rgba(255,255,255,0.06), transparent)",
                opacity: 0.2,
              }}
            />

            {/* Barcode */}
            <div className="flex items-end gap-[1px] h-10 mb-2">
              {BARCODE_BARS.map((width, i) => (
                <div
                  key={i}
                  style={{
                    width,
                    height: `${60 + (i % 3) * 15}%`,
                    background: skinDef.accent,
                    opacity: BARCODE_OPACITIES[i],
                  }}
                />
              ))}
            </div>

            {/* Card ID + Amsterdam marks */}
            <div className="flex items-center justify-between mb-8">
              <span className="font-mono text-[10px] text-[var(--color-text-muted)] tracking-[0.2em] opacity-50">
                SIT-2026-2027
              </span>
              <span className="flex items-center gap-1.5" aria-hidden="true">
                <span className="text-[var(--color-accent-red)] text-[10px] font-bold">×</span>
                <span className="text-[var(--color-accent-green)] text-[10px] font-bold">×</span>
                <span className="text-[var(--color-accent-blue)] text-[10px] font-bold">×</span>
              </span>
            </div>

            {/* CTA slot */}
            {children && <div className="relative z-30 flex flex-col items-center">{children}</div>}
          </div>

          {/* ── Accessory: Stickers (z-40, absolutely positioned) ── */}
          {visibleStickers.map((sticker) => (
            <div
              key={sticker.id}
              className="absolute pointer-events-none select-none z-40"
              aria-hidden="true"
              style={{
                left: `${sticker.x}%`,
                top: `${sticker.y}%`,
                transform: "translate(-50%, -50%)",
                fontSize: 22,
                lineHeight: 1,
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.6))",
              }}
            >
              {sticker.emoji}
            </div>
          ))}

          {/* ── Accessory: Pet (bottom-right corner, z-40) ── */}
          {equipment?.petEmoji && (() => {
            const PetComponent = PET_MAP[equipment.petEmoji];
            return (
              <div
                className="absolute bottom-3 right-3 pointer-events-none select-none z-40"
                aria-hidden="true"
                style={{
                  animation: "petBounce 1.8s ease-in-out infinite",
                  filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.7))",
                  ...(PetComponent ? {} : { fontSize: 26, lineHeight: 1 }),
                }}
              >
                {PetComponent ? <PetComponent size={36} /> : equipment.petEmoji}
              </div>
            );
          })()}

          {/* ── Accessory: Effect overlay (z-50, pointer-events none) ── */}
          {(() => {
            const effectKey = equipment?.effectName
              ? (EFFECT_MAP[equipment.effectName.toLowerCase()] ?? equipment.effectName.toLowerCase())
              : null
            if (!effectKey) return null
            return (
              <>
                {effectKey === "sparkles" && (
                  <div
                    className="absolute inset-0 pointer-events-none z-50 overflow-hidden"
                    aria-hidden="true"
                    style={{ animation: "sparklesFade 3s ease-in-out infinite" }}
                  >
                    {([
                      [12, 18], [28, 42], [55, 12], [72, 35], [88, 60],
                      [40, 70], [65, 85], [20, 80], [80, 22], [50, 50],
                    ] as [number, number][]).map(([x, y], i) => (
                      <div
                        key={i}
                        className="absolute rounded-full"
                        style={{
                          left: `${x}%`,
                          top: `${y}%`,
                          width: i % 3 === 0 ? 3 : 2,
                          height: i % 3 === 0 ? 3 : 2,
                          background: equipment?.accentColor ?? "#FBBF24",
                          opacity: 0,
                          animation: `sparkleDot 2.4s ease-in-out ${(i * 0.22).toFixed(2)}s infinite`,
                        }}
                      />
                    ))}
                  </div>
                )}

                {effectKey === "matrix" && (
                  <div
                    className="absolute inset-0 pointer-events-none z-50 overflow-hidden"
                    aria-hidden="true"
                  >
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div
                        key={i}
                        className="absolute flex flex-col gap-px items-center"
                        style={{
                          left: `${i * 10 + 2}%`,
                          top: 0,
                          animation: `matrixRain ${2.5 + i * 0.35}s linear infinite`,
                          animationDelay: `${(i * 0.2).toFixed(2)}s`,
                        }}
                      >
                        {Array.from({ length: 8 }).map((_, j) => (
                          <span
                            key={j}
                            className="font-mono leading-none select-none"
                            style={{
                              fontSize: 9,
                              color: "#22C55E",
                              opacity: 0.08 + j * 0.04,
                              textShadow: j >= 6 ? "0 0 4px rgba(34,197,94,0.4)" : undefined,
                            }}
                          >
                            {String.fromCharCode(0x30A0 + ((i * 7 + j * 13) % 96))}
                          </span>
                        ))}
                      </div>
                    ))}
                    <div
                      className="absolute inset-0"
                      style={{ background: "rgba(0,255,70,0.02)" }}
                    />
                  </div>
                )}

                {effectKey === "snow" && (
                  <div
                    className="absolute inset-0 pointer-events-none z-50 overflow-hidden"
                    aria-hidden="true"
                  >
                    {([
                      [10, -5], [25, -10], [40, -3], [55, -8], [70, -2],
                      [85, -6], [18, -12], [60, -4], [78, -9], [33, -7],
                      [47, -1], [90, -11], [5, -5], [63, -8], [82, -3],
                    ] as [number, number][]).map(([x, startY], i) => (
                      <div
                        key={i}
                        className="absolute rounded-full"
                        style={{
                          left: `${x}%`,
                          top: `${startY}%`,
                          width: i % 3 === 0 ? 3 : 2,
                          height: i % 3 === 0 ? 3 : 2,
                          background: "rgba(255,255,255,0.7)",
                          animation: `snowFall ${3 + (i % 4)}s linear ${(i * 0.3).toFixed(2)}s infinite`,
                        }}
                      />
                    ))}
                  </div>
                )}

                {effectKey === "scanlines" && (
                  <div
                    className="absolute inset-0 pointer-events-none z-50 overflow-hidden"
                    aria-hidden="true"
                    style={{
                      background:
                        "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.04) 3px, rgba(255,255,255,0.04) 4px)",
                      animation: "scanlinesDrift 8s linear infinite",
                    }}
                  />
                )}

                {effectKey === "smoke" && (
                  <div
                    className="absolute inset-0 pointer-events-none z-50 overflow-hidden"
                    aria-hidden="true"
                  >
                    {[20, 40, 60, 80, 30, 70, 50].map((x, i) => (
                      <div
                        key={i}
                        className="absolute rounded-full"
                        style={{
                          left: `${x}%`,
                          bottom: 0,
                          width: 18 + (i % 3) * 8,
                          height: 18 + (i % 3) * 8,
                          background:
                            "radial-gradient(ellipse at center, rgba(160,160,160,0.18) 0%, transparent 70%)",
                          animation: `smokeRise ${4 + (i % 3)}s ease-out ${(i * 0.5).toFixed(2)}s infinite`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </>
            )
          })()}
        </div>
      </div>
    </div>
  );
}
