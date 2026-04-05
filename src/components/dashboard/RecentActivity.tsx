'use client'

import { motion, useReducedMotion } from 'motion/react'
import { Zap, Target } from 'lucide-react'

interface ActivityItem {
  id: string
  type: 'scan' | 'challenge'
  points: number
  reason: string
  event_name: string | null
  created_at: string
}

interface RecentActivityProps {
  items: ActivityItem[]
}

export default function RecentActivity({ items }: RecentActivityProps) {
  const shouldReduceMotion = useReducedMotion()

  if (items.length === 0) {
    return (
      <motion.div
        className="relative overflow-hidden font-mono"
        style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--color-border)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />

        <div className="px-5 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: 'var(--color-text-muted)' }}>
            activity.log
          </span>
        </div>
        <div className="px-5 py-8 text-center">
          <motion.div
            className="relative inline-block"
            animate={shouldReduceMotion ? {} : { rotate: [0, -6, 6, 0] }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <div className="absolute inset-0 rounded-full animate-ping" style={{ backgroundColor: 'rgba(242, 158, 24, 0.1)' }} />
            <Zap size={24} style={{ color: 'var(--color-accent-gold)', opacity: 0.4 }} className="relative mx-auto mb-3" />
          </motion.div>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {'>'} awaiting first event scan...
          </p>
          <p className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
            ga naar een SIT event en scan je QR code
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <div
      className="relative overflow-hidden font-mono"
      style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--color-border)' }}
    >
      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />

      <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: 'var(--color-text-muted)' }}>
          activity.log
        </span>
        <motion.span
          className="text-[10px] px-1.5 py-0.5"
          style={{ color: 'var(--color-accent-gold)', border: '1px solid rgba(242, 158, 24, 0.2)' }}
          initial={shouldReduceMotion ? {} : { scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 500, damping: 15 }}
        >
          {items.length}
        </motion.span>
      </div>

      <div className="relative" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
        {/* Timeline connector */}
        <div
          className="absolute left-[19px] top-12 bottom-4 w-px"
          style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
        />

        {items.map((item, i) => {
          const time = new Date(item.created_at)
          const timeStr = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`
          const dateStr = time.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })

          const now = new Date()
          const isToday = time.toDateString() === now.toDateString()
          const yesterday = new Date(now)
          yesterday.setDate(yesterday.getDate() - 1)
          const isYesterday = time.toDateString() === yesterday.toDateString()
          const relativeHint = isToday ? 'vandaag' : isYesterday ? 'gisteren' : null

          const isChallenge = item.type === 'challenge'
          const dotColor = isChallenge ? 'var(--color-accent-blue)' : 'var(--color-accent-gold)'
          const dotGlow = isChallenge ? '0 0 6px rgba(59, 130, 246, 0.4)' : '0 0 6px rgba(242, 158, 24, 0.4)'
          const accentBorder = isChallenge
            ? '2px solid var(--color-accent-blue)'
            : '2px solid var(--color-accent-gold)'

          return (
            <motion.div
              key={item.id}
              className="relative z-10 flex items-start gap-4 px-5 py-3 group"
              style={{
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                borderLeft: accentBorder,
              }}
              initial={shouldReduceMotion ? {} : { opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.05, type: 'spring', stiffness: 400, damping: 28 }}
              whileHover={{ backgroundColor: 'rgba(242, 158, 24, 0.02)' }}
            >
              {/* Timestamp column */}
              <div className="shrink-0 text-[10px] pt-0.5 w-20" style={{ color: 'rgba(255,255,255,0.25)' }}>
                {relativeHint ? (
                  <>
                    <span style={{ color: 'rgba(255,255,255,0.35)' }}>{relativeHint}</span>
                    <span className="ml-1.5" style={{ color: 'rgba(255,255,255,0.15)' }}>{timeStr}</span>
                  </>
                ) : (
                  <>
                    <span>{dateStr}</span>
                    <span className="ml-1.5" style={{ color: 'rgba(255,255,255,0.15)' }}>{timeStr}</span>
                  </>
                )}
              </div>

              {/* Type icon */}
              <div className="shrink-0 pt-0.5">
                {isChallenge ? (
                  <Target size={12} style={{ color: dotColor, filter: `drop-shadow(${dotGlow})` }} />
                ) : (
                  <Zap size={12} style={{ color: dotColor, filter: `drop-shadow(${dotGlow})` }} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <span className="text-xs" style={{ color: 'var(--color-text)' }}>
                  {item.reason}
                </span>
                {item.event_name && (
                  <span className="text-[10px] ml-2" style={{ color: 'var(--color-accent-blue)' }}>
                    @{item.event_name}
                  </span>
                )}
                {isChallenge && (
                  <span className="text-[10px] ml-2" style={{ color: 'var(--color-accent-blue)', opacity: 0.7 }}>
                    challenge
                  </span>
                )}
              </div>

              {/* XP gain */}
              <span
                className="shrink-0 font-mono text-xs font-bold px-2 py-0.5 rounded"
                style={{
                  color: isChallenge ? 'var(--color-accent-blue)' : 'var(--color-accent-gold)',
                  backgroundColor: isChallenge ? 'rgba(59, 130, 246, 0.08)' : 'rgba(242, 158, 24, 0.08)',
                }}
              >
                +{item.points}xp
              </span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
