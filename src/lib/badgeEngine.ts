import { createServiceClient } from '@/lib/supabase'
import { getBadgeSlotCount } from '@/lib/levelEngine'
import type { BadgeDef, BadgeRarity } from '@/types/gamification'
// Re-export so server-side code can import BADGE_DEFS from either location
export { BADGE_DEFS } from '@/lib/badgeDefs'
import { BADGE_DEFS, getBadgeDef } from '@/lib/badgeDefs'

export function getBadgesByRarity(rarity: BadgeRarity): BadgeDef[] {
  return BADGE_DEFS.filter((b) => b.rarity === rarity)
}

export function getMaxEquippableSlots(level: number): number {
  return getBadgeSlotCount(level)
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
