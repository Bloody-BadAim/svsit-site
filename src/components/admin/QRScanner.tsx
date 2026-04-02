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
  const { actiefEventNaam, laatsteScan, setLaatsteScan, scannerActief, setScannerActief } = useScannerStore()

  // Prefer explicit props; fall back to store values
  const resolvedEventNaam = eventName ?? actiefEventNaam
  const resolvedEventId = eventId ?? undefined

  const [memberId, setMemberId] = useState('')
  const [punten, setPunten] = useState('1')
  const [reden, setReden] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<MessageType>('success')

  // --- Detection logic ---

  type ParsedQR =
    | { kind: 'ticket'; id: string }
    | { kind: 'ledenpas'; id: string; email: string }
    | { kind: 'invalid' }

  function detectQRType(raw: string): ParsedQR {
    try {
      const parsed = JSON.parse(raw)
      if (parsed.type === 'ticket' && typeof parsed.id === 'string') {
        return { kind: 'ticket', id: parsed.id }
      }
      if (typeof parsed.id === 'string' && typeof parsed.email === 'string') {
        return { kind: 'ledenpas', id: parsed.id, email: parsed.email }
      }
      return { kind: 'invalid' }
    } catch {
      return { kind: 'invalid' }
    }
  }

  // --- Ticket check-in flow ---

  async function handleTicketCheckin(ticketId: string) {
    const res = await fetch(`/api/events/tickets/${ticketId}/checkin`, {
      method: 'PATCH',
    })

    const json = await res.json()

    if (res.ok && json.data) {
      const { name, event_title } = json.data
      setMessage(`TICKET CHECK-IN ✓ — ${name} voor ${event_title}`)
      setMessageType('success')
      // Store last scan — punten 0 since this is just a check-in
      setLaatsteScan({
        memberId: ticketId,
        email: name || ticketId,
        punten: 0,
        timestamp: new Date().toISOString(),
      })
    } else if (res.status === 409 || json.error === 'Al ingecheckt') {
      setMessage(`Al ingecheckt`)
      setMessageType('warning')
    } else {
      setMessage(json.error || 'Fout bij check-in')
      setMessageType('error')
    }

    setTimeout(() => setMessage(''), 5000)
  }

  // --- Ledenpas points flow ---

  async function submitScan(id: string, email?: string) {
    if (!reden) {
      setMessage('Vul een reden in')
      setMessageType('error')
      return
    }

    const res = await fetch('/api/scans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        member_id: id,
        points: parseInt(punten),
        reason: reden,
        event_name: resolvedEventNaam,
        event_id: resolvedEventId,
      }),
    })

    if (res.ok) {
      const displayName = email || id
      setMessage(`PUNTEN +${punten} — ${displayName} bij ${resolvedEventNaam || 'event'}`)
      setMessageType('success')
      setLaatsteScan({
        memberId: id,
        email: displayName,
        punten: parseInt(punten),
        timestamp: new Date().toISOString(),
      })
      setMemberId('')
    } else {
      const { error } = await res.json()
      setMessage(error || 'Fout bij scannen')
      setMessageType('error')
    }

    setTimeout(() => setMessage(''), 5000)
  }

  // --- Unified scan handler (camera + manual) ---

  async function handleScan(raw: string) {
    const detected = detectQRType(raw)

    if (detected.kind === 'ticket') {
      await handleTicketCheckin(detected.id)
    } else if (detected.kind === 'ledenpas') {
      await submitScan(detected.id, detected.email)
    } else {
      setMessage('Ongeldig QR code')
      setMessageType('error')
      setTimeout(() => setMessage(''), 5000)
    }
  }

  // --- Manual input handler ---
  // Manual input: the field holds a raw member ID (ledenpas) or a ticket UUID.
  // We try to parse it as JSON first; if it's a plain UUID we treat it as a
  // ledenpas member ID so existing workflows still work.
  async function handleManualSubmit() {
    if (!memberId) return

    // Try JSON parse first (supports pasting full QR payloads)
    const detected = detectQRType(memberId)

    if (detected.kind === 'ticket') {
      await handleTicketCheckin(detected.id)
    } else if (detected.kind === 'ledenpas') {
      await submitScan(detected.id, detected.email)
    } else {
      // Plain ID — treat as ledenpas member ID (existing behaviour)
      await submitScan(memberId)
    }
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

      {/* Mode indicator */}
      <div
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs"
        style={{
          backgroundColor: 'rgba(59, 130, 246, 0.08)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          color: 'var(--color-accent-blue)',
          fontFamily: 'var(--font-mono)',
        }}
      >
        <span
          className="inline-block w-2 h-2 rounded-full"
          style={{ backgroundColor: 'var(--color-accent-blue)', boxShadow: '0 0 6px var(--color-accent-blue)' }}
        />
        Auto-detect: Ticket check-in of Punten scan
      </div>

      {/* Scanner config (punten + reden — only needed for ledenpas flow) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-2" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
            punten (ledenpas)
          </label>
          <input
            type="number"
            min="1"
            value={punten}
            onChange={(e) => setPunten(e.target.value)}
            className="w-full py-2 px-3 rounded-lg text-sm outline-none"
            style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
          />
        </div>
        <div>
          <label className="block text-sm mb-2" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
            reden (ledenpas)
          </label>
          <input
            type="text"
            value={reden}
            onChange={(e) => setReden(e.target.value)}
            placeholder="Event aanwezigheid, workshop, etc."
            className="w-full py-2 px-3 rounded-lg text-sm outline-none"
            style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
          />
        </div>
      </div>

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
          Voer een member ID (punten) of ticket ID (check-in) in
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
            placeholder="Member ID, ticket ID of volledige QR payload..."
            className="flex-1 py-2 px-3 rounded-lg text-sm outline-none"
            style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
          />
          <button
            onClick={handleManualSubmit}
            disabled={!memberId}
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
              <> — <span style={{ color: 'var(--color-accent-gold)' }}>+{laatsteScan.punten}</span></>
            )}
          </p>
        </div>
      )}
    </div>
  )
}
