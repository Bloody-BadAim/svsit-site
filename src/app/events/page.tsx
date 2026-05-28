import { createServiceClient } from '@/lib/supabase'
import type { SitEvent } from '@/types/database'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Calendar, MapPin, Users, Camera } from 'lucide-react'
import Navbar from '@/components/Navbar'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Events — {SIT}',
  description: 'Bekijk alle aankomende events van SIT, de studievereniging voor HBO-ICT aan de HvA.',
  openGraph: {
    title: 'Events — {SIT}',
    description: 'Borrels, hackathons, tech talks, game nights en meer. Bekijk het SIT event programma.',
    siteName: '{SIT}',
    locale: 'nl_NL',
    type: 'website',
    url: 'https://svsit.nl/events',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Events — {SIT}',
    description: 'Borrels, hackathons, tech talks, game nights en meer bij SIT.',
  },
}

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

// ── Date formatting ─────────────────────────────────────────────────────────

function formatDateDutch(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('nl-NL', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
  })
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
}

// ── Price display ───────────────────────────────────────────────────────────

function PriceBadge({ event }: { event: SitEvent }) {
  if (!event.is_paid) {
    return (
      <span
        className="font-mono text-[10px] tracking-widest uppercase px-2 py-0.5 rounded-sm"
        style={{
          color: '#22C55E',
          border: '1px solid rgba(34, 197, 94, 0.4)',
          background: 'rgba(34, 197, 94, 0.08)',
        }}
      >
        Gratis
      </span>
    )
  }

  const lowestPrice = Math.min(event.price_members, event.price_nonmembers)
  const displayPrice = (lowestPrice / 100).toFixed(0)

  return (
    <span
      className="font-mono text-[10px] tracking-widest uppercase px-2 py-0.5 rounded-sm"
      style={{
        color: 'var(--color-accent-gold)',
        border: '1px solid rgba(245, 158, 11, 0.4)',
        background: 'rgba(245, 158, 11, 0.08)',
      }}
    >
      Vanaf &euro;{displayPrice}
    </span>
  )
}

// ── Event Card ──────────────────────────────────────────────────────────────

function EventCard({ event }: { event: SitEvent }) {
  const cat = getCategoryDisplay(event.category)
  const dateObj = new Date(event.date)
  const day = dateObj.getDate()
  const months = ['JAN', 'FEB', 'MRT', 'APR', 'MEI', 'JUN', 'JUL', 'AUG', 'SEP', 'OKT', 'NOV', 'DEC']
  const month = months[dateObj.getMonth()]

  return (
    <Link
      href={`/events/${event.id}`}
      className="group relative block rounded-lg overflow-hidden transition-all duration-200 hover:translate-y-[-2px]"
      style={{
        background: `linear-gradient(135deg, ${cat.color}08 0%, rgba(17,17,19,0.95) 60%)`,
        border: `1px solid ${cat.color}25`,
      }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] transition-opacity duration-200 opacity-60 group-hover:opacity-100"
        style={{
          background: `linear-gradient(90deg, ${cat.color}, ${cat.color}00)`,
        }}
      />

      <div className="p-5 sm:p-6">
        {/* Date + Category row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            {/* Date block */}
            <div
              className="font-mono text-center leading-none flex-shrink-0"
              style={{ color: cat.color }}
            >
              <div className="text-xl font-bold">{day}</div>
              <div className="text-[10px] tracking-widest mt-0.5 opacity-70">{month}</div>
            </div>

            {/* Dot separator */}
            <span
              className="w-1 h-1 rounded-full flex-shrink-0 opacity-40"
              style={{ background: cat.color }}
            />

            {/* Title */}
            <h2 className="font-mono text-base sm:text-lg font-semibold text-[var(--color-text)] group-hover:text-white transition-colors leading-tight">
              {event.title}
            </h2>
          </div>

          {/* Category badge */}
          <span
            className="font-mono text-[10px] tracking-widest px-2 py-0.5 rounded-sm uppercase flex-shrink-0"
            style={{
              color: cat.color,
              border: `1px solid ${cat.color}40`,
              background: `${cat.color}0d`,
            }}
          >
            {cat.label}
          </span>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap gap-4 mb-4 font-mono text-xs text-[var(--color-text-muted)]">
          <span className="flex items-center gap-1.5">
            <Calendar size={12} style={{ color: cat.color }} />
            {formatDateDutch(event.date)}, {formatTime(event.date)}
          </span>
          {event.location && (
            <span className="flex items-center gap-1.5">
              <MapPin size={12} style={{ color: cat.color }} />
              {event.location}
            </span>
          )}
          {event.capacity !== null && (
            <span className="flex items-center gap-1.5">
              <Users size={12} style={{ color: cat.color }} />
              {event.capacity} plekken
            </span>
          )}
        </div>

        {/* Description preview */}
        {event.description && (
          <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-4 line-clamp-2">
            {event.description}
          </p>
        )}

        {/* Price + CTA row */}
        <div className="flex items-center justify-between">
          <PriceBadge event={event} />

          <span
            className="font-mono text-xs tracking-wider uppercase transition-colors group-hover:text-[var(--color-text)]"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Bekijk &rarr;
          </span>
        </div>
      </div>
    </Link>
  )
}

// ── Recap Card ──────────────────────────────────────────────────────────────

function RecapCard({ event }: { event: SitEvent }) {
  const cat = getCategoryDisplay(event.category)
  const dateObj = new Date(event.date)
  const day = dateObj.getDate()
  const months = ['JAN', 'FEB', 'MRT', 'APR', 'MEI', 'JUN', 'JUL', 'AUG', 'SEP', 'OKT', 'NOV', 'DEC']
  const month = months[dateObj.getMonth()]
  const photoCount = event.recap_photos?.length ?? 0

  return (
    <Link
      href={`/events/${event.id}`}
      className="group relative block rounded-lg overflow-hidden transition-all duration-200 hover:translate-y-[-2px]"
      style={{
        background: '#18181B',
        border: '1px solid #27272A',
      }}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="font-mono text-center leading-none flex-shrink-0" style={{ color: '#71717A' }}>
              <div className="text-lg font-bold">{day}</div>
              <div className="text-[10px] tracking-widest mt-0.5 opacity-70">{month}</div>
            </div>
            <span className="w-1 h-1 rounded-full flex-shrink-0 opacity-40" style={{ background: '#71717A' }} />
            <h2 className="font-mono text-sm sm:text-base font-semibold text-[#A1A1AA] group-hover:text-white transition-colors leading-tight">
              {event.title}
            </h2>
          </div>
          <span
            className="flex items-center gap-1 font-mono text-[10px] tracking-widest px-2 py-0.5 rounded-sm uppercase flex-shrink-0"
            style={{
              color: cat.color,
              border: `1px solid ${cat.color}30`,
              background: `${cat.color}08`,
            }}
          >
            <Camera size={10} />
            RECAP
          </span>
        </div>

        {event.recap_description && (
          <p className="text-xs text-[#71717A] leading-relaxed line-clamp-2 mb-3">
            {event.recap_description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-[#71717A]">
            {photoCount > 0 ? `${photoCount} foto${photoCount === 1 ? '' : "'s"}` : 'Lees meer'}
          </span>
          <span className="font-mono text-xs tracking-wider uppercase text-[#71717A] group-hover:text-[#D4D4D8] transition-colors">
            Bekijk &rarr;
          </span>
        </div>
      </div>
    </Link>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function EventsPage() {
  const supabase = createServiceClient()

  const [upcomingResult, recapResult] = await Promise.all([
    supabase
      .from('events')
      .select('*')
      .in('status', ['upcoming', 'active'])
      .gte('date', new Date().toISOString())
      .order('date', { ascending: true }),
    supabase
      .from('events')
      .select('*')
      .eq('status', 'completed')
      .eq('recap_published', true)
      .order('date', { ascending: false })
      .limit(6),
  ])

  const eventList = (upcomingResult.error || !upcomingResult.data) ? [] : (upcomingResult.data as SitEvent[])
  const recapList = (recapResult.error || !recapResult.data) ? [] : (recapResult.data as SitEvent[])

  return (
    <>
    <Navbar />
    <main
      className="min-h-screen relative px-6 pt-28 pb-16 md:pt-32 md:pb-24"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
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

      <div className="relative z-10 max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1
            className="text-3xl sm:text-4xl font-bold tracking-tight uppercase"
            style={{
              color: 'var(--color-text)',
              fontFamily: "'Big Shoulders Display', var(--font-geist-sans), sans-serif",
            }}
          >
            Events
          </h1>

          <p className="font-mono text-sm mt-3" style={{ color: 'var(--color-text-muted)' }}>
            {'>'} events.list(status: &quot;upcoming&quot;)
          </p>
        </div>

        {/* Events list */}
        {eventList.length === 0 ? (
          <div
            className="py-16 px-6 rounded-lg text-center"
            style={{ border: '1px dashed var(--color-border)' }}
          >
            <p className="font-mono text-sm text-[var(--color-text-muted)] mb-2">
              Er zijn momenteel geen aankomende events
            </p>
            <p className="font-mono text-xs text-[var(--color-text-muted)] opacity-60">
              Volg @sv.sit op Instagram voor updates
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {eventList.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

        {/* Past events with recaps */}
        {recapList.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center gap-3 mb-6">
              <span className="font-mono text-xs tracking-[0.15em]" style={{ color: '#71717A' }}>
                // terugblik
              </span>
              <span className="flex-1 h-px" style={{ backgroundColor: '#27272A' }} />
            </div>
            <div className="space-y-3">
              {recapList.map((event) => (
                <RecapCard key={event.id} event={event} />
              ))}
            </div>
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
    </>
  )
}
