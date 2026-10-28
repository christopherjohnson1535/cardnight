import { useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

const KEY = 'cardnight:theme'
const lightQuery = '(prefers-color-scheme: light)'
const barColor: Record<Theme, string> = { dark: '#0e1218', light: '#f1ebe0' }

function saved(): Theme | null {
  try {
    const value = localStorage.getItem(KEY)
    return value === 'light' || value === 'dark' ? value : null
  } catch {
    return null
  }
}

function fromPhone(): Theme {
  return matchMedia(lightQuery).matches ? 'light' : 'dark'
}

function apply(theme: Theme) {
  document.documentElement.dataset.theme = theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', barColor[theme])
}

// Follows the phone's setting until someone taps the toggle, then sticks with their pick.
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => saved() ?? fromPhone())

  useEffect(() => apply(theme), [theme])

  useEffect(() => {
    const query = matchMedia(lightQuery)
    const onChange = () => {
      if (!saved()) setTheme(fromPhone())
    }
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    try {
      localStorage.setItem(KEY, next)
    } catch {
      // private browsing can block storage; the switch still works for this visit
    }
    setTheme(next)
  }

  return { theme, toggle }
}
