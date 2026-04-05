import { auth } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { getLevelForXp, getEffectiveLevel } from '@/lib/levelEngine'
import { getShopItems } from '@/lib/shopEngine'
import type { ShopItem } from '@/lib/shopEngine'
import BuyButton from './BuyButton'
import { Star, PawPrint, Square, Sparkles, Tag, Coins, Check } from 'lucide-react'

export const metadata = {
  title: 'Shop — SIT',
}

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

const CATEGORIES = ['alles', 'pets', 'frames', 'effects', 'stickers'] as const
type CategoryFilter = (typeof CATEGORIES)[number]

function getCategoryLabel(cat: string): string {
  const map: Record<string, string> = {
    alles: 'ALLES',
    pets: 'PETS',
    frames: 'FRAMES',
    effects: 'EFFECTS',
    stickers: 'STICKERS',
  }
  return map[cat] ?? cat.toUpperCase()
}

function isNewItem(createdAt: string | null): boolean {
  if (!createdAt) return false
  const age = Date.now() - new Date(createdAt).getTime()
  return age < 14 * 24 * 60 * 60 * 1000
}

interface ShopItemCardProps {
  item: ShopItem
  owned: boolean
  coinsBalance: number
}

function ShopItemCard({ item, owned, coinsBalance }: ShopItemCardProps) {
  const rarityColor = RARITY_COLORS[item.rarity] ?? '#6B7280'
  const isNew = isNewItem(item.createdAt as string | null)
  const canAfford = coinsBalance >= item.shopPrice

  return (
    <div
      className="relative flex flex-col overflow-hidden"
      style={{
        backgroundColor: 'rgba(255,255,255,0.02)',
        border: `1px solid ${owned ? 'rgba(34,197,94,0.25)' : item.locked ? 'rgba(255,255,255,0.04)' : `${rarityColor}20`}`,
        opacity: item.locked ? 0.5 : 1,
      }}
    >
      {/* Corner decorations */}
      <div
        className="absolute top-0 left-0 w-3 h-3 border-t border-l"
        style={{ borderColor: owned ? 'rgba(34,197,94,0.4)' : `${rarityColor}40` }}
      />
      <div
        className="absolute bottom-0 right-0 w-3 h-3 border-b border-r"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      />

      {/* Tags row */}
      <div className="flex items-center justify-between px-3 pt-3 gap-2">
        {/* Featured star */}
        {item.isFeatured ? (
          <span
            className="font-mono text-[10px] px-1.5 py-0.5 flex items-center gap-1"
            style={{ color: 'var(--color-accent-gold)', border: '1px solid rgba(245,158,11,0.3)' }}
          >
            <Star className="w-3 h-3 fill-current" /> FEATURED
          </span>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-1.5 ml-auto">
          {/* New tag */}
          {isNew && (
            <span
              className="font-mono text-[10px] px-1.5 py-0.5"
              style={{ color: 'var(--color-accent-green)', border: '1px solid rgba(34,197,94,0.3)' }}
            >
              NIEUW
            </span>
          )}
          {/* Limited time */}
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
        className="mx-3 mt-2 h-24 flex items-center justify-center"
        style={{
          backgroundColor: `${rarityColor}08`,
          border: `1px dashed ${rarityColor}20`,
        }}
      >
        {item.locked ? (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="11" width="18" height="11" rx="2" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
            <path d="M7 11V7a5 5 0 0110 0v4" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
          </svg>
        ) : (
          <span
            className="font-mono text-3xl font-bold select-none"
            style={{ color: `${rarityColor}60` }}
          >
            {item.category === 'pets' ? <PawPrint className="w-8 h-8" style={{ color: `${rarityColor}60` }} /> : item.category === 'frames' ? <Square className="w-8 h-8" style={{ color: `${rarityColor}60` }} /> : item.category === 'effects' ? <Sparkles className="w-8 h-8" style={{ color: `${rarityColor}60` }} /> : item.category === 'stickers' ? <Tag className="w-8 h-8" style={{ color: `${rarityColor}60` }} /> : <Coins className="w-8 h-8" style={{ color: `${rarityColor}60` }} />}
          </span>
        )}
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
          {/* Rarity pill */}
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
        {/* Price */}
        <span
          className="font-mono text-sm font-bold"
          style={{ color: item.locked ? 'rgba(255,255,255,0.2)' : 'var(--color-accent-gold)' }}
        >
          <span className="inline-flex items-center gap-1">
            {item.shopPrice.toLocaleString('nl-NL')} <Coins className="w-3.5 h-3.5" />
          </span>
        </span>

        {/* Action */}
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
    </div>
  )
}

interface ShopTabsProps {
  active: CategoryFilter
  items: ShopItem[]
  ownedIds: Set<string>
  coinsBalance: number
}

function ShopGrid({ items, ownedIds, coinsBalance }: Omit<ShopTabsProps, 'active'>) {
  if (items.length === 0) {
    return (
      <div
        className="py-16 text-center font-mono text-sm"
        style={{ color: 'var(--color-text-muted)' }}
      >
        // geen items in deze categorie
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {items.map((item) => (
        <ShopItemCard
          key={item.id}
          item={item}
          owned={ownedIds.has(item.id)}
          coinsBalance={coinsBalance}
        />
      ))}
    </div>
  )
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const supabase = createServiceClient()
  const memberId = session.user.id

  // Fetch member data (level + coins)
  const { data: member } = await supabase
    .from('members')
    .select('points, coins_balance, role, is_admin')
    .eq('id', memberId)
    .single()

  const points = (member?.points as number) ?? 0
  const isAdminMember = !!(member?.is_admin || member?.role === 'bestuur')
  const coinsBalance = isAdminMember ? 99999 : ((member?.coins_balance as number) ?? 0)
  const levelDef = getLevelForXp(points)
  const effectiveLevel = getEffectiveLevel({
    current_level: levelDef.level,
    role: (member?.role as string | undefined) ?? undefined,
    is_admin: (member?.is_admin as boolean | undefined) ?? false,
  })

  // Fetch shop items and owned accessories in parallel
  const [allItems, inventoryResult] = await Promise.all([
    getShopItems(effectiveLevel, isAdminMember),
    supabase.from('member_accessories').select('accessory_id').eq('member_id', memberId),
  ])

  const { data: inventoryData } = inventoryResult

  const ownedIds = new Set<string>(
    (inventoryData ?? []).map((row) => row.accessory_id as string)
  )

  // Active tab from search params
  const params = await searchParams
  const tabParam = (typeof params.tab === 'string' ? params.tab : 'alles') as CategoryFilter
  const activeTab: CategoryFilter = CATEGORIES.includes(tabParam) ? tabParam : 'alles'

  // Filter items by tab
  const filteredItems =
    activeTab === 'alles'
      ? allItems
      : allItems.filter((item) => item.category === activeTab)

  // Sort: featured first, then by rarity order, then by name
  const rarityOrder = ['legendary', 'epic', 'rare', 'uncommon', 'common']
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (a.isFeatured && !b.isFeatured) return -1
    if (!a.isFeatured && b.isFeatured) return 1
    const ra = rarityOrder.indexOf(a.rarity)
    const rb = rarityOrder.indexOf(b.rarity)
    if (ra !== rb) return ra - rb
    return a.name.localeCompare(b.name)
  })

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: 'var(--color-accent-gold)',
              boxShadow: '0 0 8px rgba(245,158,11,0.5)',
            }}
          />
          <span
            className="font-mono text-xs uppercase tracking-[0.15em]"
            style={{ color: 'var(--color-text-muted)' }}
          >
            shop &middot; {levelDef.title} &middot; level {levelDef.level} &middot; {allItems.length} items
          </span>
        </div>
        <h1
          className="text-4xl sm:text-5xl font-bold tracking-tight uppercase leading-[0.9]"
          style={{
            color: 'var(--color-text)',
            fontFamily: "'Big Shoulders Display', var(--font-geist-sans), sans-serif",
          }}
        >
          SHOP
        </h1>
      </div>

      {/* Coin balance banner */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 px-4 md:px-5 py-4 mb-6"
        style={{
          backgroundColor: 'rgba(245,158,11,0.06)',
          border: '1px solid rgba(245,158,11,0.2)',
        }}
      >
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.15em]" style={{ color: 'var(--color-text-muted)' }}>
            jouw coins
          </p>
          <p
            className="font-mono text-3xl font-bold mt-0.5"
            style={{ color: 'var(--color-accent-gold)' }}
          >
            <span className="inline-flex items-center gap-2">
              {coinsBalance.toLocaleString('nl-NL')} <Coins className="w-6 h-6" />
            </span>
          </p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Coins = XP &times; 1
          </p>
          <p className="font-mono text-xs mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Verdien coins door events bij te wonen
          </p>
        </div>
      </div>

      {/* Category tabs */}
      <div
        className="flex items-center gap-1 mb-6 flex-wrap"
        style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0' }}
      >
        {CATEGORIES.map((cat) => {
          const isActive = activeTab === cat
          const count =
            cat === 'alles'
              ? allItems.length
              : allItems.filter((i) => i.category === cat).length

          return (
            <a
              key={cat}
              href={`?tab=${cat}`}
              className="font-mono text-xs px-4 py-2.5 transition-colors relative"
              style={{
                color: isActive ? 'var(--color-accent-gold)' : 'var(--color-text-muted)',
                borderBottom: isActive ? '2px solid var(--color-accent-gold)' : '2px solid transparent',
                marginBottom: '-1px',
                textDecoration: 'none',
              }}
            >
              {getCategoryLabel(cat)}
              {count > 0 && (
                <span
                  className="ml-1.5 font-mono text-[10px]"
                  style={{ color: isActive ? 'var(--color-accent-gold)' : 'rgba(255,255,255,0.2)' }}
                >
                  {count}
                </span>
              )}
            </a>
          )
        })}
      </div>

      {/* Items grid */}
      <ShopGrid items={sortedItems} ownedIds={ownedIds} coinsBalance={coinsBalance} />
    </div>
  )
}
