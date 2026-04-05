import { auth } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { getRank, getBadgeSlotCount, BADGES } from '@/lib/constants'
import { calculateStats } from '@/lib/rewards'
import type { Challenge, ChallengeSubmission, Reward } from '@/types/database'
import ProgressionTracker from '@/components/dashboard/rewards/ProgressionTracker'
import WeeklyQuests from '@/components/dashboard/rewards/WeeklyQuests'
import SkillTracks from '@/components/dashboard/rewards/SkillTracks'
import BadgeCollection from '@/components/dashboard/rewards/BadgeCollection'
import MerchClaims from '@/components/dashboard/rewards/MerchClaims'

export const metadata = {
  title: 'Rewards — SIT',
}

export default async function RewardsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const supabase = createServiceClient()
  const memberId = session.user.id

  // Fetch member data
  const { data: member } = await supabase
    .from('members')
    .select('points, active_skin, active_badges')
    .eq('id', memberId)
    .single()

  const points = (member?.points as number) || 0
  const rank = getRank(points)
  const activeBadges = (member?.active_badges as string[]) || []
  const isAdmin = session.user.isAdmin
  const maxSlots = isAdmin ? BADGES.length : getBadgeSlotCount(rank.naam)

  // Fetch stats
  const stats = await calculateStats(memberId)

  // Fetch all rewards for this member
  const { data: rewardsData } = await supabase
    .from('rewards')
    .select('*')
    .eq('member_id', memberId)

  const rewards = (rewardsData || []) as Reward[]

  // Earned badge IDs — admins get all badges
  const earnedBadges = isAdmin
    ? BADGES.map(b => b.id)
    : rewards.filter((r) => r.type === 'badge').map((r) => r.reward_id)

  // Fetch active weekly quests (type='quest', within active period)
  const now = new Date().toISOString()
  const { data: questsData } = await supabase
    .from('challenges')
    .select('*')
    .eq('type', 'quest')
    .or(`active_until.is.null,active_until.gte.${now}`)

  const quests = (questsData || []) as Challenge[]

  // Fetch all track milestones grouped by track_id
  const { data: milestonesData } = await supabase
    .from('challenges')
    .select('*')
    .eq('type', 'track_milestone')
    .order('track_order', { ascending: true })

  const milestones = (milestonesData || []) as Challenge[]

  // Group milestones by track_id
  const milestonesByTrack = new Map<string, Challenge[]>()
  for (const m of milestones) {
    if (!m.track_id) continue
    if (!milestonesByTrack.has(m.track_id)) milestonesByTrack.set(m.track_id, [])
    milestonesByTrack.get(m.track_id)!.push(m)
  }

  // Fetch all challenge submissions for this member
  const { data: submissionsData } = await supabase
    .from('challenge_submissions')
    .select('*')
    .eq('member_id', memberId)

  const submissions = (submissionsData || []) as ChallengeSubmission[]

  // Build track data with submissions per track
  const tracks = Array.from(milestonesByTrack.entries()).map(([trackId, trackMilestones]) => {
    const trackChallengeIds = new Set(trackMilestones.map((m) => m.id))
    const trackSubmissions = submissions.filter((s) => trackChallengeIds.has(s.challenge_id))
    return { trackId, milestones: trackMilestones, submissions: trackSubmissions }
  })

  // Filter submissions relevant to quests
  const questIds = new Set(quests.map((q) => q.id))
  const questSubmissions = submissions.filter((s) => questIds.has(s.challenge_id))

  return (
    <div className="max-w-5xl">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: 'var(--color-accent-gold)',
              boxShadow: '0 0 8px rgba(242, 158, 24, 0.5)',
            }}
          />
          <span className="font-mono text-xs uppercase tracking-[0.15em]" style={{ color: 'var(--color-text-muted)' }}>
            rewards &middot; {rank.naam} &middot; {points}xp &middot; {earnedBadges.length} badges
          </span>
        </div>
        <h1
          className="text-4xl sm:text-5xl font-bold tracking-tight uppercase leading-[0.9]"
          style={{
            color: 'var(--color-text)',
            fontFamily: "'Big Shoulders Display', var(--font-geist-sans), sans-serif",
          }}
        >
          REWARDS
        </h1>
      </div>

      {/* Stats summary line */}
      <div
        className="flex flex-wrap items-center gap-3 md:gap-6 font-mono text-xs md:text-sm mb-8 pb-4"
        style={{ borderBottom: '1px dashed rgba(255,255,255,0.06)', color: 'var(--color-text-muted)' }}
      >
        <span>
          code: <span style={{ color: 'var(--color-accent-green)' }}>{stats.code}</span>
        </span>
        <span>
          social: <span style={{ color: 'var(--color-accent-gold)' }}>{stats.social}</span>
        </span>
        <span>
          learn: <span style={{ color: 'var(--color-accent-blue)' }}>{stats.learn}</span>
        </span>
        <span>
          impact: <span style={{ color: 'var(--color-accent-red)' }}>{stats.impact}</span>
        </span>
      </div>

      {/* 1. Progression Tracker — full width */}
      <div className="mb-6">
        <ProgressionTracker currentRank={rank.naam} points={points} />
      </div>

      {/* 2. Stats Bars + Weekly Quests — asymmetric 2-col */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-5 mb-6">
        {/* Stats bars panel */}
        <div
          className="relative"
          style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--color-border)' }}
        >
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2" style={{ borderColor: 'var(--color-accent-blue)' }} />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />

          <div className="px-5 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <span className="font-mono text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--color-text-muted)' }}>
              stat.breakdown
            </span>
          </div>

          <div className="p-5 space-y-4">
            {([
              { label: 'CODE', value: stats.code, color: 'var(--color-accent-green)' },
              { label: 'SOCIAL', value: stats.social, color: 'var(--color-accent-gold)' },
              { label: 'LEARN', value: stats.learn, color: 'var(--color-accent-blue)' },
              { label: 'IMPACT', value: stats.impact, color: 'var(--color-accent-red)' },
            ] as const).map((stat) => {
              const max = Math.max(stats.code, stats.social, stats.learn, stats.impact, 10)
              const pct = (stat.value / max) * 100

              return (
                <div key={stat.label} className="flex items-center gap-3">
                  <span className="font-mono text-xs md:text-sm font-bold w-12 shrink-0" style={{ color: stat.color }}>
                    {stat.label}
                  </span>
                  <div className="flex-1 h-[6px] overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
                    <div
                      className="h-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: stat.color, opacity: 0.8 }}
                    />
                  </div>
                  <span className="font-mono text-xs w-8 text-right shrink-0" style={{ color: 'var(--color-text-muted)' }}>
                    {stat.value}
                  </span>
                </div>
              )
            })}

            {/* Total */}
            <div
              className="flex items-center justify-between pt-3 font-mono text-xs md:text-sm"
              style={{ borderTop: '1px dashed rgba(255,255,255,0.06)' }}
            >
              <span style={{ color: 'var(--color-text-muted)' }}>TOTAL</span>
              <span style={{ color: 'var(--color-accent-gold)' }}>{stats.total} XP</span>
            </div>
          </div>
        </div>

        {/* Weekly Quests */}
        <WeeklyQuests quests={quests} submissions={questSubmissions} memberId={memberId} />
      </div>

      {/* 3. Skill Tracks — full width */}
      <div className="mb-6">
        <SkillTracks tracks={tracks} memberId={memberId} />
      </div>

      {/* 4. Badge Collection + Merch Claims — 2-col */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5">
        <BadgeCollection
          earnedBadges={earnedBadges}
          activeBadges={activeBadges}
          maxSlots={maxSlots}
          memberId={memberId}
        />
        <MerchClaims rewards={rewards} currentRank={rank.naam} memberId={memberId} />
      </div>
    </div>
  )
}
