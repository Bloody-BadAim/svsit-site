'use client'

interface Stats {
  totaal: number
  actief: number
  nieuwDezeMaand: number
  inkomstenTotaal: number
  inkomstenDezeMaand: number
  perRol: { member: number; contributor: number; mentor: number; bestuur: number }
  perCommissie: Record<string, number>
}

interface StatsOverviewProps {
  stats: Stats
}

export default function StatsOverview({ stats }: StatsOverviewProps) {
  const formatEuro = (euros: number) =>
    new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(euros)

  const activePercent = stats.totaal > 0 ? Math.round((stats.actief / stats.totaal) * 100) : 0

  return (
    <div className="space-y-5">
      {/* Hero numbers — asymmetric, not a uniform grid */}
      <div className="flex flex-wrap gap-5">
        <div
          className="relative flex-1 min-w-[180px] p-5 overflow-hidden"
          style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--color-border)' }}
        >
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2" style={{ borderColor: 'var(--color-accent-gold)' }} />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] block mb-2" style={{ color: 'var(--color-text-muted)' }}>
            members.count()
          </span>
          <span
            className="text-5xl font-bold tracking-tight"
            style={{ color: 'var(--color-text)', fontFamily: "'Big Shoulders Display', var(--font-geist-sans), sans-serif" }}
          >
            {stats.totaal}
          </span>
          <div className="flex items-center gap-3 mt-2 font-mono text-[10px]">
            <span style={{ color: 'var(--color-accent-green)' }}>
              {stats.actief} actief
            </span>
            <span style={{ color: 'var(--color-text-muted)' }}>·</span>
            <span style={{ color: 'var(--color-accent-gold)' }}>
              +{stats.nieuwDezeMaand} deze maand
            </span>
          </div>
          {/* Activity bar */}
          <div className="mt-3 h-1 overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
            <div className="h-full" style={{ width: `${activePercent}%`, backgroundColor: 'var(--color-accent-green)' }} />
          </div>
          <span className="font-mono text-[9px] mt-1 block" style={{ color: 'rgba(255,255,255,0.2)' }}>
            {activePercent}% actief
          </span>
        </div>

        <div
          className="relative w-[200px] p-5 overflow-hidden"
          style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--color-border)' }}
        >
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2" style={{ borderColor: 'var(--color-accent-green)' }} />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] block mb-2" style={{ color: 'var(--color-text-muted)' }}>
            revenue.total
          </span>
          <span
            className="text-3xl font-bold tracking-tight"
            style={{ color: 'var(--color-accent-green)', fontFamily: "'Big Shoulders Display', var(--font-geist-sans), sans-serif" }}
          >
            {formatEuro(stats.inkomstenTotaal)}
          </span>
          <div className="font-mono text-[10px] mt-2" style={{ color: 'var(--color-text-muted)' }}>
            deze maand: <span style={{ color: 'var(--color-accent-blue)' }}>{formatEuro(stats.inkomstenDezeMaand)}</span>
          </div>
        </div>
      </div>

      {/* Breakdowns — horizontal bars, not card grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div
          className="relative p-5 overflow-hidden"
          style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--color-border)' }}
        >
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] block mb-4" style={{ color: 'var(--color-text-muted)' }}>
            per rol
          </span>
          <div className="space-y-3">
            {Object.entries(stats.perRol).map(([rol, count]) => {
              const percent = stats.totaal > 0 ? (count / stats.totaal) * 100 : 0
              const colors: Record<string, string> = { member: 'var(--color-text)', contributor: 'var(--color-accent-blue)', mentor: 'var(--color-accent-green)', bestuur: 'var(--color-accent-gold)' }
              return (
                <div key={rol} className="flex items-center gap-3">
                  <span className="font-mono text-[11px] w-24 capitalize" style={{ color: colors[rol] || 'var(--color-text)' }}>
                    {rol}
                  </span>
                  <div className="flex-1 h-[5px] overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
                    <div className="h-full" style={{ width: `${percent}%`, backgroundColor: colors[rol] || 'var(--color-text)', opacity: 0.7 }} />
                  </div>
                  <span className="font-mono text-[11px] font-bold w-6 text-right" style={{ color: colors[rol] || 'var(--color-text)' }}>
                    {count}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div
          className="relative p-5 overflow-hidden"
          style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--color-border)' }}
        >
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] block mb-4" style={{ color: 'var(--color-text-muted)' }}>
            per commissie
          </span>
          <div className="space-y-3">
            {Object.entries(stats.perCommissie).length === 0 ? (
              <p className="font-mono text-[11px]" style={{ color: 'var(--color-text-muted)' }}>geen data</p>
            ) : (
              Object.entries(stats.perCommissie).map(([commissie, count]) => {
                const percent = stats.totaal > 0 ? (count / stats.totaal) * 100 : 0
                return (
                  <div key={commissie} className="flex items-center gap-3">
                    <span className="font-mono text-[11px] w-24 truncate" style={{ color: 'var(--color-text)' }}>
                      {commissie}
                    </span>
                    <div className="flex-1 h-[5px] overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
                      <div className="h-full" style={{ width: `${percent}%`, backgroundColor: 'var(--color-accent-gold)', opacity: 0.7 }} />
                    </div>
                    <span className="font-mono text-[11px] font-bold w-6 text-right" style={{ color: 'var(--color-accent-gold)' }}>
                      {count}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
