import Link from "next/link"
import { GithubLogoIcon } from "@phosphor-icons/react/ssr"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"
import { cn } from "@/lib/utils"
import { SECTIONS } from "@/site/lib/nav"
import { GITHUB_URL, META, VERSION } from "@/site/lib/site"
import { HeaderTabs } from "@/site/ui/header-tabs"
import { FOCUS_BORDERLESS } from "@/site/ui/link"
import { SectionsMenu } from "@/site/ui/sections-menu"
import { SkipLink } from "@/site/ui/skip-link"
import { ThemeSwitch } from "@/site/ui/theme-switch"

/**
 * The bar on top of every page: the name, the sections, the theme. The six
 * tabs fit from the lg breakpoint; below it, a menu button lists them, and
 * the bar keeps what fits a phone's width.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-sticky border-b bg-background">
      <SkipLink />
      <div className="flex h-14 items-center gap-3 px-page sm:gap-6">
        <div className="flex min-w-0 items-center gap-2 lg:shrink-0">
          <SectionsMenu sections={SECTIONS} className="lg:hidden" />
          {/* On the narrowest phones the name gives way, not the page width. */}
          <Link
            href="/"
            className={cn(
              "flex min-w-0 items-center gap-2 font-heading font-semibold tracking-tight",
              FOCUS_BORDERLESS
            )}
          >
            <Logo size="sm" />
            <span className="truncate">{META.name}</span>
          </Link>
        </div>
        <HeaderTabs sections={SECTIONS} className="hidden lg:flex" />
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Badge variant="outline" className="hidden xl:inline-flex">
            v{VERSION}
          </Badge>
          <Button
            variant="ghost"
            size="icon-sm"
            className="hidden sm:inline-flex"
            asChild
          >
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
