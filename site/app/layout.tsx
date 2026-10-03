import type { Metadata } from "next"
import type { ReactNode } from "react"

import { fontVariables } from "@/lib/fonts"
import { cn } from "@/lib/utils"
import { META } from "@/site/lib/site"

import "./site.css"

export const metadata: Metadata = {
  title: { default: META.name, template: `%s · ${META.name}` },
  description:
    "The documentation and playground of DSAIReadable, a design system built to be read by people and by AI agents.",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={cn(fontVariables)} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
