'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ADMIN_EMAILS } from '@/lib/constants'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: '⌂' },
  { href: '/dashboard/ledenpas', label: 'Ledenpas', icon: '⎕' },
  { href: '/dashboard/profiel', label: 'Profiel', icon: '◉' },
]

export default function DashboardNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const isAdmin = session?.user?.email && ADMIN_EMAILS.includes(session.user.email)

  const items = isAdmin
    ? [...NAV_ITEMS, { href: '/admin', label: 'Admin', icon: '⚙' }]
    : NAV_ITEMS

  return (
    <>
      {/* Desktop sidebar */}
      <nav
        className="hidden lg:flex flex-col w-56 fixed left-0 top-0 h-screen py-8 px-4 z-40"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
        }}
      >
        <Link href="/" className="mb-10 px-3">
          <span
            className="text-xl font-bold"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent-gold)' }}
          >
            {'{'}<span style={{ color: 'var(--color-text)' }}>SIT</span>{'}'}
          </span>
        </Link>

        <div className="space-y-1">
          {items.map((item) => {
            const active = item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
                style={{
                  backgroundColor: active ? 'rgba(242, 158, 24, 0.1)' : 'transparent',
                  color: active ? 'var(--color-accent-gold)' : 'var(--color-text-muted)',
                  borderLeft: active ? '2px solid var(--color-accent-gold)' : '2px solid transparent',
                }}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </div>

        <div className="mt-auto px-3">
          <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
            {session?.user?.email}
          </p>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex justify-around py-2 px-2"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        {items.map((item) => {
          const active = item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-all"
              style={{
                color: active ? 'var(--color-accent-gold)' : 'var(--color-text-muted)',
              }}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
