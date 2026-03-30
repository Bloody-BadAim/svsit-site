'use client'

import { getRank } from '@/lib/constants'

interface StatsGridProps {
  points: number
  role: string
  commissie: string | null
  memberSince: string | null
}

export default function StatsGrid({ points, role, commissie, memberSince }: StatsGridProps) {
  const rank = getRank(points)
  const since = memberSince ? new Date(memberSince).toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' }) : '—'

  const stats = [
    { label: 'Punten', value: points.toString(), accent: 'var(--color-accent-gold)' },
    { label: 'Rank', value: rank.naam, accent: rank.kleur },
    { label: 'Rol', value: role.charAt(0).toUpperCase() + role.slice(1), accent: 'var(--color-accent-blue)' },
    { label: 'Lid sinds', value: since, accent: 'var(--color-accent-green)' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="p-4 rounded-lg"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
          }}
        >
          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
            {stat.label}
          </p>
          <p className="text-xl font-bold" style={{ color: stat.accent }}>
            {stat.value}
          </p>
          {stat.label === 'Rol' && commissie && (
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
              {commissie}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
