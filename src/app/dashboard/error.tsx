'use client'

import { AlertTriangle } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations('dashboardError')
  return (
    <div className="max-w-xl mx-auto text-center py-16">
      <div className="flex justify-center mb-4">
        <AlertTriangle className="w-10 h-10" style={{ color: 'var(--color-accent-gold)' }} />
      </div>
      <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
        {t('heading')}
      </h2>
      <p className="mb-6 text-sm" style={{ color: 'var(--color-text-muted)' }}>
        {error.message?.toLowerCase().includes('supabase')
          ? t('serviceUnavailable')
          : error.message || t('unknownError')}
      </p>
      <button
        onClick={reset}
        className="py-2 px-6 rounded-lg font-semibold"
        style={{ backgroundColor: 'var(--color-accent-gold)', color: 'var(--color-bg)' }}
      >
        {t('retry')}
      </button>
    </div>
  )
}
