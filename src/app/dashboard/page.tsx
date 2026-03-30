import { auth } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import StatsGrid from '@/components/dashboard/StatsGrid'
import RecentActivity from '@/components/dashboard/RecentActivity'
import Link from 'next/link'

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

  return (
    <div className="max-w-4xl space-y-8">
      {/* Welcome banner */}
      {isWelcome && (
        <div
          className="p-4 rounded-lg"
          style={{
            backgroundColor: 'rgba(242, 158, 24, 0.1)',
            border: '1px solid var(--color-accent-gold)',
          }}
        >
          <p className="font-semibold" style={{ color: 'var(--color-accent-gold)' }}>
            Welkom bij SIT! 🎉
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Je lidmaatschap is geactiveerd. Check je ledenpas en verdien punten bij events.
          </p>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
          Hey, {member?.email?.split('@')[0] || 'lid'}
        </h1>
        <p className="mt-1" style={{ color: 'var(--color-text-muted)' }}>
          {member?.membership_active
            ? 'Je lidmaatschap is actief'
            : 'Je lidmaatschap is niet actief'}
        </p>
      </div>

      {/* Mini ledenpas preview */}
      <Link
        href="/dashboard/ledenpas"
        className="block p-5 rounded-lg transition-all duration-200 group"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span
              className="text-lg font-bold"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent-gold)' }}
            >
              {'{'}<span style={{ color: 'var(--color-text)' }}>SIT</span>{'}'}
            </span>
            <div>
              <p className="font-semibold" style={{ color: 'var(--color-text)' }}>
                Digitale Ledenpas
              </p>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Tik om je QR code te openen
              </p>
            </div>
          </div>
          <span className="text-xl" style={{ color: 'var(--color-text-muted)' }}>→</span>
        </div>
      </Link>

      {/* Stats */}
      <StatsGrid
        points={(member?.points as number) || 0}
        role={(member?.role as string) || 'member'}
        commissie={member?.commissie as string | null}
        memberSince={member?.membership_started_at as string | null}
      />

      {/* Recent activity */}
      <RecentActivity scans={(scans || []) as Array<{ id: string; points: number; reason: string; event_name: string | null; created_at: string }>} />
    </div>
  )
}
