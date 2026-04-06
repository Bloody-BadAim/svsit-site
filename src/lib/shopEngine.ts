import { createServiceClient } from '@/lib/supabase'

export async function getShopItems(memberLevel: number, isAdmin = false) {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('accessory_definitions')
    .select('id, name, description, category, rarity, shop_price, is_featured, is_limited_time, limited_time_end, stock, unlock_rule, preview_data, created_at')
    .not('shop_price', 'is', null)
    .order('rarity')

  return (data ?? []).map((item) => {
    const rule = item.unlock_rule as { type: string; level?: number } | null
    const locked = rule?.type === 'level' && (rule.level ?? 0) > memberLevel
    const isExpired =
      item.is_limited_time &&
      item.limited_time_end &&
      new Date(item.limited_time_end as string) < new Date()
    const outOfStock = item.stock !== null && (item.stock as number) <= 0

    return {
      id: item.id,
      name: item.name,
      description: item.description ?? '',
      category: item.category,
      rarity: item.rarity,
      shopPrice: item.shop_price as number,
      isFeatured: item.is_featured,
      isLimitedTime: item.is_limited_time,
      limitedTimeEnd: item.limited_time_end,
      stock: item.stock,
      createdAt: item.created_at,
      canBuy: isAdmin ? true : (!locked && !isExpired && !outOfStock),
      locked: isAdmin ? false : locked,
      lockReason: isAdmin ? null : (locked ? `Unlock op Level ${rule?.level}` : null),
    }
  })
}

export type ShopItem = Awaited<ReturnType<typeof getShopItems>>[number]

export async function purchaseItem(
  memberId: string,
  accessoryId: string,
  isAdmin = false
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServiceClient()

  // Fetch item definition (price + stock)
  const { data: item } = await supabase
    .from('accessory_definitions')
    .select('shop_price, stock')
    .eq('id', accessoryId)
    .single()

  if (!item?.shop_price) return { success: false, error: 'Item niet gevonden' }

  const price = item.shop_price as number

  // Admin bypass: free purchase, skip atomic balance check
  if (isAdmin) {
    // Still check duplicate ownership
    const { data: existing } = await supabase
      .from('member_accessories')
      .select('id')
      .eq('member_id', memberId)
      .eq('accessory_id', accessoryId)
      .single()

    if (existing) return { success: false, error: 'Je hebt dit item al' }

    await supabase
      .from('member_accessories')
      .insert({ member_id: memberId, accessory_id: accessoryId, acquired_via: 'shop' })

    await supabase
      .from('shop_transactions')
      .insert({ member_id: memberId, accessory_id: accessoryId, coins_spent: 0 })
  } else {
    // Atomic purchase via Supabase RPC — prevents TOCTOU race condition
    // The RPC checks duplicate ownership, verifies balance, deducts coins,
    // inserts accessory, and logs transaction in a single transaction.
    const { data: result, error } = await supabase.rpc('purchase_item', {
      p_member_id: memberId,
      p_accessory_id: accessoryId,
      p_price: price,
    })

    if (error) return { success: false, error: error.message }

    const rpcResult = result as { success: boolean; error?: string }
    if (!rpcResult.success) return { success: false, error: rpcResult.error }
  }

  // Decrease stock (outside RPC — not race-critical since stock is advisory)
  if (item.stock !== null) {
    await supabase
      .from('accessory_definitions')
      .update({ stock: (item.stock as number) - 1 })
      .eq('id', accessoryId)
  }

  return { success: true }
}
