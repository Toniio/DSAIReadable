import type { ReactNode } from "react"

import { TooltipProvider } from "@/components/ui/tooltip"
import { SiteHeader } from "@/site/ui/site-header"
import { ThemeProvider } from "@/site/ui/theme-provider"

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <SiteHeader />
        {children}
      </TooltipProvider>
    </ThemeProvider>
  )
}
