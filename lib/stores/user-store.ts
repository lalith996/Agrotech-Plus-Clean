import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UserRole } from '../types'

interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar: string
}

interface UserStore {
  user: User | null
  setUser: (user: User) => void
  logout: () => void
  isAuthenticated: boolean
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'user-storage',
    }
  )
)