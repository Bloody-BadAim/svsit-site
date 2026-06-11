'use client'

import { AlertTriangle, RefreshCw } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations('errorPage')
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="flex justify-center mb-6">
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}
          >
            <AlertTriangle size={28} style={{ color: 'var(--color-accent-red)' }} />
          </div>
        </div>
        <h2
          className="font-mono text-xl font-bold mb-2"
          style={{ color: 'var(--color-text)' }}
        >
          {t('heading')}
        </h2>
        <p
          className="font-mono text-sm mb-2"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {error.message?.toLowerCase().includes('supabase')
            ? t('serviceUnavailable')
            : error.message || t('genericError')}
        </p>
        {error.digest && (
          <p
            className="font-mono text-xs mb-6"
            style={{ color: 'var(--color-text-muted)', opacity: 0.6 }}
          >
            {t('errorId', { digest: error.digest })}
          </p>
        )}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="flex items-center gap-2 py-2.5 px-5 rounded-lg font-mono text-sm font-semibold transition-colors"
            style={{
              backgroundColor: 'var(--color-accent-gold)',
              color: 'var(--color-bg)',
            }}
          >
            <RefreshCw size={14} />
            {t('retry')}
          </button>
          <a
            href="/"
            className="py-2.5 px-5 rounded-lg font-mono text-sm font-semibold transition-colors"
            style={{
              color: 'var(--color-text-muted)',
              border: '1px solid var(--color-border)',
            }}
          >
            {t('home')}
          </a>
        </div>
      </div>
    </div>
  )
}
