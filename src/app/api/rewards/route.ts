import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'
import { ADMIN_EMAILS } from '@/lib/constants'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ data: null, error: 'Niet geautoriseerd', meta: null }, { status: 403 })
    }

    const { member_id, type, reward_id } = await req.json()
    if (!member_id || !type || !reward_id) {
      return NextResponse.json({ data: null, error: 'member_id, type en reward_id zijn verplicht', meta: null }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('rewards')
      .upsert({ member_id, type, reward_id }, { onConflict: 'member_id,reward_id' })
      .select('*')
      .single()

    if (error) throw error
    return NextResponse.json({ data, error: null, meta: null }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Onbekende fout'
    return NextResponse.json({ data: null, error: message, meta: null }, { status: 500 })
  }
}
