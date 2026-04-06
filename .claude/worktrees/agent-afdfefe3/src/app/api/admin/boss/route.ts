import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    if (!session.user.isAdmin) {
      return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 403 })
    }

    const body = await req.json()
    const { name, description, hp, startsAt, deadline, baseRewardXp, baseRewardBadgeId, topRewardAccessoryId } = body as {
      name: string
      description?: string
      hp: number
      startsAt: string
      deadline: string
      baseRewardXp?: number
      baseRewardBadgeId?: string | null
      topRewardAccessoryId?: string | null
    }

    if (!name || !hp || !startsAt || !deadline) {
      return NextResponse.json({ error: 'name, hp, startsAt en deadline zijn verplicht' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('boss_fights')
      .insert({
        name,
        description: description ?? null,
        hp,
        current_hp: 0,
        starts_at: startsAt,
        deadline,
        base_reward_xp: baseRewardXp ?? 0,
        base_reward_badge_id: baseRewardBadgeId ?? null,
        top_reward_accessory_id: topRewardAccessoryId ?? null,
        announced_at: new Date().toISOString(),
        status: 'announced',
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ boss: data })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Onbekende fout'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
