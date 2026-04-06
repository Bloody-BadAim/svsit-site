'use client'

import { useState, useEffect, useCallback } from 'react'
import { useScannerStore } from '@/stores/useScannerStore'
import { Check, X } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { inputStyle, labelStyle } from '@/components/admin/adminStyles'
import { CornerDecorations } from '@/components/ui/CornerDecorations'

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

interface CreateForm {
  title: string
  description: string
  date: string
  end_date: string
  location: string
  category: 'code' | 'social' | 'learn' | 'impact'
  status: 'upcoming' | 'active' | 'completed'
  is_paid: boolean
  price_members: string
  price_nonmembers: string
  capacity: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  upcoming:  'var(--color-accent-gold)',
  active:    'var(--color-accent-green)',
  completed: 'var(--color-text-muted)',
  cancelled: 'var(--color-accent-red)',
}

const CATEGORY_LABELS: Record<string, string> = {
  code:   'Code',
  social: 'Social',
  learn:  'Learn',
  impact: 'Impact',
}

function euroCents(euros: string): number {
  const n = parseFloat(euros)
  return isNaN(n) ? 0 : Math.round(n * 100)
}

function centsEuro(cents: number): string {
  return (cents / 100).toFixed(2)
}

const EMPTY_FORM: CreateForm = {
  title: '',
  description: '',
  date: '',
  end_date: '',
  location: '',
  category: 'social',
  status: 'upcoming',
  is_paid: false,
  price_members: '',
  price_nonmembers: '',
  capacity: '',
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EventsPage() {
  const { actiefEvent, setActiefEvent } = useScannerStore()

  // ── Events list state
  const [events, setEvents]         = useState<DbEvent[]>([])
  const [eventsLoading, setEventsLoading] = useState(true)
  const [eventsError, setEventsError]     = useState<string | null>(null)

  // ── Create form state
  const [form, setForm]           = useState<CreateForm>(EMPTY_FORM)
  const [creating, setCreating]   = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createSuccess, setCreateSuccess] = useState(false)

  // ── Expanded event state
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [tickets, setTickets]       = useState<Record<string, Ticket[]>>({})
  const [ticketsLoading, setTicketsLoading] = useState<Record<string, boolean>>({})

  // ── Scan history state
  const [scans, setScans]           = useState<ScanRecord[]>([])
  const [scansLoading, setScansLoading] = useState(false)
  const [selectedEventTitle, setSelectedEventTitle] = useState<string | null>(null)

  // ── Fetch all events
  const fetchEvents = useCallback(async () => {
    setEventsLoading(true)
    setEventsError(null)
    try {
      const res = await fetch('/api/events')
      const { data, error } = await res.json()
      if (error) throw new Error(error)
      setEvents(data || [])
    } catch (err) {
      setEventsError(err instanceof Error ? err.message : 'Fout bij laden events')
    } finally {
      setEventsLoading(false)
    }
  }, [])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  // ── Fetch tickets for one event
  const fetchTickets = useCallback(async (eventId: string) => {
    if (tickets[eventId]) return
    setTicketsLoading((prev) => ({ ...prev, [eventId]: true }))
    try {
      const res = await fetch(`/api/events/${eventId}/tickets`)
      const { data } = await res.json()
      setTickets((prev) => ({ ...prev, [eventId]: data || [] }))
    } catch {
      setTickets((prev) => ({ ...prev, [eventId]: [] }))
    } finally {
      setTicketsLoading((prev) => ({ ...prev, [eventId]: false }))
    }
  }, [tickets])

  // ── Fetch scans for selected event
  const fetchScans = useCallback(async (title: string) => {
    setScansLoading(true)
    try {
      const res = await fetch(`/api/scans?event_name=${encodeURIComponent(title)}`)
      const { data } = await res.json()
      setScans(data || [])
    } catch {
      setScans([])
    } finally {
      setScansLoading(false)
    }
  }, [])

  // ── Expand/collapse event row
  function handleExpand(event: DbEvent) {
    if (expandedId === event.id) {
      setExpandedId(null)
    } else {
      setExpandedId(event.id)
      fetchTickets(event.id)
    }
  }

  // ── Activate for scanner
  function handleActivate(event: DbEvent) {
    if (actiefEvent === event.id) {
      setActiefEvent(null, null)
      setSelectedEventTitle(null)
      setScans([])
    } else {
      setActiefEvent(event.id, event.title)
      setSelectedEventTitle(event.title)
      fetchScans(event.title)
    }
  }

  // ── Cancel event (set status to cancelled)
  async function handleCancel(eventId: string) {
    if (!confirm('Event annuleren? Dit kan niet ongedaan worden.')) return
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      })
      const { error } = await res.json()
      if (error) throw new Error(error)
      fetchEvents()
      if (actiefEvent === eventId) setActiefEvent(null, null)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Fout bij annuleren')
    }
  }

  // ── Create event
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title || !form.date) return
    setCreating(true)
    setCreateError(null)
    setCreateSuccess(false)
    try {
      const body = {
        title:             form.title,
        description:       form.description || null,
        date:              form.date,
        end_date:          form.end_date || null,
        location:          form.location || null,
        category:          form.category,
        status:            form.status,
        is_paid:           form.is_paid,
        price_members:     form.is_paid ? euroCents(form.price_members) : 0,
        price_nonmembers:  form.is_paid ? euroCents(form.price_nonmembers) : 0,
        capacity:          form.capacity ? parseInt(form.capacity, 10) : null,
      }
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const { error } = await res.json()
      if (error) throw new Error(error)
      setForm(EMPTY_FORM)
      setCreateSuccess(true)
      fetchEvents()
      setTimeout(() => setCreateSuccess(false), 3000)
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Aanmaken mislukt')
    } finally {
      setCreating(false)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div style={{ maxWidth: 900 }} className="space-y-8">

      {/* ── Page header ── */}
      <div>
        <h1
          style={{
            color: 'var(--color-text)',
            fontFamily: 'var(--font-mono)',
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: '0.04em',
          }}
        >
          {'>'} events.manage
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12, marginTop: 4 }}>
          {events.length} events in database
          {actiefEvent && (
            <span style={{ color: 'var(--color-accent-green)', marginLeft: 12 }}>
              ● actief: {events.find((e) => e.id === actiefEvent)?.title ?? '…'}
            </span>
          )}
        </p>
      </div>

      {/* ══════════════════════════════════════════
          SECTION 1 — Event aanmaken
      ══════════════════════════════════════════ */}
      <section>
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
              fontSize: 12,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--color-accent-gold)',
              marginBottom: 16,
            }}
          >
            // Event aanmaken
          </h2>

          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

              {/* Title */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Titel *</label>
                <input
                  required
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Bijv. Intro Borrel XI"
                  style={inputStyle}
                />
              </div>

              {/* Description */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Beschrijving</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Optionele beschrijving..."
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              {/* Date */}
              <div>
                <label style={labelStyle}>Datum + tijd *</label>
                <input
                  required
                  type="datetime-local"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  style={inputStyle}
                />
              </div>

              {/* End date */}
              <div>
                <label style={labelStyle}>Einddatum (optioneel)</label>
                <input
                  type="datetime-local"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  style={inputStyle}
                />
              </div>

              {/* Location */}
              <div>
                <label style={labelStyle}>Locatie</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Bijv. HvA Wibauthuis Loka B1.16"
                  style={inputStyle}
                />
              </div>

              {/* Capacity */}
              <div>
                <label style={labelStyle}>Capaciteit (optioneel)</label>
                <input
                  type="number"
                  min="1"
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  placeholder="Onbeperkt"
                  style={inputStyle}
                />
              </div>

              {/* Category */}
              <div>
                <label style={labelStyle}>Categorie</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as CreateForm['category'] })}
                  style={inputStyle}
                >
                  <option value="code">Code</option>
                  <option value="social">Social</option>
                  <option value="learn">Learn</option>
                  <option value="impact">Impact</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label style={labelStyle}>Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as CreateForm['status'] })}
                  style={inputStyle}
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* Paid toggle */}
              <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 10 }}>
                <input
                  type="checkbox"
                  id="is_paid"
                  checked={form.is_paid}
                  onChange={(e) => setForm({ ...form, is_paid: e.target.checked })}
                  style={{ accentColor: 'var(--color-accent-gold)', width: 16, height: 16 }}
                />
                <label
                  htmlFor="is_paid"
                  style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}
                >
                  Betaald event
                </label>
              </div>

              {/* Price fields (conditional) */}
              {form.is_paid && (
                <>
                  <div>
                    <label style={labelStyle}>Prijs leden (€)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price_members}
                      onChange={(e) => setForm({ ...form, price_members: e.target.value })}
                      placeholder="0.00"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Prijs niet-leden (€)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price_nonmembers}
                      onChange={(e) => setForm({ ...form, price_nonmembers: e.target.value })}
                      placeholder="0.00"
                      style={inputStyle}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Feedback */}
            {createError && (
              <p style={{ color: 'var(--color-accent-red)', fontFamily: 'var(--font-mono)', fontSize: 12, marginTop: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                <X size={13} style={{ flexShrink: 0 }} /> {createError}
              </p>
            )}
            {createSuccess && (
              <p style={{ color: 'var(--color-accent-green)', fontFamily: 'var(--font-mono)', fontSize: 12, marginTop: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Check size={13} style={{ flexShrink: 0 }} /> Event aangemaakt
              </p>
            )}

            <button
              type="submit"
              disabled={creating || !form.title || !form.date}
              style={{
                marginTop: 16,
                padding: '8px 20px',
                backgroundColor: creating ? 'transparent' : 'var(--color-accent-gold)',
                color: creating ? 'var(--color-accent-gold)' : 'var(--color-bg)',
                border: '1px solid var(--color-accent-gold)',
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: creating ? 'not-allowed' : 'pointer',
                opacity: (!form.title || !form.date) ? 0.4 : 1,
              }}
            >
              {creating ? '> aanmaken...' : '> Event aanmaken'}
            </button>
          </form>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 2 — Events lijst
      ══════════════════════════════════════════ */}
      <section>
        <h2
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--color-text-muted)',
            marginBottom: 12,
          }}
        >
          // Events ({events.length})
        </h2>

        {eventsLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse"
                style={{ height: 56, backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
              />
            ))}
          </div>
        ) : eventsError ? (
          <p style={{ color: 'var(--color-accent-red)', fontFamily: 'var(--font-mono)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
            <X size={13} style={{ flexShrink: 0 }} /> {eventsError}
          </p>
        ) : events.length === 0 ? (
          <div
            style={{
              padding: '24px',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              textAlign: 'center',
            }}
          >
            <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
              Geen events gevonden. Maak een event aan om te starten.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {events.map((event) => {
              const isExpanded = expandedId === event.id
              const isActive   = actiefEvent === event.id
              const eventTickets = tickets[event.id]
              const loadingTickets = ticketsLoading[event.id]

              return (
                <div
                  key={event.id}
                  style={{
                    backgroundColor: isActive ? 'rgba(34, 197, 94, 0.05)' : 'var(--color-surface)',
                    border: isActive
                      ? '1px solid var(--color-accent-green)'
                      : '1px solid var(--color-border)',
                  }}
                >
                  {/* ── Event row ── */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 16px',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleExpand(event)}
                  >
                    {/* Expand indicator */}
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 11,
                        color: 'var(--color-text-muted)',
                        minWidth: 12,
                        userSelect: 'none',
                      }}
                    >
                      {isExpanded ? '▼' : '▶'}
                    </span>

                    {/* Title + meta */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          color: 'var(--color-text)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: 13,
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {event.title}
                      </p>
                      <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11, marginTop: 2 }}>
                        {formatDate(event.date)}
                        {event.location && ` · ${event.location}`}
                        {' · '}
                        {CATEGORY_LABELS[event.category]}
                      </p>
                    </div>

                    {/* Badges */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      {/* Status badge */}
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 10,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          padding: '2px 8px',
                          border: `1px solid ${STATUS_COLORS[event.status]}`,
                          color: STATUS_COLORS[event.status],
                        }}
                      >
                        {event.status}
                      </span>

                      {/* Paid/free badge */}
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 10,
                          color: event.is_paid ? 'var(--color-accent-gold)' : 'var(--color-text-muted)',
                        }}
                      >
                        {event.is_paid
                          ? `€${centsEuro(event.price_members)} leden`
                          : 'gratis'}
                      </span>

                      {/* Ticket count placeholder (from tickets cache) */}
                      {eventTickets && (
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)' }}>
                          {eventTickets.length} tickets
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ── Expanded panel ── */}
                  {isExpanded && (
                    <div
                      style={{
                        borderTop: '1px solid var(--color-border)',
                        padding: '16px',
                        backgroundColor: 'var(--color-bg)',
                      }}
                    >
                      {/* Action buttons */}
                      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                        {/* Activate for scanner */}
                        <button
                          onClick={() => handleActivate(event)}
                          style={{
                            padding: '6px 14px',
                            backgroundColor: isActive ? 'var(--color-accent-green)' : 'transparent',
                            color: isActive ? 'var(--color-bg)' : 'var(--color-accent-green)',
                            border: '1px solid var(--color-accent-green)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: 11,
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            cursor: 'pointer',
                          }}
                        >
                          {isActive ? '● Scanner actief' : '○ Activeren voor scanner'}
                        </button>

                        {/* Cancel button (only for non-cancelled events) */}
                        {event.status !== 'cancelled' && (
                          <button
                            onClick={() => handleCancel(event.id)}
                            style={{
                              padding: '6px 14px',
                              backgroundColor: 'transparent',
                              color: 'var(--color-accent-red)',
                              border: '1px solid var(--color-accent-red)',
                              fontFamily: 'var(--font-mono)',
                              fontSize: 11,
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.06em',
                              cursor: 'pointer',
                            }}
                          >
                            <X size={11} style={{ display: 'inline', marginRight: 3, verticalAlign: 'middle' }} /> Annuleren
                          </button>
                        )}
                      </div>

                      {/* Event detail info */}
                      {event.description && (
                        <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12, marginBottom: 12 }}>
                          {event.description}
                        </p>
                      )}

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px', marginBottom: 16 }}>
                        {[
                          ['ID',        event.id.slice(0, 8) + '…'],
                          ['Categorie', CATEGORY_LABELS[event.category]],
                          ['Capaciteit', event.capacity ? `${event.capacity} plekken` : 'Onbeperkt'],
                          ['Aangemaakt', formatDate(event.created_at)],
                          ...(event.is_paid ? [
                            ['Prijs leden',     `€${centsEuro(event.price_members)}`],
                            ['Prijs niet-leden', `€${centsEuro(event.price_nonmembers)}`],
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

                      {/* Tickets */}
                      <div>
                        <p
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 11,
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            color: 'var(--color-text-muted)',
                            marginBottom: 8,
                          }}
                        >
                          Tickets
                        </p>

                        {loadingTickets ? (
                          <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                            Laden…
                          </p>
                        ) : !eventTickets || eventTickets.length === 0 ? (
                          <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                            Geen tickets.
                          </p>
                        ) : (
                          <div className="space-y-1">
                            {eventTickets.map((ticket) => (
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
                                      €{centsEuro(ticket.paid_amount)}
                                    </span>
                                  )}
                                  <span
                                    style={{
                                      fontFamily: 'var(--font-mono)',
                                      fontSize: 10,
                                      fontWeight: 700,
                                      textTransform: 'uppercase',
                                      color:
                                        ticket.status === 'paid'       ? 'var(--color-accent-green)' :
                                        ticket.status === 'checked_in' ? 'var(--color-accent-blue)'  :
                                        ticket.status === 'cancelled'  ? 'var(--color-accent-red)'   :
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
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════
          SECTION 3 — Scan geschiedenis
      ══════════════════════════════════════════ */}
      {selectedEventTitle && (
        <section>
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
                fontSize: 12,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--color-text-muted)',
                marginBottom: 16,
              }}
            >
              // Scans — <span style={{ color: 'var(--color-accent-gold)' }}>{selectedEventTitle}</span>
            </h2>

            {scansLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse"
                    style={{ height: 40, backgroundColor: 'var(--color-bg)' }}
                  />
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
                        {scan.member_id.slice(0, 8)}… — {scan.reason}
                      </p>
                      <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                        {new Date(scan.created_at).toLocaleString('nl-NL', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {scan.scanned_by && ` · door ${scan.scanned_by.split('@')[0]}`}
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
        </section>
      )}

    </div>
  )
}
