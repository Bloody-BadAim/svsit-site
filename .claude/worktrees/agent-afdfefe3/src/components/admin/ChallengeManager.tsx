'use client'

import { useState } from 'react'
import type { StatCategory } from '@/types/database'
import { Check, X } from 'lucide-react'

const CATEGORIES: { value: StatCategory; label: string }[] = [
  { value: 'code', label: 'Code' },
  { value: 'social', label: 'Social' },
  { value: 'learn', label: 'Learn' },
  { value: 'impact', label: 'Impact' },
]

export default function ChallengeManager() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<StatCategory>('code')
  const [points, setPoints] = useState<number>(50)
  const [activeUntil, setActiveUntil] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !description) return

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const res = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          type: 'quest',
          category,
          points,
          active_until: activeUntil || null,
          proof_required: true,
          proof_type: 'link',
        }),
      })

      const json = await res.json()
      if (!res.ok || json.error) {
        setError(json.error ?? 'Aanmaken mislukt')
        return
      }

      setSuccess(true)
      setTitle('')
      setDescription('')
      setCategory('code')
      setPoints(50)
      setActiveUntil('')
    } catch {
      setError('Netwerkfout — probeer opnieuw')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="p-5 rounded-lg space-y-4"
      style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <h2
        className="text-xs font-bold uppercase tracking-widest"
        style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
      >
        {'>'} challenge.create()
      </h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Title */}
        <div className="space-y-1">
          <label
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
          >
            titel
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Bijv. Push je eerste open source PR"
            required
            className="w-full py-2 px-3 rounded-lg text-sm outline-none"
            style={{
              backgroundColor: 'var(--color-bg)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
              fontFamily: 'var(--font-mono)',
            }}
          />
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
          >
            omschrijving
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Leg uit wat er gedaan moet worden..."
            required
            rows={3}
            className="w-full py-2 px-3 rounded-lg text-sm outline-none resize-none"
            style={{
              backgroundColor: 'var(--color-bg)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
              fontFamily: 'var(--font-mono)',
            }}
          />
        </div>

        {/* Category + Points row */}
        <div className="flex gap-3">
          <div className="space-y-1 flex-1">
            <label
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
            >
              categorie
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as StatCategory)}
              className="w-full py-2 px-3 rounded-lg text-sm outline-none"
              style={{
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1 w-28">
            <label
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
            >
              punten
            </label>
            <input
              type="number"
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
              min={1}
              max={9999}
              required
              className="w-full py-2 px-3 rounded-lg text-sm outline-none"
              style={{
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)',
                fontFamily: 'var(--font-mono)',
              }}
            />
          </div>
        </div>

        {/* Deadline */}
        <div className="space-y-1">
          <label
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
          >
            deadline (optioneel)
          </label>
          <input
            type="date"
            value={activeUntil}
            onChange={(e) => setActiveUntil(e.target.value)}
            className="py-2 px-3 rounded-lg text-sm outline-none"
            style={{
              backgroundColor: 'var(--color-bg)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
              fontFamily: 'var(--font-mono)',
            }}
          />
        </div>

        {/* Feedback */}
        {error && (
          <p className="text-xs py-2 px-3 rounded-lg flex items-center gap-1.5" style={{ color: 'var(--color-accent-red)', backgroundColor: 'rgba(239,68,68,0.08)', fontFamily: 'var(--font-mono)' }}>
            <X className="w-3.5 h-3.5 shrink-0" /> {error}
          </p>
        )}
        {success && (
          <p className="text-xs py-2 px-3 rounded-lg flex items-center gap-1.5" style={{ color: 'var(--color-accent-green)', backgroundColor: 'rgba(34,197,94,0.08)', fontFamily: 'var(--font-mono)' }}>
            <Check className="w-3.5 h-3.5 shrink-0" /> Challenge aangemaakt
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !title || !description}
          className="py-2 px-5 rounded-lg text-sm font-bold disabled:opacity-40 transition-opacity"
          style={{
            backgroundColor: 'var(--color-accent-gold)',
            color: 'var(--color-bg)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {loading ? 'Aanmaken...' : 'Aanmaken'}
        </button>
      </form>
    </div>
  )
}
