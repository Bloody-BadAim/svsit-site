'use client'

import { useState, useCallback } from 'react'
import { Swords, Check, X, AlertTriangle, Users } from 'lucide-react'
import { BADGE_DEFS } from '@/lib/badgeDefs'
import type { BossFight } from '@/types/gamification'

// ─── Styles ───────────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  backgroundColor: 'var(--color-bg)',
  color: 'var(--color-text)',
  border: '1px solid var(--color-border)',
  fontFamily: 'var(--font-mono)',
  fontSize: 13,
  padding: '6px 10px',
  outline: 'none',
  width: '100%',
  borderRadius: 0,
}

const labelStyle: React.CSSProperties = {
  color: 'var(--color-text-muted)',
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
  display: 'block',
  marginBottom: 4,
}

// ─── Status badge config ───────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  BossFight['status'],
  { label: string; color: string; bg: string }
> = {
  announced: { label: 'ANNOUNCED', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)'  },
  active:    { label: 'ACTIVE',    color: '#3B82F6', bg: 'rgba(59,130,246,0.1)'  },
  defeated:  { label: 'DEFEATED',  color: '#22C55E', bg: 'rgba(34,197,94,0.1)'   },
  failed:    { label: 'FAILED',    color: '#EF4444', bg: 'rgba(239,68,68,0.1)'   },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('nl-NL', {
    day:    'numeric',
    month:  'short',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  })
}

function CornerDecorations() {
  const s = (pos: React.CSSProperties): React.CSSProperties => ({
    position: 'absolute',
    width: 10,
    height: 10,
    borderColor: 'var(--color-accent-gold)',
    borderStyle: 'solid',
    borderWidth: 0,
    ...pos,
  })
  return (
    <>
      <span style={s({ top: 0, left: 0,  borderTopWidth: 2, borderLeftWidth: 2  })} />
      <span style={s({ top: 0, right: 0, borderTopWidth: 2, borderRightWidth: 2 })} />
      <span style={s({ bottom: 0, left: 0,  borderBottomWidth: 2, borderLeftWidth: 2  })} />
      <span style={s({ bottom: 0, right: 0, borderBottomWidth: 2, borderRightWidth: 2 })} />
    </>
  )
}

// ─── Form defaults ─────────────────────────────────────────────────────────────

interface CreateForm {
  name:               string
  description:        string
  hp:                 string
  startsAt:           string
  deadline:           string
  baseRewardXp:       string
  baseRewardBadgeId:  string
}

const EMPTY_FORM: CreateForm = {
  name:              '',
  description:       '',
  hp:                '5000',
  startsAt:          '',
  deadline:          '',
  baseRewardXp:      '50',
  baseRewardBadgeId: '',
}

// ─── HP Bar ───────────────────────────────────────────────────────────────────

function HpBar({ currentHp, hp }: { currentHp: number; hp: number }) {
  const pct = hp > 0 ? Math.min(100, Math.round((currentHp / hp) * 100)) : 0
  const color =
    pct >= 66 ? '#22C55E' :
    pct >= 33 ? '#F59E0B' :
    '#EF4444'

  return (
    <div style={{ marginTop: 6 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--color-text-muted)',
          marginBottom: 3,
        }}
      >
        <span>HP</span>
        <span style={{ color }}>
          {currentHp.toLocaleString()} / {hp.toLocaleString()} ({pct}%)
        </span>
      </div>
      <div
        style={{
          height: 6,
          backgroundColor: 'var(--color-border)',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            backgroundColor: color,
            transition: 'width 0.4s ease',
          }}
        />
      </div>
    </div>
  )
}

// ─── Boss Card ────────────────────────────────────────────────────────────────

function BossCard({
  boss,
  contributorCount,
}: {
  boss: BossFight
  contributorCount: number
}) {
  const cfg     = STATUS_CONFIG[boss.status]
  const isActive = boss.status === 'active'

  return (
    <div
      style={{
        position: 'relative',
        backgroundColor: isActive ? 'rgba(59,130,246,0.04)' : 'var(--color-surface)',
        border: isActive
          ? '1px solid rgba(59,130,246,0.4)'
          : '1px solid var(--color-border)',
        padding: '16px 20px',
        boxShadow: isActive ? '0 0 16px rgba(59,130,246,0.08)' : undefined,
      }}
    >
      {isActive && <CornerDecorations />}

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 14,
              fontWeight: 700,
              color: 'var(--color-text)',
              marginBottom: 2,
            }}
          >
            {boss.name}
          </p>
          {boss.description && (
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--color-text-muted)',
                marginBottom: 4,
              }}
            >
              {boss.description}
            </p>
          )}
        </div>

        {/* Status pill */}
        <span
          style={{
            flexShrink: 0,
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.07em',
            padding: '2px 9px',
            borderRadius: 2,
            color: cfg.color,
            backgroundColor: cfg.bg,
            border: `1px solid ${cfg.color}44`,
          }}
        >
          {cfg.label}
        </span>
      </div>

      {/* HP bar */}
      <HpBar currentHp={boss.currentHp} hp={boss.hp} />

      {/* Meta row */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '4px 16px',
          marginTop: 10,
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--color-text-muted)',
        }}
      >
        <span>Start: {formatDate(boss.startsAt)}</span>
        <span>Deadline: {formatDate(boss.deadline)}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Users size={11} />
          {contributorCount} bijdragers
        </span>
        {boss.baseRewardXp > 0 && (
          <span style={{ color: 'var(--color-accent-gold)' }}>
            +{boss.baseRewardXp} XP reward
          </span>
        )}
      </div>
    </div>
  )
}

// ─── BossManager ──────────────────────────────────────────────────────────────

export default function BossManager({
  initialBossFights,
}: {
  initialBossFights: BossFight[]
}) {
  const [bosses, setBosses]         = useState<BossFight[]>(initialBossFights)
  const [form, setForm]             = useState<CreateForm>(EMPTY_FORM)
  const [creating, setCreating]     = useState(false)
  const [createError, setCreateError]   = useState<string | null>(null)
  const [createSuccess, setCreateSuccess] = useState(false)

  // Contributor counts are fetched lazily — for now kept at 0 to avoid N+1 on
  // the initial server fetch. Could be enriched via a separate API call later.
  const contributorCounts: Record<string, number> = {}

  const activeBoss = bosses.find(
    (b) => b.status === 'active' || b.status === 'announced'
  )

  const handleCreate = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!form.name || !form.hp || !form.startsAt || !form.deadline) return
      setCreating(true)
      setCreateError(null)
      setCreateSuccess(false)

      try {
        const res = await fetch('/api/admin/boss', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name:              form.name,
            description:       form.description || undefined,
            hp:                parseInt(form.hp, 10),
            startsAt:          form.startsAt,
            deadline:          form.deadline,
            baseRewardXp:      form.baseRewardXp ? parseInt(form.baseRewardXp, 10) : 50,
            baseRewardBadgeId: form.baseRewardBadgeId || null,
          }),
        })

        const json = await res.json()
        if (!res.ok || json.error) throw new Error(json.error ?? 'Aanmaken mislukt')

        // Prepend the new boss to the list
        setBosses((prev) => [json.boss as BossFight, ...prev])
        setForm(EMPTY_FORM)
        setCreateSuccess(true)
        setTimeout(() => setCreateSuccess(false), 3000)
      } catch (err) {
        setCreateError(err instanceof Error ? err.message : 'Onbekende fout')
      } finally {
        setCreating(false)
      }
    },
    [form]
  )

  const isFormValid =
    form.name.trim() !== '' &&
    parseInt(form.hp, 10) >= 1000 &&
    form.startsAt !== '' &&
    form.deadline !== ''

  // Sort: active/announced first, then by created_at desc
  const sortedBosses = [...bosses].sort((a, b) => {
    const priority = (s: BossFight['status']) =>
      s === 'active' ? 0 : s === 'announced' ? 1 : 2
    const pd = priority(a.status) - priority(b.status)
    if (pd !== 0) return pd
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  return (
    <div style={{ maxWidth: 860 }} className="space-y-8">

      {/* Page header */}
      <div>
        <h1
          style={{
            fontFamily:    'var(--font-mono)',
            fontSize:      22,
            fontWeight:    700,
            letterSpacing: '0.04em',
            color:         'var(--color-text)',
          }}
        >
          {'>'} boss.manage
        </h1>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
          {bosses.length} boss fight{bosses.length !== 1 ? 's' : ''} in database
          {activeBoss && (
            <span style={{ color: 'var(--color-accent-blue)', marginLeft: 12 }}>
              ● actief: {activeBoss.name}
            </span>
          )}
        </p>
      </div>

      {/* ══════════════════════════════════════════
          SECTION A — Create new boss fight
      ══════════════════════════════════════════ */}
      <section>
        <div
          style={{
            position:        'relative',
            backgroundColor: 'var(--color-surface)',
            border:          '1px solid var(--color-border)',
            padding:         '20px 24px',
          }}
        >
          <CornerDecorations />

          <h2
            style={{
              fontFamily:    'var(--font-mono)',
              fontSize:      12,
              fontWeight:    700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color:         'var(--color-accent-gold)',
              marginBottom:  16,
            }}
          >
            // Boss Fight aanmaken
          </h2>

          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

              {/* Name */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Naam *</label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="bijv. The Infinite Loop"
                  style={inputStyle}
                />
              </div>

              {/* Description */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Beschrijving</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Optionele boss lore..."
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              {/* HP */}
              <div>
                <label style={labelStyle}>HP (min 1000) *</label>
                <input
                  required
                  type="number"
                  min={1000}
                  value={form.hp}
                  onChange={(e) => setForm({ ...form, hp: e.target.value })}
                  placeholder="5000"
                  style={inputStyle}
                />
              </div>

              {/* Base Reward XP */}
              <div>
                <label style={labelStyle}>Base Reward XP</label>
                <input
                  type="number"
                  min={0}
                  value={form.baseRewardXp}
                  onChange={(e) => setForm({ ...form, baseRewardXp: e.target.value })}
                  placeholder="50"
                  style={inputStyle}
                />
              </div>

              {/* Start date */}
              <div>
                <label style={labelStyle}>Startdatum *</label>
                <input
                  required
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                  style={inputStyle}
                />
              </div>

              {/* Deadline */}
              <div>
                <label style={labelStyle}>Deadline *</label>
                <input
                  required
                  type="datetime-local"
                  value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  style={inputStyle}
                />
              </div>

              {/* Badge dropdown */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Base Reward Badge (optioneel)</label>
                <select
                  value={form.baseRewardBadgeId}
                  onChange={(e) => setForm({ ...form, baseRewardBadgeId: e.target.value })}
                  style={inputStyle}
                >
                  <option value="">-- geen badge --</option>
                  {BADGE_DEFS.map((b) => (
                    <option key={b.id} value={b.id}>
                      [{b.rarity.toUpperCase()}] {b.name} — {b.id}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* Feedback */}
            {createError && (
              <p
                style={{
                  display:    'flex',
                  alignItems: 'center',
                  gap:        4,
                  color:      'var(--color-accent-red)',
                  fontFamily: 'var(--font-mono)',
                  fontSize:   12,
                  marginTop:  10,
                }}
              >
                <AlertTriangle size={13} style={{ flexShrink: 0 }} />
                {createError}
              </p>
            )}
            {createSuccess && (
              <p
                style={{
                  display:    'flex',
                  alignItems: 'center',
                  gap:        4,
                  color:      'var(--color-accent-green)',
                  fontFamily: 'var(--font-mono)',
                  fontSize:   12,
                  marginTop:  10,
                }}
              >
                <Check size={13} style={{ flexShrink: 0 }} />
                Boss fight aangemaakt
              </p>
            )}

            <button
              type="submit"
              disabled={creating || !isFormValid}
              style={{
                display:         'flex',
                alignItems:      'center',
                gap:             6,
                marginTop:       16,
                padding:         '8px 22px',
                backgroundColor: creating ? 'transparent' : 'var(--color-accent-gold)',
                color:           creating ? 'var(--color-accent-gold)' : 'var(--color-bg)',
                border:          '1px solid var(--color-accent-gold)',
                fontFamily:      'var(--font-mono)',
                fontSize:        12,
                fontWeight:      700,
                letterSpacing:   '0.08em',
                textTransform:   'uppercase',
                cursor:          creating || !isFormValid ? 'not-allowed' : 'pointer',
                opacity:         !isFormValid ? 0.4 : 1,
              }}
            >
              <Swords size={14} />
              {creating ? '> launching...' : '> LAUNCH BOSS'}
            </button>
          </form>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION B — Boss Fight history
      ══════════════════════════════════════════ */}
      <section>
        <h2
          style={{
            fontFamily:    'var(--font-mono)',
            fontSize:      12,
            fontWeight:    700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color:         'var(--color-text-muted)',
            marginBottom:  12,
          }}
        >
          // Boss Fights ({bosses.length})
        </h2>

        {sortedBosses.length === 0 ? (
          <div
            style={{
              padding:         '24px',
              backgroundColor: 'var(--color-surface)',
              border:          '1px solid var(--color-border)',
              textAlign:       'center',
            }}
          >
            <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
              Nog geen boss fights. Maak de eerste aan.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedBosses.map((boss) => (
              <BossCard
                key={boss.id}
                boss={boss}
                contributorCount={contributorCounts[boss.id] ?? 0}
              />
            ))}
          </div>
        )}
      </section>

    </div>
  )
}
