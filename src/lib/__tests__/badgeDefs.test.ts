import { describe, it, expect } from 'vitest'
import { BADGE_DEFS, getBadgeDef, getRarityColor } from '@/lib/badgeDefs'

describe('BADGE_DEFS', () => {
  it('is a non-empty array', () => {
    expect(BADGE_DEFS.length).toBeGreaterThan(0)
  })

  it('every badge has a unique id', () => {
    const ids = BADGE_DEFS.map((b) => b.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })

  it('every badge has required fields', () => {
    for (const badge of BADGE_DEFS) {
      expect(badge.id).toBeTruthy()
      expect(badge.name).toBeTruthy()
      expect(badge.rarity).toBeTruthy()
      expect(typeof badge.xpBonus).toBe('number')
      expect(badge.xpBonus).toBeGreaterThanOrEqual(0)
    }
  })

  it('all rarities are valid', () => {
    const validRarities = new Set(['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'])
    for (const badge of BADGE_DEFS) {
      expect(validRarities.has(badge.rarity)).toBe(true)
    }
  })

  it('mythic badges have the highest xpBonus (500)', () => {
    const mythicBonuses = BADGE_DEFS
      .filter((b) => b.rarity === 'mythic')
      .map((b) => b.xpBonus)
    for (const bonus of mythicBonuses) {
      expect(bonus).toBe(500)
    }
  })
})

describe('getBadgeDef', () => {
  it('returns the correct badge for a known id', () => {
    const badge = getBadgeDef('badge_joined')
    expect(badge).toBeDefined()
    expect(badge?.id).toBe('badge_joined')
    expect(badge?.rarity).toBe('common')
  })

  it('returns undefined for an unknown id', () => {
    expect(getBadgeDef('badge_does_not_exist')).toBeUndefined()
  })

  it('returns undefined for empty string', () => {
    expect(getBadgeDef('')).toBeUndefined()
  })

  it('finds a mythic badge', () => {
    const badge = getBadgeDef('badge_konami')
    expect(badge?.rarity).toBe('mythic')
    expect(badge?.xpBonus).toBe(500)
  })
})

describe('getRarityColor', () => {
  it('returns correct color for common', () => {
    expect(getRarityColor('common')).toBe('#888888')
  })

  it('returns correct color for uncommon', () => {
    expect(getRarityColor('uncommon')).toBe('#22C55E')
  })

  it('returns correct color for rare', () => {
    expect(getRarityColor('rare')).toBe('#3B82F6')
  })

  it('returns correct color for epic', () => {
    expect(getRarityColor('epic')).toBe('#8B5CF6')
  })

  it('returns correct color for legendary', () => {
    expect(getRarityColor('legendary')).toBe('#F29E18')
  })

  it('returns mythic color for mythic (special-cased)', () => {
    expect(getRarityColor('mythic')).toBe('#F29E18')
  })

  it('returns fallback color for unknown rarity', () => {
    expect(getRarityColor('godlike')).toBe('#888888')
  })

  it('returns fallback color for empty string', () => {
    expect(getRarityColor('')).toBe('#888888')
  })
})
