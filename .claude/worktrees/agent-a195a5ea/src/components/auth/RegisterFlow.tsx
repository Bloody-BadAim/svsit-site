'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import ClassSelector from './ClassSelector'
import { COMMISSIES, ROLLEN } from '@/lib/constants'
import type { Role } from '@/types/database'
import { Check } from 'lucide-react'

type Step = 1 | 2 | 3 | 4

export default function RegisterFlow() {
  const { data: session } = useSession()
  const router = useRouter()
  const isMicrosoft = !!session?.user?.email

  const [step, setStep] = useState<Step>(1)
  const [email, setEmail] = useState(session?.user?.email || '')
  const [studentNumber, setStudentNumber] = useState('')
  const [selectedCommissie, setSelectedCommissie] = useState<string | null>(null)
  const [eigenIdee, setEigenIdee] = useState('')
  const [isDocent, setIsDocent] = useState(false)
  const [password, setPassword] = useState('')
  const [akkoord, setAkkoord] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Herstel formulierdata uit localStorage bij mount
  useEffect(() => {
    const saved = localStorage.getItem('sit-register-form')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.step) setStep(parsed.step)
        if (parsed.email && !isMicrosoft) setEmail(parsed.email)
        if (parsed.studentNumber) setStudentNumber(parsed.studentNumber)
        if (parsed.selectedCommissie !== undefined) setSelectedCommissie(parsed.selectedCommissie)
        if (parsed.eigenIdee) setEigenIdee(parsed.eigenIdee)
        if (parsed.isDocent) setIsDocent(parsed.isDocent)
      } catch {}
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sla formulierdata op in localStorage bij elke wijziging
  useEffect(() => {
    localStorage.setItem('sit-register-form', JSON.stringify({
      step,
      email,
      studentNumber,
      selectedCommissie,
      eigenIdee,
      isDocent,
    }))
  }, [step, email, studentNumber, selectedCommissie, eigenIdee, isDocent])

  const role: Role = isDocent ? 'mentor' : selectedCommissie ? 'contributor' : 'member'
  const commissieNaam = selectedCommissie === 'eigen-idee'
    ? eigenIdee
    : COMMISSIES.find((c) => c.id === selectedCommissie)?.naam || null

  async function handleRegister() {
    setLoading(true)
    setError('')

    try {
      // Stap 1: Maak lid aan
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: isMicrosoft ? undefined : password,
          student_number: studentNumber || null,
          role,
          commissie: selectedCommissie === 'eigen-idee' ? null : selectedCommissie,
          commissie_voorstel: selectedCommissie === 'eigen-idee' ? eigenIdee : null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Registratie mislukt')
      }

      // Stap 2: Start Stripe checkout
      const checkoutRes = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!checkoutRes.ok) throw new Error('Betaling starten mislukt')

      const { url } = await checkoutRes.json()
      if (url) {
        localStorage.removeItem('sit-register-form')
        window.location.href = url
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er ging iets mis')
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Stap indicator */}
      <div className="flex items-center gap-2 mb-12 justify-center">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
              style={{
                backgroundColor: step >= s ? 'var(--color-accent-gold)' : 'var(--color-surface)',
                color: step >= s ? 'var(--color-bg)' : 'var(--color-text-muted)',
                border: step >= s ? 'none' : '1px solid var(--color-border)',
              }}
            >
              {step > s ? <Check className="w-4 h-4" /> : s}
            </div>
            {s < 4 && (
              <div
                className="w-8 h-px"
                style={{
                  backgroundColor: step > s ? 'var(--color-accent-gold)' : 'var(--color-border)',
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Stap 1: Welkom */}
      {step === 1 && (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
              Welkom bij{' '}
              <span style={{ color: 'var(--color-accent-gold)', fontFamily: 'var(--font-mono)' }}>
                {'{'}<span style={{ color: 'var(--color-text)' }}>SIT</span>{'}'}
              </span>
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isMicrosoft}
                required
                placeholder="je@email.nl"
                className="w-full py-3 px-4 rounded-lg text-base outline-none disabled:opacity-60"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                }}
              />
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                studentnummer <span className="opacity-50">(optioneel)</span>
              </label>
              <input
                type="text"
                value={studentNumber}
                onChange={(e) => setStudentNumber(e.target.value)}
                placeholder="Niet verplicht"
                className="w-full py-3 px-4 rounded-lg text-base outline-none"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                }}
              />
            </div>
          </div>

          <button
            onClick={() => {
              if (!email) return
              setStep(2)
            }}
            className="w-full py-4 rounded-lg font-semibold text-lg transition-all"
            style={{
              backgroundColor: 'var(--color-accent-gold)',
              color: 'var(--color-bg)',
            }}
          >
            Volgende
          </button>
        </div>
      )}

      {/* Stap 2: Kies je class */}
      {step === 2 && (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
              Kies je class
            </h2>
            <p className="mt-2" style={{ color: 'var(--color-text-muted)' }}>
              Wil je actief meebouwen aan SIT? Kies een commissie om als Contributor te joinen.
            </p>
          </div>

          <ClassSelector
            selected={selectedCommissie}
            eigenIdee={eigenIdee}
            isDocent={isDocent}
            onSelect={setSelectedCommissie}
            onEigenIdee={setEigenIdee}
            onDocent={setIsDocent}
          />

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="py-3 px-6 rounded-lg font-semibold transition-all"
              style={{
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)',
              }}
            >
              Terug
            </button>
            <button
              onClick={() => setStep(isMicrosoft ? 4 : 3)}
              className="flex-1 py-3 rounded-lg font-semibold transition-all"
              style={{
                backgroundColor: 'var(--color-accent-gold)',
                color: 'var(--color-bg)',
              }}
            >
              {selectedCommissie || isDocent ? 'Volgende' : 'Volgende als Member'}
            </button>
          </div>

          <button
            onClick={() => {
              setSelectedCommissie(null)
              setIsDocent(false)
              setStep(isMicrosoft ? 4 : 3)
            }}
            className="w-full text-center text-sm underline"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Ik wil gewoon lid zijn, skip
          </button>
        </div>
      )}

      {/* Stap 3: Wachtwoord (alleen bij credentials) */}
      {step === 3 && !isMicrosoft && (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
              Bijna klaar
            </h2>
            <p className="mt-2" style={{ color: 'var(--color-text-muted)' }}>
              Kies een wachtwoord voor je account
            </p>
          </div>

          <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Je wordt{' '}
              <span className="font-bold" style={{ color: 'var(--color-accent-gold)' }}>
                {ROLLEN[role].naam}
              </span>
            </p>
            {commissieNaam && (
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                Commissie: <span style={{ color: 'var(--color-text)' }}>{commissieNaam}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm mb-2" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
              wachtwoord <span className="opacity-50">(min. 8 tekens)</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="••••••••"
              className="w-full py-3 px-4 rounded-lg text-base outline-none"
              style={{
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)',
              }}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="py-3 px-6 rounded-lg font-semibold transition-all"
              style={{
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)',
              }}
            >
              Terug
            </button>
            <button
              onClick={() => {
                if (password.length < 8) return
                setStep(4)
              }}
              className="flex-1 py-3 rounded-lg font-semibold transition-all"
              style={{
                backgroundColor: 'var(--color-accent-gold)',
                color: 'var(--color-bg)',
              }}
            >
              Volgende
            </button>
          </div>
        </div>
      )}

      {/* Stap 4: Betalen */}
      {step === 4 && (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
              Activeer je lidmaatschap
            </h2>
          </div>

          <div className="p-6 rounded-lg space-y-3" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="flex justify-between items-center">
              <span style={{ color: 'var(--color-text)' }}>SIT Lidmaatschap</span>
              <span className="text-2xl font-bold" style={{ color: 'var(--color-accent-gold)' }}>
                €10<span className="text-sm font-normal" style={{ color: 'var(--color-text-muted)' }}>/jaar</span>
              </span>
            </div>
            <div className="h-px" style={{ backgroundColor: 'var(--color-border)' }} />
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Rol: <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{ROLLEN[role].naam}</span>
            </p>
            {commissieNaam && (
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Commissie: <span style={{ color: 'var(--color-text)' }}>{commissieNaam}</span>
              </p>
            )}
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={akkoord}
              onChange={(e) => setAkkoord(e.target.checked)}
              className="mt-1 sr-only"
            />
            <div
              className="w-5 h-5 rounded flex-shrink-0 flex items-center justify-center mt-0.5"
              style={{
                backgroundColor: akkoord ? 'var(--color-accent-gold)' : 'transparent',
                border: akkoord ? 'none' : '2px solid var(--color-text-muted)',
              }}
            >
              {akkoord && <Check className="w-3 h-3" style={{ color: 'var(--color-bg)' }} />}
            </div>
            <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Ik ga akkoord met de voorwaarden en machtig SIT om jaarlijks €10 af te schrijven via automatische incasso.
            </span>
          </label>

          {error && (
            <p className="text-sm" style={{ color: 'var(--color-accent-red)' }}>{error}</p>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setStep(isMicrosoft ? 2 : 3)}
              className="py-3 px-6 rounded-lg font-semibold transition-all"
              style={{
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)',
              }}
            >
              Terug
            </button>
            <button
              onClick={handleRegister}
              disabled={!akkoord || loading}
              className="flex-1 py-4 rounded-lg font-semibold text-lg transition-all disabled:opacity-50"
              style={{
                backgroundColor: 'var(--color-accent-gold)',
                color: 'var(--color-bg)',
              }}
            >
              {loading ? 'Bezig...' : 'Betaal en word lid'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
