'use client'

import { useState, useEffect } from 'react'
import type { BossFight } from '@/types/gamification'

interface BossData {
  boss: BossFight | null
  contributions: {
    total: number
    contributors: number
    top3: { memberId: string; xp: number }[]
  }
  myContribution: number
}

export function BossFightWidget() {
  const [data, setData] = useState<BossData | null>(null)

  useEffect(() => {
    const fetchBoss = async () => {
      const res = await fetch('/api/boss')
      if (!res.ok) return
      const json = await res.json()
      setData(json)
    }
    fetchBoss()
    const interval = setInterval(fetchBoss, 30000)
    return () => clearInterval(interval)
  }, [])

  if (!data?.boss) return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
      <p className="text-gray-500 text-sm font-mono">Geen actieve boss fight</p>
    </div>
  )

  const { boss, contributions, myContribution } = data
  const hpPercent = Math.min((boss.currentHp / boss.hp) * 100, 100)
  const isDefeated = boss.status === 'defeated'
  const isFailed = boss.status === 'failed'
  const deadline = new Date(boss.deadline)

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold font-mono text-white">{boss.name}</h3>
        {isDefeated && (
          <span className="text-xs font-mono font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded">
            VERSLAGEN!
          </span>
        )}
        {isFailed && (
          <span className="text-xs font-mono font-bold text-red-400 bg-red-400/10 px-2 py-1 rounded">
            ONTSNAPT
          </span>
        )}
      </div>

      {boss.description && (
        <p className="text-gray-400 text-sm mb-4">{boss.description}</p>
      )}

      {/* Health bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs font-mono text-gray-500 mb-1">
          <span>{boss.currentHp.toLocaleString()} / {boss.hp.toLocaleString()} HP</span>
          <span>{Math.round(hpPercent)}%</span>
        </div>
        <div className="h-4 rounded-full bg-red-900/30 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${hpPercent}%`,
              background: 'linear-gradient(90deg, #EF4444, #22C55E)',
            }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-6 text-sm">
        <div>
          <span className="text-gray-500">Strijders: </span>
          <span className="text-white font-mono">{contributions.contributors}</span>
        </div>
        <div>
          <span className="text-gray-500">Jouw bijdrage: </span>
          <span className="text-[#F59E0B] font-mono font-bold">{myContribution} XP</span>
        </div>
      </div>

      {!isDefeated && !isFailed && <Countdown deadline={deadline} />}
    </div>
  )
}

function Countdown({ deadline }: { deadline: Date }) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const update = () => {
      const diff = deadline.getTime() - Date.now()
      if (diff <= 0) {
        setTimeLeft('Verlopen')
        return
      }
      const days = Math.floor(diff / 86400000)
      const hours = Math.floor((diff % 86400000) / 3600000)
      const mins = Math.floor((diff % 3600000) / 60000)
      setTimeLeft(`${days}d ${hours}u ${mins}m`)
    }
    update()
    const interval = setInterval(update, 60000)
    return () => clearInterval(interval)
  }, [deadline])

  return (
    <div className="mt-4 text-xs font-mono text-gray-500">
      Nog {timeLeft} over
    </div>
  )
}
