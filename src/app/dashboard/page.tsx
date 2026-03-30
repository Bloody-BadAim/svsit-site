import { auth } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { getRank } from '@/lib/constants'
import StatsGrid from '@/components/dashboard/StatsGrid'
import RecentActivity from '@/components/dashboard/RecentActivity'
import Link from 'next/link'
import { ArrowRight, CreditCard, Sparkles } from 'lucide-react'

export const metadata = {
  title: 'Dashboard — SIT',
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const params = await searchParams
  const isWelcome = params.welcome === 'true'

  const supabase = createServiceClient()

  const { data: member } = await supabase
    .from('members')
    .select('*')
    .eq('id', session.user.id)
    .single()

  const { data: scans } = await supabase
    .from('scans')
    .select('*')
    .eq('member_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const points = (member?.points as number) || 0
  const rank = getRank(points)
  const username = (member?.email as string)?.split('@')[0] || 'lid'

  return (
    <div className="max-w-4xl space-y-6">
      {/* Welcome banner */}
      {isWelcome && (
        <div
          className="relative p-5 rounded-xl overflow-hidden"
          style={{
            backgroundColor: 'rgba(242, 158, 24, 0.06)',
            border: '1px solid rgba(242, 158, 24, 0.2)',
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, var(--color-accent-gold), var(--color-accent-blue), var(--color-accent-red))' }} />
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(242, 158, 24, 0.15)' }}>
              <Sparkles size={20} style={{ color: 'var(--color-accent-gold)' }} />
            </div>
            <div>
              <p className="font-bold" style={{ color: 'var(--color-accent-gold)' }}>
                Welkom bij SIT!
              </p>
              <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                Je lidmaatschap is geactiveerd. Check je ledenpas en verdien punten bij events.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="pt-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] uppercase tracking-[0.15em] font-semibold" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
            {'>'} dashboard
          </span>
          <span
            className="text-[10px] px-2 py-0.5 rounded-full font-medium"
            style={{
              backgroundColor: member?.membership_active ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: member?.membership_active ? 'var(--color-accent-green)' : 'var(--color-accent-red)',
            }}
          >
            {member?.membership_active ? 'ACTIEF' : 'INACTIEF'}
          </span>
        </div>
        <h1
          className="text-3xl sm:text-4xl font-bold tracking-tight"
          style={{
            color: 'var(--color-text)',
            fontFamily: "'Big Shoulders Display', var(--font-geist-sans), sans-serif",
          }}
        >
          HEY, {username.toUpperCase()}
        </h1>
      </div>

      {/* Ledenpas preview card */}
      <Link
        href="/dashboard/ledenpas"
        className="block relative rounded-xl overflow-hidden transition-all duration-300 group cursor-pointer"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
        }}
      >
        {/* Gradient top accent */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: 'linear-gradient(90deg, var(--color-accent-gold), transparent 60%)' }}
        />

        <div className="p-5 flex items-center gap-5">
          {/* Mini card visual */}
          <div
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex flex-col items-center justify-center shrink-0 relative"
            style={{
              background: 'linear-gradient(135deg, var(--color-surface) 0%, rgba(242, 158, 24, 0.05) 100%)',
              border: '1px solid rgba(242, 158, 24, 0.2)',
            }}
          >
            <span
              className="text-lg font-bold"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent-gold)' }}
            >
              {'{'}<span style={{ color: 'var(--color-text)' }}>S</span>{'}'}
            </span>
            <CreditCard size={12} className="mt-0.5" style={{ color: 'var(--color-text-muted)' }} />
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-bold text-lg" style={{ color: 'var(--color-text)' }}>
              Digitale Ledenpas
            </p>
            <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              {username} &middot; <span style={{ color: rank.kleur }}>{rank.naam}</span> &middot; {points} punten
            </p>
          </div>

          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:translate-x-1"
            style={{ backgroundColor: 'rgba(242, 158, 24, 0.08)' }}
          >
            <ArrowRight size={16} style={{ color: 'var(--color-accent-gold)' }} />
          </div>
        </div>
      </Link>

      {/* Stats */}
      <StatsGrid
        points={points}
        role={(member?.role as string) || 'member'}
        commissie={member?.commissie as string | null}
        memberSince={member?.membership_started_at as string | null}
      />

      {/* Recent activity */}
      <RecentActivity scans={(scans || []) as Array<{ id: string; points: number; reason: string; event_name: string | null; created_at: string }>} />
    </div>
  )
}
