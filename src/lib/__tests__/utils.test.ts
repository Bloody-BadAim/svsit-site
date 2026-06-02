import { describe, it, expect } from 'vitest'
import { cn, formatDate } from '@/lib/utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes (falsy ignored)', () => {
    expect(cn('base', false && 'hidden', undefined, 'active')).toBe('base active')
  })

  it('tailwind-merges conflicting utilities - last wins', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })

  it('returns empty string for no arguments', () => {
    expect(cn()).toBe('')
  })

  it('deduplicates same class', () => {
    // twMerge keeps last occurrence of a Tailwind class group
    const result = cn('text-sm', 'text-lg')
    expect(result).toBe('text-lg')
  })
})

describe('formatDate', () => {
  it('returns a non-empty string for a valid ISO date', () => {
    const result = formatDate('2025-10-15T18:30:00.000Z')
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('includes the year', () => {
    const result = formatDate('2025-10-15T18:30:00.000Z')
    expect(result).toContain('2025')
  })

  it('works for midnight UTC', () => {
    const result = formatDate('2024-01-01T00:00:00.000Z')
    expect(result).toContain('2024')
  })

  it('produces different output for different dates', () => {
    const a = formatDate('2025-03-01T10:00:00.000Z')
    const b = formatDate('2025-09-01T10:00:00.000Z')
    expect(a).not.toBe(b)
  })
})
