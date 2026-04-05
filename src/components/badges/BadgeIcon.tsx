'use client'

import type { ReactElement } from 'react'
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

function getRarityStyles(rarity: BadgeRarity, locked: boolean): React.CSSProperties {
  if (locked) {
    return {
      border: '1px dashed rgba(255,255,255,0.08)',
      background: 'transparent',
    }
  }

  switch (rarity) {
    case 'common':
      return {
        border: `1px solid ${RARITY_CONFIG.common.color}`,
        background: 'rgba(136,136,136,0.06)',
      }
    case 'uncommon':
      return {
        border: `1px solid ${RARITY_CONFIG.uncommon.color}`,
        background: 'rgba(34,197,94,0.07)',
        boxShadow: `0 0 8px rgba(34,197,94,0.35)`,
      }
    case 'rare':
      return {
        border: `1px solid ${RARITY_CONFIG.rare.color}`,
        background: 'rgba(59,130,246,0.08)',
        boxShadow: `0 0 10px rgba(59,130,246,0.45)`,
        animation: 'badge-shimmer 2.5s ease-in-out infinite',
      }
    case 'epic':
      return {
        border: `1px solid ${RARITY_CONFIG.epic.color}`,
        background: 'rgba(139,92,246,0.09)',
        boxShadow: `0 0 12px rgba(139,92,246,0.5)`,
        animation: 'badge-pulse 2s ease-in-out infinite',
      }
    case 'legendary':
      return {
        border: `1px solid ${RARITY_CONFIG.legendary.color}`,
        background: 'rgba(245,158,11,0.09)',
        boxShadow: `0 0 14px rgba(245,158,11,0.55)`,
        position: 'relative',
      }
    case 'mythic':
      return {
        border: '2px solid transparent',
        background: 'rgba(255,255,255,0.04)',
        backgroundClip: 'padding-box',
        animation: 'badge-rainbow-border 3s linear infinite',
        boxShadow: '0 0 16px rgba(255,100,100,0.3)',
      }
  }
}

function getIconColor(rarity: BadgeRarity, locked: boolean): string {
  if (locked) return 'rgba(255,255,255,0.2)'
  if (rarity === 'mythic') return '#fff'
  return RARITY_CONFIG[rarity].color
}

export default function BadgeIcon({
  badgeId,
  size = 20,
  locked = false,
  rarity = 'common',
  showLabel = false,
}: BadgeIconProps) {
  const IconComponent = ICON_MAP[badgeId]
  if (!IconComponent) return null

  const rarityStyles = getRarityStyles(rarity, locked)
  const iconColor = getIconColor(rarity, locked)
  const config = RARITY_CONFIG[rarity]

  const isLegendary = !locked && rarity === 'legendary'
  const isMythic = !locked && rarity === 'mythic'

  return (
    <>
      <style>{`
        @keyframes badge-shimmer {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.35) drop-shadow(0 0 4px rgba(59,130,246,0.6)); }
        }
        @keyframes badge-pulse {
          0%, 100% { box-shadow: 0 0 12px rgba(139,92,246,0.5); }
          50% { box-shadow: 0 0 20px rgba(139,92,246,0.75), 0 0 32px rgba(139,92,246,0.25); }
        }
        @keyframes badge-particle-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes badge-rainbow-border {
          0%   { filter: hue-rotate(0deg) brightness(1.2); box-shadow: 0 0 16px rgba(255,80,80,0.4); }
          33%  { filter: hue-rotate(120deg) brightness(1.2); box-shadow: 0 0 16px rgba(80,255,80,0.4); }
          66%  { filter: hue-rotate(240deg) brightness(1.2); box-shadow: 0 0 16px rgba(80,80,255,0.4); }
          100% { filter: hue-rotate(360deg) brightness(1.2); box-shadow: 0 0 16px rgba(255,80,80,0.4); }
        }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        {/* Legendary particle ring wrapper */}
        {isLegendary ? (
          <div style={{ position: 'relative', display: 'inline-flex' }}>
            {/* Rotating conic-gradient ring */}
            <div
              style={{
                position: 'absolute',
                inset: -3,
                borderRadius: 2,
                background: 'conic-gradient(from 0deg, #F59E0B, #FBBF24, transparent, #F59E0B)',
                animation: 'badge-particle-rotate 2.5s linear infinite',
                opacity: 0.7,
              }}
            />
            <div
              style={{
                position: 'relative',
                width: size + 8,
                height: size + 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: locked ? 0.3 : 1,
                ...rarityStyles,
              }}
            >
              <IconComponent size={size} color={iconColor} />
            </div>
          </div>
        ) : isMythic ? (
          <div style={{ position: 'relative', display: 'inline-flex' }}>
            {/* Rainbow animated border via pseudo-like wrapper */}
            <div
              style={{
                position: 'absolute',
                inset: -2,
                borderRadius: 2,
                background: 'conic-gradient(from 0deg, #ff0080, #ff8c00, #ffe100, #00ff80, #00cfff, #cc00ff, #ff0080)',
                animation: 'badge-particle-rotate 2s linear infinite',
              }}
            />
            <div
              style={{
                position: 'relative',
                width: size + 8,
                height: size + 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#09090b',
                opacity: locked ? 0.3 : 1,
                animation: 'badge-rainbow-border 3s linear infinite',
              }}
            >
              <IconComponent size={size} color={iconColor} />
            </div>
          </div>
        ) : (
          <div
            style={{
              width: size + 8,
              height: size + 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: locked ? 0.3 : 1,
              ...rarityStyles,
            }}
          >
            <IconComponent size={size} color={iconColor} />
          </div>
        )}

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
              background: rarity === 'mythic'
                ? 'rgba(255,255,255,0.05)'
                : `${config.color}14`,
              whiteSpace: 'nowrap',
              ...(rarity === 'mythic' ? { animation: 'badge-rainbow-border 3s linear infinite' } : {}),
            }}
          >
            {config.label}
          </span>
        )}
      </div>
    </>
  )
}

export { RARITY_ORDER }
export type { BadgeRarity }
