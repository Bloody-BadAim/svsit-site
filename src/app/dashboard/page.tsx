import { auth } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { getRank, getLevel } from '@/lib/constants'
import { calculateStats } from '@/lib/rewards'
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
    .select(`*, member_commissies ( commissie_id, commissies ( slug, naam ) )`)
    .eq('id', session.user.id)
    .single()

  const { data: scans } = await supabase
    .from('scans')
    .select('*')
    .eq('member_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const { data: completedChallenges } = await supabase
    .from('challenge_submissions')
    .select('id, challenge_id, created_at, status')
    .eq('member_id', session.user.id)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(10)

  const challengeIds = (completedChallenges || []).map(s => s.challenge_id)
  const { data: challengeDetails } = challengeIds.length > 0
    ? await supabase.from('challenges').select('id, title, points, category').in('id', challengeIds)
    : { data: [] }

  const activityItems = [
    ...(scans || []).map(s => ({
      id: s.id as string,
      type: 'scan' as const,
      points: s.points as number,
      reason: s.reason as string,
      event_name: s.event_name as string | null,
      created_at: s.created_at as string,
    })),
    ...(completedChallenges || []).map(s => {
      const challenge = (challengeDetails || []).find((c: { id: string; title: string; points: number; category: string }) => c.id === s.challenge_id)
      return {
        id: s.id as string,
        type: 'challenge' as const,
        points: (challenge?.points as number) || 0,
        reason: (challenge?.title as string) || 'Challenge voltooid',
        event_name: null,
        created_at: s.created_at as string,
      }
    }),
  ]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10)

  const memberStats = await calculateStats(session.user.id)

  const points = (member?.points as number) || 0
  const rank = getRank(points)
  const username = (member?.email as string)?.split('@')[0] || 'lid'

  return (
    <div className="max-w-5xl">
      {/* Welcome banner */}
      {isWelcome && (
        <div
          className="relative p-4 mb-8 overflow-hidden"
          style={{
            backgroundColor: 'rgba(242, 158, 24, 0.03)',
            borderLeft: '3px solid var(--color-accent-gold)',
          }}
        >
          <div className="flex items-center gap-3">
            <Sparkles size={16} style={{ color: 'var(--color-accent-gold)' }} />
            <span className="font-mono text-sm" style={{ color: 'var(--color-accent-gold)' }}>
              membership activated — welkom bij SIT
            </span>
          </div>
        </div>
      )}

      {/* Character header — no numbered sections */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: member?.membership_active ? 'var(--color-accent-green)' : 'var(--color-accent-red)',
              boxShadow: member?.membership_active ? '0 0 8px rgba(34, 197, 94, 0.5)' : '0 0 8px rgba(239, 68, 68, 0.5)',
            }}
          />
          <span className="font-mono text-[10px] uppercase tracking-[0.15em]" style={{ color: 'var(--color-text-muted)' }}>
            {member?.membership_active ? 'online' : 'inactive'} · {rank.naam} · lvl {getLevel(points)}
          </span>
        </div>
        <h1
          className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight uppercase leading-[0.9]"
          style={{
            color: 'var(--color-text)',
            fontFamily: "'Big Shoulders Display', var(--font-geist-sans), sans-serif",
          }}
        >
          {username.toUpperCase()}
        </h1>
      </div>

      {/* Two-column: stats + equipped item */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5 mb-5">
        <StatsGrid
          points={points}
          role={(member?.role as string) || 'member'}
          commissieNames={
            ((member?.member_commissies || []) as unknown as { commissies: { naam: string } }[])
              .map(mc => mc.commissies.naam)
          }
          memberSince={member?.membership_started_at as string | null}
          dynamicStats={memberStats}
        />

        {/* Equipped item — ledenpas */}
        <Link
          href="/dashboard/ledenpas"
          className="group relative overflow-hidden transition-all duration-200"
          style={{
            backgroundColor: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--color-border)',
          }}
        >
          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2" style={{ borderColor: 'var(--color-accent-gold)' }} />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />

          <div className="px-5 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: 'var(--color-accent-gold)' }}>
              equipped
            </span>
          </div>

          <div className="p-5 flex flex-col items-center text-center">
            {/* Mini card icon */}
            <div
              className="w-14 h-18 flex flex-col items-center justify-center mb-3 relative"
              style={{
                border: '1px solid rgba(242, 158, 24, 0.2)',
                background: 'linear-gradient(135deg, transparent 0%, rgba(242, 158, 24, 0.04) 100%)',
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, var(--color-accent-gold), var(--color-accent-blue), var(--color-accent-red))' }} />
              <span
                className="text-sm font-bold font-mono"
                style={{ color: 'var(--color-accent-gold)' }}
              >
                {'{'}<span style={{ color: 'var(--color-text)' }}>S</span>{'}'}
              </span>
              <span className="text-[7px] mt-0.5 uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                QR
              </span>
            </div>

            <p
              className="text-sm font-bold uppercase tracking-wide"
              style={{
                color: 'var(--color-text)',
                fontFamily: "'Big Shoulders Display', var(--font-geist-sans), sans-serif",
              }}
            >
              Ledenpas
            </p>
            <p className="font-mono text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
              <span style={{ color: rank.kleur }}>{rank.naam}</span> · {points}xp
            </p>

            <div
              className="mt-3 font-mono text-[10px] flex items-center gap-1.5 transition-all duration-200 group-hover:gap-2.5"
              style={{ color: 'var(--color-accent-gold)' }}
            >
              <span>inspect</span>
              <ArrowRight size={10} />
            </div>
          </div>
        </Link>
      </div>

      {/* Activity log */}
      <RecentActivity items={activityItems} />
    </div>
  )
}
