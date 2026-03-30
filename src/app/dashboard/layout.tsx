import { SessionProvider } from 'next-auth/react'
import DashboardNav from '@/components/dashboard/DashboardNav'

export default function DashboardLayout({
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
        <DashboardNav />
        <main className="pt-16 lg:pt-0 lg:ml-64 pb-20 lg:pb-0 px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </SessionProvider>
  )
}
