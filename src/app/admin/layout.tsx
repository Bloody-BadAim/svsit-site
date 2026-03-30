import { SessionProvider } from 'next-auth/react'
import AdminNav from '@/components/admin/AdminNav'
import Link from 'next/link'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <div
        className="min-h-screen"
        style={{ backgroundColor: 'var(--color-bg)' }}
      >
        <header
          className="px-6 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <span
                className="text-xl font-bold"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent-gold)' }}
              >
                {'{'}<span style={{ color: 'var(--color-text)' }}>SIT</span>{'}'}
              </span>
            </Link>
            <span
              className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: 'var(--color-accent-red)',
              }}
            >
              Admin
            </span>
          </div>
          <Link
            href="/dashboard"
            className="text-sm"
            style={{ color: 'var(--color-text-muted)' }}
          >
            ← Dashboard
          </Link>
        </header>

        <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-6xl mx-auto">
          <AdminNav />
          {children}
        </main>
      </div>
    </SessionProvider>
  )
}
