import type { Role } from '@/types/database'

export interface Commissie {
  id: string
  naam: string
  beschrijving: string
  emoji: string
}

export const COMMISSIES: Commissie[] = [
  { id: 'gameit', naam: 'GameIT', beschrijving: 'Game nights, toernooien, en game dev showcases', emoji: '🎮' },
  { id: 'ai4hva', naam: 'AI4HvA', beschrijving: 'AI workshops, hackathons, en de AI community', emoji: '🤖' },
  { id: 'pr-socials', naam: 'PR & Socials', beschrijving: 'Content maken, socials beheren, SIT zichtbaar maken', emoji: '📱' },
  { id: 'fun-events', naam: 'Fun & Events', beschrijving: 'Borrels, kroegentochten, en grote events organiseren', emoji: '🎉' },
  { id: 'educatie', naam: 'Educatie', beschrijving: 'Workshops, lezingen, en skill development', emoji: '📚' },
  { id: 'sponsoring', naam: 'Sponsoring', beschrijving: 'Bedrijven benaderen, partnerships opzetten', emoji: '🤝' },
]

export const ROLLEN: Record<Role, { naam: string; beschrijving: string }> = {
  member: { naam: 'Member', beschrijving: 'Gewoon lid, toegang tot events en community' },
  contributor: { naam: 'Contributor', beschrijving: 'Actief commissielid, bouwt mee aan SIT' },
  mentor: { naam: 'Mentor', beschrijving: 'Docent/begeleider, support rol' },
}

export interface Rank {
  naam: string
  minPunten: number
  kleur: string
}

export const RANKS: Rank[] = [
  { naam: 'Starter', minPunten: 0, kleur: '#6B7280' },
  { naam: 'Bronze', minPunten: 5, kleur: '#CD7F32' },
  { naam: 'Silver', minPunten: 10, kleur: '#C0C0C0' },
  { naam: 'Gold', minPunten: 15, kleur: '#F29E18' },
  { naam: 'Platinum', minPunten: 20, kleur: '#E5E4E2' },
  { naam: 'Diamond', minPunten: 25, kleur: '#3B82F6' },
]

export function getRank(punten: number): Rank {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (punten >= RANKS[i].minPunten) return RANKS[i]
  }
  return RANKS[0]
}

export const LIDMAATSCHAP_PRIJS = 10 // euro per jaar

export const ADMIN_EMAILS = [
  'matin.khajehfard@hva.nl',
  'voorzitter@svsit.nl',
]
