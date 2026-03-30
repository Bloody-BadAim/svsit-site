'use client'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="max-w-xl mx-auto text-center py-16">
      <p className="text-4xl mb-4">⚠</p>
      <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
        Er ging iets mis
      </h2>
      <p className="mb-6 text-sm" style={{ color: 'var(--color-text-muted)' }}>
        {error.message || 'Onbekende fout'}
      </p>
      <button
        onClick={reset}
        className="py-2 px-6 rounded-lg font-semibold"
        style={{ backgroundColor: 'var(--color-accent-gold)', color: 'var(--color-bg)' }}
      >
        Probeer opnieuw
      </button>
    </div>
  )
}
