'use client'

import { motion } from 'motion/react'
import { Star, Coins, Check, Square, Tag } from 'lucide-react'
import BuyButton from './BuyButton'
import type { ShopItem } from '@/lib/shopEngine'
import * as Pets from '@/components/pets'

const RARITY_COLORS: Record<string, string> = {
  common: '#6B7280',
  uncommon: '#22C55E',
  rare: '#3B82F6',
  epic: '#8B5CF6',
  legendary: '#F59E0B',
}

const RARITY_LABEL: Record<string, string> = {
  common: 'COMMON',
  uncommon: 'UNCOMMON',
  rare: 'RARE',
  epic: 'EPIC',
  legendary: 'LEGENDARY',
}

const PET_PREVIEW: Record<string, (p: { size?: number }) => React.JSX.Element> = {
  'Debug Bug': Pets.PetDebugBug,
  'Pixel Cat': Pets.PetPixelCat,
  'Ghost': Pets.PetGhost,
  'Robot': Pets.PetRobot,
  'Rubber Duck': Pets.PetRubberDuck,
  'Dragon': Pets.PetBabyDragon,
  'Octocat': Pets.PetOctocat,
  'Clippy': Pets.PetClippy,
  'Konami Snake': Pets.PetKonamiSnake,
}

function isNewItem(createdAt: string | null): boolean {
  if (!createdAt) return false
  const age = Date.now() - new Date(createdAt).getTime()
  return age < 14 * 24 * 60 * 60 * 1000
}

function PetPreview({ name, rarityColor }: { name: string; rarityColor: string }) {
  const PetComponent = PET_PREVIEW[name]
  if (PetComponent) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <PetComponent size={52} />
      </div>
    )
  }
  // Fallback: paw shape in rarity color
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
      <circle cx="7" cy="5" r="2" fill={rarityColor} opacity="0.6" />
      <circle cx="17" cy="5" r="2" fill={rarityColor} opacity="0.6" />
      <circle cx="4" cy="11" r="1.5" fill={rarityColor} opacity="0.6" />
      <circle cx="20" cy="11" r="1.5" fill={rarityColor} opacity="0.6" />
      <ellipse cx="12" cy="16" rx="5" ry="4" fill={rarityColor} opacity="0.6" />
    </svg>
  )
}

function EffectPreview({ name, rarityColor }: { name: string; rarityColor: string }) {
  const lower = name.toLowerCase()

  if (lower.includes('matrix') || lower.includes('rain')) {
    // Use deterministic characters seeded by index to avoid hydration mismatch
    const MATRIX_CHARS = '!#$%&()*+/<=>?@[]^_{|}~0123456789ABCDEF';
    return (
      <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0 flex flex-col gap-1 items-center"
            style={{ left: `${i * 16 + 4}%`, animation: `matrixFall ${0.8 + i * 0.15}s linear infinite`, animationDelay: `${i * 0.12}s` }}
          >
            {[...Array(5)].map((_, j) => (
              <span key={j} className="font-mono text-[8px] leading-none" style={{ color: '#22C55E', opacity: 0.3 + j * 0.12 }}>
                {MATRIX_CHARS[(i * 5 + j * 7 + 3) % MATRIX_CHARS.length]}
              </span>
            ))}
          </div>
        ))}
        <style>{`@keyframes matrixFall { from { transform: translateY(-100%); } to { transform: translateY(100%); } }`}</style>
      </div>
    )
  }

  if (lower.includes('snow')) {
    return (
      <div className="w-full h-full relative overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 3,
              height: 3,
              backgroundColor: 'white',
              left: `${10 + i * 11}%`,
              top: '-4px',
              opacity: 0.6,
              animation: `snowFall ${1.2 + i * 0.2}s linear infinite`,
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
        <style>{`@keyframes snowFall { from { transform: translateY(0); opacity: 0.7; } to { transform: translateY(96px); opacity: 0; } }`}</style>
      </div>
    )
  }

  if (lower.includes('scanline')) {
    return (
      <div className="w-full h-full relative overflow-hidden">
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className="absolute w-full"
            style={{ height: 1, backgroundColor: rarityColor, opacity: 0.18, top: `${i * 14 + 5}%` }}
          />
        ))}
        <div
          className="absolute w-full"
          style={{ height: 2, backgroundColor: rarityColor, opacity: 0.5, top: '0%', animation: 'scanMove 2s linear infinite' }}
        />
        <style>{`@keyframes scanMove { from { top: 0%; } to { top: 100%; } }`}</style>
      </div>
    )
  }

  if (lower.includes('smoke') || lower.includes('mist')) {
    return (
      <div className="w-full h-full relative overflow-hidden flex items-end justify-center">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 28 + i * 8,
              height: 28 + i * 8,
              backgroundColor: 'rgba(156,163,175,0.12)',
              bottom: `-${i * 8}px`,
              left: `${20 + i * 8}%`,
              filter: 'blur(6px)',
              animation: `smokeRise ${1.5 + i * 0.3}s ease-out infinite`,
              animationDelay: `${i * 0.35}s`,
            }}
          />
        ))}
        <style>{`@keyframes smokeRise { 0% { transform: translateY(0) scale(1); opacity: 0.5; } 100% { transform: translateY(-40px) scale(1.5); opacity: 0; } }`}</style>
      </div>
    )
  }

  // Sparkle fallback
  return (
    <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 4,
            height: 4,
            backgroundColor: rarityColor,
            left: `${15 + i * 14}%`,
            top: `${20 + (i % 3) * 25}%`,
            animation: `sparklePulse ${0.8 + i * 0.2}s ease-in-out infinite alternate`,
            animationDelay: `${i * 0.13}s`,
          }}
        />
      ))}
      <style>{`@keyframes sparklePulse { from { opacity: 0.15; transform: scale(0.7); } to { opacity: 1; transform: scale(1.3); } }`}</style>
    </div>
  )
}

function FramePreview({ rarityColor }: { rarityColor: string }) {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div
        className="w-14 h-14 relative flex items-center justify-center"
      // style={{
      //   border: `2px solid ${rarityColor}`,
      //   boxShadow: `0 0 10px ${rarityColor}40, inset 0 0 10px ${rarityColor}10`,
      // }}
      >
        <div
          className="absolute inset-0"
          style={{ backgroundColor: `${rarityColor}06` }}
        />
        <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2" style={{ borderColor: rarityColor }} />
        <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2" style={{ borderColor: rarityColor }} />
        <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2" style={{ borderColor: rarityColor }} />
        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2" style={{ borderColor: rarityColor }} />
        <Square className="w-5 h-5 opacity-30" style={{ color: rarityColor }} />
      </div>
    </div>
  )
}

function StickerPreview({ name, rarityColor }: { name: string; rarityColor: string }) {
  const shortName = name.length > 10 ? name.slice(0, 8) + '..' : name
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div
        className="px-2.5 py-1.5 font-mono text-[11px] font-bold tracking-wide select-none"
        style={{
          color: rarityColor,
          border: `1.5px solid ${rarityColor}60`,
          backgroundColor: `${rarityColor}10`,
          boxShadow: `0 0 8px ${rarityColor}20`,
          transform: 'rotate(-4deg)',
        }}
      >
        <Tag className="w-3 h-3 inline mr-1 -mt-0.5" />
        {shortName}
      </div>
    </div>
  )
}

function ItemPreview({ item, rarityColor }: { item: ShopItem; rarityColor: string }) {
  if (item.locked) {
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="11" width="18" height="11" rx="2" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
        <path d="M7 11V7a5 5 0 0110 0v4" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
      </svg>
    )
  }

  switch (item.category) {
    case 'pet':
      return <PetPreview name={item.name} rarityColor={rarityColor} />
    case 'effect':
      return <EffectPreview name={item.name} rarityColor={rarityColor} />
    // case 'frame':
    //   return <FramePreview rarityColor={rarityColor} />
    case 'sticker':
      return <StickerPreview name={item.name} rarityColor={rarityColor} />
    default:
      return (
        <Coins className="w-8 h-8" style={{ color: `${rarityColor}60` }} />
      )
  }
}

interface ShopItemCardProps {
  item: ShopItem
  owned: boolean
  coinsBalance: number
  index: number
}

export function ShopItemCard({ item, owned, coinsBalance, index }: ShopItemCardProps) {
  const rarityColor = RARITY_COLORS[item.rarity] ?? '#6B7280'
  const isNew = isNewItem(item.createdAt as string | null)
  const canAfford = coinsBalance >= item.shopPrice

  const borderColor = owned
    ? 'rgba(34,197,94,0.25)'
    : item.locked
      ? 'rgba(255,255,255,0.04)'
      : `${rarityColor}30`

  const glowShadow = owned
    ? '0 0 12px rgba(34,197,94,0.08)'
    : item.locked
      ? 'none'
      : `0 0 12px ${rarityColor}12`

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3, ease: 'easeOut' }}
      className="group relative flex flex-col overflow-hidden cursor-default"
      style={{
        backgroundColor: 'rgba(255,255,255,0.02)',
        border: `1px solid ${borderColor}`,
        boxShadow: glowShadow,
        opacity: item.locked ? 0.5 : 1,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
      }}
      onMouseEnter={(e) => {
        if (item.locked) return
        const el = e.currentTarget
        el.style.transform = 'translateY(-2px)'
        el.style.boxShadow = `0 8px 24px ${owned ? 'rgba(34,197,94,0.15)' : `${rarityColor}20`}`
        el.style.borderColor = owned ? 'rgba(34,197,94,0.4)' : `${rarityColor}50`
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        el.style.transform = 'translateY(0)'
        el.style.boxShadow = glowShadow
        el.style.borderColor = borderColor
      }}
    >
      {/* Corner decorations */}
      <div
        className="absolute top-0 left-0 w-3 h-3 border-t border-l pointer-events-none"
        style={{ borderColor: owned ? 'rgba(34,197,94,0.4)' : `${rarityColor}40` }}
      />
      <div
        className="absolute bottom-0 right-0 w-3 h-3 border-b border-r pointer-events-none"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      />

      {/* Tags row */}
      <div className="flex items-center justify-between px-3 pt-3 gap-2">
        {item.isFeatured ? (
          <span
            className="font-mono text-[10px] px-1.5 py-0.5 flex items-center gap-1"
            style={{
              color: 'var(--color-accent-gold)',
              border: '1px solid rgba(245,158,11,0.3)',
              animation: 'featuredPulse 2.5s ease-in-out infinite',
            }}
          >
            <Star className="w-3 h-3 fill-current" /> FEATURED
          </span>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-1.5 ml-auto">
          {isNew && (
            <span
              className="font-mono text-[10px] px-1.5 py-0.5"
              style={{
                color: 'var(--color-accent-green)',
                border: '1px solid rgba(34,197,94,0.3)',
                animation: 'newGlow 1.8s ease-in-out infinite',
              }}
            >
              NIEUW
            </span>
          )}
          {item.isLimitedTime && (
            <span
              className="font-mono text-[10px] px-1.5 py-0.5"
              style={{ color: 'var(--color-accent-red)', border: '1px solid rgba(239,68,68,0.3)' }}
            >
              LIMITED
            </span>
          )}
        </div>
      </div>

      {/* Preview area */}
      <div
        className="mx-3 mt-2 h-24 flex items-center justify-center relative overflow-hidden"
        style={{
          backgroundColor: `${rarityColor}06`,
          border: `1px dashed ${rarityColor}20`,
        }}
      >
        <ItemPreview item={item} rarityColor={rarityColor} />
      </div>

      {/* Info */}
      <div className="px-3 pt-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className="text-sm font-medium leading-tight"
            style={{ color: item.locked ? 'rgba(255,255,255,0.3)' : 'var(--color-text)' }}
          >
            {item.name}
          </p>
          <span
            className="font-mono text-[9px] px-1.5 py-0.5 shrink-0 mt-0.5"
            style={{
              color: rarityColor,
              border: `1px solid ${rarityColor}40`,
              backgroundColor: `${rarityColor}10`,
            }}
          >
            {RARITY_LABEL[item.rarity] ?? item.rarity.toUpperCase()}
          </span>
        </div>

        {item.description && (
          <p
            className="text-xs mt-1 leading-snug line-clamp-2"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {item.description}
          </p>
        )}
      </div>

      {/* Price + action */}
      <div
        className="flex items-center justify-between px-3 py-3 mt-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
      >
        <span
          className="font-mono text-sm font-bold"
          style={{ color: item.locked ? 'rgba(255,255,255,0.2)' : 'var(--color-accent-gold)' }}
        >
          <span className="inline-flex items-center gap-1">
            {item.shopPrice.toLocaleString('nl-NL')} <Coins className="w-3.5 h-3.5" />
          </span>
        </span>

        {owned ? (
          <span
            className="font-mono text-xs px-2 py-0.5 inline-flex items-center gap-1"
            style={{ color: 'var(--color-accent-green)', border: '1px solid rgba(34,197,94,0.3)' }}
          >
            <Check className="w-3 h-3" /> IN BEZIT
          </span>
        ) : item.locked ? (
          <span className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
            {item.lockReason}
          </span>
        ) : (
          <BuyButton accessoryId={item.id} price={item.shopPrice} canAfford={canAfford} />
        )}
      </div>

      {/* Stock warning */}
      {item.stock !== null && (item.stock as number) > 0 && (item.stock as number) <= 5 && (
        <div
          className="px-3 pb-2 font-mono text-[10px]"
          style={{ color: 'var(--color-accent-red)' }}
        >
          Nog {item.stock} over
        </div>
      )}

      {/* Keyframes */}
      <style>{`
        @keyframes featuredPulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(245,158,11,0); }
          50% { opacity: 0.75; box-shadow: 0 0 6px 2px rgba(245,158,11,0.2); }
        }
        @keyframes newGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
          50% { box-shadow: 0 0 6px 1px rgba(34,197,94,0.3); }
        }
      `}</style>
    </motion.div>
  )
}
