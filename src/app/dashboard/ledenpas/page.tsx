import { auth } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import MemberCard from '@/components/dashboard/MemberCard'
import type { Role } from '@/types/database'

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
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
          Digitale Ledenpas
        </h1>
        <p className="mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Toon deze QR code bij events om punten te verdienen
        </p>
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
