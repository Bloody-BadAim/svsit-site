'use client'

import { motion, useReducedMotion } from 'motion/react'
import { LEVELS, getLevelForXp, getLevelProgress, getTierColor } from '@/lib/levelEngine'

interface ProgressionTrackerProps {
  // Legacy prop — kept for call-site compatibility, ignored internally
  currentRank?: string
  /** Member's total XP — also accepted as total_xp for call-site flexibility */
  points?: number
  total_xp?: number
}

export default function ProgressionTracker({ points, total_xp }: ProgressionTrackerProps) {
  const shouldReduceMotion = useReducedMotion()
  const totalXp = total_xp ?? points ?? 0
  const currentLevelDef = getLevelForXp(totalXp)
  const currentIndex = currentLevelDef.level - 1
  const nextLevelDef = LEVELS[currentIndex + 1] ?? null
  const levelProgress = getLevelProgress(totalXp)

  // Progress between current and next level (0-1)
  const segmentProgress = levelProgress.max > 0 ? levelProgress.current / levelProgress.max : 1

  return (
    <div
      className="relative overflow-hidden"
      style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--color-border)' }}
    >
      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2" style={{ borderColor: currentLevelDef.color }} />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2" style={{ borderColor: currentLevelDef.color }} />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <span className="font-mono text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--color-text-muted)' }}>
          progression.rank
        </span>
        <span className="font-mono text-xs" style={{ color: currentLevelDef.color }}>
          {totalXp} XP
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
              backgroundColor: currentLevelDef.color,
              boxShadow: `0 0 12px ${currentLevelDef.color}60`,
            }}
            initial={shouldReduceMotion ? { width: `${((currentIndex + segmentProgress) / (LEVELS.length - 1)) * 100}%` } : { width: 0 }}
            animate={{ width: `${((currentIndex + segmentProgress) / (LEVELS.length - 1)) * 100}%` }}
            transition={{ delay: 0.3, duration: 1.2, type: 'spring', stiffness: 50, damping: 18 }}
          />

          {/* Level nodes */}
          <div className="relative flex justify-between">
            {LEVELS.map((lvl, i) => {
              const isActive = i === currentIndex
              const isCompleted = i < currentIndex
              const isLocked = i > currentIndex

              return (
                <motion.div
                  key={lvl.title}
                  className="flex flex-col items-center"
                  style={{ width: `${100 / LEVELS.length}%` }}
                  initial={shouldReduceMotion ? {} : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.08, type: 'spring', stiffness: 400, damping: 28 }}
                >
                  {/* Node dot */}
                  <div className="relative">
                    {/* Pulse ring for active level */}
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        style={{
                          width: 24,
                          height: 24,
                          top: -4,
                          left: -4,
                          border: `1px solid ${lvl.color}`,
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
                        backgroundColor: isLocked ? 'rgba(255,255,255,0.08)' : lvl.color,
                        boxShadow: isActive ? `0 0 16px ${lvl.color}80, 0 0 4px ${lvl.color}` : 'none',
                        border: isLocked ? '1px dashed rgba(255,255,255,0.15)' : 'none',
                        transition: 'all 0.3s ease',
                      }}
                    />
                  </div>

                  {/* Level name */}
                  <span
                    className="font-mono text-[10px] sm:text-xs uppercase tracking-wider mt-3 text-center leading-tight"
                    style={{
                      color: isLocked ? 'rgba(255,255,255,0.2)' : isActive ? lvl.color : 'var(--color-text-muted)',
                      fontWeight: isActive ? 700 : 400,
                    }}
                  >
                    <span style={{ opacity: isLocked ? 0.5 : 0.7 }}>L{lvl.level}</span>
                    <br />
                    {lvl.title}
                  </span>

                  {/* XP requirement */}
                  <span
                    className="font-mono text-[10px] sm:text-xs mt-0.5"
                    style={{
                      color: isLocked ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.25)',
                    }}
                  >
                    {lvl.cumulativeXp > 0 ? `${lvl.cumulativeXp}xp` : '0xp'}
                  </span>

                  {/* Completed check */}
                  {isCompleted && (
                    <motion.span
                      className="font-mono text-xs mt-1"
                      style={{ color: lvl.color }}
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

        {/* Next level info */}
        {nextLevelDef && (
          <motion.div
            className="mt-6 flex items-center justify-between font-mono text-xs md:text-sm"
            style={{ borderTop: '1px dashed rgba(255,255,255,0.06)', paddingTop: 12 }}
            initial={shouldReduceMotion ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <span style={{ color: 'var(--color-text-muted)' }}>
              volgende: <span style={{ color: nextLevelDef.color }}>{nextLevelDef.title}</span>
            </span>
            <span style={{ color: 'var(--color-text-muted)' }}>
              <span style={{ color: currentLevelDef.color }}>{nextLevelDef.cumulativeXp - totalXp}</span> xp nodig
            </span>
          </motion.div>
        )}

        {/* Max level message */}
        {!nextLevelDef && (
          <motion.div
            className="mt-6 text-center font-mono text-xs md:text-sm"
            style={{ borderTop: '1px dashed rgba(255,255,255,0.06)', paddingTop: 12, color: currentLevelDef.color }}
            initial={shouldReduceMotion ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            &#9733; MAX LEVEL BEREIKT &#9733;
          </motion.div>
        )}
      </div>
    </div>
  )
}
