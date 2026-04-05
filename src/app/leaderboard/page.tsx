import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'
import { getLevelForXp } from '@/lib/levelEngine'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Leaderboard — {SIT}',
  description: 'De meest actieve SIT leden. Wie staat bovenaan?',
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface LeaderEntry {
  position: number
  id: string
  name: string
  totalXp: number
  currentLevel: number
  visible: boolean
}

interface BubbleEntry {
  position: number
  id: string
  name: string
  totalXp: number
  currentLevel: number
  isYou?: boolean
}

interface BubbleData {
  position: number
  me: {
    id: string
    name: string
    totalXp: number
    currentLevel: number
  }
  above: BubbleEntry[]
  below: BubbleEntry[]
}

// ─── Medal colors ─────────────────────────────────────────────────────────────

const MEDAL: Record<number, { border: string; glow: string; label: string }> = {
  1: { border: '#F59E0B', glow: 'rgba(245,158,11,0.35)', label: '#F59E0B' },
  2: { border: '#9CA3AF', glow: 'rgba(156,163,175,0.25)', label: '#D1D5DB' },
  3: { border: '#CD7F32', glow: 'rgba(205,127,50,0.25)', label: '#D97706' },
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Crown() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-5 h-5"
      aria-hidden="true"
    >
      <path d="M2 19h20v2H2v-2zm2-3l3-8 5 4 5-7 3 11H4z" />
    </svg>
  )
}

function TopCard({ entry }: { entry: LeaderEntry }) {
  const medal = MEDAL[entry.position]
  const levelDef = getLevelForXp(entry.totalXp)

  return (
    <div
      className="relative rounded-lg p-5 flex flex-col gap-2"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: `1px solid ${medal.border}`,
        boxShadow: `0 0 24px ${medal.glow}`,
      }}
    >
      {/* position + crown */}
      <div className="flex items-center gap-2" style={{ color: medal.label }}>
        {entry.position === 1 && <Crown />}
        <span className="font-mono text-sm font-bold">#{entry.position}</span>
      </div>

      {/* name */}
      <p
        className="font-mono text-sm font-bold break-all leading-tight"
        style={{ color: 'var(--color-text)' }}
      >
        {entry.name}
      </p>

      {/* level title */}
      <p className="font-mono text-xs" style={{ color: levelDef.color }}>
        LVL {levelDef.level} — {levelDef.title}
      </p>

      {/* xp */}
      <p className="font-mono text-sm" style={{ color: 'var(--color-text-muted)' }}>
        {entry.totalXp.toLocaleString('nl-NL')} XP
      </p>
    </div>
  )
}

function RankRow({
  entry,
  isYou = false,
}: {
  entry: LeaderEntry | BubbleEntry
  isYou?: boolean
}) {
  const levelDef = getLevelForXp(entry.totalXp)
  const medal = MEDAL[entry.position]

  return (
    <div
      className="flex items-center gap-4 px-4 py-3 rounded-lg transition-colors"
      style={{
        backgroundColor: isYou ? 'rgba(245,158,11,0.08)' : 'var(--color-surface)',
        border: isYou
          ? '1px solid rgba(245,158,11,0.5)'
          : medal
          ? `1px solid ${medal.border}40`
          : '1px solid var(--color-border)',
      }}
    >
      {/* position */}
      <span
        className="font-mono text-sm w-8 shrink-0 text-right"
        style={{
          color: medal ? medal.label : isYou ? '#F59E0B' : 'var(--color-text-muted)',
          fontWeight: medal || isYou ? 700 : 400,
        }}
      >
        #{entry.position}
      </span>

      {/* name + level */}
      <div className="flex-1 min-w-0">
        <p
          className="font-mono text-sm font-semibold truncate"
          style={{ color: isYou ? '#F59E0B' : 'var(--color-text)' }}
        >
          {entry.name}
          {isYou && (
            <span
              className="ml-2 text-xs font-mono px-1.5 py-0.5 rounded"
              style={{ backgroundColor: 'rgba(245,158,11,0.2)', color: '#F59E0B' }}
            >
              jij
            </span>
          )}
        </p>
        <p className="font-mono text-xs" style={{ color: levelDef.color }}>
          LVL {levelDef.level} — {levelDef.title}
        </p>
      </div>

      {/* xp */}
      <span
        className="font-mono text-sm shrink-0"
        style={{ color: isYou ? '#F59E0B' : 'var(--color-text-muted)' }}
      >
        {entry.totalXp.toLocaleString('nl-NL')} XP
      </span>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

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

  const top10: LeaderEntry[] = (rawTop10 ?? []).map((m, i) => ({
    position: i + 1,
    id: m.id as string,
    name: m.leaderboard_visible ? (m.email as string).split('@')[0] : 'Anoniem Lid',
    totalXp: (m.total_xp as number) ?? 0,
    currentLevel: (m.current_level as number) ?? 1,
    visible: m.leaderboard_visible as boolean,
  }))

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

      const { data: above } = await supabase
        .from('members')
        .select('id, email, total_xp, current_level, leaderboard_visible')
        .eq('membership_active', true)
        .gt('total_xp', member.total_xp as number)
        .order('total_xp', { ascending: true })
        .limit(5)

      const { data: below } = await supabase
        .from('members')
        .select('id, email, total_xp, current_level, leaderboard_visible')
        .eq('membership_active', true)
        .lt('total_xp', member.total_xp as number)
        .order('total_xp', { ascending: false })
        .limit(5)

      const mapEntry = (
        m: Record<string, unknown>,
        pos: number,
        isYou = false
      ): BubbleEntry => ({
        position: pos,
        id: m.id as string,
        name: m.leaderboard_visible
          ? (m.email as string).split('@')[0]
          : 'Anoniem Lid',
        totalXp: (m.total_xp as number) ?? 0,
        currentLevel: (m.current_level as number) ?? 1,
        isYou,
      })

      const aboveList = (above ?? [])
        .reverse()
        .map((m, i) => mapEntry(m, position - (above?.length ?? 0) + i))

      const belowList = (below ?? []).map((m, i) => mapEntry(m, position + 1 + i))

      bubble = {
        position,
        me: {
          id: memberId,
          name: member.leaderboard_visible
            ? (member.email as string).split('@')[0]
            : 'Anoniem Lid',
          totalXp: (member.total_xp as number) ?? 0,
          currentLevel: (member.current_level as number) ?? 1,
        },
        above: aboveList,
        below: belowList,
      }
    }
  }

  const podium = top10.slice(0, 3)
  const rest = top10.slice(3)

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
        {/* Header */}
        <div className="mb-10">
          <p className="font-mono text-xs mb-2" style={{ color: 'var(--color-accent-gold)' }}>
            {'// leaderboard'}
          </p>
          <h1
            className="font-mono text-3xl sm:text-4xl font-bold leading-tight"
            style={{ color: 'var(--color-text)' }}
          >
            Hall of Fame
          </h1>
          <p className="mt-2 font-mono text-sm" style={{ color: 'var(--color-text-muted)' }}>
            De meest actieve SIT leden, gerangschikt op XP.
          </p>
        </div>

        {/* ── Hall of Fame ── */}
        {top10.length === 0 ? (
          <p className="font-mono text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Nog geen leden op de leaderboard.
          </p>
        ) : (
          <>
            {/* Podium top 3 */}
            {podium.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                {podium.map((entry) => (
                  <TopCard key={entry.id} entry={entry} />
                ))}
              </div>
            )}

            {/* Rows 4–10 */}
            {rest.length > 0 && (
              <div className="flex flex-col gap-2 mb-12">
                {rest.map((entry) => (
                  <RankRow key={entry.id} entry={entry} />
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Bubble ranking ── */}
        {bubble ? (
          <section aria-label="Jouw positie op de leaderboard">
            {/* divider */}
            <div
              className="flex items-center gap-3 mb-6"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
              <span className="font-mono text-xs">jouw positie</span>
              <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
            </div>

            <div className="flex flex-col gap-2">
              {/* members above you */}
              {bubble.above.map((entry) => (
                <RankRow key={entry.id} entry={entry} />
              ))}

              {/* YOU */}
              <RankRow
                entry={{
                  position: bubble.position,
                  id: bubble.me.id,
                  name: bubble.me.name,
                  totalXp: bubble.me.totalXp,
                  currentLevel: bubble.me.currentLevel,
                  visible: true,
                }}
                isYou
              />

              {/* members below you */}
              {bubble.below.map((entry) => (
                <RankRow key={entry.id} entry={entry} />
              ))}
            </div>
          </section>
        ) : (
          !session && (
            <div
              className="mt-4 rounded-lg px-5 py-4 font-mono text-sm text-center"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-muted)',
              }}
            >
              <a
                href="/login"
                className="underline underline-offset-4"
                style={{ color: 'var(--color-accent-gold)' }}
              >
                Log in
              </a>{' '}
              om jouw positie te zien.
            </div>
          )
        )}
      </main>

      <Footer />
    </div>
  )
}
