'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleMicrosoft() {
    setLoading(true)
    await signIn('microsoft-entra-id', { callbackUrl: '/dashboard' })
  }

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
      setError('Onjuist email of wachtwoord')
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Microsoft login */}
      <button
        onClick={handleMicrosoft}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200"
        style={{
          backgroundColor: 'var(--color-accent-gold)',
          color: 'var(--color-bg)',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 21 21" fill="none">
          <rect width="10" height="10" fill="currentColor" opacity="0.9" />
          <rect x="11" width="10" height="10" fill="currentColor" opacity="0.7" />
          <rect y="11" width="10" height="10" fill="currentColor" opacity="0.7" />
          <rect x="11" y="11" width="10" height="10" fill="currentColor" opacity="0.5" />
        </svg>
        Login met HvA account
      </button>

      <div className="flex items-center gap-4 my-8">
        <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
        <span style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }} className="text-xs uppercase tracking-wider">
          of
        </span>
        <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
      </div>

      {/* Email + wachtwoord */}
      <form onSubmit={handleCredentials} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm mb-2"
            style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
          >
            email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="je@email.nl"
            className="w-full py-3 px-4 rounded-lg text-base outline-none transition-all duration-200"
            style={{
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
            }}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm mb-2"
            style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
          >
            wachtwoord
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            placeholder="••••••••"
            className="w-full py-3 px-4 rounded-lg text-base outline-none transition-all duration-200"
            style={{
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
            }}
          />
        </div>

        {error && (
          <p className="text-sm" style={{ color: 'var(--color-accent-red)' }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200"
          style={{
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
          }}
        >
          {loading ? 'Bezig...' : 'Inloggen'}
        </button>
      </form>

      <p className="mt-8 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
        Nog geen lid?{' '}
        <a
          href="/lid-worden"
          className="underline transition-colors"
          style={{ color: 'var(--color-accent-gold)' }}
        >
          Word lid van SIT
        </a>
      </p>
    </div>
  )
}
