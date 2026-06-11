'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import type { FormField, CustomData } from '@/lib/eventForm'

interface TicketFormProps {
  eventId: string
  isPaid: boolean
  priceMembersCents: number
  priceNonmembersCents: number
  isSoldOut: boolean
  categoryColor: string
  formFields: FormField[]
}

const fieldInputClass =
  'w-full py-3 px-4 rounded-md text-sm font-mono outline-none transition-all duration-200 placeholder:text-[var(--color-text-muted)]/30 focus:border-[var(--color-accent-gold)]'
const fieldInputStyle: React.CSSProperties = {
  backgroundColor: 'rgba(255,255,255,0.05)',
  color: 'var(--color-text)',
  border: '1px solid rgba(255,255,255,0.10)',
  // donkere native dropdown-popup (anders witte popup met lichte tekst = onleesbaar)
  colorScheme: 'dark',
}

export default function TicketForm({
  eventId,
  isPaid,
  priceMembersCents,
  priceNonmembersCents,
  isSoldOut,
  categoryColor,
  formFields,
}: TicketFormProps) {
  const t = useTranslations('eventTicketForm')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isMember, setIsMember] = useState(false)
  const [customData, setCustomData] = useState<CustomData>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  function setField(id: string, value: string | boolean) {
    setCustomData((prev) => ({ ...prev, [id]: value }))
  }

  const currentPrice = isMember ? priceMembersCents : priceNonmembersCents
  const displayPrice = (currentPrice / 100).toFixed(2).replace('.00', ',-')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    // Client-side check op verplichte custom velden (server valideert nogmaals)
    for (const f of formFields) {
      const v = customData[f.id]
      const empty = f.type === 'checkbox' ? v !== true : !String(v ?? '').trim()
      if (f.required && empty) {
        setError(t('fieldRequired', { label: f.label }))
        return
      }
    }

    setLoading(true)

    try {
      const res = await fetch(`/api/events/${eventId}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name,
          member_id: null,
          isMember,
          custom_data: customData,
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        setError(json.error || t('errorGeneric'))
        setLoading(false)
        return
      }

      // Free event: ticket created directly
      if (!isPaid) {
        setSuccess(true)
        setLoading(false)
        return
      }

      // Paid event: redirect to Stripe checkout
      const checkoutUrl = json.data?.checkout_url
      if (checkoutUrl) {
        window.location.href = checkoutUrl
        // Keep loading state while redirecting
        return
      }

      setError(t('errorNoCheckout'))
      setLoading(false)
    } catch {
      setError(t('errorConnection'))
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
          {t('successTitle')}
        </h3>

        <p className="text-sm text-[var(--color-text-muted)] mb-1">
          {t('successMessage')}
        </p>
        <p className="font-mono text-xs text-[var(--color-text-muted)] opacity-60">
          {t('successSpam')}
        </p>
      </div>
    )
  }

  // Sold out state
  if (isSoldOut) {
    return (
      <div
        className="rounded-lg p-6 sm:p-8 text-center"
        style={{
          background: 'rgba(239, 68, 68, 0.06)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
        }}
      >
        <p
          className="font-mono text-sm uppercase tracking-wider"
          style={{ color: '#EF4444' }}
        >
          {t('soldOutTitle')}
        </p>
        <p className="text-xs text-[var(--color-text-muted)] mt-2">
          {t('soldOutMessage')}
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
          {isPaid ? t('titlePaid') : t('titleFree')}
        </h2>
        <p className="font-mono text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
          {'>'} tickets.purchase()
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
        {/* Name */}
        <div>
          <label
            htmlFor="ticket-name"
            className="block font-mono text-[11px] text-[var(--color-text-muted)] uppercase tracking-wider mb-2"
          >
            {t('nameLabel')} *
          </label>
          <input
            id="ticket-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder={t('namePlaceholder')}
            className="w-full py-3 px-4 rounded-md text-sm font-mono outline-none transition-all duration-200 placeholder:text-[var(--color-text-muted)]/30 focus:border-[var(--color-accent-gold)]"
            style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              color: 'var(--color-text)',
              border: '1px solid rgba(255,255,255,0.10)',
            }}
          />
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="ticket-email"
            className="block font-mono text-[11px] text-[var(--color-text-muted)] uppercase tracking-wider mb-2"
          >
            {t('emailLabel')} *
          </label>
          <input
            id="ticket-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder={t('emailPlaceholder')}
            className="w-full py-3 px-4 rounded-md text-sm font-mono outline-none transition-all duration-200 placeholder:text-[var(--color-text-muted)]/30 focus:border-[var(--color-accent-gold)]"
            style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              color: 'var(--color-text)',
              border: '1px solid rgba(255,255,255,0.10)',
            }}
          />
        </div>

        {/* Custom aanmeld-velden per event */}
        {formFields.map((f) => {
          const labelEl = (
            <label
              htmlFor={`cf-${f.id}`}
              className="block font-mono text-[11px] text-[var(--color-text-muted)] uppercase tracking-wider mb-2"
            >
              {f.label}{f.required ? ' *' : ''}
            </label>
          )

          if (f.type === 'checkbox') {
            return (
              <div key={f.id} className="flex items-start gap-3 py-2">
                <input
                  id={`cf-${f.id}`}
                  type="checkbox"
                  checked={customData[f.id] === true}
                  onChange={(e) => setField(f.id, e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-2 cursor-pointer accent-[var(--color-accent-gold)]"
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.15)' }}
                />
                <label htmlFor={`cf-${f.id}`} className="text-sm cursor-pointer select-none" style={{ color: 'var(--color-text)' }}>
                  {f.label}{f.required ? ' *' : ''}
                </label>
              </div>
            )
          }

          if (f.type === 'textarea') {
            return (
              <div key={f.id}>
                {labelEl}
                <textarea
                  id={`cf-${f.id}`}
                  rows={3}
                  value={String(customData[f.id] ?? '')}
                  onChange={(e) => setField(f.id, e.target.value)}
                  required={f.required}
                  placeholder={f.placeholder ?? ''}
                  className={fieldInputClass}
                  style={{ ...fieldInputStyle, resize: 'vertical' }}
                />
              </div>
            )
          }

          if (f.type === 'select') {
            return (
              <div key={f.id}>
                {labelEl}
                <select
                  id={`cf-${f.id}`}
                  value={String(customData[f.id] ?? '')}
                  onChange={(e) => setField(f.id, e.target.value)}
                  required={f.required}
                  className={fieldInputClass}
                  style={fieldInputStyle}
                >
                  <option value="">{t('selectPlaceholder')}</option>
                  {(f.options ?? []).map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
            )
          }

          return (
            <div key={f.id}>
              {labelEl}
              <input
                id={`cf-${f.id}`}
                type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
                value={String(customData[f.id] ?? '')}
                onChange={(e) => setField(f.id, e.target.value)}
                required={f.required}
                placeholder={f.placeholder ?? ''}
                className={fieldInputClass}
                style={fieldInputStyle}
              />
            </div>
          )
        })}

        {/* Member checkbox */}
        <div className="flex items-start gap-3 py-2">
          <input
            id="ticket-member"
            type="checkbox"
            checked={isMember}
            onChange={(e) => setIsMember(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-2 cursor-pointer accent-[var(--color-accent-gold)]"
            style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderColor: 'rgba(255,255,255,0.15)',
            }}
          />
          <label
            htmlFor="ticket-member"
            className="text-sm cursor-pointer select-none"
            style={{ color: 'var(--color-text)' }}
          >
            {t('memberLabel')}
            {isPaid && (
              <span className="block font-mono text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                {t('memberDiscount', {
                  memberPrice: (priceMembersCents / 100).toFixed(2).replace('.00', ',-'),
                  nonMemberPrice: (priceNonmembersCents / 100).toFixed(2).replace('.00', ',-'),
                })}
              </span>
            )}
          </label>
        </div>

        {/* Price display for paid events */}
        {isPaid && (
          <div
            className="flex items-center justify-between rounded-md px-4 py-3"
            style={{
              background: `${categoryColor}08`,
              border: `1px solid ${categoryColor}20`,
            }}
          >
            <span className="font-mono text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
              {t('totalLabel')}
            </span>
            <span className="font-mono text-lg font-bold" style={{ color: categoryColor }}>
              &euro;{displayPrice}
            </span>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="font-mono text-sm" style={{ color: 'var(--color-accent-red)' }}>
            {error}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-6 rounded-md font-bold text-base transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: 'var(--color-accent-gold)',
            color: '#000000',
          }}
        >
          {loading
            ? t('loading')
            : isPaid
              ? t('submitPaid', { price: displayPrice })
              : t('submitFree')
          }
        </button>

        {/* Payment methods hint */}
        {isPaid && (
          <p className="font-mono text-[10px] text-center text-[var(--color-text-muted)] opacity-60">
            {t('paymentHint')}
          </p>
        )}
      </form>
    </div>
  )
}
