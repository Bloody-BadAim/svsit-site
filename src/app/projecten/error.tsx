'use client'

import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function ProjectenError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="flex justify-center mb-6">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}
          >
            <AlertTriangle size={24} style={{ color: 'var(--color-accent-red)' }} />
          </div>
        </div>
        <h2
          className="font-mono text-lg font-bold mb-2"
          style={{ color: 'var(--color-text)' }}
        >
          Projecten konden niet geladen worden
        </h2>
        <p
          className="font-mono text-sm mb-6"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {error.message?.toLowerCase().includes('supabase')
            ? 'Service is tijdelijk niet beschikbaar'
            : error.message || 'Er ging iets mis bij het ophalen van projecten'}
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 py-2.5 px-5 rounded-lg font-mono text-sm font-semibold transition-colors"
          style={{ backgroundColor: 'var(--color-accent-gold)', color: 'var(--color-bg)' }}
        >
          <RefreshCw size={14} />
          Probeer opnieuw
        </button>
      </div>
    </div>
  )
}
