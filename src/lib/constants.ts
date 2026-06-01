import type { Role, StatCategory } from '@/types/database'

/** Lightweight commissie option used in registration forms and admin filters */
export interface CommissieOption {
  id: string
  naam: string
  beschrijving: string
}

/** @deprecated Use CommissieOption instead */
export type Commissie = CommissieOption

export const COMMISSIES: CommissieOption[] = [
  { id: 'servo', naam: 'ServCo', beschrijving: 'Server beheer, svsit.nl, technische projecten' },
  { id: 'community', naam: 'Community', beschrijving: 'Socials, peilingen, onboarding, leden activeren' },
  { id: 'educo', naam: 'Educatie (EduCo)', beschrijving: 'Workshops, lezingen, en skill development' },
  { id: 'events', naam: 'Evenementen', beschrijving: 'Borrels, feesten, uitjes, en grote events organiseren' },
  { id: 'ai4hva', naam: 'AI4HvA', beschrijving: 'AI workshops, hackathons, en de AI community' },
  { id: 'gameit', naam: 'GameIT', beschrijving: 'Game nights, toernooien, en game dev showcases' },
  { id: 'sponsoring', naam: 'Sponsoring', beschrijving: 'Bedrijven benaderen, partnerships opzetten' },
]

export const ROLLEN: Record<Role, { naam: string; beschrijving: string }> = {
  member: { naam: 'Member', beschrijving: 'Gewoon lid, toegang tot events en community' },
  contributor: { naam: 'Contributor', beschrijving: 'Actief commissielid, bouwt mee aan SIT' },
  mentor: { naam: 'Mentor', beschrijving: 'Docent/begeleider, support rol' },
  bestuur: { naam: 'Bestuur', beschrijving: 'Bestuurslid van SIT' },
}

export const ADMIN_EMAILS = [
  'matin.khajehfard@hva.nl',
  'voorzitter@svsit.nl',
]

// ---------------------------------------------------------------------------
// Site config — single source of truth for contact, socials, stats, prijs,
// en introweek-datum. Importeer overal i.p.v. hardcoden.
// ---------------------------------------------------------------------------

export const SITE_CONFIG = {
  domain: 'svsit.nl',
  url: 'https://svsit.nl',
  email: 'bestuur@svsit.nl',
  sponsoringEmail: 'sponsoring@svsit.nl',
  fromEmail: 'SIT <matin.khajehfard@svsit.nl>',
  address: {
    venue: 'Wibauthuis',
    street: 'Wibautstraat 3b',
    postal: '1091 GH Amsterdam',
    floor: '5e verdieping',
  },
  socials: {
    instagram: { url: 'https://www.instagram.com/sv.sit', handle: '@sv.sit' },
    tiktok: { url: 'https://www.tiktok.com/@sit_hva', handle: '@sit_hva' },
    discord: { url: 'https://discord.gg/68QjRVRRUM' },
    whatsapp: { url: 'https://chat.whatsapp.com/LCndNz4xGZW0tqXWkNabaL' },
    linkedin: { url: 'https://linkedin.com/company/svsit-hbo-ict' },
  },
  stats: {
    members: '100+',
    students: '200+',
    events: '50+',
    commissies: COMMISSIES.length,
  },
  membership: {
    price: '9,99',
    priceLabel: '€9,99',
    pricePerYear: '€9,99/jaar',
  },
  introweek: {
    year: 2026,
    startIso: '2026-08-31T13:00:00+02:00',
  },
} as const

// ---------------------------------------------------------------------------
// Stat categories
// ---------------------------------------------------------------------------

export interface StatCategoryDef {
  id: StatCategory
  naam: string
  kleur: string
}

export const STAT_CATEGORIES: StatCategoryDef[] = [
  { id: 'code',   naam: 'Code',    kleur: '#22C55E' },
  { id: 'social', naam: 'Social',  kleur: '#F29E18' },
  { id: 'career', naam: 'Career',  kleur: '#3B82F6' },
  { id: 'game',   naam: 'Game',    kleur: '#EF4444' },
]

// ---------------------------------------------------------------------------
// NOTE: Import LEVELS/getLevelForXp/etc. directly from '@/lib/levelEngine'.
//       Import BADGE_DEFS directly from '@/lib/badgeDefs' (client-safe) or
//       '@/lib/badgeEngine' (server-only).
// ---------------------------------------------------------------------------
