'use client'

interface Scan {
  id: string
  points: number
  reason: string
  event_name: string | null
  created_at: string
}

interface RecentActivityProps {
  scans: Scan[]
}

export default function RecentActivity({ scans }: RecentActivityProps) {
  if (scans.length === 0) {
    return (
      <div
        className="p-6 rounded-lg text-center"
        style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        <p style={{ color: 'var(--color-text-muted)' }}>
          Nog geen activiteit. Ga naar een event om punten te verdienen!
        </p>
      </div>
    )
  }

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
          Recente activiteit
        </h3>
      </div>

      <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
        {scans.slice(0, 10).map((scan) => (
          <div key={scan.id} className="px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: 'var(--color-text)' }}>
                {scan.reason}
              </p>
              {scan.event_name && (
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  {scan.event_name}
                </p>
              )}
            </div>
            <div className="text-right">
              <span className="text-sm font-bold" style={{ color: 'var(--color-accent-gold)' }}>
                +{scan.points}
              </span>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {new Date(scan.created_at).toLocaleDateString('nl-NL')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
