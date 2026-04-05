import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { purchaseItem } from '@/lib/shopEngine'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { accessoryId } = await req.json() as { accessoryId?: string }
  if (!accessoryId) {
    return NextResponse.json({ error: 'Missing accessoryId' }, { status: 400 })
  }

  const result = await purchaseItem(session.user.id, accessoryId)
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
