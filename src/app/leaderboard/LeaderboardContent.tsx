'use client'

import { motion, useAnimationFrame, useMotionValue, useTransform } from 'motion/react'
import { useRef } from 'react'
import type { LeaderEntry, BubbleEntry, BubbleData } from './page'

// ─── Medal colors ─────────────────────────────────────────────────────────────

const MEDAL: Record<number, { border: string; glow: string; glowStrong: string; label: string }> = {
  1: {
    border: '#F59E0B',
    glow: 'rgba(245,158,11,0.25)',
    glowStrong: 'rgba(245,158,11,0.55)',
    label: '#F59E0B',
  },
  2: {
    border: '#9CA3AF',
    glow: 'rgba(156,163,175,0.15)',
    glowStrong: 'rgba(156,163,175,0.4)',
    label: '#D1D5DB',
  },
  3: {
    border: '#CD7F32',
    glow: 'rgba(205,127,50,0.15)',
    glowStrong: 'rgba(205,127,50,0.4)',
    label: '#D97706',
  },
}

// Podium entrance: #2 left, #1 bottom (center), #3 right
const PODIUM_INITIAL: Record<number, { x: number; y: number }> = {
  1: { x: 0, y: 60 },
  2: { x: -60, y: 0 },
  3: { x: 60, y: 0 },
}

// Podium stagger delay (seconds)
const PODIUM_DELAY: Record<number, number> = {
  2: 0,
  3: 0.1,
  1: 0.22,
}

// ─── Animated Crown ───────────────────────────────────────────────────────────

function Crown() {
  const y = useMotionValue(0)
  const ref = useRef<number>(0)

  useAnimationFrame((t) => {
    // smooth sine oscillation: -2px to +2px over ~2.4s
    y.set(Math.sin(t / 1200) * 2)
  })

  return (
    <motion.svg
      style={{ y }}
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-5 h-5"
      aria-hidden="true"
    >
      <path d="M2 19h20v2H2v-2zm2-3l3-8 5 4 5-7 3 11H4z" />
    </motion.svg>
  )
}

// ─── TopCard ──────────────────────────────────────────────────────────────────

function TopCard({ entry }: { entry: LeaderEntry }) {
  const medal = MEDAL[entry.position]
  const initial = PODIUM_INITIAL[entry.position]
  const delay = PODIUM_DELAY[entry.position]
  const isFirst = entry.position === 1

  return (
    <motion.div
      initial={{ opacity: 0, x: initial.x, y: initial.y, scale: 0.92 }}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 22,
        delay,
      }}
      whileHover={{
        y: -4,
        boxShadow: `0 0 36px ${medal.glowStrong}`,
      }}
      className="relative rounded-lg p-5 flex flex-col gap-2 cursor-default"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: `1px solid ${medal.border}`,
        boxShadow: `0 0 24px ${medal.glow}`,
        // scale #1 card slightly bigger
        ...(isFirst ? { paddingTop: '1.5rem', paddingBottom: '1.5rem' } : {}),
      }}
    >
      {/* Glow pulse ring — animated via CSS keyframes on the border */}
      <motion.div
        className="absolute inset-0 rounded-lg pointer-events-none"
        animate={{
          boxShadow: [
            `0 0 16px ${medal.glow}`,
            `0 0 32px ${medal.glowStrong}`,
            `0 0 16px ${medal.glow}`,
          ],
        }}
        transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity }}
      />

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
      <p className="font-mono text-xs" style={{ color: entry.levelColor }}>
        LVL {entry.currentLevel} — {entry.levelTitle}
      </p>

      {/* xp */}
      <p className="font-mono text-sm" style={{ color: 'var(--color-text-muted)' }}>
        {entry.totalXp.toLocaleString('nl-NL')} XP
      </p>
    </motion.div>
  )
}

// ─── RankRow ──────────────────────────────────────────────────────────────────

function RankRow({
  entry,
  isYou = false,
  index = 0,
}: {
  entry: LeaderEntry | BubbleEntry
  isYou?: boolean
  index?: number
}) {
  const medal = MEDAL[entry.position]

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.35,
        ease: [0.25, 0.1, 0.25, 1],
        delay: index * 0.05,
      }}
      whileHover={
        !isYou
          ? {
              backgroundColor: 'var(--color-surface-hover, rgba(255,255,255,0.06))',
              borderLeftWidth: '3px',
              borderLeftColor: medal ? medal.border : 'var(--color-accent-gold)',
            }
          : undefined
      }
      className="flex items-center gap-4 px-4 py-3 rounded-lg"
      style={{
        backgroundColor: isYou ? 'rgba(245,158,11,0.08)' : 'var(--color-surface)',
        border: isYou
          ? '1px solid rgba(245,158,11,0.5)'
          : medal
          ? `1px solid ${medal.border}40`
          : '1px solid var(--color-border)',
        // "jij" row: pulse on the border via boxShadow
      }}
    >
      {/* Pulse on your own row */}
      {isYou && (
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none"
          animate={{
            boxShadow: [
              '0 0 0px rgba(245,158,11,0)',
              '0 0 16px rgba(245,158,11,0.3)',
              '0 0 0px rgba(245,158,11,0)',
            ],
          }}
          transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity }}
          style={{ position: 'absolute' }}
        />
      )}

      {/* position badge */}
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
        <p className="font-mono text-xs" style={{ color: entry.levelColor }}>
          LVL {entry.currentLevel} — {entry.levelTitle}
        </p>
      </div>

      {/* xp */}
      <span
        className="font-mono text-sm shrink-0"
        style={{ color: isYou ? '#F59E0B' : 'var(--color-text-muted)' }}
      >
        {entry.totalXp.toLocaleString('nl-NL')} XP
      </span>
    </motion.div>
  )
}

// ─── BubbleSection ────────────────────────────────────────────────────────────

function BubbleSection({ bubble }: { bubble: BubbleData }) {
  const meEntry: LeaderEntry = {
    position: bubble.position,
    id: bubble.me.id,
    name: bubble.me.name,
    totalXp: bubble.me.totalXp,
    currentLevel: bubble.me.currentLevel,
    levelTitle: bubble.me.levelTitle,
    levelColor: bubble.me.levelColor,
  }

  return (
    <motion.section
      aria-label="Jouw positie op de leaderboard"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1], delay: 0.3 }}
    >
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
        {bubble.above.map((entry, i) => (
          <RankRow key={entry.id} entry={entry} index={i} />
        ))}

        {/* relative wrapper for the pulse overlay */}
        <div className="relative">
          <RankRow entry={meEntry} isYou index={bubble.above.length} />
        </div>

        {bubble.below.map((entry, i) => (
          <RankRow key={entry.id} entry={entry} index={bubble.above.length + 1 + i} />
        ))}
      </div>
    </motion.section>
  )
}

// ─── Main Client Component ────────────────────────────────────────────────────

interface Props {
  top10: LeaderEntry[]
  bubble: BubbleData | null
  isLoggedIn: boolean
}

export default function LeaderboardContent({ top10, bubble, isLoggedIn }: Props) {
  const podium = top10.slice(0, 3)
  const rest = top10.slice(3)

  return (
    <>
      {/* Header */}
      <motion.div
        className="mb-10"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      >
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
      </motion.div>

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
              {rest.map((entry, i) => (
                <RankRow key={entry.id} entry={entry} index={i} />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Bubble ranking ── */}
      {bubble ? (
        <BubbleSection bubble={bubble} />
      ) : (
        !isLoggedIn && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1], delay: 0.4 }}
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
          </motion.div>
        )
      )}
    </>
  )
}
