'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'

const SECTIONS = [
  { id: 'about', number: '01', label: 'OVER' },
  { id: 'whyjoin', number: '02', label: 'WAAROM' },
  { id: 'events', number: '03', label: 'EVENTS' },
  { id: 'join', number: '04', label: 'JOIN' },
]

export default function ScrollMorphNumbers() {
  const [activeIndex, setActiveIndex] = useState<number>(-1)
  const [visible, setVisible] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const rafRef = useRef<number>(0)
  const sectionRefs = useRef<(HTMLElement | null)[]>([])

  const findActiveSection = useCallback(() => {
    const viewportCenter = window.scrollY + window.innerHeight * 0.45

    // Hide when near top (hero) or near bottom (footer)
    const docHeight = document.documentElement.scrollHeight
    const scrollRatio = window.scrollY / (docHeight - window.innerHeight)
    setScrollProgress(scrollRatio)

    if (window.scrollY < window.innerHeight * 0.7) {
      setVisible(false)
      setActiveIndex(-1)
      return
    }

    // Hide in footer (check if footer is in view)
    const footer = document.getElementById('footer')
    if (footer) {
      const footerRect = footer.getBoundingClientRect()
      if (footerRect.top < window.innerHeight * 0.5) {
        setVisible(false)
        return
      }
    }

    // Find which section the viewport center is in
    let foundIndex = -1
    for (let i = sectionRefs.current.length - 1; i >= 0; i--) {
      const el = sectionRefs.current[i]
      if (!el) continue
      const rect = el.getBoundingClientRect()
      const sectionTop = window.scrollY + rect.top
      if (viewportCenter >= sectionTop) {
        foundIndex = i
        break
      }
    }

    if (foundIndex >= 0) {
      setVisible(true)
      setActiveIndex(foundIndex)
    }
  }, [])

  useEffect(() => {
    const reduced = document.documentElement.classList.contains('reduce-motion')
    if (reduced) return

    // Cache section elements
    sectionRefs.current = SECTIONS.map(s => document.getElementById(s.id))

    const onScroll = () => {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(findActiveSection)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    findActiveSection()

    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(rafRef.current)
    }
  }, [findActiveSection])

  const current = activeIndex >= 0 ? SECTIONS[activeIndex] : null

  return (
    <motion.div
      className="fixed right-6 xl:right-10 top-1/2 -translate-y-1/2 z-40 pointer-events-none hidden lg:flex flex-col items-center"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : 20 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Active number */}
      <div className="relative mb-6 flex flex-col items-center">
        <AnimatePresence mode="wait">
          {current && (
            <motion.div
              key={current.number}
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: -12, scale: 0.7 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.7 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Number */}
              <span
                className="font-mono text-2xl font-bold tracking-tight block"
                style={{
                  color: 'var(--color-accent-gold)',
                  textShadow: '0 0 20px rgba(242,158,24,0.25)',
                }}
              >
                {current.number}
              </span>
              {/* Label */}
              <span
                className="font-mono text-[9px] tracking-[0.25em] uppercase mt-1 block"
                style={{ color: 'rgba(255,255,255,0.3)' }}
              >
                {current.label}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Vertical track line with progress */}
      <div className="relative flex flex-col items-center" style={{ height: 120 }}>
        {/* Background track */}
        <div
          className="absolute inset-x-1/2 top-0 bottom-0 w-px -translate-x-1/2"
          style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
        />

        {/* Progress fill */}
        <motion.div
          className="absolute top-0 w-px -translate-x-1/2"
          style={{
            left: '50%',
            backgroundColor: 'var(--color-accent-gold)',
            boxShadow: '0 0 6px rgba(242,158,24,0.3)',
          }}
          animate={{ height: `${((activeIndex + 1) / SECTIONS.length) * 100}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />

        {/* Section dots */}
        {SECTIONS.map((s, i) => {
          const isActive = i === activeIndex
          const isPast = i < activeIndex
          const yPos = (i / (SECTIONS.length - 1)) * 100

          return (
            <motion.div
              key={s.number}
              className="absolute left-1/2 -translate-x-1/2 flex items-center"
              style={{ top: `${yPos}%` }}
            >
              {/* Dot */}
              <motion.div
                className="rounded-full"
                animate={{
                  width: isActive ? 8 : 4,
                  height: isActive ? 8 : 4,
                  backgroundColor: isActive || isPast
                    ? 'var(--color-accent-gold)'
                    : 'rgba(255,255,255,0.12)',
                  boxShadow: isActive
                    ? '0 0 12px rgba(242,158,24,0.4)'
                    : 'none',
                }}
                transition={{ duration: 0.3 }}
              />

              {/* Section number label (right of dot) */}
              <span
                className="absolute left-5 font-mono text-[9px] whitespace-nowrap"
                style={{
                  color: isActive
                    ? 'rgba(255,255,255,0.35)'
                    : isPast
                      ? 'rgba(255,255,255,0.15)'
                      : 'rgba(255,255,255,0.06)',
                  transition: 'color 0.3s',
                }}
              >
                {s.number}
              </span>
            </motion.div>
          )
        })}
      </div>

      {/* Scroll progress % */}
      <span
        className="font-mono text-[8px] mt-4 tabular-nums"
        style={{ color: 'rgba(255,255,255,0.15)' }}
      >
        {Math.round(scrollProgress * 100)}%
      </span>
    </motion.div>
  )
}
