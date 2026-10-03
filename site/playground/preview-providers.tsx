"use client"

import type { ReactNode } from "react"

import { TooltipProvider } from "@/components/ui/tooltip"

/**
 * The providers every preview shares. The theme is not one of them: each
 * frame sets its own (site/playground/frame.tsx), so the previews of a page
 * never change each other's theme.
 */
export function PreviewProviders({ children }: { children: ReactNode }) {
  return <TooltipProvider>{children}</TooltipProvider>
}
