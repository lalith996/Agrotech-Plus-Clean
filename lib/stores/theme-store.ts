import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark' | 'system'

interface ThemeStore {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => {
        const { theme } = get()
        set({ theme: theme === 'light' ? 'dark' : 'light' })
      },
    }),
    {
      name: 'theme-storage',
    }
  )
)