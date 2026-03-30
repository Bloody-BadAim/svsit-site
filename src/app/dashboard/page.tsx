import { auth } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { getRank } from '@/lib/constants'
import StatsGrid from '@/components/dashboard/StatsGrid'
import RecentActivity from '@/components/dashboard/RecentActivity'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'

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
    <div className="max-w-5xl space-y-8 lg:space-y-10">
      {/* Welcome banner */}
      {isWelcome && (
        <div
          className="relative p-5 rounded-xl overflow-hidden"
          style={{
            backgroundColor: 'rgba(242, 158, 24, 0.04)',
            border: '1px solid rgba(242, 158, 24, 0.15)',
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, var(--color-accent-gold), var(--color-accent-blue), var(--color-accent-red), var(--color-accent-green))' }} />
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(242, 158, 24, 0.1)' }}>
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

      {/* Section label like homepage */}
      <div>
        <div className="flex items-center gap-4 mb-4">
          <span className="font-mono text-xs tracking-[0.3em] uppercase" style={{ color: 'var(--color-accent-gold)' }}>
            01
          </span>
          <span className="w-12 h-px" style={{ backgroundColor: 'var(--color-accent-gold)' }} />
        </div>
        <h1
          className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight uppercase"
          style={{
            color: 'var(--color-text)',
            fontFamily: "'Big Shoulders Display', var(--font-geist-sans), sans-serif",
          }}
        >
          HEY, {username.toUpperCase()}
        </h1>
        <div className="flex items-center gap-3 mt-3">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: member?.membership_active ? 'var(--color-accent-green)' : 'var(--color-accent-red)' }}
          />
          <span className="text-sm font-mono" style={{ color: 'var(--color-text-muted)' }}>
            {member?.membership_active ? 'membership.active = true' : 'membership.active = false'}
          </span>
        </div>
      </div>

      {/* Ledenpas preview — styled like homepage event cards */}
      <Link
        href="/dashboard/ledenpas"
        className="group block relative rounded-xl overflow-hidden transition-all duration-300 cursor-pointer"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
        }}
      >
        {/* Animated gradient top border */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: 'linear-gradient(90deg, var(--color-accent-gold) 0%, var(--color-accent-blue) 50%, transparent 100%)' }}
        />

        {/* Ambient scanline like events */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
          }}
        />

        <div className="relative p-5 sm:p-6 flex items-center gap-5">
          {/* Mini card */}
          <div
            className="w-16 h-20 sm:w-20 sm:h-24 rounded-xl flex flex-col items-center justify-center shrink-0 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, var(--color-bg) 0%, rgba(242, 158, 24, 0.06) 100%)',
              border: '1px solid rgba(242, 158, 24, 0.15)',
            }}
          >
            {/* Mini rainbow bar */}
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, var(--color-accent-gold), var(--color-accent-blue), var(--color-accent-red), var(--color-accent-green))' }} />
            <span
              className="text-lg font-bold"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent-gold)' }}
            >
              {'{'}<span style={{ color: 'var(--color-text)' }}>S</span>{'}'}
            </span>
            <span className="text-[8px] mt-1 uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
              QR
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: 'var(--color-accent-gold)' }}>
                {'>'} ledenpas.load()
              </span>
            </div>
            <p
              className="font-bold text-lg sm:text-xl uppercase tracking-tight"
              style={{
                color: 'var(--color-text)',
                fontFamily: "'Big Shoulders Display', var(--font-geist-sans), sans-serif",
              }}
            >
              Digitale Ledenpas
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
              {username} &middot;{' '}
              <span style={{ color: rank.kleur }}>{rank.naam}</span> &middot;{' '}
              <span style={{ color: 'var(--color-accent-gold)' }}>{points} pts</span>
            </p>
          </div>

          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 group-hover:translate-x-1 group-hover:bg-[rgba(242,158,24,0.15)]"
            style={{ backgroundColor: 'rgba(242, 158, 24, 0.06)' }}
          >
            <ArrowRight size={18} style={{ color: 'var(--color-accent-gold)' }} />
          </div>
        </div>
      </Link>

      {/* Stats */}
      <div>
        <div className="flex items-center gap-4 mb-5">
          <span className="font-mono text-xs tracking-[0.3em] uppercase" style={{ color: 'var(--color-accent-gold)' }}>
            02
          </span>
          <span className="w-12 h-px" style={{ backgroundColor: 'var(--color-accent-gold)' }} />
          <span className="font-mono text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
            Stats
          </span>
        </div>
        <StatsGrid
          points={points}
          role={(member?.role as string) || 'member'}
          commissie={member?.commissie as string | null}
          memberSince={member?.membership_started_at as string | null}
        />
      </div>

      {/* Recent activity */}
      <div>
        <div className="flex items-center gap-4 mb-5">
          <span className="font-mono text-xs tracking-[0.3em] uppercase" style={{ color: 'var(--color-accent-gold)' }}>
            03
          </span>
          <span className="w-12 h-px" style={{ backgroundColor: 'var(--color-accent-gold)' }} />
          <span className="font-mono text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
            Activiteit
          </span>
        </div>
        <RecentActivity scans={(scans || []) as Array<{ id: string; points: number; reason: string; event_name: string | null; created_at: string }>} />
      </div>
    </div>
  )
}
