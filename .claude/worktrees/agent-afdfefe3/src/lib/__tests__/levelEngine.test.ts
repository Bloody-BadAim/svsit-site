import { describe, it, expect } from 'vitest'
import { LEVELS, getLevelForXp, getLevelProgress, getBadgeSlotCount, getNextLevel } from '@/lib/levelEngine'

describe('LEVELS', () => {
  it('has 12 levels', () => {
    expect(LEVELS).toHaveLength(12)
  })

  it('starts at level 1 with 0 cumulative XP', () => {
    expect(LEVELS[0].level).toBe(1)
    expect(LEVELS[0].cumulativeXp).toBe(0)
  })

  it('ends at level 12 (BDFL) with 7275 cumulative XP', () => {
    expect(LEVELS[11].level).toBe(12)
    expect(LEVELS[11].title).toBe('BDFL')
    expect(LEVELS[11].cumulativeXp).toBe(7275)
  })
})

describe('getLevelForXp', () => {
  it('returns level 1 for 0 XP', () => {
    expect(getLevelForXp(0)).toEqual(LEVELS[0])
  })

  it('returns level 1 for 24 XP (just under level 2)', () => {
    expect(getLevelForXp(24)).toEqual(LEVELS[0])
  })

  it('returns level 2 for exactly 25 XP', () => {
    expect(getLevelForXp(25)).toEqual(LEVELS[1])
  })

  it('returns level 5 for 375 XP', () => {
    expect(getLevelForXp(375).level).toBe(5)
  })

  it('returns level 12 for 7275 XP', () => {
    expect(getLevelForXp(7275).level).toBe(12)
  })

  it('returns level 12 for XP above max (10000)', () => {
    expect(getLevelForXp(10000).level).toBe(12)
  })
})

describe('getLevelProgress', () => {
  it('returns 0% at start of a level', () => {
    const progress = getLevelProgress(25)
    expect(progress.current).toBe(0)
    expect(progress.percent).toBe(0)
  })

  it('returns 50% halfway through a level', () => {
    const progress = getLevelProgress(50)
    expect(progress.percent).toBe(50)
  })

  it('returns 100% progress for max level', () => {
    const progress = getLevelProgress(7275)
    expect(progress.percent).toBe(100)
  })
})

describe('getBadgeSlotCount', () => {
  it('returns 1 slot for levels 1-2', () => {
    expect(getBadgeSlotCount(1)).toBe(1)
    expect(getBadgeSlotCount(2)).toBe(1)
  })

  it('returns 3 slots for levels 5-6', () => {
    expect(getBadgeSlotCount(5)).toBe(3)
    expect(getBadgeSlotCount(6)).toBe(3)
  })

  it('returns 6 slots for levels 11-12', () => {
    expect(getBadgeSlotCount(11)).toBe(6)
    expect(getBadgeSlotCount(12)).toBe(6)
  })
})

describe('getNextLevel', () => {
  it('returns level 2 when on level 1', () => {
    expect(getNextLevel(1)?.level).toBe(2)
  })

  it('returns null when on level 12', () => {
    expect(getNextLevel(12)).toBeNull()
  })
})
