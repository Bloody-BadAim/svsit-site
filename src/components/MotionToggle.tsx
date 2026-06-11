'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'

export default function MotionToggle() {
  const t = useTranslations('motionToggle')
  const [reduced, setReduced] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const saved = localStorage.getItem('sit-reduced-motion')
    const initial = saved ? saved === 'true' : prefersReduced
    setReduced(initial)
    if (initial) document.documentElement.classList.add('reduce-motion')
  }, [])

  useEffect(() => {
    if (!mounted) return
    document.documentElement.classList.toggle('reduce-motion', reduced)
    localStorage.setItem('sit-reduced-motion', String(reduced))
    window.dispatchEvent(new Event('sit:motionchange'))
  }, [reduced, mounted])

  if (!mounted) return null

  return (
    <button
      onClick={() => setReduced(!reduced)}
      className="font-mono text-xs transition-colors cursor-pointer"
      style={{ color: reduced ? 'var(--color-accent-red)' : 'var(--color-text-muted)' }}
      aria-label={reduced ? t('enableLabel') : t('disableLabel')}
      title={reduced ? t('enabledTitle') : t('disabledTitle')}
    >
      {reduced ? '// static' : '// motion'}
    </button>
  )
}
