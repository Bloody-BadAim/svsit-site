'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Lock, X as XIcon, Save, ChevronRight, Eye, Coins } from 'lucide-react'
import { RARITY_CONFIG } from '@/types/gamification'
import type { AccessoryCategory, BadgeRarity, UnlockRule } from '@/types/gamification'
import MemberCard from '@/components/MemberCard'
import type { MemberCardEquipment } from '@/components/MemberCard'
import { resolvePetComponent } from '@/components/pets'
import { getRarityColor } from '@/lib/badgeDefs'
import { getSkin, CARD_SKINS } from '@/lib/cardSkins'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AccessoryDefinition {
  id: string
  name: string
  description: string
  category: AccessoryCategory
  rarity: BadgeRarity
  preview_data: Record<string, unknown> | null
  shop_price: number | null
  unlock_rule: UnlockRule | null
  is_featured: boolean
  is_limited_time: boolean
}

interface MemberAccessoryRow {
  id: string
  member_id: string
  accessory_id: string
  equipped: boolean
  position: { x: number; y: number } | null
  acquired_via: string
  acquired_at: string
  accessory_definitions: AccessoryDefinition | null
}

interface MemberData {
  current_level: number
  accent_color: string | null
  custom_title: string | null
  leaderboard_visible: boolean
  active_skin: string
  coins_balance: number
}

interface CardEditorProps {
  inventory: MemberAccessoryRow[]
  equipped: MemberAccessoryRow[]
  allDefinitions: AccessoryDefinition[]
  member: MemberData
  memberId: string
  isAdmin?: boolean
}

// ---------------------------------------------------------------------------
// Tab config
// ---------------------------------------------------------------------------

type TabDef = { id: AccessoryCategory; label: string }

const TABS: TabDef[] = [
  { id: 'skin',    label: 'SKIN'    },
  { id: 'frame',   label: 'FRAME'   },
  { id: 'pet',     label: 'PET'     },
  { id: 'effect',  label: 'EFFECT'  },
  { id: 'sticker', label: 'STICKER' },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PRESET_COLORS = [
  '#F59E0B', '#3B82F6', '#EF4444', '#22C55E',
  '#8B5CF6', '#EC4899', '#F97316', '#14B8A6',
]

function getRarityBorder(rarity: BadgeRarity): string {
  if (rarity === 'mythic') return 'conic-gradient(from 0deg, #f59e0b, #ef4444, #8b5cf6, #3b82f6, #22c55e, #f59e0b)'
  return RARITY_CONFIG[rarity].color
}

function unlockLabel(rule: UnlockRule | null, shopPrice: number | null): string {
  if (rule) {
    if (rule.type === 'level') return `Level ${rule.level} nodig`
    if (rule.type === 'badge') return 'Badge nodig'
    if (rule.type === 'boss') return 'Boss fight reward'
    if (rule.type === 'event') return 'Event reward'
    if (rule.type === 'easter_egg') return 'Easter egg'
  }
  if (shopPrice != null) return `${shopPrice} coins`
  return 'Vergrendeld'
}

// ---------------------------------------------------------------------------
// Item visual preview helpers
// ---------------------------------------------------------------------------

function PetPreview({ petId, size = 28 }: { petId: string; size?: number }) {
  const PetComponent = resolvePetComponent(petId)
  if (PetComponent) return <PetComponent size={size} />
  return <div className="w-6 h-6 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }} />
}

function SkinPreview({ skinId }: { skinId: string }) {
  const skin = getSkin(skinId)
  return (
    <div
      className="w-full h-full rounded"
      style={{
        background: skin.background,
        border: `2px solid transparent`,
        backgroundClip: 'padding-box',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        className="absolute inset-0"
        style={{ background: skin.border, opacity: 0.6 }}
      />
      <div
        className="absolute inset-[2px] rounded-sm"
        style={{ background: skin.background }}
      />
      {skin.animated && (
        <div
          className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full"
          style={{ background: skin.accent, animation: 'pulse 2s ease-in-out infinite' }}
        />
      )}
    </div>
  )
}

function FramePreview({ def }: { def: AccessoryDefinition }) {
  const name = def.name.toLowerCase()

  let outerStyle: React.CSSProperties = {}
  let innerStyle: React.CSSProperties = {}

  if (name.includes('neon')) {
    // Neon Frame — cyan electric glow
    outerStyle = {
      background: 'rgba(0,255,255,0.08)',
      border: '2px solid #00e5ff',
      boxShadow: '0 0 12px rgba(0,229,255,0.5), inset 0 0 8px rgba(0,229,255,0.15)',
    }
    innerStyle = {
      border: '1.5px solid #00e5ff',
      boxShadow: '0 0 6px rgba(0,229,255,0.4)',
      opacity: 0.7,
    }
  } else if (name.includes('matrix')) {
    // Matrix Frame — green scanline pattern
    outerStyle = {
      background: 'repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(0,255,70,0.12) 3px, rgba(0,255,70,0.12) 4px)',
      border: '2px solid #00ff46',
      boxShadow: '0 0 10px rgba(0,255,70,0.3)',
    }
    innerStyle = {
      border: '1.5px solid #00ff46',
      opacity: 0.5,
      background: 'rgba(0,255,70,0.06)',
    }
  } else if (name.includes('gold')) {
    // Gold Frame — gold shimmer gradient
    outerStyle = {
      background: 'linear-gradient(135deg, #b8860b, #ffd700, #daa520, #ffd700, #b8860b)',
      boxShadow: '0 0 14px rgba(255,215,0,0.4)',
    }
    innerStyle = {
      border: '1.5px solid rgba(255,215,0,0.8)',
      background: 'rgba(0,0,0,0.3)',
      opacity: 0.8,
    }
  } else if (name.includes('ice') || name.includes('crystal')) {
    // Ice Crystal Frame — blue/white crystalline
    outerStyle = {
      background: 'linear-gradient(135deg, rgba(173,216,230,0.2), rgba(135,206,250,0.15), rgba(255,255,255,0.1))',
      border: '2px solid #87cefa',
      boxShadow: '0 0 10px rgba(135,206,250,0.35), inset 0 0 6px rgba(255,255,255,0.1)',
    }
    innerStyle = {
      border: '1.5px solid rgba(173,216,230,0.7)',
      background: 'linear-gradient(45deg, rgba(255,255,255,0.08), rgba(135,206,250,0.12))',
      opacity: 0.7,
    }
  } else if (name.includes('fire') || name.includes('flame')) {
    // Fire Frame — red/orange flame gradient
    outerStyle = {
      background: 'linear-gradient(180deg, #ef4444, #f97316, #facc15)',
      boxShadow: '0 0 14px rgba(239,68,68,0.45)',
    }
    innerStyle = {
      border: '1.5px solid rgba(250,204,21,0.7)',
      background: 'rgba(0,0,0,0.3)',
      opacity: 0.8,
    }
  } else {
    // Fallback — rarity-based (for unknown frames)
    const color = getRarityBorder(def.rarity)
    const isGradient = color.includes('gradient')
    outerStyle = {
      background: isGradient ? color : undefined,
      backgroundColor: isGradient ? undefined : `${color}15`,
      border: isGradient ? undefined : `2px solid ${color}`,
      boxShadow: `0 0 8px ${getRarityColor(def.rarity)}44`,
    }
    innerStyle = {
      border: `1.5px solid ${getRarityColor(def.rarity)}`,
      opacity: 0.5,
    }
  }

  return (
    <div
      className="w-full h-full rounded flex items-center justify-center"
      style={outerStyle}
    >
      <div
        className="w-[60%] h-[60%] rounded-sm"
        style={innerStyle}
      />
    </div>
  )
}

function EffectPreview({ effectName, rarity }: { effectName: string; rarity: BadgeRarity }) {
  const color = getRarityColor(rarity)
  const name = effectName.toLowerCase()
  let bgStyle: React.CSSProperties = { background: `${color}20` }
  if (name.includes('sparkle')) {
    bgStyle = {
      background: `radial-gradient(circle at 30% 30%, ${color}40, transparent 60%), radial-gradient(circle at 70% 70%, ${color}30, transparent 50%)`,
    }
  } else if (name.includes('matrix')) {
    bgStyle = {
      background: `repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(0,255,70,0.1) 3px, rgba(0,255,70,0.1) 4px)`,
    }
  } else if (name.includes('snow')) {
    bgStyle = {
      background: `radial-gradient(circle at 20% 20%, rgba(255,255,255,0.3) 1px, transparent 1px), radial-gradient(circle at 60% 40%, rgba(255,255,255,0.2) 1px, transparent 1px), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.25) 1px, transparent 1px), #0a0a0f`,
    }
  } else if (name.includes('scanline')) {
    bgStyle = {
      background: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.04) 2px, rgba(255,255,255,0.04) 3px)`,
    }
  } else if (name.includes('smoke')) {
    bgStyle = {
      background: `radial-gradient(ellipse at 50% 80%, rgba(160,160,160,0.2) 0%, transparent 60%)`,
    }
  }
  return (
    <div className="w-full h-full rounded overflow-hidden" style={bgStyle} />
  )
}

function StickerPreview({ def }: { def: AccessoryDefinition }) {
  const content = (def.preview_data?.emoji as string) || (def.preview_data?.content as string) || '?'
  return (
    <div className="w-full h-full rounded flex items-center justify-center text-lg">
      {content}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Item visual for the grid
// ---------------------------------------------------------------------------

function ItemVisual({ def }: { def: AccessoryDefinition }) {
  const petId = def.preview_data?.petId as string | undefined
  const skinId = def.preview_data?.skinId as string | undefined

  switch (def.category) {
    case 'pet':
      return petId ? <PetPreview petId={petId} size={28} /> : <div className="w-7 h-7 rounded-full" style={{ background: getRarityColor(def.rarity), opacity: 0.4 }} />
    case 'skin':
      return skinId ? <SkinPreview skinId={skinId} /> : <SkinPreview skinId="default" />
    case 'frame':
      return <FramePreview def={def} />
    case 'effect':
      return <EffectPreview effectName={def.name} rarity={def.rarity} />
    case 'sticker':
      return <StickerPreview def={def} />
    default:
      return <div className="w-7 h-7 rounded-full" style={{ background: getRarityColor(def.rarity), opacity: 0.4 }} />
  }
}

// ---------------------------------------------------------------------------
// Grid Item
// ---------------------------------------------------------------------------

interface GridItemProps {
  def: AccessoryDefinition
  owned: MemberAccessoryRow | undefined
  isEquipped: boolean
  onEquip: (id: string) => void
  onUnequip: (id: string) => void
  onHoverStart: (def: AccessoryDefinition) => void
  onHoverEnd: () => void
  index: number
}

function GridItem({ def, owned, isEquipped, onEquip, onUnequip, onHoverStart, onHoverEnd, index }: GridItemProps) {
  const isLocked = !owned
  const rarityColor = getRarityColor(def.rarity)

  function handleClick() {
    if (isLocked) return
    if (isEquipped) {
      onUnequip(def.id)
    } else {
      onEquip(def.id)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
    >
      <button
        onClick={handleClick}
        onMouseEnter={() => !isLocked && onHoverStart(def)}
        onMouseLeave={onHoverEnd}
        disabled={isLocked}
        className="relative w-full flex flex-col gap-1.5 group cursor-pointer disabled:cursor-default"
      >
        {/* Tile */}
        <div
          className="relative w-full aspect-square rounded-lg overflow-hidden transition-all duration-200"
          style={{
            backgroundColor: isEquipped
              ? `${rarityColor}18`
              : 'rgba(255,255,255,0.02)',
            border: isEquipped
              ? `2px solid ${rarityColor}`
              : isLocked
                ? '1px dashed rgba(255,255,255,0.06)'
                : '1px solid rgba(255,255,255,0.06)',
            boxShadow: isEquipped
              ? `0 0 12px ${rarityColor}33, inset 0 0 12px ${rarityColor}11`
              : 'none',
            opacity: isLocked ? 0.35 : 1,
          }}
        >
          {/* Visual */}
          <div className="absolute inset-0 flex items-center justify-center p-1.5">
            <ItemVisual def={def} />
          </div>

          {/* Lock */}
          {isLocked && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-1 z-10"
              style={{ backgroundColor: 'rgba(9,9,11,0.6)' }}
            >
              <Lock size={12} style={{ color: 'rgba(255,255,255,0.2)' }} />
              <span className="font-mono text-[8px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
                {unlockLabel(def.unlock_rule, def.shop_price)}
              </span>
            </div>
          )}

          {/* Equipped indicator */}
          {isEquipped && (
            <div
              className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center rounded-full z-10"
              style={{ backgroundColor: rarityColor }}
            >
              <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                <path d="M2 5l2 2 4-4" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}

          {/* Hover glow for unlocked items */}
          {!isLocked && !isEquipped && (
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-0"
              style={{
                background: `radial-gradient(circle at center, ${rarityColor}15, transparent 70%)`,
              }}
            />
          )}

          {/* Rarity pip */}
          <div
            className="absolute bottom-1 left-1 w-1.5 h-1.5 rounded-full z-10"
            style={{ backgroundColor: rarityColor, opacity: 0.6 }}
          />
        </div>

        {/* Name */}
        <span
          className="font-mono text-[10px] text-center leading-tight truncate w-full"
          style={{
            color: isEquipped
              ? rarityColor
              : isLocked
                ? 'rgba(255,255,255,0.15)'
                : 'rgba(255,255,255,0.45)',
          }}
        >
          {def.name}
        </span>

        {/* Rarity tag */}
        <span
          className="font-mono text-[8px] text-center uppercase tracking-[0.1em]"
          style={{ color: isLocked ? 'rgba(255,255,255,0.08)' : `${rarityColor}77` }}
        >
          {RARITY_CONFIG[def.rarity].label}
        </span>
      </button>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Flair Panel (below card)
// ---------------------------------------------------------------------------

interface FlairPanelProps {
  memberLevel: number
  initialAccentColor: string | null
  initialCustomTitle: string | null
  initialLeaderboardVisible: boolean
  onAccentColorChange: (color: string) => void
}

function FlairPanel({ memberLevel, initialAccentColor, initialCustomTitle, initialLeaderboardVisible, onAccentColorChange }: FlairPanelProps) {
  const [accentColor, setAccentColor] = useState(initialAccentColor ?? '#F59E0B')
  const [customTitle, setCustomTitle] = useState(initialCustomTitle ?? '')
  const [leaderboardVisible, setLeaderboardVisible] = useState(initialLeaderboardVisible)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const canCustomTitle = memberLevel >= 8
  const canAccentColor = memberLevel >= 6

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    try {
      const body: Record<string, unknown> = {
        leaderboard_visible: leaderboardVisible,
      }
      if (canAccentColor) body.accent_color = accentColor
      if (canCustomTitle && customTitle.trim()) body.custom_title = customTitle.trim()
      else if (canCustomTitle) body.custom_title = null
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) setSaved(true)
    } finally {
      setSaving(false)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  function handleColorSelect(color: string) {
    setAccentColor(color)
    onAccentColorChange(color)
  }

  return (
    <div
      className="rounded-xl p-4 space-y-4"
      style={{
        backgroundColor: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Title row */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Flair
        </span>
      </div>

      {/* Custom title */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em]" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Title
          </span>
          {!canCustomTitle && (
            <span className="font-mono text-[8px] px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.2)' }}>
              LVL 8
            </span>
          )}
        </div>
        <input
          type="text"
          value={customTitle}
          onChange={(e) => setCustomTitle(e.target.value.slice(0, 30))}
          disabled={!canCustomTitle}
          placeholder={canCustomTitle ? 'Jouw custom titel...' : 'Unlock op level 8'}
          maxLength={30}
          className="w-full font-mono text-xs px-3 py-2 rounded-lg outline-none transition-all"
          style={{
            backgroundColor: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            color: canCustomTitle ? 'var(--color-text)' : 'rgba(255,255,255,0.15)',
            opacity: canCustomTitle ? 1 : 0.5,
          }}
        />
        <div className="font-mono text-[9px] mt-0.5 text-right" style={{ color: 'rgba(255,255,255,0.15)' }}>
          {customTitle.length}/30
        </div>
      </div>

      {/* Accent color */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em]" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Accent
          </span>
          {!canAccentColor && (
            <span className="font-mono text-[8px] px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.2)' }}>
              LVL 6
            </span>
          )}
        </div>
        <div className={`flex flex-wrap gap-1.5 ${!canAccentColor ? 'opacity-30 pointer-events-none' : ''}`}>
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => handleColorSelect(color)}
              disabled={!canAccentColor}
              className="w-6 h-6 rounded-md transition-all duration-150 cursor-pointer disabled:cursor-not-allowed"
              style={{
                backgroundColor: color,
                outline: accentColor === color ? `2px solid ${color}` : '2px solid transparent',
                outlineOffset: 2,
                boxShadow: accentColor === color ? `0 0 8px ${color}55` : 'none',
              }}
              title={color}
            />
          ))}
          <label className={`relative w-6 h-6 rounded-md overflow-hidden ${canAccentColor ? 'cursor-pointer' : 'cursor-not-allowed pointer-events-none'}`} title="Custom">
            <input
              type="color"
              value={accentColor}
              onChange={(e) => handleColorSelect(e.target.value)}
              disabled={!canAccentColor}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div
              className="w-full h-full flex items-center justify-center text-[9px] font-mono font-bold"
              style={{
                background: accentColor,
                outline: !PRESET_COLORS.includes(accentColor) ? `2px solid ${accentColor}` : '2px solid transparent',
                outlineOffset: 2,
              }}
            >
              +
            </div>
          </label>
        </div>
      </div>

      {/* Leaderboard toggle */}
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Leaderboard
        </span>
        <button
          role="switch"
          aria-checked={leaderboardVisible}
          onClick={() => setLeaderboardVisible(!leaderboardVisible)}
          className="relative shrink-0 w-9 h-5 rounded-full transition-colors duration-200 cursor-pointer"
          style={{
            backgroundColor: leaderboardVisible ? 'var(--color-accent-gold)' : 'rgba(255,255,255,0.08)',
            border: '1px solid',
            borderColor: leaderboardVisible ? 'var(--color-accent-gold)' : 'rgba(255,255,255,0.1)',
          }}
        >
          <span
            className="absolute top-0.5 w-4 h-4 rounded-full transition-transform duration-200"
            style={{
              backgroundColor: leaderboardVisible ? 'var(--color-bg)' : 'rgba(255,255,255,0.35)',
              transform: leaderboardVisible ? 'translateX(17px)' : 'translateX(1px)',
            }}
          />
        </button>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full font-mono text-xs px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
        style={{
          backgroundColor: saved ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.08)',
          border: `1px solid ${saved ? '#22C55E44' : '#F59E0B33'}`,
          color: saved ? '#22C55E' : '#F59E0B',
        }}
      >
        <Save size={12} />
        {saving ? 'Opslaan...' : saved ? 'Opgeslagen' : 'Opslaan'}
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main CardEditor
// ---------------------------------------------------------------------------

export function CardEditor({ inventory, equipped, allDefinitions, member, memberId, isAdmin = false }: CardEditorProps) {
  const [activeTab, setActiveTab] = useState<AccessoryCategory>('skin')
  const [saving, setSaving] = useState<string | null>(null)
  const [hoverPreview, setHoverPreview] = useState<AccessoryDefinition | null>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const tabBarRef = useRef<HTMLDivElement>(null)
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 })

  // Build owned accessory set
  const ownedMap = new Map<string, MemberAccessoryRow>()
  for (const row of inventory) {
    ownedMap.set(row.accessory_id, row)
  }
  if (isAdmin) {
    for (const def of allDefinitions) {
      if (!ownedMap.has(def.id)) {
        ownedMap.set(def.id, {
          id: `admin-${def.id}`,
          member_id: memberId,
          accessory_id: def.id,
          equipped: false,
          position: null,
          acquired_via: 'admin',
          acquired_at: new Date().toISOString(),
          accessory_definitions: def,
        })
      }
    }
  }

  // Equipped map (category -> row) — stickers stored separately (multiple allowed)
  const [equippedMap, setEquippedMap] = useState<Map<AccessoryCategory, MemberAccessoryRow>>(() => {
    const m = new Map<AccessoryCategory, MemberAccessoryRow>()
    for (const row of equipped) {
      const def = row.accessory_definitions
      if (def && def.category !== 'sticker') m.set(def.category, row)
    }
    return m
  })

  const [equippedStickers, setEquippedStickers] = useState<MemberAccessoryRow[]>(() =>
    equipped.filter((r) => r.accessory_definitions?.category === 'sticker')
  )

  const [accentColor, setAccentColor] = useState(member.accent_color ?? '#F59E0B')

  // Tab indicator position
  useEffect(() => {
    if (!tabBarRef.current) return
    const activeButton = tabBarRef.current.querySelector(`[data-tab="${activeTab}"]`) as HTMLElement | null
    if (activeButton) {
      setIndicatorStyle({
        left: activeButton.offsetLeft,
        width: activeButton.offsetWidth,
      })
    }
  }, [activeTab])

  // 3D tilt on card
  const handleCardMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientY - rect.top - rect.height / 2) / 20
    const y = -(e.clientX - rect.left - rect.width / 2) / 20
    setTilt({ x, y })
  }, [])

  const handleCardMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 })
  }, [])

  // Filter defs for active tab
  const tabDefs = allDefinitions.filter((d) => d.category === activeTab)

  // Build equipment for card preview, with hover override
  function buildEquipment(): { equipment: MemberCardEquipment; activeSkin: string } {
    const skin = equippedMap.get('skin')
    const frame = equippedMap.get('frame')
    const pet = equippedMap.get('pet')
    const effect = equippedMap.get('effect')

    let skinDef = skin?.accessory_definitions
    let frameDef = frame?.accessory_definitions
    let petDef = pet?.accessory_definitions
    let effectDef = effect?.accessory_definitions

    // Apply hover preview override
    if (hoverPreview) {
      switch (hoverPreview.category) {
        case 'skin': skinDef = hoverPreview; break
        case 'frame': frameDef = hoverPreview; break
        case 'pet': petDef = hoverPreview; break
        case 'effect': effectDef = hoverPreview; break
      }
    }

    const frameColor = frameDef ? getRarityBorder(frameDef.rarity) : undefined

    // Resolve pet identifier: prefer preview_data.petId, fall back to emoji,
    // then derive from the accessory name (e.g. "Debug Bug" → "pet_debug_bug")
    const petEmoji = petDef
      ? ((petDef.preview_data?.petId as string | undefined)
        ?? (petDef.preview_data?.emoji as string | undefined)
        ?? `pet_${petDef.name.toLowerCase().replace(/\s+/g, '_')}`)
      : undefined

    const effectName = effectDef?.name

    // Build stickers array from equipped stickers
    const stickers = equippedStickers.slice(0, 3).map((row) => {
      const emoji = (row.accessory_definitions?.preview_data?.emoji as string)
        || (row.accessory_definitions?.preview_data?.content as string)
        || '?'
      const pos = row.position ?? { x: 50, y: 50 }
      return { id: row.accessory_id, x: pos.x, y: pos.y, emoji }
    })

    const equipment: MemberCardEquipment = {
      frameColor,
      petEmoji,
      effectName,
      stickers: stickers.length > 0 ? stickers : undefined,
      accentColor: accentColor || undefined,
      customTitle: member.custom_title ?? undefined,
    }

    const activeSkin = skinDef
      ? (skinDef.preview_data?.skinId as string | undefined) ?? member.active_skin
      : member.active_skin

    return { equipment, activeSkin }
  }

  const { equipment, activeSkin } = buildEquipment()

  // Equip/unequip handlers
  const handleEquip = useCallback(async (accessoryId: string) => {
    setSaving(accessoryId)
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessoryId }),
      })
      if (res.ok) {
        const row = ownedMap.get(accessoryId)
        if (row?.accessory_definitions) {
          const cat = row.accessory_definitions.category
          if (cat === 'sticker') {
            setEquippedStickers((prev) => {
              if (prev.length >= 3) return prev // max 3
              if (prev.some((s) => s.accessory_id === accessoryId)) return prev
              return [...prev, { ...row, equipped: true }]
            })
          } else {
            setEquippedMap((prev) => {
              const next = new Map(prev)
              next.set(cat, { ...row, equipped: true })
              return next
            })
          }
        }
      }
    } finally {
      setSaving(null)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownedMap])

  const handleUnequip = useCallback(async (accessoryId: string) => {
    setSaving(accessoryId)
    try {
      const res = await fetch('/api/inventory', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessoryId }),
      })
      if (res.ok) {
        const row = ownedMap.get(accessoryId)
        if (row?.accessory_definitions) {
          const cat = row.accessory_definitions.category
          if (cat === 'sticker') {
            setEquippedStickers((prev) => prev.filter((s) => s.accessory_id !== accessoryId))
          } else {
            setEquippedMap((prev) => {
              const next = new Map(prev)
              next.delete(cat)
              return next
            })
          }
        }
      }
    } finally {
      setSaving(null)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownedMap])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col lg:flex-row gap-6 min-h-[600px]"
    >
      {/* ================================================================ */}
      {/* LEFT: Card preview area                                          */}
      {/* ================================================================ */}
      <div className="lg:flex-1 flex flex-col items-center gap-6">
        {/* Header */}
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.25)' }}>
              Live Preview
            </span>
            {hoverPreview && (
              <motion.span
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-1 font-mono text-[10px]"
                style={{ color: getRarityColor(hoverPreview.rarity) }}
              >
                <Eye size={10} />
                {hoverPreview.name}
              </motion.span>
            )}
          </div>
          {saving && (
            <span className="font-mono text-[10px]" style={{ color: 'var(--color-accent-gold)', opacity: 0.6 }}>
              saving...
            </span>
          )}
        </div>

        {/* Card with 3D tilt */}
        <div className="flex-1 flex items-center justify-center w-full">
          <div
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
            style={{
              perspective: 1000,
            }}
          >
            <motion.div
              animate={{ rotateX: tilt.x, rotateY: tilt.y }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <MemberCard
                style={{ width: 320 }}
                data={{
                  name: 'preview',
                  role: 'member',
                  commissie: null,
                  total_xp: (member.current_level ?? 1) * 100,
                  skin: activeSkin,
                }}
                equipment={equipment}
              />
            </motion.div>
          </div>
        </div>

        {/* Equipment summary row */}
        <div className="w-full max-w-[320px] flex items-center gap-2 flex-wrap">
          {(['skin', 'frame', 'pet', 'effect'] as AccessoryCategory[]).map((cat) => {
            const row = equippedMap.get(cat)
            const isHovered = hoverPreview?.category === cat
            return (
              <div
                key={cat}
                className="flex items-center gap-1.5 px-2 py-1 rounded font-mono text-[9px] transition-all duration-200"
                style={{
                  backgroundColor: isHovered ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${isHovered ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.04)'}`,
                }}
              >
                <span style={{ color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {cat}
                </span>
                <ChevronRight size={8} style={{ color: 'rgba(255,255,255,0.1)' }} />
                <span style={{ color: row ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.1)' }}>
                  {isHovered && hoverPreview ? hoverPreview.name : (row?.accessory_definitions?.name ?? 'none')}
                </span>
              </div>
            )
          })}
        </div>

        {/* Coins + Flair panel */}
        <div className="w-full max-w-[320px] space-y-3">
          {/* Coins */}
          <div
            className="flex items-center justify-between font-mono text-xs px-3 py-2 rounded-lg"
            style={{
              backgroundColor: 'rgba(245,158,11,0.04)',
              border: '1px solid rgba(245,158,11,0.1)',
            }}
          >
            <span className="flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
              <Coins size={12} />
              Balance
            </span>
            <span style={{ color: 'var(--color-accent-gold)' }}>{member.coins_balance ?? 0}</span>
          </div>

          {/* Flair */}
          <FlairPanel
            memberLevel={member.current_level ?? 1}
            initialAccentColor={member.accent_color}
            initialCustomTitle={member.custom_title}
            initialLeaderboardVisible={member.leaderboard_visible ?? true}
            onAccentColorChange={setAccentColor}
          />
        </div>
      </div>

      {/* ================================================================ */}
      {/* RIGHT: Item picker panel                                         */}
      {/* ================================================================ */}
      <div
        className="lg:w-[340px] xl:w-[380px] shrink-0 rounded-xl overflow-hidden flex flex-col"
        style={{
          backgroundColor: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Tab bar with sliding indicator */}
        <div className="relative" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div ref={tabBarRef} className="flex">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id
              const equippedInTab = tab.id === 'sticker' ? equippedStickers.length > 0 : equippedMap.has(tab.id)
              return (
                <button
                  key={tab.id}
                  data-tab={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="relative flex-1 py-3 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors duration-150 cursor-pointer"
                  style={{
                    color: isActive ? '#F59E0B' : 'rgba(255,255,255,0.3)',
                  }}
                >
                  {tab.label}
                  {equippedInTab && (
                    <span
                      className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: '#F59E0B' }}
                    />
                  )}
                </button>
              )
            })}
          </div>
          {/* Sliding indicator */}
          <motion.div
            className="absolute bottom-0 h-[2px]"
            animate={{ left: indicatorStyle.left, width: indicatorStyle.width }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            style={{ backgroundColor: '#F59E0B' }}
          />
        </div>

        {/* Panel header */}
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.15em]" style={{ color: 'rgba(255,255,255,0.2)' }}>
            {activeTab}.collection
          </span>
          <div className="flex items-center gap-2 font-mono text-[10px]" style={{ color: 'rgba(255,255,255,0.15)' }}>
            <span>
              <span style={{ color: '#F59E0B' }}>
                {tabDefs.filter(d => ownedMap.has(d.id)).length}
              </span>
              /{tabDefs.length}
            </span>
          </div>
        </div>

        {/* Item grid (scrollable) */}
        <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="p-4"
            >
              {tabDefs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="font-mono text-2xl" style={{ color: 'rgba(255,255,255,0.06)' }}>{'{ }'}</div>
                  <p className="font-mono text-xs text-center" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    Geen {activeTab}s beschikbaar
                  </p>
                  <p className="font-mono text-[10px] text-center" style={{ color: 'rgba(255,255,255,0.1)' }}>
                    Unlock via events, level-ups of de shop
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {tabDefs.map((def, i) => {
                    const owned = ownedMap.get(def.id)
                    const isEquipped = def.category === 'sticker'
                      ? equippedStickers.some((s) => s.accessory_id === def.id)
                      : equippedMap.get(def.category)?.accessory_id === def.id
                    return (
                      <GridItem
                        key={def.id}
                        def={def}
                        owned={owned}
                        isEquipped={isEquipped}
                        onEquip={handleEquip}
                        onUnequip={handleUnequip}
                        onHoverStart={setHoverPreview}
                        onHoverEnd={() => setHoverPreview(null)}
                        index={i}
                      />
                    )
                  })}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
