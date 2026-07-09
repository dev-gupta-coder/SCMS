import { create } from 'zustand'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'scms-theme'

function getInitialTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  localStorage.setItem(STORAGE_KEY, theme)
}

interface ThemeState {
  theme: Theme
  toggleTheme: () => void
}

const initialTheme = getInitialTheme()
applyTheme(initialTheme)

/** Manual light/dark toggle (Admin shell) — persisted, defaults to OS preference. */
export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: initialTheme,
  toggleTheme: () => {
    const next: Theme = get().theme === 'dark' ? 'light' : 'dark'
    applyTheme(next)
    set({ theme: next })
  },
}))
