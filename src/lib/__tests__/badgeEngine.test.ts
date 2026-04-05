import { describe, it, expect } from 'vitest'
import { BADGE_DEFS, getBadgesByRarity, getMaxEquippableSlots } from '@/lib/badgeEngine'

describe('BADGE_DEFS', () => {
  it('has at least 30 badge definitions', () => {
    expect(BADGE_DEFS.length).toBeGreaterThanOrEqual(30)
  })

  it('every badge has a valid rarity', () => {
    const validRarities = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic']
    for (const badge of BADGE_DEFS) {
      expect(validRarities).toContain(badge.rarity)
    }
  })

  it('every badge has a positive xpBonus', () => {
    for (const badge of BADGE_DEFS) {
      expect(badge.xpBonus).toBeGreaterThan(0)
    }
  })
})

describe('getBadgesByRarity', () => {
  it('returns only common badges for common filter', () => {
    const common = getBadgesByRarity('common')
    expect(common.every((b) => b.rarity === 'common')).toBe(true)
    expect(common.length).toBeGreaterThan(0)
  })

  it('returns mythic badges', () => {
    const mythic = getBadgesByRarity('mythic')
    expect(mythic.length).toBeGreaterThanOrEqual(3)
  })
})

describe('getMaxEquippableSlots', () => {
  it('returns 1 for level 1', () => {
    expect(getMaxEquippableSlots(1)).toBe(1)
  })

  it('returns 6 for level 12', () => {
    expect(getMaxEquippableSlots(12)).toBe(6)
  })
})
