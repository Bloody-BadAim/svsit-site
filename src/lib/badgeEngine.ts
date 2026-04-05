import { createServiceClient } from '@/lib/supabase'
import { getBadgeSlotCount } from '@/lib/levelEngine'
import { RARITY_CONFIG } from '@/types/gamification'
import type { BadgeDef, BadgeRarity, MemberBadge } from '@/types/gamification'

export const BADGE_DEFS: BadgeDef[] = [
  // Common
  { id: 'badge_joined',           name: 'Welkom bij SIT',      description: 'Lid geworden van SIT',                         rarity: 'common',    xpBonus: 10,  icon: 'badge_joined',           category: 'achievement', autoGrantRule: null },
  { id: 'badge_first_event',      name: 'First Blood',         description: 'Je eerste SIT event bijgewoond',                rarity: 'common',    xpBonus: 10,  icon: 'badge_first_event',      category: 'achievement', autoGrantRule: { type: 'scan_count', count: 1 } },
  { id: 'badge_first_purchase',   name: 'First Buy',           description: 'Eerste aankoop in de shop',                     rarity: 'common',    xpBonus: 10,  icon: 'badge_first_purchase',   category: 'achievement', autoGrantRule: { type: 'first_purchase' } },
  { id: 'badge_profile_complete', name: 'Volledig Profiel',    description: 'Alle profielvelden ingevuld',                   rarity: 'common',    xpBonus: 10,  icon: 'badge_profile_complete', category: 'achievement', autoGrantRule: { type: 'profile_complete' } },
  // Uncommon
  { id: 'badge_borrel_5',         name: 'Borrel Veteran',      description: '5 borrels bijgewoond',                          rarity: 'uncommon',  xpBonus: 25,  icon: 'badge_borrel_5',         category: 'achievement', autoGrantRule: { type: 'borrel_count', count: 5 } },
  { id: 'badge_streak_3',         name: 'On a Roll',           description: '3 events in 30 dagen',                          rarity: 'uncommon',  xpBonus: 25,  icon: 'badge_streak_3',         category: 'achievement', autoGrantRule: { type: 'streak', events: 3, days: 30 } },
  { id: 'badge_helper',           name: 'Event Helper',        description: 'Geholpen bij het organiseren van een event',     rarity: 'uncommon',  xpBonus: 25,  icon: 'badge_helper',           category: 'achievement', autoGrantRule: null },
  { id: 'badge_streak_7',         name: 'Unstoppable',         description: '7 events in 60 dagen',                          rarity: 'uncommon',  xpBonus: 25,  icon: 'badge_streak_7',         category: 'achievement', autoGrantRule: { type: 'streak_extended', events: 7, days: 60 } },
  { id: 'badge_night_owl',        name: 'Night Owl',           description: 'Check-in na 22:00',                             rarity: 'uncommon',  xpBonus: 25,  icon: 'badge_night_owl',        category: 'achievement', autoGrantRule: null },
  // Rare
  { id: 'badge_borrel_10',        name: 'Borrel Legend',       description: '10 borrels bijgewoond',                         rarity: 'rare',      xpBonus: 50,  icon: 'badge_borrel_10',        category: 'achievement', autoGrantRule: { type: 'borrel_count', count: 10 } },
  { id: 'badge_allrounder',       name: 'All-Rounder',         description: 'Punten in alle 4 categorien',                   rarity: 'rare',      xpBonus: 50,  icon: 'badge_allrounder',       category: 'achievement', autoGrantRule: { type: 'all_categories' } },
  { id: 'badge_bestuur',          name: 'Bestuurslid',         description: 'Actief bestuurslid van SIT',                    rarity: 'rare',      xpBonus: 50,  icon: 'badge_bestuur',          category: 'achievement', autoGrantRule: null },
  { id: 'badge_mentor',           name: 'Mentor',              description: '3 eerstejaars geholpen',                        rarity: 'rare',      xpBonus: 50,  icon: 'badge_mentor',           category: 'achievement', autoGrantRule: null },
  { id: 'badge_double_xp_day',    name: 'XP Machine',          description: '100+ XP in 1 dag',                              rarity: 'rare',      xpBonus: 50,  icon: 'badge_double_xp_day',    category: 'achievement', autoGrantRule: { type: 'xp_in_day', amount: 100 } },
  // Epic
  { id: 'badge_hackathon',        name: 'Hackathon Survivor',  description: 'Een hackathon meegedaan',                       rarity: 'epic',      xpBonus: 100, icon: 'badge_hackathon',        category: 'achievement', autoGrantRule: null },
  { id: 'badge_og_member',        name: 'OG Member',           description: 'Bij de heroprichting van SIT erbij geweest',    rarity: 'epic',      xpBonus: 100, icon: 'badge_og_member',        category: 'achievement', autoGrantRule: null },
  { id: 'badge_fullstack',        name: 'Full Stack Dev',      description: 'Full Stack Development track afgerond',          rarity: 'epic',      xpBonus: 100, icon: 'badge_fullstack',        category: 'track',       autoGrantRule: null },
  { id: 'badge_ai_engineer',      name: 'AI Engineer',         description: 'AI Engineer track afgerond',                    rarity: 'epic',      xpBonus: 100, icon: 'badge_ai_engineer',      category: 'track',       autoGrantRule: null },
  { id: 'badge_security',         name: 'Security Specialist', description: 'Security track afgerond',                       rarity: 'epic',      xpBonus: 100, icon: 'badge_security',         category: 'track',       autoGrantRule: null },
  { id: 'badge_boss_slayer',      name: 'Boss Slayer',         description: '3 boss fights gewonnen',                        rarity: 'epic',      xpBonus: 100, icon: 'badge_boss_slayer',      category: 'achievement', autoGrantRule: { type: 'boss_kills', count: 3 } },
  { id: 'badge_max_category',     name: 'Specialist',          description: '500+ XP in 1 categorie',                        rarity: 'epic',      xpBonus: 100, icon: 'badge_max_category',     category: 'achievement', autoGrantRule: null },
  { id: 'badge_hacker',           name: 'Hacker',              description: 'sudo rm -rf / in de verborgen terminal',        rarity: 'epic',      xpBonus: 100, icon: 'badge_hacker',           category: 'easter_egg',  autoGrantRule: null },
  // Legendary
  { id: 'badge_party_animal',     name: 'Feestbeest',          description: 'Feestbeest track afgerond',                     rarity: 'legendary', xpBonus: 250, icon: 'badge_party_animal',     category: 'track',       autoGrantRule: null },
  { id: 'badge_community_builder',name: 'Community Builder',   description: 'Community Builder track afgerond',               rarity: 'legendary', xpBonus: 250, icon: 'badge_community_builder', category: 'track',      autoGrantRule: null },
  { id: 'badge_completionist',    name: 'Completionist',       description: 'Alle common-epic badges verzameld',             rarity: 'legendary', xpBonus: 250, icon: 'badge_completionist',    category: 'achievement', autoGrantRule: { type: 'all_badges_up_to', maxRarity: 'epic' } },
  { id: 'badge_bdfl_witness',     name: 'Witness',             description: 'Online toen iemand BDFL werd',                  rarity: 'legendary', xpBonus: 250, icon: 'badge_bdfl_witness',     category: 'achievement', autoGrantRule: null },
  { id: 'badge_404',              name: '404',                 description: 'De site bezocht om 4:04 AM',                    rarity: 'legendary', xpBonus: 250, icon: 'badge_404',              category: 'easter_egg',  autoGrantRule: null },
  { id: 'badge_no_life',          name: 'No Life',             description: 'Alle events van een maand bijgewoond',          rarity: 'legendary', xpBonus: 250, icon: 'badge_no_life',          category: 'achievement', autoGrantRule: null },
  // Mythic
  { id: 'badge_konami',           name: 'Konami Code',         description: 'De geheime code gevonden',                      rarity: 'mythic',    xpBonus: 500, icon: 'badge_konami',           category: 'easter_egg',  autoGrantRule: null },
  { id: 'badge_first_bdfl',       name: 'First BDFL',          description: 'De allereerste BDFL van SIT',                   rarity: 'mythic',    xpBonus: 500, icon: 'badge_first_bdfl',       category: 'achievement', autoGrantRule: null },
  { id: 'badge_founder_xi',       name: 'Founder XI',          description: 'Bestuur XI founding member',                    rarity: 'mythic',    xpBonus: 500, icon: 'badge_founder_xi',       category: 'achievement', autoGrantRule: null },
]

export function getBadgesByRarity(rarity: BadgeRarity): BadgeDef[] {
  return BADGE_DEFS.filter((b) => b.rarity === rarity)
}

export function getBadgeDef(badgeId: string): BadgeDef | undefined {
  return BADGE_DEFS.find((b) => b.id === badgeId)
}

export function getMaxEquippableSlots(level: number): number {
  return getBadgeSlotCount(level)
}

export function getRarityColor(rarity: BadgeRarity): string {
  return RARITY_CONFIG[rarity].color
}

export async function grantBadge(memberId: string, badgeId: string): Promise<boolean> {
  const supabase = createServiceClient()
  const badge = getBadgeDef(badgeId)
  if (!badge) return false

  const { error } = await supabase
    .from('member_badges')
    .upsert(
      { member_id: memberId, badge_id: badgeId },
      { onConflict: 'member_id,badge_id' }
    )

  if (error) return false

  // Grant XP bonus for earning the badge
  if (badge.xpBonus > 0) {
    const { grantXp } = await import('@/lib/xpEngine')
    await grantXp({
      memberId,
      amount: badge.xpBonus,
      source: 'badge_unlock',
      sourceId: badgeId,
    })
  }

  return true
}

export async function getEquippedBadges(memberId: string): Promise<MemberBadge[]> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('member_badges')
    .select('*')
    .eq('member_id', memberId)
    .eq('equipped', true)
    .order('equipped_slot', { ascending: true })

  return (data ?? []).map((row) => ({
    id: row.id as string,
    memberId: row.member_id as string,
    badgeId: row.badge_id as string,
    equipped: row.equipped as boolean,
    equippedSlot: row.equipped_slot as number | null,
    earnedAt: row.earned_at as string,
  }))
}

export async function equipBadge(memberId: string, badgeId: string, slot: number, maxSlots: number): Promise<boolean> {
  if (slot < 1 || slot > maxSlots) return false

  const supabase = createServiceClient()

  // Unequip anything in this slot
  await supabase
    .from('member_badges')
    .update({ equipped: false, equipped_slot: null })
    .eq('member_id', memberId)
    .eq('equipped_slot', slot)

  // Equip the badge
  const { error } = await supabase
    .from('member_badges')
    .update({ equipped: true, equipped_slot: slot })
    .eq('member_id', memberId)
    .eq('badge_id', badgeId)

  return !error
}

export async function unequipBadge(memberId: string, badgeId: string): Promise<boolean> {
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('member_badges')
    .update({ equipped: false, equipped_slot: null })
    .eq('member_id', memberId)
    .eq('badge_id', badgeId)

  return !error
}
