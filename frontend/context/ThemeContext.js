import React, { createContext, useEffect, useMemo, useState } from 'react'

export const ThemeContext = createContext({
  theme: 'dark',
  setTheme: () => {}
})

export function ThemeProvider({ children }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    if (typeof window === 'undefined') return

    const root = document.documentElement
    root.classList.remove('theme-light', 'theme-dark')
    root.classList.add('theme-dark')
    root.style.colorScheme = 'dark'
    window.localStorage.setItem('theme', 'dark')
  }, [])

  useEffect(() => {
    if (typeof document === 'undefined' || !mounted) return

    const root = document.documentElement
    root.classList.remove('theme-light', 'theme-dark')
    root.classList.add('theme-dark')
    root.style.colorScheme = 'dark'
    window.localStorage.setItem('theme', 'dark')
  }, [mounted])

  const value = useMemo(() => ({ theme: 'dark', setTheme: () => {} }), [])

  if (!mounted) {
    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
