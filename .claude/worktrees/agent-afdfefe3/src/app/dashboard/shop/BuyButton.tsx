'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'

interface BuyButtonProps {
  accessoryId: string
  price: number
  canAfford: boolean
}

export default function BuyButton({ accessoryId, price, canAfford }: BuyButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bought, setBought] = useState(false)

  async function handleBuy() {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/shop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessoryId }),
      })

      const json = await res.json() as { success?: boolean; error?: string }

      if (!res.ok || !json.success) {
        setError(json.error ?? 'Aankoop mislukt')
        return
      }

      setBought(true)
      router.refresh()
    } catch {
      setError('Netwerkfout — probeer opnieuw')
    } finally {
      setLoading(false)
    }
  }

  if (bought) {
    return (
      <span
        className="font-mono text-xs px-3 py-1 inline-flex items-center gap-1"
        style={{ color: 'var(--color-accent-green)', border: '1px solid rgba(34,197,94,0.3)' }}
      >
        <Check className="w-3 h-3" /> IN BEZIT
      </span>
    )
  }

  if (!canAfford) {
    return (
      <button
        disabled
        className="font-mono text-xs px-3 py-1 cursor-not-allowed"
        style={{
          color: 'rgba(255,255,255,0.2)',
          border: '1px solid rgba(255,255,255,0.06)',
          backgroundColor: 'transparent',
        }}
        title={`Kost ${price} coins`}
      >
        NIET GENOEG COINS
      </button>
    )
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleBuy}
        disabled={loading}
        className="font-mono text-xs px-3 py-1 transition-opacity hover:opacity-80 disabled:opacity-50 disabled:cursor-wait"
        style={{
          backgroundColor: 'var(--color-accent-gold)',
          color: 'var(--color-bg)',
          border: 'none',
          cursor: loading ? 'wait' : 'pointer',
        }}
      >
        {loading ? '...' : 'KOPEN'}
      </button>
      {error && (
        <span className="font-mono text-[10px]" style={{ color: 'var(--color-accent-red)' }}>
          {error}
        </span>
      )}
    </div>
  )
}
