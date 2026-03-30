'use client'

import { useState } from 'react'
import { COMMISSIES, ROLLEN, getRank } from '@/lib/constants'
import type { Role } from '@/types/database'

interface MemberDetail {
  id: string
  email: string
  student_number: string | null
  role: string
  commissie: string | null
  points: number
  membership_active: boolean
  membership_started_at: string | null
  created_at: string
}

interface MemberDetailModalProps {
  member: MemberDetail
  onClose: () => void
  onUpdate: () => void
}

export default function MemberDetailModal({ member, onClose, onUpdate }: MemberDetailModalProps) {
  const [puntenAantal, setPuntenAantal] = useState('1')
  const [puntenReden, setPuntenReden] = useState('')
  const [rol, setRol] = useState(member.role)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const rank = getRank(member.points)

  async function handlePunten() {
    if (!puntenReden) return
    setSaving(true)
    const res = await fetch('/api/scans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        member_id: member.id,
        points: parseInt(puntenAantal),
        reason: puntenReden,
      }),
    })
    if (res.ok) {
      setMessage('Punten toegekend')
      setPuntenReden('')
      onUpdate()
    } else {
      setMessage('Fout bij toekennen')
    }
    setSaving(false)
    setTimeout(() => setMessage(''), 3000)
  }

  async function handleRolWijzig() {
    setSaving(true)
    const res = await fetch(`/api/members/${member.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: rol }),
    })
    if (res.ok) {
      setMessage('Rol gewijzigd')
      onUpdate()
    } else {
      setMessage('Fout bij wijzigen')
    }
    setSaving(false)
    setTimeout(() => setMessage(''), 3000)
  }

  async function handleVerleng() {
    setSaving(true)
    const expiresAt = new Date()
    expiresAt.setFullYear(expiresAt.getFullYear() + 1)

    const res = await fetch(`/api/members/${member.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        membership_active: true,
        membership_expires_at: expiresAt.toISOString(),
      }),
    })
    if (res.ok) {
      setMessage('Lidmaatschap verlengd')
      onUpdate()
    }
    setSaving(false)
    setTimeout(() => setMessage(''), 3000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-full max-w-lg rounded-xl p-6 space-y-5 max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
              {member.email}
            </h2>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Lid sinds {new Date(member.created_at).toLocaleDateString('nl-NL')}
            </p>
          </div>
          <button onClick={onClose} className="text-xl" style={{ color: 'var(--color-text-muted)' }}>×</button>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg)' }}>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>Rol</p>
            <p className="font-semibold" style={{ color: 'var(--color-accent-blue)' }}>{ROLLEN[member.role as Role]?.naam}</p>
          </div>
          <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg)' }}>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>Punten</p>
            <p className="font-semibold" style={{ color: 'var(--color-accent-gold)' }}>{member.points} <span className="text-xs font-normal" style={{ color: rank.kleur }}>({rank.naam})</span></p>
          </div>
          <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg)' }}>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>Status</p>
            <p className="font-semibold" style={{ color: member.membership_active ? 'var(--color-accent-green)' : 'var(--color-accent-red)' }}>
              {member.membership_active ? 'Actief' : 'Inactief'}
            </p>
          </div>
          <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg)' }}>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>Commissie</p>
            <p className="font-semibold" style={{ color: 'var(--color-text)' }}>{member.commissie || '—'}</p>
          </div>
        </div>

        {/* Punten toekennen */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
            Punten toekennen
          </h3>
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              value={puntenAantal}
              onChange={(e) => setPuntenAantal(e.target.value)}
              className="w-20 py-2 px-3 rounded-lg text-sm outline-none"
              style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
            />
            <input
              type="text"
              value={puntenReden}
              onChange={(e) => setPuntenReden(e.target.value)}
              placeholder="Reden..."
              className="flex-1 py-2 px-3 rounded-lg text-sm outline-none"
              style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
            />
            <button
              onClick={handlePunten}
              disabled={saving || !puntenReden}
              className="py-2 px-4 rounded-lg text-sm font-semibold disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-accent-gold)', color: 'var(--color-bg)' }}
            >
              +
            </button>
          </div>
        </div>

        {/* Rol wijzigen */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
            Rol wijzigen
          </h3>
          <div className="flex gap-2">
            <select
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              className="flex-1 py-2 px-3 rounded-lg text-sm outline-none"
              style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
            >
              {Object.entries(ROLLEN).map(([key, val]) => (
                <option key={key} value={key}>{val.naam}</option>
              ))}
            </select>
            <button
              onClick={handleRolWijzig}
              disabled={saving || rol === member.role}
              className="py-2 px-4 rounded-lg text-sm font-semibold disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-surface-hover, #1A1A1D)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
            >
              Wijzig
            </button>
          </div>
        </div>

        {/* Handmatig verlengen */}
        {!member.membership_active && (
          <button
            onClick={handleVerleng}
            disabled={saving}
            className="w-full py-2 rounded-lg text-sm font-semibold"
            style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)', color: 'var(--color-accent-green)', border: '1px solid var(--color-accent-green)' }}
          >
            Lidmaatschap handmatig verlengen (1 jaar)
          </button>
        )}

        {message && (
          <p className="text-sm text-center" style={{ color: 'var(--color-accent-green)' }}>{message}</p>
        )}
      </div>
    </div>
  )
}
