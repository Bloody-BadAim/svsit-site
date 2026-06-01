import { createServiceClient } from '@/lib/supabase'
import type { MemberAccessory, AccessoryCategory, CardEquipment } from '@/types/gamification'

/** Raw accessory definition row as returned by the Supabase join */
export interface AccessoryDefRow {
  id: string
  name: string
  rarity: string
  category: string
  preview_data: Record<string, unknown> | null
}

/** Extended result from getEquippedAccessories - includes the raw defs so callers skip a follow-up query */
export interface EquippedAccessoriesResult {
  equipment: CardEquipment
  /** Map of accessory ID → definition (only for equipped items) */
  definitions: Map<string, AccessoryDefRow>
}

export async function getInventory(memberId: string): Promise<MemberAccessory[]> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('member_accessories')
    .select('id, member_id, accessory_id, equipped, position, acquired_via, acquired_at')
    .eq('member_id', memberId)
    .order('acquired_at', { ascending: false })

  return (data ?? []).map(mapAccessoryRow)
}

/**
 * Fetch equipped accessories with their definitions in a single join query.
 *
 * @param memberData - If provided, skips the extra members query for accent_color/custom_title.
 *   Pass these from the member row you already fetched.
 */
export async function getEquippedAccessories(
  memberId: string,
  memberData?: { accent_color: string | null; custom_title: string | null },
): Promise<EquippedAccessoriesResult> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('member_accessories')
    .select('*, accessory_definitions(id, name, rarity, category, preview_data)')
    .eq('member_id', memberId)
    .eq('equipped', true)

  const equipment: CardEquipment = {
    skinId: null, frameId: null, petId: null, effectId: null,
    stickers: [], accentColor: null, customTitle: null,
  }

  const definitions = new Map<string, AccessoryDefRow>()

  for (const row of data ?? []) {
    const def = row.accessory_definitions as { id: string; name: string; rarity: string; category: string; preview_data?: Record<string, unknown> | null } | null
    if (!def) continue
    const accessoryId = row.accessory_id as string

    // Store the definition for callers that need it
    definitions.set(accessoryId, {
      id: def.id,
      name: def.name,
      rarity: def.rarity,
      category: def.category,
      preview_data: def.preview_data ?? null,
    })

    switch (def.category) {
      case 'skin': {
        // Prefer preview_data.skinId (maps to CARD_SKINS id), fall back to accessory UUID
        const legacySkinId = (def.preview_data?.skinId as string | undefined) ?? accessoryId
        equipment.skinId = legacySkinId
        break
      }
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

  // Use pre-fetched member data when available, otherwise query
  if (memberData) {
    equipment.accentColor = memberData.accent_color ?? null
    equipment.customTitle = memberData.custom_title ?? null
  } else {
    const { data: member } = await supabase
      .from('members')
      .select('accent_color, custom_title')
      .eq('id', memberId)
      .single()

    equipment.accentColor = (member?.accent_color as string) ?? null
    equipment.customTitle = (member?.custom_title as string) ?? null
  }

  return { equipment, definitions }
}

/**
 * Zorgt dat het lid de accessory bezit. Geeft de categorie terug, of null als
 * het lid 'm niet bezit en niet via level kan ontgrendelen.
 *
 * De winkel bestaat niet meer als unlock-route, dus level-gated accessories
 * worden lazy gegrant: zodra het lid het vereiste level heeft, krijgt het de
 * accessory automatisch bij de eerste keer equippen.
 */
async function ensureOwned(
  supabase: ReturnType<typeof createServiceClient>,
  memberId: string,
  accessoryId: string
): Promise<AccessoryCategory | null> {
  const { data: owned } = await supabase
    .from('member_accessories')
    .select('accessory_id, accessory_definitions(category)')
    .eq('member_id', memberId)
    .eq('accessory_id', accessoryId)
    .single()

  if (owned) {
    const raw = owned.accessory_definitions as unknown
    const def = (Array.isArray(raw) ? raw[0] : raw) as { category: string } | null
    return def ? (def.category as AccessoryCategory) : null
  }

  // Nog niet in bezit: alleen toekennen als de unlock_rule een level is dat het
  // lid al gehaald heeft.
  const { data: def } = await supabase
    .from('accessory_definitions')
    .select('id, category, unlock_rule')
    .eq('id', accessoryId)
    .single()

  if (!def) return null
  const rule = def.unlock_rule as { type?: string; level?: number } | null
  if (rule?.type !== 'level' || typeof rule.level !== 'number') return null

  const { data: member } = await supabase
    .from('members')
    .select('current_level')
    .eq('id', memberId)
    .single()

  const level = member?.current_level ?? 1
  if (level < rule.level) return null

  const { error: grantError } = await supabase.from('member_accessories').insert({
    member_id: memberId,
    accessory_id: accessoryId,
    equipped: false,
    acquired_via: 'level_up',
  })
  if (grantError) return null

  return def.category as AccessoryCategory
}

export async function equipAccessory(memberId: string, accessoryId: string, position?: { x: number; y: number }): Promise<boolean> {
  const supabase = createServiceClient()

  const category = await ensureOwned(supabase, memberId, accessoryId)
  if (!category) return false

  if (category !== 'sticker') {
    const { data: currentEquipped } = await supabase
      .from('member_accessories')
      .select('id, accessory_definitions(category)')
      .eq('member_id', memberId)
      .eq('equipped', true)

    for (const item of currentEquipped ?? []) {
      const itemRaw = item.accessory_definitions as unknown
      const itemDef = (Array.isArray(itemRaw) ? itemRaw[0] : itemRaw) as { category: string } | null
      if (itemDef?.category === category) {
        await supabase.from('member_accessories')
          .update({ equipped: false, position: null })
          .eq('id', item.id as string)
      }
    }
  } else {
    // Count only equipped stickers (not all equipped accessories)
    const { count } = await supabase
      .from('member_accessories')
      .select('id, accessory_definitions!inner(category)', { count: 'exact', head: true })
      .eq('member_id', memberId)
      .eq('equipped', true)
      .eq('accessory_definitions.category', 'sticker')
    // Sticker limit: max 3
    if ((count ?? 0) >= 3) return false
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
