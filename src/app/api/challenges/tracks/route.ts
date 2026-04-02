import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'
import type { Challenge } from '@/types/database'

interface TrackGroup {
  trackId: string
  milestones: Challenge[]
  completedCount: number
  totalCount: number
}

// GET — List all skill tracks with milestones and user progress
export async function GET(_req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ data: null, error: 'Niet ingelogd', meta: null }, { status: 401 })
    }

    const supabase = createServiceClient()

    // Query all track milestones ordered by track_id and track_order
    const { data: milestones, error: milestonesError } = await supabase
      .from('challenges')
      .select('*')
      .eq('type', 'track_milestone')
      .order('track_id', { ascending: true })
      .order('track_order', { ascending: true })

    if (milestonesError) throw milestonesError

    // Get user's completed submissions
    const { data: submissions, error: submissionsError } = await supabase
      .from('challenge_submissions')
      .select('challenge_id')
      .eq('member_id', session.user.id)
      .eq('status', 'approved')

    if (submissionsError) throw submissionsError

    const completedChallengeIds = new Set(submissions?.map((s) => s.challenge_id) ?? [])

    // Group milestones by track_id
    const trackMap = new Map<string, TrackGroup>()

    for (const milestone of milestones ?? []) {
      const trackId = milestone.track_id ?? 'unknown'

      if (!trackMap.has(trackId)) {
        trackMap.set(trackId, {
          trackId,
          milestones: [],
          completedCount: 0,
          totalCount: 0,
        })
      }

      const group = trackMap.get(trackId)!
      group.milestones.push(milestone)
      group.totalCount++

      if (completedChallengeIds.has(milestone.id)) {
        group.completedCount++
      }
    }

    const data = Array.from(trackMap.values())

    return NextResponse.json({ data, error: null, meta: { trackCount: data.length } })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Onbekende fout'
    return NextResponse.json({ data: null, error: message, meta: null }, { status: 500 })
  }
}
