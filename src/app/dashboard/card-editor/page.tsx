import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase'
import { CardEditor } from '@/components/dashboard/cardEditor/CardEditor'

export default async function CardEditorPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const supabase = createServiceClient()

  const [inventoryResult, definitionsResult, memberResult] = await Promise.all([
    supabase
      .from('member_accessories')
      .select('*, accessory_definitions(*)')
      .eq('member_id', session.user.id),
    supabase
      .from('accessory_definitions')
      .select('*')
      .order('rarity'),
    supabase
      .from('members')
      .select('current_level, accent_color, custom_title, active_skin, coins_balance, is_admin, role, leaderboard_visible')
      .eq('id', session.user.id)
      .single(),
  ])

  const member = memberResult.data
  const isAdmin = member?.is_admin || member?.role === 'bestuur'
  const equippedRows = (inventoryResult.data ?? []).filter((r: any) => r.equipped)

  return (
    <CardEditor
      inventory={inventoryResult.data ?? []}
      equipped={equippedRows}
      allDefinitions={definitionsResult.data ?? []}
      member={member ?? {
        current_level: 1,
        accent_color: null,
        custom_title: null,
        leaderboard_visible: true,
        active_skin: 'default',
        coins_balance: 0,
      }}
      memberId={session.user.id}
      isAdmin={isAdmin}
    />
  )
}
