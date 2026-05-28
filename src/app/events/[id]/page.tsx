import { createServiceClient } from '@/lib/supabase'
import { auth } from '@/lib/auth'
import type { SitEvent } from '@/types/database'
import type { Metadata } from 'next'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
import { notFound } from 'next/navigation'
import { Calendar, MapPin, Clock, Users, Camera, Image as ImageIcon } from 'lucide-react'
import TicketForm from './TicketForm'
import CheckInForm from './CheckInForm'

// ── Category display config ─────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<string, { label: string; color: string }> = {
  social: { label: 'SOCIAL', color: '#F29E18' },
  code: { label: 'CODE', color: '#22C55E' },
  learn: { label: 'TALKS', color: '#3B82F6' },
  impact: { label: 'CAREER', color: '#EF4444' },
}

function getCategoryDisplay(category: string) {
  return CATEGORY_CONFIG[category] ?? { label: category.toUpperCase(), color: '#F29E18' }
}

// ── Dynamic metadata ────────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params
  const supabase = createServiceClient()

  const { data: event } = await supabase
    .from('events')
    .select('title, description, date, location')
    .eq('id', id)
    .single()

  if (!event) {
    return { title: 'Event niet gevonden — {SIT}' }
  }

  const dateStr = new Date(event.date as string).toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const desc = event.description ?? `${event.title} op ${dateStr} bij ${event.location ?? 'SIT'}`

  return {
    title: `${event.title} — {SIT}`,
    description: desc,
    openGraph: {
      title: `${event.title} — {SIT}`,
      description: desc,
      siteName: '{SIT}',
      locale: 'nl_NL',
      type: 'article',
      url: `https://svsit.nl/events/${id}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${event.title} — {SIT}`,
      description: desc,
    },
  }
}

// ── Date helpers ────────────────────────────────────────────────────────────

function formatFullDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('nl-NL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function EventDetailPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = createServiceClient()

  // Fetch event
  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !event) {
    notFound()
  }

  const typedEvent = event as SitEvent

  // Count sold tickets (paid + checked_in)
  const { count: ticketsSold } = await supabase
    .from('tickets')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', id)
    .in('status', ['paid', 'checked_in'])

  const soldCount = ticketsSold ?? 0
  const spotsLeft = typedEvent.capacity !== null ? typedEvent.capacity - soldCount : null
  const isSoldOut = spotsLeft !== null && spotsLeft <= 0

  // Check-in: determine if we should show the check-in form
  const session = await auth()
  const isLoggedIn = !!session?.user?.id
  const hasCheckinCode = !!typedEvent.checkin_code
  const eventDate = new Date(typedEvent.date)
  const hoursFromEvent = Math.abs(Date.now() - eventDate.getTime()) / (1000 * 60 * 60)
  const isCheckinWindow = hoursFromEvent <= 12
  const showCheckin = isLoggedIn && hasCheckinCode && isCheckinWindow

  const cat = getCategoryDisplay(typedEvent.category)
  const dateObj = new Date(typedEvent.date)
  const day = dateObj.getDate()
  const months = ['JAN', 'FEB', 'MRT', 'APR', 'MEI', 'JUN', 'JUL', 'AUG', 'SEP', 'OKT', 'NOV', 'DEC']
  const month = months[dateObj.getMonth()]

  const eventJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: typedEvent.title,
    description: typedEvent.description ?? undefined,
    startDate: typedEvent.date,
    ...(typedEvent.location && {
      location: {
        '@type': 'Place',
        name: typedEvent.location,
      },
    }),
    organizer: {
      '@type': 'Organization',
      name: 'SIT — Studievereniging ICT',
      url: 'https://svsit.nl',
    },
    ...(typedEvent.price_members > 0 && {
      offers: {
        '@type': 'Offer',
        price: typedEvent.price_members,
        priceCurrency: 'EUR',
        availability: isSoldOut
          ? 'https://schema.org/SoldOut'
          : 'https://schema.org/InStock',
        url: `https://svsit.nl/events/${id}`,
      },
    }),
    eventStatus: typedEvent.status === 'cancelled'
      ? 'https://schema.org/EventCancelled'
      : 'https://schema.org/EventScheduled',
  }

  return (
    <main
      className="min-h-screen relative px-6 py-16 md:py-24"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />
      {/* Grid background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(245, 158, 11, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(245, 158, 11, 0.02) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse 70% 50% at 50% 30%, black 20%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 50% at 50% 30%, black 20%, transparent 70%)',
        }}
      />

      {/* Ambient glow with event color */}
      <div
        aria-hidden="true"
        className="absolute pointer-events-none"
        style={{
          top: '5%',
          left: '25%',
          width: '50%',
          height: '30%',
          background: `radial-gradient(ellipse at center, ${cat.color}08 0%, transparent 70%)`,
          filter: 'blur(80px)',
        }}
      />

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Back link */}
        <Link
          href="/events"
          className="inline-flex items-center gap-2 font-mono text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors mb-8"
        >
          &larr; Alle events
        </Link>

        {/* Event header card */}
        <div
          className="relative rounded-lg overflow-hidden mb-8"
          style={{
            background: `linear-gradient(135deg, ${cat.color}10 0%, rgba(9,9,11,0.95) 60%)`,
            border: `1px solid ${cat.color}30`,
          }}
        >
          {/* Top accent */}
          <div
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{
              background: `linear-gradient(90deg, ${cat.color}, ${cat.color}00)`,
            }}
          />

          <div className="p-6 sm:p-8">
            {/* Category + status */}
            <div className="flex items-center gap-3 mb-5">
              <span
                className="font-mono text-[10px] tracking-widest px-2 py-0.5 rounded-sm uppercase"
                style={{
                  color: cat.color,
                  border: `1px solid ${cat.color}50`,
                  background: `${cat.color}10`,
                }}
              >
                {cat.label}
              </span>

              {!typedEvent.is_paid && (
                <span
                  className="font-mono text-[10px] tracking-widest px-2 py-0.5 rounded-sm uppercase"
                  style={{
                    color: '#22C55E',
                    border: '1px solid rgba(34, 197, 94, 0.4)',
                    background: 'rgba(34, 197, 94, 0.08)',
                  }}
                >
                  Gratis
                </span>
              )}

              {isSoldOut && (
                <span
                  className="font-mono text-[10px] tracking-widest px-2 py-0.5 rounded-sm uppercase"
                  style={{
                    color: '#EF4444',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    background: 'rgba(239, 68, 68, 0.08)',
                  }}
                >
                  Uitverkocht
                </span>
              )}
            </div>

            {/* Title */}
            <h1
              className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight uppercase mb-6 leading-tight"
              style={{
                color: 'var(--color-text)',
                fontFamily: "'Big Shoulders Display', var(--font-geist-sans), sans-serif",
              }}
            >
              {typedEvent.title}
            </h1>

            {/* Meta grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* Date */}
              <div className="flex items-start gap-3">
                <div
                  className="flex-shrink-0 w-8 h-8 rounded flex items-center justify-center"
                  style={{ background: `${cat.color}15` }}
                >
                  <Calendar size={15} style={{ color: cat.color }} />
                </div>
                <div>
                  <p className="font-mono text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-0.5">
                    Datum
                  </p>
                  <p className="text-sm text-[var(--color-text)]">
                    {formatFullDate(typedEvent.date)}
                  </p>
                </div>
              </div>

              {/* Time */}
              <div className="flex items-start gap-3">
                <div
                  className="flex-shrink-0 w-8 h-8 rounded flex items-center justify-center"
                  style={{ background: `${cat.color}15` }}
                >
                  <Clock size={15} style={{ color: cat.color }} />
                </div>
                <div>
                  <p className="font-mono text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-0.5">
                    Tijd
                  </p>
                  <p className="text-sm text-[var(--color-text)]">
                    {formatTime(typedEvent.date)}
                    {typedEvent.end_date && ` — ${formatTime(typedEvent.end_date)}`}
                  </p>
                </div>
              </div>

              {/* Location */}
              {typedEvent.location && (
                <div className="flex items-start gap-3">
                  <div
                    className="flex-shrink-0 w-8 h-8 rounded flex items-center justify-center"
                    style={{ background: `${cat.color}15` }}
                  >
                    <MapPin size={15} style={{ color: cat.color }} />
                  </div>
                  <div>
                    <p className="font-mono text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-0.5">
                      Locatie
                    </p>
                    <p className="text-sm text-[var(--color-text)]">
                      {typedEvent.location}
                    </p>
                  </div>
                </div>
              )}

              {/* Capacity */}
              {typedEvent.capacity !== null && (
                <div className="flex items-start gap-3">
                  <div
                    className="flex-shrink-0 w-8 h-8 rounded flex items-center justify-center"
                    style={{ background: `${cat.color}15` }}
                  >
                    <Users size={15} style={{ color: cat.color }} />
                  </div>
                  <div>
                    <p className="font-mono text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-0.5">
                      Beschikbaar
                    </p>
                    <p className="text-sm text-[var(--color-text)]">
                      {isSoldOut
                        ? 'Uitverkocht'
                        : `${spotsLeft} van ${typedEvent.capacity} plekken`}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {typedEvent.description && (
              <div
                className="pt-5"
                style={{ borderTop: '1px solid var(--color-border)' }}
              >
                <p className="font-mono text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
                  Over dit event
                </p>
                <div className="text-sm text-[var(--color-text)] leading-relaxed whitespace-pre-line">
                  {typedEvent.description}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pricing info (for paid events) */}
        {typedEvent.is_paid && (
          <div
            className="rounded-lg p-5 sm:p-6 mb-8"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            <p className="font-mono text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-4">
              Prijzen
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <div
                className="flex-1 rounded-md p-4"
                style={{
                  background: 'rgba(245, 158, 11, 0.06)',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                }}
              >
                <p className="font-mono text-[10px] text-[var(--color-accent-gold)] uppercase tracking-widest mb-1">
                  SIT leden
                </p>
                <p className="text-xl font-bold text-[var(--color-text)]">
                  &euro;{(typedEvent.price_members / 100).toFixed(2).replace('.00', ',-')}
                </p>
              </div>
              <div
                className="flex-1 rounded-md p-4"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <p className="font-mono text-[10px] text-[var(--color-text-muted)] uppercase tracking-widest mb-1">
                  Niet-leden
                </p>
                <p className="text-xl font-bold text-[var(--color-text)]">
                  &euro;{(typedEvent.price_nonmembers / 100).toFixed(2).replace('.00', ',-')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Ticket form */}
        <TicketForm
          eventId={typedEvent.id}
          isPaid={typedEvent.is_paid}
          priceMembersCents={typedEvent.price_members}
          priceNonmembersCents={typedEvent.price_nonmembers}
          isSoldOut={isSoldOut}
          categoryColor={cat.color}
        />

        {/* Event recap (only shown when published) */}
        {typedEvent.recap_published && typedEvent.recap_description && (
          <div
            className="rounded-lg overflow-hidden mb-8"
            style={{
              background: '#18181B',
              border: '1px solid #27272A',
            }}
          >
            {/* Recap header */}
            <div
              className="flex items-center gap-3 px-5 py-3"
              style={{ borderBottom: '1px solid #27272A' }}
            >
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#EF4444' }} />
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#22C55E' }} />
              </div>
              <span className="font-mono text-[10px] tracking-[0.15em]" style={{ color: '#71717A' }}>
                // recap
              </span>
            </div>

            <div className="p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Camera size={16} style={{ color: cat.color }} />
                <h2
                  className="text-lg font-bold uppercase tracking-wide"
                  style={{
                    fontFamily: "'Big Shoulders Display', var(--font-geist-sans), sans-serif",
                    color: '#FAFAFA',
                  }}
                >
                  Terugblik
                </h2>
              </div>

              <div
                className="text-sm leading-relaxed whitespace-pre-line mb-6"
                style={{ color: '#D4D4D8' }}
              >
                {typedEvent.recap_description}
              </div>

              {/* Photo gallery */}
              {typedEvent.recap_photos && typedEvent.recap_photos.length > 0 && (
                <div>
                  <p
                    className="font-mono text-[10px] tracking-[0.2em] uppercase mb-3"
                    style={{ color: cat.color }}
                  >
                    {'>'} foto&apos;s
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {typedEvent.recap_photos.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative aspect-[4/3] overflow-hidden group"
                        style={{
                          borderRadius: '6px',
                          border: '1px solid #27272A',
                          backgroundColor: '#09090B',
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={`${typedEvent.title} foto ${i + 1}`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                          style={{ background: 'rgba(9, 9, 11, 0.5)' }}
                        >
                          <ImageIcon size={20} style={{ color: '#FAFAFA' }} />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Self-service check-in (only for logged-in members during active events) */}
        {showCheckin && (
          <div className="mt-8">
            <CheckInForm
              eventId={typedEvent.id}
              categoryColor={cat.color}
            />
          </div>
        )}

        {/* Footer marks */}
        <div className="flex items-center justify-center gap-3 mt-16">
          <span className="text-[var(--color-accent-red)] text-[10px] font-bold">&times;</span>
          <span className="text-[var(--color-accent-green)] text-[10px] font-bold">&times;</span>
          <span className="text-[var(--color-accent-blue)] text-[10px] font-bold">&times;</span>
        </div>
      </div>
    </main>
  )
}
