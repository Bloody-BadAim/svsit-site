import { NextResponse } from 'next/server'
import { requireAdmin, handleError } from '@/lib/apiAuth'
import { createServiceClient } from '@/lib/supabase'

// GET — List all pending submissions (admin only)
export async function GET() {
  try {
    const result = await requireAdmin()
    if ('error' in result) return result.error

    const supabase = createServiceClient()

    const { data: submissions, error: submissionsError } = await supabase
      .from('challenge_submissions')
      .select('id, challenge_id, member_id, proof_url, proof_text, status, reviewed_by, reviewed_at, created_at')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (submissionsError) throw submissionsError

    if (!submissions || submissions.length === 0) {
      return NextResponse.json({ data: [], error: null, meta: { count: 0 } })
    }

    // Fetch challenge titles for the submission IDs
    const challengeIds = [...new Set(submissions.map((s) => s.challenge_id))]
    const { data: challenges, error: challengesError } = await supabase
      .from('challenges')
      .select('id, title')
      .in('id', challengeIds)

    if (challengesError) throw challengesError

    // Fetch member emails
    const memberIds = [...new Set(submissions.map((s) => s.member_id))]
    const { data: members, error: membersError } = await supabase
      .from('members')
      .select('id, email')
      .in('id', memberIds)

    if (membersError) throw membersError

    const challengeMap = Object.fromEntries((challenges ?? []).map((c) => [c.id, c.title]))
    const memberMap = Object.fromEntries((members ?? []).map((m) => [m.id, m.email]))

    const enriched = submissions.map((s) => ({
      ...s,
      challenge_title: challengeMap[s.challenge_id] ?? s.challenge_id,
      member_email: memberMap[s.member_id] ?? s.member_id,
    }))

    return NextResponse.json({ data: enriched, error: null, meta: { count: enriched.length } })
  } catch (err) {
    return handleError(err)
  }
}
