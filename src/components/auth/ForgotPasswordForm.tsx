'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

export default function ForgotPasswordForm() {
  const t = useTranslations('authForgotPassword')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/password/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || t('errorGeneric'))
      }

      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errorGeneric'))
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="space-y-6">
        <div
          className="p-6 rounded-md"
          style={{
            backgroundColor: 'rgba(34, 197, 94, 0.08)',
            border: '1px solid rgba(34, 197, 94, 0.2)',
          }}
        >
          <p className="font-mono text-sm" style={{ color: 'var(--color-accent-green)' }}>
            {t('successTitle')}
          </p>
          <p className="font-mono text-xs mt-3" style={{ color: 'var(--color-text-muted)' }}>
            {t('successHint')}
          </p>
        </div>

        <a
          href="/login"
          className="block text-center font-mono text-sm transition-colors hover:text-[var(--color-text)]"
          style={{ color: 'var(--color-accent-gold)' }}
        >
          {t('backToLogin')}
        </a>
      </div>
    )
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="reset-email"
            className="block font-mono text-[11px] text-[var(--color-text-muted)] uppercase tracking-wider mb-2"
          >
            {t('emailLabel')}
          </label>
          <input
            id="reset-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder={t('emailPlaceholder')}
            className="w-full py-3 px-4 rounded-md text-sm font-mono outline-none transition-all duration-200 placeholder:text-[var(--color-text-muted)]/30 focus:border-[var(--color-accent-gold)]"
            style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              color: 'var(--color-text)',
              border: '1px solid rgba(255,255,255,0.10)',
            }}
          />
        </div>

        {error && (
          <p className="font-mono text-sm" style={{ color: 'var(--color-accent-red)' }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-6 rounded-md font-bold text-base transition-all duration-200 cursor-pointer disabled:opacity-50"
          style={{
            backgroundColor: 'var(--color-accent-gold)',
            color: '#000000',
          }}
        >
          {loading ? t('loading') : t('submit')}
        </button>
      </form>

      <p className="mt-8 text-sm" style={{ color: 'var(--color-text-muted)' }}>
        {t('rememberPassword')}{' '}
        <a
          href="/login"
          className="font-mono transition-colors hover:text-[var(--color-text)]"
          style={{ color: 'var(--color-accent-gold)' }}
        >
          {t('loginLink')}
        </a>
      </p>
    </div>
  )
}
