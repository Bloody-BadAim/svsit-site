'use client'

import { useState } from 'react'
import { X, Check } from 'lucide-react'
import { inputStyle, labelStyle } from '@/components/admin/adminStyles'

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
  created_at: string
}

interface EventFormData {
  title: string
  description: string
  date: string
  end_date: string
  location: string
  category: 'code' | 'social' | 'career' | 'game'
  status: 'upcoming' | 'active' | 'completed'
  is_paid: boolean
  price_members: string
  price_nonmembers: string
  capacity: string
  external_ticket_url: string
}

type TicketMode = 'own' | 'external' | 'none'

interface EventFormModalProps {
  event?: DbEvent | null
  onClose: () => void
  onSaved: () => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function euroCents(euros: string): number {
  const n = parseFloat(euros)
  return isNaN(n) ? 0 : Math.round(n * 100)
}

function centsEuro(cents: number): string {
  return (cents / 100).toFixed(2)
}

function toLocalDatetime(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const EMPTY_FORM: EventFormData = {
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
  external_ticket_url: '',
}

function eventToForm(event: DbEvent): EventFormData {
  return {
    title: event.title,
    description: event.description || '',
    date: toLocalDatetime(event.date),
    end_date: event.end_date ? toLocalDatetime(event.end_date) : '',
    location: event.location || '',
    category: event.category,
    status: event.status === 'cancelled' ? 'upcoming' : event.status,
    is_paid: event.is_paid,
    price_members: event.price_members ? centsEuro(event.price_members) : '',
    price_nonmembers: event.price_nonmembers ? centsEuro(event.price_nonmembers) : '',
    capacity: event.capacity ? String(event.capacity) : '',
    external_ticket_url: event.external_ticket_url || '',
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EventFormModal({ event, onClose, onSaved }: EventFormModalProps) {
  const isEdit = !!event
  const [form, setForm] = useState<EventFormData>(event ? eventToForm(event) : EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Ticket mode: own = SIT ticket sales, external = link to external, none = free/no tickets
  const initialTicketMode: TicketMode = event?.external_ticket_url ? 'external' : event?.is_paid ? 'own' : 'none'
  const [ticketMode, setTicketMode] = useState<TicketMode>(initialTicketMode)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title || !form.date) return
    setSaving(true)
    setError(null)

    const isPaid = ticketMode === 'own'
    const body = {
      title: form.title,
      description: form.description || null,
      date: form.date,
      end_date: form.end_date || null,
      location: form.location || null,
      category: form.category,
      status: form.status,
      is_paid: isPaid,
      price_members: isPaid ? euroCents(form.price_members) : 0,
      price_nonmembers: isPaid ? euroCents(form.price_nonmembers) : 0,
      capacity: form.capacity ? parseInt(form.capacity, 10) : null,
      external_ticket_url: ticketMode === 'external' ? (form.external_ticket_url || null) : null,
    }

    try {
      const url = isEdit ? `/api/events/${event.id}` : '/api/events'
      const method = isEdit ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const { error: apiError } = await res.json()
      if (apiError) throw new Error(apiError)
      setSuccess(true)
      onSaved()
      setTimeout(() => onClose(), 600)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Opslaan mislukt')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          width: '100%',
          maxWidth: 560,
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 14,
              fontWeight: 700,
              color: 'var(--color-accent-gold)',
              letterSpacing: '0.06em',
            }}
          >
            {isEdit ? `> event.edit — ${event.title}` : '> event.create'}
          </h2>
          <button onClick={onClose} style={{ color: 'var(--color-text-muted)', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
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
                placeholder="Bijv. HvA Wibauthuis"
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
                onChange={(e) => setForm({ ...form, category: e.target.value as EventFormData['category'] })}
                style={inputStyle}
              >
                <option value="code">Code</option>
                <option value="social">Social</option>
                <option value="career">Career</option>
                <option value="game">Game</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label style={labelStyle}>Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as EventFormData['status'] })}
                style={inputStyle}
              >
                <option value="upcoming">Upcoming</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Ticket mode */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Ticketverkoop</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {([['none', 'Gratis / geen tickets'], ['own', 'Eigen verkoop (Stripe)'], ['external', 'Externe link']] as const).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setTicketMode(value)}
                    style={{
                      ...inputStyle,
                      flex: 1,
                      textAlign: 'center',
                      cursor: 'pointer',
                      backgroundColor: ticketMode === value ? 'var(--color-accent-gold)' : 'transparent',
                      color: ticketMode === value ? 'var(--color-bg)' : 'var(--color-text-muted)',
                      borderColor: ticketMode === value ? 'var(--color-accent-gold)' : 'var(--color-border)',
                      fontWeight: ticketMode === value ? 700 : 400,
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price fields (own ticket sales) */}
            {ticketMode === 'own' && (
              <>
                <div>
                  <label style={labelStyle}>Prijs leden (EUR)</label>
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
                  <label style={labelStyle}>Prijs niet-leden (EUR)</label>
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

            {/* External ticket URL */}
            {ticketMode === 'external' && (
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Ticket URL</label>
                <input
                  type="url"
                  value={form.external_ticket_url}
                  onChange={(e) => setForm({ ...form, external_ticket_url: e.target.value })}
                  placeholder="https://..."
                  style={inputStyle}
                />
              </div>
            )}
          </div>

          {/* Feedback */}
          {error && (
            <p style={{ color: 'var(--color-accent-red)', fontFamily: 'var(--font-mono)', fontSize: 12, marginTop: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
              <X size={13} style={{ flexShrink: 0 }} /> {error}
            </p>
          )}
          {success && (
            <p style={{ color: 'var(--color-accent-green)', fontFamily: 'var(--font-mono)', fontSize: 12, marginTop: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Check size={13} style={{ flexShrink: 0 }} /> {isEdit ? 'Event bijgewerkt' : 'Event aangemaakt'}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-5">
            <button
              type="submit"
              disabled={saving || !form.title || !form.date}
              style={{
                padding: '8px 20px',
                backgroundColor: saving ? 'transparent' : 'var(--color-accent-gold)',
                color: saving ? 'var(--color-accent-gold)' : 'var(--color-bg)',
                border: '1px solid var(--color-accent-gold)',
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: (!form.title || !form.date) ? 0.4 : 1,
              }}
            >
              {saving ? '> opslaan...' : isEdit ? '> Opslaan' : '> Aanmaken'}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 20px',
                backgroundColor: 'transparent',
                color: 'var(--color-text-muted)',
                border: '1px solid var(--color-border)',
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              Annuleren
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
