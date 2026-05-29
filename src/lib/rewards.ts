// src/lib/rewards.ts — V2 rewrite
import { createServiceClient } from '@/lib/supabase'
import { grantBadge } from '@/lib/badgeEngine'
import type { StatCategory } from '@/types/database'

export interface MemberStats {
  code: number
  social: number
  career: number
  game: number
  total: number
}

export async function calculateStats(
  memberId: string,
  isAdmin = false,
): Promise<MemberStats> {
  // Admins and bestuur get max stats
  if (isAdmin) {
    return { code: 999, social: 999, career: 999, game: 999, total: 3996 }
  }

  const supabase = createServiceClient()
  const stats: MemberStats = { code: 0, social: 0, career: 0, game: 0, total: 0 }

  // xp_transactions is the single source of truth (V1 data was migrated)
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

  // Get member's scan history + profile + purchases in parallel
  const [scansResult, memberResult, purchasesResult, xpResult, badgesResult] = await Promise.all([
    supabase
      .from('scans')
      .select('event_name, category, created_at')
      .eq('member_id', memberId)
      .order('created_at', { ascending: true }),
    supabase
      .from('members')
      .select('display_name, student_number, email, hva_email')
      .eq('id', memberId)
      .single(),
    supabase
      .from('tickets')
      .select('id')
      .eq('member_id', memberId)
      .limit(1),
    supabase
      .from('xp_transactions')
      .select('amount, created_at')
      .eq('member_id', memberId),
    supabase
      .from('member_badges')
      .select('badge_id')
      .eq('member_id', memberId),
  ])

  const scans = scansResult.data
  const member = memberResult.data
  const purchases = purchasesResult.data
  const xpTxs = xpResult.data
  const ownedBadges = new Set(badgesResult.data?.map((b) => b.badge_id as string) ?? [])

  const scanCount = scans?.length ?? 0
  const borrelCount = scans?.filter((s) =>
    ((s.event_name as string) ?? '').toLowerCase().includes('borrel')
  ).length ?? 0

  const categories = new Set(scans?.map((s) => s.category as string) ?? [])
  const allCategories = ['code', 'social', 'career', 'game'].every((c) => categories.has(c))

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

  // Profile complete check
  const profileComplete = !!(
    member?.display_name &&
    member?.student_number &&
    member?.email
  )

  // XP in day check (100+ in single day)
  let hasXpDay = false
  if (xpTxs && xpTxs.length > 0) {
    const dailyXp: Record<string, number> = {}
    for (const tx of xpTxs) {
      const day = (tx.created_at as string).slice(0, 10)
      dailyXp[day] = (dailyXp[day] || 0) + (tx.amount as number)
    }
    hasXpDay = Object.values(dailyXp).some((total) => total >= 100)
  }

  // Completionist check (all common-epic badges)
  const { BADGE_DEFS } = await import('@/lib/badgeDefs')
  const commonToEpicIds = BADGE_DEFS
    .filter((b) => ['common', 'uncommon', 'rare', 'epic'].includes(b.rarity))
    .map((b) => b.id)
  const hasAllUpToEpic = commonToEpicIds.every((id) => ownedBadges.has(id))

  // Auto-grant checks — scan-based
  if (scanCount >= 1 && await grantBadge(memberId, 'badge_first_event')) granted.push('badge_first_event')
  if (borrelCount >= 5 && await grantBadge(memberId, 'badge_borrel_5')) granted.push('badge_borrel_5')
  if (borrelCount >= 10 && await grantBadge(memberId, 'badge_borrel_10')) granted.push('badge_borrel_10')
  if (allCategories && await grantBadge(memberId, 'badge_allrounder')) granted.push('badge_allrounder')
  if (hasStreak3 && await grantBadge(memberId, 'badge_streak_3')) granted.push('badge_streak_3')
  if (hasStreak7 && await grantBadge(memberId, 'badge_streak_7')) granted.push('badge_streak_7')

  // Auto-grant checks — profile/purchase/xp
  if (profileComplete && await grantBadge(memberId, 'badge_profile_complete')) granted.push('badge_profile_complete')
  if (purchases && purchases.length > 0 && await grantBadge(memberId, 'badge_first_purchase')) granted.push('badge_first_purchase')
  if (hasXpDay && await grantBadge(memberId, 'badge_double_xp_day')) granted.push('badge_double_xp_day')
  if (hasAllUpToEpic && await grantBadge(memberId, 'badge_completionist')) granted.push('badge_completionist')

  return granted
}
