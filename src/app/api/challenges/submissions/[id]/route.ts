import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, handleError } from '@/lib/apiAuth'
import { createServiceClient } from '@/lib/supabase'
import { checkAndGrantAutoBadges } from '@/lib/rewards'
import { grantXp } from '@/lib/xpEngine'
import type { SubmissionStatus } from '@/types/database'

// PATCH — Approve or reject a challenge submission (admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await requireAdmin()
    if ('error' in result) return result.error
    const { session } = result

    const { id } = await params
    const { status } = await req.json() as { status: SubmissionStatus }

    if (status !== 'approved' && status !== 'rejected') {
      return NextResponse.json(
        { data: null, error: 'status moet "approved" of "rejected" zijn', meta: null },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Update submission
    const { data, error } = await supabase
      .from('challenge_submissions')
      .update({
        status,
        reviewed_by: session.user.email,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    if (!data) {
      return NextResponse.json({ data: null, error: 'Submission niet gevonden', meta: null }, { status: 404 })
    }

    // If approved: grant XP, recalculate stats and grant rewards
    if (status === 'approved') {
      // Fetch challenge points to grant XP
      const { data: challenge } = await supabase
        .from('challenges')
        .select('points, category')
        .eq('id', data.challenge_id)
        .single()

      if (challenge) {
        await grantXp({
          memberId: data.member_id,
          amount: challenge.points,
          source: 'challenge',
          sourceId: id,
          category: challenge.category,
        })
      }

      await checkAndGrantAutoBadges(data.member_id)
    }

    return NextResponse.json({ data, error: null, meta: null })
  } catch (err) {
    return handleError(err)
  }
}
