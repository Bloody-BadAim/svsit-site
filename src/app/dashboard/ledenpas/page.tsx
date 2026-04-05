import { auth } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import type { Role } from '@/types/database'
import { calculateStats } from '@/lib/rewards'
import { CARD_SKINS } from '@/lib/cardSkins'
import LedenpasClient from '@/components/dashboard/LedenpasClient'
import { getEquippedAccessories } from '@/lib/inventoryEngine'
import type { MemberCardEquipment } from '@/components/MemberCard'
import { RARITY_CONFIG } from '@/types/gamification'
import type { BadgeRarity } from '@/types/gamification'
import { Trophy, ShoppingBag, Palette, BarChart3 } from 'lucide-react'

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

  const isAdmin = session.user.isAdmin

  // Fetch skin rewards, stats, and equipped accessories in parallel
  const [rewardsResult, memberStats, cardEquipment] = await Promise.all([
    supabase.from('rewards').select('reward_id').eq('member_id', session.user.id).eq('type', 'skin_unlock'),
    calculateStats(session.user.id),
    getEquippedAccessories(member.id as string),
  ])

  const { data: rewards } = rewardsResult
  const unlockedSkins = isAdmin
    ? CARD_SKINS.map(s => s.id)
    : ['default', ...((rewards || []).map(r => r.reward_id as string))]
  const activeSkin = (member.active_skin as string) || 'default'
  const activeBadges = (member.active_badges as string[]) || []

  // Look up definitions for equipped items to get display values
  const equippedAccessoryIds = [
    cardEquipment.frameId,
    cardEquipment.petId,
    cardEquipment.effectId,
    ...cardEquipment.stickers.map(s => s.accessoryId),
  ].filter(Boolean) as string[]

  let equipment: MemberCardEquipment | undefined

  if (equippedAccessoryIds.length > 0 || cardEquipment.accentColor || cardEquipment.customTitle) {
    const { data: defs } = await supabase
      .from('accessory_definitions')
      .select('id, name, rarity, category, preview_data')
      .in('id', equippedAccessoryIds.length > 0 ? equippedAccessoryIds : ['__none__'])

    const defMap = new Map((defs ?? []).map(d => [d.id as string, d]))

    const frameDef = cardEquipment.frameId ? defMap.get(cardEquipment.frameId) : null
    const petDef = cardEquipment.petId ? defMap.get(cardEquipment.petId) : null
    const effectDef = cardEquipment.effectId ? defMap.get(cardEquipment.effectId) : null

    const frameColor = frameDef
      ? (frameDef.rarity === 'mythic'
          ? 'conic-gradient(from 0deg, #f59e0b, #ef4444, #8b5cf6, #3b82f6, #22c55e, #f59e0b)'
          : RARITY_CONFIG[frameDef.rarity as BadgeRarity]?.color)
      : undefined

    const petEmoji = petDef
      ? ((petDef.preview_data as Record<string, unknown> | null)?.emoji as string | undefined)
      : undefined

    const effectName = effectDef?.name as string | undefined

    const mappedStickers = cardEquipment.stickers
      .map(s => {
        const stickerDef = defMap.get(s.accessoryId)
        const emoji = (stickerDef?.preview_data as Record<string, unknown> | null)?.emoji as string | undefined
        if (!emoji) return null
        return { id: s.accessoryId, x: s.x, y: s.y, emoji }
      })
      .filter((s): s is { id: string; x: number; y: number; emoji: string } => s !== null)

    equipment = {
      frameColor,
      petEmoji,
      effectName,
      stickers: mappedStickers.length > 0 ? mappedStickers : undefined,
      accentColor: cardEquipment.accentColor ?? undefined,
      customTitle: cardEquipment.customTitle ?? undefined,
    }
  }

  const stats = [
    { key: 'code',   label: 'CODE',   value: memberStats.code,   color: '#22C55E' },
    { key: 'social', label: 'SOCIAL', value: memberStats.social, color: '#F59E0B' },
    { key: 'learn',  label: 'LEARN',  value: memberStats.learn,  color: '#3B82F6' },
    { key: 'impact', label: 'IMPACT', value: memberStats.impact, color: '#EF4444' },
  ]
  const maxStat = Math.max(...stats.map(s => s.value), 1)

  return (
    <div className="space-y-8">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left: member card */}
        <div>
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
            equipment={equipment}
          />
        </div>

        {/* Right: stats + quick actions */}
        <div className="flex flex-col gap-6">
          {/* Character Stats */}
          <div
            className="rounded-xl p-6"
            style={{ border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.02)' }}
          >
            <h3
              className="text-xs font-mono uppercase tracking-widest mb-5"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Character Stats
            </h3>
            <div className="flex flex-col gap-4">
              {stats.map(stat => (
                <div key={stat.key}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-mono uppercase tracking-wider" style={{ color: stat.color }}>
                      {stat.label}
                    </span>
                    <span className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>
                      {stat.value} XP
                    </span>
                  </div>
                  <div
                    className="h-1.5 rounded-full overflow-hidden"
                    style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.round((stat.value / maxStat) * 100)}%`,
                        backgroundColor: stat.color,
                        opacity: 0.85,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            {([
              { href: '/dashboard/rewards',     Icon: Trophy,      label: 'Badges'      },
              { href: '/dashboard/shop',        Icon: ShoppingBag, label: 'Shop'        },
              { href: '/dashboard/card-editor', Icon: Palette,     label: 'Card Editor' },
              { href: '/leaderboard',           Icon: BarChart3,   label: 'Leaderboard' },
            ] as const).map(({ href, Icon, label }) => (
              <a
                key={href}
                href={href}
                className="rounded-lg p-4 flex flex-col gap-1 transition-colors hover:border-[rgba(245,158,11,0.3)]"
                style={{
                  border: '1px solid rgba(255,255,255,0.08)',
                  backgroundColor: 'rgba(255,255,255,0.02)',
                }}
              >
                <Icon className="w-5 h-5" style={{ color: 'var(--color-accent-gold)' }} />
                <span className="text-sm font-mono" style={{ color: 'var(--color-text)' }}>{label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
