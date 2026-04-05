'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Swords, Clock, Users, Flame, Trophy, SkullIcon } from 'lucide-react'
import type { BossFight } from '@/types/gamification'

interface BossData {
  boss: BossFight | null
  contributions: {
    total: number
    contributors: number
    top3: { memberId: string; xp: number }[]
    myRank?: number
  }
  myContribution: number
}

// ---------------------------------------------------------------------------
// Danger stripe style — defined once, used at top and bottom
// ---------------------------------------------------------------------------
const DANGER_STRIPE_STYLE = {
  background:
    'repeating-linear-gradient(90deg, #EF4444 0px, #EF4444 8px, transparent 8px, transparent 16px)',
  opacity: 0.4,
}

// ---------------------------------------------------------------------------
// Countdown helper
// ---------------------------------------------------------------------------
function useCountdown(targetDate: Date | null) {
  const [label, setLabel] = useState<string>('')

  useEffect(() => {
    if (!targetDate) return
    const update = () => {
      const diff = targetDate.getTime() - Date.now()
      if (diff <= 0) { setLabel('Verlopen'); return }
      const days = Math.floor(diff / 86_400_000)
      const hours = Math.floor((diff % 86_400_000) / 3_600_000)
      const mins = Math.floor((diff % 3_600_000) / 60_000)
      if (days > 0) setLabel(`${days}d ${hours}u`)
      else if (hours > 0) setLabel(`${hours}u ${mins}m`)
      else setLabel(`${mins}m`)
    }
    update()
    const id = setInterval(update, 60_000)
    return () => clearInterval(id)
  }, [targetDate])

  return label
}

// ---------------------------------------------------------------------------
// HP gradient — shifts to danger colors when low
// ---------------------------------------------------------------------------
function hpGradient(pct: number): string {
  if (pct > 50) return 'linear-gradient(90deg, #22C55E, #84CC16, #F59E0B)'
  if (pct > 25) return 'linear-gradient(90deg, #F59E0B, #EF4444)'
  return 'linear-gradient(90deg, #EF4444, #7F1D1D)'
}

// ---------------------------------------------------------------------------
// No boss state
// ---------------------------------------------------------------------------
function NoBoss() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
      <p className="text-gray-500 text-xs font-mono tracking-wider">Geen actieve boss fight</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Defeated state
// ---------------------------------------------------------------------------
function DefeatedState({ boss, myContribution }: { boss: BossFight; myContribution: number }) {
  return (
    <div className="rounded-xl border border-green-500/20 bg-green-900/5 overflow-hidden">
      <div className="h-[3px]" style={{ background: 'linear-gradient(90deg, #22C55E, #84CC16, #22C55E)' }} />
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span
            className="text-[9px] font-mono uppercase tracking-[3px]"
            style={{ color: '#22C55E66' }}
          >
            STATUS
          </span>
          <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded border border-green-400/20">
            <Trophy size={10} />
            VERSLAGEN!
          </span>
        </div>
        <p className="text-white font-mono font-bold text-lg mb-1">{boss.name}</p>
        {myContribution > 0 && (
          <p className="text-xs font-mono text-gray-400">
            Jouw bijdrage: <span className="text-[#F59E0B] font-bold">{myContribution} XP</span>
          </p>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Failed state
// ---------------------------------------------------------------------------
function FailedState({ boss }: { boss: BossFight }) {
  return (
    <div className="rounded-xl border border-red-900/30 bg-red-900/5 overflow-hidden opacity-70">
      <div className="h-[3px]" style={{ background: 'linear-gradient(90deg, #7F1D1D, #EF4444, #7F1D1D)' }} />
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[9px] font-mono uppercase tracking-[3px] text-red-500/50">STATUS</span>
          <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-red-400 bg-red-400/10 px-2 py-1 rounded border border-red-400/20">
            <SkullIcon size={10} />
            ONTSNAPT
          </span>
        </div>
        <p className="text-white/60 font-mono font-bold text-lg">{boss.name}</p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Announced state
// ---------------------------------------------------------------------------
function AnnouncedState({ boss }: { boss: BossFight }) {
  const countdown = useCountdown(new Date(boss.startsAt))

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
      {/* Top danger stripe */}
      <div className="h-[3px]" style={DANGER_STRIPE_STYLE} />
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[9px] font-mono uppercase tracking-[3px] text-yellow-500/60">
            INCOMING
          </span>
          <motion.span
            className="text-[11px] font-mono text-yellow-400 border border-yellow-400/30 px-2 py-0.5 rounded flex items-center gap-1"
            animate={{ opacity: [1, 0.4, 1], borderColor: ['rgba(234,179,8,0.3)', 'rgba(234,179,8,0.7)', 'rgba(234,179,8,0.3)'] }}
            transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity }}
          >
            <Clock size={10} />
            {countdown}
          </motion.span>
        </div>
        <p className="text-white font-mono font-bold text-[18px] mb-1">{boss.name}</p>
        {boss.description && (
          <p className="text-gray-400 text-xs leading-relaxed">{boss.description}</p>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Active — full war room
// ---------------------------------------------------------------------------
function ActiveState({ boss, contributions, myContribution }: {
  boss: BossFight
  contributions: BossData['contributions']
  myContribution: number
}) {
  const hpPercent = Math.min(100, Math.max(0, (boss.currentHp / boss.hp) * 100))
  const countdown = useCountdown(new Date(boss.deadline))
  const prevHpRef = useRef(hpPercent)
  const [damageTick, setDamageTick] = useState(false)

  // Flash the damage tick when HP changes
  useEffect(() => {
    if (hpPercent !== prevHpRef.current) {
      prevHpRef.current = hpPercent
      setDamageTick(true)
      const t = setTimeout(() => setDamageTick(false), 400)
      return () => clearTimeout(t)
    }
  }, [hpPercent])

  return (
    <div className="rounded-xl border border-red-900/30 bg-[#0c0c0e] overflow-hidden">
      {/* Top danger stripe */}
      <div className="h-[3px]" style={DANGER_STRIPE_STYLE} />

      <div className="p-5 space-y-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span
              className="block text-[9px] font-mono uppercase tracking-[3px] mb-1"
              style={{ color: '#EF444480' }}
            >
              ACTIVE THREAT
            </span>
            <p className="text-white font-mono font-bold text-[18px] leading-tight truncate">
              {boss.name}
            </p>
          </div>
          <motion.span
            className="shrink-0 text-[11px] font-mono text-red-400 border border-red-400/30 px-2 py-1 rounded flex items-center gap-1 whitespace-nowrap"
            animate={{
              opacity: [1, 0.5, 1],
              borderColor: ['rgba(239,68,68,0.3)', 'rgba(239,68,68,0.8)', 'rgba(239,68,68,0.3)'],
            }}
            transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity }}
          >
            <Clock size={10} />
            {countdown}
          </motion.span>
        </div>

        {/* Description */}
        {boss.description && (
          <p className="text-gray-500 text-xs leading-relaxed">{boss.description}</p>
        )}

        {/* HP bar */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
            <span className="text-gray-400 flex items-center gap-1">
              <Flame size={11} className="text-red-500" />
              {boss.currentHp.toLocaleString('nl-NL')} / {boss.hp.toLocaleString('nl-NL')} HP
            </span>
            <span className="text-gray-600">{Math.round(hpPercent)}%</span>
          </div>

          {/* Bar track */}
          <div
            className="relative h-2 rounded-full overflow-hidden"
            style={{ backgroundColor: 'rgba(127,29,29,0.15)' }}
          >
            {/* Fill */}
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ background: hpGradient(hpPercent) }}
              animate={{ width: `${hpPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />

            {/* Shimmer overlay */}
            <div
              className="absolute inset-0 rounded-full pointer-events-none overflow-hidden"
              style={{ width: `${hpPercent}%` }}
            >
              <motion.div
                className="absolute inset-y-0 w-1/3"
                style={{
                  background:
                    'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)',
                }}
                animate={{ x: ['-100%', '400%'] }}
                transition={{ duration: 2, ease: 'linear', repeat: Infinity }}
              />
            </div>

            {/* Damage tick flash at the fill edge */}
            <AnimatePresence>
              {damageTick && (
                <motion.div
                  className="absolute inset-y-0 w-1 rounded-full bg-white"
                  style={{ left: `calc(${hpPercent}% - 2px)` }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.8, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-5 text-[11px] font-mono">
          <span className="flex items-center gap-1.5 text-white">
            <Users size={11} className="text-gray-500" />
            <span className="text-gray-400">Strijders:</span>
            {contributions.contributors}
          </span>
          <span className="flex items-center gap-1.5">
            <Swords size={11} className="text-[#F59E0B]" />
            <span className="text-gray-400">Jouw DMG:</span>
            <span className="text-[#F59E0B] font-bold">{myContribution} XP</span>
          </span>
          {contributions.myRank != null && (
            <span className="flex items-center gap-1.5">
              <Trophy size={11} className="text-green-400" />
              <span className="text-gray-400">Rank:</span>
              <span className="text-green-400 font-bold">#{contributions.myRank}</span>
            </span>
          )}
        </div>
      </div>

      {/* Bottom danger stripe */}
      <div className="h-[2px]" style={DANGER_STRIPE_STYLE} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------
export function BossFightWidget() {
  const [data, setData] = useState<BossData | null>(null)

  useEffect(() => {
    const fetchBoss = async () => {
      try {
        const res = await fetch('/api/boss')
        if (!res.ok) return
        const json = await res.json()
        setData(json)
      } catch {
        // Silently ignore — widget degrades gracefully
      }
    }
    fetchBoss()
    const id = setInterval(fetchBoss, 30_000)
    return () => clearInterval(id)
  }, [])

  if (!data?.boss) return <NoBoss />

  const { boss, contributions, myContribution } = data

  if (boss.status === 'defeated') return <DefeatedState boss={boss} myContribution={myContribution} />
  if (boss.status === 'failed')   return <FailedState boss={boss} />
  if (boss.status === 'announced') return <AnnouncedState boss={boss} />

  return (
    <ActiveState
      boss={boss}
      contributions={contributions}
      myContribution={myContribution}
    />
  )
}
