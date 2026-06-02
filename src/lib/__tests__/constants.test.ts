import { describe, it, expect } from 'vitest'
import { COMMISSIES, ROLLEN, SITE_CONFIG, STAT_CATEGORIES } from '@/lib/constants'

describe('COMMISSIES', () => {
  it('has 7 commissies', () => {
    expect(COMMISSIES.length).toBe(7)
  })

  it('every commissie has id, naam, beschrijving', () => {
    for (const c of COMMISSIES) {
      expect(c.id).toBeTruthy()
      expect(c.naam).toBeTruthy()
      expect(c.beschrijving).toBeTruthy()
    }
  })

  it('ids are unique', () => {
    const ids = COMMISSIES.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('includes sponsoring commissie', () => {
    const ids = COMMISSIES.map((c) => c.id)
    expect(ids).toContain('sponsoring')
  })
})

describe('ROLLEN', () => {
  it('has four roles', () => {
    const roles = Object.keys(ROLLEN)
    expect(roles).toContain('member')
    expect(roles).toContain('contributor')
    expect(roles).toContain('mentor')
    expect(roles).toContain('bestuur')
  })

  it('every role has naam and beschrijving', () => {
    for (const role of Object.values(ROLLEN)) {
      expect(role.naam).toBeTruthy()
      expect(role.beschrijving).toBeTruthy()
    }
  })
})

describe('SITE_CONFIG', () => {
  it('has domain svsit.nl', () => {
    expect(SITE_CONFIG.domain).toBe('svsit.nl')
  })

  it('url is https', () => {
    expect(SITE_CONFIG.url).toMatch(/^https:\/\//)
  })

  it('stats.commissies matches COMMISSIES.length', () => {
    expect(SITE_CONFIG.stats.commissies).toBe(COMMISSIES.length)
  })

  it('membership price is set', () => {
    expect(SITE_CONFIG.membership.price).toBeTruthy()
    expect(SITE_CONFIG.membership.priceLabel).toContain('9,99')
  })

  it('introweek year is 2026', () => {
    expect(SITE_CONFIG.introweek.year).toBe(2026)
  })

  it('introweek startIso is a valid date string', () => {
    const d = new Date(SITE_CONFIG.introweek.startIso)
    expect(isNaN(d.getTime())).toBe(false)
    expect(d.getFullYear()).toBe(2026)
  })

  it('socials has instagram and discord', () => {
    expect(SITE_CONFIG.socials.instagram.url).toContain('instagram.com')
    expect(SITE_CONFIG.socials.discord.url).toContain('discord.gg')
  })
})

describe('STAT_CATEGORIES', () => {
  it('has exactly 4 categories', () => {
    expect(STAT_CATEGORIES.length).toBe(4)
  })

  it('ids are code, social, career, game', () => {
    const ids = STAT_CATEGORIES.map((s) => s.id)
    expect(ids).toContain('code')
    expect(ids).toContain('social')
    expect(ids).toContain('career')
    expect(ids).toContain('game')
  })

  it('every category has a color string starting with #', () => {
    for (const cat of STAT_CATEGORIES) {
      expect(cat.kleur).toMatch(/^#/)
    }
  })
})
