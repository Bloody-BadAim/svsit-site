import { create } from 'zustand'
import type { Role } from '@/types/database'

interface AuthState {
  userId: string | null
  email: string | null
  role: Role | null
  membershipActive: boolean
  isAdmin: boolean
  setSession: (data: {
    userId: string
    email: string
    role: Role
    membershipActive: boolean
    isAdmin: boolean
  }) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  email: null,
  role: null,
  membershipActive: false,
  isAdmin: false,
  setSession: (data) => set(data),
  clearSession: () =>
    set({
      userId: null,
      email: null,
      role: null,
      membershipActive: false,
      isAdmin: false,
    }),
}))
