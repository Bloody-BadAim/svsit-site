import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { handleError } from '@/lib/apiAuth'
import { createServiceClient } from '@/lib/supabase'
import { ADMIN_EMAILS } from '@/lib/constants'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ data: null, error: 'Niet ingelogd', meta: null }, { status: 401 })
    }

    const { memberId } = await params
    const isAdmin = ADMIN_EMAILS.includes(session.user.email ?? '')
    const isOwn = session.user.id === memberId

    if (!isAdmin && !isOwn) {
      return NextResponse.json({ data: null, error: 'Niet geautoriseerd', meta: null }, { status: 403 })
    }

    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('rewards')
      .select('id, member_id, type, reward_id, claimed_at, created_at')
      .eq('member_id', memberId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ data, error: null, meta: null })
  } catch (err) {
    return handleError(err)
  }
}
