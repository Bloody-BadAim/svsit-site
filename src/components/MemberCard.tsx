"use client";

import { Star } from "lucide-react";
import { getRank, ROLLEN, getLevel, getLevelProgress, getBadgeSlotCount } from "@/lib/constants";
import type { Role } from "@/types/database";
import QRCode from "react-qr-code";
import { getSkin } from "@/lib/cardSkins";
import BadgeIcon from "@/components/badges/BadgeIcon";

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
  points: number;
  memberId?: string;
  email?: string;
  stats?: { label: string; color: string; fill: number }[];
  badges?: { unlocked: boolean; label: string }[];
  skin?: string;
  activeBadges?: string[];
  dynamicStats?: { code: number; social: number; learn: number; impact: number };
}

export default function MemberCard({
  className = "",
  style,
  children,
  data,
  showQR = false,
}: {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  data?: MemberCardData;
  showQR?: boolean;
}) {
  // Placeholder or real data
  const name = data?.name || "Jouw Naam";
  const role = data?.role || "member";
  const commissie = data?.commissie;
  const points = data?.points ?? 0;
  const rank = getRank(points);
  const level = getLevel(points);
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

  // Border wrapper: always use gradient as background for the 2px wrapper
  const borderWrapperStyle: React.CSSProperties = {
    background: skinDef.border,
    ...(skinDef.animated ? { animation: "borderRotate 8s linear infinite" } : {}),
  };

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
                  border: showQR && qrData ? "none" : "1px solid rgba(255,255,255,0.06)",
                  ...(!showQR || !qrData
                    ? {
                        backgroundImage:
                          "repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(245,158,11,0.03) 5px, rgba(245,158,11,0.03) 6px), repeating-linear-gradient(-45deg, transparent, transparent 5px, rgba(59,130,246,0.02) 5px, rgba(59,130,246,0.02) 6px)",
                      }
                    : {}),
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
                ) : (
                  <span className="font-mono text-sm text-[var(--color-text-muted)] opacity-30">
                    {isPlaceholder ? "?????" : name.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-col gap-1 min-w-0 pt-0.5">
                <span className="font-mono text-base text-[var(--color-text)] font-bold tracking-wide">
                  {name}
                </span>
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
                    LVL {String(level).padStart(2, "0")}
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[11px] text-[var(--color-accent-gold)]">
                    <Star size={10} fill="currentColor" />
                    {rank.naam.toUpperCase()}
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
                    background: "linear-gradient(90deg, var(--color-accent-gold), #FBBF24)",
                    boxShadow: "0 0 8px rgba(245, 158, 11, 0.4)",
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
                      const badgeSlots = Math.max(activeBadges.length, getBadgeSlotCount(rank.naam));
                      const slots: React.ReactNode[] = activeBadges
                        .map((badgeId) => (
                          <BadgeIcon key={badgeId} badgeId={badgeId} size={16} locked={false} />
                        ));
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
                          <span
                            className="font-mono text-[10px] text-[var(--color-accent-gold)]"
                            aria-hidden="true"
                          >
                            ✓
                          </span>
                        ) : (
                          <span
                            className="font-mono text-[9px] text-[var(--color-text-muted)] opacity-20"
                            aria-hidden="true"
                          >
                            ✕
                          </span>
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
        </div>
      </div>
    </div>
  );
}
