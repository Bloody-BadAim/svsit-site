'use client'

import { useState } from 'react'
import QRCode from 'react-qr-code'
import { formatDate } from '@/lib/utils'
import { MapPin, Calendar, Hash, Download, Loader2 } from 'lucide-react'

interface TicketCardProps {
  ticket: {
    id: string
    event_id: string
    status: 'pending' | 'paid' | 'cancelled' | 'checked_in'
    paid_amount: number
    ticket_number: string | null
    created_at: string
    checked_in_at: string | null
    events: {
      title: string
      date: string
      end_date: string | null
      location: string | null
    }
  }
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  paid:       { label: 'BETAALD',    color: 'var(--color-accent-green)', bg: 'rgba(34,197,94,0.08)' },
  checked_in: { label: 'INGECHECKT', color: 'var(--color-accent-blue)',  bg: 'rgba(59,130,246,0.08)' },
  pending:    { label: 'IN AFWACHTING', color: 'var(--color-accent-gold)', bg: 'rgba(242,158,24,0.08)' },
  cancelled:  { label: 'GEANNULEERD', color: 'var(--color-accent-red)',   bg: 'rgba(239,68,68,0.08)' },
}

export function TicketCard({ ticket }: TicketCardProps) {
  const status = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG.pending
  const qrData = JSON.stringify({ type: 'ticket', id: ticket.id })
  const [downloading, setDownloading] = useState(false)

  async function handleDownload() {
    setDownloading(true)
    try {
      const res = await fetch(`/api/tickets/${ticket.id}/pdf`)
      if (!res.ok) throw new Error('Download mislukt')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `SIT-Ticket-${ticket.ticket_number?.replace('#', '') ?? ticket.id.slice(0, 8)}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('PDF downloaden mislukt. Probeer het opnieuw.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top section: event info + status */}
      <div style={{ padding: '16px 20px 12px' }}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3
              className="font-mono text-sm font-bold truncate"
              style={{ color: 'var(--color-text)' }}
            >
              {ticket.events.title}
            </h3>
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2">
                <Calendar size={12} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                <span className="font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {formatDate(ticket.events.date)}
                </span>
              </div>
              {ticket.events.location && (
                <div className="flex items-center gap-2">
                  <MapPin size={12} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                  <span className="font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {ticket.events.location}
                  </span>
                </div>
              )}
              {ticket.ticket_number && (
                <div className="flex items-center gap-2">
                  <Hash size={12} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                  <span className="font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {ticket.ticket_number}
                  </span>
                </div>
              )}
            </div>
          </div>
          <span
            className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-1 shrink-0"
            style={{
              color: status.color,
              backgroundColor: status.bg,
              border: `1px solid ${status.color}`,
            }}
          >
            {status.label}
          </span>
        </div>
      </div>

      {/* Dashed separator (tear line effect) */}
      <div
        className="mx-4"
        style={{
          borderTop: '2px dashed var(--color-border)',
        }}
      />

      {/* Bottom section: QR code */}
      <div
        className="flex flex-col items-center py-5 px-4"
      >
        <div
          className="p-3 qr-container"
          style={{
            backgroundColor: '#FFFFFF',
          }}
        >
          <QRCode
            value={qrData}
            size={120}
            level="M"
            bgColor="#FFFFFF"
            fgColor="#09090B"
          />
        </div>
        <p
          className="font-mono text-[10px] uppercase tracking-[0.15em] mt-3 text-center"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Toon dit bij de ingang
        </p>
        {(ticket.status === 'paid' || ticket.status === 'checked_in') && (
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="mt-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider px-3 py-1.5 transition-colors disabled:opacity-50"
            style={{
              color: 'var(--color-text-muted)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'transparent',
            }}
          >
            {downloading ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
            {downloading ? 'Downloaden...' : 'Download PDF'}
          </button>
        )}
      </div>
    </div>
  )
}
