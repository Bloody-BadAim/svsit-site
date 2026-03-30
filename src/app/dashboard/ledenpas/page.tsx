import { auth } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import MemberCard from '@/components/MemberCard'
import type { Role } from '@/types/database'
import { COMMISSIES } from '@/lib/constants'

export const metadata = {
  title: 'Ledenpas — SIT',
}

export default async function LedenpasPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const supabase = createServiceClient()
  const { data: member } = await supabase
    .from('members')
    .select('id, email, student_number, role, points, commissie')
    .eq('id', session.user.id)
    .single()

  if (!member) redirect('/dashboard')

  const commissieNaam = COMMISSIES.find(c => c.id === (member.commissie as string))?.naam || (member.commissie as string) || null

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

      <div className="flex justify-center">
        <MemberCard
          className="w-full max-w-[400px]"
          showQR
          data={{
            name: (member.email as string).split('@')[0],
            role: member.role as Role,
            commissie: commissieNaam,
            points: member.points as number,
            memberId: member.id as string,
            email: member.email as string,
          }}
        />
      </div>
    </div>
  )
}
