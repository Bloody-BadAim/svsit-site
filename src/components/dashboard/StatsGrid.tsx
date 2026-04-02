'use client'

import { motion, useReducedMotion } from 'motion/react'
import { getRank, RANKS, getLevel, getLevelProgress, getPrestige } from '@/lib/constants'

interface StatsGridProps {
  points: number
  role: string
  commissie: string | null
  memberSince: string | null
  dynamicStats: { code: number; social: number; learn: number; impact: number }
}

export default function StatsGrid({ points, role, commissie, memberSince, dynamicStats }: StatsGridProps) {
  const rank = getRank(points)
  const nextRank = RANKS.find(r => r.minPunten > points)
  const progress = nextRank
    ? ((points - rank.minPunten) / (nextRank.minPunten - rank.minPunten)) * 100
    : 100
  const since = memberSince ? new Date(memberSince).toLocaleDateString('nl-NL', { month: 'short', year: 'numeric' }) : '—'
  const shouldReduceMotion = useReducedMotion()
  const level = getLevel(points)
  const levelProgress = getLevelProgress(points)
  const prestige = getPrestige(points)

  const maxStat = Math.max(dynamicStats.code, dynamicStats.social, dynamicStats.learn, dynamicStats.impact, 10)
  const statBars = [
    { label: 'CODE', value: dynamicStats.code, max: maxStat, color: 'var(--color-accent-blue)', suffix: '' },
    { label: 'LEARN', value: dynamicStats.learn, max: maxStat, color: 'var(--color-accent-gold)', suffix: '' },
    { label: 'SOC', value: dynamicStats.social, max: maxStat, color: 'var(--color-accent-green)', suffix: '' },
    { label: 'IMPACT', value: dynamicStats.impact, max: maxStat, color: 'var(--color-accent-red)', suffix: '' },
  ]

  return (
    <div
      className="relative overflow-hidden"
      style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--color-border)' }}
    >
      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2" style={{ borderColor: 'var(--color-accent-gold)' }} />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2" style={{ borderColor: 'var(--color-accent-gold)' }} />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />

      {/* Header bar */}
      <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: 'var(--color-text-muted)' }}>
          character.stats
        </span>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px]" style={{ color: 'var(--color-accent-gold)' }}>
            LVL {String(level).padStart(2, '0')}
          </span>
          {prestige > 0 && (
            <span className="font-mono text-[10px] px-1.5 py-0.5" style={{ color: '#F29E18', background: 'rgba(242,158,24,0.1)' }}>
              P{prestige}
            </span>
          )}
          <span className="text-[10px] font-mono px-2 py-0.5" style={{ color: rank.kleur, border: `1px solid ${rank.kleur}40` }}>
            {rank.naam.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Rank + Level progress */}
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <div className="flex items-baseline gap-3">
              <span
                className="text-4xl font-bold tracking-tight"
                style={{ color: rank.kleur, fontFamily: "'Big Shoulders Display', var(--font-geist-sans), sans-serif" }}
              >
                {rank.naam}
              </span>
              <span className="font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {points} xp · lvl {level}
              </span>
            </div>
            <span className="font-mono text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
              {nextRank ? `${nextRank.minPunten - points} tot ${nextRank.naam}` : `${levelProgress.current}/${levelProgress.max} xp`}
            </span>
          </div>
          <div className="h-2 overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
            <motion.div
              className="h-full"
              style={{ backgroundColor: rank.kleur, boxShadow: `0 0 12px ${rank.kleur}60` }}
              initial={shouldReduceMotion ? { width: `${progress}%` } : { width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ delay: 0.3, duration: 1, type: 'spring', stiffness: 60, damping: 15 }}
            />
          </div>
        </div>

        {/* Stat bars — RPG style */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
          {statBars.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="flex items-center gap-3"
              initial={shouldReduceMotion ? {} : { opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.08, type: 'spring', stiffness: 400, damping: 28 }}
            >
              <span className="font-mono text-[11px] font-bold w-7 shrink-0" style={{ color: stat.color }}>
                {stat.label}
              </span>
              <div className="flex-1 h-[6px] overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
                <motion.div
                  className="h-full"
                  style={{ backgroundColor: stat.color, opacity: 0.8 }}
                  initial={shouldReduceMotion ? { width: `${(stat.value / stat.max) * 100}%` } : { width: 0 }}
                  animate={{ width: `${(stat.value / stat.max) * 100}%` }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.8, type: 'spring', stiffness: 80, damping: 18 }}
                />
              </div>
              <span className="font-mono text-[10px] w-10 text-right shrink-0" style={{ color: 'var(--color-text-muted)' }}>
                {stat.value}{stat.suffix}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Character info line */}
        <div
          className="flex items-center gap-6 pt-3 font-mono text-[11px]"
          style={{ borderTop: '1px dashed rgba(255,255,255,0.06)', color: 'var(--color-text-muted)' }}
        >
          <span>
            class: <span style={{ color: 'var(--color-accent-blue)' }}>{role}</span>
          </span>
          {commissie && (
            <span>
              guild: <span style={{ color: 'var(--color-accent-green)' }}>{commissie}</span>
            </span>
          )}
          <span>
            joined: <span style={{ color: 'var(--color-text)' }}>{since}</span>
          </span>
        </div>
      </div>
    </div>
  )
}
