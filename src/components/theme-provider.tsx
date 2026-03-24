import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"
type FontSize = "normal" | "large"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  defaultFontSize?: FontSize
  storageKey?: string
  fontSizeKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  fontSize: FontSize
  setFontSize: (size: FontSize) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  fontSize: "normal",
  setFontSize: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "light",
  defaultFontSize = "normal",
  storageKey = "vite-ui-theme",
  fontSizeKey = "vite-ui-font-size",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )
  const [fontSize, setFontSizeState] = useState<FontSize>(
    () => (localStorage.getItem(fontSizeKey) as FontSize) || defaultFontSize
  )

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  useEffect(() => {
    const root = window.document.documentElement
    if (fontSize === "large") {
      root.classList.add("text-lg-base")
    } else {
      root.classList.remove("text-lg-base")
    }
  }, [fontSize])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
    fontSize,
    setFontSize: (size: FontSize) => {
      localStorage.setItem(fontSizeKey, size)
      setFontSizeState(size)
    }
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
