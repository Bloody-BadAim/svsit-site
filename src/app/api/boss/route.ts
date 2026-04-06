import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getActiveBoss, getBossContributions, getMemberContribution } from '@/lib/bossEngine'

export async function GET() {
  const session = await auth()
  const boss = await getActiveBoss()
  if (!boss) return NextResponse.json({ boss: null, contributions: { total: 0, contributors: 0, top3: [] }, myContribution: 0 })

  const [contributions, myContribution] = await Promise.all([
    getBossContributions(boss.id),
    session?.user?.id ? getMemberContribution(boss.id, session.user.id) : Promise.resolve(0),
  ])

  return NextResponse.json({ boss, contributions, myContribution })
}
