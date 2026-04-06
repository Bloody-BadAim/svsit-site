'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Lock } from 'lucide-react'
import { RARITY_CONFIG } from '@/types/gamification'
import type { AccessoryCategory, BadgeRarity, UnlockRule } from '@/types/gamification'
import MemberCard from '@/components/MemberCard'
import type { MemberCardEquipment } from '@/components/MemberCard'

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

type Tab = { id: AccessoryCategory; label: string; mono: string }

const TABS: Tab[] = [
  { id: 'skin',    label: 'Skins',    mono: 'skin'    },
  { id: 'frame',   label: 'Frames',   mono: 'frame'   },
  { id: 'pet',     label: 'Pets',     mono: 'pet'     },
  { id: 'effect',  label: 'Effects',  mono: 'effect'  },
  { id: 'sticker', label: 'Stickers', mono: 'sticker' },
  { id: 'merch',   label: 'Flair',    mono: 'flair'   },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PRESET_COLORS = [
  '#F59E0B', // gold
  '#3B82F6', // blue
  '#EF4444', // red
  '#22C55E', // green
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#F97316', // orange
  '#14B8A6', // teal
]

function getRarityColor(rarity: BadgeRarity): string {
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
  if (shopPrice != null) return `${shopPrice} coins in shop`
  return 'Vergrendeld'
}

// ---------------------------------------------------------------------------
// Card Preview
// ---------------------------------------------------------------------------

interface CardPreviewProps {
  equippedMap: Map<AccessoryCategory, MemberAccessoryRow>
  member: MemberData
  accentColor: string
}

function CardPreview({ equippedMap, member, accentColor }: CardPreviewProps) {
  const skin = equippedMap.get('skin')
  const frame = equippedMap.get('frame')
  const pet = equippedMap.get('pet')
  const effect = equippedMap.get('effect')

  const skinDef = skin?.accessory_definitions
  const frameDef = frame?.accessory_definitions
  const petDef = pet?.accessory_definitions
  const effectDef = effect?.accessory_definitions

  // Build equipment object for MemberCard
  const frameColor = frameDef
    ? getRarityColor(frameDef.rarity)
    : undefined

  const petEmoji = petDef
    ? ((petDef.preview_data?.petId as string | undefined) ?? (petDef.preview_data?.emoji as string | undefined))
    : undefined

  const effectName = effectDef?.name

  const equipment: MemberCardEquipment = {
    frameColor,
    petEmoji,
    effectName,
    accentColor: accentColor || undefined,
    customTitle: member.custom_title ?? undefined,
  }

  // Skin: use the skin id stored in the skin accessory definition, or fall back to member.active_skin
  const activeSkin = skinDef
    ? (skinDef.preview_data?.skinId as string | undefined) ?? member.active_skin
    : member.active_skin

  return (
    <div className="flex flex-col items-center gap-4">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: 'var(--color-text-muted)' }}>
        live preview
      </span>

      <MemberCard
        style={{ width: 260 }}
        data={{
          name: 'preview',
          role: 'member',
          commissie: null,
          total_xp: (member.current_level ?? 1) * 100,
          skin: activeSkin,
        }}
        equipment={equipment}
      />

      {/* Equipped summary */}
      <div className="w-full space-y-1 font-mono text-[10px]" style={{ maxWidth: 260 }}>
        {(['skin', 'frame', 'pet', 'effect'] as AccessoryCategory[]).map((cat) => {
          const row = equippedMap.get(cat)
          return (
            <div key={cat} className="flex items-center justify-between">
              <span style={{ color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {cat}
              </span>
              <span style={{ color: row ? 'var(--color-text-muted)' : 'rgba(255,255,255,0.15)' }}>
                {row?.accessory_definitions?.name ?? 'none'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Accessory Grid Item
// ---------------------------------------------------------------------------

interface AccessoryItemProps {
  def: AccessoryDefinition
  owned: MemberAccessoryRow | undefined
  isEquipped: boolean
  onEquip: (id: string) => void
  onUnequip: (id: string) => void
}

function AccessoryItem({ def, owned, isEquipped, onEquip, onUnequip }: AccessoryItemProps) {
  const [hovered, setHovered] = useState(false)
  const isLocked = !owned
  const rarityColor = def.rarity === 'mythic' ? '#F59E0B' : RARITY_CONFIG[def.rarity].color

  function handleClick() {
    if (isLocked) return
    if (isEquipped) {
      onUnequip(def.id)
    } else {
      onEquip(def.id)
    }
  }

  return (
    <div
      className="relative flex flex-col gap-1.5"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Item tile */}
      <button
        onClick={handleClick}
        disabled={isLocked}
        className="relative w-full aspect-square rounded-lg overflow-hidden transition-all duration-200 cursor-pointer disabled:cursor-default"
        style={{
          backgroundColor: isEquipped
            ? `${rarityColor}18`
            : 'rgba(255,255,255,0.03)',
          border: isEquipped
            ? `2px solid ${rarityColor}`
            : isLocked
              ? `1px dashed rgba(255,255,255,0.06)`
              : '1px solid rgba(255,255,255,0.08)',
          boxShadow: isEquipped
            ? `0 0 10px ${rarityColor}44`
            : 'none',
          opacity: isLocked ? 0.45 : 1,
        }}
      >

        {/* Content area */}
        <div className="absolute inset-0 flex items-center justify-center">
          {def.preview_data?.emoji ? (
            <span className="text-2xl">{def.preview_data.emoji as string}</span>
          ) : (
            <div
              className="w-8 h-8 rounded-full"
              style={{ background: rarityColor, opacity: 0.6 }}
            />
          )}
        </div>

        {/* Lock overlay */}
        {isLocked && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: 'rgba(9,9,11,0.5)', zIndex: 5 }}
          >
            <Lock size={14} style={{ color: 'rgba(255,255,255,0.2)' }} />
          </div>
        )}

        {/* Equipped checkmark */}
        {isEquipped && (
          <div
            className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center rounded-full"
            style={{ backgroundColor: rarityColor, zIndex: 6 }}
          >
            <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
              <path d="M2 5l2 2 4-4" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}

        {/* Rarity corner pip */}
        <div
          className="absolute bottom-1 left-1 w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: rarityColor, opacity: 0.8 }}
        />
      </button>

      {/* Item name */}
      <span
        className="font-mono text-[10px] text-center leading-tight truncate"
        style={{
          color: isEquipped
            ? rarityColor
            : isLocked
              ? 'rgba(255,255,255,0.2)'
              : 'var(--color-text-muted)',
        }}
      >
        {def.name}
      </span>

      {/* Rarity label */}
      <span
        className="font-mono text-[9px] text-center uppercase tracking-[0.08em]"
        style={{ color: isLocked ? 'rgba(255,255,255,0.12)' : `${rarityColor}99` }}
      >
        {RARITY_CONFIG[def.rarity].label}
      </span>

      {/* Tooltip */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            className="absolute z-50 bottom-full mb-2 left-1/2 -translate-x-1/2 pointer-events-none"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.12 }}
          >
            <div
              className="px-3 py-2 font-mono text-[10px] whitespace-nowrap"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
              }}
            >
              <div className="font-bold mb-0.5">{def.name}</div>
              {def.description && (
                <div style={{ color: 'var(--color-text-muted)', maxWidth: 180, whiteSpace: 'normal' }}>
                  {def.description}
                </div>
              )}
              {isLocked ? (
                <div className="mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {unlockLabel(def.unlock_rule, def.shop_price)}
                </div>
              ) : isEquipped ? (
                <div className="mt-1" style={{ color: rarityColor }}>
                  Geequipped — klik om te verwijderen
                </div>
              ) : (
                <div className="mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Klik om te equippen
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Flair Tab
// ---------------------------------------------------------------------------

interface FlairTabProps {
  memberLevel: number
  initialAccentColor: string | null
  initialCustomTitle: string | null
  initialLeaderboardVisible: boolean
  onAccentColorChange: (color: string) => void
}

function FlairTab({ memberLevel, initialAccentColor, initialCustomTitle, initialLeaderboardVisible, onAccentColorChange }: FlairTabProps) {
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
    <div className="p-5 space-y-6">

      {/* Leaderboard visibility */}
      <div>
        <div className="font-mono text-xs uppercase tracking-[0.15em] mb-3" style={{ color: 'var(--color-text-muted)' }}>
          Leaderboard
        </div>
        <div className="flex items-center justify-between w-full gap-4">
          <span className="text-sm" style={{ color: 'var(--color-text)' }}>Toon mij op het leaderboard</span>
          <button
            role="switch"
            aria-checked={leaderboardVisible}
            onClick={() => setLeaderboardVisible(!leaderboardVisible)}
            className="relative shrink-0 w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer"
            style={{
              backgroundColor: leaderboardVisible ? 'var(--color-accent-gold)' : 'rgba(255,255,255,0.1)',
              border: '1px solid',
              borderColor: leaderboardVisible ? 'var(--color-accent-gold)' : 'rgba(255,255,255,0.15)',
            }}
          >
            <span
              className="absolute top-0.5 w-5 h-5 rounded-full transition-transform duration-200"
              style={{
                backgroundColor: leaderboardVisible ? 'var(--color-bg)' : 'rgba(255,255,255,0.4)',
                transform: leaderboardVisible ? 'translateX(21px)' : 'translateX(2px)',
              }}
            />
          </button>
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px dashed rgba(255,255,255,0.06)' }} />

      {/* Accent color */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="font-mono text-xs uppercase tracking-[0.15em]" style={{ color: 'var(--color-text-muted)' }}>
            Accent kleur
          </div>
          {!canAccentColor && (
            <span
              className="font-mono text-[9px] px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.3)',
              }}
            >
              Unlock op Level 6
            </span>
          )}
        </div>
        <div className={`flex flex-wrap gap-2 mb-3 ${!canAccentColor ? 'opacity-40 pointer-events-none' : ''}`}>
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => handleColorSelect(color)}
              disabled={!canAccentColor}
              className="w-8 h-8 rounded-lg transition-all duration-150 cursor-pointer disabled:cursor-not-allowed"
              style={{
                backgroundColor: color,
                outline: accentColor === color ? `2px solid ${color}` : '2px solid transparent',
                outlineOffset: 2,
                boxShadow: accentColor === color ? `0 0 10px ${color}66` : 'none',
              }}
              title={color}
            />
          ))}
          {/* Custom color picker */}
          <label className={`relative w-8 h-8 rounded-lg overflow-hidden ${canAccentColor ? 'cursor-pointer' : 'cursor-not-allowed pointer-events-none'}`} title="Eigen kleur">
            <input
              type="color"
              value={accentColor}
              onChange={(e) => handleColorSelect(e.target.value)}
              disabled={!canAccentColor}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div
              className="w-full h-full flex items-center justify-center text-[10px] font-mono"
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
        <div className="font-mono text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
          Huidige kleur: <span style={{ color: accentColor }}>{accentColor}</span>
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px dashed rgba(255,255,255,0.06)' }} />

      {/* Custom title */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="font-mono text-xs uppercase tracking-[0.15em]" style={{ color: 'var(--color-text-muted)' }}>
            Custom titel
          </span>
          {!canCustomTitle && (
            <span
              className="font-mono text-[9px] px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.3)',
              }}
            >
              Unlock op Level 8
            </span>
          )}
        </div>
        <input
          type="text"
          value={customTitle}
          onChange={(e) => setCustomTitle(e.target.value.slice(0, 30))}
          disabled={!canCustomTitle}
          placeholder={canCustomTitle ? 'Jouw custom titel...' : 'Level 8 nodig'}
          maxLength={30}
          className="w-full font-mono text-sm px-3 py-2 rounded-lg outline-none transition-all"
          style={{
            backgroundColor: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: canCustomTitle ? 'var(--color-text)' : 'rgba(255,255,255,0.2)',
            opacity: canCustomTitle ? 1 : 0.5,
          }}
        />
        <div className="font-mono text-[10px] mt-1 text-right" style={{ color: 'rgba(255,255,255,0.2)' }}>
          {customTitle.length}/30
        </div>
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="font-mono text-sm px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-50"
        style={{
          backgroundColor: saved ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
          border: `1px solid ${saved ? '#22C55E' : '#F59E0B'}`,
          color: saved ? '#22C55E' : '#F59E0B',
        }}
      >
        {saving ? 'Opslaan...' : saved ? 'Opgeslagen!' : 'Opslaan'}
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

  // Build owned accessory set (accessory_id -> row)
  // Admins see all definitions as owned
  const ownedMap = new Map<string, MemberAccessoryRow>()
  for (const row of inventory) {
    ownedMap.set(row.accessory_id, row)
  }
  if (isAdmin) {
    for (const def of allDefinitions) {
      if (!ownedMap.has(def.id)) {
        // Synthesize a virtual owned row so the item appears unlocked
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

  // Build equipped map (category -> row) — reactive state
  const [equippedMap, setEquippedMap] = useState<Map<AccessoryCategory, MemberAccessoryRow>>(() => {
    const m = new Map<AccessoryCategory, MemberAccessoryRow>()
    for (const row of equipped) {
      const def = row.accessory_definitions
      if (def) m.set(def.category, row)
    }
    return m
  })

  const [accentColor, setAccentColor] = useState(member.accent_color ?? '#F59E0B')

  // Filter definitions for active tab
  const tabDefs = allDefinitions.filter((d) => d.category === activeTab)

  const handleEquip = useCallback(async (accessoryId: string) => {
    setSaving(accessoryId)
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessoryId }),
      })
      if (res.ok) {
        // Update local equipped map optimistically
        const row = ownedMap.get(accessoryId)
        if (row?.accessory_definitions) {
          const cat = row.accessory_definitions.category
          setEquippedMap((prev) => {
            const next = new Map(prev)
            next.set(cat, { ...row, equipped: true })
            return next
          })
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
          setEquippedMap((prev) => {
            const next = new Map(prev)
            next.delete(cat)
            return next
          })
        }
      }
    } finally {
      setSaving(null)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownedMap])

  return (
    <div className="flex flex-col xl:flex-row gap-6">
      {/* Left: Card preview */}
      <div
        className="xl:w-72 shrink-0 rounded-xl p-6 flex flex-col items-center gap-6"
        style={{
          backgroundColor: 'rgba(255,255,255,0.02)',
          border: '1px solid var(--color-border)',
        }}
      >
        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 pointer-events-none" style={{ borderColor: 'var(--color-accent-gold)' }} />

        <CardPreview
          equippedMap={equippedMap}
          member={{ ...member, current_level: member.current_level ?? 1 }}
          accentColor={accentColor}
        />

        {/* Coins balance */}
        <div
          className="w-full flex items-center justify-between font-mono text-xs px-3 py-2 rounded-lg"
          style={{
            backgroundColor: 'rgba(245, 158, 11, 0.06)',
            border: '1px solid rgba(245, 158, 11, 0.15)',
          }}
        >
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>Coins</span>
          <span style={{ color: 'var(--color-accent-gold)' }}>{member.coins_balance ?? 0}</span>
        </div>
      </div>

      {/* Right: Tabbed panel */}
      <div
        className="flex-1 rounded-xl overflow-hidden"
        style={{
          backgroundColor: 'rgba(255,255,255,0.02)',
          border: '1px solid var(--color-border)',
        }}
      >
        {/* Tab bar */}
        <div
          className="flex overflow-x-auto"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id
            const equippedInTab = tab.id !== 'merch' ? equippedMap.has(tab.id) : false
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative shrink-0 px-4 py-3 font-mono text-xs uppercase tracking-[0.1em] transition-all duration-150 cursor-pointer"
                style={{
                  color: isActive ? 'var(--color-accent-gold)' : 'var(--color-text-muted)',
                  backgroundColor: isActive ? 'rgba(245, 158, 11, 0.06)' : 'transparent',
                  borderBottom: isActive ? '2px solid var(--color-accent-gold)' : '2px solid transparent',
                }}
              >
                {tab.mono}
                {equippedInTab && (
                  <span
                    className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: 'var(--color-accent-gold)' }}
                  />
                )}
              </button>
            )
          })}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'merch' ? (
              /* Flair tab */
              <FlairTab
                memberLevel={member.current_level ?? 1}
                initialAccentColor={member.accent_color}
                initialCustomTitle={member.custom_title}
                initialLeaderboardVisible={member.leaderboard_visible ?? true}
                onAccentColorChange={setAccentColor}
              />
            ) : tabDefs.length === 0 ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-16 px-6 gap-3">
                <div className="font-mono text-3xl opacity-20">{'{ }'}</div>
                <p className="font-mono text-sm text-center" style={{ color: 'var(--color-text-muted)' }}>
                  Geen {activeTab}s beschikbaar
                </p>
                <p className="font-mono text-xs text-center" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  Unlock via events, level-ups of de shop
                </p>
              </div>
            ) : (
              /* Accessory grid */
              <div className="p-5">
                {/* Header */}
                <div
                  className="flex items-center justify-between mb-4 pb-3"
                  style={{ borderBottom: '1px dashed rgba(255,255,255,0.06)' }}
                >
                  <span className="font-mono text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--color-text-muted)' }}>
                    {activeTab}.collection
                  </span>
                  <div className="flex items-center gap-3 font-mono text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    <span>
                      owned: <span style={{ color: 'var(--color-accent-gold)' }}>
                        {tabDefs.filter(d => ownedMap.has(d.id)).length}
                      </span>
                    </span>
                    <span>/</span>
                    <span>{tabDefs.length} total</span>
                    {saving && (
                      <span style={{ color: 'var(--color-accent-gold)', opacity: 0.7 }}>
                        saving...
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                  {tabDefs.map((def) => {
                    const owned = ownedMap.get(def.id)
                    const isEquipped = equippedMap.get(def.category)?.accessory_id === def.id
                    return (
                      <AccessoryItem
                        key={def.id}
                        def={def}
                        owned={owned}
                        isEquipped={isEquipped}
                        onEquip={handleEquip}
                        onUnequip={handleUnequip}
                      />
                    )
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
