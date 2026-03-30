'use client'

import { getRank, RANKS } from '@/lib/constants'
import { Zap, Trophy, Users, Calendar } from 'lucide-react'

interface StatsGridProps {
  points: number
  role: string
  commissie: string | null
  memberSince: string | null
}

export default function StatsGrid({ points, role, commissie, memberSince }: StatsGridProps) {
  const rank = getRank(points)
  const nextRank = RANKS.find(r => r.minPunten > points)
  const progress = nextRank
    ? ((points - rank.minPunten) / (nextRank.minPunten - rank.minPunten)) * 100
    : 100
  const since = memberSince ? new Date(memberSince).toLocaleDateString('nl-NL', { month: 'short', year: 'numeric' }) : '—'

  const stats = [
    {
      label: 'Punten',
      value: points.toString(),
      accent: 'var(--color-accent-gold)',
      accentBg: 'rgba(242, 158, 24, 0.08)',
      Icon: Zap,
      extra: nextRank ? `${nextRank.minPunten - points} tot ${nextRank.naam}` : 'Max rank!',
    },
    {
      label: 'Rank',
      value: rank.naam,
      accent: rank.kleur,
      accentBg: `${rank.kleur}15`,
      Icon: Trophy,
      extra: null,
    },
    {
      label: 'Rol',
      value: role.charAt(0).toUpperCase() + role.slice(1),
      accent: 'var(--color-accent-blue)',
      accentBg: 'rgba(59, 130, 246, 0.08)',
      Icon: Users,
      extra: commissie,
    },
    {
      label: 'Lid sinds',
      value: since,
      accent: 'var(--color-accent-green)',
      accentBg: 'rgba(34, 197, 94, 0.08)',
      Icon: Calendar,
      extra: null,
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="relative p-4 rounded-xl overflow-hidden transition-all duration-200 group"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
          }}
        >
          {/* Glow accent top border */}
          <div
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{ backgroundColor: stat.accent, opacity: 0.6 }}
          />

          <div className="flex items-start justify-between mb-2">
            <p className="text-[10px] uppercase tracking-[0.15em] font-semibold" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
              {stat.label}
            </p>
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: stat.accentBg }}
            >
              <stat.Icon size={14} style={{ color: stat.accent }} />
            </div>
          </div>

          <p
            className="text-2xl font-bold tracking-tight"
            style={{ color: stat.accent, fontFamily: "'Big Shoulders Display', var(--font-geist-sans), sans-serif" }}
          >
            {stat.value}
          </p>

          {stat.extra && (
            <p className="text-[11px] mt-1.5 truncate" style={{ color: 'var(--color-text-muted)' }}>
              {stat.extra}
            </p>
          )}

          {/* Progress bar voor punten */}
          {stat.label === 'Punten' && nextRank && (
            <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progress}%`,
                  backgroundColor: stat.accent,
                }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
