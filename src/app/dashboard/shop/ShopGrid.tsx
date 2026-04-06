'use client'

import type { ShopItem } from '@/lib/shopEngine'
import { ShopItemCard } from './ShopItemCard'

interface ShopGridProps {
  items: ShopItem[]
  ownedIds: string[]
  coinsBalance: number
}

export function ShopGrid({ items, ownedIds, coinsBalance }: ShopGridProps) {
  const ownedSet = new Set(ownedIds)

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
      {items.map((item, index) => (
        <ShopItemCard
          key={item.id}
          item={item}
          owned={ownedSet.has(item.id)}
          coinsBalance={coinsBalance}
          index={index}
        />
      ))}
    </div>
  )
}
