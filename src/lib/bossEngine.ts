import { createServiceClient } from '@/lib/supabase'
import { grantXp } from '@/lib/xpEngine'
import { grantBadge } from '@/lib/badgeEngine'
import type { BossFight } from '@/types/gamification'

export async function getActiveBoss(): Promise<BossFight | null> {
  const supabase = createServiceClient()
  const { data } = await supabase.from('boss_fights')
    .select('id, name, description, hp, current_hp, artwork_url, status, announced_at, starts_at, deadline, base_reward_xp, base_reward_badge_id, top_reward_accessory_id, created_at')
    .order('created_at', { ascending: false }).limit(1).maybeSingle()
  if (!data) return null

  const boss = mapBossRow(data)

  // Only return active/announced bosses, or recently defeated/failed (within 24h) for the widget
  if (boss.status === 'defeated' || boss.status === 'failed') {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000
    if (new Date(boss.createdAt).getTime() < cutoff) return null
  }

  return boss
}

export async function getBossContributions(bossId: string) {
  const supabase = createServiceClient()
  const { data } = await supabase.from('boss_fight_contributions')
    .select('member_id, xp_contributed')
    .eq('boss_fight_id', bossId).order('xp_contributed', { ascending: false })

  const contributions = data ?? []
  return {
    total: contributions.reduce((sum, c) => sum + (c.xp_contributed as number), 0),
    contributors: contributions.length,
    top3: contributions.slice(0, 3).map(c => ({ memberId: c.member_id as string, xp: c.xp_contributed as number })),
  }
}

export async function getMemberContribution(bossId: string, memberId: string): Promise<number> {
  const supabase = createServiceClient()
  const { data } = await supabase.from('boss_fight_contributions')
    .select('xp_contributed').eq('boss_fight_id', bossId).eq('member_id', memberId).maybeSingle()
  return (data?.xp_contributed as number) ?? 0
}

export async function checkBossStatus(bossId: string): Promise<'announced' | 'active' | 'defeated' | 'failed'> {
  const supabase = createServiceClient()
  const { data: boss } = await supabase.from('boss_fights')
    .select('hp, current_hp, deadline, starts_at, status').eq('id', bossId).maybeSingle()

  if (!boss) return 'failed'
  if ((boss.status as string) === 'defeated') return 'defeated'

  // Transition announced → active when startsAt has passed (atomic CAS)
  if ((boss.status as string) === 'announced') {
    if (new Date() >= new Date(boss.starts_at as string)) {
      const { data: updated } = await supabase.from('boss_fights')
        .update({ status: 'active' })
        .eq('id', bossId)
        .eq('status', 'announced')
        .select('id')
        .maybeSingle()
      if (!updated) return 'announced'
    } else {
      return 'announced'
    }
  }

  if ((boss.current_hp as number) >= (boss.hp as number)) {
    // Atomic: only update if still active (prevents double reward granting)
    const { data: updated } = await supabase.from('boss_fights')
      .update({ status: 'defeated' })
      .eq('id', bossId)
      .eq('status', 'active')
      .select('id')
      .maybeSingle()
    if (updated) await grantBossRewards(bossId)
    return 'defeated'
  }

  if (new Date() > new Date(boss.deadline as string)) {
    // Atomic: only update if still active (prevents double transition)
    await supabase.from('boss_fights')
      .update({ status: 'failed' })
      .eq('id', bossId)
      .eq('status', 'active')
    return 'failed'
  }

  return 'active'
}

async function grantBossRewards(bossId: string): Promise<void> {
  const supabase = createServiceClient()
  const { data: boss } = await supabase.from('boss_fights')
    .select('base_reward_xp, base_reward_badge_id, top_reward_accessory_id')
    .eq('id', bossId).single()

  if (!boss) return

  const { data: contributors } = await supabase.from('boss_fight_contributions')
    .select('member_id, xp_contributed')
    .eq('boss_fight_id', bossId).order('xp_contributed', { ascending: false })

  if (!contributors) return

  for (const c of contributors) {
    const mid = c.member_id as string
    if (boss.base_reward_xp) await grantXp({ memberId: mid, amount: boss.base_reward_xp as number, source: 'boss_fight', sourceId: bossId })
    if (boss.base_reward_badge_id) await grantBadge(mid, boss.base_reward_badge_id as string)
  }

  if (boss.top_reward_accessory_id) {
    for (const c of contributors.slice(0, 3)) {
      await supabase.from('member_accessories').upsert(
        { member_id: c.member_id as string, accessory_id: boss.top_reward_accessory_id as string, acquired_via: 'boss_fight' },
        { onConflict: 'member_id,accessory_id' }
      )
    }
  }
}

function mapBossRow(row: Record<string, unknown>): BossFight {
  return {
    id: row.id as string, name: row.name as string, description: row.description as string,
    hp: (row.hp as number) ?? 0, currentHp: (row.current_hp as number) ?? 0,
    artworkUrl: row.artwork_url as string | null, status: row.status as BossFight['status'],
    announcedAt: row.announced_at as string | null, startsAt: row.starts_at as string,
    deadline: row.deadline as string, baseRewardXp: row.base_reward_xp as number,
    baseRewardBadgeId: row.base_reward_badge_id as string | null,
    topRewardAccessoryId: row.top_reward_accessory_id as string | null,
    createdAt: row.created_at as string,
  }
}
