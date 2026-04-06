import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getActiveBoss, getBossContributions, getMemberContribution, checkBossStatus } from '@/lib/bossEngine'

export async function GET() {
  const session = await auth()
  const boss = await getActiveBoss()
  if (!boss) return NextResponse.json({ boss: null, contributions: { total: 0, contributors: 0, top3: [] }, myContribution: 0 })

  // Trigger lazy status transitions (announced→active, active→defeated/failed)
  const currentStatus = await checkBossStatus(boss.id)
  boss.status = currentStatus

  const contributions = await getBossContributions(boss.id)
  const myContribution = session?.user?.id ? await getMemberContribution(boss.id, session.user.id) : 0

  return NextResponse.json({ boss, contributions, myContribution })
}
