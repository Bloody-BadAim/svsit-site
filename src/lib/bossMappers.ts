import type { BossFight } from '@/types/gamification'

/** Map a snake_case boss_fights row to a camelCase BossFight object. */
export function mapBossRow(row: Record<string, unknown>): BossFight {
  return {
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string) ?? '',
    hp: (row.hp as number) ?? 0,
    currentHp: (row.current_hp as number) ?? 0,
    artworkUrl: (row.artwork_url as string | null) ?? null,
    status: row.status as BossFight['status'],
    announcedAt: (row.announced_at as string | null) ?? null,
    startsAt: row.starts_at as string,
    deadline: row.deadline as string,
    baseRewardXp: (row.base_reward_xp as number) ?? 0,
    baseRewardBadgeId: (row.base_reward_badge_id as string | null) ?? null,
    topRewardAccessoryId: (row.top_reward_accessory_id as string | null) ?? null,
    createdAt: row.created_at as string,
  }
}
