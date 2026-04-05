'use client'

import { useState } from 'react'
import { motion, useReducedMotion, AnimatePresence } from 'motion/react'
import { BADGE_DEFS } from '@/lib/badgeDefs'
import BadgeIcon from '@/components/badges/BadgeIcon'

interface BadgeCollectionProps {
  earnedBadges: string[]
  activeBadges: string[]
  maxSlots: number
  memberId: string
}

export default function BadgeCollection({
  earnedBadges,
  activeBadges,
  maxSlots,
  memberId,
}: BadgeCollectionProps) {
  const shouldReduceMotion = useReducedMotion()
  const [hoveredBadge, setHoveredBadge] = useState<string | null>(null)
  const [currentActive, setCurrentActive] = useState<string[]>(activeBadges)
  const [saving, setSaving] = useState(false)

  const earnedSet = new Set(earnedBadges)

  async function toggleBadge(badgeId: string) {
    if (!earnedSet.has(badgeId)) return

    const activeSet = new Set(currentActive)
    let updated: string[]

    if (activeSet.has(badgeId)) {
      // Unequip
      updated = currentActive.filter((b) => b !== badgeId)
    } else {
      // Equip — check max slots
      if (currentActive.length >= maxSlots) return
      updated = [...currentActive, badgeId]
    }

    setCurrentActive(updated)
    setSaving(true)

    try {
      const res = await fetch(`/api/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active_badges: updated }),
      })
      if (!res.ok) {
        // Revert on failure
        setCurrentActive(currentActive)
      }
    } catch {
      setCurrentActive(currentActive)
    } finally {
      setSaving(false)
    }
  }

  const activeSet = new Set(currentActive)

  return (
    <div
      className="relative"
      style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--color-border)' }}
    >
      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2" style={{ borderColor: 'var(--color-accent-gold)' }} />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2" style={{ borderColor: 'var(--color-accent-gold)' }} />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <span className="font-mono text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--color-text-muted)' }}>
          badge.collection
        </span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs" style={{ color: 'var(--color-accent-gold)' }}>
            {earnedBadges.length}/{BADGE_DEFS.length}
          </span>
          <span className="font-mono text-[10px] md:text-xs px-1.5 py-0.5" style={{ color: 'var(--color-text-muted)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {maxSlots} slots
          </span>
          {saving && (
            <span className="font-mono text-[10px] md:text-xs" style={{ color: 'var(--color-accent-gold)', opacity: 0.7 }}>
              saving...
            </span>
          )}
        </div>
      </div>

      {/* Active badge slots */}
      <div className="px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="font-mono text-[10px] md:text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-muted)' }}>
          equipped ({currentActive.length}/{maxSlots})
        </div>
        <div className="flex gap-2 flex-wrap">
          {Array.from({ length: maxSlots }).map((_, i) => {
            const badgeId = currentActive[i]
            const badge = badgeId ? BADGE_DEFS.find((b) => b.id === badgeId) : null

            return (
              <motion.div
                key={i}
                className="relative"
                initial={shouldReduceMotion ? {} : { scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 + i * 0.06, type: 'spring', stiffness: 500, damping: 15 }}
              >
                {badge ? (
                  <div
                    className="relative cursor-pointer"
                    title={`Verwijder ${badge.name}`}
                    onClick={() => toggleBadge(badge.id)}
                    style={{
                      boxShadow: '0 0 12px rgba(242, 158, 24, 0.15)',
                      border: '1px solid var(--color-accent-gold)',
                    }}
                  >
                    <BadgeIcon badgeId={badge.id} size={28} />
                  </div>
                ) : (
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: 36,
                      height: 36,
                      border: '1px dashed rgba(255,255,255,0.08)',
                    }}
                  >
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.1)' }}>+</span>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
        <p className="font-mono text-[10px] md:text-xs mt-2" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Klik een badge hieronder om te equippen of verwijderen
        </p>
      </div>

      {/* All badges grid */}
      <div className="p-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {BADGE_DEFS.map((badge, i) => {
            const isEarned = earnedSet.has(badge.id)
            const isActive = activeSet.has(badge.id)
            const canEquip = isEarned && !isActive && currentActive.length < maxSlots

            return (
              <motion.div
                key={badge.id}
                className="relative flex flex-col items-center"
                initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.03, type: 'spring', stiffness: 400, damping: 20 }}
                onMouseEnter={() => setHoveredBadge(badge.id)}
                onMouseLeave={() => setHoveredBadge(null)}
              >
                {/* Badge icon */}
                <div
                  className="relative"
                  onClick={() => isEarned && toggleBadge(badge.id)}
                  style={{
                    cursor: isEarned ? 'pointer' : 'default',
                    boxShadow: isEarned && isActive
                      ? '0 0 16px rgba(242, 158, 24, 0.35)'
                      : isEarned
                        ? `0 0 8px rgba(242, 158, 24, 0.1)`
                        : 'none',
                    border: isActive
                      ? '1px solid var(--color-accent-gold)'
                      : isEarned && canEquip
                        ? '1px solid rgba(242, 158, 24, 0.2)'
                        : '1px solid transparent',
                    outline: isEarned && !isActive && !canEquip ? '1px solid rgba(255,255,255,0.05)' : undefined,
                    transition: 'box-shadow 0.15s, border-color 0.15s',
                  }}
                >
                  <BadgeIcon badgeId={badge.id} size={28} locked={!isEarned} />

                  {/* Active checkmark */}
                  {isActive && (
                    <div
                      className="absolute -top-1 -right-1 w-3.5 h-3.5 flex items-center justify-center"
                      style={{
                        backgroundColor: 'var(--color-accent-gold)',
                        borderRadius: '50%',
                      }}
                    >
                      <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2 2 4-4" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}

                  {/* Lock overlay for locked badges */}
                  {!isEarned && (
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(9,9,11,0.4)' }}
                    >
                      <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                        <rect x="2" y="7" width="12" height="8" rx="1" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" fill="none" />
                        <path d="M5 7V5a3 3 0 016 0v2" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" fill="none" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Badge name */}
                <span
                  className="font-mono text-xs md:text-sm text-center mt-1.5 leading-tight"
                  style={{
                    color: isActive
                      ? 'var(--color-accent-gold)'
                      : isEarned
                        ? 'var(--color-text-muted)'
                        : 'rgba(255,255,255,0.15)',
                    maxWidth: 88,
                  }}
                >
                  {badge.name}
                </span>

                {/* Tooltip on hover */}
                <AnimatePresence>
                  {hoveredBadge === badge.id && (
                    <motion.div
                      className="absolute z-50 bottom-full mb-2 left-1/2 -translate-x-1/2 pointer-events-none"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div
                        className="px-3 py-2 font-mono text-xs"
                        style={{
                          backgroundColor: 'var(--color-surface)',
                          border: '1px solid var(--color-border)',
                          color: isEarned ? 'var(--color-text)' : 'var(--color-text-muted)',
                          maxWidth: 220,
                        }}
                      >
                        <div className="font-bold mb-0.5">{badge.name}</div>
                        <div style={{ color: 'var(--color-text-muted)' }}>{badge.description}</div>
                        {!isEarned ? (
                          <div className="mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
                            &#128274; vergrendeld
                          </div>
                        ) : isActive ? (
                          <div className="mt-1" style={{ color: 'var(--color-accent-gold)' }}>
                            ✓ Geequipped — klik om te verwijderen
                          </div>
                        ) : canEquip ? (
                          <div className="mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                            Klik om te equippen
                          </div>
                        ) : currentActive.length >= maxSlots ? (
                          <div className="mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
                            Alle slots vol
                          </div>
                        ) : null}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
