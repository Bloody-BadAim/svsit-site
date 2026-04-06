import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'
import { getLevelForXp } from '@/lib/levelEngine'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import LeaderboardContent from './LeaderboardContent'

export const metadata: Metadata = {
  title: 'Leaderboard — {SIT}',
  description: 'De meest actieve SIT leden. Wie staat bovenaan?',
}

// ─── Types (shared) ───────────────────────────────────────────────────────────

export interface LeaderEntry {
  position: number
  id: string
  name: string
  totalXp: number
  currentLevel: number
  levelTitle: string
  levelColor: string
  visible: boolean
}

export interface BubbleEntry {
  position: number
  id: string
  name: string
  totalXp: number
  currentLevel: number
  levelTitle: string
  levelColor: string
  isYou?: boolean
}

export interface BubbleData {
  position: number
  me: {
    id: string
    name: string
    totalXp: number
    currentLevel: number
    levelTitle: string
    levelColor: string
  }
  above: BubbleEntry[]
  below: BubbleEntry[]
}

// ─── Page (server component — data only) ──────────────────────────────────────

export default async function LeaderboardPage() {
  const session = await auth()
  const supabase = createServiceClient()

  // Fetch top 10 directly on server
  const { data: rawTop10 } = await supabase
    .from('members')
    .select('id, email, total_xp, current_level, leaderboard_visible')
    .eq('membership_active', true)
    .order('total_xp', { ascending: false })
    .limit(10)

  const top10: LeaderEntry[] = (rawTop10 ?? []).map((m, i) => {
    const levelDef = getLevelForXp((m.total_xp as number) ?? 0)
    return {
      position: i + 1,
      id: m.id as string,
      name: m.leaderboard_visible ? (m.email as string).split('@')[0] : 'Anoniem Lid',
      totalXp: (m.total_xp as number) ?? 0,
      currentLevel: (m.current_level as number) ?? 1,
      levelTitle: levelDef.title,
      levelColor: levelDef.color,
      visible: m.leaderboard_visible as boolean,
    }
  })

  // Bubble ranking — only if logged in
  let bubble: BubbleData | null = null
  if (session?.user?.id) {
    const memberId = session.user.id

    const { data: member } = await supabase
      .from('members')
      .select('total_xp, current_level, email, leaderboard_visible')
      .eq('id', memberId)
      .single()

    if (member) {
      const { count: aboveCount } = await supabase
        .from('members')
        .select('id', { count: 'exact', head: true })
        .eq('membership_active', true)
        .gt('total_xp', member.total_xp as number)

      const position = (aboveCount ?? 0) + 1

      const [{ data: above }, { data: below }] = await Promise.all([
        supabase
          .from('members')
          .select('id, email, total_xp, current_level, leaderboard_visible')
          .eq('membership_active', true)
          .gt('total_xp', member.total_xp as number)
          .order('total_xp', { ascending: true })
          .limit(5),
        supabase
          .from('members')
          .select('id, email, total_xp, current_level, leaderboard_visible')
          .eq('membership_active', true)
          .lt('total_xp', member.total_xp as number)
          .order('total_xp', { ascending: false })
          .limit(5),
      ])

      const mapEntry = (
        m: Record<string, unknown>,
        pos: number,
        isYou = false
      ): BubbleEntry => {
        const lvl = getLevelForXp((m.total_xp as number) ?? 0)
        return {
          position: pos,
          id: m.id as string,
          name: m.leaderboard_visible
            ? (m.email as string).split('@')[0]
            : 'Anoniem Lid',
          totalXp: (m.total_xp as number) ?? 0,
          currentLevel: (m.current_level as number) ?? 1,
          levelTitle: lvl.title,
          levelColor: lvl.color,
          isYou,
        }
      }

      const aboveList = (above ?? [])
        .reverse()
        .map((m, i) => mapEntry(m, position - (above?.length ?? 0) + i))

      const belowList = (below ?? []).map((m, i) => mapEntry(m, position + 1 + i))

      const meLvl = getLevelForXp((member.total_xp as number) ?? 0)

      bubble = {
        position,
        me: {
          id: memberId,
          name: member.leaderboard_visible
            ? (member.email as string).split('@')[0]
            : 'Anoniem Lid',
          totalXp: (member.total_xp as number) ?? 0,
          currentLevel: (member.current_level as number) ?? 1,
          levelTitle: meLvl.title,
          levelColor: meLvl.color,
        },
        above: aboveList,
        below: belowList,
      }
    }
  }

  return (
    <div className="page-public" style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh' }}>
      <Navbar />

      {/* Subtle grid background */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(245, 158, 11, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(245, 158, 11, 0.02) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          maskImage:
            'radial-gradient(ellipse 80% 60% at 50% 0%, black 0%, transparent 70%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 80% 60% at 50% 0%, black 0%, transparent 70%)',
        }}
      />

      <main
        id="main-content"
        className="relative z-[1] max-w-2xl mx-auto px-4 sm:px-6 pb-24"
        style={{ paddingTop: '7rem' }}
      >
        <LeaderboardContent
          top10={top10}
          bubble={bubble}
          isLoggedIn={!!session}
        />
      </main>

      <Footer />
    </div>
  )
}
