'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, useReducedMotion, AnimatePresence } from 'motion/react'
import { Lock, Check, X, Shield } from 'lucide-react'
import { BADGE_DEFS } from '@/lib/badgeDefs'
import BadgeIcon from '@/components/badges/BadgeIcon'
import { RARITY_CONFIG } from '@/types/gamification'
import type { BadgeRarity } from '@/types/gamification'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BadgesTabProps {
  earnedBadgeIds: string[]
  equippedBadges: Array<{ badgeId: string; slot: number }>
  maxSlots: number
  memberId: string
  isAdmin: boolean
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const RARITY_SORT_ORDER: BadgeRarity[] = ['mythic', 'legendary', 'epic', 'rare', 'uncommon', 'common']

const RARITY_FILTERS: Array<BadgeRarity | 'all'> = [
  'all', 'common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic',
]

// ---------------------------------------------------------------------------
// Equipped Slots
// ---------------------------------------------------------------------------

function EquippedSlots({
  equippedIds,
  maxSlots,
  onUnequip,
  onSlotClick,
  saving,
}: {
  equippedIds: string[]
  maxSlots: number
  onUnequip: (badgeId: string) => void
  onSlotClick: (slotIndex: number) => void
  saving: boolean
}) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div
      className="relative overflow-hidden"
      style={{
        backgroundColor: 'rgba(255,255,255,0.02)',
        border: '1px solid var(--color-border)',
      }}
    >
      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2" style={{ borderColor: 'var(--color-accent-gold)' }} />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2" style={{ borderColor: 'var(--color-accent-gold)' }} />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />

      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <span
          className="font-mono text-[10px] uppercase tracking-[0.2em]"
          style={{ color: 'var(--color-text-muted)' }}
        >
          equipped ({equippedIds.length}/{maxSlots})
        </span>
        <div className="flex items-center gap-2">
          <span
            className="font-mono text-[10px]"
            style={{ color: 'var(--color-text-muted)', border: '1px solid rgba(255,255,255,0.08)', padding: '1px 6px' }}
          >
            {maxSlots} slots
          </span>
          {saving && (
            <span className="font-mono text-[10px]" style={{ color: 'var(--color-accent-gold)', opacity: 0.7 }}>
              saving...
            </span>
          )}
        </div>
      </div>

      {/* Slots row */}
      <div className="px-5 py-4">
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: maxSlots }).map((_, i) => {
            const badgeId = equippedIds[i]
            const badge = badgeId ? BADGE_DEFS.find((b) => b.id === badgeId) : null

            return (
              <motion.div
                key={i}
                className="relative"
                initial={shouldReduceMotion ? {} : { scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 + i * 0.06, type: 'spring', stiffness: 500, damping: 15 }}
              >
                {badge ? (
                  <div
                    className="relative cursor-pointer group"
                    title={`Verwijder ${badge.name}`}
                    onClick={() => onUnequip(badge.id)}
                  >
                    <BadgeIcon badgeId={badge.id} size={28} rarity={badge.rarity} />
                    {/* Unequip overlay on hover */}
                    <div
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ backgroundColor: 'rgba(9,9,11,0.7)', zIndex: 10 }}
                    >
                      <X className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.7)' }} />
                    </div>
                  </div>
                ) : (
                  <button
                    className="flex items-center justify-center cursor-pointer transition-opacity hover:opacity-70"
                    style={{
                      width: 44,
                      height: 44,
                      border: '1px dashed rgba(255,255,255,0.1)',
                    }}
                    onClick={() => onSlotClick(i)}
                    title="Klik om een badge te kiezen"
                  >
                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.12)' }}>+</span>
                  </button>
                )}
              </motion.div>
            )
          })}
        </div>
        <p className="font-mono text-[10px] mt-3" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Klik een badge hieronder om te equippen of verwijderen
        </p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Rarity filter pills
// ---------------------------------------------------------------------------

function RarityFilter({
  active,
  onChange,
}: {
  active: BadgeRarity | 'all'
  onChange: (r: BadgeRarity | 'all') => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {RARITY_FILTERS.map((r) => {
        const isActive = r === active
        const color = r === 'all' ? 'rgba(255,255,255,0.5)' : RARITY_CONFIG[r].color
        const label = r === 'all' ? 'All' : RARITY_CONFIG[r].label

        return (
          <button
            key={r}
            onClick={() => onChange(r)}
            className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 cursor-pointer transition-all duration-150"
            style={{
              color: isActive ? 'var(--color-bg)' : color,
              backgroundColor: isActive ? color : 'transparent',
              border: `1px solid ${isActive ? color : color + '40'}`,
              ...(r === 'mythic' && isActive
                ? {
                    background: 'conic-gradient(from 0deg, #ff0080, #ff8c00, #ffe100, #00ff80, #00cfff, #cc00ff, #ff0080)',
                    color: '#fff',
                    border: '1px solid transparent',
                  }
                : {}),
            }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Badge detail panel
// ---------------------------------------------------------------------------

function BadgeDetail({
  badgeId,
  isEarned,
  earnedAt,
  isEquipped,
  canEquip,
  slotsFulled,
  onEquip,
  onUnequip,
  onClose,
}: {
  badgeId: string
  isEarned: boolean
  earnedAt: string | null
  isEquipped: boolean
  canEquip: boolean
  slotsFulled: boolean
  onEquip: () => void
  onUnequip: () => void
  onClose: () => void
}) {
  const badge = BADGE_DEFS.find((b) => b.id === badgeId)
  if (!badge) return null

  const rarityColor = badge.rarity === 'mythic'
    ? 'rgba(255,255,255,0.9)'
    : RARITY_CONFIG[badge.rarity].color

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.18 }}
      className="relative overflow-hidden"
      style={{
        backgroundColor: 'rgba(14,14,18,0.98)',
        border: `1px solid ${rarityColor}30`,
        boxShadow: `0 0 40px ${rarityColor}10`,
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 cursor-pointer transition-opacity hover:opacity-70"
        style={{ color: 'var(--color-text-muted)' }}
      >
        <X className="w-4 h-4" />
      </button>

      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2" style={{ borderColor: rarityColor }} />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2" style={{ borderColor: rarityColor + '40' }} />

      <div className="p-6 flex gap-5 items-start">
        {/* Large badge icon */}
        <div className="shrink-0 flex items-center justify-center" style={{ width: 64, height: 64 }}>
          <BadgeIcon badgeId={badge.id} size={40} locked={!isEarned} rarity={badge.rarity} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3
              className="text-base font-bold uppercase tracking-wide"
              style={{
                color: 'var(--color-text)',
                fontFamily: "'Big Shoulders Display', var(--font-geist-sans), sans-serif",
              }}
            >
              {badge.name}
            </h3>
            {/* Rarity label */}
            <span
              className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5"
              style={{
                color: rarityColor,
                border: `1px solid ${rarityColor}40`,
                backgroundColor: `${rarityColor}10`,
              }}
            >
              {RARITY_CONFIG[badge.rarity]?.label ?? badge.rarity}
            </span>
          </div>

          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {badge.description}
          </p>

          <div className="mt-3 font-mono text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
            +{badge.xpBonus} XP bonus
          </div>

          {/* Earned / locked status */}
          <div className="mt-2">
            {isEarned ? (
              <div className="flex items-center gap-1.5 font-mono text-[10px]" style={{ color: '#22C55E' }}>
                <Check className="w-3 h-3" />
                {earnedAt
                  ? `Verdiend op ${new Date(earnedAt).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}`
                  : 'Verdiend'
                }
              </div>
            ) : (
              <div className="flex items-center gap-1.5 font-mono text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                <Lock className="w-3 h-3" />
                Vergrendeld
                {badge.autoGrantRule === null && (
                  <span style={{ color: 'rgba(255,255,255,0.2)' }}> — automatisch toegekend door bestuur</span>
                )}
              </div>
            )}
          </div>

          {/* Equip / unequip actions */}
          {isEarned && (
            <div className="mt-3 flex gap-2">
              {isEquipped ? (
                <button
                  onClick={onUnequip}
                  className="font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 cursor-pointer transition-opacity hover:opacity-80 inline-flex items-center gap-1.5"
                  style={{
                    border: '1px solid rgba(239,68,68,0.4)',
                    color: 'var(--color-accent-red)',
                  }}
                >
                  <X className="w-3 h-3" /> Verwijderen
                </button>
              ) : canEquip ? (
                <button
                  onClick={onEquip}
                  className="font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 cursor-pointer transition-opacity hover:opacity-80 inline-flex items-center gap-1.5"
                  style={{
                    backgroundColor: rarityColor,
                    color: 'var(--color-bg)',
                  }}
                >
                  <Shield className="w-3 h-3" /> Equippen
                </button>
              ) : slotsFulled ? (
                <span className="font-mono text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Alle slots vol
                </span>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Badge grid item
// ---------------------------------------------------------------------------

function BadgeGridItem({
  badge,
  isEarned,
  isEquipped,
  isSelected,
  onClick,
}: {
  badge: (typeof BADGE_DEFS)[number]
  isEarned: boolean
  isEquipped: boolean
  isSelected: boolean
  onClick: () => void
}) {
  const rarityColor = badge.rarity === 'mythic'
    ? 'rgba(255,255,255,0.7)'
    : RARITY_CONFIG[badge.rarity].color

  return (
    <button
      className="relative flex flex-col items-center gap-1.5 cursor-pointer group"
      style={{ opacity: isEarned ? 1 : 0.3 }}
      onClick={onClick}
    >
      <div
        className="relative"
        style={{
          outline: isSelected ? `2px solid ${rarityColor}` : 'none',
          outlineOffset: 3,
          transition: 'outline 0.12s',
        }}
      >
        <BadgeIcon
          badgeId={badge.id}
          size={24}
          locked={!isEarned}
          rarity={badge.rarity}
          showLabel={false}
        />

        {/* Equipped checkmark */}
        {isEquipped && (
          <div
            className="absolute -top-1 -right-1 w-3.5 h-3.5 flex items-center justify-center rounded-full z-10"
            style={{ backgroundColor: 'var(--color-accent-gold)' }}
          >
            <Check className="w-2 h-2" style={{ color: '#000' }} />
          </div>
        )}

        {/* Lock overlay */}
        {!isEarned && (
          <div
            className="absolute inset-0 flex items-center justify-center z-10"
            style={{ backgroundColor: 'rgba(9,9,11,0.5)' }}
          >
            <Lock className="w-2.5 h-2.5" style={{ color: 'rgba(255,255,255,0.2)' }} />
          </div>
        )}
      </div>

      {/* Badge name */}
      <span
        className="font-mono text-[9px] text-center leading-tight"
        style={{
          color: isEquipped
            ? 'var(--color-accent-gold)'
            : isEarned
              ? 'var(--color-text-muted)'
              : 'rgba(255,255,255,0.15)',
          maxWidth: 72,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {badge.name}
      </span>
    </button>
  )
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export default function BadgesTab({
  earnedBadgeIds,
  equippedBadges,
  maxSlots,
  memberId,
  isAdmin,
}: BadgesTabProps) {
  const shouldReduceMotion = useReducedMotion()
  const collectionRef = useRef<HTMLDivElement>(null)

  const [rarityFilter, setRarityFilter] = useState<BadgeRarity | 'all'>('all')
  const [selectedBadgeId, setSelectedBadgeId] = useState<string | null>(null)
  const [currentEquipped, setCurrentEquipped] = useState<string[]>(
    equippedBadges.map((e) => e.badgeId)
  )
  const [saving, setSaving] = useState(false)

  void isAdmin

  const earnedSet = new Set(earnedBadgeIds)
  const equippedSet = new Set(currentEquipped)

  // Sort: mythic first, then by earned status
  const sortedBadges = [...BADGE_DEFS].sort((a, b) => {
    const rarityDiff = RARITY_SORT_ORDER.indexOf(a.rarity) - RARITY_SORT_ORDER.indexOf(b.rarity)
    if (rarityDiff !== 0) return rarityDiff
    // Earned before locked
    const aEarned = earnedSet.has(a.id) ? 0 : 1
    const bEarned = earnedSet.has(b.id) ? 0 : 1
    return aEarned - bEarned
  })

  const filteredBadges =
    rarityFilter === 'all'
      ? sortedBadges
      : sortedBadges.filter((b) => b.rarity === rarityFilter)

  const scrollToCollection = useCallback(() => {
    collectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  async function toggleBadge(badgeId: string) {
    if (!earnedSet.has(badgeId)) return

    let updated: string[]
    if (equippedSet.has(badgeId)) {
      updated = currentEquipped.filter((id) => id !== badgeId)
    } else {
      if (currentEquipped.length >= maxSlots) return
      updated = [...currentEquipped, badgeId]
    }

    setCurrentEquipped(updated)
    setSaving(true)

    try {
      const res = await fetch(`/api/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active_badges: updated }),
      })
      if (!res.ok) {
        setCurrentEquipped(currentEquipped)
      }
    } catch {
      setCurrentEquipped(currentEquipped)
    } finally {
      setSaving(false)
    }
  }

  function handleUnequip(badgeId: string) {
    toggleBadge(badgeId)
    if (selectedBadgeId === badgeId) setSelectedBadgeId(null)
  }

  function handleEquip(badgeId: string) {
    toggleBadge(badgeId)
  }

  function handleSlotClick(slotIndex: number) {
    void slotIndex
    scrollToCollection()
  }

  const selectedBadge = selectedBadgeId ? BADGE_DEFS.find((b) => b.id === selectedBadgeId) : null
  const earnedBadgeMap = new Map(
    equippedBadges.map((e) => [e.badgeId, e])
  )

  // Find earnedAt for selected badge (we only have the ids, no date in this tab props)
  // Show detail panel below grid
  const canEquipSelected = selectedBadgeId
    ? earnedSet.has(selectedBadgeId) && !equippedSet.has(selectedBadgeId) && currentEquipped.length < maxSlots
    : false

  return (
    <div className="space-y-6">
      {/* 1. Equipped Slots */}
      <EquippedSlots
        equippedIds={currentEquipped}
        maxSlots={maxSlots}
        onUnequip={handleUnequip}
        onSlotClick={handleSlotClick}
        saving={saving}
      />

      {/* 2. Badge Collection */}
      <div ref={collectionRef}>
        {/* Collection header + filter */}
        <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span
              className="font-mono text-xs uppercase tracking-[0.2em]"
              style={{ color: 'var(--color-text-muted)' }}
            >
              badge.collection
            </span>
            <span
              className="font-mono text-[10px] px-1.5 py-0.5"
              style={{ color: 'var(--color-accent-gold)', border: '1px solid rgba(242,158,24,0.2)' }}
            >
              {earnedBadgeIds.length}/{BADGE_DEFS.length}
            </span>
          </div>
          <RarityFilter active={rarityFilter} onChange={setRarityFilter} />
        </div>

        {/* Badge grid */}
        <div
          className="relative overflow-hidden p-5"
          style={{
            backgroundColor: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--color-border)',
          }}
        >
          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2" style={{ borderColor: 'var(--color-accent-gold)' }} />
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2" style={{ borderColor: 'var(--color-accent-gold)' }} />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />

          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {filteredBadges.map((badge, i) => (
              <motion.div
                key={badge.id}
                initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.02 + i * 0.015, type: 'spring', stiffness: 400, damping: 22 }}
              >
                <BadgeGridItem
                  badge={badge}
                  isEarned={earnedSet.has(badge.id)}
                  isEquipped={equippedSet.has(badge.id)}
                  isSelected={selectedBadgeId === badge.id}
                  onClick={() => setSelectedBadgeId(
                    selectedBadgeId === badge.id ? null : badge.id
                  )}
                />
              </motion.div>
            ))}
          </div>

          {filteredBadges.length === 0 && (
            <div className="py-8 text-center font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {'>'} geen badges voor dit filter...
            </div>
          )}
        </div>
      </div>

      {/* 3. Badge detail panel */}
      <AnimatePresence>
        {selectedBadgeId && selectedBadge && (
          <BadgeDetail
            key={selectedBadgeId}
            badgeId={selectedBadgeId}
            isEarned={earnedSet.has(selectedBadgeId)}
            earnedAt={null}
            isEquipped={equippedSet.has(selectedBadgeId)}
            canEquip={canEquipSelected}
            slotsFulled={currentEquipped.length >= maxSlots}
            onEquip={() => handleEquip(selectedBadgeId)}
            onUnequip={() => handleUnequip(selectedBadgeId)}
            onClose={() => setSelectedBadgeId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
