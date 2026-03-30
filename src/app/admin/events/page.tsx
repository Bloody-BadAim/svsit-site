'use client'

import { useState } from 'react'
import { useScannerStore } from '@/stores/useScannerStore'

interface ScanEvent {
  id: string
  naam: string
  datum: string
}

export default function EventsPage() {
  const { actiefEvent, setActiefEvent } = useScannerStore()
  const [events, setEvents] = useState<ScanEvent[]>([])
  const [naam, setNaam] = useState('')
  const [datum, setDatum] = useState('')

  function handleAddEvent() {
    if (!naam) return
    const newEvent: ScanEvent = {
      id: crypto.randomUUID(),
      naam,
      datum: datum || new Date().toISOString().split('T')[0],
    }
    setEvents([newEvent, ...events])
    setNaam('')
    setDatum('')
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
        Events
      </h1>

      {/* Nieuw event */}
      <div
        className="p-4 rounded-lg space-y-3"
        style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
          Event aanmaken
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={naam}
            onChange={(e) => setNaam(e.target.value)}
            placeholder="Event naam..."
            className="flex-1 py-2 px-3 rounded-lg text-sm outline-none"
            style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
          />
          <input
            type="date"
            value={datum}
            onChange={(e) => setDatum(e.target.value)}
            className="py-2 px-3 rounded-lg text-sm outline-none"
            style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
          />
          <button
            onClick={handleAddEvent}
            disabled={!naam}
            className="py-2 px-4 rounded-lg text-sm font-semibold disabled:opacity-50"
            style={{ backgroundColor: 'var(--color-accent-gold)', color: 'var(--color-bg)' }}
          >
            Toevoegen
          </button>
        </div>
      </div>

      {/* Events lijst */}
      {events.length === 0 ? (
        <div
          className="p-6 rounded-lg text-center"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <p style={{ color: 'var(--color-text-muted)' }}>
            Nog geen events. Maak een event aan om te starten met scannen.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex items-center justify-between p-4 rounded-lg"
              style={{
                backgroundColor: actiefEvent === event.id ? 'rgba(242, 158, 24, 0.1)' : 'var(--color-surface)',
                border: actiefEvent === event.id ? '1px solid var(--color-accent-gold)' : '1px solid var(--color-border)',
              }}
            >
              <div>
                <p className="font-semibold" style={{ color: 'var(--color-text)' }}>{event.naam}</p>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{event.datum}</p>
              </div>
              <button
                onClick={() =>
                  actiefEvent === event.id
                    ? setActiefEvent(null, null)
                    : setActiefEvent(event.id, event.naam)
                }
                className="py-1.5 px-4 rounded-lg text-sm font-semibold"
                style={{
                  backgroundColor: actiefEvent === event.id ? 'var(--color-accent-gold)' : 'transparent',
                  color: actiefEvent === event.id ? 'var(--color-bg)' : 'var(--color-accent-gold)',
                  border: '1px solid var(--color-accent-gold)',
                }}
              >
                {actiefEvent === event.id ? 'Actief' : 'Activeer'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
