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
  FileText,
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
    color: '#F59E0B',
    icon: Calendar,
    voorzitter: 'Thijmen',
    beschrijving:
      'Gefocust op leuke activiteiten: feestjes, uitjes, sport, en gaming events. Van kroegentochten tot Thuishaven — alles wat SIT sociaal maakt.',
    missie:
      'Zorgen dat SIT-leden elkaar ontmoeten buiten de collegebanken, met events die passen bij wat studenten willen.',
    activiteiten: [
      'Borrels en kroegentochten',
      'Feesten (Thuishaven, zomerfeest)',
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
    color: '#F59E0B',
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
  {
    slug: 'witboeken',
    naam: 'Witboeken',
    color: '#71717A',
    icon: FileText,
    voorzitter: null,
    beschrijving:
      'Verantwoordelijk voor het opstellen en onderhouden van witboeken — de beleidsdocumenten die de werkwijze van elke commissie vastleggen. Flexibel aanpasbaar, in tegenstelling tot statuten.',
    missie:
      'Zorgen dat kennis en werkwijzen vastgelegd worden zodat toekomstige besturen en commissies niet vanaf nul hoeven te beginnen.',
    activiteiten: [
      'Witboeken schrijven en bijhouden',
      'Beleidsdocumenten per commissie',
      'Kennis overdracht waarborgen',
      'Werkprocessen documenteren',
    ],
    leden: [],
    status: 'nieuw',
  },
]

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  actief: { label: 'ACTIEF', color: '#22C55E' },
  nieuw: { label: 'NIEUW', color: '#3B82F6' },
  'zoekt-leden': { label: 'ZOEKT LEDEN', color: '#F59E0B' },
}

export default function CommissiesPage() {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <>
      <Navbar />
      <main
        className="min-h-screen pt-28 pb-20 px-6 md:px-12 lg:px-24"
        style={{ backgroundColor: 'var(--color-bg)' }}
      >
        {/* Header */}
        <div className="max-w-[1200px] mx-auto mb-12">
          <div className="flex items-center gap-4 mb-4">
            <span className="font-mono text-xs tracking-[0.3em] uppercase" style={{ color: 'var(--color-accent-gold)' }}>
              06
            </span>
            <span className="w-12 h-px" style={{ backgroundColor: 'var(--color-accent-gold)' }} />
          </div>
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-tight leading-[0.95] mb-4"
            style={{ fontFamily: "'Big Shoulders Display', var(--font-geist-sans), sans-serif", color: 'var(--color-text)' }}
          >
            Onze <span style={{ color: 'var(--color-accent-gold)' }}>Commissies</span>
          </h1>
          <p className="font-mono text-sm md:text-base max-w-2xl leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
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
                className="relative border transition-all duration-300"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: isExpanded ? c.color : 'var(--color-border)',
                  boxShadow: isExpanded
                    ? `0 0 20px color-mix(in srgb, ${c.color} 15%, transparent)`
                    : 'none',
                }}
              >
                {/* Color accent top bar */}
                <div
                  className="h-[2px]"
                  style={{ backgroundColor: c.color, opacity: isExpanded ? 0.8 : 0.4 }}
                />

                {/* Card header — always visible */}
                <button
                  onClick={() => setExpanded(isExpanded ? null : c.slug)}
                  className="w-full text-left p-5 cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className="w-10 h-10 flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: `color-mix(in srgb, ${c.color} 10%, transparent)`,
                          border: `1px solid color-mix(in srgb, ${c.color} 25%, transparent)`,
                        }}
                      >
                        <Icon size={18} style={{ color: c.color }} />
                      </div>
                      <div className="min-w-0">
                        <h2
                          className="font-display text-lg font-bold uppercase tracking-wide"
                          style={{ color: c.color, fontFamily: "'Big Shoulders Display', var(--font-geist-sans), sans-serif" }}
                        >
                          {c.naam}
                        </h2>
                        <p className="font-mono text-xs mt-1 line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>
                          {c.beschrijving}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {status && (
                        <span
                          className="hidden sm:inline font-mono text-[9px] px-2 py-0.5 tracking-[0.1em] uppercase"
                          style={{
                            color: status.color,
                            border: `1px solid color-mix(in srgb, ${status.color} 30%, transparent)`,
                            background: `color-mix(in srgb, ${status.color} 5%, transparent)`,
                          }}
                        >
                          {status.label}
                        </span>
                      )}
                      {isExpanded ? (
                        <ChevronUp size={16} style={{ color: 'var(--color-text-muted)' }} />
                      ) : (
                        <ChevronDown size={16} style={{ color: 'var(--color-text-muted)' }} />
                      )}
                    </div>
                  </div>
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="px-5 pb-5 space-y-4" style={{ borderTop: '1px dashed var(--color-border)' }}>
                    {/* Mission */}
                    <div className="pt-4">
                      <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-2" style={{ color: 'var(--color-text-muted)' }}>
                        Missie
                      </p>
                      <p className="font-mono text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>
                        &quot;{c.missie}&quot;
                      </p>
                    </div>

                    {/* Activities */}
                    <div>
                      <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-2" style={{ color: 'var(--color-text-muted)' }}>
                        Activiteiten
                      </p>
                      <ul className="space-y-1">
                        {c.activiteiten.map((a) => (
                          <li key={a} className="flex items-start gap-2">
                            <span className="font-mono text-xs mt-0.5" style={{ color: c.color }}>{'>'}</span>
                            <span className="font-mono text-xs" style={{ color: 'var(--color-text)' }}>{a}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Members */}
                    <div>
                      <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-2" style={{ color: 'var(--color-text-muted)' }}>
                        Team
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {c.voorzitter && (
                          <span
                            className="flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 border"
                            style={{
                              color: c.color,
                              borderColor: `color-mix(in srgb, ${c.color} 30%, transparent)`,
                              background: `color-mix(in srgb, ${c.color} 5%, transparent)`,
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
                              className="font-mono text-xs px-2.5 py-1 border"
                              style={{
                                color: 'var(--color-text)',
                                borderColor: 'var(--color-border)',
                                background: 'var(--color-bg)',
                              }}
                            >
                              {lid}
                            </span>
                          ))}
                        {c.leden.length === 0 && !c.voorzitter && (
                          <span className="font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>
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
        <div className="max-w-[1200px] mx-auto text-center mt-16">
          <h2
            className="text-2xl md:text-3xl font-bold uppercase tracking-tight mb-4"
            style={{ fontFamily: "'Big Shoulders Display', var(--font-geist-sans), sans-serif", color: 'var(--color-text)' }}
          >
            Wil je meedoen?
          </h2>
          <p className="font-mono text-sm mb-8 max-w-md mx-auto" style={{ color: 'var(--color-text-muted)' }}>
            Alle commissies zoeken nieuwe leden. Geen ervaring nodig, alleen motivatie.
          </p>
          <a
            href="https://forms.office.com/Pages/ResponsePage.aspx?id=HrsHCfwhb0eIQwLQnOtZp5Gb5Qz7gPZNhhsylBIlKC9UN01YN1EzTEFBMVFaRkhNSVdOU1pDRVpRNC4u"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-4 font-mono font-bold text-base tracking-wide transition-transform hover:scale-[1.03]"
            style={{
              backgroundColor: 'var(--color-accent-gold)',
              color: 'var(--color-bg)',
            }}
          >
            MELD JE AAN
          </a>
          <p className="font-mono text-xs mt-4" style={{ color: 'var(--color-text-muted)' }}>
            Of stuur een mail naar{' '}
            <a
              href="mailto:bestuur@svsit.nl"
              className="transition-colors"
              style={{ color: 'var(--color-text-muted)' }}
            >
              bestuur@svsit.nl
            </a>
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
