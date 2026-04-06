import Link from 'next/link'

export default function NotFound() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      <span
        className="text-6xl font-bold mb-4"
        style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent-gold)' }}
      >
        404
      </span>
      <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
        Pagina niet gevonden
      </h1>
      <p className="mb-8" style={{ color: 'var(--color-text-muted)' }}>
        Deze route bestaat niet.
      </p>
      <Link
        href="/"
        className="py-3 px-6 rounded-lg font-semibold transition-all"
        style={{ backgroundColor: 'var(--color-accent-gold)', color: 'var(--color-bg)' }}
      >
        Terug naar home
      </Link>
    </main>
  )
}
