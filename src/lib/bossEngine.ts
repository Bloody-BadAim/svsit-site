import { createServiceClient } from '@/lib/supabase'
import { grantXp } from '@/lib/xpEngine'
import { grantBadge } from '@/lib/badgeEngine'
import { mapBossRow } from '@/lib/bossMappers'
import type { BossFight } from '@/types/gamification'

export async function getActiveBoss(): Promise<BossFight | null> {
  const supabase = createServiceClient()
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { data } = await supabase.from('boss_fights')
    .select('id, name, description, hp, current_hp, artwork_url, status, announced_at, starts_at, deadline, base_reward_xp, base_reward_badge_id, top_reward_accessory_id, created_at')
    .or(`status.in.(announced,active),and(status.in.(defeated,failed),created_at.gte.${cutoff})`)
    .order('created_at', { ascending: false }).limit(1).maybeSingle()
  if (!data) return null

  const boss = mapBossRow(data)

  // Inline status transitions using the already-fetched data (no second query)
  if (boss.status === 'announced') {
    if (new Date() >= new Date(boss.startsAt)) {
      const { data: updated } = await supabase.from('boss_fights')
        .update({ status: 'active' })
        .eq('id', boss.id)
        .eq('status', 'announced')
        .select('id')
        .maybeSingle()
      if (updated) boss.status = 'active'
    }
  } else if (boss.status === 'active') {
    if (boss.currentHp >= boss.hp) {
      // Atomic CAS: only update if still active (prevents double reward granting)
      const { data: updated } = await supabase.from('boss_fights')
        .update({ status: 'defeated' })
        .eq('id', boss.id)
        .eq('status', 'active')
        .select('id')
        .maybeSingle()
      if (updated) {
        boss.status = 'defeated'
        await grantBossRewards(boss.id)
      }
    } else if (new Date() > new Date(boss.deadline)) {
      // Atomic CAS: only update if still active (prevents double transition)
      await supabase.from('boss_fights')
        .update({ status: 'failed' })
        .eq('id', boss.id)
        .eq('status', 'active')
      boss.status = 'failed'
    }
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

  // Grant XP and badges in parallel
  await Promise.all(contributors.map(async (c) => {
    const mid = c.member_id as string
    if (boss.base_reward_xp) await grantXp({ memberId: mid, amount: boss.base_reward_xp as number, source: 'boss_fight', sourceId: bossId })
    if (boss.base_reward_badge_id) await grantBadge(mid, boss.base_reward_badge_id as string)
  }))

  if (boss.top_reward_accessory_id) {
    await Promise.all(contributors.slice(0, 3).map((c) =>
      supabase.from('member_accessories').upsert(
        { member_id: c.member_id as string, accessory_id: boss.top_reward_accessory_id as string, acquired_via: 'boss_fight' },
        { onConflict: 'member_id,accessory_id' }
      )
    ))
  }
}
