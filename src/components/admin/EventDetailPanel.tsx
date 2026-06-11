'use client'

import { useState, useCallback, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { X, Pencil, Download } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { inputStyle, labelStyle } from '@/components/admin/adminStyles'
import { CornerDecorations } from '@/components/ui/CornerDecorations'
import { useScannerStore } from '@/stores/useScannerStore'
import { parseFormFields, displayValue, type FormField, type CustomData } from '@/lib/eventForm'

// ─── Types ────────────────────────────────────────────────────────────────────

interface DbEvent {
  id: string
  title: string
  description: string | null
  date: string
  end_date: string | null
  location: string | null
  category: 'code' | 'social' | 'career' | 'game'
  status: 'upcoming' | 'active' | 'completed' | 'cancelled'
  is_paid: boolean
  price_members: number
  price_nonmembers: number
  capacity: number | null
  external_ticket_url: string | null
  recap_description: string | null
  recap_photos: string[] | null
  recap_published: boolean
  form_fields?: unknown
  created_at: string
}

interface Ticket {
  id: string
  email: string
  name: string | null
  status: 'pending' | 'paid' | 'cancelled' | 'checked_in'
  paid_amount: number
  custom_data?: CustomData | null
  created_at: string
}

interface ScanRecord {
  id: string
  member_id: string
  points: number
  reason: string
  event_name: string | null
  scanned_by: string | null
  created_at: string
}

interface EventDetailPanelProps {
  event: DbEvent
  onEdit: () => void
  onCancel: () => void
  onRefresh: () => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  code: 'Code',
  social: 'Social',
  career: 'Career',
  game: 'Game',
}

function centsEuro(cents: number): string {
  return (cents / 100).toFixed(2)
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EventDetailPanel({ event, onEdit, onCancel, onRefresh }: EventDetailPanelProps) {
  const t = useTranslations('adminEventDetail')
  const { actiefEvent, setActiefEvent } = useScannerStore()
  const isActive = actiefEvent === event.id

  // Tickets
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [ticketsLoading, setTicketsLoading] = useState(true)

  // Scans
  const [scans, setScans] = useState<ScanRecord[]>([])
  const [scansLoading, setScansLoading] = useState(false)

  // Check-in code
  const [checkinCode, setCheckinCode] = useState<string | null>(null)
  const [checkinLoading, setCheckinLoading] = useState(false)

  // Recap
  const [recapDesc, setRecapDesc] = useState(event.recap_description || '')
  const [recapPhotos, setRecapPhotos] = useState(event.recap_photos?.join('\n') || '')
  const [recapSaving, setRecapSaving] = useState(false)
  const [recapUploading, setRecapUploading] = useState(false)

  // ── Fetch on mount
  const fetchTickets = useCallback(async () => {
    setTicketsLoading(true)
    try {
      const res = await fetch(`/api/events/${event.id}/tickets`)
      const { data } = await res.json()
      setTickets(data || [])
    } catch {
      setTickets([])
    } finally {
      setTicketsLoading(false)
    }
  }, [event.id])

  const fetchCheckinCode = useCallback(async () => {
    setCheckinLoading(true)
    try {
      const res = await fetch(`/api/admin/events/${event.id}/checkin-code`)
      const { data } = await res.json()
      setCheckinCode(data?.checkin_code ?? null)
    } catch {
      setCheckinCode(null)
    } finally {
      setCheckinLoading(false)
    }
  }, [event.id])

  const fetchScans = useCallback(async () => {
    if (!isActive) return
    setScansLoading(true)
    try {
      const res = await fetch(`/api/scans?event_name=${encodeURIComponent(event.title)}`)
      const { data } = await res.json()
      setScans(data || [])
    } catch {
      setScans([])
    } finally {
      setScansLoading(false)
    }
  }, [event.title, isActive])

  useEffect(() => {
    fetchTickets()
    fetchCheckinCode()
  }, [fetchTickets, fetchCheckinCode])

  useEffect(() => {
    fetchScans()
  }, [fetchScans])

  // ── Actions
  async function handleGenerateCode() {
    setCheckinLoading(true)
    try {
      const res = await fetch(`/api/admin/events/${event.id}/checkin-code`, { method: 'POST' })
      const { data, error } = await res.json()
      if (!res.ok || error) throw new Error(error || t('errorStatus', { status: res.status }))
      setCheckinCode(data?.checkin_code ?? null)
    } catch (err) {
      alert(err instanceof Error ? err.message : t('errorGenerateCode'))
    } finally {
      setCheckinLoading(false)
    }
  }

  function handleActivate() {
    if (isActive) {
      setActiefEvent(null, null)
    } else {
      setActiefEvent(event.id, event.title)
    }
  }

  async function handleRecapSave(published: boolean) {
    setRecapSaving(true)
    try {
      const photos = recapPhotos.split('\n').map((u) => u.trim()).filter(Boolean)
      const res = await fetch(`/api/events/${event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recap_description: recapDesc || null,
          recap_photos: photos.length > 0 ? photos : null,
          recap_published: published,
        }),
      })
      const { error } = await res.json()
      if (!res.ok || error) throw new Error(error || t('errorStatus', { status: res.status }))
      onRefresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : t('errorRecapSave'))
    } finally {
      setRecapSaving(false)
    }
  }

  async function handleRecapUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    setRecapUploading(true)
    try {
      const form = new FormData()
      Array.from(files).forEach((f) => form.append('files', f))
      const res = await fetch(`/api/events/${event.id}/recap-photos`, {
        method: 'POST',
        body: form,
      })
      const { data, error } = await res.json()
      if (!res.ok || error) throw new Error(error || t('errorStatus', { status: res.status }))
      const urls: string[] = data?.urls || []
      setRecapPhotos((prev) => {
        const existing = prev.split('\n').map((u) => u.trim()).filter(Boolean)
        return [...existing, ...urls].join('\n')
      })
    } catch (err) {
      alert(err instanceof Error ? err.message : t('errorUpload'))
    } finally {
      setRecapUploading(false)
      e.target.value = ''
    }
  }

  // ── Ticket stats
  const paidCount = tickets.filter((t) => t.status === 'paid' || t.status === 'checked_in').length
  const checkedInCount = tickets.filter((t) => t.status === 'checked_in').length
  const formFields: FormField[] = parseFormFields(event.form_fields)
  const pct = paidCount > 0 ? Math.round((checkedInCount / paidCount) * 100) : 0

  const btnStyle = (color: string, filled = false): React.CSSProperties => ({
    padding: '6px 14px',
    backgroundColor: filled ? color : 'transparent',
    color: filled ? 'var(--color-bg)' : color,
    border: `1px solid ${color}`,
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    cursor: 'pointer',
  })

  return (
    <div style={{ borderTop: '1px solid var(--color-border)', padding: 16, backgroundColor: 'var(--color-bg)' }}>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <button onClick={onEdit} style={btnStyle('var(--color-accent-blue)')}>
          <Pencil size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
          {t('btnEdit')}
        </button>
        <button onClick={handleActivate} style={btnStyle('var(--color-accent-green)', isActive)}>
          {isActive ? t('btnScannerActive') : t('btnActivateScanner')}
        </button>
        {event.status !== 'cancelled' && (
          <button onClick={onCancel} style={btnStyle('var(--color-accent-red)')}>
            <X size={11} style={{ display: 'inline', marginRight: 3, verticalAlign: 'middle' }} />
            {t('btnCancel')}
          </button>
        )}
      </div>

      {/* Check-in code */}
      <div
        style={{
          padding: '12px 16px',
          marginBottom: 16,
          backgroundColor: 'rgba(245, 158, 11, 0.04)',
          border: '1px solid rgba(245, 158, 11, 0.12)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)', marginBottom: 4 }}>
              {t('checkinCodeLabel')}
            </p>
            {checkinLoading ? (
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-muted)' }}>{t('checkinLoading')}</p>
            ) : checkinCode ? (
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 700, letterSpacing: '0.2em', color: 'var(--color-accent-gold)' }}>
                {checkinCode}
              </p>
            ) : (
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-muted)' }}>{t('checkinNoCode')}</p>
            )}
          </div>
          <button
            onClick={handleGenerateCode}
            disabled={checkinLoading}
            style={{
              ...btnStyle('var(--color-accent-gold)'),
              cursor: checkinLoading ? 'not-allowed' : 'pointer',
              opacity: checkinLoading ? 0.5 : 1,
              flexShrink: 0,
            }}
          >
            {checkinCode ? t('checkinNewCode') : t('checkinGenerate')}
          </button>
        </div>
        {checkinCode && (
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)', marginTop: 6, opacity: 0.7 }}>
            {t('checkinHint')}
          </p>
        )}
      </div>

      {/* Event details grid */}
      {event.description && (
        <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12, marginBottom: 12 }}>
          {event.description}
        </p>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px', marginBottom: 16 }}>
        {[
          [t('fieldId'), event.id.slice(0, 8) + '...'],
          [t('fieldCategory'), CATEGORY_LABELS[event.category]],
          [t('fieldCapacity'), event.capacity ? t('capacitySpots', { count: event.capacity }) : t('capacityUnlimited')],
          [t('fieldCreated'), formatDate(event.created_at)],
          ...(event.is_paid ? [
            [t('fieldPriceMembers'), `EUR ${centsEuro(event.price_members)}`],
            [t('fieldPriceNonMembers'), `EUR ${centsEuro(event.price_nonmembers)}`],
          ] : []),
        ].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', gap: 6 }}>
            <span style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11, minWidth: 110 }}>
              {k}:
            </span>
            <span style={{ color: 'var(--color-text)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
              {v}
            </span>
          </div>
        ))}
      </div>

      {/* Recap editor (completed events) */}
      {event.status === 'completed' && (
        <div style={{ marginBottom: 16, padding: '12px 16px', backgroundColor: 'rgba(59, 130, 246, 0.04)', border: '1px solid rgba(59, 130, 246, 0.12)' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-accent-blue)', marginBottom: 8 }}>
            {t('recapTitle')}
            {event.recap_published && (
              <span style={{ marginLeft: 8, color: 'var(--color-accent-green)', fontWeight: 400 }}>
                {t('recapPublished')}
              </span>
            )}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div>
              <label style={labelStyle}>{t('recapDescriptionLabel')}</label>
              <textarea
                rows={3}
                value={recapDesc}
                onChange={(e) => setRecapDesc(e.target.value)}
                placeholder={t('recapDescriptionPlaceholder')}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>
            <div>
              <label style={labelStyle}>{t('recapUploadLabel')}</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                multiple
                onChange={handleRecapUpload}
                disabled={recapUploading}
                style={{ ...inputStyle, padding: '6px 8px', cursor: recapUploading ? 'wait' : 'pointer' }}
              />
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)', marginTop: 4 }}>
                {recapUploading ? t('recapUploading') : t('recapUploadHint')}
              </p>
            </div>
            <div>
              <label style={labelStyle}>{t('recapPhotoUrlsLabel')}</label>
              <textarea
                rows={3}
                value={recapPhotos}
                onChange={(e) => setRecapPhotos(e.target.value)}
                placeholder={'https://example.com/foto1.jpg\nhttps://example.com/foto2.jpg'}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => handleRecapSave(false)}
                disabled={recapSaving}
                style={btnStyle('var(--color-text-muted)')}
              >
                {t('recapSaveDraft')}
              </button>
              <button
                onClick={() => handleRecapSave(true)}
                disabled={recapSaving}
                style={btnStyle('var(--color-accent-green)', true)}
              >
                {t('recapPublish')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tickets */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)' }}>
            {t('ticketsTitle')}
          </p>
          {tickets.length > 0 && (
            <a
              href={`/api/events/${event.id}/tickets/export`}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                fontFamily: 'var(--font-mono)', fontSize: 11,
                color: 'var(--color-accent-gold)', textDecoration: 'none',
                border: '1px solid var(--color-border)', padding: '4px 10px',
              }}
            >
              <Download size={12} /> {t('ticketsExport')}
            </a>
          )}
        </div>

        {/* Attendance summary */}
        {tickets.length > 0 && (
          <div
            style={{
              display: 'flex',
              gap: 16,
              padding: '8px 12px',
              marginBottom: 10,
              backgroundColor: 'rgba(242,158,24,0.04)',
              border: '1px solid rgba(242,158,24,0.12)',
            }}
          >
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-muted)' }}>{t('attendanceLabel')}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--color-accent-green)' }}>
                {t('attendanceSummary', { checkedIn: checkedInCount, paid: paidCount, pct })}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-muted)' }}>{t('noShowsLabel')}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: paidCount - checkedInCount > 0 ? 'var(--color-accent-red)' : 'var(--color-text-muted)' }}>
                {paidCount - checkedInCount}
              </span>
            </div>
          </div>
        )}

        {ticketsLoading ? (
          <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{t('ticketsLoading')}</p>
        ) : tickets.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{t('ticketsEmpty')}</p>
        ) : (
          <div className="space-y-1">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '6px 10px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                }}
              >
                <div>
                  <span style={{ color: 'var(--color-text)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                    {ticket.name || ticket.email}
                  </span>
                  {ticket.name && (
                    <span style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11, marginLeft: 8 }}>
                      {ticket.email}
                    </span>
                  )}
                  {formFields.length > 0 && ticket.custom_data && (
                    <div style={{ marginTop: 3, display: 'flex', flexWrap: 'wrap', gap: '2px 10px' }}>
                      {formFields.map((f) => {
                        const val = displayValue(f, ticket.custom_data as CustomData)
                        if (!val) return null
                        return (
                          <span key={f.id} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)' }}>
                            {f.label}: <span style={{ color: 'var(--color-text)' }}>{val}</span>
                          </span>
                        )
                      })}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  {ticket.paid_amount > 0 && (
                    <span style={{ color: 'var(--color-accent-gold)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                      EUR {centsEuro(ticket.paid_amount)}
                    </span>
                  )}
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color:
                        ticket.status === 'paid' ? 'var(--color-accent-green)' :
                        ticket.status === 'checked_in' ? 'var(--color-accent-blue)' :
                        ticket.status === 'cancelled' ? 'var(--color-accent-red)' :
                        'var(--color-text-muted)',
                    }}
                  >
                    {ticket.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Scans (when scanner is active) */}
      {isActive && (
        <div style={{ marginTop: 16 }}>
          <div style={{ position: 'relative', padding: '16px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <CornerDecorations />
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)', marginBottom: 8 }}>
              {t('scansTitle')} - <span style={{ color: 'var(--color-accent-gold)' }}>{event.title}</span>
            </p>

            {scansLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse" style={{ height: 40, backgroundColor: 'var(--color-bg)' }} />
                ))}
              </div>
            ) : scans.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                {t('scansEmpty')}
              </p>
            ) : (
              <div className="space-y-1">
                {scans.map((scan) => (
                  <div
                    key={scan.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      backgroundColor: 'var(--color-bg)',
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <p style={{ color: 'var(--color-text)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                        {scan.member_id.slice(0, 8)}... - {scan.reason}
                      </p>
                      <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                        {new Date(scan.created_at).toLocaleString('nl-NL', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {scan.scanned_by && ` ${t('scansBy', { name: scan.scanned_by.split('@')[0] })}`}
                      </p>
                    </div>
                    <span
                      style={{
                        color: 'var(--color-accent-gold)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 13,
                        fontWeight: 700,
                        flexShrink: 0,
                        marginLeft: 12,
                      }}
                    >
                      {t('scansPoints', { points: scan.points })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
