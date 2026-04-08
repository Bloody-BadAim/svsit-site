/**
 * In-memory sliding window rate limiter.
 *
 * Works well on Vercel thanks to Fluid Compute: the Map persists as long as
 * the function instance is alive. When the instance is recycled, the Map is
 * cleared automatically, so there is no unbounded memory growth risk.
 *
 * Each key (typically a lowercased email) gets a list of timestamps.
 * Timestamps older than the window are pruned on every call + periodically.
 */

const WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const MAX_ATTEMPTS = 5
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes

interface Entry {
  timestamps: number[]
}

const store = new Map<string, Entry>()

// Periodic cleanup to prevent memory leaks from keys that are never accessed
// again after their window expires.
let cleanupTimer: ReturnType<typeof setInterval> | null = null

function ensureCleanupRunning() {
  if (cleanupTimer) return
  cleanupTimer = setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store) {
      entry.timestamps = entry.timestamps.filter((t) => now - t < WINDOW_MS)
      if (entry.timestamps.length === 0) {
        store.delete(key)
      }
    }
    // If the store is empty, stop the timer so the process can exit cleanly
    if (store.size === 0 && cleanupTimer) {
      clearInterval(cleanupTimer)
      cleanupTimer = null
    }
  }, CLEANUP_INTERVAL_MS)

  // Allow the Node.js process to exit even if the timer is still active
  if (cleanupTimer && typeof cleanupTimer === 'object' && 'unref' in cleanupTimer) {
    cleanupTimer.unref()
  }
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  /** Seconds until the oldest attempt in the window expires */
  resetIn: number
}

/**
 * Check and record an attempt for the given key.
 *
 * @param key - Unique identifier, e.g. lowercased email address
 * @returns Whether the attempt is allowed, how many attempts remain,
 *          and how many seconds until the window resets
 */
export function rateLimit(key: string): RateLimitResult {
  ensureCleanupRunning()

  const now = Date.now()
  let entry = store.get(key)

  if (!entry) {
    entry = { timestamps: [] }
    store.set(key, entry)
  }

  // Prune timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => now - t < WINDOW_MS)

  if (entry.timestamps.length >= MAX_ATTEMPTS) {
    const oldestInWindow = entry.timestamps[0]
    const resetIn = Math.ceil((oldestInWindow + WINDOW_MS - now) / 1000)
    return { success: false, remaining: 0, resetIn }
  }

  // Record this attempt
  entry.timestamps.push(now)

  const remaining = MAX_ATTEMPTS - entry.timestamps.length
  const oldestInWindow = entry.timestamps[0]
  const resetIn = Math.ceil((oldestInWindow + WINDOW_MS - now) / 1000)

  return { success: true, remaining, resetIn }
}
