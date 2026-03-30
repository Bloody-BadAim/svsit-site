'use client'

import { Zap, Calendar } from 'lucide-react'

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
        className="relative p-8 rounded-xl text-center overflow-hidden"
        style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: 'rgba(242, 158, 24, 0.08)' }}
        >
          <Zap size={28} style={{ color: 'var(--color-accent-gold)' }} />
        </div>
        <p className="font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
          Nog geen activiteit
        </p>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Ga naar een SIT event en scan je QR code om punten te verdienen
        </p>
      </div>
    )
  }

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <h3 className="text-[11px] uppercase tracking-[0.15em] font-semibold" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
          Recente activiteit
        </h3>
        <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(242, 158, 24, 0.1)', color: 'var(--color-accent-gold)' }}>
          {scans.length} scans
        </span>
      </div>

      <div>
        {scans.slice(0, 10).map((scan, i) => (
          <div
            key={scan.id}
            className="px-5 py-3.5 flex items-center gap-3 transition-colors"
            style={{
              borderBottom: i < Math.min(scans.length - 1, 9) ? '1px solid var(--color-border)' : 'none',
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'rgba(242, 158, 24, 0.08)' }}
            >
              <Zap size={14} style={{ color: 'var(--color-accent-gold)' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>
                {scan.reason}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                {scan.event_name && (
                  <span className="text-[11px]" style={{ color: 'var(--color-accent-blue)' }}>
                    {scan.event_name}
                  </span>
                )}
                <span className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                  <Calendar size={10} />
                  {new Date(scan.created_at).toLocaleDateString('nl-NL')}
                </span>
              </div>
            </div>
            <span
              className="text-sm font-bold shrink-0 px-2 py-0.5 rounded-md"
              style={{ color: 'var(--color-accent-gold)', backgroundColor: 'rgba(242, 158, 24, 0.08)' }}
            >
              +{scan.points}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
