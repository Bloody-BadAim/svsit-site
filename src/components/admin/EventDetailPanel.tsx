'use client'

import { useState, useCallback, useEffect } from 'react'
import { X, Pencil } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { inputStyle, labelStyle } from '@/components/admin/adminStyles'
import { CornerDecorations } from '@/components/ui/CornerDecorations'
import { useScannerStore } from '@/stores/useScannerStore'

// ─── Types ────────────────────────────────────────────────────────────────────

interface DbEvent {
  id: string
  title: string
  description: string | null
  date: string
  end_date: string | null
  location: string | null
  category: 'code' | 'social' | 'learn' | 'impact'
  status: 'upcoming' | 'active' | 'completed' | 'cancelled'
  is_paid: boolean
  price_members: number
  price_nonmembers: number
  capacity: number | null
  recap_description: string | null
  recap_photos: string[] | null
  recap_published: boolean
  created_at: string
}

interface Ticket {
  id: string
  email: string
  name: string | null
  status: 'pending' | 'paid' | 'cancelled' | 'checked_in'
  paid_amount: number
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
  learn: 'Learn',
  impact: 'Impact',
}

function centsEuro(cents: number): string {
  return (cents / 100).toFixed(2)
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EventDetailPanel({ event, onEdit, onCancel, onRefresh }: EventDetailPanelProps) {
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
      if (error) throw new Error(error)
      setCheckinCode(data?.checkin_code ?? null)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Code genereren mislukt')
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
      if (error) throw new Error(error)
      onRefresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Recap opslaan mislukt')
    } finally {
      setRecapSaving(false)
    }
  }

  // ── Ticket stats
  const paidCount = tickets.filter((t) => t.status === 'paid' || t.status === 'checked_in').length
  const checkedInCount = tickets.filter((t) => t.status === 'checked_in').length
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
          Bewerken
        </button>
        <button onClick={handleActivate} style={btnStyle('var(--color-accent-green)', isActive)}>
          {isActive ? 'Scanner actief' : 'Activeren voor scanner'}
        </button>
        {event.status !== 'cancelled' && (
          <button onClick={onCancel} style={btnStyle('var(--color-accent-red)')}>
            <X size={11} style={{ display: 'inline', marginRight: 3, verticalAlign: 'middle' }} />
            Annuleren
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
              Check-in code
            </p>
            {checkinLoading ? (
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-muted)' }}>Laden...</p>
            ) : checkinCode ? (
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 700, letterSpacing: '0.2em', color: 'var(--color-accent-gold)' }}>
                {checkinCode}
              </p>
            ) : (
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-muted)' }}>Geen code ingesteld</p>
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
            {checkinCode ? 'Nieuwe code' : 'Code genereren'}
          </button>
        </div>
        {checkinCode && (
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)', marginTop: 6, opacity: 0.7 }}>
            Toon deze code op een scherm of poster bij het event. Leden voeren dit in op de event pagina om in te checken.
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
          ['ID', event.id.slice(0, 8) + '...'],
          ['Categorie', CATEGORY_LABELS[event.category]],
          ['Capaciteit', event.capacity ? `${event.capacity} plekken` : 'Onbeperkt'],
          ['Aangemaakt', formatDate(event.created_at)],
          ...(event.is_paid ? [
            ['Prijs leden', `EUR ${centsEuro(event.price_members)}`],
            ['Prijs niet-leden', `EUR ${centsEuro(event.price_nonmembers)}`],
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
            Recap
            {event.recap_published && (
              <span style={{ marginLeft: 8, color: 'var(--color-accent-green)', fontWeight: 400 }}>
                (gepubliceerd)
              </span>
            )}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div>
              <label style={labelStyle}>Beschrijving</label>
              <textarea
                rows={3}
                value={recapDesc}
                onChange={(e) => setRecapDesc(e.target.value)}
                placeholder="Korte terugblik op het event..."
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>
            <div>
              <label style={labelStyle}>Foto URLs (1 per regel)</label>
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
                Opslaan (concept)
              </button>
              <button
                onClick={() => handleRecapSave(true)}
                disabled={recapSaving}
                style={btnStyle('var(--color-accent-green)', true)}
              >
                Publiceer recap
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tickets */}
      <div>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)', marginBottom: 8 }}>
          Tickets
        </p>

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
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-muted)' }}>Attendance:</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--color-accent-green)' }}>
                {checkedInCount} / {paidCount} aanwezig ({pct}%)
              </span>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-muted)' }}>No-shows:</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: paidCount - checkedInCount > 0 ? 'var(--color-accent-red)' : 'var(--color-text-muted)' }}>
                {paidCount - checkedInCount}
              </span>
            </div>
          </div>
        )}

        {ticketsLoading ? (
          <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>Laden...</p>
        ) : tickets.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>Geen tickets.</p>
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
              Scans — <span style={{ color: 'var(--color-accent-gold)' }}>{event.title}</span>
            </p>

            {scansLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse" style={{ height: 40, backgroundColor: 'var(--color-bg)' }} />
                ))}
              </div>
            ) : scans.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                Nog geen scans voor dit event.
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
                        {scan.member_id.slice(0, 8)}... — {scan.reason}
                      </p>
                      <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                        {new Date(scan.created_at).toLocaleString('nl-NL', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {scan.scanned_by && ` door ${scan.scanned_by.split('@')[0]}`}
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
                      +{scan.points} pts
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
