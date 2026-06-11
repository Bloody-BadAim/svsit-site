'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import QRScanner from '@/components/admin/QRScanner'
import { useScannerStore } from '@/stores/useScannerStore'

interface DbEvent {
  id: string
  title: string
  status: string
}

export default function ScannerPage() {
  const t = useTranslations('adminScanner')
  const { actiefEvent, actiefEventNaam, setActiefEvent } = useScannerStore()
  const [dbEvents, setDbEvents] = useState<DbEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadEvents() {
      try {
        const [upcomingRes, activeRes] = await Promise.all([
          fetch('/api/events?status=upcoming'),
          fetch('/api/events?status=active'),
        ])
        const [upcoming, active] = await Promise.all([upcomingRes.json(), activeRes.json()])
        const merged: DbEvent[] = [
          ...(active.data ?? []),
          ...(upcoming.data ?? []),
        ]
        setDbEvents(merged)
      } catch {
        // stil falen - scanner werkt ook zonder events lijst
      } finally {
        setLoading(false)
      }
    }
    loadEvents()
  }, [])

  function handleEventSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value
    if (!id) {
      setActiefEvent(null, null)
      return
    }
    const event = dbEvents.find((ev) => ev.id === id)
    if (event) setActiefEvent(event.id, event.title)
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
          {t('heading')}
        </h1>
        {actiefEventNaam && (
          <p className="mt-1 text-sm" style={{ color: 'var(--color-accent-gold)' }}>
            {t('activeEvent', { name: actiefEventNaam })}
          </p>
        )}
      </div>

      {/* Event selectie - toon dropdown als geen event actief is via de store */}
      {!loading && dbEvents.length > 0 && (
        <div className="mb-6">
          <label
            className="block text-sm mb-2"
            style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
          >
            {t('selectEventLabel')}
          </label>
          <select
            value={actiefEvent ?? ''}
            onChange={handleEventSelect}
            className="w-full py-2 px-3 rounded-lg text-sm outline-none"
            style={{
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
            }}
          >
            <option value="">{t('noEventSelected')}</option>
            {dbEvents.map((ev) => (
              <option key={ev.id} value={ev.id}>
                [{ev.status.toUpperCase()}] {ev.title}
              </option>
            ))}
          </select>
        </div>
      )}

      <QRScanner eventId={actiefEvent ?? undefined} eventName={actiefEventNaam ?? undefined} />
    </div>
  )
}
