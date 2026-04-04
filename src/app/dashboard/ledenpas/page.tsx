import { auth } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import type { Role } from '@/types/database'
import { calculateStats } from '@/lib/rewards'
import { CARD_SKINS } from '@/lib/cardSkins'
import LedenpasClient from '@/components/dashboard/LedenpasClient'

export const metadata = {
  title: 'Ledenpas — SIT',
}

export default async function LedenpasPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const supabase = createServiceClient()
  const { data: member } = await supabase
    .from('members')
    .select(`id, email, student_number, role, points, commissie, active_skin, active_badges,
      member_commissies ( commissie_id, commissies ( slug, naam ) )`)
    .eq('id', session.user.id)
    .single()

  if (!member) redirect('/dashboard')

  const memberCommissies = ((member.member_commissies || []) as unknown as { commissies: { naam: string } }[])
  const commissieNaam = memberCommissies.length > 0
    ? memberCommissies.map(mc => mc.commissies.naam).join(', ')
    : (member.commissie as string) || null

  // Fetch unlocked skin rewards
  const { data: rewards } = await supabase
    .from('rewards')
    .select('reward_id')
    .eq('member_id', session.user.id)
    .eq('type', 'skin_unlock')

  const isAdmin = session.user.isAdmin
  const unlockedSkins = isAdmin
    ? CARD_SKINS.map(s => s.id)
    : ['default', ...((rewards || []).map(r => r.reward_id as string))]
  const activeSkin = (member.active_skin as string) || 'default'
  const activeBadges = (member.active_badges as string[]) || []
  const memberStats = await calculateStats(session.user.id)

  return (
    <div className="max-w-5xl space-y-8">
      {/* Section label */}
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
          Digitale Ledenpas
        </h1>
        <p className="font-mono text-sm mt-3" style={{ color: 'var(--color-text-muted)' }}>
          {'>'} Toon deze QR code bij events om punten te verdienen
        </p>
      </div>

      <LedenpasClient
        data={{
          name: (member.email as string).split('@')[0],
          role: member.role as Role,
          commissie: commissieNaam,
          points: member.points as number,
          memberId: member.id as string,
          email: member.email as string,
          activeBadges,
          dynamicStats: memberStats,
        }}
        skin={activeSkin}
        memberId={member.id as string}
        unlockedSkins={unlockedSkins}
      />
    </div>
  )
}
