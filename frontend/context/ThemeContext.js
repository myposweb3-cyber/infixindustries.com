import React, { createContext, useEffect, useMemo, useState } from 'react'

export const ThemeContext = createContext({
  theme: 'light',
  setTheme: () => {}
})

export function ThemeProvider({ children }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    if (typeof window === 'undefined') return

    const root = document.documentElement
    root.classList.remove('theme-light', 'theme-dark')
    root.classList.add('theme-light')
    root.style.colorScheme = 'light'
    window.localStorage.setItem('theme', 'light')
  }, [])

  useEffect(() => {
    if (typeof document === 'undefined' || !mounted) return

    const root = document.documentElement
    root.classList.remove('theme-light', 'theme-dark')
    root.classList.add('theme-light')
    root.style.colorScheme = 'light'
    window.localStorage.setItem('theme', 'light')
  }, [mounted])

  const value = useMemo(() => ({ theme: 'light', setTheme: () => {} }), [])

  if (!mounted) {
    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
