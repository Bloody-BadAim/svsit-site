'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

export default function ResetPasswordForm() {
  const t = useTranslations('authResetPassword')
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  if (!token) {
    return (
      <div className="space-y-4">
        <p className="font-mono text-sm" style={{ color: 'var(--color-accent-red)' }}>
          {t('noTokenError')}
        </p>
        <a
          href="/forgot-password"
          className="inline-block font-mono text-sm transition-colors hover:text-[var(--color-text)]"
          style={{ color: 'var(--color-accent-gold)' }}
        >
          {t('noTokenLink')}
        </a>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError(t('errorTooShort'))
      return
    }

    if (password !== confirm) {
      setError(t('errorMismatch'))
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || t('errorGeneric'))
      }

      setSuccess(true)
      setTimeout(() => router.push('/login'), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errorGeneric'))
    } finally {
      setLoading(false)
    }
  }

  if (success) {
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
            {t('successMessage')}
          </p>
        </div>
        <a
          href="/login"
          className="block text-center font-mono text-sm transition-colors hover:text-[var(--color-text)]"
          style={{ color: 'var(--color-accent-gold)' }}
        >
          {t('successLink')}
        </a>
      </div>
    )
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="new-password"
            className="block font-mono text-[11px] text-[var(--color-text-muted)] uppercase tracking-wider mb-2"
          >
            {t('passwordLabel')}
          </label>
          <input
            id="new-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            placeholder={t('passwordPlaceholder')}
            className="w-full py-3 px-4 rounded-md text-sm font-mono outline-none transition-all duration-200 placeholder:text-[var(--color-text-muted)]/30 focus:border-[var(--color-accent-gold)]"
            style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              color: 'var(--color-text)',
              border: '1px solid rgba(255,255,255,0.10)',
            }}
          />
        </div>

        <div>
          <label
            htmlFor="confirm-password"
            className="block font-mono text-[11px] text-[var(--color-text-muted)] uppercase tracking-wider mb-2"
          >
            {t('confirmLabel')}
          </label>
          <input
            id="confirm-password"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={8}
            placeholder={t('confirmPlaceholder')}
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

      <p className="mt-6 font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>
        {t('linkExpired')}{' '}
        <a
          href="/forgot-password"
          className="transition-colors hover:text-[var(--color-text)]"
          style={{ color: 'var(--color-accent-gold)' }}
        >
          {t('requestNew')}
        </a>
      </p>
    </div>
  )
}
