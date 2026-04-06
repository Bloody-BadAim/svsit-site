import type { Role, StatCategory } from '@/types/database'

export interface Commissie {
  id: string
  naam: string
  beschrijving: string
}

export const COMMISSIES: Commissie[] = [
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

export const LIDMAATSCHAP_PRIJS = 10 // euro per jaar

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
// V2: re-export from engines for backward compatibility
// NOTE: BADGE_DEFS is NOT re-exported here — badgeEngine imports supabase (server-only).
//       Import BADGE_DEFS directly from '@/lib/badgeEngine' in server components/routes only.
// ---------------------------------------------------------------------------
export { LEVELS, getLevelForXp, getLevelProgress, getBadgeSlotCount } from '@/lib/levelEngine'
export { RARITY_CONFIG } from '@/types/gamification'
