'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'

const LINES = [
  { text: '$ npm run sit', delay: 0, speed: 40 },
  { text: '> compiling bestuur-xi...', delay: 600, speed: 30 },
  { text: '> loading commissies [7/7]', delay: 1200, speed: 25 },
  { text: '> injecting events...', delay: 1600, speed: 30 },
  { text: '> {SIT} build successful', delay: 2200, speed: 20 },
]

export default function CodeCompile({ onComplete }: { onComplete: () => void }) {
  const [visible, setVisible] = useState(true)
  const [typedLines, setTypedLines] = useState<string[]>([])
  const [currentLine, setCurrentLine] = useState(0)
  const [currentChar, setCurrentChar] = useState(0)
  const [progress, setProgress] = useState(0)
  const [showFlash, setShowFlash] = useState(false)

  // Check if animation should be skipped
  useEffect(() => {
    const reduced = document.documentElement.classList.contains('reduce-motion')
    const seen = sessionStorage.getItem('sit-intro-seen')
    if (reduced || seen) {
      setVisible(false)
      onComplete()
      return
    }
    // Mark as seen immediately so navigating away + back skips it
    sessionStorage.setItem('sit-intro-seen', 'true')

    // Safety timeout: if animation gets stuck, force complete after 8s
    const safetyTimer = setTimeout(() => {
      setVisible(false)
      onComplete()
    }, 8000)

    return () => clearTimeout(safetyTimer)
  }, [onComplete])

  // Typing effect
  useEffect(() => {
    if (!visible) return
    if (currentLine >= LINES.length) {
      // All lines typed, start progress bar
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval)
            // Flash and reveal
            setTimeout(() => {
              setShowFlash(true)
              setTimeout(() => {
                setVisible(false)
                onComplete()
              }, 400)
            }, 300)
            return 100
          }
          return prev + 4
        })
      }, 30)
      return () => clearInterval(progressInterval)
    }

    const line = LINES[currentLine]
    const startTimer = setTimeout(() => {
      if (currentChar === 0) {
        setTypedLines(prev => [...prev, ''])
      }

      const typeTimer = setInterval(() => {
        setCurrentChar(prev => {
          const next = prev + 1
          if (next > line.text.length) {
            clearInterval(typeTimer)
            setCurrentLine(l => l + 1)
            setCurrentChar(0)
            return prev
          }
          setTypedLines(lines => {
            const updated = [...lines]
            updated[updated.length - 1] = line.text.slice(0, next)
            return updated
          })
          return next
        })
      }, line.speed)

      return () => clearInterval(typeTimer)
    }, currentLine === 0 ? 200 : LINES[currentLine].delay - (LINES[currentLine - 1]?.delay || 0))

    return () => clearTimeout(startTimer)
  }, [visible, currentLine, currentChar, onComplete])

  if (!visible) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center"
        style={{ backgroundColor: '#09090B' }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Scanline overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.01) 2px, rgba(255,255,255,0.01) 4px)',
          }}
        />

        {/* Terminal content */}
        <div className="w-full max-w-lg px-8">
          {/* Terminal header */}
          <div className="flex items-center gap-2 mb-4 font-mono text-xs" style={{ color: '#3F3F46' }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#EF4444' }} />
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#F59E0B' }} />
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#22C55E' }} />
            <span className="ml-2">sit-terminal</span>
          </div>

          {/* Typed lines */}
          <div className="font-mono text-sm space-y-1.5">
            {typedLines.map((line, i) => (
              <div key={i} style={{ color: line.includes('{SIT}') ? '#F59E0B' : line.startsWith('$') ? '#22C55E' : '#71717A' }}>
                {line}
                {i === typedLines.length - 1 && currentLine < LINES.length && (
                  <span className="inline-block w-2 h-4 ml-0.5 animate-pulse" style={{ backgroundColor: '#F59E0B' }} />
                )}
              </div>
            ))}
          </div>

          {/* Progress bar */}
          {currentLine >= LINES.length && (
            <div className="mt-6">
              <div className="h-1 w-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                <motion.div
                  className="h-full"
                  style={{ backgroundColor: '#F59E0B' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between font-mono text-[10px] mt-1" style={{ color: '#3F3F46' }}>
                <span>building...</span>
                <span>{progress}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Golden flash on complete */}
        {showFlash && (
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0] }}
            transition={{ duration: 0.4 }}
            style={{ background: 'radial-gradient(circle, rgba(242,158,24,0.3) 0%, transparent 70%)' }}
          />
        )}
      </motion.div>
    </AnimatePresence>
  )
}
