'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { COMMISSIES } from '@/lib/constants'

export default function ProfielPage() {
  const { data: session } = useSession()
  const [studentNumber, setStudentNumber] = useState('')
  const [commissie, setCommissie] = useState('')
  const [membershipActive, setMembershipActive] = useState(false)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session?.user?.id) return

    fetch(`/api/members`)
      .then(res => res.json())
      .then(({ data }) => {
        if (!data) return
        const member = Array.isArray(data)
          ? data.find((m: Record<string, unknown>) => m.id === session.user.id)
          : data
        if (member) {
          setStudentNumber((member.student_number as string) || '')
          setCommissie((member.commissie as string) || '')
          setMembershipActive(member.membership_active as boolean)
          setExpiresAt(member.membership_expires_at as string | null)
        }
      })
      .finally(() => setLoading(false))
  }, [session?.user?.id])

  async function handleSave() {
    if (!session?.user?.id) return
    setSaving(true)
    setMessage('')

    const res = await fetch(`/api/members/${session.user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_number: studentNumber || null,
        commissie: commissie || null,
      }),
    })

    if (res.ok) {
      setMessage('Opgeslagen')
    } else {
      setMessage('Fout bij opslaan')
    }
    setSaving(false)
    setTimeout(() => setMessage(''), 3000)
  }

  async function handleStripePortal() {
    const res = await fetch('/api/stripe/portal', { method: 'POST' })
    const { url } = await res.json()
    if (url) window.location.href = url
  }

  if (loading) {
    return (
      <div className="max-w-xl space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--color-surface)' }} />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
          Profiel
        </h1>
      </div>

      <div className="space-y-4">
        {/* Email (readonly) */}
        <div>
          <label className="block text-sm mb-2" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
            email
          </label>
          <input
            type="email"
            value={session?.user?.email || ''}
            disabled
            className="w-full py-3 px-4 rounded-lg text-base opacity-60"
            style={{
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
            }}
          />
        </div>

        {/* Studentnummer */}
        <div>
          <label className="block text-sm mb-2" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
            studentnummer
          </label>
          <input
            type="text"
            value={studentNumber}
            onChange={(e) => setStudentNumber(e.target.value)}
            placeholder="Niet ingevuld"
            className="w-full py-3 px-4 rounded-lg text-base outline-none"
            style={{
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
            }}
          />
        </div>

        {/* Commissie */}
        <div>
          <label className="block text-sm mb-2" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
            commissie
          </label>
          <select
            value={commissie}
            onChange={(e) => setCommissie(e.target.value)}
            className="w-full py-3 px-4 rounded-lg text-base outline-none"
            style={{
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
            }}
          >
            <option value="">Geen commissie</option>
            {COMMISSIES.map((c) => (
              <option key={c.id} value={c.id}>{c.naam}</option>
            ))}
          </select>
        </div>

        {/* Save button */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="py-3 px-6 rounded-lg font-semibold transition-all"
            style={{
              backgroundColor: 'var(--color-accent-gold)',
              color: 'var(--color-bg)',
            }}
          >
            {saving ? 'Opslaan...' : 'Opslaan'}
          </button>
          {message && (
            <span className="text-sm" style={{ color: message === 'Opgeslagen' ? 'var(--color-accent-green)' : 'var(--color-accent-red)' }}>
              {message}
            </span>
          )}
        </div>
      </div>

      {/* Lidmaatschap status */}
      <div
        className="p-5 rounded-lg space-y-3"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
        }}
      >
        <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
          Lidmaatschap
        </h3>

        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: membershipActive ? 'var(--color-accent-green)' : 'var(--color-accent-red)' }}
          />
          <span style={{ color: 'var(--color-text)' }}>
            {membershipActive ? 'Actief' : 'Niet actief'}
          </span>
        </div>

        {expiresAt && (
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Verloopt op {new Date(expiresAt).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        )}

        <button
          onClick={handleStripePortal}
          className="py-2 px-4 rounded-lg text-sm font-medium transition-all"
          style={{
            backgroundColor: 'transparent',
            color: 'var(--color-accent-blue)',
            border: '1px solid var(--color-accent-blue)',
          }}
        >
          Beheer abonnement
        </button>
      </div>
    </div>
  )
}
