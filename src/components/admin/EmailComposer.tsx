'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Mail, Send, Users, AlertTriangle, Check, X, FileText } from 'lucide-react'
import { inputStyle as baseInputStyle, labelStyle as baseLabelStyle } from '@/components/admin/adminStyles'
import { CornerDecorations } from '@/components/ui/CornerDecorations'
import { SITE_CONFIG } from '@/lib/constants'

// ─── Types ────────────────────────────────────────────────────────────────────

type EmailFilter = 'all' | 'active' | 'bestuur' | 'commissie'

// ─── Email templates per aanleiding ───────────────────────────────────────────

// Template ids — labels/descriptions/subject/body come from translations
const TEMPLATE_IDS = ['blank', 'new_event', 'new_challenge', 'newsletter', 'reminder'] as const
type TemplateId = (typeof TEMPLATE_IDS)[number]

// Maps a template id to its translation key prefix
const TEMPLATE_KEY: Record<TemplateId, string> = {
  blank: 'templateBlank',
  new_event: 'templateNewEvent',
  new_challenge: 'templateNewChallenge',
  newsletter: 'templateNewsletter',
  reminder: 'templateReminder',
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FILTER_VALUES: EmailFilter[] = ['all', 'active', 'bestuur', 'commissie']

// Maps a filter value to its translation key suffix
const FILTER_KEY: Record<EmailFilter, string> = {
  all: 'All',
  active: 'Active',
  bestuur: 'Bestuur',
  commissie: 'Commissie',
}

// ─── Shared input/label styles (with EmailComposer overrides) ────────────────

const inputStyle: React.CSSProperties = { ...baseInputStyle, padding: '8px 12px', boxSizing: 'border-box' }
const labelStyle: React.CSSProperties = { ...baseLabelStyle, marginBottom: 6 }

// ─── Live email preview (approximates the template) ───────────────────────────

function EmailPreview({
  subject,
  body,
  t,
}: {
  subject: string
  body: string
  t: ReturnType<typeof useTranslations>
}) {
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
            {t('previewOrgName')}
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', margin: '0 0 20px 0' }} />

        {/* Subject as preview label */}
        {subject && (
          <div style={{ fontSize: 10, color: '#6B7280', marginBottom: 16, letterSpacing: '0.04em' }}>
            {t('previewSubjectLabel')} <span style={{ color: '#F29E18' }}>{subject}</span>
          </div>
        )}

        {/* Greeting */}
        <div style={{ fontSize: 13, fontWeight: 600, color: '#FAFAFA', marginBottom: 16, lineHeight: 1.5 }}>
          {t('previewGreeting')}
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
            {t('previewEmptyBody')}
          </div>
        )}

        {/* Divider */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', margin: '20px 0 16px 0' }} />

        {/* Signature */}
        <div style={{ fontSize: 11, color: '#6B7280', lineHeight: 1.4, marginBottom: 4 }}>
          {t('previewSignOff')}
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#FAFAFA', marginBottom: 4, lineHeight: 1.4 }}>
          {t('previewBoard')} - <span style={{ color: '#F29E18' }}>{`{`}SIT{`}`}</span>
        </div>
        <div style={{ fontSize: 10, color: '#6B7280', lineHeight: 1.7 }}>
          {t('previewOrgName')}<br />
          {t('previewOrgSchool')}
        </div>
        <div style={{ fontSize: 10, color: '#6B7280', marginTop: 8, lineHeight: 1.8 }}>
          <span style={{ color: '#F29E18' }}>svsit.nl</span>
          {' | '}
          <span style={{ color: '#F29E18' }}>{SITE_CONFIG.email}</span>
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

// ─── Main component ───────────────────────────────────────────────────────────

export default function EmailComposer() {
  const t = useTranslations('adminEmailComposer')
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
      if (!res.ok) throw new Error(data.error ?? t('errorSendFailed'))
      setResult({ sent: data.sent, failed: data.failed })
      // Reset form on full success
      if (data.failed === 0) {
        setSubject('')
        setBody('')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errorUnknown'))
    } finally {
      setSending(false)
    }
  }

  const canSend = subject.trim().length > 0 && body.trim().length > 0 && !sending

  const selectedFilterDescription = t(`filter${FILTER_KEY[filter]}Description`)

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
          {'>'} {t('headerTitle')}
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12, marginTop: 4, marginBottom: 0 }}>
          {t('headerSubtitle')}
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
            LEFT - Compose form
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
            // {t('formSection')}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* ── Filter ── */}
            <div>
              <label style={labelStyle}>
                <Users size={11} style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle' }} />
                {t('recipientsLabel')}
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
                {FILTER_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {t(`filter${FILTER_KEY[value]}Label`)}
                  </option>
                ))}
              </select>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-muted)', marginTop: 6, marginBottom: 0 }}>
                {selectedFilterDescription}
                {' - '}
                {countLoading ? (
                  <span style={{ color: 'var(--color-text-muted)' }}>{t('recipientsLoading')}</span>
                ) : count !== null ? (
                  <span style={{ color: 'var(--color-accent-gold)', fontWeight: 700 }}>
                    {t('recipientsCount', { count })}
                  </span>
                ) : (
                  <span style={{ color: 'var(--color-accent-red)' }}>{t('recipientsUnknown')}</span>
                )}
              </p>
            </div>

            {/* ── Template selector ── */}
            <div>
              <label style={labelStyle}>
                <FileText size={11} style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle' }} />
                {t('templateLabel')}
              </label>
              <select
                value=""
                onChange={(e) => {
                  const id = e.target.value as TemplateId
                  if (TEMPLATE_IDS.includes(id)) {
                    const key = TEMPLATE_KEY[id]
                    setSubject(id === 'blank' ? '' : t(`${key}Subject`))
                    setBody(id === 'blank' ? '' : t(`${key}Body`))
                    setResult(null)
                    setError(null)
                  }
                }}
                style={inputStyle}
                disabled={sending}
              >
                <option value="" disabled>{t('templatePlaceholder')}</option>
                {TEMPLATE_IDS.map((id) => (
                  <option key={id} value={id}>
                    {t(`${TEMPLATE_KEY[id]}Label`)} - {t(`${TEMPLATE_KEY[id]}Description`)}
                  </option>
                ))}
              </select>
            </div>

            {/* ── Subject ── */}
            <div>
              <label style={labelStyle}>{t('subjectLabel')}</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => { setSubject(e.target.value); setResult(null); setError(null) }}
                placeholder={t('subjectPlaceholder')}
                style={inputStyle}
                disabled={sending}
              />
            </div>

            {/* ── Body ── */}
            <div>
              <label style={labelStyle}>{t('bodyLabel')}</label>
              <textarea
                rows={10}
                value={body}
                onChange={(e) => { setBody(e.target.value); setResult(null); setError(null) }}
                placeholder={t('bodyPlaceholder')}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.7 }}
                disabled={sending}
              />
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)', marginTop: 4, marginBottom: 0 }}>
                {t('bodyHint')}
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
                  {t('resultSent', { count: result.sent })}
                  {result.failed > 0 && t('resultFailed', { count: result.failed })}
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
                  {t('confirmPrefix')} <strong style={{ color: 'var(--color-accent-gold)' }}>{subject}</strong> {t('confirmTo')}{' '}
                  <strong style={{ color: 'var(--color-accent-gold)' }}>
                    {count !== null ? t('confirmRecipients', { count }) : '?'}
                  </strong>{t('confirmSuffix')}
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
                    {t('confirmSend')}
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
                    {t('confirmCancel')}
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
                {sending ? t('sendingButton') : t('sendButton')}
              </button>
            )}

          </div>
        </div>

        {/* ════════════════════
            RIGHT - Live preview
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
            // {t('previewSectionLabel')}
          </p>

          <EmailPreview subject={subject} body={body} t={t} />
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
