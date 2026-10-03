import type { ReactNode } from "react"

import { PageToc, type TocItem } from "@/site/ui/page-toc"

/**
 * The frame of the Overview: no section navigation, its own "On this page"
 * in the left column the other sections give to their pages, and a wider
 * content column.
 */
export function OverviewFrame({
  toc,
  children,
}: {
  toc: TocItem[]
  children: ReactNode
}) {
  return (
    <div className="flex">
      <aside
        aria-label="Overview sections"
        className="hidden w-60 shrink-0 border-r lg:block"
      >
        <div className="sticky top-14 max-h-svh overflow-y-auto px-4 pt-10 pb-24">
          <PageToc items={toc} />
        </div>
      </aside>
      <main
        id="main"
        tabIndex={-1}
        className="min-w-0 flex-1 px-page pt-6 pb-24 outline-hidden lg:pt-10"
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-16">{children}</div>
      </main>
    </div>
  )
}
