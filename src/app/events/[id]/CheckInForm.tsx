'use client'

import { useState, useRef, useEffect } from 'react'

interface CheckInFormProps {
  eventId: string
  categoryColor: string
}

export default function CheckInForm({ eventId, categoryColor }: CheckInFormProps) {
  const [code, setCode] = useState<string[]>(Array(6).fill(''))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [xpEarned, setXpEarned] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  function handleInput(index: number, value: string) {
    // Only allow alphanumeric
    const char = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(-1)

    const newCode = [...code]
    newCode[index] = char
    setCode(newCode)
    setError('')

    // Auto-advance to next input
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
      const newCode = [...code]
      newCode[index - 1] = ''
      setCode(newCode)
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 6)
    if (!pasted) return

    const newCode = Array(6).fill('')
    for (let i = 0; i < pasted.length; i++) {
      newCode[i] = pasted[i]
    }
    setCode(newCode)
    setError('')

    // Focus last filled input or submit if complete
    const focusIndex = Math.min(pasted.length, 5)
    inputRefs.current[focusIndex]?.focus()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const fullCode = code.join('')
    if (fullCode.length !== 6) {
      setError('Vul alle 6 karakters in')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/events/${eventId}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: fullCode }),
      })

      const json = await res.json()

      if (!res.ok) {
        setError(json.error || 'Er ging iets mis')
        setLoading(false)
        return
      }

      setXpEarned(json.data?.xpEarned ?? 25)
      setSuccess(true)
      setLoading(false)
    } catch {
      setError('Verbindingsfout. Probeer het opnieuw.')
      setLoading(false)
    }
  }

  // Success state
  if (success) {
    return (
      <div
        className="rounded-lg p-6 sm:p-8 text-center"
        style={{
          background: 'rgba(34, 197, 94, 0.06)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
        }}
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(34, 197, 94, 0.15)' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h3
          className="text-xl font-bold uppercase mb-2"
          style={{
            color: 'var(--color-text)',
            fontFamily: "'Big Shoulders Display', var(--font-geist-sans), sans-serif",
          }}
        >
          Ingecheckt!
        </h3>

        <p className="text-sm text-[var(--color-text-muted)] mb-1">
          Je bent succesvol ingecheckt voor dit event.
        </p>
        <p
          className="font-mono text-lg font-bold mt-3"
          style={{ color: categoryColor }}
        >
          +{xpEarned} XP
        </p>
      </div>
    )
  }

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
      }}
    >
      {/* Section header */}
      <div
        className="px-5 sm:px-6 py-4"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <h2 className="font-mono text-sm font-semibold text-[var(--color-text)] uppercase tracking-wider">
          Event Check-in
        </h2>
        <p className="font-mono text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
          {'>'} checkin.verify()
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-5 sm:p-6">
        <p className="text-sm text-[var(--color-text-muted)] mb-4">
          Voer de 6-karakter code in die op het event wordt getoond.
        </p>

        {/* Code input boxes */}
        <div className="flex gap-2 sm:gap-3 justify-center mb-5" onPaste={handlePaste}>
          {code.map((char, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el }}
              type="text"
              inputMode="text"
              maxLength={1}
              value={char}
              onChange={(e) => handleInput(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              aria-label={`Code karakter ${i + 1}`}
              className="w-11 h-14 sm:w-13 sm:h-16 text-center text-xl sm:text-2xl font-mono font-bold rounded-md outline-none transition-all duration-200 uppercase"
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                color: 'var(--color-text)',
                border: char
                  ? `2px solid ${categoryColor}`
                  : '2px solid rgba(255,255,255,0.10)',
                caretColor: categoryColor,
              }}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <p className="font-mono text-sm text-center mb-4" style={{ color: 'var(--color-accent-red)' }}>
            {error}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || code.join('').length !== 6}
          className="w-full py-3.5 px-6 rounded-md font-bold text-base transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: categoryColor,
            color: '#000000',
          }}
        >
          {loading ? 'Bezig...' : 'Inchecken'}
        </button>

        <p className="font-mono text-[10px] text-center text-[var(--color-text-muted)] opacity-60 mt-3">
          Je verdient XP voor het bijwonen van events
        </p>
      </form>
    </div>
  )
}
