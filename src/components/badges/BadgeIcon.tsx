'use client'

import type { ReactElement } from 'react'
import * as Icons from './icons'

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
}

interface BadgeIconProps {
  badgeId: string
  size?: number
  locked?: boolean
}

export default function BadgeIcon({ badgeId, size = 20, locked = false }: BadgeIconProps) {
  const IconComponent = ICON_MAP[badgeId]
  if (!IconComponent) return null

  return (
    <div
      style={{
        width: size + 8,
        height: size + 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: locked ? '1px dashed rgba(255,255,255,0.08)' : '1px solid var(--color-accent-gold)',
        background: locked ? 'transparent' : 'rgba(242, 158, 24, 0.08)',
        opacity: locked ? 0.3 : 1,
      }}
    >
      <IconComponent size={size} color={locked ? 'rgba(255,255,255,0.2)' : 'var(--color-accent-gold)'} />
    </div>
  )
}
