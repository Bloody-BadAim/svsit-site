'use client'

import QRScanner from '@/components/admin/QRScanner'
import { useScannerStore } from '@/stores/useScannerStore'

export default function ScannerPage() {
  const { actiefEventNaam } = useScannerStore()

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
          QR Scanner
        </h1>
        {actiefEventNaam && (
          <p className="mt-1 text-sm" style={{ color: 'var(--color-accent-gold)' }}>
            Actief event: {actiefEventNaam}
          </p>
        )}
      </div>

      <QRScanner />
    </div>
  )
}
