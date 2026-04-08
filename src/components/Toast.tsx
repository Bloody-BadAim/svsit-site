'use client'

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: number
  message: string
  type: ToastType
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

// ---------------------------------------------------------------------------
// Color map (uses site CSS vars)
// ---------------------------------------------------------------------------

const TYPE_STYLES: Record<ToastType, { border: string; color: string; icon: string }> = {
  success: {
    border: 'var(--color-accent-green)',
    color: 'var(--color-accent-green)',
    icon: '\u2713',
  },
  error: {
    border: 'var(--color-accent-red)',
    color: 'var(--color-accent-red)',
    icon: '\u2717',
  },
  info: {
    border: 'var(--color-accent-blue)',
    color: 'var(--color-accent-blue)',
    icon: 'i',
  },
}

// ---------------------------------------------------------------------------
// Provider + UI
// ---------------------------------------------------------------------------

let nextId = 0

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++nextId
    setToasts((prev) => [...prev, { id, message, type }])
  }, [])

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}

      {/* Toast container: bottom-right, stacking */}
      <div
        className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none"
        style={{ maxWidth: '360px' }}
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDone={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// Single toast item
// ---------------------------------------------------------------------------

function ToastItem({ toast, onDone }: { toast: Toast; onDone: () => void }) {
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null)

  useEffect(() => {
    // Trigger enter animation on next frame
    requestAnimationFrame(() => setVisible(true))

    // Auto dismiss after 3s
    timerRef.current = setTimeout(() => {
      setVisible(false)
      // Wait for exit animation then remove
      setTimeout(onDone, 200)
    }, 3000)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [onDone])

  const style = TYPE_STYLES[toast.type]

  return (
    <div
      className="pointer-events-auto font-mono text-xs px-4 py-3 flex items-center gap-2.5 transition-all duration-200"
      style={{
        backgroundColor: '#1a1a1e',
        border: `1px solid ${style.border}`,
        boxShadow: `0 4px 12px rgba(0,0,0,0.4)`,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(20px)',
      }}
    >
      <span
        className="shrink-0 w-5 h-5 flex items-center justify-center text-[10px] font-bold rounded-sm"
        style={{
          backgroundColor: `color-mix(in srgb, ${style.color} 15%, transparent)`,
          color: style.color,
        }}
      >
        {style.icon}
      </span>
      <span className="text-white/90">{toast.message}</span>
    </div>
  )
}
