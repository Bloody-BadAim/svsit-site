'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import {
  Users,
  Server,
  GraduationCap,
  Calendar,
  Brain,
  Gamepad2,
  Handshake,
  ChevronDown,
  ChevronUp,
  Star,
  type LucideIcon,
} from 'lucide-react'

interface CommissieData {
  slug: string
  naam: string
  color: string
  icon: LucideIcon
  voorzitter: string | null
  beschrijving: string
  missie: string
  activiteiten: string[]
  leden: string[]
  status: 'actief' | 'nieuw' | 'zoekt-leden'
}

const COMMISSIES: CommissieData[] = [
  {
    slug: 'servo',
    naam: 'ServCo',
    color: '#3B82F6',
    icon: Server,
    voorzitter: 'Jamiro',
    beschrijving:
      'De technische backbone van SIT. ServCo beheert de eigen SIT-server, vernieuwt svsit.nl met studentprojecten, en onderzoekt mogelijkheden zoals game servers en hosting.',
    missie:
      'SIT een eigen digitale infrastructuur geven die door studenten wordt gebouwd en onderhouden.',
    activiteiten: [
      'Eigen SIT-server beheren',
      'svsit.nl vernieuwen met studentprojecten',
      'Game server hosting',
      'Technische projecten voor leden',
    ],
    leden: ['Jamiro'],
    status: 'nieuw',
  },
  {
    slug: 'community',
    naam: 'Community',
    color: '#06B6D4',
    icon: Users,
    voorzitter: null,
    beschrijving:
      'Ontstaan uit de samenvoeging van PR & Socials en Peiling. Community zorgt voor de online aanwezigheid van SIT, haalt op wat studenten willen, en activeert leden.',
    missie:
      'SIT is er voor de studenten, niet andersom. Als we niet weten wat ze willen, kunnen we ze niet geven wat ze nodig hebben.',
    activiteiten: [
      'Instagram en LinkedIn content',
      'Maandelijkse mini-peilingen',
      'Onboarding nieuwe studenten',
      'Leden activeren en feedback ophalen',
      'Semester-enquetes',
    ],
    leden: ['Shreyah', 'Shakira', 'Mats'],
    status: 'zoekt-leden',
  },
  {
    slug: 'educo',
    naam: 'Educatie (EduCo)',
    color: '#22C55E',
    icon: GraduationCap,
    voorzitter: 'Nick Hoebe',
    beschrijving:
      'Verantwoordelijk voor educatieve content: workshops, tech talks, en kennissessies. Werkt samen met de opleiding voor Fusion klassen en evenementen.',
    missie:
      'Studenten helpen groeien door workshops, lezingen en hands-on leermomenten te organiseren.',
    activiteiten: [
      'Workshops organiseren',
      'Tech talks en coding sessions',
      'Samenwerking met opleiding (Fusion klassen)',
      'Skill development events',
    ],
    leden: ['Nick Hoebe', 'Mats'],
    status: 'actief',
  },
  {
    slug: 'events',
    naam: 'Evenementen',
    color: '#F29E18',
    icon: Calendar,
    voorzitter: 'Thijmen',
    beschrijving:
      'Gefocust op leuke activiteiten: feestjes, uitjes, sport, en gaming events. Van kroegentochten tot Thuishaven — alles wat SIT sociaal maakt.',
    missie:
      'Zorgen dat SIT-leden elkaar ontmoeten buiten de collegebanken, met events die passen bij wat studenten willen.',
    activiteiten: [
      'Borrels en kroegentochten',
      'Feesten en borrels',
      'Sportactiviteiten (voetbal, padel)',
      'Bedrijfsbezoeken en netwerkborrels',
      'Game-avonden en uitjes',
    ],
    leden: ['Thijmen', 'Wesley', 'Mats', 'Kaylin'],
    status: 'actief',
  },
  {
    slug: 'ai4hva',
    naam: 'AI4HvA',
    color: '#8B5CF6',
    icon: Brain,
    voorzitter: 'Matin',
    beschrijving:
      'De AI-community van de HvA, officieel georganiseerd onder SIT. AI4HvA is het unieke selling point van SIT — het positioneert de vereniging als meer dan alleen een sociale club.',
    missie:
      'De go-to plek worden voor AI-interesse op de HvA, met workshops, hackathons en connecties naar de 5 HvA AI Labs.',
    activiteiten: [
      'AI workshops en hackathons',
      'AI Marathon organiseren',
      'Lab Ambassadeurs bij 5 HvA AI Labs',
      'AI020 events bezoeken',
      'Kennisdeling over AI tools',
    ],
    leden: ['Matin', 'Mats', 'Wesley', 'Shreyah', 'Idil'],
    status: 'actief',
  },
  {
    slug: 'gameit',
    naam: 'GameIT',
    color: '#EF4444',
    icon: Gamepad2,
    voorzitter: 'Riley',
    beschrijving:
      'Gaming-gerelateerde activiteiten en events voor SIT leden. Van casual game nights tot D&D campagnes en gaming tournaments.',
    missie:
      'Gamers binnen HBO-ICT samenbrengen met regelmatige game nights, toernooien en community events.',
    activiteiten: [
      'Game nights',
      'D&D sessies en campagnes',
      'Gaming tournaments',
      'LAN parties',
    ],
    leden: ['Riley', 'Wesley', 'Rosa', 'Luuk'],
    status: 'actief',
  },
  {
    slug: 'sponsoring',
    naam: 'Sponsoring',
    color: '#F29E18',
    icon: Handshake,
    voorzitter: 'Liam',
    beschrijving:
      'Werft en onderhoudt sponsorrelaties met bedrijven. Van tech talks tot stages — sponsoring zorgt dat SIT-leden in contact komen met de IT-arbeidsmarkt.',
    missie:
      'Waardevolle partnerships opbouwen die concreet iets opleveren voor leden: stagekansen, workshops, tooling en netwerkmomenten.',
    activiteiten: [
      'Bedrijven benaderen en partnerships opzetten',
      'Sponsorpakketten beheren',
      'Tech talks en bedrijfsbezoeken organiseren',
      'Stagemarkt coordineren',
      'Pipeline van 46+ bedrijven onderhouden',
    ],
    leden: ['Liam', 'Matin', 'Riley'],
    status: 'actief',
  },
]

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  actief: { label: 'ACTIEF', color: '#22C55E' },
  nieuw: { label: 'NIEUW', color: '#3B82F6' },
  'zoekt-leden': { label: 'ZOEKT LEDEN', color: '#F29E18' },
}

function TerminalDots({ color }: { color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#EF4444' }} />
      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#22C55E' }} />
    </div>
  )
}

export default function CommissiesPage() {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <>
      <Navbar />
      <main
        className="min-h-screen pt-28 pb-20 px-6 md:px-12 lg:px-24 relative overflow-hidden"
        style={{ backgroundColor: 'var(--color-bg)' }}
      >
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(242, 158, 24, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(242, 158, 24, 0.03) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Ghost number */}
        <div
          className="absolute top-20 right-8 md:right-16 select-none pointer-events-none"
          style={{
            fontFamily: "'Big Shoulders Display', sans-serif",
            fontSize: 'clamp(120px, 20vw, 280px)',
            fontWeight: 900,
            color: 'rgba(242, 158, 24, 0.03)',
            lineHeight: 1,
          }}
        >
          07
        </div>

        <div className="relative z-10">
          {/* Header */}
          <div className="max-w-[1200px] mx-auto mb-12">
            <div className="flex items-center gap-4 mb-4">
              <span
                className="font-mono text-xs tracking-[0.3em] uppercase"
                style={{ color: '#F29E18' }}
              >
                // commissies
              </span>
              <span className="w-12 h-px" style={{ backgroundColor: '#F29E18' }} />
            </div>
            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-tight leading-[0.95] mb-3"
              style={{
                fontFamily: "'Big Shoulders Display', var(--font-geist-sans), sans-serif",
                color: 'var(--color-text)',
              }}
            >
              Onze <span style={{ color: '#F29E18' }}>Commissies</span>
            </h1>
            {/* Gold separator */}
            <div
              className="w-16 h-[2px] mb-4"
              style={{ backgroundColor: '#F29E18', opacity: 0.6 }}
            />
            <p
              className="font-mono text-sm md:text-base max-w-2xl leading-relaxed"
              style={{ color: '#A1A1AA' }}
            >
              SIT draait op commissies waar studenten hands-on ervaring opdoen.
              Geen ervaring nodig, gewoon motivatie. Kies een commissie en bouw mee.
            </p>
          </div>

          {/* Commissie Grid */}
          <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
            {COMMISSIES.map((c) => {
              const Icon = c.icon
              const isExpanded = expanded === c.slug
              const status = STATUS_LABELS[c.status]

              return (
                <div
                  key={c.slug}
                  className="relative transition-all duration-300"
                  style={{
                    backgroundColor: '#18181B',
                    border: `1px solid ${isExpanded ? c.color : '#27272A'}`,
                    borderRadius: '6px',
                    boxShadow: isExpanded
                      ? `0 0 24px color-mix(in srgb, ${c.color} 12%, transparent)`
                      : 'none',
                  }}
                >
                  {/* Card header — always visible */}
                  <button
                    onClick={() => setExpanded(isExpanded ? null : c.slug)}
                    className="w-full text-left p-5 cursor-pointer"
                  >
                    {/* Terminal dots + category label */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <TerminalDots color={c.color} />
                        <span
                          className="font-mono text-[10px] tracking-[0.15em]"
                          style={{ color: '#71717A' }}
                        >
                          // {c.slug}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {status && (
                          <span
                            className="font-mono text-[9px] px-2 py-0.5 tracking-[0.1em] uppercase"
                            style={{
                              color: status.color,
                              border: `1px solid color-mix(in srgb, ${status.color} 30%, transparent)`,
                              background: `color-mix(in srgb, ${status.color} 8%, transparent)`,
                              borderRadius: '3px',
                            }}
                          >
                            {status.label}
                          </span>
                        )}
                        {isExpanded ? (
                          <ChevronUp size={14} style={{ color: '#71717A' }} />
                        ) : (
                          <ChevronDown size={14} style={{ color: '#71717A' }} />
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: `color-mix(in srgb, ${c.color} 10%, transparent)`,
                          border: `1px solid color-mix(in srgb, ${c.color} 20%, transparent)`,
                          borderRadius: '6px',
                        }}
                      >
                        <Icon size={18} style={{ color: c.color }} />
                      </div>
                      <div className="min-w-0">
                        <h2
                          className="text-lg font-bold uppercase tracking-wide"
                          style={{
                            fontFamily: "'Big Shoulders Display', var(--font-geist-sans), sans-serif",
                            color: '#FAFAFA',
                          }}
                        >
                          {c.naam}
                        </h2>
                        <p
                          className="font-mono text-xs mt-1 line-clamp-2 leading-relaxed"
                          style={{ color: '#A1A1AA' }}
                        >
                          {c.beschrijving}
                        </p>
                      </div>
                    </div>

                    {/* Member count badge */}
                    <div className="flex items-center gap-2 mt-3">
                      <Users size={11} style={{ color: '#71717A' }} />
                      <span className="font-mono text-[10px]" style={{ color: '#71717A' }}>
                        {c.leden.length} {c.leden.length === 1 ? 'lid' : 'leden'}
                        {c.voorzitter && ` — voorzitter: ${c.voorzitter}`}
                      </span>
                    </div>
                  </button>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div
                      className="px-5 pb-5 space-y-4"
                      style={{ borderTop: '1px dashed #27272A' }}
                    >
                      {/* Mission */}
                      <div className="pt-4">
                        <p
                          className="font-mono text-[10px] tracking-[0.2em] uppercase mb-2"
                          style={{ color: c.color }}
                        >
                          {'>'} missie
                        </p>
                        <p
                          className="font-mono text-sm leading-relaxed"
                          style={{
                            color: '#D4D4D8',
                            borderLeft: `2px solid color-mix(in srgb, ${c.color} 40%, transparent)`,
                            paddingLeft: '12px',
                          }}
                        >
                          &quot;{c.missie}&quot;
                        </p>
                      </div>

                      {/* Activities */}
                      <div>
                        <p
                          className="font-mono text-[10px] tracking-[0.2em] uppercase mb-2"
                          style={{ color: c.color }}
                        >
                          {'>'} activiteiten
                        </p>
                        <ul className="space-y-1.5">
                          {c.activiteiten.map((a) => (
                            <li key={a} className="flex items-start gap-2">
                              <span
                                className="font-mono text-xs mt-0.5"
                                style={{ color: c.color }}
                              >
                                $
                              </span>
                              <span
                                className="font-mono text-xs leading-relaxed"
                                style={{ color: '#D4D4D8' }}
                              >
                                {a}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Members */}
                      <div>
                        <p
                          className="font-mono text-[10px] tracking-[0.2em] uppercase mb-2"
                          style={{ color: c.color }}
                        >
                          {'>'} team
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {c.voorzitter && (
                            <span
                              className="flex items-center gap-1.5 font-mono text-xs px-2.5 py-1"
                              style={{
                                color: c.color,
                                border: `1px solid color-mix(in srgb, ${c.color} 30%, transparent)`,
                                background: `color-mix(in srgb, ${c.color} 8%, transparent)`,
                                borderRadius: '4px',
                              }}
                            >
                              <Star size={10} fill="currentColor" />
                              {c.voorzitter}
                            </span>
                          )}
                          {c.leden
                            .filter((l) => l !== c.voorzitter)
                            .map((lid) => (
                              <span
                                key={lid}
                                className="font-mono text-xs px-2.5 py-1"
                                style={{
                                  color: '#D4D4D8',
                                  border: '1px solid #27272A',
                                  background: '#09090B',
                                  borderRadius: '4px',
                                }}
                              >
                                {lid}
                              </span>
                            ))}
                          {c.leden.length === 0 && !c.voorzitter && (
                            <span className="font-mono text-xs" style={{ color: '#71717A' }}>
                              Nog geen leden — meld je aan!
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* CTA */}
          <div className="max-w-[1200px] mx-auto text-center mt-20">
            {/* Code block CTA */}
            <div
              className="inline-block text-left mb-8 w-full max-w-lg"
              style={{
                backgroundColor: '#18181B',
                border: '1px solid #27272A',
                borderRadius: '6px',
                overflow: 'hidden',
              }}
            >
              {/* Code block header */}
              <div
                className="flex items-center gap-3 px-4 py-2.5"
                style={{ borderBottom: '1px solid #27272A' }}
              >
                <TerminalDots color="#F29E18" />
                <span className="font-mono text-[10px]" style={{ color: '#71717A' }}>
                  aanmelden.sh
                </span>
              </div>
              <div className="p-4">
                <p className="font-mono text-sm mb-1" style={{ color: '#71717A' }}>
                  # Wil je meedoen?
                </p>
                <p className="font-mono text-sm mb-1" style={{ color: '#D4D4D8' }}>
                  <span style={{ color: '#22C55E' }}>echo</span>{' '}
                  <span style={{ color: '#F29E18' }}>&quot;Geen ervaring nodig, alleen motivatie&quot;</span>
                </p>
                <p className="font-mono text-sm" style={{ color: '#D4D4D8' }}>
                  <span style={{ color: '#22C55E' }}>open</span>{' '}
                  <span style={{ color: '#3B82F6' }}>aanmeldformulier</span>
                </p>
              </div>
            </div>

            <div>
              <a
                href="https://forms.office.com/Pages/ResponsePage.aspx?id=HrsHCfwhb0eIQwLQnOtZp5Gb5Qz7gPZNhhsylBIlKC9UN01YN1EzTEFBMVFaRkhNSVdOU1pDRVpRNC4u"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-8 py-3.5 font-mono font-bold text-sm tracking-wide transition-all hover:scale-[1.03]"
                style={{
                  backgroundColor: '#F29E18',
                  color: '#09090B',
                  borderRadius: '6px',
                }}
              >
                MELD JE AAN
              </a>
              <p className="font-mono text-xs mt-4" style={{ color: '#71717A' }}>
                Of mail naar{' '}
                <a
                  href="mailto:bestuur@svsit.nl"
                  className="transition-colors hover:underline"
                  style={{ color: '#A1A1AA' }}
                >
                  bestuur@svsit.nl
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
