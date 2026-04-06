'use client'

import { useState } from 'react'

interface TicketFormProps {
  eventId: string
  isPaid: boolean
  priceMembersCents: number
  priceNonmembersCents: number
  isSoldOut: boolean
  categoryColor: string
}

export default function TicketForm({
  eventId,
  isPaid,
  priceMembersCents,
  priceNonmembersCents,
  isSoldOut,
  categoryColor,
}: TicketFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isMember, setIsMember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const currentPrice = isMember ? priceMembersCents : priceNonmembersCents
  const displayPrice = (currentPrice / 100).toFixed(2).replace('.00', ',-')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
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
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        setError(json.error || 'Er ging iets mis. Probeer het opnieuw.')
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

      setError('Geen betaallink ontvangen. Probeer het opnieuw.')
      setLoading(false)
    } catch {
      setError('Verbindingsfout. Controleer je internet en probeer het opnieuw.')
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
          Je staat op de lijst!
        </h3>

        <p className="text-sm text-[var(--color-text-muted)] mb-1">
          Check je email voor je ticket en QR code.
        </p>
        <p className="font-mono text-xs text-[var(--color-text-muted)] opacity-60">
          Niet ontvangen? Check je spam folder.
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
          Dit event is uitverkocht
        </p>
        <p className="text-xs text-[var(--color-text-muted)] mt-2">
          Volg @svsit op Instagram voor toekomstige events
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
          {isPaid ? 'Ticket kopen' : 'Aanmelden'}
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
            naam *
          </label>
          <input
            id="ticket-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Je volledige naam"
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
            email *
          </label>
          <input
            id="ticket-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="je@email.nl"
            className="w-full py-3 px-4 rounded-md text-sm font-mono outline-none transition-all duration-200 placeholder:text-[var(--color-text-muted)]/30 focus:border-[var(--color-accent-gold)]"
            style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              color: 'var(--color-text)',
              border: '1px solid rgba(255,255,255,0.10)',
            }}
          />
        </div>

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
            Ik ben SIT lid
            {isPaid && (
              <span className="block font-mono text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                Leden betalen minder: &euro;{(priceMembersCents / 100).toFixed(2).replace('.00', ',-')} i.p.v. &euro;{(priceNonmembersCents / 100).toFixed(2).replace('.00', ',-')}
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
              Totaal
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
            ? 'Bezig...'
            : isPaid
              ? `Afrekenen — €${displayPrice}`
              : 'Aanmelden'
          }
        </button>

        {/* Payment methods hint */}
        {isPaid && (
          <p className="font-mono text-[10px] text-center text-[var(--color-text-muted)] opacity-60">
            Betaal veilig via iDEAL of creditcard
          </p>
        )}
      </form>
    </div>
  )
}
