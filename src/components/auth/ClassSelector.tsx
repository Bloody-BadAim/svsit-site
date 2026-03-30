'use client'

import { useState } from 'react'
import { COMMISSIES } from '@/lib/constants'

interface ClassSelectorProps {
  selected: string | null
  eigenIdee: string
  isDocent: boolean
  onSelect: (id: string | null) => void
  onEigenIdee: (value: string) => void
  onDocent: (value: boolean) => void
}

export default function ClassSelector({
  selected,
  eigenIdee,
  isDocent,
  onSelect,
  onEigenIdee,
  onDocent,
}: ClassSelectorProps) {
  const [showEigenIdee, setShowEigenIdee] = useState(false)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {COMMISSIES.map((commissie) => (
          <button
            key={commissie.id}
            type="button"
            onClick={() => {
              onSelect(commissie.id)
              setShowEigenIdee(false)
            }}
            className="text-left p-4 rounded-lg transition-all duration-200"
            style={{
              backgroundColor: selected === commissie.id ? 'rgba(242, 158, 24, 0.1)' : 'var(--color-surface)',
              border: selected === commissie.id
                ? '2px solid var(--color-accent-gold)'
                : '1px solid var(--color-border)',
            }}
          >
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xl">{commissie.emoji}</span>
              <span
                className="font-semibold"
                style={{ color: selected === commissie.id ? 'var(--color-accent-gold)' : 'var(--color-text)' }}
              >
                {commissie.naam}
              </span>
            </div>
            <p className="text-sm ml-8" style={{ color: 'var(--color-text-muted)' }}>
              {commissie.beschrijving}
            </p>
          </button>
        ))}

        {/* Eigen idee */}
        <button
          type="button"
          onClick={() => {
            onSelect('eigen-idee')
            setShowEigenIdee(true)
          }}
          className="text-left p-4 rounded-lg transition-all duration-200"
          style={{
            backgroundColor: selected === 'eigen-idee' ? 'rgba(242, 158, 24, 0.1)' : 'var(--color-surface)',
            border: selected === 'eigen-idee'
              ? '2px solid var(--color-accent-gold)'
              : '1px solid var(--color-border)',
          }}
        >
          <div className="flex items-center gap-3 mb-1">
            <span className="text-xl">💡</span>
            <span
              className="font-semibold"
              style={{ color: selected === 'eigen-idee' ? 'var(--color-accent-gold)' : 'var(--color-text)' }}
            >
              Eigen idee
            </span>
          </div>
          <p className="text-sm ml-8" style={{ color: 'var(--color-text-muted)' }}>
            Heb je een idee voor een nieuwe commissie?
          </p>
        </button>
      </div>

      {showEigenIdee && selected === 'eigen-idee' && (
        <input
          type="text"
          value={eigenIdee}
          onChange={(e) => onEigenIdee(e.target.value)}
          placeholder="Beschrijf je commissie idee..."
          className="w-full py-3 px-4 rounded-lg text-base outline-none"
          style={{
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-accent-gold)',
          }}
        />
      )}

      {/* Docent toggle */}
      <label
        className="flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-all duration-200"
        style={{
          backgroundColor: isDocent ? 'rgba(59, 130, 246, 0.1)' : 'var(--color-surface)',
          border: isDocent ? '2px solid var(--color-accent-blue)' : '1px solid var(--color-border)',
        }}
      >
        <input
          type="checkbox"
          checked={isDocent}
          onChange={(e) => {
            onDocent(e.target.checked)
            if (e.target.checked) onSelect(null)
          }}
          className="sr-only"
        />
        <div
          className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold"
          style={{
            backgroundColor: isDocent ? 'var(--color-accent-blue)' : 'transparent',
            border: isDocent ? 'none' : '2px solid var(--color-text-muted)',
            color: isDocent ? 'white' : 'transparent',
          }}
        >
          ✓
        </div>
        <div>
          <span className="font-semibold" style={{ color: 'var(--color-text)' }}>
            Ik ben docent / begeleider
          </span>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Word mentor bij SIT
          </p>
        </div>
      </label>
    </div>
  )
}
