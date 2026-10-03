import Link from "next/link"
import { GithubLogoIcon } from "@phosphor-icons/react/ssr"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"
import { FOCUS_OUTLINE_RESET, FOCUS_RING } from "@/lib/focus"
import { cn } from "@/lib/utils"
import { SECTIONS } from "@/site/lib/nav"
import { GITHUB_URL, META, VERSION } from "@/site/lib/site"
import { HeaderTabs } from "@/site/ui/header-tabs"
import { ThemeSwitch } from "@/site/ui/theme-switch"

/** The bar on top of every page: the name, the sections, the theme. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-sticky border-b bg-background">
      <Link
        href="#main"
        className={cn(
          "sr-only bg-background px-3 py-2 text-sm focus:not-sr-only focus:absolute focus:top-2 focus:left-2",
          FOCUS_OUTLINE_RESET,
          FOCUS_RING
        )}
      >
        Skip to content
      </Link>
      <div className="flex h-14 items-center gap-6 px-page">
        <Link
          href="/"
          className={cn(
            "flex shrink-0 items-center gap-2 font-heading font-semibold tracking-tight",
            FOCUS_OUTLINE_RESET,
            FOCUS_RING
          )}
        >
          <Logo size="sm" />
          {META.name}
        </Link>
        <HeaderTabs sections={SECTIONS} />
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Badge variant="outline" className="hidden sm:inline-flex">
            v{VERSION}
          </Badge>
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href={GITHUB_URL} aria-label="GitHub repository">
              <GithubLogoIcon />
            </Link>
          </Button>
          <ThemeSwitch />
        </div>
      </div>
    </header>
  )
}
