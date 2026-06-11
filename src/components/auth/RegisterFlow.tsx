'use client'

import { useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import ClassSelector from './ClassSelector'
import { ROLLEN, SITE_CONFIG } from '@/lib/constants'
import type { Role } from '@/types/database'
import { Check, ArrowRight, User, GraduationCap } from 'lucide-react'

type Step = 1 | 2

export default function RegisterFlow() {
  const t = useTranslations('authRegister')
  const tc = useTranslations('commissies')
  const { data: session } = useSession()
  const router = useRouter()
  const isMicrosoft = !!session?.user?.email

  const [step, setStep] = useState<Step>(1)
  const [email, setEmail] = useState(session?.user?.email || '')
  const [displayName, setDisplayName] = useState('')
  const [isStudent, setIsStudent] = useState(true)
  const [studentNumber, setStudentNumber] = useState('')
  const [hvaEmail, setHvaEmail] = useState('')
  const [password, setPassword] = useState('')
  const [selectedCommissie, setSelectedCommissie] = useState<string | null>(null)
  const [eigenIdee, setEigenIdee] = useState('')
  const [isDocent, setIsDocent] = useState(false)
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
        if (parsed.displayName) setDisplayName(parsed.displayName)
        if (parsed.isStudent !== undefined) setIsStudent(parsed.isStudent)
        if (parsed.studentNumber) setStudentNumber(parsed.studentNumber)
        if (parsed.hvaEmail) setHvaEmail(parsed.hvaEmail)
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
      step, email, displayName, isStudent, studentNumber, hvaEmail,
      selectedCommissie, eigenIdee, isDocent,
    }))
  }, [step, email, displayName, isStudent, studentNumber, hvaEmail, selectedCommissie, eigenIdee, isDocent])

  const role: Role = isDocent ? 'mentor' : selectedCommissie ? 'contributor' : 'member'
  const commissieNaam = selectedCommissie === 'eigen-idee'
    ? eigenIdee
    : selectedCommissie
      ? tc(`${selectedCommissie}.naam`)
      : null

  // Stap 1 validatie
  const step1Valid = email.trim().length > 0
    && (isMicrosoft || password.length >= 8)
    && (!isStudent || studentNumber.trim().length > 0)

  async function createAccount() {
    const res = await fetch('/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password: isMicrosoft ? undefined : password,
        display_name: displayName.trim() || null,
        student_number: isStudent ? studentNumber.trim() : null,
        hva_email: hvaEmail.trim() || null,
        role,
        commissie: selectedCommissie === 'eigen-idee' ? null : selectedCommissie,
        commissie_voorstel: selectedCommissie === 'eigen-idee' ? eigenIdee : null,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || t('errorRegisterFailed'))
    }

    return res.json()
  }

  async function handlePayAndJoin() {
    setLoading(true)
    setError('')

    try {
      await createAccount()

      // Log nieuwe credentials-user in, anders heeft de checkout-route geen sessie
      if (!isMicrosoft && password) {
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        })
        if (result?.error) throw new Error(t('errorLoginAfterRegister'))
      }

      // Start Stripe checkout
      const checkoutRes = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!checkoutRes.ok) throw new Error(t('errorCheckoutFailed'))

      const { url } = await checkoutRes.json()
      if (url) {
        localStorage.removeItem('sit-register-form')
        window.location.href = url
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errorGeneric'))
      setLoading(false)
    }
  }

  async function handleSkipPayment() {
    setLoading(true)
    setError('')

    try {
      await createAccount()
      localStorage.removeItem('sit-register-form')

      // Auto login voor credentials users
      if (!isMicrosoft && password) {
        await signIn('credentials', {
          email,
          password,
          redirect: false,
        })
      }

      router.push('/dashboard?welcome=true')
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errorGeneric'))
      setLoading(false)
    }
  }

  const SOCIALS = [
    { href: SITE_CONFIG.socials.instagram.url, label: SITE_CONFIG.socials.instagram.handle, platform: 'Instagram', color: '#F29E18' },
    { href: SITE_CONFIG.socials.tiktok.url, label: SITE_CONFIG.socials.tiktok.handle, platform: 'TikTok', color: '#EF4444' },
    { href: SITE_CONFIG.socials.whatsapp.url, label: t('whatsappLabel'), platform: 'WhatsApp', color: '#25D366' },
    { href: SITE_CONFIG.socials.discord.url, label: t('discordLabel'), platform: 'Discord', color: '#5865F2' },
  ]

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Stap indicator */}
      <div className="flex items-center gap-2 mb-10 justify-center">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold font-mono"
              style={{
                backgroundColor: step >= s ? 'var(--color-accent-gold)' : 'var(--color-surface)',
                color: step >= s ? 'var(--color-bg)' : 'var(--color-text-muted)',
                border: step >= s ? 'none' : '1px solid var(--color-border)',
              }}
            >
              {step > s ? <Check className="w-4 h-4" /> : s}
            </div>
            {s < 2 && (
              <div
                className="w-12 h-px"
                style={{
                  backgroundColor: step > s ? 'var(--color-accent-gold)' : 'var(--color-border)',
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Stap 1: Account aanmaken */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2
              className="text-2xl sm:text-3xl font-bold"
              style={{ color: 'var(--color-text)' }}
            >
              {t('step1.title')}{' '}
              <span style={{ color: 'var(--color-accent-gold)', fontFamily: 'var(--font-mono)' }}>
                {'{'}<span style={{ color: 'var(--color-text)' }}>SIT</span>{'}'}
              </span>
            </h2>
            <p className="mt-2 font-mono text-sm" style={{ color: 'var(--color-text-muted)' }}>
              {t('step1.subtitle')}
            </p>
          </div>

          <div className="space-y-4">
            {/* Naam */}
            <div>
              <label className="block text-sm mb-1.5" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                {t('step1.nameLabel')} <span className="opacity-40">{t('step1.nameOptional')}</span>
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={t('step1.namePlaceholder')}
                className="w-full py-3 px-4 rounded-md text-sm outline-none font-mono transition-colors focus:border-[var(--color-accent-gold)]"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                }}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm mb-1.5" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                {t('step1.emailLabel')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isMicrosoft}
                required
                placeholder={t('step1.emailPlaceholder')}
                className="w-full py-3 px-4 rounded-md text-sm outline-none font-mono disabled:opacity-60 transition-colors focus:border-[var(--color-accent-gold)]"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                }}
              />
            </div>

            {/* Wachtwoord (alleen credentials) */}
            {!isMicrosoft && (
              <div>
                <label className="block text-sm mb-1.5" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {t('step1.passwordLabel')} <span className="opacity-40">{t('step1.passwordHint')}</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder={t('step1.passwordPlaceholder')}
                  className="w-full py-3 px-4 rounded-md text-sm outline-none font-mono transition-colors focus:border-[var(--color-accent-gold)]"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text)',
                    border: '1px solid var(--color-border)',
                  }}
                />
              </div>
            )}

            {/* Student toggle */}
            <div
              className="p-4 rounded-md space-y-3"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => { setIsStudent(true); setIsDocent(false) }}
                  className="flex items-center gap-2 px-3 py-2 rounded-md font-mono text-xs font-semibold transition-all"
                  style={{
                    backgroundColor: isStudent ? 'rgba(242, 158, 24, 0.1)' : 'transparent',
                    color: isStudent ? 'var(--color-accent-gold)' : 'var(--color-text-muted)',
                    border: isStudent ? '1px solid rgba(242, 158, 24, 0.3)' : '1px solid var(--color-border)',
                  }}
                >
                  <GraduationCap size={14} />
                  {t('step1.student')}
                </button>
                <button
                  type="button"
                  onClick={() => { setIsStudent(false); setStudentNumber(''); setHvaEmail('') }}
                  className="flex items-center gap-2 px-3 py-2 rounded-md font-mono text-xs font-semibold transition-all"
                  style={{
                    backgroundColor: !isStudent ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                    color: !isStudent ? 'var(--color-accent-blue)' : 'var(--color-text-muted)',
                    border: !isStudent ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid var(--color-border)',
                  }}
                >
                  <User size={14} />
                  {t('step1.notStudent')}
                </button>
              </div>

              {isStudent && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs mb-1.5" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {t('step1.studentNumberLabel')}
                    </label>
                    <input
                      type="text"
                      value={studentNumber}
                      onChange={(e) => setStudentNumber(e.target.value)}
                      required
                      placeholder={t('step1.studentNumberPlaceholder')}
                      className="w-full py-2.5 px-3 rounded-md text-sm outline-none font-mono transition-colors focus:border-[var(--color-accent-gold)]"
                      style={{
                        backgroundColor: 'var(--color-bg)',
                        color: 'var(--color-text)',
                        border: '1px solid var(--color-border)',
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1.5" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {t('step1.hvaEmailLabel')} <span className="opacity-40">{t('step1.hvaEmailOptional')}</span>
                    </label>
                    <input
                      type="email"
                      value={hvaEmail}
                      onChange={(e) => setHvaEmail(e.target.value)}
                      placeholder={t('step1.hvaEmailPlaceholder')}
                      className="w-full py-2.5 px-3 rounded-md text-sm outline-none font-mono transition-colors focus:border-[var(--color-accent-gold)]"
                      style={{
                        backgroundColor: 'var(--color-bg)',
                        color: 'var(--color-text)',
                        border: '1px solid var(--color-border)',
                      }}
                    />
                  </div>
                </div>
              )}

              {!isStudent && (
                <p className="font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {t('step1.notStudentNote')}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() => {
              if (!step1Valid) return
              setStep(2)
            }}
            disabled={!step1Valid}
            className="w-full py-3.5 rounded-md font-mono font-semibold text-sm transition-all disabled:opacity-40 flex items-center justify-center gap-2"
            style={{
              backgroundColor: 'var(--color-accent-gold)',
              color: 'var(--color-bg)',
            }}
          >
            {t('step1.next')}
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Stap 2: Commissie + betaling */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2
              className="text-2xl sm:text-3xl font-bold"
              style={{ color: 'var(--color-text)' }}
            >
              {t('step2.title')}
            </h2>
            <p className="mt-2 font-mono text-sm" style={{ color: 'var(--color-text-muted)' }}>
              {t('step2.subtitle')}
            </p>
          </div>

          <ClassSelector
            selected={selectedCommissie}
            eigenIdee={eigenIdee}
            isDocent={isDocent}
            onSelect={setSelectedCommissie}
            onEigenIdee={setEigenIdee}
            onDocent={(v) => {
              setIsDocent(v)
              if (v) setIsStudent(false)
            }}
          />

          {/* Summary */}
          <div
            className="p-4 rounded-md font-mono text-sm"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div className="flex justify-between items-center">
              <span style={{ color: 'var(--color-text-muted)' }}>{t('step2.roleLabel')}</span>
              <span className="font-semibold" style={{ color: 'var(--color-accent-gold)' }}>
                {ROLLEN[role].naam}
              </span>
            </div>
            {commissieNaam && (
              <div className="flex justify-between items-center mt-1">
                <span style={{ color: 'var(--color-text-muted)' }}>{t('step2.commissieLabel')}</span>
                <span style={{ color: 'var(--color-text)' }}>{commissieNaam}</span>
              </div>
            )}
          </div>

          {/* Betaal akkoord */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={akkoord}
              onChange={(e) => setAkkoord(e.target.checked)}
              className="sr-only"
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
            <span className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>
              {t('step2.agreement')}
            </span>
          </label>

          {error && (
            <p className="text-sm font-mono" style={{ color: 'var(--color-accent-red)' }}>{error}</p>
          )}

          {/* CTA buttons */}
          <div className="space-y-3">
            <button
              onClick={handlePayAndJoin}
              disabled={!akkoord || loading}
              className="w-full py-3.5 rounded-md font-mono font-semibold text-sm transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              style={{
                backgroundColor: 'var(--color-accent-gold)',
                color: 'var(--color-bg)',
              }}
            >
              {loading ? t('step2.loading') : t('step2.joinPaid', { price: SITE_CONFIG.membership.pricePerYear })}
              {!loading && <ArrowRight size={14} />}
            </button>

            <button
              onClick={handleSkipPayment}
              disabled={loading}
              className="w-full py-3 rounded-md font-mono text-sm transition-all disabled:opacity-40"
              style={{
                backgroundColor: 'transparent',
                color: 'var(--color-text-muted)',
                border: '1px solid var(--color-border)',
              }}
            >
              {t('step2.skipPayment')}
            </button>
          </div>

          <button
            onClick={() => setStep(1)}
            className="w-full text-center font-mono text-xs"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {t('step2.back')}
          </button>
        </div>
      )}

      {/* Socials - always visible */}
      <div
        className="mt-10 pt-8"
        style={{ borderTop: '1px solid var(--color-border)' }}
      >
        <p className="font-mono text-xs text-center mb-4" style={{ color: 'var(--color-text-muted)' }}>
          <span style={{ color: 'var(--color-accent-green)' }}>{'// '}</span>
          {t('socialsLabel')}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {SOCIALS.map((s) => (
            <a
              key={s.platform}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-md font-mono text-xs transition-all"
              style={{
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-muted)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = s.color
                e.currentTarget.style.color = s.color
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)'
                e.currentTarget.style.color = 'var(--color-text-muted)'
              }}
            >
              {s.platform}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
