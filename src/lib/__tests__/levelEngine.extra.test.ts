// Extra boundary coverage for levelEngine — supplements levelEngine.test.ts.
// Each case targets a branch NOT already exercised in the existing test file.

import { describe, it, expect } from 'vitest'
import { LEVELS, getLevelForXp, getNextLevel, getLevelProgress, getBadgeSlotCount } from '@/lib/levelEngine'

// ---------------------------------------------------------------------------
// getLevelForXp — boundary values between every level transition
// ---------------------------------------------------------------------------

describe('getLevelForXp — boundary transitions', () => {
  it('returns level 2 for XP exactly at level 3 threshold minus 1 (74 XP)', () => {
    expect(getLevelForXp(74).level).toBe(2)
  })

  it('returns level 3 for exactly 75 XP (level 3 threshold)', () => {
    expect(getLevelForXp(75).level).toBe(3)
  })

  it('returns level 3 for 174 XP (just under level 4 threshold)', () => {
    expect(getLevelForXp(174).level).toBe(3)
  })

  it('returns level 4 for exactly 175 XP', () => {
    expect(getLevelForXp(175).level).toBe(4)
  })

  it('returns level 4 for 374 XP (just under level 5 threshold)', () => {
    expect(getLevelForXp(374).level).toBe(4)
  })

  it('returns level 6 for exactly 675 XP', () => {
    expect(getLevelForXp(675).level).toBe(6)
  })

  it('returns level 6 for 1074 XP (just under level 7 threshold)', () => {
    expect(getLevelForXp(1074).level).toBe(6)
  })

  it('returns level 7 for exactly 1075 XP', () => {
    expect(getLevelForXp(1075).level).toBe(7)
  })

  it('returns level 7 for 1574 XP (just under level 8 threshold)', () => {
    expect(getLevelForXp(1574).level).toBe(7)
  })

  it('returns level 8 for exactly 1575 XP', () => {
    expect(getLevelForXp(1575).level).toBe(8)
  })

  it('returns level 9 for exactly 2275 XP', () => {
    expect(getLevelForXp(2275).level).toBe(9)
  })

  it('returns level 10 for exactly 3275 XP', () => {
    expect(getLevelForXp(3275).level).toBe(10)
  })

  it('returns level 11 for exactly 4775 XP', () => {
    expect(getLevelForXp(4775).level).toBe(11)
  })

  it('returns level 11 for 7274 XP (just under level 12 threshold)', () => {
    expect(getLevelForXp(7274).level).toBe(11)
  })

  it('returns level 1 for negative XP (clamps to lowest level)', () => {
    expect(getLevelForXp(-1).level).toBe(1)
  })
})

// ---------------------------------------------------------------------------
// getNextLevel — full range, including level 11 (not previously tested)
// ---------------------------------------------------------------------------

describe('getNextLevel — full range', () => {
  it('returns level 3 when on level 2', () => {
    expect(getNextLevel(2)?.level).toBe(3)
  })

  it('returns level 11 when on level 10', () => {
    expect(getNextLevel(10)?.level).toBe(11)
  })

  it('returns level 12 when on level 11', () => {
    expect(getNextLevel(11)?.level).toBe(12)
  })

  it('returns null when level is above 12 (guard)', () => {
    expect(getNextLevel(13)).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// getLevelProgress — exact threshold values
// ---------------------------------------------------------------------------

describe('getLevelProgress — exact thresholds', () => {
  it('returns 0% progress at exactly level 3 start (75 XP)', () => {
    const p = getLevelProgress(75)
    expect(p.current).toBe(0)
    expect(p.percent).toBe(0)
  })

  it('returns correct max (xpRequired) for level 3 -> 4 segment', () => {
    // Level 3 cumulative=75, level 4 requires 100 XP to reach from level 3
    const p = getLevelProgress(75)
    expect(p.max).toBe(LEVELS[3].xpRequired) // level 4's xpRequired = 100
  })

  it('returns 50% exactly halfway through level 2 (at 25 + 12 = 37, max=50)', () => {
    const p = getLevelProgress(25 + 25) // start of level 3 = 75 XP; halfway of level 2 segment = 25+25=50
    // level 2: cumulativeXp=25, next=level3 xpRequired=50. halfway = 25+25=50XP
    expect(p.percent).toBe(50)
  })

  it('returns 100% for XP above level 12 threshold (capped)', () => {
    const p = getLevelProgress(99999)
    expect(p.percent).toBe(100)
    expect(p.current).toBe(0)
    expect(p.max).toBe(0)
  })

  it('returns { current: 0, max: 0, percent: 100 } for exact level 12 XP', () => {
    const p = getLevelProgress(7275)
    expect(p).toEqual({ current: 0, max: 0, percent: 100 })
  })
})

// ---------------------------------------------------------------------------
// getBadgeSlotCount — boundaries not explicitly tested before
// ---------------------------------------------------------------------------

describe('getBadgeSlotCount — boundary values', () => {
  it('returns 2 slots for level 3', () => {
    expect(getBadgeSlotCount(3)).toBe(2)
  })

  it('returns 2 slots for level 4', () => {
    expect(getBadgeSlotCount(4)).toBe(2)
  })

  it('returns 4 slots for level 7', () => {
    expect(getBadgeSlotCount(7)).toBe(4)
  })

  it('returns 4 slots for level 8', () => {
    expect(getBadgeSlotCount(8)).toBe(4)
  })

  it('returns 5 slots for level 9', () => {
    expect(getBadgeSlotCount(9)).toBe(5)
  })

  it('returns 5 slots for level 10', () => {
    expect(getBadgeSlotCount(10)).toBe(5)
  })
})
