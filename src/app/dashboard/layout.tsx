import { SessionProvider } from 'next-auth/react'
import DashboardNav from '@/components/dashboard/DashboardNav'
import EasterEggTimeCheck from '@/components/dashboard/EasterEggTimeCheck'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <div
        className="min-h-screen relative"
        style={{ backgroundColor: 'var(--color-bg)' }}
      >
        {/* Subtle grid background like homepage */}
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(245, 158, 11, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(245, 158, 11, 0.02) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 0%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 0%, transparent 70%)',
          }}
        />
        <EasterEggTimeCheck />
        <DashboardNav />
        <main className="relative z-[1] pt-16 lg:pt-0 lg:ml-64 pb-20 lg:pb-8 px-4 sm:px-6 lg:px-6 py-8">
          {children}
        </main>
      </div>
    </SessionProvider>
  )
}
