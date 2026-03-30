'use client'

import { useEffect, useRef, useState } from 'react'
import { useScannerStore } from '@/stores/useScannerStore'

export default function QRScanner() {
  const scannerRef = useRef<HTMLDivElement>(null)
  const html5QrCodeRef = useRef<unknown>(null)
  const { actiefEventNaam, laatsteScan, setLaatsteScan, scannerActief, setScannerActief } = useScannerStore()

  const [memberId, setMemberId] = useState('')
  const [punten, setPunten] = useState('1')
  const [reden, setReden] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  async function handleScan(data: string) {
    try {
      const parsed = JSON.parse(data)
      await submitScan(parsed.id, parsed.email)
    } catch {
      setMessage('Ongeldige QR code')
      setMessageType('error')
    }
  }

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
        event_name: actiefEventNaam,
      }),
    })

    if (res.ok) {
      setMessage(`+${punten} punten voor ${email || id}`)
      setMessageType('success')
      setLaatsteScan({
        memberId: id,
        email: email || id,
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

  return (
    <div className="space-y-6">
      {/* Scanner config */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-2" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
            punten
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
            reden
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
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
          Handmatige invoer
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            placeholder="Member ID of email..."
            className="flex-1 py-2 px-3 rounded-lg text-sm outline-none"
            style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
          />
          <button
            onClick={() => memberId && submitScan(memberId)}
            disabled={!memberId || !reden}
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
            backgroundColor: messageType === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${messageType === 'success' ? 'var(--color-accent-green)' : 'var(--color-accent-red)'}`,
            color: messageType === 'success' ? 'var(--color-accent-green)' : 'var(--color-accent-red)',
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
            {laatsteScan.email} — <span style={{ color: 'var(--color-accent-gold)' }}>+{laatsteScan.punten}</span>
          </p>
        </div>
      )}
    </div>
  )
}
