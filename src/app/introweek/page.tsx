import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Gamepad2,
  Compass,
  Zap,
  Code,
  GraduationCap,
  Gift,
  ArrowRight,
  Github,
  Laptop,
  Trophy,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Introweek 2026 - {SIT}',
  description:
    'Welkom bij HBO-ICT! SIT is de community voor ICT-studenten aan de HvA. Introweek 31 aug - 4 sep: events, workshops, en meer.',
  openGraph: {
    title: 'Introweek 2026 - {SIT}',
    description: 'Introweek 31 aug - 4 sep: SIT Hub, Survival Quest, en Aloha Amsterdam. Word lid voor €9,99.',
    siteName: '{SIT}',
    locale: 'nl_NL',
    type: 'website',
    url: 'https://svsit.nl/introweek',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Introweek 2026 - {SIT}',
    description: 'Introweek 31 aug - 4 sep: SIT Hub, Survival Quest, en Aloha Amsterdam.',
  },
}

// ── Schedule data ───────────────────────────────────────────────────────────

const SCHEDULE = [
  {
    tag: 'HELE WEEK',
    title: 'SIT Hub',
    date: 'ma 31 aug - vr 4 sep',
    time: 'Doorlopend',
    location: 'Wibauthuis, 5e verdieping',
    color: '#3B82F6',
    icon: Laptop,
    description:
      'De hele introweek staat onze stand open. Kom langs, ontmoet commissieleden, pak je starterpakket, en ontdek wat SIT te bieden heeft.',
    highlights: ['Commissie kramen', 'Starterpakket', 'Speed typing challenge', 'AI demo\'s'],
  },
  {
    tag: 'EVENT 1',
    title: 'SIT Survival Quest',
    date: 'di 1 september',
    time: 'Middag',
    location: 'Start: collegezaal WBH',
    color: '#F29E18',
    icon: Compass,
    description:
      'Interactieve scavenger hunt over de campus. Strijd in teams om punten - van Nintendo games tot prompt engineering challenges.',
    highlights: ['Teams van ~15', '8 stations', 'Nintendo games', 'Prompt engineering'],
  },
  {
    tag: 'WEEK 2',
    title: 'SIT x Aloha Amsterdam',
    date: 'Datum wordt aangekondigd',
    time: 'Einde middag',
    location: 'Aloha, De Ruijterkade 151',
    color: '#22C55E',
    icon: Gamepad2,
    description:
      'Bowling, lasergamen en glow minigolf bij Aloha Amsterdam - pal naast Centraal Station. Open voor iedereen!',
    highlights: ['Bowling', 'Lasergamen', 'Glow minigolf', 'Nieuw lid? €10 all-in'],
  },
]

// ── Perks data ──────────────────────────────────────────────────────────────

const PERKS = [
  {
    icon: Code,
    title: 'Gratis dev tools',
    description: 'GitHub Education, JetBrains, en meer - via het SIT Starterpakket.',
  },
  {
    icon: Calendar,
    title: 'Events het hele jaar',
    description: 'Borrels, hackathons, bedrijfsbezoeken, game avonden, workshops.',
  },
  {
    icon: Users,
    title: 'Community',
    description: '100+ studenten die dezelfde opleiding doen. Geen ontgroening, gewoon chill.',
  },
  {
    icon: GraduationCap,
    title: 'Workshops & talks',
    description: 'AI workshops, coding sessions, tech talks van bedrijven.',
  },
  {
    icon: Trophy,
    title: 'Commissies',
    description: '8 commissies waar je hands-on ervaring opdoet. CV-goud.',
  },
  {
    icon: Github,
    title: 'Projecten',
    description: 'Bouw mee aan echte projecten - van de SIT website tot game servers.',
  },
]

// ── Page ────────────────────────────────────────────────────────────────────

export default function IntroweekPage() {
  return (
    <>
      <Navbar />
      <main
        className="min-h-screen relative overflow-hidden"
        style={{ backgroundColor: '#09090B' }}
      >
        {/* Grid background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(242, 158, 24, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(242, 158, 24, 0.03) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Ghost year */}
        <div
          className="absolute top-16 right-4 md:right-12 select-none pointer-events-none"
          style={{
            fontFamily: "'Big Shoulders Display', sans-serif",
            fontSize: 'clamp(100px, 18vw, 260px)',
            fontWeight: 900,
            color: 'rgba(242, 158, 24, 0.03)',
            lineHeight: 1,
          }}
        >
          2026
        </div>

        {/* Ambient glow */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: '0',
            left: '20%',
            width: '60%',
            height: '40%',
            background: 'radial-gradient(ellipse at center, rgba(242, 158, 24, 0.06) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />

        <div className="relative z-10">
          {/* ── HERO ──────────────────────────────────────────────────────── */}
          <section className="pt-32 pb-16 md:pt-40 md:pb-24 px-6 md:px-12 lg:px-24">
            <div className="max-w-[1000px] mx-auto">
              {/* Terminal label */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#EF4444' }} />
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#F29E18' }} />
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#22C55E' }} />
                </div>
                <span className="font-mono text-[11px] tracking-[0.15em]" style={{ color: '#71717A' }}>
                  // introweek_2026
                </span>
              </div>

              <h1
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.9] mb-6"
                style={{
                  fontFamily: "'Big Shoulders Display', sans-serif",
                  color: '#FAFAFA',
                }}
              >
                Welkom bij{' '}
                <span style={{ color: '#F29E18' }}>HBO-ICT</span>
                <br />
                <span className="text-3xl sm:text-4xl md:text-5xl" style={{ color: '#A1A1AA' }}>
                  Welkom bij{' '}
                  <span style={{ color: '#F29E18' }}>{'{'}SIT{'}'}</span>
                </span>
              </h1>

              {/* Gold separator */}
              <div className="w-20 h-[2px] mb-6" style={{ backgroundColor: '#F29E18', opacity: 0.6 }} />

              <p className="font-mono text-sm md:text-base max-w-xl leading-relaxed mb-8" style={{ color: '#A1A1AA' }}>
                SIT is de community van HBO-ICT aan de HvA. Events, workshops, hackathons,
                game avonden - en als lid krijg je gratis dev tools en toegang tot alles.
              </p>

              {/* Date badge */}
              <div
                className="inline-flex items-center gap-3 px-4 py-2.5 mb-8"
                style={{
                  backgroundColor: 'rgba(242, 158, 24, 0.08)',
                  border: '1px solid rgba(242, 158, 24, 0.25)',
                  borderRadius: '6px',
                }}
              >
                <Calendar size={16} style={{ color: '#F29E18' }} />
                <span className="font-mono text-sm font-semibold" style={{ color: '#F29E18' }}>
                  31 aug - 4 sep 2026
                </span>
                <span className="font-mono text-xs" style={{ color: '#71717A' }}>
                  Wibauthuis
                </span>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/lid-worden"
                  className="inline-flex items-center gap-2 px-6 py-3 font-mono font-bold text-sm tracking-wide transition-all hover:scale-[1.03]"
                  style={{
                    backgroundColor: '#F29E18',
                    color: '#09090B',
                    borderRadius: '6px',
                  }}
                >
                  WORD LID
                  <ArrowRight size={14} />
                </Link>
                <a
                  href="#programma"
                  className="inline-flex items-center gap-2 px-6 py-3 font-mono font-bold text-sm tracking-wide transition-all hover:scale-[1.03]"
                  style={{
                    backgroundColor: 'transparent',
                    color: '#FAFAFA',
                    border: '1px solid #27272A',
                    borderRadius: '6px',
                  }}
                >
                  BEKIJK PROGRAMMA
                </a>
              </div>

              {/* Stats row */}
              <div className="flex flex-wrap gap-8 mt-12">
                {[
                  { value: '728', label: 'eerstejaars' },
                  { value: '100+', label: 'leden' },
                  { value: '7', label: 'commissies' },
                  { value: '€9,99', label: 'per jaar' },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div
                      className="text-2xl md:text-3xl font-black"
                      style={{
                        fontFamily: "'Big Shoulders Display', sans-serif",
                        color: '#FAFAFA',
                      }}
                    >
                      {stat.value}
                    </div>
                    <div className="font-mono text-[10px] tracking-[0.15em] uppercase mt-1" style={{ color: '#71717A' }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── PROGRAMMA ─────────────────────────────────────────────────── */}
          <section id="programma" className="py-16 md:py-24 px-6 md:px-12 lg:px-24">
            <div className="max-w-[1000px] mx-auto">
              <div className="flex items-center gap-3 mb-8">
                <span className="font-mono text-xs tracking-[0.15em]" style={{ color: '#F29E18' }}>
                  // programma
                </span>
                <span className="flex-1 h-px" style={{ backgroundColor: '#27272A' }} />
              </div>

              <div className="space-y-4">
                {SCHEDULE.map((event) => {
                  const Icon = event.icon
                  return (
                    <div
                      key={event.title}
                      className="relative"
                      style={{
                        backgroundColor: '#18181B',
                        border: '1px solid #27272A',
                        borderRadius: '6px',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Top accent */}
                      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: event.color, opacity: 0.5 }} />

                      <div className="p-5 sm:p-6">
                        {/* Header row */}
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div className="flex items-start gap-3">
                            <div
                              className="w-10 h-10 flex items-center justify-center shrink-0"
                              style={{
                                backgroundColor: `color-mix(in srgb, ${event.color} 10%, transparent)`,
                                border: `1px solid color-mix(in srgb, ${event.color} 20%, transparent)`,
                                borderRadius: '6px',
                              }}
                            >
                              <Icon size={18} style={{ color: event.color }} />
                            </div>
                            <div>
                              <span
                                className="font-mono text-[9px] tracking-[0.15em] uppercase px-2 py-0.5 mb-2 inline-block"
                                style={{
                                  color: event.color,
                                  border: `1px solid color-mix(in srgb, ${event.color} 30%, transparent)`,
                                  background: `color-mix(in srgb, ${event.color} 8%, transparent)`,
                                  borderRadius: '3px',
                                }}
                              >
                                {event.tag}
                              </span>
                              <h3
                                className="text-xl font-bold uppercase tracking-wide mt-1"
                                style={{
                                  fontFamily: "'Big Shoulders Display', sans-serif",
                                  color: '#FAFAFA',
                                }}
                              >
                                {event.title}
                              </h3>
                            </div>
                          </div>
                        </div>

                        {/* Meta */}
                        <div className="flex flex-wrap gap-4 mb-4 font-mono text-xs" style={{ color: '#A1A1AA' }}>
                          <span className="flex items-center gap-1.5">
                            <Calendar size={12} style={{ color: event.color }} />
                            {event.date}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock size={12} style={{ color: event.color }} />
                            {event.time}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin size={12} style={{ color: event.color }} />
                            {event.location}
                          </span>
                        </div>

                        <p className="font-mono text-sm leading-relaxed mb-4" style={{ color: '#A1A1AA' }}>
                          {event.description}
                        </p>

                        {/* Highlights */}
                        <div className="flex flex-wrap gap-2">
                          {event.highlights.map((h) => (
                            <span
                              key={h}
                              className="font-mono text-[10px] px-2 py-1"
                              style={{
                                color: '#D4D4D8',
                                backgroundColor: '#09090B',
                                border: '1px solid #27272A',
                                borderRadius: '4px',
                              }}
                            >
                              {h}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          {/* ── WAT KRIJG JE ──────────────────────────────────────────────── */}
          <section className="py-16 md:py-24 px-6 md:px-12 lg:px-24">
            <div className="max-w-[1000px] mx-auto">
              <div className="flex items-center gap-3 mb-8">
                <span className="font-mono text-xs tracking-[0.15em]" style={{ color: '#F29E18' }}>
                  // als_lid_krijg_je
                </span>
                <span className="flex-1 h-px" style={{ backgroundColor: '#27272A' }} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {PERKS.map((perk) => {
                  const Icon = perk.icon
                  return (
                    <div
                      key={perk.title}
                      className="p-5"
                      style={{
                        backgroundColor: '#18181B',
                        border: '1px solid #27272A',
                        borderRadius: '6px',
                      }}
                    >
                      <div
                        className="w-9 h-9 flex items-center justify-center mb-3"
                        style={{
                          backgroundColor: 'rgba(242, 158, 24, 0.08)',
                          border: '1px solid rgba(242, 158, 24, 0.15)',
                          borderRadius: '6px',
                        }}
                      >
                        <Icon size={16} style={{ color: '#F29E18' }} />
                      </div>
                      <h3 className="font-mono text-sm font-semibold mb-1" style={{ color: '#FAFAFA' }}>
                        {perk.title}
                      </h3>
                      <p className="font-mono text-xs leading-relaxed" style={{ color: '#71717A' }}>
                        {perk.description}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          {/* ── CTA ───────────────────────────────────────────────────────── */}
          <section className="py-16 md:py-24 px-6 md:px-12 lg:px-24">
            <div className="max-w-[600px] mx-auto text-center">
              {/* Code block CTA */}
              <div
                className="text-left mb-8"
                style={{
                  backgroundColor: '#18181B',
                  border: '1px solid #27272A',
                  borderRadius: '6px',
                  overflow: 'hidden',
                }}
              >
                <div
                  className="flex items-center gap-3 px-4 py-2.5"
                  style={{ borderBottom: '1px solid #27272A' }}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#EF4444' }} />
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#F29E18' }} />
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#22C55E' }} />
                  </div>
                  <span className="font-mono text-[10px]" style={{ color: '#71717A' }}>
                    join_sit.sh
                  </span>
                </div>
                <div className="p-4 space-y-1">
                  <p className="font-mono text-sm" style={{ color: '#71717A' }}>
                    # Stap 1: Kom langs bij de SIT Hub
                  </p>
                  <p className="font-mono text-sm" style={{ color: '#D4D4D8' }}>
                    <span style={{ color: '#22C55E' }}>cd</span>{' '}
                    <span style={{ color: '#3B82F6' }}>wibauthuis/verdieping-5</span>
                  </p>
                  <p className="font-mono text-sm mt-2" style={{ color: '#71717A' }}>
                    # Stap 2: Word lid
                  </p>
                  <p className="font-mono text-sm" style={{ color: '#D4D4D8' }}>
                    <span style={{ color: '#22C55E' }}>sit</span>{' '}
                    <span style={{ color: '#F29E18' }}>join</span>{' '}
                    <span style={{ color: '#71717A' }}>--price</span>{' '}
                    <span style={{ color: '#D4D4D8' }}>9.99</span>
                  </p>
                  <p className="font-mono text-sm mt-2" style={{ color: '#71717A' }}>
                    # Stap 3: Done. Je bent erbij.
                  </p>
                  <p className="font-mono text-sm" style={{ color: '#D4D4D8' }}>
                    <span style={{ color: '#22C55E' }}>echo</span>{' '}
                    <span style={{ color: '#F29E18' }}>&quot;Welkom bij de community!&quot;</span>
                  </p>
                </div>
              </div>

              <Link
                href="/lid-worden"
                className="inline-flex items-center gap-2 px-8 py-3.5 font-mono font-bold text-sm tracking-wide transition-all hover:scale-[1.03]"
                style={{
                  backgroundColor: '#F29E18',
                  color: '#09090B',
                  borderRadius: '6px',
                }}
              >
                WORD LID - €9,99
                <ArrowRight size={14} />
              </Link>

              <p className="font-mono text-xs mt-4" style={{ color: '#71717A' }}>
                Of kom gewoon langs bij de SIT Hub - geen druk, geen verplichting.
              </p>

              <div className="flex items-center justify-center gap-3 mt-4">
                <a
                  href="https://www.instagram.com/sv.sit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs transition-colors hover:underline"
                  style={{ color: '#A1A1AA' }}
                >
                  @sv.sit
                </a>
                <span style={{ color: '#27272A' }}>|</span>
                <a
                  href="mailto:bestuur@svsit.nl"
                  className="font-mono text-xs transition-colors hover:underline"
                  style={{ color: '#A1A1AA' }}
                >
                  bestuur@svsit.nl
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
