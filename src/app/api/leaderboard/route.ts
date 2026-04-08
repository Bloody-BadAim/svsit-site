import { NextRequest, NextResponse } from 'next/server'
import { handleError } from '@/lib/apiAuth'
import { createServiceClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const supabase = createServiceClient()
    const { searchParams } = new URL(req.url)
    const memberId = searchParams.get('memberId')

    // Top 10 and member lookup can run in parallel
    const [top10Result, memberResult] = await Promise.all([
      supabase
        .from('members')
        .select('id, email, display_name, total_xp, current_level, is_admin')
        .eq('membership_active', true)
        .eq('is_admin', false)
        .order('total_xp', { ascending: false })
        .limit(10),
      memberId
        ? supabase
            .from('members')
            .select('total_xp, current_level, email, display_name')
            .eq('id', memberId)
            .single()
        : Promise.resolve({ data: null, error: null }),
    ])

    if (top10Result.error) throw top10Result.error

    const sanitizedTop10 = (top10Result.data ?? []).map((m, i) => ({
      position: i + 1,
      id: m.id,
      name: (m.display_name as string) || (m.email as string).split('@')[0],
      totalXp: m.total_xp,
      currentLevel: m.current_level,
    }))

    let bubble = null
    const member = memberResult.data
    if (memberId && member) {
      // Above count, above list, and below list are independent — run in parallel
      const [aboveCountResult, aboveResult, belowResult] = await Promise.all([
        supabase
          .from('members')
          .select('id', { count: 'exact', head: true })
          .eq('membership_active', true)
          .eq('is_admin', false)
          .gt('total_xp', member.total_xp as number),
        supabase
          .from('members')
          .select('id, email, display_name, total_xp, current_level, is_admin')
          .eq('membership_active', true)
          .eq('is_admin', false)
          .gt('total_xp', member.total_xp as number)
          .order('total_xp', { ascending: true })
          .limit(5),
        supabase
          .from('members')
          .select('id, email, display_name, total_xp, current_level, is_admin')
          .eq('membership_active', true)
          .eq('is_admin', false)
          .lt('total_xp', member.total_xp as number)
          .order('total_xp', { ascending: false })
          .limit(5),
      ])

      const position = (aboveCountResult.count ?? 0) + 1

      const mapMember = (m: Record<string, unknown>, pos: number) => ({
        position: pos,
        id: m.id as string,
        name: (m.display_name as string) || (m.email as string).split('@')[0],
        totalXp: m.total_xp as number,
        currentLevel: m.current_level as number,
        isYou: m.id === memberId,
      })

      const above = aboveResult.data
      const below = belowResult.data
      const aboveList = (above ?? [])
        .reverse()
        .map((m, i) => mapMember(m, position - (above?.length ?? 0) + i))
      const belowList = (below ?? []).map((m, i) => mapMember(m, position + 1 + i))

      bubble = {
        position,
        me: {
          id: memberId,
          name: (member.display_name as string) || (member.email as string).split('@')[0],
          totalXp: member.total_xp as number,
          currentLevel: member.current_level as number,
        },
        above: aboveList,
        below: belowList,
      }
    }

    return NextResponse.json({ top10: sanitizedTop10, bubble })
  } catch (err) {
    return handleError(err)
  }
}
