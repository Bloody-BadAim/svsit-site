import { auth } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import MemberCard from '@/components/dashboard/MemberCard'
import type { Role } from '@/types/database'
import { QrCode } from 'lucide-react'

export const metadata = {
  title: 'Ledenpas — SIT',
}

export default async function LedenpasPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const supabase = createServiceClient()
  const { data: member } = await supabase
    .from('members')
    .select('id, email, student_number, role, points')
    .eq('id', session.user.id)
    .single()

  if (!member) redirect('/dashboard')

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] uppercase tracking-[0.15em] font-semibold" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
            {'>'} ledenpas
          </span>
        </div>
        <h1
          className="text-3xl sm:text-4xl font-bold tracking-tight"
          style={{
            color: 'var(--color-text)',
            fontFamily: "'Big Shoulders Display', var(--font-geist-sans), sans-serif",
          }}
        >
          DIGITALE LEDENPAS
        </h1>
        <div className="flex items-center gap-2 mt-2">
          <QrCode size={14} style={{ color: 'var(--color-accent-gold)' }} />
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Toon deze QR code bij events om punten te verdienen
          </p>
        </div>
      </div>

      <MemberCard
        memberId={member.id as string}
        email={member.email as string}
        studentNumber={member.student_number as string | null}
        role={member.role as Role}
        points={member.points as number}
      />
    </div>
  )
}
