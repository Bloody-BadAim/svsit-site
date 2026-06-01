// Gedeelde reduced-motion check: honoreert ZOWEL de OS-instelling als de
// in-site // static toggle (.reduce-motion class op <html>, gezet door
// MotionToggle). Componenten die alleen matchMedia checkten misten de toggle.

export function isReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  const media =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const cls =
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('reduce-motion')
  return media || cls
}

/**
 * Abonneer op wijzigingen: de in-site toggle ('sit:motionchange') en de
 * OS-instelling. Geeft een cleanup-functie terug.
 */
export function onMotionChange(cb: () => void): () => void {
  if (typeof window === 'undefined') return () => {}
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
  window.addEventListener('sit:motionchange', cb)
  mq.addEventListener?.('change', cb)
  return () => {
    window.removeEventListener('sit:motionchange', cb)
    mq.removeEventListener?.('change', cb)
  }
}
