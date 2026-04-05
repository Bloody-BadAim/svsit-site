import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const supabase = createServiceClient()
    const { searchParams } = new URL(req.url)
    const memberId = searchParams.get('memberId')

    // Top 10 by total_xp
    const { data: top10, error: top10Error } = await supabase
      .from('members')
      .select('id, email, total_xp, current_level, leaderboard_visible')
      .eq('membership_active', true)
      .order('total_xp', { ascending: false })
      .limit(10)

    if (top10Error) throw top10Error

    // Anonymize members who opted out
    const sanitizedTop10 = (top10 ?? []).map((m, i) => ({
      position: i + 1,
      id: m.id,
      name: m.leaderboard_visible ? (m.email as string).split('@')[0] : 'Anoniem Lid',
      totalXp: m.total_xp,
      currentLevel: m.current_level,
      visible: m.leaderboard_visible,
    }))

    let bubble = null
    if (memberId) {
      const { data: member } = await supabase
        .from('members')
        .select('total_xp, current_level, email, leaderboard_visible')
        .eq('id', memberId)
        .single()

      if (member) {
        const { count: aboveCount } = await supabase
          .from('members')
          .select('id', { count: 'exact', head: true })
          .eq('membership_active', true)
          .gt('total_xp', member.total_xp as number)

        const position = (aboveCount ?? 0) + 1

        const { data: above } = await supabase
          .from('members')
          .select('id, email, total_xp, current_level, leaderboard_visible')
          .eq('membership_active', true)
          .gt('total_xp', member.total_xp as number)
          .order('total_xp', { ascending: true })
          .limit(5)

        const { data: below } = await supabase
          .from('members')
          .select('id, email, total_xp, current_level, leaderboard_visible')
          .eq('membership_active', true)
          .lt('total_xp', member.total_xp as number)
          .order('total_xp', { ascending: false })
          .limit(5)

        const mapMember = (m: Record<string, unknown>, pos: number) => ({
          position: pos,
          id: m.id as string,
          name: m.leaderboard_visible ? (m.email as string).split('@')[0] : 'Anoniem Lid',
          totalXp: m.total_xp as number,
          currentLevel: m.current_level as number,
          isYou: m.id === memberId,
        })

        const aboveList = (above ?? [])
          .reverse()
          .map((m, i) => mapMember(m, position - (above?.length ?? 0) + i))
        const belowList = (below ?? []).map((m, i) => mapMember(m, position + 1 + i))

        bubble = {
          position,
          me: {
            id: memberId,
            name: member.leaderboard_visible
              ? (member.email as string).split('@')[0]
              : 'Anoniem Lid',
            totalXp: member.total_xp as number,
            currentLevel: member.current_level as number,
          },
          above: aboveList,
          below: belowList,
        }
      }
    }

    return NextResponse.json({ top10: sanitizedTop10, bubble })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Onbekende fout'
    return NextResponse.json({ data: null, error: message, meta: null }, { status: 500 })
  }
}
