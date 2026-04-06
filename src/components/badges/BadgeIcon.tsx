'use client'

import type { ReactElement, CSSProperties } from 'react'
import * as Icons from './icons'
import { RARITY_CONFIG } from '@/types/gamification'
import type { BadgeRarity } from '@/types/gamification'

const ICON_MAP: Record<string, (props: { size?: number; color?: string }) => ReactElement> = {
  badge_joined: Icons.IconJoined,
  badge_first_event: Icons.IconFirstEvent,
  badge_hackathon: Icons.IconHackathon,
  badge_borrel_5: Icons.IconBorrel5,
  badge_borrel_10: Icons.IconBorrel10,
  badge_helper: Icons.IconHelper,
  badge_og_member: Icons.IconOG,
  badge_bestuur: Icons.IconBestuur,
  badge_streak_3: Icons.IconStreak,
  badge_allrounder: Icons.IconAllrounder,
  badge_fullstack: Icons.IconFullstack,
  badge_ai_engineer: Icons.IconAI,
  badge_security: Icons.IconSecurity,
  badge_party_animal: Icons.IconPartyAnimal,
  badge_community_builder: Icons.IconCommunityBuilder,
  badge_first_purchase: Icons.IconFirstPurchase,
  badge_profile_complete: Icons.IconProfileComplete,
  badge_streak_7: Icons.IconStreak7,
  badge_night_owl: Icons.IconNightOwl,
  badge_mentor: Icons.IconMentor,
  badge_double_xp_day: Icons.IconDoubleXpDay,
  badge_boss_slayer: Icons.IconBossSlayer,
  badge_max_category: Icons.IconMaxCategory,
  badge_hacker: Icons.IconHacker,
  badge_completionist: Icons.IconCompletionist,
  badge_bdfl_witness: Icons.IconBdflWitness,
  badge_404: Icons.Icon404,
  badge_no_life: Icons.IconNoLife,
  badge_konami: Icons.IconKonami,
  badge_first_bdfl: Icons.IconFirstBdfl,
  badge_founder_xi: Icons.IconFounderXi,
}

const RARITY_ORDER: BadgeRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic']

interface BadgeIconProps {
  badgeId: string
  size?: number
  locked?: boolean
  rarity?: BadgeRarity
  showLabel?: boolean
}

function getIconColor(rarity: BadgeRarity, locked: boolean): string {
  if (locked) return 'rgba(255,255,255,0.2)'
  if (rarity === 'mythic') return '#fff'
  return RARITY_CONFIG[rarity].color
}

// ─── Common Badge ────────────────────────────────────────────────────────────
function CommonBadge({ size, children }: { size: number; children: ReactElement }) {
  const dim = size + 16

  return (
    <div
      style={{
        position: 'relative',
        width: dim,
        height: dim,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(145deg, #1a1a1a, #0a0a0a)',
        border: '1.5px solid #555',
        overflow: 'hidden',
      }}
    >
      {/* Inner light sweep */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          width: '40%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)',
          animation: 'badge-commonSweep 4s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />
      {children}
    </div>
  )
}

// ─── Uncommon Badge ───────────────────────────────────────────────────────────
function UncommonBadge({ size, children }: { size: number; children: ReactElement }) {
  const dim = size + 16

  return (
    <div
      style={{
        position: 'relative',
        width: dim,
        height: dim,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(145deg, #0a1f0a, #0d0d0d)',
        border: '1.5px solid #22C55E',
        boxShadow: '0 0 15px rgba(34,197,94,0.3), inset 0 0 15px rgba(34,197,94,0.05)',
        overflow: 'hidden',
      }}
    >
      {/* Data stream line 1 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '20%',
          width: 1,
          height: '100%',
          background: 'linear-gradient(to bottom, transparent, #22C55E, transparent)',
          animation: 'badge-dataStream1 2s linear infinite',
          pointerEvents: 'none',
        }}
      />
      {/* Data stream line 2 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          width: 1,
          height: '100%',
          background: 'linear-gradient(to bottom, transparent, #22C55E, transparent)',
          animation: 'badge-dataStream2 2s linear infinite',
          animationDelay: '0.6s',
          pointerEvents: 'none',
        }}
      />
      {/* Data stream line 3 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '78%',
          width: 1,
          height: '100%',
          background: 'linear-gradient(to bottom, transparent, #22C55E, transparent)',
          animation: 'badge-dataStream3 2s linear infinite',
          animationDelay: '1.2s',
          pointerEvents: 'none',
        }}
      />
      {children}
    </div>
  )
}

// ─── Rare Badge ───────────────────────────────────────────────────────────────
function RareBadge({ size, children }: { size: number; children: ReactElement }) {
  const dim = size + 16

  return (
    <div
      style={{
        position: 'relative',
        width: dim,
        height: dim,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(145deg, #070d1f, #0d0d0d)',
        border: '1.5px solid #3B82F6',
        boxShadow: '0 0 20px rgba(59,130,246,0.35), 0 0 40px rgba(59,130,246,0.1)',
        animation: 'badge-rareShimmer 3s ease-in-out infinite',
        overflow: 'hidden',
      }}
    >
      {/* Holographic refraction sweep */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          width: '35%',
          background:
            'linear-gradient(105deg, transparent, rgba(59,130,246,0.15), rgba(147,197,253,0.2), rgba(59,130,246,0.1), transparent)',
          animation: 'badge-holoSweep 3s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />
      {/* Top-right corner accent triangle */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 0,
          height: 0,
          borderStyle: 'solid',
          borderWidth: '0 10px 10px 0',
          borderColor: `transparent #3B82F6 transparent transparent`,
          opacity: 0.7,
          pointerEvents: 'none',
        }}
      />
      {children}
    </div>
  )
}

// ─── Epic Badge ───────────────────────────────────────────────────────────────
function EpicBadge({ size, children }: { size: number; iconColor: string; children: ReactElement }) {
  const dim = size + 16

  return (
    <div
      style={{
        position: 'relative',
        width: dim,
        height: dim,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(145deg, #10071f, #0d0d0d)',
        border: '1.5px solid #8B5CF6',
        animation: 'badge-epicPulse 2.5s ease-in-out infinite',
        overflow: 'hidden',
      }}
    >
      {/* Pulsating energy core */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          margin: 'auto',
          width: '60%',
          height: '60%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)',
          animation: 'badge-energyCore 2s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />
      {/* Horizontal scan line (top to bottom) */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.6), transparent)',
          animation: 'badge-epicScanLine 2s linear infinite',
          pointerEvents: 'none',
        }}
      />
      {/* Icon with flicker */}
      <div style={{ animation: 'badge-iconFlicker 4s ease-in-out infinite' }}>
        {children}
      </div>
    </div>
  )
}

// ─── Legendary Badge ──────────────────────────────────────────────────────────
function LegendaryBadge({ size, children }: { size: number; children: ReactElement }) {
  const dim = size + 16
  const outerDim = dim + 14

  return (
    <div
      style={{
        position: 'relative',
        width: outerDim,
        height: outerDim,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Outer orbiting ring with 3 glowing dots */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          animation: 'badge-orbitRotate 4s linear infinite',
          pointerEvents: 'none',
        }}
      >
        {/* Dot at top */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 4,
            height: 4,
            borderRadius: '50%',
            background: '#F59E0B',
            boxShadow: '0 0 6px #F59E0B, 0 0 12px rgba(245,158,11,0.6)',
          }}
        />
        {/* Dot at bottom-left */}
        <div
          style={{
            position: 'absolute',
            bottom: '10%',
            left: '15%',
            width: 3,
            height: 3,
            borderRadius: '50%',
            background: '#FBBF24',
            boxShadow: '0 0 5px #FBBF24, 0 0 10px rgba(251,191,36,0.5)',
          }}
        />
        {/* Dot at bottom-right */}
        <div
          style={{
            position: 'absolute',
            bottom: '10%',
            right: '15%',
            width: 3,
            height: 3,
            borderRadius: '50%',
            background: '#F59E0B',
            boxShadow: '0 0 5px #F59E0B, 0 0 10px rgba(245,158,11,0.5)',
          }}
        />
      </div>

      {/* Inner fire aura (rotating conic gradient) */}
      <div
        style={{
          position: 'absolute',
          inset: 5,
          borderRadius: 2,
          background: 'conic-gradient(from 180deg, transparent 60%, rgba(245,158,11,0.35) 80%, transparent)',
          animation: 'badge-fireRotate 3s linear infinite',
          pointerEvents: 'none',
        }}
      />

      {/* Badge itself */}
      <div
        style={{
          position: 'relative',
          width: dim,
          height: dim,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(145deg, #1f1205, #0a0805)',
          border: '2px solid #F59E0B',
          boxShadow: '0 0 30px rgba(245,158,11,0.55), 0 0 60px rgba(245,158,11,0.2), inset 0 0 20px rgba(245,158,11,0.08)',
          overflow: 'hidden',
          zIndex: 1,
        }}
      >
        {children}
      </div>

      {/* Rising embers */}
      <div
        style={{
          position: 'absolute',
          bottom: 4,
          left: '35%',
          width: 3,
          height: 3,
          borderRadius: '50%',
          background: '#F59E0B',
          boxShadow: '0 0 4px #F59E0B',
          animation: 'badge-ember1 2s ease-out infinite',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 4,
          left: '50%',
          width: 2,
          height: 2,
          borderRadius: '50%',
          background: '#FBBF24',
          boxShadow: '0 0 3px #FBBF24',
          animation: 'badge-ember2 2.3s ease-out infinite',
          animationDelay: '0.5s',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 4,
          left: '65%',
          width: 2,
          height: 2,
          borderRadius: '50%',
          background: '#FCD34D',
          boxShadow: '0 0 3px #FCD34D',
          animation: 'badge-ember3 2.5s ease-out infinite',
          animationDelay: '1s',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}

// ─── Mythic Infinity Crystal Icon ─────────────────────────────────────────────
function InfinityCrystalIcon({ size }: { size: number }) {
  const s = size

  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ animation: 'badge-crystalSpin 6s linear infinite' }}
    >
      <defs>
        <linearGradient id="facet-a" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#f472b6" />
        </linearGradient>
        <linearGradient id="facet-b" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
        <linearGradient id="facet-c" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f472b6" />
          <stop offset="100%" stopColor="#fb7185" />
        </linearGradient>
        <linearGradient id="facet-d" x1="100%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#60a5fa" />
        </linearGradient>
        <radialGradient id="core-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="60%" stopColor="#e9d5ff" stopOpacity="0.7" />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Top facet (purple/pink) */}
      <polygon points="12,2 18,12 12,9" fill="url(#facet-a)" opacity="0.9" />
      {/* Right facet (blue/purple) */}
      <polygon points="18,12 12,22 12,15" fill="url(#facet-b)" opacity="0.85" />
      {/* Bottom facet (pink/red) */}
      <polygon points="12,22 6,12 12,15" fill="url(#facet-c)" opacity="0.9" />
      {/* Left facet (green/blue) */}
      <polygon points="6,12 12,2 12,9" fill="url(#facet-d)" opacity="0.85" />

      {/* Light rays from center */}
      <line x1="12" y1="12" x2="12" y2="1" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
      <line x1="12" y1="12" x2="23" y2="12" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
      <line x1="12" y1="12" x2="12" y2="23" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
      <line x1="12" y1="12" x2="1" y2="12" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />

      {/* Floating sparkle dots */}
      <circle cx="5" cy="5" r="1" fill="white" opacity="0.7" style={{ animation: 'badge-sparkleFloat 1.8s ease-in-out infinite' }} />
      <circle cx="19" cy="4" r="0.8" fill="#c084fc" opacity="0.8" style={{ animation: 'badge-sparkleFloat 2.2s ease-in-out infinite', animationDelay: '0.4s' }} />
      <circle cx="20" cy="20" r="1" fill="white" opacity="0.6" style={{ animation: 'badge-sparkleFloat 2s ease-in-out infinite', animationDelay: '0.9s' }} />
      <circle cx="4" cy="19" r="0.8" fill="#60a5fa" opacity="0.7" style={{ animation: 'badge-sparkleFloat 1.6s ease-in-out infinite', animationDelay: '1.3s' }} />

      {/* White-hot pulsating core */}
      <circle cx="12" cy="12" r="2" fill="url(#core-glow)">
        <animate attributeName="r" values="2;3.5;2" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.6;1;0.6" dur="1.5s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}

// ─── Mythic Badge ─────────────────────────────────────────────────────────────
function MythicBadge({ size, children }: { size: number; children: ReactElement }) {
  const dim = size + 16
  const outerDim = dim + 18

  return (
    <div
      style={{
        position: 'relative',
        width: outerDim,
        height: outerDim,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Outer ring: rainbow conic, clockwise, blurred */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 3,
          background:
            'conic-gradient(from 0deg, #ff0080, #ff8c00, #ffe100, #00ff80, #00cfff, #cc00ff, #ff0080)',
          animation: 'badge-mythicCW 2.5s linear infinite',
          filter: 'blur(1px)',
          opacity: 0.85,
          pointerEvents: 'none',
        }}
      />
      {/* Inner ring: reversed, counter-clockwise */}
      <div
        style={{
          position: 'absolute',
          inset: 4,
          borderRadius: 2,
          background:
            'conic-gradient(from 0deg, #cc00ff, #00cfff, #00ff80, #ffe100, #ff8c00, #ff0080, #cc00ff)',
          animation: 'badge-mythicCCW 3.5s linear infinite',
          filter: 'blur(0.5px)',
          opacity: 0.6,
          pointerEvents: 'none',
        }}
      />

      {/* Badge core */}
      <div
        style={{
          position: 'relative',
          width: dim,
          height: dim,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(145deg, #0f0a15, #050507)',
          border: '2px solid rgba(255,255,255,0.3)',
          overflow: 'hidden',
          zIndex: 1,
        }}
      >
        {/* Inner glow field that shifts */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 30% 50%, rgba(192,132,252,0.18) 0%, transparent 60%)',
            animation: 'badge-glowShift 4s ease-in-out infinite',
            backgroundSize: '200% 100%',
            pointerEvents: 'none',
          }}
        />

        {/* Prismatic light sweep */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            width: '40%',
            background:
              'linear-gradient(105deg, transparent, rgba(255,0,128,0.12), rgba(0,207,255,0.12), rgba(204,0,255,0.1), transparent)',
            animation: 'badge-prismaticSweep 3s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />

        {/* Starburst cross lines */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'badge-starburst 2.5s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        >
          <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`}>
            <line
              x1={dim / 2}
              y1={0}
              x2={dim / 2}
              y2={dim}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="0.8"
            />
            <line
              x1={0}
              y1={dim / 2}
              x2={dim}
              y2={dim / 2}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="0.8"
            />
            <line
              x1={0}
              y1={0}
              x2={dim}
              y2={dim}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="0.5"
            />
            <line
              x1={dim}
              y1={0}
              x2={0}
              y2={dim}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="0.5"
            />
          </svg>
        </div>

        {/* Actual badge icon with white glow filter */}
        <div style={{ position: 'relative', zIndex: 2, filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.5))' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

// ─── Locked Badge ─────────────────────────────────────────────────────────────
function LockedBadge({ size, children }: { size: number; children: ReactElement }) {
  const dim = size + 16

  return (
    <div
      style={{
        width: dim,
        height: dim,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1.5px dashed rgba(255,255,255,0.15)',
        background: 'transparent',
        opacity: 0.3,
      }}
    >
      {children}
    </div>
  )
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function BadgeIcon({
  badgeId,
  size = 20,
  locked = false,
  rarity = 'common',
  showLabel = false,
}: BadgeIconProps) {
  const IconComponent = ICON_MAP[badgeId]
  if (!IconComponent) return null

  const iconColor = getIconColor(rarity, locked)
  const config = RARITY_CONFIG[rarity]

  let badgeElement: ReactElement

  if (locked) {
    badgeElement = (
      <LockedBadge size={size}>
        <IconComponent size={size} color={iconColor} />
      </LockedBadge>
    )
  } else if (rarity === 'mythic') {
    badgeElement = (
      <MythicBadge size={size}>
        <IconComponent size={size} color="#ffffff" />
      </MythicBadge>
    )
  } else if (rarity === 'legendary') {
    badgeElement = (
      <LegendaryBadge size={size}>
        <IconComponent size={size} color={iconColor} />
      </LegendaryBadge>
    )
  } else if (rarity === 'epic') {
    badgeElement = (
      <EpicBadge size={size} iconColor={iconColor}>
        <IconComponent size={size} color={iconColor} />
      </EpicBadge>
    )
  } else if (rarity === 'rare') {
    badgeElement = (
      <RareBadge size={size}>
        <IconComponent size={size} color={iconColor} />
      </RareBadge>
    )
  } else if (rarity === 'uncommon') {
    badgeElement = (
      <UncommonBadge size={size}>
        <IconComponent size={size} color={iconColor} />
      </UncommonBadge>
    )
  } else {
    // common
    badgeElement = (
      <CommonBadge size={size}>
        <IconComponent size={size} color={iconColor} />
      </CommonBadge>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      {badgeElement}

      {/* Rarity label pill */}
      {showLabel && !locked && (
        <span
          style={{
            fontSize: 9,
            fontFamily: 'var(--font-mono, monospace)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            padding: '1px 5px',
            border: `1px solid ${rarity === 'mythic' ? 'rgba(255,255,255,0.3)' : config.color}`,
            color: rarity === 'mythic' ? '#fff' : config.color,
            background:
              rarity === 'mythic' ? 'rgba(255,255,255,0.05)' : `${config.color}14`,
            whiteSpace: 'nowrap',
            ...(rarity === 'mythic'
              ? { animation: 'badge-rainbow-border 3s linear infinite' }
              : {}),
          }}
        >
          {config.label}
        </span>
      )}
    </div>
  )
}

export { RARITY_ORDER }
export type { BadgeRarity }
