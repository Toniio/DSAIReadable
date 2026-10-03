import type { Metadata } from "next"
import type { ReactNode } from "react"

import { PreviewProviders } from "@/site/playground/preview-providers"

export const metadata: Metadata = {
  title: "Preview",
  robots: { index: false },
}

/** The preview canvases: no site chrome, their own theme. */
export default function PreviewLayout({ children }: { children: ReactNode }) {
  return <PreviewProviders>{children}</PreviewProviders>
}
