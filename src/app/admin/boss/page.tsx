import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase'
import BossManager from '@/components/admin/BossManager'
import type { BossFight } from '@/types/gamification'

function mapBossRow(row: Record<string, unknown>): BossFight {
  return {
    id:                   row.id as string,
    name:                 row.name as string,
    description:          (row.description as string) ?? '',
    hp:                   row.hp as number,
    currentHp:            row.current_hp as number,
    artworkUrl:           (row.artwork_url as string | null) ?? null,
    status:               row.status as BossFight['status'],
    announcedAt:          (row.announced_at as string | null) ?? null,
    startsAt:             row.starts_at as string,
    deadline:             row.deadline as string,
    baseRewardXp:         (row.base_reward_xp as number) ?? 0,
    baseRewardBadgeId:    (row.base_reward_badge_id as string | null) ?? null,
    topRewardAccessoryId: (row.top_reward_accessory_id as string | null) ?? null,
    createdAt:            row.created_at as string,
  }
}

export default async function BossPage() {
  const session = await auth()
  if (!session?.user?.isAdmin) redirect('/dashboard')

  const supabase = createServiceClient()
  const { data: rows } = await supabase
    .from('boss_fights')
    .select('*')
    .order('created_at', { ascending: false })

  const bossFights: BossFight[] = (rows ?? []).map((r) =>
    mapBossRow(r as Record<string, unknown>)
  )

  return <BossManager initialBossFights={bossFights} />
}
