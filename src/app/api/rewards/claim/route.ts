import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'
import { RANKS } from '@/lib/constants'

type MerchRewardId = 'merch_sticker_pack' | 'merch_hoodie' | 'merch_limited_edition'

// Minimum rank required per merch item (by XP threshold)
const MERCH_RANK_REQUIREMENTS: Record<MerchRewardId, number> = {
  merch_sticker_pack: 50,    // Gold
  merch_hoodie: 100,          // Platinum
  merch_limited_edition: 200, // Diamond
}

const VALID_MERCH_IDS = new Set<MerchRewardId>(
  Object.keys(MERCH_RANK_REQUIREMENTS) as MerchRewardId[]
)

// POST — Authenticated member claims their own merch reward
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ data: null, error: 'Niet ingelogd', meta: null }, { status: 401 })
    }

    const body = await req.json() as { reward_id?: string }
    const rewardId = body.reward_id as MerchRewardId

    if (!rewardId || !VALID_MERCH_IDS.has(rewardId)) {
      return NextResponse.json(
        { data: null, error: 'Ongeldig reward_id. Kies: merch_sticker_pack, merch_hoodie, of merch_limited_edition', meta: null },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Fetch member points to verify rank
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('id, points')
      .eq('id', session.user.id)
      .single()

    if (memberError || !member) {
      return NextResponse.json({ data: null, error: 'Lid niet gevonden', meta: null }, { status: 404 })
    }

    const requiredPoints = MERCH_RANK_REQUIREMENTS[rewardId]
    if ((member.points as number) < requiredPoints) {
      // Find the rank name for a friendly error
      const rank = RANKS.find((r) => r.minPunten === requiredPoints)
      const rankName = rank?.naam ?? `${requiredPoints} XP`
      return NextResponse.json(
        { data: null, error: `Je hebt rank ${rankName} nodig om dit te claimen`, meta: null },
        { status: 403 }
      )
    }

    // Check if already claimed
    const { data: existing } = await supabase
      .from('rewards')
      .select('id, claimed_at')
      .eq('member_id', session.user.id)
      .eq('reward_id', rewardId)
      .eq('type', 'merch_claim')
      .maybeSingle()

    if (existing?.claimed_at) {
      return NextResponse.json(
        { data: null, error: 'Al geclaimed', meta: null },
        { status: 409 }
      )
    }

    // Upsert reward with claimed_at timestamp
    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from('rewards')
      .upsert(
        {
          member_id: session.user.id,
          type: 'merch_claim',
          reward_id: rewardId,
          claimed_at: now,
        },
        { onConflict: 'member_id,reward_id' }
      )
      .select('*')
      .single()

    if (error) throw error

    return NextResponse.json({ data, error: null, meta: null }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Onbekende fout'
    return NextResponse.json({ data: null, error: message, meta: null }, { status: 500 })
  }
}
