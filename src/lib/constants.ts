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
  { id: 'gameit', naam: 'GameIT', beschrijving: 'Game nights, toernooien, en game dev showcases' },
  { id: 'ai4hva', naam: 'AI4HvA', beschrijving: 'AI workshops, hackathons, en de AI community' },
  { id: 'pr-socials', naam: 'PR & Socials', beschrijving: 'Content maken, socials beheren, SIT zichtbaar maken' },
  { id: 'fun-events', naam: 'Fun & Events', beschrijving: 'Borrels, kroegentochten, en grote events organiseren' },
  { id: 'educatie', naam: 'Educatie', beschrijving: 'Workshops, lezingen, en skill development' },
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
// Stat categories
// ---------------------------------------------------------------------------

export interface StatCategoryDef {
  id: StatCategory
  naam: string
  kleur: string
}

export const STAT_CATEGORIES: StatCategoryDef[] = [
  { id: 'code',   naam: 'Code',    kleur: '#22C55E' },
  { id: 'social', naam: 'Sociaal', kleur: '#F29E18' },
  { id: 'learn',  naam: 'Leren',   kleur: '#3B82F6' },
  { id: 'impact', naam: 'Impact',  kleur: '#EF4444' },
]

// ---------------------------------------------------------------------------
// NOTE: Import LEVELS/getLevelForXp/etc. directly from '@/lib/levelEngine'.
//       Import BADGE_DEFS directly from '@/lib/badgeDefs' (client-safe) or
//       '@/lib/badgeEngine' (server-only).
// ---------------------------------------------------------------------------
