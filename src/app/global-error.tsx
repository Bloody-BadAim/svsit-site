'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="nl">
      <body style={{ backgroundColor: '#09090B', color: '#A1A1AA', fontFamily: 'monospace', padding: 40 }}>
        <h2 style={{ color: '#F29E18', fontSize: 18, marginBottom: 12 }}>{'>'} er ging iets mis</h2>
        <p style={{ fontSize: 13, marginBottom: 20 }}>We hebben de fout automatisch gemeld.</p>
        <button
          onClick={reset}
          style={{
            padding: '8px 20px',
            backgroundColor: '#F29E18',
            color: '#09090B',
            border: 'none',
            fontFamily: 'monospace',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          {'>'} opnieuw proberen
        </button>
      </body>
    </html>
  )
}
