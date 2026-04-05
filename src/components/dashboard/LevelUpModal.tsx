'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { getTierColor, getBadgeSlotCount } from '@/lib/levelEngine'
import type { LevelDef } from '@/types/gamification'

interface LevelUpModalProps {
  isOpen: boolean
  onClose: () => void
  newLevel: LevelDef
  unlockedItems?: Array<{ name: string; type: string }>
}

export function LevelUpModal({ isOpen, onClose, newLevel, unlockedItems = [] }: LevelUpModalProps) {
  const tierColor = getTierColor(newLevel.tier)
  const newSlots = getBadgeSlotCount(newLevel.level)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-md mx-4 rounded-2xl border border-white/10 bg-[#0c0c0e] p-8 text-center"
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Confetti particles */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: ['#F59E0B', '#3B82F6', '#22C55E', '#EF4444', '#8B5CF6'][i % 5],
                    left: `${Math.random() * 100}%`,
                  }}
                  initial={{ y: -20, opacity: 1 }}
                  animate={{ y: 500, opacity: 0, rotate: Math.random() * 720 }}
                  transition={{ duration: 2 + Math.random(), delay: Math.random() * 0.5, ease: 'easeOut' }}
                />
              ))}
            </div>

            {/* Level badge */}
            <motion.div
              className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full border-2 text-3xl font-bold font-mono"
              style={{ borderColor: tierColor, color: tierColor, boxShadow: `0 0 30px ${tierColor}40` }}
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              L{newLevel.level}
            </motion.div>

            <motion.p
              className="text-sm uppercase tracking-[4px] text-gray-500 mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              LEVEL UP
            </motion.p>

            <motion.h2
              className="text-2xl font-bold font-mono mb-1"
              style={{ color: tierColor }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {newLevel.title}
            </motion.h2>

            <motion.p
              className="text-gray-400 text-sm mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {newSlots} badge slots unlocked
            </motion.p>

            {/* Unlocked items */}
            {unlockedItems.length > 0 && (
              <motion.div
                className="mb-6 space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <p className="text-xs uppercase tracking-[3px] text-gray-500">NIEUW UNLOCKED</p>
                {unlockedItems.map((item, i) => (
                  <div key={i} className="flex items-center justify-center gap-2 text-sm text-gray-300">
                    <span className="text-xs text-gray-500 uppercase">{item.type}</span>
                    <span>{item.name}</span>
                  </div>
                ))}
              </motion.div>
            )}

            <motion.button
              className="rounded-lg px-6 py-2.5 text-sm font-mono font-bold uppercase tracking-wider text-black transition-colors"
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
        </motion.div>
      )}
    </AnimatePresence>
  )
}
