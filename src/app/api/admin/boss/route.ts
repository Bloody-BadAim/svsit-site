import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, handleError } from '@/lib/apiAuth'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const result = await requireAdmin()
    if ('error' in result) return result.error

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
    return handleError(err)
  }
}

// ─── PATCH — Update an existing boss fight ──────────────────────────────────

export async function PATCH(req: NextRequest) {
  try {
    const result = await requireAdmin()
    if ('error' in result) return result.error

    const body = await req.json()
    const { id, name, description, hp, startsAt, deadline, baseRewardXp, baseRewardBadgeId, status } = body as {
      id: string
      name?: string
      description?: string
      hp?: number
      startsAt?: string
      deadline?: string
      baseRewardXp?: number
      baseRewardBadgeId?: string | null
      status?: string
    }

    if (!id) {
      return NextResponse.json({ error: 'id is verplicht' }, { status: 400 })
    }

    // Build update object — only include provided fields
    const update: Record<string, unknown> = {}
    if (name !== undefined)              update.name = name
    if (description !== undefined)       update.description = description
    if (hp !== undefined)                update.hp = hp
    if (startsAt !== undefined)          update.starts_at = startsAt
    if (deadline !== undefined)          update.deadline = deadline
    if (baseRewardXp !== undefined)      update.base_reward_xp = baseRewardXp
    if (baseRewardBadgeId !== undefined) update.base_reward_badge_id = baseRewardBadgeId
    if (status !== undefined)            update.status = status

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'Geen velden om te updaten' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('boss_fights')
      .update(update)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ boss: data })
  } catch (err) {
    return handleError(err)
  }
}

// ─── DELETE — Remove a boss fight ───────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  try {
    const result = await requireAdmin()
    if ('error' in result) return result.error

    const body = await req.json()
    const { id } = body as { id: string }

    if (!id) {
      return NextResponse.json({ error: 'id is verplicht' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Check current status — can't delete defeated bosses (rewards already given)
    const { data: boss, error: fetchError } = await supabase
      .from('boss_fights')
      .select('status')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    if (boss.status === 'defeated') {
      return NextResponse.json(
        { error: 'Kan verslagen boss niet verwijderen — rewards zijn al uitgedeeld' },
        { status: 400 }
      )
    }

    // Delete contributions first (foreign key)
    const { error: contribError } = await supabase
      .from('boss_fight_contributions')
      .delete()
      .eq('boss_fight_id', id)

    if (contribError) throw contribError

    // Delete the boss fight
    const { error: deleteError } = await supabase
      .from('boss_fights')
      .delete()
      .eq('id', id)

    if (deleteError) throw deleteError

    return NextResponse.json({ success: true })
  } catch (err) {
    return handleError(err)
  }
}
