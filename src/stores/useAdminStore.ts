import { create } from 'zustand'
import type { Role } from '@/types/database'

interface AdminFilters {
  zoekterm: string
  status: 'all' | 'active' | 'expired'
  role: Role | 'all'
  commissie: string | 'all'
  sortBy: 'email' | 'created_at' | 'total_xp' | 'role'
  sortOrder: 'asc' | 'desc'
  pagina: number
  perPagina: number
}

interface AdminState {
  filters: AdminFilters
  geselecteerdLidId: string | null
  setFilter: <K extends keyof AdminFilters>(key: K, value: AdminFilters[K]) => void
  resetFilters: () => void
  selecteerLid: (id: string | null) => void
}

const defaultFilters: AdminFilters = {
  zoekterm: '',
  status: 'all',
  role: 'all',
  commissie: 'all',
  sortBy: 'created_at',
  sortOrder: 'desc',
  pagina: 1,
  perPagina: 25,
}

export const useAdminStore = create<AdminState>((set) => ({
  filters: defaultFilters,
  geselecteerdLidId: null,
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value, pagina: key === 'pagina' ? (value as number) : 1 },
    })),
  resetFilters: () => set({ filters: defaultFilters }),
  selecteerLid: (id) => set({ geselecteerdLidId: id }),
}))
