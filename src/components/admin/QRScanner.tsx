'use client'

import { useEffect, useRef, useState } from 'react'
import { useScannerStore } from '@/stores/useScannerStore'

interface QRScannerProps {
  eventId?: string
  eventName?: string
}

type MessageType = 'success' | 'error' | 'warning'

export default function QRScanner({ eventId, eventName }: QRScannerProps) {
  const scannerRef = useRef<HTMLDivElement>(null)
  const html5QrCodeRef = useRef<unknown>(null)
  const { setLaatsteScan, laatsteScan, scannerActief, setScannerActief } = useScannerStore()

  // Prefer explicit props; fall back to store values
  const resolvedEventId = eventId ?? undefined

  const [ticketInput, setTicketInput] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<MessageType>('success')
  const [flashName, setFlashName] = useState<string | null>(null)

  // --- Detection logic ---
  // Een ticket-QR draagt een JSON-payload { type: 'ticket', id }. Een kale
  // string wordt als ticket-ID behandeld.

  function parseTicketId(raw: string): string | null {
    try {
      const parsed = JSON.parse(raw)
      if (parsed.type === 'ticket' && typeof parsed.id === 'string') return parsed.id
      return null
    } catch {
      // Geen JSON: behandel als kaal ticket-ID
      return raw.trim() || null
    }
  }

  // --- Ticket check-in flow ---

  async function handleTicketCheckin(ticketId: string) {
    const res = await fetch(`/api/events/tickets/${ticketId}/checkin`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      // Stuur actief event mee zodat backend event-match kan valideren
      body: JSON.stringify(resolvedEventId ? { event_id: resolvedEventId } : {}),
    })

    const json = await res.json()

    if (res.ok && json.data) {
      const { name, event_title } = json.data
      setMessage(`TICKET CHECK-IN [OK] - ${name} voor ${event_title}`)
      setMessageType('success')
      // Flash green with name
      setFlashName(name || 'Ingecheckt')
      setTimeout(() => setFlashName(null), 3000)
      // Store last scan - punten 0 since this is just a check-in
      setLaatsteScan({
        memberId: ticketId,
        email: name || ticketId,
        punten: 0,
        timestamp: new Date().toISOString(),
      })
    } else if (res.status === 409) {
      // 409 = al ingecheckt OF ticket hoort bij ander event
      setMessage(json.error || 'Al ingecheckt')
      setMessageType('warning')
    } else {
      setMessage(json.error || 'Fout bij check-in')
      setMessageType('error')
    }

    setTimeout(() => setMessage(''), 5000)
  }

  // --- Scan handler (camera + handmatig) ---

  async function handleScan(raw: string) {
    const ticketId = parseTicketId(raw)
    if (!ticketId) {
      setMessage('Ongeldig QR code')
      setMessageType('error')
      setTimeout(() => setMessage(''), 5000)
      return
    }
    await handleTicketCheckin(ticketId)
  }

  async function handleManualSubmit() {
    if (!ticketInput) return
    await handleScan(ticketInput)
    setTicketInput('')
  }

  // --- Camera setup ---

  async function startScanner() {
    if (!scannerRef.current) return

    const { Html5Qrcode } = await import('html5-qrcode')
    const scanner = new Html5Qrcode('qr-reader')
    html5QrCodeRef.current = scanner

    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          handleScan(decodedText)
        },
        () => {}
      )
      setScannerActief(true)
    } catch {
      setMessage('Camera niet beschikbaar')
      setMessageType('error')
    }
  }

  async function stopScanner() {
    const scanner = html5QrCodeRef.current as { stop: () => Promise<void> } | null
    if (scanner) {
      await scanner.stop()
      setScannerActief(false)
    }
  }

  useEffect(() => {
    return () => {
      stopScanner()
    }
  }, [])

  // --- Feedback colours ---

  const feedbackStyles: Record<MessageType, { bg: string; border: string; color: string }> = {
    success: {
      bg: 'rgba(34, 197, 94, 0.1)',
      border: 'var(--color-accent-green)',
      color: 'var(--color-accent-green)',
    },
    warning: {
      bg: 'rgba(245, 158, 11, 0.1)',
      border: 'var(--color-accent-gold)',
      color: 'var(--color-accent-gold)',
    },
    error: {
      bg: 'rgba(239, 68, 68, 0.1)',
      border: 'var(--color-accent-red)',
      color: 'var(--color-accent-red)',
    },
  }

  return (
    <div className="space-y-6">

      {/* Green flash overlay on successful ticket check-in */}
      {flashName && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          style={{ animation: 'fadeOut 3s ease-out forwards' }}
        >
          <div
            className="text-center px-12 py-8 rounded-xl"
            style={{
              backgroundColor: 'rgba(34, 197, 94, 0.95)',
              color: '#fff',
              boxShadow: '0 0 60px rgba(34, 197, 94, 0.5)',
            }}
          >
            <p className="font-mono text-3xl font-bold">{flashName}</p>
            <p className="font-mono text-sm mt-2 opacity-80 uppercase tracking-widest">Ingecheckt</p>
          </div>
        </div>
      )}

      {/* Camera scanner */}
      <div
        className="rounded-lg overflow-hidden"
        style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
            Camera Scanner
          </h3>
          <button
            onClick={scannerActief ? stopScanner : startScanner}
            className="py-1.5 px-4 rounded-lg text-sm font-semibold"
            style={{
              backgroundColor: scannerActief ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
              color: scannerActief ? 'var(--color-accent-red)' : 'var(--color-accent-green)',
              border: `1px solid ${scannerActief ? 'var(--color-accent-red)' : 'var(--color-accent-green)'}`,
            }}
          >
            {scannerActief ? 'Stop' : 'Start'}
          </button>
        </div>
        <div id="qr-reader" ref={scannerRef} className="w-full" />
      </div>

      {/* Handmatige invoer */}
      <div
        className="p-4 rounded-lg"
        style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
          Handmatige invoer
        </h3>
        <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)', opacity: 0.7 }}>
          Voer een ticket ID in om in te checken
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={ticketInput}
            onChange={(e) => setTicketInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
            placeholder="Ticket ID of volledige QR payload..."
            className="flex-1 py-2 px-3 rounded-lg text-sm outline-none"
            style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
          />
          <button
            onClick={handleManualSubmit}
            disabled={!ticketInput}
            className="py-2 px-4 rounded-lg text-sm font-semibold disabled:opacity-50"
            style={{ backgroundColor: 'var(--color-accent-gold)', color: 'var(--color-bg)' }}
          >
            Scan
          </button>
        </div>
      </div>

      {/* Feedback */}
      {message && (
        <div
          className="p-4 rounded-lg text-center font-semibold"
          style={{
            backgroundColor: feedbackStyles[messageType].bg,
            border: `1px solid ${feedbackStyles[messageType].border}`,
            color: feedbackStyles[messageType].color,
            fontFamily: 'var(--font-mono)',
          }}
        >
          {message}
        </div>
      )}

      {/* Laatste scan */}
      {laatsteScan && (
        <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>Laatste scan</p>
          <p className="text-sm" style={{ color: 'var(--color-text)' }}>
            {laatsteScan.email}
            {laatsteScan.punten > 0 && (
              <> - <span style={{ color: 'var(--color-accent-gold)' }}>+{laatsteScan.punten}</span></>
            )}
          </p>
        </div>
      )}
    </div>
  )
}
