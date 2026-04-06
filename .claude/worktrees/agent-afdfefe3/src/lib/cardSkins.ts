export interface CardSkin {
  id: string
  naam: string
  unlockType: 'rank' | 'badge' | 'track'
  unlockRequirement: string
  border: string
  glowColor: string
  background: string
  accent: string
  animated: boolean
  // Extra visual layers
  overlay?: string         // CSS background-image for pattern layer
  overlayOpacity?: number
  innerBorder?: string     // inner frame border color
  headerGradient?: string  // top accent line on header
  stamp?: string           // corner stamp text (e.g. "OG", "XI")
}

export const CARD_SKINS: CardSkin[] = [
  // ── RANK SKINS ──
  {
    id: 'default',
    naam: 'Default',
    unlockType: 'rank',
    unlockRequirement: 'Starter',
    border: 'linear-gradient(135deg, #1e1e22, #2a2a2e, #1e1e22)',
    glowColor: 'rgba(107, 114, 128, 0.08)',
    background: '#0c0c0e',
    accent: '#6B7280',
    animated: false,
    innerBorder: 'rgba(255,255,255,0.03)',
  },
  {
    id: 'skin_bronze',
    naam: 'Koper Glow',
    unlockType: 'rank',
    unlockRequirement: 'Bronze',
    border: 'linear-gradient(135deg, #8B5E34, #CD7F32, #DAA06D, #CD7F32, #8B5E34)',
    glowColor: 'rgba(205, 127, 50, 0.15)',
    background: 'linear-gradient(180deg, #0c0c0e 0%, #110d08 100%)',
    accent: '#CD7F32',
    animated: false,
    overlay: 'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(205,127,50,0.02) 20px, rgba(205,127,50,0.02) 21px)',
    overlayOpacity: 1,
    innerBorder: 'rgba(205,127,50,0.08)',
    headerGradient: 'linear-gradient(90deg, #CD7F32, transparent)',
  },
  {
    id: 'skin_silver',
    naam: 'Chrome',
    unlockType: 'rank',
    unlockRequirement: 'Silver',
    border: 'linear-gradient(135deg, #808080, #C0C0C0, #E8E8E8, #C0C0C0, #808080)',
    glowColor: 'rgba(192, 192, 192, 0.12)',
    background: 'linear-gradient(180deg, #0c0c0e 0%, #0e0e10 100%)',
    accent: '#C0C0C0',
    animated: false,
    overlay: 'linear-gradient(0deg, transparent 49.5%, rgba(192,192,192,0.03) 49.5%, rgba(192,192,192,0.03) 50.5%, transparent 50.5%)',
    overlayOpacity: 1,
    innerBorder: 'rgba(192,192,192,0.06)',
    headerGradient: 'linear-gradient(90deg, #C0C0C0, transparent)',
  },
  {
    id: 'skin_silver_matrix',
    naam: 'Matrix',
    unlockType: 'rank',
    unlockRequirement: 'Silver',
    border: 'linear-gradient(180deg, #22C55E, #166534, #22C55E)',
    glowColor: 'rgba(34, 197, 94, 0.12)',
    background: 'linear-gradient(180deg, #0c0c0e 0%, #030f07 100%)',
    accent: '#22C55E',
    animated: true,
    // Falling code rain effect via repeating gradient
    overlay: 'repeating-linear-gradient(180deg, transparent 0px, transparent 8px, rgba(34,197,94,0.04) 8px, rgba(34,197,94,0.04) 9px), repeating-linear-gradient(90deg, transparent 0px, transparent 12px, rgba(34,197,94,0.02) 12px, rgba(34,197,94,0.02) 13px)',
    overlayOpacity: 1,
    innerBorder: 'rgba(34,197,94,0.08)',
    headerGradient: 'linear-gradient(90deg, #22C55E, transparent)',
  },
  {
    id: 'skin_gold',
    naam: 'Gold Prestige',
    unlockType: 'rank',
    unlockRequirement: 'Gold',
    border: 'linear-gradient(135deg, #B8860B, #F29E18, #FBBF24, #F29E18, #B8860B)',
    glowColor: 'rgba(242, 158, 24, 0.2)',
    background: 'linear-gradient(135deg, #0c0c0e 0%, #12100a 50%, #0c0c0e 100%)',
    accent: '#F29E18',
    animated: true,
    // Subtle diamond grid
    overlay: 'repeating-linear-gradient(45deg, transparent, transparent 30px, rgba(242,158,24,0.015) 30px, rgba(242,158,24,0.015) 31px), repeating-linear-gradient(-45deg, transparent, transparent 30px, rgba(242,158,24,0.015) 30px, rgba(242,158,24,0.015) 31px)',
    overlayOpacity: 1,
    innerBorder: 'rgba(242,158,24,0.1)',
    headerGradient: 'linear-gradient(90deg, #F29E18, #FBBF24, transparent)',
  },
  {
    id: 'skin_plat',
    naam: 'Holographic',
    unlockType: 'rank',
    unlockRequirement: 'Platinum',
    border: 'conic-gradient(from 0deg, #E5E4E2, #a8d8ea, #d4a5ff, #E5E4E2, #a8d8ea, #E5E4E2)',
    glowColor: 'rgba(229, 228, 226, 0.15)',
    background: 'linear-gradient(135deg, #0c0c0e 0%, #0e0f12 50%, #100e12 100%)',
    accent: '#E5E4E2',
    animated: true,
    // Iridescent shimmer grid
    overlay: 'repeating-conic-gradient(rgba(168,216,234,0.02) 0% 25%, transparent 0% 50%) 0 0 / 20px 20px',
    overlayOpacity: 1,
    innerBorder: 'rgba(229,228,226,0.08)',
    headerGradient: 'linear-gradient(90deg, #E5E4E2, #a8d8ea, transparent)',
  },
  {
    id: 'skin_diamond',
    naam: 'Crystal',
    unlockType: 'rank',
    unlockRequirement: 'Diamond',
    border: 'linear-gradient(135deg, #1e40af, #3B82F6, #93C5FD, #3B82F6, #1e40af)',
    glowColor: 'rgba(59, 130, 246, 0.25)',
    background: 'linear-gradient(135deg, #0c0c0e 0%, #050d1a 50%, #0c0c0e 100%)',
    accent: '#3B82F6',
    animated: true,
    // Crystalline facet pattern
    overlay: 'repeating-linear-gradient(60deg, transparent, transparent 40px, rgba(59,130,246,0.02) 40px, rgba(59,130,246,0.02) 41px), repeating-linear-gradient(-60deg, transparent, transparent 40px, rgba(59,130,246,0.02) 40px, rgba(59,130,246,0.02) 41px), repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(59,130,246,0.015) 40px, rgba(59,130,246,0.015) 41px)',
    overlayOpacity: 1,
    innerBorder: 'rgba(59,130,246,0.12)',
    headerGradient: 'linear-gradient(90deg, #3B82F6, #93C5FD, transparent)',
  },

  // ── ACHIEVEMENT SKINS ──
  {
    id: 'skin_first_event',
    naam: 'First Blood',
    unlockType: 'badge',
    unlockRequirement: 'badge_first_event',
    border: 'linear-gradient(135deg, #991b1b, #EF4444, #991b1b)',
    glowColor: 'rgba(239, 68, 68, 0.12)',
    background: 'linear-gradient(135deg, #0c0c0e 0%, #120808 100%)',
    accent: '#EF4444',
    animated: false,
    innerBorder: 'rgba(239,68,68,0.08)',
    headerGradient: 'linear-gradient(90deg, #EF4444, transparent)',
    stamp: '1ST',
  },
  {
    id: 'skin_hackathon',
    naam: 'Hacker',
    unlockType: 'badge',
    unlockRequirement: 'badge_hackathon',
    border: 'linear-gradient(180deg, #166534, #22C55E, #166534)',
    glowColor: 'rgba(34, 197, 94, 0.15)',
    background: '#080c0a',
    accent: '#22C55E',
    animated: true,
    // Terminal scanline
    overlay: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(34,197,94,0.03) 2px, rgba(34,197,94,0.03) 4px)',
    overlayOpacity: 1,
    innerBorder: 'rgba(34,197,94,0.06)',
    headerGradient: 'linear-gradient(90deg, #22C55E, transparent)',
  },
  {
    id: 'skin_borrel_5',
    naam: 'Stamgast',
    unlockType: 'badge',
    unlockRequirement: 'badge_borrel_5',
    border: 'linear-gradient(135deg, #92400E, #F59E0B, #92400E)',
    glowColor: 'rgba(245, 158, 11, 0.12)',
    background: 'linear-gradient(180deg, #0c0c0e 0%, #100c06 100%)',
    accent: '#F59E0B',
    animated: false,
    innerBorder: 'rgba(245,158,11,0.06)',
    headerGradient: 'linear-gradient(90deg, #F59E0B, transparent)',
  },
  {
    id: 'skin_og',
    naam: 'OG',
    unlockType: 'badge',
    unlockRequirement: 'badge_og_member',
    border: 'linear-gradient(135deg, #78350F, #D4AF37, #78350F)',
    glowColor: 'rgba(212, 175, 55, 0.1)',
    background: 'linear-gradient(135deg, #0c0c0e 0%, #0f0d08 100%)',
    accent: '#D4AF37',
    animated: false,
    // Vintage cross-hatch
    overlay: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(212,175,55,0.015) 10px, rgba(212,175,55,0.015) 11px), repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(212,175,55,0.015) 10px, rgba(212,175,55,0.015) 11px)',
    overlayOpacity: 1,
    innerBorder: 'rgba(212,175,55,0.08)',
    headerGradient: 'linear-gradient(90deg, #D4AF37, transparent)',
    stamp: 'EST.2025',
  },
  {
    id: 'skin_bestuur',
    naam: 'Bestuur XI',
    unlockType: 'badge',
    unlockRequirement: 'badge_bestuur',
    border: 'linear-gradient(135deg, #78350F, #F29E18, #FBBF24, #F29E18, #78350F)',
    glowColor: 'rgba(242, 158, 24, 0.2)',
    background: 'linear-gradient(135deg, #0c0c0e 0%, #0c0a06 50%, #0c0c0e 100%)',
    accent: '#F29E18',
    animated: true,
    // Double diagonal lines — premium
    overlay: 'repeating-linear-gradient(45deg, transparent, transparent 15px, rgba(242,158,24,0.02) 15px, rgba(242,158,24,0.02) 16px, transparent 16px, transparent 17px, rgba(242,158,24,0.02) 17px, rgba(242,158,24,0.02) 18px)',
    overlayOpacity: 1,
    innerBorder: 'rgba(242,158,24,0.12)',
    headerGradient: 'linear-gradient(90deg, #F29E18, #FBBF24, transparent)',
    stamp: 'XI',
  },

  // ── LEVEL SKINS ──
  {
    id: 'skin_digital_rain',
    naam: 'Digital Rain',
    unlockType: 'rank',
    unlockRequirement: 'Bronze',
    border: 'linear-gradient(180deg, #22C55E, #166534, #22C55E)',
    glowColor: '#22C55E',
    background: '#020504',
    accent: '#22C55E',
    animated: true,
    overlay: `repeating-linear-gradient(0deg, transparent 0px, transparent 14px, rgba(34,197,94,0.04) 14px, rgba(34,197,94,0.04) 16px)`,
    overlayOpacity: 1,
    innerBorder: '1px solid rgba(34,197,94,0.1)',
    headerGradient: 'linear-gradient(to right, #22C55E, transparent)',
  },
  {
    id: 'skin_glitch',
    naam: 'GL1TCH',
    unlockType: 'rank',
    unlockRequirement: 'Bronze',
    border: 'linear-gradient(180deg, #EF4444, #991B1B, #EF4444)',
    glowColor: '#EF4444',
    background: '#0a0505',
    accent: '#EF4444',
    animated: true,
    overlay: `repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(255,255,255,0.015) 2px, rgba(255,255,255,0.015) 4px)`,
    overlayOpacity: 1,
    innerBorder: '1px solid rgba(239,68,68,0.08)',
    headerGradient: 'linear-gradient(to right, #EF4444, transparent)',
  },
  {
    id: 'skin_hologram',
    naam: 'Hologram',
    unlockType: 'rank',
    unlockRequirement: 'Silver',
    border: 'linear-gradient(180deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1), rgba(255,255,255,0.4))',
    glowColor: 'rgba(255,255,255,0.3)',
    background: '#050507',
    accent: '#ffffff',
    animated: true,
    overlay: `repeating-linear-gradient(0deg, transparent 0px, transparent 14px, rgba(255,255,255,0.025) 14px, rgba(255,255,255,0.025) 15px), repeating-linear-gradient(90deg, transparent 0px, transparent 14px, rgba(255,255,255,0.025) 14px, rgba(255,255,255,0.025) 15px)`,
    overlayOpacity: 1,
    innerBorder: '1px solid rgba(255,255,255,0.06)',
    headerGradient: 'linear-gradient(to right, rgba(255,255,255,0.3), transparent)',
  },
  {
    id: 'skin_aurora',
    naam: 'Aurora',
    unlockType: 'rank',
    unlockRequirement: 'Silver',
    border: 'linear-gradient(180deg, #22C55E, #3B82F6, #8B5CF6, #22C55E)',
    glowColor: '#22C55E',
    background: '#020508',
    accent: '#22C55E',
    animated: true,
    overlay: `radial-gradient(ellipse at 30% 20%, rgba(34,197,94,0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(139,92,246,0.06) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(59,130,246,0.05) 0%, transparent 40%)`,
    overlayOpacity: 1,
    innerBorder: '1px solid rgba(34,197,94,0.08)',
    headerGradient: 'linear-gradient(to right, #22C55E, #3B82F6, transparent)',
  },
  {
    id: 'skin_neon_city',
    naam: 'Neon City',
    unlockType: 'rank',
    unlockRequirement: 'Gold',
    border: 'linear-gradient(180deg, #EC4899, #8B5CF6, #EC4899)',
    glowColor: '#EC4899',
    background: '#08050a',
    accent: '#EC4899',
    animated: true,
    overlay: `linear-gradient(to top, rgba(236,72,153,0.06) 0%, transparent 30%)`,
    overlayOpacity: 1,
    innerBorder: '1px solid rgba(236,72,153,0.08)',
    headerGradient: 'linear-gradient(to right, #EC4899, transparent)',
  },
  {
    id: 'skin_frost',
    naam: 'Frost',
    unlockType: 'rank',
    unlockRequirement: 'Platinum',
    border: 'linear-gradient(180deg, #06B6D4, #164e63, #06B6D4)',
    glowColor: '#06B6D4',
    background: '#030809',
    accent: '#06B6D4',
    animated: true,
    overlay: `linear-gradient(60deg, transparent 40%, rgba(6,182,212,0.03) 50%, transparent 60%), linear-gradient(-60deg, transparent 40%, rgba(6,182,212,0.02) 50%, transparent 60%)`,
    overlayOpacity: 1,
    innerBorder: '1px solid rgba(6,182,212,0.08)',
    headerGradient: 'linear-gradient(to right, #06B6D4, transparent)',
  },
  {
    id: 'skin_plasma',
    naam: 'Plasma',
    unlockType: 'rank',
    unlockRequirement: 'Platinum',
    border: 'linear-gradient(180deg, #F59E0B, #EF4444, #F59E0B)',
    glowColor: '#F59E0B',
    background: '#0a0804',
    accent: '#F59E0B',
    animated: true,
    overlay: `radial-gradient(circle at 25% 25%, rgba(245,158,11,0.08) 0%, transparent 40%), radial-gradient(circle at 75% 65%, rgba(239,68,68,0.06) 0%, transparent 35%)`,
    overlayOpacity: 1,
    innerBorder: '1px solid rgba(245,158,11,0.08)',
    headerGradient: 'linear-gradient(to right, #F59E0B, #EF4444, transparent)',
  },
  {
    id: 'skin_void',
    naam: 'The Void',
    unlockType: 'rank',
    unlockRequirement: 'Diamond',
    border: 'linear-gradient(180deg, #8B5CF6, #EC4899, #8B5CF6)',
    glowColor: '#8B5CF6',
    background: '#020204',
    accent: '#8B5CF6',
    animated: true,
    overlay: `radial-gradient(ellipse at 50% 50%, rgba(139,92,246,0.06) 0%, transparent 50%)`,
    overlayOpacity: 1,
    innerBorder: '1px solid rgba(139,92,246,0.05)',
    headerGradient: 'linear-gradient(to right, #8B5CF6, #EC4899, transparent)',
    stamp: 'VOID',
  },

  // ── TRACK SKINS ──
  {
    id: 'skin_fullstack',
    naam: 'Fullstack',
    unlockType: 'track',
    unlockRequirement: 'fullstack',
    border: 'linear-gradient(135deg, #1e40af, #3B82F6, #22C55E, #3B82F6, #1e40af)',
    glowColor: 'rgba(59, 130, 246, 0.12)',
    background: 'linear-gradient(135deg, #0c0c0e 0%, #050d14 50%, #040e0a 100%)',
    accent: '#3B82F6',
    animated: false,
    // 3 stacked layers
    overlay: 'linear-gradient(0deg, rgba(59,130,246,0.03) 0%, transparent 33%, transparent 34%, rgba(34,197,94,0.03) 34%, rgba(34,197,94,0.03) 66%, transparent 67%)',
    overlayOpacity: 0.5,
    innerBorder: 'rgba(59,130,246,0.08)',
    headerGradient: 'linear-gradient(90deg, #3B82F6, #22C55E, transparent)',
  },
  {
    id: 'skin_ai',
    naam: 'Neural',
    unlockType: 'track',
    unlockRequirement: 'ai_engineer',
    border: 'linear-gradient(135deg, #6D28D9, #A855F7, #C084FC, #A855F7, #6D28D9)',
    glowColor: 'rgba(168, 85, 247, 0.18)',
    background: 'linear-gradient(135deg, #0c0c0e 0%, #0c071a 100%)',
    accent: '#A855F7',
    animated: true,
    // Neural network dot grid
    overlay: 'radial-gradient(circle, rgba(168,85,247,0.06) 1px, transparent 1px)',
    overlayOpacity: 1,
    innerBorder: 'rgba(168,85,247,0.1)',
    headerGradient: 'linear-gradient(90deg, #A855F7, #C084FC, transparent)',
  },
  {
    id: 'skin_security',
    naam: 'Encrypted',
    unlockType: 'track',
    unlockRequirement: 'security',
    border: 'linear-gradient(180deg, #064E3B, #22C55E, #064E3B)',
    glowColor: 'rgba(34, 197, 94, 0.15)',
    background: 'linear-gradient(180deg, #0c0c0e 0%, #040c08 100%)',
    accent: '#22C55E',
    animated: true,
    // Hex grid pattern
    overlay: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(34,197,94,0.025) 3px, rgba(34,197,94,0.025) 4px), repeating-linear-gradient(60deg, transparent, transparent 3px, rgba(34,197,94,0.015) 3px, rgba(34,197,94,0.015) 4px), repeating-linear-gradient(-60deg, transparent, transparent 3px, rgba(34,197,94,0.015) 3px, rgba(34,197,94,0.015) 4px)',
    overlayOpacity: 1,
    innerBorder: 'rgba(34,197,94,0.08)',
    headerGradient: 'linear-gradient(90deg, #22C55E, #064E3B, transparent)',
  },
  {
    id: 'skin_party',
    naam: 'Party Animal',
    unlockType: 'track',
    unlockRequirement: 'feestbeest',
    border: 'conic-gradient(from 0deg, #EF4444, #F29E18, #22C55E, #3B82F6, #A855F7, #EF4444)',
    glowColor: 'rgba(242, 158, 24, 0.15)',
    background: 'linear-gradient(135deg, #0c0c0e 0%, #10080c 50%, #0c0c0e 100%)',
    accent: '#F29E18',
    animated: true,
    // Confetti diagonal stripes
    overlay: 'repeating-linear-gradient(45deg, transparent, transparent 25px, rgba(239,68,68,0.02) 25px, rgba(239,68,68,0.02) 26px, transparent 26px, transparent 50px, rgba(59,130,246,0.02) 50px, rgba(59,130,246,0.02) 51px, transparent 51px, transparent 75px, rgba(34,197,94,0.02) 75px, rgba(34,197,94,0.02) 76px)',
    overlayOpacity: 1,
    innerBorder: 'rgba(242,158,24,0.08)',
    headerGradient: 'linear-gradient(90deg, #EF4444, #F29E18, #22C55E, #3B82F6, transparent)',
  },
]

export function getSkin(skinId: string): CardSkin {
  return CARD_SKINS.find((s) => s.id === skinId) ?? CARD_SKINS[0]
}

export function getUnlockedSkins(
  rank: string,
  badges: string[],
  completedTracks: string[]
): CardSkin[] {
  const rankOrder = ['Starter', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond']
  const rankIndex = rankOrder.indexOf(rank)

  return CARD_SKINS.filter((skin) => {
    if (skin.unlockType === 'rank') {
      const skinRankIndex = rankOrder.indexOf(skin.unlockRequirement)
      return rankIndex >= skinRankIndex
    }
    if (skin.unlockType === 'badge') return badges.includes(skin.unlockRequirement)
    if (skin.unlockType === 'track') return completedTracks.includes(skin.unlockRequirement)
    return false
  })
}
