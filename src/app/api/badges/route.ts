import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { handleError } from '@/lib/apiAuth'
import { equipBadge, unequipBadge } from '@/lib/badgeEngine'
import { getBadgeSlotCount } from '@/lib/levelEngine'
import { createServiceClient } from '@/lib/supabase'

// POST /api/badges — equip or unequip a badge via the member_badges table
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const { badgeId, slot, action } = await req.json() as {
      badgeId: string
      slot?: number
      action: 'equip' | 'unequip'
    }

    if (!badgeId || !action) {
      return NextResponse.json({ error: 'badgeId en action zijn verplicht' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { data: member } = await supabase
      .from('members')
      .select('current_level, is_admin, role')
      .eq('id', session.user.id)
      .single()

    const isPrivileged = member?.is_admin || member?.role === 'bestuur'
    const maxSlots = isPrivileged ? 6 : getBadgeSlotCount(member?.current_level ?? 1)

    if (action === 'equip') {
      const targetSlot = slot ?? 0
      const success = await equipBadge(session.user.id, badgeId, targetSlot, maxSlots)
      return NextResponse.json({ success })
    } else if (action === 'unequip') {
      const success = await unequipBadge(session.user.id, badgeId)
      return NextResponse.json({ success })
    } else {
      return NextResponse.json({ error: 'Onbekende action' }, { status: 400 })
    }
  } catch (err) {
    return handleError(err)
  }
}
