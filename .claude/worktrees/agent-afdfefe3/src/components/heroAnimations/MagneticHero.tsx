'use client'

import { useRef, useEffect, useState } from 'react'

interface MagneticHeroProps {
  children: React.ReactNode
}

export default function MagneticHero({ children }: MagneticHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const rafRef = useRef<number>(0)
  const targetRef = useRef({ x: 0, y: 0 })
  const currentRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    setMounted(true)
    const reduced = document.documentElement.classList.contains('reduce-motion')
    if (reduced) return

    // Only on desktop (pointer: fine)
    const hasPointer = window.matchMedia('(pointer: fine)').matches
    if (!hasPointer) return

    const handleMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      // Normalize to -1..1
      targetRef.current = {
        x: (e.clientX - centerX) / (rect.width / 2),
        y: (e.clientY - centerY) / (rect.height / 2),
      }
    }

    const handleLeave = () => {
      targetRef.current = { x: 0, y: 0 }
    }

    const animate = () => {
      // Lerp toward target
      currentRef.current.x += (targetRef.current.x - currentRef.current.x) * 0.08
      currentRef.current.y += (targetRef.current.y - currentRef.current.y) * 0.08

      if (containerRef.current) {
        const rotateY = currentRef.current.x * 4  // max 4 degrees
        const rotateX = -currentRef.current.y * 3  // max 3 degrees
        const translateX = currentRef.current.x * 8  // max 8px shift
        const translateY = currentRef.current.y * 5  // max 5px shift

        containerRef.current.style.transform =
          `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateX(${translateX}px) translateY(${translateY}px)`
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseleave', handleLeave)
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseleave', handleLeave)
      cancelAnimationFrame(rafRef.current)
    }
  }, [mounted])

  return (
    <div
      ref={containerRef}
      className="will-change-transform"
      style={{ transformStyle: 'preserve-3d', transition: 'none' }}
    >
      {children}
    </div>
  )
}
