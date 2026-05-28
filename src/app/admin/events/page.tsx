'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, X } from 'lucide-react'
import { useScannerStore } from '@/stores/useScannerStore'
import { formatDate } from '@/lib/utils'
import EventFormModal from '@/components/admin/EventFormModal'
import EventDetailPanel from '@/components/admin/EventDetailPanel'

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

type StatusFilter = 'all' | 'upcoming' | 'active' | 'completed' | 'cancelled'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  upcoming: 'var(--color-accent-gold)',
  active: 'var(--color-accent-green)',
  completed: 'var(--color-text-muted)',
  cancelled: 'var(--color-accent-red)',
}

const CATEGORY_LABELS: Record<string, string> = {
  code: 'Code',
  social: 'Social',
  learn: 'Learn',
  impact: 'Impact',
}

function centsEuro(cents: number): string {
  return (cents / 100).toFixed(2)
}

const FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'Alle' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'active', label: 'Actief' },
  { key: 'completed', label: 'Afgelopen' },
  { key: 'cancelled', label: 'Geannuleerd' },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EventsPage() {
  const { actiefEvent, setActiefEvent } = useScannerStore()

  const [events, setEvents] = useState<DbEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [filter, setFilter] = useState<StatusFilter>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<DbEvent | null>(null)

  // ── Fetch
  const fetchEvents = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/events')
      const { data, error: apiError } = await res.json()
      if (apiError) throw new Error(apiError)
      setEvents(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fout bij laden events')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  // ── Filter
  const filtered = filter === 'all' ? events : events.filter((e) => e.status === filter)
  const counts: Record<StatusFilter, number> = {
    all: events.length,
    upcoming: events.filter((e) => e.status === 'upcoming').length,
    active: events.filter((e) => e.status === 'active').length,
    completed: events.filter((e) => e.status === 'completed').length,
    cancelled: events.filter((e) => e.status === 'cancelled').length,
  }

  // ── Actions
  function handleExpand(eventId: string) {
    setExpandedId(expandedId === eventId ? null : eventId)
  }

  function handleOpenCreate() {
    setEditingEvent(null)
    setShowModal(true)
  }

  function handleOpenEdit(event: DbEvent) {
    setEditingEvent(event)
    setShowModal(true)
  }

  async function handleCancel(eventId: string) {
    if (!confirm('Event annuleren? Dit kan niet ongedaan worden.')) return
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      })
      const { error: apiError } = await res.json()
      if (apiError) throw new Error(apiError)
      fetchEvents()
      if (actiefEvent === eventId) setActiefEvent(null, null)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Fout bij annuleren')
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div style={{ maxWidth: 900 }} className="space-y-6">

      {/* Header + create button */}
      <div className="flex items-center justify-between flex-wrap gap-4">
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
                actief: {events.find((e) => e.id === actiefEvent)?.title ?? '...'}
              </span>
            )}
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 16px',
            backgroundColor: 'var(--color-accent-gold)',
            color: 'var(--color-bg)',
            border: '1px solid var(--color-accent-gold)',
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          <Plus size={14} /> Nieuw event
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--color-border)' }}>
        {FILTERS.map(({ key, label }) => {
          const active = filter === key
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              style={{
                padding: '8px 14px',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                fontWeight: active ? 700 : 400,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: active ? 'var(--color-accent-gold)' : 'var(--color-text-muted)',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: active ? '2px solid var(--color-accent-gold)' : '2px solid transparent',
                cursor: 'pointer',
                marginBottom: -1,
              }}
            >
              {label}
              {counts[key] > 0 && (
                <span style={{ marginLeft: 6, opacity: 0.6 }}>{counts[key]}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Events list */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse"
              style={{ height: 56, backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            />
          ))}
        </div>
      ) : error ? (
        <p style={{ color: 'var(--color-accent-red)', fontFamily: 'var(--font-mono)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
          <X size={13} style={{ flexShrink: 0 }} /> {error}
        </p>
      ) : filtered.length === 0 ? (
        <div
          style={{
            padding: 24,
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            textAlign: 'center',
          }}
        >
          <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
            {filter === 'all' ? 'Geen events gevonden. Maak een event aan om te starten.' : `Geen ${filter} events.`}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((event) => {
            const isExpanded = expandedId === event.id
            const isActive = actiefEvent === event.id

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
                {/* Event row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 16px',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleExpand(event.id)}
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
                    {isExpanded ? '\u25BC' : '\u25B6'}
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
                      {event.location && ` \u00B7 ${event.location}`}
                      {' \u00B7 '}
                      {CATEGORY_LABELS[event.category]}
                    </p>
                  </div>

                  {/* Badges */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
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

                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 10,
                        color: event.is_paid ? 'var(--color-accent-gold)' : 'var(--color-text-muted)',
                      }}
                    >
                      {event.is_paid ? `EUR ${centsEuro(event.price_members)}` : 'gratis'}
                    </span>
                  </div>
                </div>

                {/* Expanded detail panel */}
                {isExpanded && (
                  <EventDetailPanel
                    event={event}
                    onEdit={() => handleOpenEdit(event)}
                    onCancel={() => handleCancel(event.id)}
                    onRefresh={fetchEvents}
                  />
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <EventFormModal
          event={editingEvent}
          onClose={() => { setShowModal(false); setEditingEvent(null) }}
          onSaved={fetchEvents}
        />
      )}
    </div>
  )
}
