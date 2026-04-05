'use client'

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { getTierColor, getBadgeSlotCount } from '@/lib/levelEngine'
import type { LevelDef } from '@/types/gamification'

interface LevelUpModalProps {
  isOpen: boolean
  onClose: () => void
  newLevel: LevelDef
  unlockedItems?: Array<{ name: string; type: string }>
}

const RAY_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315]

export function LevelUpModal({ isOpen, onClose, newLevel, unlockedItems = [] }: LevelUpModalProps) {
  const tierColor = getTierColor(newLevel.tier)
  const newSlots = getBadgeSlotCount(newLevel.level)

  // Stable random values per render — memoized so re-renders don't shift particles
  const particles = useMemo(
    () =>
      Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        left: Math.floor(Math.random() * 100),
        size: 2 + Math.floor(Math.random() * 3),
        duration: 2 + Math.random() * 2,
        delay: Math.random() * 1.5,
        rotate: Math.floor(Math.random() * 360),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isOpen]
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          >
            {/* Screen flash */}
            <motion.div
              className="pointer-events-none absolute inset-0 bg-white"
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            />

            {/* Particle rain — fixed to viewport so it covers everything */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              {particles.map((p) => (
                <motion.div
                  key={p.id}
                  className="absolute rounded-full"
                  style={{
                    width: p.size,
                    height: p.size,
                    left: `${p.left}%`,
                    top: -8,
                    backgroundColor: tierColor,
                    opacity: 0.7,
                  }}
                  animate={{
                    y: ['0vh', '110vh'],
                    rotate: [0, p.rotate],
                    opacity: [0.7, 0.7, 0],
                  }}
                  transition={{
                    duration: p.duration,
                    delay: p.delay,
                    ease: 'linear',
                    repeat: Infinity,
                  }}
                />
              ))}
            </div>

            {/* Center stage — stop propagation so clicking inside doesn't close */}
            <div
              className="relative flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Shockwave rings */}
              {[0, 400].map((delayMs, i) => (
                <motion.div
                  key={i}
                  className="pointer-events-none absolute rounded-full border-2"
                  style={{ borderColor: tierColor, width: 80, height: 80 }}
                  initial={{ scale: 0.3, opacity: 0.9 }}
                  animate={{ scale: 5, opacity: 0 }}
                  transition={{ duration: 1, delay: delayMs / 1000, ease: 'easeOut' }}
                />
              ))}

              {/* Radial light rays */}
              <div className="pointer-events-none absolute">
                {RAY_ANGLES.map((angle, i) => (
                  <motion.div
                    key={angle}
                    className="absolute"
                    style={{
                      width: 3,
                      height: 120,
                      background: `linear-gradient(to bottom, ${tierColor}, transparent)`,
                      transformOrigin: 'top center',
                      transform: `rotate(${angle}deg) translateX(-50%)`,
                      left: '50%',
                      top: 0,
                    }}
                    initial={{ scaleY: 0, opacity: 0 }}
                    animate={{ scaleY: 1, opacity: [0, 0.8, 0.4] }}
                    transition={{ duration: 0.6, delay: 0.1 + i * 0.1, ease: 'easeOut' }}
                  />
                ))}
              </div>

              {/* Modal card */}
              <motion.div
                className="relative z-10 w-full max-w-sm mx-4 rounded-2xl border border-white/10 bg-[#0c0c0e] p-8 text-center overflow-hidden"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', damping: 15, stiffness: 400 }}
              >
                {/* Level number — BIG slam */}
                <motion.div
                  className="font-mono font-black leading-none mb-2"
                  style={{
                    fontSize: '5rem',
                    color: tierColor,
                    textShadow: `0 0 60px ${tierColor}, 0 0 120px ${tierColor}80`,
                    filter: 'blur(0px)',
                  }}
                  initial={{ scale: 3, filter: 'blur(10px)', opacity: 0 }}
                  animate={{ scale: 1, filter: 'blur(0px)', opacity: 1 }}
                  transition={{ type: 'spring', damping: 15, stiffness: 400, delay: 0.1 }}
                >
                  {newLevel.level}
                </motion.div>

                {/* "LEVEL UP" label */}
                <motion.p
                  className="text-xs uppercase tracking-[4px] text-gray-500 mb-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  LEVEL UP
                </motion.p>

                {/* Title */}
                <motion.h2
                  className="text-2xl font-bold font-mono mb-2"
                  style={{ color: tierColor }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, ease: 'easeOut' }}
                >
                  {newLevel.title}
                </motion.h2>

                {/* Badge slots */}
                <motion.p
                  className="text-xs text-gray-500 font-mono mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  {newSlots} badge {newSlots === 1 ? 'slot' : 'slots'} unlocked
                </motion.p>

                {/* Unlocked items */}
                {unlockedItems.length > 0 && (
                  <motion.div
                    className="mb-6 space-y-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    <p className="text-[10px] uppercase tracking-[3px] text-gray-500 mb-3">
                      NIEUW UNLOCKED
                    </p>
                    {unlockedItems.map((item, i) => (
                      <motion.div
                        key={i}
                        className="flex items-center justify-center gap-2 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm text-gray-300"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 + i * 0.1, ease: 'easeOut' }}
                      >
                        <span
                          className="text-[10px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded"
                          style={{ color: tierColor, backgroundColor: `${tierColor}18` }}
                        >
                          {item.type}
                        </span>
                        <span>{item.name}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {/* Button */}
                <motion.button
                  className="rounded-lg px-8 py-2.5 text-sm font-mono font-bold uppercase tracking-wider text-black"
                  style={{ backgroundColor: tierColor }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  NICE
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
