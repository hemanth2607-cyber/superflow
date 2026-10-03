import { create } from 'zustand'

export type ThemeMode = 'light' | 'dark'

interface ThemeState {
  theme: ThemeMode
  toggleTheme: () => void
  setTheme: (theme: ThemeMode) => void
}

const STORAGE_KEY = 'superflow_theme'

function getInitialTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark') {
      return saved
    }
  } catch {
    // LocalStorage might fail in restricted environments
  }

  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'dark' // Default warm lacquer black
}

function applyThemeClass(theme: ThemeMode) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

export const useThemeStore = create<ThemeState>((set) => {
  const initialTheme = getInitialTheme()
  applyThemeClass(initialTheme)

  return {
    theme: initialTheme,
    toggleTheme: () => {
      set((state) => {
        const next = state.theme === 'light' ? 'dark' : 'light'
        try {
          localStorage.setItem(STORAGE_KEY, next)
        } catch {}
        applyThemeClass(next)
        return { theme: next }
      })
    },
    setTheme: (theme: ThemeMode) => {
      try {
        localStorage.setItem(STORAGE_KEY, theme)
      } catch {}
      applyThemeClass(theme)
      set({ theme })
    },
  }
})
