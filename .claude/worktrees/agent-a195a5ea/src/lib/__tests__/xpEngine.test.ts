import { describe, it, expect } from 'vitest'
import { calculateXpReward, XP_REWARDS } from '@/lib/xpEngine'

describe('XP_REWARDS', () => {
  it('has correct borrel check-in value', () => {
    expect(XP_REWARDS.borrelCheckIn).toBe(5)
  })

  it('has correct hackathon value', () => {
    expect(XP_REWARDS.hackathon).toBe(25)
  })

  it('has correct track completion value', () => {
    expect(XP_REWARDS.trackCompletion).toBe(100)
  })
})

describe('calculateXpReward', () => {
  it('returns scan XP for borrel event', () => {
    const result = calculateXpReward('scan', { eventName: 'Borrel Week 12' })
    expect(result).toBe(5)
  })

  it('returns scan XP for workshop event', () => {
    const result = calculateXpReward('scan', { eventName: 'React Workshop' })
    expect(result).toBe(10)
  })

  it('returns scan XP for hackathon event', () => {
    const result = calculateXpReward('scan', { eventName: 'SIT Hackathon 2026' })
    expect(result).toBe(25)
  })

  it('returns challenge XP directly from points', () => {
    const result = calculateXpReward('challenge', { points: 30 })
    expect(result).toBe(30)
  })
})
