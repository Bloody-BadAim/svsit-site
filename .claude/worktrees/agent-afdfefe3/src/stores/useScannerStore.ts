import { create } from 'zustand'

interface ScanResultaat {
  memberId: string
  email: string
  punten: number
  timestamp: string
}

interface ScannerState {
  actiefEvent: string | null
  actiefEventNaam: string | null
  laatsteScan: ScanResultaat | null
  scannerActief: boolean
  setActiefEvent: (id: string | null, naam: string | null) => void
  setLaatsteScan: (scan: ScanResultaat | null) => void
  setScannerActief: (actief: boolean) => void
}

export const useScannerStore = create<ScannerState>((set) => ({
  actiefEvent: null,
  actiefEventNaam: null,
  laatsteScan: null,
  scannerActief: false,
  setActiefEvent: (id, naam) => set({ actiefEvent: id, actiefEventNaam: naam }),
  setLaatsteScan: (scan) => set({ laatsteScan: scan }),
  setScannerActief: (actief) => set({ scannerActief: actief }),
}))
