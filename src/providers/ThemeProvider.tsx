import { createContext, useCallback, useContext, useEffect, useState } from 'react'

type Theme = 'system' | 'light' | 'dark'
export type ColorKey = 'green' | 'blue' | 'violet' | 'teal' | 'orange' | 'rose' | 'amber' | 'slate'

export const COLORS: Record<ColorKey, { label: string; hsl: string; hex: string }> = {
  green:  { label: 'Vert',     hsl: '142 72% 29%', hex: '#277a3f' },
  blue:   { label: 'Bleu',     hsl: '217 91% 40%', hex: '#0d5cc7' },
  violet: { label: 'Violet',   hsl: '265 70% 45%', hex: '#7c3aed' },
  teal:   { label: 'Sarcelle', hsl: '174 72% 30%', hex: '#0d9488' },
  orange: { label: 'Orange',   hsl: '25 90% 45%',  hex: '#c2610d' },
  rose:   { label: 'Rose',     hsl: '330 70% 45%', hex: '#be185d' },
  amber:  { label: 'Ambre',    hsl: '38 92% 40%',  hex: '#b45309' },
  slate:  { label: 'Ardoise',  hsl: '220 15% 35%', hex: '#475569' },
}

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  color: ColorKey
  setColor: (color: ColorKey) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'system',
  setTheme: () => {},
  color: 'green',
  setColor: () => {},
})

const THEME_KEY = 'landscape-theme'
const COLOR_KEY = 'landscape-color'

function applyColor(key: ColorKey) {
  const { hsl } = COLORS[key]
  document.documentElement.style.setProperty('--primary', hsl)
  document.documentElement.style.setProperty('--ring', hsl)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem(THEME_KEY) as Theme | null) ?? 'system',
  )
  const [color, setColorState] = useState<ColorKey>(
    () => (localStorage.getItem(COLOR_KEY) as ColorKey | null) ?? 'green',
  )

  useEffect(() => {
    const root = document.documentElement

    function applyTheme(t: Theme) {
      if (t === 'dark') {
        root.classList.add('dark')
      } else if (t === 'light') {
        root.classList.remove('dark')
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        root.classList.toggle('dark', prefersDark)
      }
    }

    applyTheme(theme)

    if (theme !== 'system') return

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyTheme('system')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  useEffect(() => {
    applyColor(color)
  }, [color])

  const setTheme = useCallback((t: Theme) => {
    localStorage.setItem(THEME_KEY, t)
    setThemeState(t)
  }, [])

  const setColor = useCallback((c: ColorKey) => {
    localStorage.setItem(COLOR_KEY, c)
    setColorState(c)
    applyColor(c)
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, color, setColor }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
