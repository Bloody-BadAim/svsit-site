'use client'

import { useEffect } from 'react'

/**
 * Runs once on mount and grants the badge_404 easter egg badge
 * if the user visits the dashboard exactly at 4:04 AM.
 */
export default function EasterEggTimeCheck() {
  useEffect(() => {
    const now = new Date()
    if (now.getHours() === 4 && now.getMinutes() === 4) {
      fetch('/api/easter-egg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ triggerId: 'time_404' }),
      }).catch(() => {/* silently ignore */})
    }
  }, [])

  return null
}
