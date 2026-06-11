import { auth } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getLevelForXp, getEffectiveLevel } from '@/lib/levelEngine'
import { getShopItems } from '@/lib/shopEngine'
import { Coins } from 'lucide-react'
import { ShopGrid } from './ShopGrid'

export async function generateMetadata() {
  const t = await getTranslations('pageShop')
  return {
    title: t('meta.title'),
  }
}

const CATEGORIES = ['alles', 'pets', 'frames', 'effects', 'stickers'] as const
type CategoryFilter = (typeof CATEGORIES)[number]

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const t = await getTranslations('pageShop')
  const supabase = createServiceClient()
  const memberId = session.user.id

  // Fetch member data (level + coins)
  const { data: member } = await supabase
    .from('members')
    .select('total_xp, coins_balance, role, is_admin')
    .eq('id', memberId)
    .single()

  const points = (member?.total_xp as number) ?? 0
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
  const ownedIds: string[] = (inventoryData ?? []).map((row) => row.accessory_id as string)

  // Active tab from search params
  const params = await searchParams
  const tabParam = (typeof params.tab === 'string' ? params.tab : 'alles') as CategoryFilter
  const activeTab: CategoryFilter = CATEGORIES.includes(tabParam) ? tabParam : 'alles'

  // Map tab names (plural) to DB category values (singular)
  const TAB_TO_CATEGORY: Record<string, string> = {
    pets: 'pet',
    frames: 'frame',
    effects: 'effect',
    stickers: 'sticker',
  }

  // Filter items by tab
  const filteredItems =
    activeTab === 'alles'
      ? allItems
      : allItems.filter((item) => item.category === (TAB_TO_CATEGORY[activeTab] ?? activeTab))

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
              boxShadow: '0 0 8px rgba(242,158,24,0.5)',
            }}
          />
          <span
            className="font-mono text-xs uppercase tracking-[0.15em]"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {t('subtitle', { title: levelDef.title, level: levelDef.level, count: allItems.length })}
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
          backgroundColor: 'rgba(242,158,24,0.06)',
          border: '1px solid rgba(242,158,24,0.2)',
        }}
      >
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.15em]" style={{ color: 'var(--color-text-muted)' }}>
            {t('yourCoins')}
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
            {t('coinsFormula')}
          </p>
          <p className="font-mono text-xs mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
            {t('coinsHint')}
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
              : allItems.filter((i) => i.category === (TAB_TO_CATEGORY[cat] ?? cat)).length

          return (
            <a
              key={cat}
              href={`?tab=${cat}`}
              className="font-mono text-xs px-4 py-2.5 relative"
              style={{
                color: isActive ? 'var(--color-accent-gold)' : 'var(--color-text-muted)',
                borderBottom: isActive ? '2px solid var(--color-accent-gold)' : '2px solid transparent',
                marginBottom: '-1px',
                textDecoration: 'none',
                transition: 'color 0.15s ease, border-color 0.15s ease',
              }}
            >
              {t(`categories.${cat}`)}
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

      {/* Items grid - client component for animations */}
      <ShopGrid
        items={sortedItems}
        ownedIds={ownedIds}
        coinsBalance={coinsBalance}
      />
    </div>
  )
}
