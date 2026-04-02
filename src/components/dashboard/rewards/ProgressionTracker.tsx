'use client'

import { motion, useReducedMotion } from 'motion/react'
import { RANKS } from '@/lib/constants'

interface ProgressionTrackerProps {
  currentRank: string
  points: number
}

export default function ProgressionTracker({ currentRank, points }: ProgressionTrackerProps) {
  const shouldReduceMotion = useReducedMotion()
  const currentIndex = RANKS.findIndex((r) => r.naam === currentRank)
  const nextRank = RANKS[currentIndex + 1] ?? null
  const currentRankDef = RANKS[currentIndex] ?? RANKS[0]

  // Progress between current and next rank (0-1)
  const segmentProgress = nextRank
    ? (points - currentRankDef.minPunten) / (nextRank.minPunten - currentRankDef.minPunten)
    : 1

  return (
    <div
      className="relative overflow-hidden"
      style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--color-border)' }}
    >
      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2" style={{ borderColor: currentRankDef.kleur }} />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2" style={{ borderColor: currentRankDef.kleur }} />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: 'var(--color-text-muted)' }}>
          progression.rank
        </span>
        <span className="font-mono text-[10px]" style={{ color: currentRankDef.kleur }}>
          {points} XP
        </span>
      </div>

      <div className="p-5 sm:p-6">
        {/* Rank timeline */}
        <div className="relative">
          {/* Background track line */}
          <div
            className="absolute top-4 left-0 right-0 h-[2px]"
            style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
          />

          {/* Progress fill line */}
          <motion.div
            className="absolute top-4 left-0 h-[2px]"
            style={{
              backgroundColor: currentRankDef.kleur,
              boxShadow: `0 0 12px ${currentRankDef.kleur}60`,
            }}
            initial={shouldReduceMotion ? { width: `${((currentIndex + segmentProgress) / (RANKS.length - 1)) * 100}%` } : { width: 0 }}
            animate={{ width: `${((currentIndex + segmentProgress) / (RANKS.length - 1)) * 100}%` }}
            transition={{ delay: 0.3, duration: 1.2, type: 'spring', stiffness: 50, damping: 18 }}
          />

          {/* Rank nodes */}
          <div className="relative flex justify-between">
            {RANKS.map((rank, i) => {
              const isActive = i === currentIndex
              const isCompleted = i < currentIndex
              const isLocked = i > currentIndex

              return (
                <motion.div
                  key={rank.naam}
                  className="flex flex-col items-center"
                  style={{ width: `${100 / RANKS.length}%` }}
                  initial={shouldReduceMotion ? {} : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.08, type: 'spring', stiffness: 400, damping: 28 }}
                >
                  {/* Node dot */}
                  <div className="relative">
                    {/* Pulse ring for active rank */}
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        style={{
                          width: 24,
                          height: 24,
                          top: -4,
                          left: -4,
                          border: `1px solid ${rank.kleur}`,
                          borderRadius: '50%',
                        }}
                        animate={shouldReduceMotion ? {} : { scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    )}
                    <div
                      className="relative z-10 rounded-full"
                      style={{
                        width: isActive ? 16 : 10,
                        height: isActive ? 16 : 10,
                        backgroundColor: isLocked ? 'rgba(255,255,255,0.08)' : rank.kleur,
                        boxShadow: isActive ? `0 0 16px ${rank.kleur}80, 0 0 4px ${rank.kleur}` : 'none',
                        border: isLocked ? '1px dashed rgba(255,255,255,0.15)' : 'none',
                        transition: 'all 0.3s ease',
                      }}
                    />
                  </div>

                  {/* Rank name */}
                  <span
                    className="font-mono text-[9px] sm:text-[10px] uppercase tracking-wider mt-3 text-center"
                    style={{
                      color: isLocked ? 'rgba(255,255,255,0.2)' : isActive ? rank.kleur : 'var(--color-text-muted)',
                      fontWeight: isActive ? 700 : 400,
                    }}
                  >
                    {rank.naam}
                  </span>

                  {/* XP requirement */}
                  <span
                    className="font-mono text-[8px] sm:text-[9px] mt-0.5"
                    style={{
                      color: isLocked ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.25)',
                    }}
                  >
                    {rank.minPunten > 0 ? `${rank.minPunten}xp` : '0xp'}
                  </span>

                  {/* Completed check */}
                  {isCompleted && (
                    <motion.span
                      className="font-mono text-[10px] mt-1"
                      style={{ color: rank.kleur }}
                      initial={shouldReduceMotion ? {} : { scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5 + i * 0.05, type: 'spring', stiffness: 500, damping: 12 }}
                    >
                      &#10003;
                    </motion.span>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Next rank info */}
        {nextRank && (
          <motion.div
            className="mt-6 flex items-center justify-between font-mono text-[11px]"
            style={{ borderTop: '1px dashed rgba(255,255,255,0.06)', paddingTop: 12 }}
            initial={shouldReduceMotion ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <span style={{ color: 'var(--color-text-muted)' }}>
              volgende: <span style={{ color: nextRank.kleur }}>{nextRank.naam}</span>
            </span>
            <span style={{ color: 'var(--color-text-muted)' }}>
              <span style={{ color: currentRankDef.kleur }}>{nextRank.minPunten - points}</span> xp nodig
            </span>
          </motion.div>
        )}

        {/* Max rank message */}
        {!nextRank && (
          <motion.div
            className="mt-6 text-center font-mono text-[11px]"
            style={{ borderTop: '1px dashed rgba(255,255,255,0.06)', paddingTop: 12, color: currentRankDef.kleur }}
            initial={shouldReduceMotion ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            &#9733; MAX RANK BEREIKT &#9733;
          </motion.div>
        )}
      </div>
    </div>
  )
}
