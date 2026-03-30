'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import { ADMIN_EMAILS } from '@/lib/constants'
import { LayoutDashboard, CreditCard, User, Shield, LogOut, Menu, X } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/dashboard/ledenpas', label: 'Ledenpas', Icon: CreditCard },
  { href: '/dashboard/profiel', label: 'Profiel', Icon: User },
]

export default function DashboardNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const isAdmin = session?.user?.email && ADMIN_EMAILS.includes(session.user.email)
  const [open, setOpen] = useState(false)

  const items = isAdmin
    ? [...NAV_ITEMS, { href: '/admin', label: 'Admin', Icon: Shield }]
    : NAV_ITEMS

  return (
    <>
      {/* Mobile top bar */}
      <header
        className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3"
        style={{
          backgroundColor: 'var(--color-bg)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold" style={{ fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: 'var(--color-accent-gold)' }}>{'{'}</span>
            <span style={{ color: 'var(--color-text)' }}>SIT</span>
            <span style={{ color: 'var(--color-accent-gold)' }}>{'}'}</span>
          </span>
        </Link>
        <button
          onClick={() => setOpen(!open)}
          className="w-10 h-10 flex items-center justify-center rounded-lg cursor-pointer"
          style={{ color: 'var(--color-text)' }}
          aria-label={open ? 'Menu sluiten' : 'Menu openen'}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Mobile overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar — mobile: slide-in overlay, desktop: fixed */}
      <nav
        className={`fixed top-0 left-0 h-screen w-64 z-50 flex flex-col py-6 px-3 transition-transform duration-300 ease-out lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
        style={{
          backgroundColor: 'var(--color-bg)',
          borderRight: '1px solid var(--color-border)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between mb-8 px-3">
          <Link href="/" onClick={() => setOpen(false)}>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-mono)' }}>
                <span style={{ color: 'var(--color-accent-gold)' }}>{'{'}</span>
                <span style={{ color: 'var(--color-text)' }}>SIT</span>
                <span style={{ color: 'var(--color-accent-gold)' }}>{'}'}</span>
              </span>
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] mt-1 ml-0.5" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
              Leden Portaal
            </p>
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav items */}
        <div className="space-y-1 flex-1">
          <p className="text-[10px] uppercase tracking-[0.15em] px-3 mb-2" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
            Menu
          </p>
          {items.map((item) => {
            const active = item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer relative overflow-hidden"
                style={{
                  backgroundColor: active ? 'rgba(242, 158, 24, 0.08)' : 'transparent',
                  color: active ? 'var(--color-accent-gold)' : 'var(--color-text-muted)',
                }}
              >
                {active && (
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                    style={{ backgroundColor: 'var(--color-accent-gold)' }}
                  />
                )}
                <item.Icon size={18} strokeWidth={active ? 2.2 : 1.5} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>

        {/* User info */}
        <div className="px-3 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold uppercase"
              style={{ backgroundColor: 'rgba(242, 158, 24, 0.15)', color: 'var(--color-accent-gold)' }}
            >
              {session?.user?.email?.[0] || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: 'var(--color-text)' }}>
                {session?.user?.email?.split('@')[0]}
              </p>
              <p className="text-[10px] truncate" style={{ color: 'var(--color-text-muted)' }}>
                {session?.user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-2 text-xs w-full px-2 py-1.5 rounded-md transition-colors cursor-pointer"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <LogOut size={14} />
            Uitloggen
          </button>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex justify-around py-1.5 px-1"
        style={{
          backgroundColor: 'var(--color-bg)',
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
              className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl text-[10px] font-medium transition-all relative cursor-pointer"
              style={{
                color: active ? 'var(--color-accent-gold)' : 'var(--color-text-muted)',
              }}
            >
              {active && (
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] rounded-full"
                  style={{ backgroundColor: 'var(--color-accent-gold)' }}
                />
              )}
              <item.Icon size={20} strokeWidth={active ? 2.2 : 1.5} />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
