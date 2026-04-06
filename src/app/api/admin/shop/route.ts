import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, handleError } from '@/lib/apiAuth'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const result = await requireAdmin()
    if ('error' in result) return result.error

    const supabase = createServiceClient()
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

    if (error) throw error
    return NextResponse.json({ item: data })
  } catch (err) {
    return handleError(err)
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const result = await requireAdmin()
    if ('error' in result) return result.error

    const supabase = createServiceClient()
    const body = await req.json()
    const { id, ...updates } = body

    const { error } = await supabase.from('accessory_definitions').update(updates).eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err) {
    return handleError(err)
  }
}
