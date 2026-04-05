import { createServiceClient } from '@/lib/supabase'
import { getLevelForXp } from '@/lib/levelEngine'
import type { StatCategory } from '@/types/database'
import type { XpSource } from '@/types/gamification'

export const XP_REWARDS = {
  borrelCheckIn: 5,
  workshopEvent: 10,
  hackathon: 25,
  organizeEvent: 40,
  weeklyQuestMin: 10,
  weeklyQuestMax: 25,
  trackMilestoneMin: 15,
  trackMilestoneMax: 50,
  trackCompletion: 100,
} as const

export function calculateXpReward(
  source: 'scan' | 'challenge',
  context: { eventName?: string; points?: number }
): number {
  if (source === 'challenge') return context.points ?? 0

  const name = (context.eventName ?? '').toLowerCase()
  if (name.includes('hackathon')) return XP_REWARDS.hackathon
  if (name.includes('borrel')) return XP_REWARDS.borrelCheckIn
  return XP_REWARDS.workshopEvent
}

export async function grantXp(params: {
  memberId: string
  amount: number
  source: XpSource
  sourceId?: string
  category?: StatCategory
}): Promise<{ newTotalXp: number; newLevel: number; oldLevel: number; coinsGranted: number }> {
  const supabase = createServiceClient()

  // 1. Log XP transaction
  await supabase.from('xp_transactions').insert({
    member_id: params.memberId,
    amount: params.amount,
    coins_amount: params.amount,
    source: params.source,
    source_id: params.sourceId ?? null,
    category: params.category ?? null,
  })

  // 2. Get current state
  const { data: member } = await supabase
    .from('members')
    .select('total_xp, current_level, coins_balance')
    .eq('id', params.memberId)
    .single()

  const oldXp = member?.total_xp ?? 0
  const oldLevel = member?.current_level ?? 1
  const oldCoins = member?.coins_balance ?? 0

  // 3. Calculate new state
  const newTotalXp = oldXp + params.amount
  const newLevelDef = getLevelForXp(newTotalXp)
  const newCoins = oldCoins + params.amount

  // 4. Update member
  await supabase
    .from('members')
    .update({
      total_xp: newTotalXp,
      current_level: newLevelDef.level,
      coins_balance: newCoins,
    })
    .eq('id', params.memberId)

  // 5. Update boss fight contribution if active boss exists
  const { data: activeBoss } = await supabase
    .from('boss_fights')
    .select('id')
    .eq('status', 'active')
    .limit(1)
    .maybeSingle()

  if (activeBoss) {
    await supabase.rpc('increment_boss_contribution', {
      p_boss_id: activeBoss.id,
      p_member_id: params.memberId,
      p_amount: params.amount,
    })
  }

  return {
    newTotalXp,
    newLevel: newLevelDef.level,
    oldLevel,
    coinsGranted: params.amount,
  }
}

export async function getXpHistory(memberId: string, limit = 50): Promise<Array<{
  amount: number
  source: string
  category: string | null
  createdAt: string
}>> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('xp_transactions')
    .select('amount, source, category, created_at')
    .eq('member_id', memberId)
    .order('created_at', { ascending: false })
    .limit(limit)

  return (data ?? []).map((row) => ({
    amount: row.amount as number,
    source: row.source as string,
    category: row.category as string | null,
    createdAt: row.created_at as string,
  }))
}
