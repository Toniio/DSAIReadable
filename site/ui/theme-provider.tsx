"use client"

import type { ReactNode } from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

/**
 * The site's theme: the `.dark` class on <html> (AGENTS.md § 1, class-based
 * dark mode). "Auto" follows the operating system through next-themes,
 * which reads the system setting in script and writes the class.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
