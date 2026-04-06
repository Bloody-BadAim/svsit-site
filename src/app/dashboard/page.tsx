import { auth } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { getLevelForXp, getLevelProgress, getNextLevel, getTierColor, getBadgeSlotCount } from '@/lib/levelEngine'
import { calculateStats } from '@/lib/rewards'
import { getEquippedAccessories } from '@/lib/inventoryEngine'
import { getActiveBoss } from '@/lib/bossEngine'
import { CARD_SKINS } from '@/lib/cardSkins'
import { RARITY_CONFIG } from '@/types/gamification'
import type { BadgeRarity } from '@/types/gamification'
import type { Role } from '@/types/database'
import type { MemberCardEquipment } from '@/components/MemberCard'
import DashboardClient from '@/components/dashboard/DashboardClient'

export const metadata = {
  title: 'Dashboard -- SIT',
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const params = await searchParams
  const isWelcome = params.welcome === 'true'
  const memberId = session.user.id
  const isAdmin = session.user.isAdmin

  const supabase = createServiceClient()

  // -------------------------------------------------------------------------
  // Parallel data fetching
  // -------------------------------------------------------------------------

  const now = new Date().toISOString()

  const [
    memberResult,
    memberStats,
    cardEquipment,
    activeBoss,
    scansResult,
    challengeSubmissionsResult,
    activeChallengesResult,
    memberBadgesResult,
    skinRewardsResult,
    xpTransactionsTodayResult,
    recentScansForStreakResult,
    allSubmissionsResult,
    milestonesResult,
    xpHistoryResult,
    equippedBadgesResult,
  ] = await Promise.all([
    // 1. Member data with commissies
    supabase
      .from('members')
      .select(`id, email, role, total_xp, coins_balance, current_level,
        custom_title, accent_color, is_admin, active_skin,
        leaderboard_visible, commissie,
        member_commissies ( commissie_id, commissies ( slug, naam ) )`)
      .eq('id', memberId)
      .single(),

    // 2. Stats
    calculateStats(memberId),

    // 3. Equipped accessories
    getEquippedAccessories(memberId),

    // 4. Active boss
    getActiveBoss(),

    // 5. Recent scans (last 10)
    supabase
      .from('scans')
      .select('id, points, reason, event_name, category, created_at')
      .eq('member_id', memberId)
      .order('created_at', { ascending: false })
      .limit(10),

    // 6. Recent approved challenge submissions (last 10)
    supabase
      .from('challenge_submissions')
      .select('id, challenge_id, created_at, status')
      .eq('member_id', memberId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(10),

    // 7. Active challenges/quests
    supabase
      .from('challenges')
      .select('id, title, description, points, category, type, active_until')
      .or(`active_until.is.null,active_until.gte.${now}`)
      .eq('type', 'quest'),

    // 8. Member badges (earned)
    supabase
      .from('member_badges')
      .select('badge_id, earned_at')
      .eq('member_id', memberId),

    // 9. Unlocked skins
    supabase
      .from('rewards')
      .select('reward_id')
      .eq('member_id', memberId)
      .eq('type', 'skin_unlock'),

    // 10. XP transactions today (for daily XP count)
    supabase
      .from('xp_transactions')
      .select('amount')
      .eq('member_id', memberId)
      .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),

    // 11. Recent scans for streak calculation (last 30 days)
    supabase
      .from('scans')
      .select('created_at')
      .eq('member_id', memberId)
      .gte('created_at', new Date(Date.now() - 30 * 86400000).toISOString())
      .order('created_at', { ascending: false }),

    // 12. All challenge submissions for this member (quests + tracks)
    supabase
      .from('challenge_submissions')
      .select('id, challenge_id, status, created_at')
      .eq('member_id', memberId),

    // 13. Track milestones
    supabase
      .from('challenges')
      .select('id, title, track_id, track_order')
      .eq('type', 'track_milestone')
      .order('track_order', { ascending: true }),

    // 14. XP history (last 50)
    supabase
      .from('xp_transactions')
      .select('id, amount, source, category, created_at')
      .eq('member_id', memberId)
      .order('created_at', { ascending: false })
      .limit(50),

    // 15. Equipped badge slots
    supabase
      .from('member_badges')
      .select('badge_id, equipped_slot')
      .eq('member_id', memberId)
      .not('equipped_slot', 'is', null),
  ])

  const member = memberResult.data
  if (!member) redirect('/login')

  // -------------------------------------------------------------------------
  // Process challenge submissions -> activity items
  // -------------------------------------------------------------------------

  const completedChallenges = challengeSubmissionsResult.data ?? []
  const challengeIds = completedChallenges.map(s => s.challenge_id)
  const { data: challengeDetails } = challengeIds.length > 0
    ? await supabase.from('challenges').select('id, title, points, category').in('id', challengeIds)
    : { data: [] as { id: string; title: string; points: number; category: string }[] }

  // -------------------------------------------------------------------------
  // Build activity items (scans + challenges, sorted by date, max 10)
  // -------------------------------------------------------------------------

  const activityItems = [
    ...(scansResult.data ?? []).map(s => ({
      id: s.id as string,
      type: 'scan' as const,
      points: s.points as number,
      reason: s.reason as string,
      event_name: s.event_name as string | null,
      created_at: s.created_at as string,
      category: s.category as string | null,
    })),
    ...completedChallenges.map(s => {
      const challenge = (challengeDetails ?? []).find(
        (c: { id: string; title: string; points: number; category: string }) => c.id === s.challenge_id
      )
      return {
        id: s.id as string,
        type: 'challenge' as const,
        points: (challenge?.points as number) || 0,
        reason: (challenge?.title as string) || 'Challenge voltooid',
        event_name: null,
        created_at: s.created_at as string,
        category: (challenge?.category as string) || null,
      }
    }),
  ]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10)

  // -------------------------------------------------------------------------
  // Level calculations
  // -------------------------------------------------------------------------

  const points = (member.total_xp as number) || 0
  const levelDef = getLevelForXp(points)
  const levelProgress = getLevelProgress(points)
  const nextLevelDef = getNextLevel(levelDef.level)

  // -------------------------------------------------------------------------
  // Next unlock teaser
  // -------------------------------------------------------------------------

  let nextUnlock = null
  if (nextLevelDef) {
    // Find a skin that unlocks at the next level
    const nextSkin = CARD_SKINS.find(s =>
      s.unlockType === 'level' && parseInt(s.unlockRequirement) === nextLevelDef.level
    )

    nextUnlock = {
      skinName: nextSkin?.naam ?? `Level ${nextLevelDef.level}: ${nextLevelDef.title}`,
      xpToGo: nextLevelDef.xpRequired - levelProgress.current,
      progressPercent: levelProgress.percent,
      nextLevel: nextLevelDef.level,
    }
  }

  // -------------------------------------------------------------------------
  // XP today
  // -------------------------------------------------------------------------

  const xpToday = (xpTransactionsTodayResult.data ?? []).reduce(
    (sum, tx) => sum + ((tx.amount as number) || 0),
    0
  )

  // -------------------------------------------------------------------------
  // Streak calculation (consecutive days with scans)
  // -------------------------------------------------------------------------

  let streak = 0
  const streakScans = recentScansForStreakResult.data ?? []
  if (streakScans.length > 0) {
    const scanDays = new Set(
      streakScans.map(s => new Date(s.created_at as string).toDateString())
    )
    const today = new Date()
    // Check if today has a scan; if not, check if yesterday does (allow 1-day gap)
    const todayStr = today.toDateString()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toDateString()

    let checkDate = scanDays.has(todayStr) ? today : scanDays.has(yesterdayStr) ? yesterday : null

    if (checkDate) {
      while (scanDays.has(checkDate.toDateString())) {
        streak++
        checkDate = new Date(checkDate)
        checkDate.setDate(checkDate.getDate() - 1)
      }
    }
  }

  // -------------------------------------------------------------------------
  // Equipment mapping (same pattern as ledenpas page)
  // -------------------------------------------------------------------------

  const equippedAccessoryIds = [
    cardEquipment.frameId,
    cardEquipment.petId,
    cardEquipment.effectId,
    ...cardEquipment.stickers.map(s => s.accessoryId),
  ].filter(Boolean) as string[]

  let equipmentProp: MemberCardEquipment | undefined

  if (equippedAccessoryIds.length > 0 || cardEquipment.accentColor || cardEquipment.customTitle) {
    const { data: defs } = await supabase
      .from('accessory_definitions')
      .select('id, name, rarity, category, preview_data')
      .in('id', equippedAccessoryIds.length > 0 ? equippedAccessoryIds : ['__none__'])

    const defMap = new Map((defs ?? []).map(d => [d.id as string, d]))

    const frameDef = cardEquipment.frameId ? defMap.get(cardEquipment.frameId) : null
    const petDef = cardEquipment.petId ? defMap.get(cardEquipment.petId) : null
    const effectDef = cardEquipment.effectId ? defMap.get(cardEquipment.effectId) : null

    const frameColor = frameDef
      ? (frameDef.rarity === 'mythic'
          ? 'conic-gradient(from 0deg, #f59e0b, #ef4444, #8b5cf6, #3b82f6, #22c55e, #f59e0b)'
          : RARITY_CONFIG[frameDef.rarity as BadgeRarity]?.color)
      : undefined

    const petPreview = petDef?.preview_data as Record<string, unknown> | null
    const petEmoji = petDef
      ? ((petPreview?.petId as string | undefined) ?? (petPreview?.emoji as string | undefined))
      : undefined

    const effectName = effectDef?.name as string | undefined

    const mappedStickers = cardEquipment.stickers
      .map(s => {
        const stickerDef = defMap.get(s.accessoryId)
        const emoji = (stickerDef?.preview_data as Record<string, unknown> | null)?.emoji as string | undefined
        if (!emoji) return null
        return { id: s.accessoryId, x: s.x, y: s.y, emoji }
      })
      .filter((s): s is { id: string; x: number; y: number; emoji: string } => s !== null)

    equipmentProp = {
      frameColor,
      petEmoji,
      effectName,
      stickers: mappedStickers.length > 0 ? mappedStickers : undefined,
      accentColor: cardEquipment.accentColor ?? undefined,
      customTitle: cardEquipment.customTitle ?? undefined,
    }
  }

  // -------------------------------------------------------------------------
  // Commissie name
  // -------------------------------------------------------------------------

  const memberCommissies = ((member.member_commissies || []) as unknown as { commissies: { naam: string } }[])
  const commissieNaam = memberCommissies.length > 0
    ? memberCommissies.map(mc => mc.commissies.naam).join(', ')
    : (member.commissie as string) || null

  // -------------------------------------------------------------------------
  // Active skin (V2 equipped > legacy active_skin > default)
  // -------------------------------------------------------------------------

  const activeSkin = cardEquipment.skinId ?? ((member.active_skin as string) || 'default')
  const username = (member.email as string)?.split('@')[0] || 'lid'

  // -------------------------------------------------------------------------
  // BadgesTab props (declared early so cardData can use equippedBadges)
  // -------------------------------------------------------------------------

  const earnedBadgeIds = (memberBadgesResult.data ?? []).map(b => b.badge_id as string)
  const equippedBadges = (equippedBadgesResult.data ?? []).map(b => ({
    badgeId: b.badge_id as string,
    slot: b.equipped_slot as number,
  }))
  const maxSlots = getBadgeSlotCount(levelDef.level)

  // -------------------------------------------------------------------------
  // Card data
  // -------------------------------------------------------------------------

  const cardData = {
    name: username,
    role: member.role as Role,
    commissie: commissieNaam,
    total_xp: points,
    memberId: member.id as string,
    email: member.email as string,
    activeBadges: equippedBadges.map(b => b.badgeId),
    dynamicStats: memberStats,
  }

  const coinsBalance = isAdmin ? 99999 : ((member.coins_balance as number) || 0)

  // -------------------------------------------------------------------------
  // QuestsTab props
  // -------------------------------------------------------------------------

  const quests = (activeChallengesResult.data ?? []).map(c => ({
    id: c.id as string,
    title: c.title as string,
    description: (c.description as string) ?? '',
    category: c.category as string,
    points: c.points as number,
    activeUntil: (c.active_until as string) ?? null,
  }))

  const allSubmissions = (allSubmissionsResult.data ?? []).map(s => ({
    challengeId: s.challenge_id as string,
    status: s.status as string,
    createdAt: s.created_at as string,
  }))

  // Build tracks from milestone challenges
  const milestoneRows = milestonesResult.data ?? []
  const approvedChallengeIds = new Set(
    allSubmissions.filter(s => s.status === 'approved').map(s => s.challengeId)
  )
  const trackMap = new Map<string, { id: string; title: string; completed: boolean }[]>()
  for (const row of milestoneRows) {
    const trackId = (row.track_id as string) ?? 'unknown'
    if (!trackMap.has(trackId)) trackMap.set(trackId, [])
    trackMap.get(trackId)!.push({
      id: row.id as string,
      title: row.title as string,
      completed: approvedChallengeIds.has(row.id as string),
    })
  }
  const tracks = Array.from(trackMap.entries()).map(([trackId, milestones]) => ({
    trackId,
    milestones,
  }))

  const xpHistory = (xpHistoryResult.data ?? []).map(tx => ({
    id: tx.id as string,
    amount: tx.amount as number,
    source: tx.source as string,
    category: (tx.category as string) ?? null,
    createdAt: tx.created_at as string,
  }))

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <DashboardClient
      level={levelDef.level}
      levelTitle={levelDef.title}
      tierColor={getTierColor(levelDef.tier)}
      xpCurrent={levelProgress.current}
      xpMax={levelProgress.max}
      xpPercent={levelProgress.percent}
      streak={streak}
      coins={coinsBalance}
      cardData={cardData}
      equipment={equipmentProp}
      memberId={memberId}
      activeSkin={activeSkin}
      hasBoss={!!activeBoss}
      activityItems={activityItems}
      nextUnlock={nextUnlock}
      xpToday={xpToday}
      isWelcome={isWelcome}
      questsTabProps={{
        quests,
        submissions: allSubmissions,
        tracks,
        xpHistory,
        memberId,
      }}
      badgesTabProps={{
        earnedBadgeIds,
        equippedBadges,
        maxSlots,
        memberId,
        isAdmin,
      }}
    />
  )
}
