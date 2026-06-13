import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeState {
  mode: 'dark' | 'light'
  toggleTheme: () => void
  setTheme: (mode: 'dark' | 'light') => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'dark',
      toggleTheme: () => set((s) => ({ mode: s.mode === 'dark' ? 'light' : 'dark' })),
      setTheme: (mode) => set({ mode }),
    }),
    { name: 'ruangx-theme' },
  ),
)