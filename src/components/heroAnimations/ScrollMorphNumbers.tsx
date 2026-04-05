'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'

const SECTIONS = [
  { id: 'about', number: '01' },
  { id: 'why-join', number: '02' },
  { id: 'events', number: '03' },
  { id: 'join', number: '04' },
]

export default function ScrollMorphNumbers() {
  const [current, setCurrent] = useState<string | null>(null)
  const [transitioning, setTransitioning] = useState(false)
  const prevRef = useRef<string | null>(null)

  useEffect(() => {
    const reduced = document.documentElement.classList.contains('reduce-motion')
    if (reduced) return

    const observers: IntersectionObserver[] = []

    SECTIONS.forEach(section => {
      const el = document.getElementById(section.id)
      if (!el) return

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
              if (prevRef.current !== section.number) {
                setTransitioning(true)
                setTimeout(() => {
                  setCurrent(section.number)
                  prevRef.current = section.number
                  setTimeout(() => setTransitioning(false), 400)
                }, 150)
              }
            }
          })
        },
        { threshold: [0.3, 0.5] }
      )

      observer.observe(el)
      observers.push(observer)
    })

    // Hide when in hero or footer
    const heroObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setCurrent(null)
          prevRef.current = null
        }
      },
      { threshold: 0.5 }
    )

    const hero = document.querySelector('[data-hero]')
    if (hero) {
      heroObserver.observe(hero)
      observers.push(heroObserver)
    }

    return () => observers.forEach(o => o.disconnect())
  }, [])

  if (!current) return null

  return (
    <div className="fixed top-1/2 right-8 -translate-y-1/2 z-40 pointer-events-none hidden lg:block">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          className="font-mono font-bold select-none"
          style={{
            color: 'var(--color-accent-gold)',
            fontSize: transitioning ? '120px' : '14px',
            opacity: transitioning ? 0.15 : 0.4,
            textShadow: transitioning ? '0 0 40px rgba(242,158,24,0.3)' : 'none',
          }}
          initial={{ scale: 6, opacity: 0, filter: 'blur(4px)' }}
          animate={{
            scale: 1,
            opacity: 0.4,
            filter: 'blur(0px)',
          }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {current}
        </motion.div>
      </AnimatePresence>

      {/* Section dots */}
      <div className="flex flex-col items-center gap-2 mt-4">
        {SECTIONS.map(s => (
          <div
            key={s.number}
            className="w-1 h-1 rounded-full transition-all duration-300"
            style={{
              backgroundColor: current === s.number ? 'var(--color-accent-gold)' : 'rgba(255,255,255,0.1)',
              transform: current === s.number ? 'scale(1.5)' : 'scale(1)',
            }}
          />
        ))}
      </div>
    </div>
  )
}
