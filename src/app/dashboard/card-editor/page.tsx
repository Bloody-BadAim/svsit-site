import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase'
import { CardEditor } from '@/components/dashboard/cardEditor/CardEditor'

export const metadata = {
  title: 'Card Editor — SIT',
}

export default async function CardEditorPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const supabase = createServiceClient()

  const [inventoryResult, equippedResult, definitionsResult, memberResult] = await Promise.all([
    supabase.from('member_accessories').select('*, accessory_definitions(*)').eq('member_id', session.user.id),
    supabase.from('member_accessories').select('*, accessory_definitions(*)').eq('member_id', session.user.id).eq('equipped', true),
    supabase.from('accessory_definitions').select('*').order('rarity'),
    supabase.from('members').select('current_level, accent_color, custom_title, active_skin, coins_balance').eq('id', session.user.id).single(),
  ])

  return (
    <div className="max-w-6xl">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: 'var(--color-accent-gold)',
              boxShadow: '0 0 8px rgba(245, 158, 11, 0.5)',
            }}
          />
          <span className="font-mono text-xs uppercase tracking-[0.15em]" style={{ color: 'var(--color-text-muted)' }}>
            card.editor &middot; customize je ledenpas
          </span>
        </div>
        <h1
          className="text-4xl sm:text-5xl font-bold tracking-tight uppercase leading-[0.9]"
          style={{
            color: 'var(--color-text)',
            fontFamily: "'Big Shoulders Display', var(--font-geist-sans), sans-serif",
          }}
        >
          CARD EDITOR
        </h1>
      </div>

      <CardEditor
        inventory={inventoryResult.data ?? []}
        equipped={equippedResult.data ?? []}
        allDefinitions={definitionsResult.data ?? []}
        member={memberResult.data ?? { current_level: 1, accent_color: null, custom_title: null, active_skin: 'default', coins_balance: 0 }}
        memberId={session.user.id}
      />
    </div>
  )
}
