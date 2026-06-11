import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('checkmate-dark') === 'true')
  const [guiScale, setGuiScale] = useState(() => Number(localStorage.getItem('checkmate-scale') || 1))

  useEffect(() => {
    localStorage.setItem('checkmate-dark', String(darkMode))
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  useEffect(() => {
    const safeScale = Math.min(3, Math.max(1, Number(guiScale) || 1))
    localStorage.setItem('checkmate-scale', String(safeScale))
    document.documentElement.dataset.scale = String(safeScale)
  }, [guiScale])

  const value = useMemo(() => ({ darkMode, setDarkMode, guiScale, setGuiScale }), [darkMode, guiScale])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme harus dipakai di dalam ThemeProvider')
  return context
}
