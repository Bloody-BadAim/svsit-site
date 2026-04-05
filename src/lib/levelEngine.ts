import type { LevelDef, LevelTier } from '@/types/gamification'

export const LEVELS: LevelDef[] = [
  { level: 1,  title: 'Noob',          xpRequired: 0,    cumulativeXp: 0,    tier: 'onboarding', color: '#22C55E' },
  { level: 2,  title: 'Rookie',        xpRequired: 25,   cumulativeXp: 25,   tier: 'onboarding', color: '#22C55E' },
  { level: 3,  title: 'Script Kiddie', xpRequired: 50,   cumulativeXp: 75,   tier: 'onboarding', color: '#22C55E' },
  { level: 4,  title: 'Hacker',        xpRequired: 100,  cumulativeXp: 175,  tier: 'onboarding', color: '#22C55E' },
  { level: 5,  title: 'Developer',     xpRequired: 200,  cumulativeXp: 375,  tier: 'core',       color: '#3B82F6' },
  { level: 6,  title: 'Engineer',      xpRequired: 300,  cumulativeXp: 675,  tier: 'core',       color: '#3B82F6' },
  { level: 7,  title: 'Architect',     xpRequired: 400,  cumulativeXp: 1075, tier: 'core',       color: '#3B82F6' },
  { level: 8,  title: 'Wizard',        xpRequired: 500,  cumulativeXp: 1575, tier: 'prestige',   color: '#8B5CF6' },
  { level: 9,  title: 'Sage',          xpRequired: 700,  cumulativeXp: 2275, tier: 'prestige',   color: '#8B5CF6' },
  { level: 10, title: 'Sensei',        xpRequired: 1000, cumulativeXp: 3275, tier: 'legendary',  color: '#EF4444' },
  { level: 11, title: 'Legend',        xpRequired: 1500, cumulativeXp: 4775, tier: 'legendary',  color: '#EF4444' },
  { level: 12, title: 'BDFL',          xpRequired: 2500, cumulativeXp: 7275, tier: 'bdfl',       color: '#F59E0B' },
]

export function getLevelForXp(totalXp: number): LevelDef {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVELS[i].cumulativeXp) return LEVELS[i]
  }
  return LEVELS[0]
}

export function getNextLevel(currentLevel: number): LevelDef | null {
  if (currentLevel >= 12) return null
  return LEVELS[currentLevel]
}

export function getLevelProgress(totalXp: number): { current: number; max: number; percent: number } {
  const level = getLevelForXp(totalXp)
  const next = getNextLevel(level.level)

  if (!next) return { current: 0, max: 0, percent: 100 }

  const xpIntoLevel = totalXp - level.cumulativeXp
  const xpNeeded = next.xpRequired
  const percent = Math.round((xpIntoLevel / xpNeeded) * 100)

  return { current: xpIntoLevel, max: xpNeeded, percent }
}

export function getBadgeSlotCount(level: number): number {
  if (level <= 2) return 1
  if (level <= 4) return 2
  if (level <= 6) return 3
  if (level <= 8) return 4
  if (level <= 10) return 5
  return 6
}

export function getTierColor(tier: LevelTier): string {
  const colors: Record<LevelTier, string> = {
    onboarding: '#22C55E',
    core: '#3B82F6',
    prestige: '#8B5CF6',
    legendary: '#EF4444',
    bdfl: '#F59E0B',
  }
  return colors[tier]
}
