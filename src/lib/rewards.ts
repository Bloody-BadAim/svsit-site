// src/lib/rewards.ts — V2 rewrite
import { createServiceClient } from '@/lib/supabase'
import { grantBadge } from '@/lib/badgeEngine'
import type { StatCategory } from '@/types/database'

export interface MemberStats {
  code: number
  social: number
  learn: number
  impact: number
  total: number
}

export async function calculateStats(memberId: string): Promise<MemberStats> {
  const supabase = createServiceClient()
  const stats: MemberStats = { code: 0, social: 0, learn: 0, impact: 0, total: 0 }

  const { data: transactions } = await supabase
    .from('xp_transactions')
    .select('amount, category')
    .eq('member_id', memberId)

  if (transactions) {
    for (const tx of transactions) {
      const cat = tx.category as StatCategory | null
      if (cat && cat in stats) {
        stats[cat] += tx.amount as number
      }
      stats.total += tx.amount as number
    }
  }

  return stats
}

export async function checkAndGrantAutoBadges(memberId: string): Promise<string[]> {
  const supabase = createServiceClient()
  const granted: string[] = []

  // Get member's scan history
  const { data: scans } = await supabase
    .from('scans')
    .select('event_name, category, created_at')
    .eq('member_id', memberId)
    .order('created_at', { ascending: true })

  const scanCount = scans?.length ?? 0
  const borrelCount = scans?.filter((s) =>
    ((s.event_name as string) ?? '').toLowerCase().includes('borrel')
  ).length ?? 0

  const categories = new Set(scans?.map((s) => s.category as string) ?? [])
  const allCategories = ['code', 'social', 'learn', 'impact'].every((c) => categories.has(c))

  // Streak checks
  let hasStreak3 = false
  let hasStreak7 = false
  if (scans && scans.length >= 3) {
    for (let i = 0; i <= scans.length - 3; i++) {
      const first = new Date(scans[i].created_at as string).getTime()
      const third = new Date(scans[i + 2].created_at as string).getTime()
      if ((third - first) / 86400000 <= 30) hasStreak3 = true
    }
  }
  if (scans && scans.length >= 7) {
    for (let i = 0; i <= scans.length - 7; i++) {
      const first = new Date(scans[i].created_at as string).getTime()
      const seventh = new Date(scans[i + 6].created_at as string).getTime()
      if ((seventh - first) / 86400000 <= 60) hasStreak7 = true
    }
  }

  // Auto-grant checks
  if (scanCount >= 1 && await grantBadge(memberId, 'badge_first_event')) granted.push('badge_first_event')
  if (borrelCount >= 5 && await grantBadge(memberId, 'badge_borrel_5')) granted.push('badge_borrel_5')
  if (borrelCount >= 10 && await grantBadge(memberId, 'badge_borrel_10')) granted.push('badge_borrel_10')
  if (allCategories && await grantBadge(memberId, 'badge_allrounder')) granted.push('badge_allrounder')
  if (hasStreak3 && await grantBadge(memberId, 'badge_streak_3')) granted.push('badge_streak_3')
  if (hasStreak7 && await grantBadge(memberId, 'badge_streak_7')) granted.push('badge_streak_7')

  return granted
}
