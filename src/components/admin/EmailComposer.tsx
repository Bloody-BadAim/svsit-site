'use client'

import { useState, useEffect, useCallback } from 'react'
import { Mail, Send, Users, AlertTriangle, Check, X, FileText } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type EmailFilter = 'all' | 'active' | 'bestuur' | 'commissie'

interface FilterOption {
  value: EmailFilter
  label: string
  description: string
}

// ─── Email templates per aanleiding ───────────────────────────────────────────

interface EmailTemplate {
  id: string
  label: string
  description: string
  subject: string
  body: string
}

const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'blank',
    label: 'Leeg bericht',
    description: 'Begin vanaf scratch',
    subject: '',
    body: '',
  },
  {
    id: 'new_event',
    label: 'Nieuw event',
    description: 'Kondig een event aan',
    subject: 'Nieuw SIT event: [EVENT NAAM]',
    body: `Er staat weer een vet event op de planning!\n\n[EVENT NAAM]\nDatum: [DATUM]\nLocatie: [LOCATIE]\nTijd: [TIJD]\n\nWat kun je verwachten?\n[KORTE BESCHRIJVING]\n\nMeld je aan via svsit.nl en verdien XP door aanwezig te zijn.\n\nHope to see you there!`,
  },
  {
    id: 'new_boss',
    label: 'Boss fight',
    description: 'Kondig een boss fight aan',
    subject: 'Boss Fight: [BOSS NAAM] verschijnt!',
    body: `Een nieuwe boss is verschenen!\n\n[BOSS NAAM]\nHP: [AANTAL] — Deadline: [DATUM]\n\n[BESCHRIJVING]\n\nHoe doe je mee? Gewoon actief zijn! Elke XP die je verdient telt mee als damage. Hoe meer events je bezoekt en challenges je doet, hoe harder je slaat.\n\nAls we de boss samen verslaan krijgt iedereen een bonus reward. De top 3 bijdragers krijgen een exclusive item.\n\nOpen je dashboard op svsit.nl om de health bar live te volgen.`,
  },
  {
    id: 'new_challenge',
    label: 'Nieuwe challenge',
    description: 'Kondig een challenge of quest aan',
    subject: 'Nieuwe challenge: [CHALLENGE NAAM]',
    body: `Er is een nieuwe challenge beschikbaar!\n\n[CHALLENGE NAAM]\nCategorie: [CODE/SOCIAL/LEARN/IMPACT]\nXP reward: [AANTAL] XP\nDeadline: [DATUM]\n\n[BESCHRIJVING]\n\nGa naar je dashboard op svsit.nl om de challenge te bekijken en bewijs in te leveren.`,
  },
  {
    id: 'newsletter',
    label: 'Nieuwsbrief',
    description: 'Maandelijkse update',
    subject: 'SIT Update — [MAAND] [JAAR]',
    body: `Hier is je maandelijkse SIT update!\n\nWat is er gebeurd\n- [HIGHLIGHT 1]\n- [HIGHLIGHT 2]\n- [HIGHLIGHT 3]\n\nKomende events\n- [EVENT 1] — [DATUM]\n- [EVENT 2] — [DATUM]\n\nLeaderboard update\nDe huidige top 3: [NAAM 1], [NAAM 2], [NAAM 3]. Check svsit.nl/leaderboard voor de volledige ranking.\n\nNieuwe shop items\n[ITEMS BESCHRIJVING]\n\nTot de volgende!`,
  },
  {
    id: 'reminder',
    label: 'Event reminder',
    description: 'Herinnering voor een event',
    subject: 'Reminder: [EVENT NAAM] is morgen!',
    body: `Niet vergeten: morgen is [EVENT NAAM]!\n\nDatum: [DATUM]\nTijd: [TIJD]\nLocatie: [LOCATIE]\n\nVergeet je telefoon niet — je hebt je QR code nodig om in te checken en XP te verdienen.\n\nTot morgen!`,
  },
]

// ─── Constants ────────────────────────────────────────────────────────────────

const FILTER_OPTIONS: FilterOption[] = [
  { value: 'all',       label: 'Alle actieve leden',        description: 'Iedereen met een actief lidmaatschap'   },
  { value: 'active',    label: 'Recent actief (30 dagen)',   description: 'Leden met een scan in de laatste 30 dagen' },
  { value: 'bestuur',   label: 'Bestuur',                   description: 'Alleen bestuursleden'                   },
  { value: 'commissie', label: 'Commissieleden',             description: 'Leden in een of meer commissies'        },
]

// ─── Shared input/label styles ────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  backgroundColor: 'var(--color-bg)',
  color: 'var(--color-text)',
  border: '1px solid var(--color-border)',
  fontFamily: 'var(--font-mono)',
  fontSize: 13,
  padding: '8px 12px',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  color: 'var(--color-text-muted)',
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
  display: 'block',
  marginBottom: 6,
}

// ─── Live email preview (approximates the template) ───────────────────────────

function EmailPreview({ subject, body }: { subject: string; body: string }) {
  const paragraphs = body
    .split('\n')
    .map((p) => p.trim())
    .filter((p) => p.length > 0)

  const mono = "'JetBrains Mono','Fira Code','Courier New',monospace"

  return (
    <div
      style={{
        backgroundColor: '#09090B',
        border: '1px solid rgba(255,255,255,0.08)',
        overflow: 'hidden',
        fontFamily: mono,
      }}
    >
      {/* Top accent bar */}
      <div style={{ display: 'flex', height: 4 }}>
        <div style={{ flex: 1, backgroundColor: '#EF4444' }} />
        <div style={{ flex: 1, backgroundColor: '#F29E18' }} />
        <div style={{ flex: 1, backgroundColor: '#22C55E' }} />
        <div style={{ flex: 1, backgroundColor: '#3B82F6' }} />
      </div>

      <div style={{ padding: '28px 32px 24px 32px' }}>
        {/* Logo */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#FAFAFA', lineHeight: 1, marginBottom: 4 }}>
            <span style={{ color: '#F29E18' }}>{`{`}</span>
            SIT
            <span style={{ color: '#F29E18' }}>{`}`}</span>
          </div>
          <div style={{ fontSize: 10, color: '#6B7280', letterSpacing: '0.05em' }}>
            Studievereniging ICT
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', margin: '0 0 20px 0' }} />

        {/* Subject as preview label */}
        {subject && (
          <div style={{ fontSize: 10, color: '#6B7280', marginBottom: 16, letterSpacing: '0.04em' }}>
            Onderwerp: <span style={{ color: '#F29E18' }}>{subject}</span>
          </div>
        )}

        {/* Greeting */}
        <div style={{ fontSize: 13, fontWeight: 600, color: '#FAFAFA', marginBottom: 16, lineHeight: 1.5 }}>
          Hoi [voornaam],
        </div>

        {/* Body */}
        {paragraphs.length > 0 ? (
          paragraphs.map((para, i) => (
            <div
              key={i}
              style={{ fontSize: 12, color: '#FAFAFA', lineHeight: 1.8, marginBottom: 12 }}
            >
              {para}
            </div>
          ))
        ) : (
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', fontStyle: 'italic', marginBottom: 12 }}>
            Begin met typen...
          </div>
        )}

        {/* Divider */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', margin: '20px 0 16px 0' }} />

        {/* Signature */}
        <div style={{ fontSize: 11, color: '#6B7280', lineHeight: 1.4, marginBottom: 4 }}>
          Met vriendelijke groet,
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#FAFAFA', marginBottom: 4, lineHeight: 1.4 }}>
          Bestuur XI — <span style={{ color: '#F29E18' }}>{`{`}SIT{`}`}</span>
        </div>
        <div style={{ fontSize: 10, color: '#6B7280', lineHeight: 1.7 }}>
          Studievereniging ICT<br />
          Hogeschool van Amsterdam
        </div>
        <div style={{ fontSize: 10, color: '#6B7280', marginTop: 8, lineHeight: 1.8 }}>
          <span style={{ color: '#F29E18' }}>svsit.nl</span>
          {' | '}
          <span style={{ color: '#F29E18' }}>bestuur@svsit.nl</span>
        </div>
      </div>

      {/* Bottom accent bar (reversed) */}
      <div style={{ display: 'flex', height: 4 }}>
        <div style={{ flex: 1, backgroundColor: '#3B82F6' }} />
        <div style={{ flex: 1, backgroundColor: '#22C55E' }} />
        <div style={{ flex: 1, backgroundColor: '#F29E18' }} />
        <div style={{ flex: 1, backgroundColor: '#EF4444' }} />
      </div>
    </div>
  )
}

// ─── Corner decoration ────────────────────────────────────────────────────────

function CornerDecorations() {
  return (
    <>
      <span style={{ position: 'absolute', top: 0,    left: 0,  width: 10, height: 10, borderTop:    '2px solid var(--color-accent-gold)', borderLeft:   '2px solid var(--color-accent-gold)' }} />
      <span style={{ position: 'absolute', top: 0,    right: 0, width: 10, height: 10, borderTop:    '2px solid var(--color-accent-gold)', borderRight:  '2px solid var(--color-accent-gold)' }} />
      <span style={{ position: 'absolute', bottom: 0, left: 0,  width: 10, height: 10, borderBottom: '2px solid var(--color-accent-gold)', borderLeft:   '2px solid var(--color-accent-gold)' }} />
      <span style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderBottom: '2px solid var(--color-accent-gold)', borderRight:  '2px solid var(--color-accent-gold)' }} />
    </>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function EmailComposer() {
  const [filter, setFilter]   = useState<EmailFilter>('all')
  const [subject, setSubject] = useState('')
  const [body, setBody]       = useState('')
  const [count, setCount]     = useState<number | null>(null)
  const [countLoading, setCountLoading] = useState(false)

  const [sending, setSending]       = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null)
  const [error, setError]   = useState<string | null>(null)

  // Fetch recipient count whenever filter changes
  const fetchCount = useCallback(async (f: EmailFilter) => {
    setCountLoading(true)
    setCount(null)
    try {
      const res = await fetch(`/api/admin/email?filter=${f}`)
      const data = await res.json()
      setCount(typeof data.count === 'number' ? data.count : null)
    } catch {
      setCount(null)
    } finally {
      setCountLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCount(filter)
  }, [filter, fetchCount])

  async function handleSend() {
    setShowConfirm(false)
    setSending(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/admin/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, body, filter }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Verzenden mislukt')
      setResult({ sent: data.sent, failed: data.failed })
      // Reset form on full success
      if (data.failed === 0) {
        setSubject('')
        setBody('')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Onbekende fout')
    } finally {
      setSending(false)
    }
  }

  const canSend = subject.trim().length > 0 && body.trim().length > 0 && !sending

  const selectedFilter = FILTER_OPTIONS.find((o) => o.value === filter)!

  return (
    <div style={{ maxWidth: 1100 }}>

      {/* ── Page header ── */}
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            color: 'var(--color-text)',
            fontFamily: 'var(--font-mono)',
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: '0.04em',
            margin: 0,
          }}
        >
          {'>'} email.compose
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12, marginTop: 4, marginBottom: 0 }}>
          Verstuur een e-mail naar SIT leden via het branded template
        </p>
      </div>

      {/* ── Split layout: form (left) + preview (right) ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 24,
          alignItems: 'start',
        }}
        className="email-composer-grid"
      >

        {/* ════════════════════
            LEFT — Compose form
            ════════════════════ */}
        <div
          style={{
            position: 'relative',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            padding: '20px 24px',
          }}
        >
          <CornerDecorations />

          <h2
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--color-accent-gold)',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Mail size={13} />
            // Stel e-mail in
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* ── Filter ── */}
            <div>
              <label style={labelStyle}>
                <Users size={11} style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle' }} />
                Ontvangers
              </label>
              <select
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value as EmailFilter)
                  setResult(null)
                  setError(null)
                }}
                style={inputStyle}
              >
                {FILTER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-muted)', marginTop: 6, marginBottom: 0 }}>
                {selectedFilter.description}
                {' — '}
                {countLoading ? (
                  <span style={{ color: 'var(--color-text-muted)' }}>laden...</span>
                ) : count !== null ? (
                  <span style={{ color: 'var(--color-accent-gold)', fontWeight: 700 }}>
                    {count} {count === 1 ? 'ontvanger' : 'ontvangers'}
                  </span>
                ) : (
                  <span style={{ color: 'var(--color-accent-red)' }}>onbekend</span>
                )}
              </p>
            </div>

            {/* ── Template selector ── */}
            <div>
              <label style={labelStyle}>
                <FileText size={11} style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle' }} />
                Template
              </label>
              <select
                value=""
                onChange={(e) => {
                  const tpl = EMAIL_TEMPLATES.find((t) => t.id === e.target.value)
                  if (tpl) {
                    setSubject(tpl.subject)
                    setBody(tpl.body)
                    setResult(null)
                    setError(null)
                  }
                }}
                style={inputStyle}
                disabled={sending}
              >
                <option value="" disabled>Kies een template...</option>
                {EMAIL_TEMPLATES.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.label} — {tpl.description}
                  </option>
                ))}
              </select>
            </div>

            {/* ── Subject ── */}
            <div>
              <label style={labelStyle}>Onderwerp *</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => { setSubject(e.target.value); setResult(null); setError(null) }}
                placeholder="Bijv. Aankomende events — april 2026"
                style={inputStyle}
                disabled={sending}
              />
            </div>

            {/* ── Body ── */}
            <div>
              <label style={labelStyle}>Berichttekst *</label>
              <textarea
                rows={10}
                value={body}
                onChange={(e) => { setBody(e.target.value); setResult(null); setError(null) }}
                placeholder={'Schrijf hier je bericht...\n\nElke lege regel wordt een nieuwe alinea.'}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.7 }}
                disabled={sending}
              />
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)', marginTop: 4, marginBottom: 0 }}>
                Lege regels worden losse alineas. De aanhef en handtekening worden automatisch toegevoegd.
              </p>
            </div>

            {/* ── Feedback ── */}
            {error && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  padding: '10px 12px',
                  border: '1px solid var(--color-accent-red)',
                  backgroundColor: 'rgba(239,68,68,0.08)',
                }}
              >
                <AlertTriangle size={13} style={{ color: 'var(--color-accent-red)', flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-accent-red)', margin: 0 }}>
                  {error}
                </p>
              </div>
            )}

            {result && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  padding: '10px 12px',
                  border: `1px solid ${result.failed > 0 ? 'var(--color-accent-gold)' : 'var(--color-accent-green)'}`,
                  backgroundColor: result.failed > 0 ? 'rgba(242,158,24,0.08)' : 'rgba(34,197,94,0.08)',
                }}
              >
                {result.failed > 0
                  ? <AlertTriangle size={13} style={{ color: 'var(--color-accent-gold)', flexShrink: 0, marginTop: 1 }} />
                  : <Check size={13} style={{ color: 'var(--color-accent-green)', flexShrink: 0, marginTop: 1 }} />
                }
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: result.failed > 0 ? 'var(--color-accent-gold)' : 'var(--color-accent-green)', margin: 0 }}>
                  {result.sent} {result.sent === 1 ? 'e-mail' : 'e-mails'} verzonden
                  {result.failed > 0 && ` · ${result.failed} mislukt`}
                </p>
              </div>
            )}

            {/* ── Send button / confirm ── */}
            {showConfirm ? (
              <div
                style={{
                  padding: '14px 16px',
                  border: '1px solid var(--color-accent-gold)',
                  backgroundColor: 'rgba(242,158,24,0.06)',
                }}
              >
                <p
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                    color: 'var(--color-text)',
                    margin: '0 0 12px 0',
                    lineHeight: 1.6,
                  }}
                >
                  <AlertTriangle size={12} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle', color: 'var(--color-accent-gold)' }} />
                  Verstuur <strong style={{ color: 'var(--color-accent-gold)' }}>{subject}</strong> naar{' '}
                  <strong style={{ color: 'var(--color-accent-gold)' }}>
                    {count ?? '?'} {(count ?? 0) === 1 ? 'ontvanger' : 'ontvangers'}
                  </strong>?
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={handleSend}
                    style={{
                      padding: '7px 18px',
                      backgroundColor: 'var(--color-accent-gold)',
                      color: 'var(--color-bg)',
                      border: '1px solid var(--color-accent-gold)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                    }}
                  >
                    <Send size={11} style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle' }} />
                    Bevestig
                  </button>
                  <button
                    onClick={() => setShowConfirm(false)}
                    style={{
                      padding: '7px 18px',
                      backgroundColor: 'transparent',
                      color: 'var(--color-text-muted)',
                      border: '1px solid var(--color-border)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                    }}
                  >
                    <X size={11} style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle' }} />
                    Annuleer
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirm(true)}
                disabled={!canSend}
                style={{
                  padding: '10px 22px',
                  backgroundColor: canSend ? 'var(--color-accent-gold)' : 'transparent',
                  color: canSend ? 'var(--color-bg)' : 'var(--color-text-muted)',
                  border: '1px solid var(--color-accent-gold)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  cursor: canSend ? 'pointer' : 'not-allowed',
                  opacity: !canSend ? 0.4 : 1,
                  alignSelf: 'flex-start',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                }}
              >
                <Send size={13} />
                {sending ? 'Verzenden...' : 'Verstuur'}
              </button>
            )}

          </div>
        </div>

        {/* ════════════════════
            RIGHT — Live preview
            ════════════════════ */}
        <div>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--color-text-muted)',
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Mail size={11} />
            // Live preview
          </p>

          <EmailPreview subject={subject} body={body} />
        </div>
      </div>

      {/* Responsive: stack on small screens */}
      <style>{`
        @media (max-width: 768px) {
          .email-composer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
