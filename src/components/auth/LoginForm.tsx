'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

export default function LoginForm() {
  const t = useTranslations('authLogin')
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      if (result.code === 'rate_limited') {
        setError(t('errorRateLimited'))
      } else {
        setError(t('errorInvalid'))
      }
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="w-full">
      {/* Email + wachtwoord */}
      <form onSubmit={handleCredentials} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block font-mono text-[11px] text-[var(--color-text-muted)] uppercase tracking-wider mb-2"
          >
            {t('emailLabel')}
          </label>
          <input
            id="email"
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

        <div>
          <label
            htmlFor="password"
            className="block font-mono text-[11px] text-[var(--color-text-muted)] uppercase tracking-wider mb-2"
          >
            {t('passwordLabel')}
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            placeholder="••••••••"
            className="w-full py-3 px-4 rounded-md text-sm font-mono outline-none transition-all duration-200 placeholder:text-[var(--color-text-muted)]/30 focus:border-[var(--color-accent-gold)]"
            style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              color: 'var(--color-text)',
              border: '1px solid rgba(255,255,255,0.10)',
            }}
          />
        </div>

        <div className="flex justify-end">
          <a
            href="/forgot-password"
            className="font-mono text-xs transition-colors hover:text-[var(--color-text)]"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {t('forgotPassword')}
          </a>
        </div>

        {error && (
          <p className="font-mono text-sm" style={{ color: 'var(--color-accent-red)' }}>
            {error}
          </p>
        )}

        {/* Inloggen button - gold per design doc */}
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
        {t('noAccount')}{' '}
        <a
          href="/lid-worden"
          className="font-mono transition-colors hover:text-[var(--color-text)]"
          style={{ color: 'var(--color-accent-gold)' }}
        >
          {t('joinLink')}
        </a>
      </p>
    </div>
  )
}
