'use client'

interface Stats {
  totaal: number
  actief: number
  nieuwDezeMaand: number
  perRol: { member: number; contributor: number; mentor: number }
  perCommissie: Record<string, number>
}

interface StatsOverviewProps {
  stats: Stats
}

export default function StatsOverview({ stats }: StatsOverviewProps) {
  const topCards = [
    { label: 'Totaal leden', value: stats.totaal, color: 'var(--color-text)' },
    { label: 'Actief', value: stats.actief, color: 'var(--color-accent-green)' },
    { label: 'Nieuw deze maand', value: stats.nieuwDezeMaand, color: 'var(--color-accent-gold)' },
  ]

  return (
    <div className="space-y-6">
      {/* Top stats */}
      <div className="grid grid-cols-3 gap-3">
        {topCards.map((card) => (
          <div
            key={card.label}
            className="p-4 rounded-lg"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
              {card.label}
            </p>
            <p className="text-3xl font-bold mt-1" style={{ color: card.color }}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Per rol */}
        <div
          className="p-4 rounded-lg"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
            Per rol
          </h3>
          <div className="space-y-2">
            {Object.entries(stats.perRol).map(([rol, count]) => (
              <div key={rol} className="flex justify-between">
                <span className="text-sm capitalize" style={{ color: 'var(--color-text)' }}>{rol}</span>
                <span className="text-sm font-bold" style={{ color: 'var(--color-accent-gold)' }}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Per commissie */}
        <div
          className="p-4 rounded-lg"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
            Per commissie
          </h3>
          <div className="space-y-2">
            {Object.entries(stats.perCommissie).length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Geen data</p>
            ) : (
              Object.entries(stats.perCommissie).map(([commissie, count]) => (
                <div key={commissie} className="flex justify-between">
                  <span className="text-sm" style={{ color: 'var(--color-text)' }}>{commissie || 'Geen'}</span>
                  <span className="text-sm font-bold" style={{ color: 'var(--color-accent-blue)' }}>{count}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
