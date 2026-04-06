'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { ADMIN_EMAILS } from '@/lib/constants'
import { LayoutDashboard, User, Shield, LogOut, Menu, X, ShoppingBag, Coins, Ticket } from 'lucide-react'

function CoinPill({ userId, isAdmin }: { userId: string; isAdmin: boolean }) {
  const [coins, setCoins] = useState<number | null>(null)

  useEffect(() => {
    if (isAdmin) {
      setCoins(99999)
      return
    }
    if (!userId) return
    fetch(`/api/members/${userId}`)
      .then((r) => r.json())
      .then(({ data }) => {
        if (data?.coins_balance != null) setCoins(data.coins_balance as number)
      })
      .catch(() => {})
  }, [userId, isAdmin])

  if (coins === null) return null

  return (
    <div className="flex items-center gap-1.5 text-sm font-mono">
      <Coins className="w-4 h-4" style={{ color: 'var(--color-accent-gold)' }} />
      <span style={{ color: 'var(--color-text)' }}>{coins.toLocaleString('nl-NL')}</span>
    </div>
  )
}

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/dashboard/tickets', label: 'Tickets', Icon: Ticket },
  { href: '/dashboard/shop', label: 'Shop', Icon: ShoppingBag },
  { href: '/dashboard/profiel', label: 'Profiel', Icon: User },
]

export default function DashboardNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const isAdmin = session?.user?.email && ADMIN_EMAILS.includes(session.user.email)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

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
          background: 'linear-gradient(180deg, rgba(17,17,19,0.98) 0%, rgba(9,9,11,1) 100%)',
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

        {/* Gradient divider */}
        <div className="h-px mx-3 mb-4" style={{ background: 'linear-gradient(90deg, var(--color-accent-gold), transparent)' }} />

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
                className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer relative overflow-hidden"
                style={{
                  backgroundColor: active ? 'rgba(242, 158, 24, 0.08)' : 'transparent',
                  color: active ? 'var(--color-accent-gold)' : 'var(--color-text-muted)',
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)' }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                {active && (
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                    style={{
                      backgroundColor: 'var(--color-accent-gold)',
                      boxShadow: '0 0 8px rgba(242, 158, 24, 0.4)',
                    }}
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
              style={{
                backgroundColor: 'rgba(242, 158, 24, 0.15)',
                color: 'var(--color-accent-gold)',
                boxShadow: '0 0 0 2px rgba(242, 158, 24, 0.2)',
              }}
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
            {session?.user?.id && <CoinPill userId={session.user.id} isAdmin={!!isAdmin} />}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-2 text-xs w-full px-2 py-1.5 rounded-md transition-colors cursor-pointer"
            style={{ color: 'var(--color-text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)'; e.currentTarget.style.color = 'var(--color-accent-red)' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-text-muted)' }}
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
          backgroundColor: 'rgba(9, 9, 11, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
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
