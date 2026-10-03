"use client"

import type { ReactNode } from "react"
import { ThemeProvider } from "next-themes"

import { TooltipProvider } from "@/components/ui/tooltip"

/**
 * The providers of a preview. Its theme is the one the page sends, not the
 * reader's system: a key of its own keeps it apart from the site's, and
 * `useTheme` still answers, so a Toaster in a dark preview is dark.
 */
export function PreviewProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      storageKey="dsaireadable-preview-theme"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <TooltipProvider>{children}</TooltipProvider>
    </ThemeProvider>
  )
}
