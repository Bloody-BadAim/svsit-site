import { describe, it, expect } from 'vitest'
import { CARD_SKINS, getSkin, getUnlockedSkins } from '@/lib/cardSkins'

describe('CARD_SKINS', () => {
  it('contains at least one skin', () => {
    expect(CARD_SKINS.length).toBeGreaterThan(0)
  })

  it('first entry is the default skin', () => {
    expect(CARD_SKINS[0].id).toBe('default')
  })

  it('every skin has required fields', () => {
    for (const skin of CARD_SKINS) {
      expect(skin.id).toBeTruthy()
      expect(skin.naam).toBeTruthy()
      expect(['level', 'badge', 'track']).toContain(skin.unlockType)
      expect(skin.unlockRequirement).toBeTruthy()
      expect(typeof skin.animated).toBe('boolean')
    }
  })
})

describe('getSkin', () => {
  it('returns the correct skin for a known id', () => {
    const skin = getSkin('skin_digital_rain')
    expect(skin.id).toBe('skin_digital_rain')
    expect(skin.naam).toBe('Digital Rain')
  })

  it('falls back to default skin for unknown id', () => {
    const skin = getSkin('does_not_exist')
    expect(skin.id).toBe('default')
  })

  it('returns default when given empty string', () => {
    expect(getSkin('').id).toBe('default')
  })
})

describe('getUnlockedSkins', () => {
  it('unlocks only the default skin at level 1 with no badges or tracks', () => {
    const skins = getUnlockedSkins(1, [], [])
    const ids = skins.map((s) => s.id)
    expect(ids).toContain('default')
    expect(ids).not.toContain('skin_digital_rain') // requires level 2
  })

  it('unlocks level skins up to the provided level', () => {
    const skins = getUnlockedSkins(5, [], [])
    const ids = skins.map((s) => s.id)
    expect(ids).toContain('skin_hologram') // requires level 5
    expect(ids).not.toContain('skin_neon_city') // requires level 8
  })

  it('unlocks badge skins when badge is present', () => {
    const skins = getUnlockedSkins(1, ['badge_hackathon'], [])
    const ids = skins.map((s) => s.id)
    expect(ids).toContain('skin_hackathon')
  })

  it('does not unlock badge skin without the badge', () => {
    const skins = getUnlockedSkins(12, [], [])
    const ids = skins.map((s) => s.id)
    expect(ids).not.toContain('skin_hackathon')
  })

  it('unlocks track skins when track is completed', () => {
    const skins = getUnlockedSkins(1, [], ['fullstack'])
    const ids = skins.map((s) => s.id)
    expect(ids).toContain('skin_fullstack')
  })

  it('unlocks all skins at max level with all badges and tracks', () => {
    const allBadges = CARD_SKINS
      .filter((s) => s.unlockType === 'badge')
      .map((s) => s.unlockRequirement)
    const allTracks = CARD_SKINS
      .filter((s) => s.unlockType === 'track')
      .map((s) => s.unlockRequirement)
    const skins = getUnlockedSkins(100, allBadges, allTracks)
    expect(skins.length).toBe(CARD_SKINS.length)
  })
})
