import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const allowed = ['custom_title', 'accent_color', 'display_name']
  const updates: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) updates[key] = body[key]
  }

  if (Object.keys(updates).length === 0) return NextResponse.json({ error: 'No valid fields' }, { status: 400 })

  const supabase = createServiceClient()
  const { error } = await supabase.from('members').update(updates).eq('id', session.user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
