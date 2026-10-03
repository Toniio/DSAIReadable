import type { ReactNode } from "react"

import type { NavGroup } from "@/site/lib/nav"
import { MobileNav } from "@/site/ui/mobile-nav"
import { PageToc, type TocItem } from "@/site/ui/page-toc"
import { SectionNav } from "@/site/ui/section-nav"

/**
 * The frame of a documentation page: the section's pages on the left, "On
 * this page" next to them, the content on the right. Every page passes its
 * own table of contents: the sections it renders, in order.
 */
export function DocsPage({
  nav,
  navLabel,
  toc = [],
  children,
}: {
  nav: NavGroup[]
  navLabel: string
  toc?: TocItem[]
  children: ReactNode
}) {
  return (
    <div className="flex">
      <aside className="hidden w-60 shrink-0 border-r lg:block">
        <div className="sticky top-14 max-h-svh overflow-y-auto px-4 pt-6 pb-24">
          <SectionNav groups={nav} label={navLabel} />
        </div>
      </aside>
      <div className="hidden w-48 shrink-0 xl:block">
        <div className="sticky top-14 max-h-svh overflow-y-auto pt-10 pr-2 pb-24 pl-6">
          <PageToc items={toc} />
        </div>
      </div>
      <main
        id="main"
        tabIndex={-1}
        className="min-w-0 flex-1 px-page pt-6 pb-24 outline-hidden lg:pt-10"
      >
        <div className="mx-auto flex max-w-5xl flex-col gap-12">
          <div className="lg:hidden">
            <MobileNav groups={nav} label={navLabel} />
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}
