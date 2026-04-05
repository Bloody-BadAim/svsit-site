import { createServiceClient } from '@/lib/supabase'
import type { MemberAccessory, AccessoryCategory, CardEquipment } from '@/types/gamification'

export async function getInventory(memberId: string): Promise<MemberAccessory[]> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('member_accessories')
    .select('*')
    .eq('member_id', memberId)
    .order('acquired_at', { ascending: false })

  return (data ?? []).map(mapAccessoryRow)
}

export async function getEquippedAccessories(memberId: string): Promise<CardEquipment> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('member_accessories')
    .select('*, accessory_definitions(*)')
    .eq('member_id', memberId)
    .eq('equipped', true)

  const equipment: CardEquipment = {
    skinId: null, frameId: null, petId: null, effectId: null,
    stickers: [], accentColor: null, customTitle: null,
  }

  for (const row of data ?? []) {
    const def = row.accessory_definitions as { category: string } | null
    if (!def) continue
    const accessoryId = row.accessory_id as string
    switch (def.category) {
      case 'skin': equipment.skinId = accessoryId; break
      case 'frame': equipment.frameId = accessoryId; break
      case 'pet': equipment.petId = accessoryId; break
      case 'effect': equipment.effectId = accessoryId; break
      case 'sticker': {
        const pos = row.position as { x: number; y: number } | null
        equipment.stickers.push({ accessoryId, x: pos?.x ?? 0, y: pos?.y ?? 0 })
        break
      }
    }
  }

  const { data: member } = await supabase
    .from('members')
    .select('accent_color, custom_title')
    .eq('id', memberId)
    .single()

  equipment.accentColor = (member?.accent_color as string) ?? null
  equipment.customTitle = (member?.custom_title as string) ?? null

  return equipment
}

export async function equipAccessory(memberId: string, accessoryId: string, position?: { x: number; y: number }): Promise<boolean> {
  const supabase = createServiceClient()

  const { data: accessory } = await supabase
    .from('member_accessories')
    .select('accessory_id, accessory_definitions(category)')
    .eq('member_id', memberId)
    .eq('accessory_id', accessoryId)
    .single()

  if (!accessory) return false
  const def = accessory.accessory_definitions as { category: string } | null
  if (!def) return false
  const category = def.category as AccessoryCategory

  if (category !== 'sticker') {
    const { data: currentEquipped } = await supabase
      .from('member_accessories')
      .select('id, accessory_definitions(category)')
      .eq('member_id', memberId)
      .eq('equipped', true)

    for (const item of currentEquipped ?? []) {
      const itemDef = item.accessory_definitions as { category: string } | null
      if (itemDef?.category === category) {
        await supabase.from('member_accessories')
          .update({ equipped: false, position: null })
          .eq('id', item.id as string)
      }
    }
  } else {
    const { count } = await supabase
      .from('member_accessories')
      .select('id', { count: 'exact', head: true })
      .eq('member_id', memberId)
      .eq('equipped', true)
    // Sticker limit: max 3 — generous cap here, real enforcement is in the card editor
    if ((count ?? 0) >= 10) return false
  }

  const { error } = await supabase.from('member_accessories')
    .update({ equipped: true, position: position ?? null })
    .eq('member_id', memberId)
    .eq('accessory_id', accessoryId)

  return !error
}

export async function unequipAccessory(memberId: string, accessoryId: string): Promise<boolean> {
  const supabase = createServiceClient()
  const { error } = await supabase.from('member_accessories')
    .update({ equipped: false, position: null })
    .eq('member_id', memberId)
    .eq('accessory_id', accessoryId)
  return !error
}

export async function updateStickerPosition(memberId: string, accessoryId: string, position: { x: number; y: number }): Promise<boolean> {
  const supabase = createServiceClient()
  const { error } = await supabase.from('member_accessories')
    .update({ position })
    .eq('member_id', memberId)
    .eq('accessory_id', accessoryId)
  return !error
}

function mapAccessoryRow(row: Record<string, unknown>): MemberAccessory {
  return {
    id: row.id as string,
    memberId: row.member_id as string,
    accessoryId: row.accessory_id as string,
    equipped: row.equipped as boolean,
    position: row.position as { x: number; y: number } | null,
    acquiredVia: row.acquired_via as MemberAccessory['acquiredVia'],
    acquiredAt: row.acquired_at as string,
  }
}
