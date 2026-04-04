'use client'

import { useState, useEffect } from 'react'
import { ROLLEN, getRank } from '@/lib/constants'
import type { Role } from '@/types/database'

interface DbCommissie {
  id: string
  slug: string
  naam: string
  beschrijving: string | null
}

interface MemberDetail {
  id: string
  email: string
  student_number: string | null
  role: string
  commissie: string | null
  points: number
  membership_active: boolean
  membership_started_at: string | null
  is_admin: boolean
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
  const [isAdmin, setIsAdmin] = useState(member.is_admin)
  const [memberCommissieIds, setMemberCommissieIds] = useState<string[]>([])
  const [allCommissies, setAllCommissies] = useState<DbCommissie[]>([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const rank = getRank(member.points)

  useEffect(() => {
    fetch(`/api/members/${member.id}`)
      .then(res => res.json())
      .then(({ data }) => {
        if (data?.member_commissies) {
          setMemberCommissieIds(
            data.member_commissies.map((mc: { commissie_id: string }) => mc.commissie_id)
          )
        }
      })

    fetch('/api/commissies')
      .then(res => res.json())
      .then(({ data }) => {
        if (data) setAllCommissies(data)
      })
  }, [member.id])

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
    const res = await fetch(`/api/admin/members/${member.id}/role`, {
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

  async function handleAdminToggle() {
    const newValue = !isAdmin
    setSaving(true)
    const res = await fetch(`/api/admin/members/${member.id}/admin`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_admin: newValue }),
    })
    if (res.ok) {
      setIsAdmin(newValue)
      setMessage(newValue ? 'Admin rechten toegekend' : 'Admin rechten ingetrokken')
      onUpdate()
    } else {
      const data = await res.json()
      setMessage(data.error || 'Fout bij wijzigen')
    }
    setSaving(false)
    setTimeout(() => setMessage(''), 3000)
  }

  async function handleCommissieToggle(commissieId: string) {
    const newIds = memberCommissieIds.includes(commissieId)
      ? memberCommissieIds.filter(id => id !== commissieId)
      : [...memberCommissieIds, commissieId]

    setSaving(true)
    const res = await fetch(`/api/admin/members/${member.id}/commissies`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commissie_ids: newIds }),
    })
    if (res.ok) {
      setMemberCommissieIds(newIds)
      setMessage('Commissies bijgewerkt')
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
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
                {member.email}
              </h2>
              {isAdmin && (
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
                  style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--color-accent-red)' }}
                >
                  Admin
                </span>
              )}
            </div>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Lid sinds {new Date(member.created_at).toLocaleDateString('nl-NL')}
            </p>
          </div>
          <button onClick={onClose} className="text-xl leading-none" style={{ color: 'var(--color-text-muted)' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg)' }}>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>Rol</p>
            <p className="font-semibold" style={{ color: 'var(--color-accent-blue)' }}>{ROLLEN[member.role as Role]?.naam}</p>
          </div>
          <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg)' }}>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>Punten</p>
            <p className="font-semibold" style={{ color: 'var(--color-accent-gold)' }}>
              {member.points} <span className="text-xs font-normal" style={{ color: rank.kleur }}>({rank.naam})</span>
            </p>
          </div>
          <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg)' }}>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>Status</p>
            <p className="font-semibold" style={{ color: member.membership_active ? 'var(--color-accent-green)' : 'var(--color-accent-red)' }}>
              {member.membership_active ? 'Actief' : 'Inactief'}
            </p>
          </div>
          <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg)' }}>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>Commissies</p>
            <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
              {memberCommissieIds.length > 0
                ? allCommissies
                    .filter(c => memberCommissieIds.includes(c.id))
                    .map(c => c.naam)
                    .join(', ')
                : '\u2014'}
            </p>
          </div>
        </div>

        {/* Admin toggle */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
            Admin status
          </h3>
          <button
            onClick={handleAdminToggle}
            disabled={saving}
            className="flex items-center gap-3 w-full p-3 rounded-lg text-sm transition-colors"
            style={{
              backgroundColor: isAdmin ? 'rgba(239, 68, 68, 0.1)' : 'var(--color-bg)',
              border: `1px solid ${isAdmin ? 'var(--color-accent-red)' : 'var(--color-border)'}`,
            }}
          >
            <div
              className="w-8 h-5 rounded-full relative transition-colors flex-shrink-0"
              style={{ backgroundColor: isAdmin ? 'var(--color-accent-red)' : 'var(--color-border)' }}
            >
              <div
                className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                style={{ left: isAdmin ? '14px' : '2px' }}
              />
            </div>
            <span style={{ color: isAdmin ? 'var(--color-accent-red)' : 'var(--color-text-muted)' }}>
              {isAdmin ? 'Admin rechten actief' : 'Geen admin rechten'}
            </span>
          </button>
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

        {/* Commissies toewijzen */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
            Commissies
          </h3>
          {allCommissies.length === 0 ? (
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Laden...</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {allCommissies.map((c) => {
                const active = memberCommissieIds.includes(c.id)
                return (
                  <button
                    key={c.id}
                    onClick={() => handleCommissieToggle(c.id)}
                    disabled={saving}
                    className="flex items-center gap-2 p-2.5 rounded-lg text-sm text-left transition-colors"
                    style={{
                      backgroundColor: active ? 'rgba(59, 130, 246, 0.1)' : 'var(--color-bg)',
                      border: `1px solid ${active ? 'var(--color-accent-blue)' : 'var(--color-border)'}`,
                      color: active ? 'var(--color-accent-blue)' : 'var(--color-text-muted)',
                    }}
                  >
                    <div
                      className="w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center"
                      style={{
                        borderColor: active ? 'var(--color-accent-blue)' : 'var(--color-border)',
                        backgroundColor: active ? 'var(--color-accent-blue)' : 'transparent',
                      }}
                    >
                      {active && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    {c.naam}
                  </button>
                )
              })}
            </div>
          )}
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
