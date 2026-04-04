import type { Role, StatCategory } from '@/types/database'

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
  bestuur: { naam: 'Bestuur', beschrijving: 'Bestuurslid van SIT' },
}

export interface Rank {
  naam: string
  minPunten: number
  kleur: string
}

// XP thresholds — realistisch voor een studiejaar
// ~2 XP per event, ~20 events per jaar = ~40 XP actief lid
export const RANKS: Rank[] = [
  { naam: 'Starter', minPunten: 0, kleur: '#6B7280' },
  { naam: 'Bronze', minPunten: 10, kleur: '#CD7F32' },
  { naam: 'Silver', minPunten: 25, kleur: '#C0C0C0' },
  { naam: 'Gold', minPunten: 50, kleur: '#F29E18' },
  { naam: 'Platinum', minPunten: 100, kleur: '#E5E4E2' },
  { naam: 'Diamond', minPunten: 200, kleur: '#3B82F6' },
]

// Prestige systeem: na Diamond blijf je XP verdienen
// Level = floor(XP / 10) + 1, oneindig door
// Prestige = floor(XP / 200) — elke 200 XP is een prestige cycle
export function getLevel(punten: number): number {
  return Math.floor(punten / 10) + 1
}

export function getPrestige(punten: number): number {
  return Math.floor(punten / 200)
}

export function getLevelProgress(punten: number): { current: number; max: number; percent: number } {
  const xpInLevel = punten % 10
  return { current: xpInLevel, max: 10, percent: (xpInLevel / 10) * 100 }
}

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

// ---------------------------------------------------------------------------
// Badge definitions
// ---------------------------------------------------------------------------

export interface BadgeDef {
  id: string
  naam: string
  beschrijving: string
  category: 'achievement' | 'track'
  auto: boolean
}

export const BADGES: BadgeDef[] = [
  // --- achievement badges ---
  {
    id: 'badge_joined',
    naam: 'Welkom bij SIT',
    beschrijving: 'Lid geworden van SIT',
    category: 'achievement',
    auto: true,
  },
  {
    id: 'badge_first_event',
    naam: 'First Blood',
    beschrijving: 'Je eerste SIT event bijgewoond',
    category: 'achievement',
    auto: true,
  },
  {
    id: 'badge_hackathon',
    naam: 'Hackathon Survivor',
    beschrijving: 'Een hackathon meegedaan',
    category: 'achievement',
    auto: false,
  },
  {
    id: 'badge_borrel_5',
    naam: 'Borrel Veteran',
    beschrijving: '5 borrels bijgewoond',
    category: 'achievement',
    auto: true,
  },
  {
    id: 'badge_borrel_10',
    naam: 'Borrel Legend',
    beschrijving: '10 borrels bijgewoond',
    category: 'achievement',
    auto: true,
  },
  {
    id: 'badge_helper',
    naam: 'Event Helper',
    beschrijving: 'Geholpen bij het organiseren van een event',
    category: 'achievement',
    auto: false,
  },
  {
    id: 'badge_og_member',
    naam: 'OG Member',
    beschrijving: 'Bij de heroprichting van SIT erbij geweest',
    category: 'achievement',
    auto: false,
  },
  {
    id: 'badge_bestuur',
    naam: 'Bestuurslid',
    beschrijving: 'Actief bestuurslid van SIT',
    category: 'achievement',
    auto: false,
  },
  {
    id: 'badge_streak_3',
    naam: 'On a Roll',
    beschrijving: '3 events op rij bijgewoond',
    category: 'achievement',
    auto: true,
  },
  {
    id: 'badge_allrounder',
    naam: 'All-Rounder',
    beschrijving: 'Punten verdiend in alle 4 categorieën',
    category: 'achievement',
    auto: true,
  },
  // --- track completion badges ---
  {
    id: 'badge_fullstack',
    naam: 'Full Stack Dev',
    beschrijving: 'Full Stack Development track afgerond',
    category: 'track',
    auto: true,
  },
  {
    id: 'badge_ai_engineer',
    naam: 'AI Engineer',
    beschrijving: 'AI Engineer track afgerond',
    category: 'track',
    auto: true,
  },
  {
    id: 'badge_security',
    naam: 'Security Specialist',
    beschrijving: 'Security track afgerond',
    category: 'track',
    auto: true,
  },
  {
    id: 'badge_party_animal',
    naam: 'Feestbeest',
    beschrijving: 'Feestbeest track afgerond',
    category: 'track',
    auto: true,
  },
  {
    id: 'badge_community_builder',
    naam: 'Community Builder',
    beschrijving: 'Community Builder track afgerond',
    category: 'track',
    auto: true,
  },
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
  { id: 'code',   naam: 'Code',    kleur: '#3B82F6' },
  { id: 'social', naam: 'Sociaal', kleur: '#F29E18' },
  { id: 'learn',  naam: 'Leren',   kleur: '#22C55E' },
  { id: 'impact', naam: 'Impact',  kleur: '#EF4444' },
]

// ---------------------------------------------------------------------------
// Badge slot count per rank
// ---------------------------------------------------------------------------

export function getBadgeSlotCount(rankNaam: string): number {
  const slots: Record<string, number> = {
    Starter:  1,
    Bronze:   2,
    Silver:   3,
    Gold:     4,
    Platinum: 5,
    Diamond:  6,
  }
  return slots[rankNaam] ?? 1
}
