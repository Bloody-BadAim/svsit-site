import { createServiceClient } from '@/lib/supabase'
import { getRank, RANKS } from '@/lib/constants'
import { CARD_SKINS } from '@/lib/cardSkins'
import type { CardSkin } from '@/lib/cardSkins'
import type { StatCategory } from '@/types/database'

export interface MemberStats {
  code: number
  social: number
  learn: number
  impact: number
  total: number
}

// ---------------------------------------------------------------------------
// calculateStats
// ---------------------------------------------------------------------------

export async function calculateStats(memberId: string): Promise<MemberStats> {
  const supabase = createServiceClient()

  const stats: MemberStats = { code: 0, social: 0, learn: 0, impact: 0, total: 0 }

  // 1. Punten uit scans, gegroepeerd per categorie
  const { data: scans } = await supabase
    .from('scans')
    .select('category, points')
    .eq('member_id', memberId)

  if (scans) {
    for (const scan of scans) {
      const cat = scan.category as StatCategory
      if (cat in stats) {
        stats[cat] += scan.points as number
      }
    }
  }

  // 2. Punten uit goedgekeurde challenge submissions (join met challenges voor categorie)
  const { data: submissions } = await supabase
    .from('challenge_submissions')
    .select('challenges(category, points)')
    .eq('member_id', memberId)
    .eq('status', 'approved')

  if (submissions) {
    for (const sub of submissions) {
      const raw = sub.challenges
      const challenge = (Array.isArray(raw) ? raw[0] : raw) as { category: StatCategory; points: number } | null
      if (challenge) {
        const cat = challenge.category
        if (cat in stats) {
          stats[cat] += challenge.points
        }
      }
    }
  }

  stats.total = stats.code + stats.social + stats.learn + stats.impact

  return stats
}

// ---------------------------------------------------------------------------
// grantRewards
// ---------------------------------------------------------------------------

export async function grantRewards(memberId: string): Promise<void> {
  const supabase = createServiceClient()
  const stats = await calculateStats(memberId)

  // 1. Update members.points
  await supabase
    .from('members')
    .update({ points: stats.total })
    .eq('id', memberId)

  // 2. Bepaal rank
  const currentRank = getRank(stats.total)
  const rankOrder = RANKS.map((r) => r.naam)
  const currentRankIndex = rankOrder.indexOf(currentRank.naam)

  // 3. Unlock rank skins voor alle ranks tot en met huidige rank
  const rankSkins = CARD_SKINS.filter(
    (skin) =>
      skin.unlockType === 'rank' &&
      rankOrder.indexOf(skin.unlockRequirement) <= currentRankIndex
  )

  for (const skin of rankSkins as CardSkin[]) {
    await supabase
      .from('rewards')
      .upsert(
        { member_id: memberId, type: 'skin_unlock' as const, reward_id: skin.id },
        { onConflict: 'member_id,reward_id' }
      )
  }

  // 4. Haal scan data op voor badge checks
  const { data: allScans } = await supabase
    .from('scans')
    .select('event_name, category, created_at')
    .eq('member_id', memberId)
    .order('created_at', { ascending: true })

  const scanCount = allScans?.length ?? 0
  const borrelCount =
    allScans?.filter(
      (s) =>
        s.event_name &&
        (s.event_name as string).toLowerCase().includes('borrel')
    ).length ?? 0

  const coveredCategories = new Set(allScans?.map((s) => s.category) ?? [])
  const allCategoriesCovered =
    coveredCategories.has('code') &&
    coveredCategories.has('social') &&
    coveredCategories.has('learn') &&
    coveredCategories.has('impact')

  // Streak check: 3 opeenvolgende scans binnen 30 dagen
  let hasStreak3 = false
  if (allScans && allScans.length >= 3) {
    for (let i = 0; i <= allScans.length - 3; i++) {
      const first = new Date(allScans[i].created_at as string).getTime()
      const third = new Date(allScans[i + 2].created_at as string).getTime()
      const diffDays = (third - first) / (1000 * 60 * 60 * 24)
      if (diffDays <= 30) {
        hasStreak3 = true
        break
      }
    }
  }

  // 5. Badge grants
  const badgesToGrant: string[] = []

  if (scanCount >= 1) badgesToGrant.push('badge_first_event')
  if (borrelCount >= 5) badgesToGrant.push('badge_borrel_5')
  if (borrelCount >= 10) badgesToGrant.push('badge_borrel_10')
  if (allCategoriesCovered) badgesToGrant.push('badge_allrounder')
  if (hasStreak3) badgesToGrant.push('badge_streak_3')

  for (const badgeId of badgesToGrant) {
    await supabase
      .from('rewards')
      .upsert(
        { member_id: memberId, type: 'badge' as const, reward_id: badgeId },
        { onConflict: 'member_id,reward_id' }
      )

    // Grant achievement skins gekoppeld aan deze badge
    const linkedSkins = CARD_SKINS.filter(
      (skin) => skin.unlockType === 'badge' && skin.unlockRequirement === badgeId
    )
    for (const skin of linkedSkins as CardSkin[]) {
      await supabase
        .from('rewards')
        .upsert(
          { member_id: memberId, type: 'skin_unlock' as const, reward_id: skin.id },
          { onConflict: 'member_id,reward_id' }
        )
    }
  }

  // 6. Merch claims op basis van rank
  const merchMap: Record<string, string> = {
    Gold: 'merch_sticker_pack',
    Platinum: 'merch_hoodie',
    Diamond: 'merch_limited_edition',
  }

  for (const [rankNaam, merchId] of Object.entries(merchMap)) {
    const rankIndex = rankOrder.indexOf(rankNaam)
    if (rankIndex !== -1 && currentRankIndex >= rankIndex) {
      await supabase
        .from('rewards')
        .upsert(
          { member_id: memberId, type: 'merch_claim' as const, reward_id: merchId },
          { onConflict: 'member_id,reward_id' }
        )
    }
  }

  // 7. Track completion: check of alle track_milestone challenges per track zijn goedgekeurd
  const trackRewardMap: Record<string, { badge: string; skin: string | null }> = {
    fullstack:   { badge: 'badge_fullstack',          skin: 'skin_fullstack' },
    ai_engineer: { badge: 'badge_ai_engineer',        skin: 'skin_ai' },
    security:    { badge: 'badge_security',            skin: 'skin_security' },
    feestbeest:  { badge: 'badge_party_animal',        skin: 'skin_party' },
    community:   { badge: 'badge_community_builder',   skin: null },
  }

  // Haal alle track milestones op, gegroepeerd per track_id
  const { data: trackMilestones } = await supabase
    .from('challenges')
    .select('id, track_id')
    .eq('type', 'track_milestone')

  // Haal alle goedgekeurde submissions op voor dit lid
  const { data: approvedSubmissions } = await supabase
    .from('challenge_submissions')
    .select('challenge_id')
    .eq('member_id', memberId)
    .eq('status', 'approved')

  if (trackMilestones && approvedSubmissions) {
    const approvedChallengeIds = new Set(
      approvedSubmissions.map((s) => s.challenge_id as string)
    )

    // Groepeer milestones per track
    const milestonesByTrack = new Map<string, string[]>()
    for (const milestone of trackMilestones) {
      const trackId = milestone.track_id as string | null
      if (!trackId) continue
      if (!milestonesByTrack.has(trackId)) milestonesByTrack.set(trackId, [])
      milestonesByTrack.get(trackId)!.push(milestone.id as string)
    }

    // Controleer per track of alle milestones zijn gehaald
    for (const [trackId, milestoneIds] of milestonesByTrack.entries()) {
      if (milestoneIds.length === 0) continue

      const trackComplete = milestoneIds.every((id) => approvedChallengeIds.has(id))
      if (!trackComplete) continue

      const rewards = trackRewardMap[trackId]
      if (!rewards) continue

      // Grant track badge
      await supabase
        .from('rewards')
        .upsert(
          { member_id: memberId, type: 'badge' as const, reward_id: rewards.badge },
          { onConflict: 'member_id,reward_id' }
        )

      // Grant track skin (indien aanwezig)
      if (rewards.skin) {
        await supabase
          .from('rewards')
          .upsert(
            { member_id: memberId, type: 'skin_unlock' as const, reward_id: rewards.skin },
            { onConflict: 'member_id,reward_id' }
          )
      }
    }
  }
}
