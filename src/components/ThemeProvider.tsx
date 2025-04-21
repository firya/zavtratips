import { create } from 'zustand'
import { useEffect } from 'react'

interface ThemeStore {
  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void
}

const getInitialTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme
    }
    // Check system preference if no saved theme
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
  }
  return 'light'
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: getInitialTheme(),
  setTheme: (theme) => {
    localStorage.setItem('theme', theme)
    set({ theme })
  },
}))

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useThemeStore()

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
  }, [theme])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = () => {
      setTheme(mediaQuery.matches ? 'dark' : 'light')
    }

    // Initial check
    handleChange()

    // Listen for changes
    mediaQuery.addEventListener('change', handleChange)

    // Cleanup listener on unmount
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [setTheme]) // Dependency on setTheme ensures the listener uses the correct setter

  return <>{children}</>
} 