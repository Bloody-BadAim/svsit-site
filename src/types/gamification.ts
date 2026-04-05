import type { StatCategory } from '@/types/database'

// ---------------------------------------------------------------------------
// Level system
// ---------------------------------------------------------------------------

export type LevelTier = 'onboarding' | 'core' | 'prestige' | 'legendary' | 'bdfl'

export interface LevelDef {
  level: number
  title: string
  xpRequired: number
  cumulativeXp: number
  tier: LevelTier
  color: string
}

// ---------------------------------------------------------------------------
// Badge system
// ---------------------------------------------------------------------------

export type BadgeRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic'
export type BadgeCategory = 'achievement' | 'track' | 'easter_egg' | 'boss'

export interface BadgeDef {
  id: string
  name: string
  description: string
  rarity: BadgeRarity
  xpBonus: number
  icon: string
  category: BadgeCategory
  autoGrantRule: AutoGrantRule | null
}

export type AutoGrantRule =
  | { type: 'scan_count'; count: number }
  | { type: 'borrel_count'; count: number }
  | { type: 'streak'; events: number; days: number }
  | { type: 'all_categories' }
  | { type: 'boss_kills'; count: number }
  | { type: 'category_xp'; category: StatCategory; amount: number }
  | { type: 'all_badges_up_to'; maxRarity: BadgeRarity }
  | { type: 'profile_complete' }
  | { type: 'first_purchase' }
  | { type: 'streak_extended'; events: number; days: number }
  | { type: 'xp_in_day'; amount: number }

export interface MemberBadge {
  id: string
  memberId: string
  badgeId: string
  equipped: boolean
  equippedSlot: number | null
  earnedAt: string
}

// ---------------------------------------------------------------------------
// Accessory system
// ---------------------------------------------------------------------------

export type AccessoryCategory = 'pet' | 'frame' | 'effect' | 'sticker' | 'skin' | 'merch'

export interface AccessoryDef {
  id: string
  name: string
  description: string
  category: AccessoryCategory
  rarity: BadgeRarity
  previewData: Record<string, unknown> | null
  shopPrice: number | null
  unlockRule: UnlockRule | null
  isFeatured: boolean
  isLimitedTime: boolean
  limitedTimeEnd: string | null
  stock: number | null
  createdAt: string
}

export type UnlockRule =
  | { type: 'level'; level: number }
  | { type: 'badge'; badgeId: string }
  | { type: 'boss'; bossFightId: string }
  | { type: 'event'; eventId: string }
  | { type: 'easter_egg'; triggerId: string }

export interface MemberAccessory {
  id: string
  memberId: string
  accessoryId: string
  equipped: boolean
  position: { x: number; y: number } | null
  acquiredVia: 'shop' | 'level_up' | 'boss_fight' | 'event' | 'easter_egg' | 'badge' | 'migration'
  acquiredAt: string
}

// ---------------------------------------------------------------------------
// Boss fights
// ---------------------------------------------------------------------------

export type BossStatus = 'announced' | 'active' | 'defeated' | 'failed'

export interface BossFight {
  id: string
  name: string
  description: string
  hp: number
  currentHp: number
  artworkUrl: string | null
  status: BossStatus
  announcedAt: string | null
  startsAt: string
  deadline: string
  baseRewardXp: number
  baseRewardBadgeId: string | null
  topRewardAccessoryId: string | null
  createdAt: string
}

export interface BossFightContribution {
  id: string
  bossFightId: string
  memberId: string
  xpContributed: number
  updatedAt: string
}

// ---------------------------------------------------------------------------
// XP system
// ---------------------------------------------------------------------------

export type XpSource = 'scan' | 'challenge' | 'boss_fight' | 'badge_unlock' | 'track_completion'

export interface XpTransaction {
  id: string
  memberId: string
  amount: number
  coinsAmount: number
  source: XpSource
  sourceId: string | null
  category: StatCategory | null
  createdAt: string
}

// ---------------------------------------------------------------------------
// Shop
// ---------------------------------------------------------------------------

export interface ShopTransaction {
  id: string
  memberId: string
  accessoryId: string
  coinsSpent: number
  purchasedAt: string
}

// ---------------------------------------------------------------------------
// Rarity config
// ---------------------------------------------------------------------------

export const RARITY_CONFIG: Record<BadgeRarity, { color: string; xpBonus: number; label: string }> = {
  common:    { color: '#888888', xpBonus: 10,  label: 'Common' },
  uncommon:  { color: '#22C55E', xpBonus: 25,  label: 'Uncommon' },
  rare:      { color: '#3B82F6', xpBonus: 50,  label: 'Rare' },
  epic:      { color: '#8B5CF6', xpBonus: 100, label: 'Epic' },
  legendary: { color: '#F59E0B', xpBonus: 250, label: 'Legendary' },
  mythic:    { color: 'rainbow', xpBonus: 500, label: 'Mythic' },
}

// ---------------------------------------------------------------------------
// Card equipment state (what's currently on the card)
// ---------------------------------------------------------------------------

export interface CardEquipment {
  skinId: string | null
  frameId: string | null
  petId: string | null
  effectId: string | null
  stickers: Array<{ accessoryId: string; x: number; y: number }>
  accentColor: string | null
  customTitle: string | null
}
