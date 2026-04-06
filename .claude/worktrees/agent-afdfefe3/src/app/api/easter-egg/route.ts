import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { grantBadge } from '@/lib/badgeEngine'

const EASTER_EGG_REWARDS: Record<string, { badgeId: string; accessoryName?: string }> = {
  konami: { badgeId: 'badge_konami' },
  logo_click: { badgeId: 'badge_joined' },
  terminal: { badgeId: 'badge_hacker' },
  time_404: { badgeId: 'badge_404' },
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { triggerId } = await req.json()
  if (!triggerId || !EASTER_EGG_REWARDS[triggerId]) {
    return NextResponse.json({ error: 'Invalid trigger' }, { status: 400 })
  }

  const reward = EASTER_EGG_REWARDS[triggerId]
  const granted = await grantBadge(session.user.id, reward.badgeId)

  return NextResponse.json({ granted, badgeId: reward.badgeId })
}
