import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getActiveBoss, getBossContributions, getMemberContribution } from '@/lib/bossEngine'

export async function GET() {
  const session = await auth()
  const boss = await getActiveBoss()
  if (!boss) return NextResponse.json({ boss: null })

  const contributions = await getBossContributions(boss.id)
  const myContribution = session?.user?.id ? await getMemberContribution(boss.id, session.user.id) : 0

  return NextResponse.json({ boss, contributions, myContribution })
}
