'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const ADMIN_ITEMS = [
  { href: '/admin', label: 'Overview', icon: '▣' },
  { href: '/admin/leden', label: 'Leden', icon: '☰' },
  { href: '/admin/scanner', label: 'Scanner', icon: '⎕' },
  { href: '/admin/events', label: 'Events', icon: '◈' },
]

export default function AdminNav() {
  const pathname = usePathname()

  return (
    <div
      className="flex gap-1 p-1 rounded-lg mb-8"
      style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      {ADMIN_ITEMS.map((item) => {
        const active = item.href === '/admin'
          ? pathname === '/admin'
          : pathname.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all flex-1 justify-center"
            style={{
              backgroundColor: active ? 'rgba(242, 158, 24, 0.15)' : 'transparent',
              color: active ? 'var(--color-accent-gold)' : 'var(--color-text-muted)',
            }}
          >
            <span>{item.icon}</span>
            <span className="hidden sm:inline">{item.label}</span>
          </Link>
        )
      })}
    </div>
  )
}
