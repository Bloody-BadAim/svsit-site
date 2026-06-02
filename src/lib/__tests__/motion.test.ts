import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// motion.ts reads window/document at call time, so we can set up globals before each test.

function loadIsReducedMotion() {
  // Re-import fresh each time by using dynamic import is tricky with vitest module cache.
  // Instead, replicate the logic directly to test it in isolation — the function is
  // a 4-line expression we can validate end-to-end via the real import plus global stubs.
  return vi.importActual<typeof import('@/lib/motion')>('@/lib/motion').then(
    (m) => m.isReducedMotion,
  )
}

describe('isReducedMotion', () => {
  // Save originals
  const originalWindow = globalThis.window
  const originalDocument = globalThis.document

  beforeEach(() => {
    // Reset to a clean environment for each test
    vi.resetModules()
  })

  afterEach(() => {
    // Restore
    if (globalThis.window !== originalWindow) {
      globalThis.window = originalWindow
    }
  })

  it('returns false when window is undefined (SSR)', async () => {
    // Temporarily hide window
    const saved = globalThis.window
    // @ts-expect-error - intentionally removing window for SSR simulation
    delete globalThis.window
    const { isReducedMotion } = await import('@/lib/motion')
    expect(isReducedMotion()).toBe(false)
    globalThis.window = saved
  })

  it('returns false when matchMedia does not match and class absent', async () => {
    // matchMedia returns no match, no class
    const mq = { matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }
    globalThis.window = {
      matchMedia: () => mq,
    } as unknown as Window & typeof globalThis

    globalThis.document = {
      documentElement: { classList: { contains: () => false } },
    } as unknown as Document

    vi.resetModules()
    const { isReducedMotion } = await import('@/lib/motion')
    expect(isReducedMotion()).toBe(false)
  })

  it('returns true when matchMedia matches (OS setting)', async () => {
    const mq = { matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }
    globalThis.window = {
      matchMedia: () => mq,
    } as unknown as Window & typeof globalThis

    globalThis.document = {
      documentElement: { classList: { contains: () => false } },
    } as unknown as Document

    vi.resetModules()
    const { isReducedMotion } = await import('@/lib/motion')
    expect(isReducedMotion()).toBe(true)
  })

  it('returns true when reduce-motion class is on <html>', async () => {
    const mq = { matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }
    globalThis.window = {
      matchMedia: () => mq,
    } as unknown as Window & typeof globalThis

    globalThis.document = {
      documentElement: { classList: { contains: (cls: string) => cls === 'reduce-motion' } },
    } as unknown as Document

    vi.resetModules()
    const { isReducedMotion } = await import('@/lib/motion')
    expect(isReducedMotion()).toBe(true)
  })

  it('returns true when both OS and class are active', async () => {
    const mq = { matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }
    globalThis.window = {
      matchMedia: () => mq,
    } as unknown as Window & typeof globalThis

    globalThis.document = {
      documentElement: { classList: { contains: () => true } },
    } as unknown as Document

    vi.resetModules()
    const { isReducedMotion } = await import('@/lib/motion')
    expect(isReducedMotion()).toBe(true)
  })
})

describe('onMotionChange', () => {
  it('returns a no-op function when window is undefined (SSR)', async () => {
    const saved = globalThis.window
    // @ts-expect-error - SSR simulation
    delete globalThis.window
    vi.resetModules()
    const { onMotionChange } = await import('@/lib/motion')
    const cleanup = onMotionChange(() => {})
    expect(typeof cleanup).toBe('function')
    expect(() => cleanup()).not.toThrow()
    globalThis.window = saved
  })

  it('registers and deregisters sit:motionchange listener', async () => {
    const addSpy = vi.fn()
    const removeSpy = vi.fn()
    const mqAddSpy = vi.fn()
    const mqRemoveSpy = vi.fn()
    const mq = { matches: false, addEventListener: mqAddSpy, removeEventListener: mqRemoveSpy }

    globalThis.window = {
      matchMedia: () => mq,
      addEventListener: addSpy,
      removeEventListener: removeSpy,
    } as unknown as Window & typeof globalThis

    vi.resetModules()
    const { onMotionChange } = await import('@/lib/motion')
    const cb = () => {}
    const cleanup = onMotionChange(cb)
    expect(addSpy).toHaveBeenCalledWith('sit:motionchange', cb)
    cleanup()
    expect(removeSpy).toHaveBeenCalledWith('sit:motionchange', cb)
  })
})
