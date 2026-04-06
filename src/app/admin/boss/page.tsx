import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase'
import { mapBossRow } from '@/lib/bossMappers'
import BossManager from '@/components/admin/BossManager'
import type { BossFight } from '@/types/gamification'

export default async function BossPage() {
  const session = await auth()
  if (!session?.user?.isAdmin) redirect('/dashboard')

  const supabase = createServiceClient()
  const { data: rows } = await supabase
    .from('boss_fights')
    .select('id, name, description, hp, current_hp, artwork_url, status, announced_at, starts_at, deadline, base_reward_xp, base_reward_badge_id, top_reward_accessory_id, created_at')
    .order('created_at', { ascending: false })

  const bossFights: BossFight[] = (rows ?? []).map((r) =>
    mapBossRow(r as Record<string, unknown>)
  )

  return <BossManager initialBossFights={bossFights} />
}
