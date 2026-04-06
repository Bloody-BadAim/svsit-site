import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServiceClient()
  const { data: member } = await supabase.from('members').select('is_admin').eq('id', session.user.id).single()
  if (!member?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { data, error } = await supabase.from('accessory_definitions').insert({
    name: body.name,
    description: body.description,
    category: body.category,
    rarity: body.rarity,
    shop_price: body.shopPrice,
    is_featured: body.isFeatured ?? false,
    is_limited_time: body.isLimitedTime ?? false,
    limited_time_end: body.limitedTimeEnd ?? null,
    stock: body.stock ?? null,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ item: data })
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServiceClient()
  const { data: member } = await supabase.from('members').select('is_admin').eq('id', session.user.id).single()
  if (!member?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { id, ...updates } = body

  const { error } = await supabase.from('accessory_definitions').update(updates).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
