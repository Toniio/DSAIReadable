import type { ReactNode } from "react"
import Link from "next/link"
import {
  CodeIcon,
  MoonIcon,
  PaletteIcon,
  PersonArmsSpreadIcon,
  ShapesIcon,
  SwatchesIcon,
} from "@phosphor-icons/react/ssr"
import type { Icon } from "@phosphor-icons/react"

import { headingVariants } from "@/components/ui/heading"
import { cn } from "@/lib/utils"
import { LINK } from "@/site/ui/link"

const CODE = "bg-muted px-1 py-0.5 font-mono text-xs"

interface Rule {
  icon: Icon
  title: string
  body: ReactNode
  link: { href: string; label: string }
}

/**
 * The rules every screen built with the design system follows (AGENTS.md
 * § 1), said for the project that consumes it.
 */
export function Rules({
  targetSize,
  divergences,
}: {
  /** The `size.target.min` token, resolved to CSS pixels. */
  targetSize?: number
  divergences: { total: number; components: number }
}) {
  const rules: Rule[] = [
    {
      icon: SwatchesIcon,
      title: "Tokens only",
      body: (
        <>
          Every color, space, radius, shadow and duration comes from a semantic
          token or a shadcn/ui alias (
          <code className={cn(CODE, "whitespace-nowrap")}>--primary</code>),
          through its Tailwind class or its CSS variable. Never a literal value,
          never a primitive token.
        </>
      ),
      link: { href: "/foundations/tokens/", label: "All tokens" },
    },
    {
      icon: PaletteIcon,
      title: "The design system's classes only",
      body: (
        <>
          The stylesheet removes Tailwind&apos;s default palette, spacing and
          type scale: a class it does not bridge generates no CSS. Write the
          semantic names, <code className={CODE}>bg-primary</code>,{" "}
          <code className={CODE}>text-muted-foreground</code>.
        </>
      ),
      link: { href: "/foundations/color/", label: "Color" },
    },
    {
      icon: ShapesIcon,
      title: "Phosphor icons only",
      body: (
        <>
          Icons come from <code className={CODE}>@phosphor-icons/react</code>:
          no other icon kit, no inline SVG.
        </>
      ),
      link: { href: "/foundations/icons/", label: "Icons" },
    },
    {
      icon: MoonIcon,
      title: "Class-based dark mode",
      body: (
        <>
          Dark mode is the <code className={CODE}>.dark</code> class on{" "}
          <code className={CODE}>&lt;html&gt;</code>, set by the application,
          never by a media query. Every color token resolves in both modes: the
          dark context redefines only the ones that change.
        </>
      ),
      link: { href: "/foundations/color/", label: "Color" },
    },
    {
      icon: PersonArmsSpreadIcon,
      title: "WCAG 2.2 AA",
      body: (
        <>
          Contrast in light and dark, a visible focus indicator on every control
          {targetSize ? (
            <>
              , and pointer targets of at least {targetSize} by {targetSize} CSS
              pixels (<code className={CODE}>size.target.min</code>)
            </>
          ) : null}
          .
        </>
      ),
      link: { href: "/foundations/focus/", label: "Focus" },
    },
    {
      icon: CodeIcon,
      title: "The shadcn/ui API is the contract",
      body: (
        <>
          The components keep the props, exports and values a model already
          knows from shadcn/ui. Each difference is declared: {divergences.total}{" "}
          in {divergences.components} components.
        </>
      ),
      link: { href: "/audits/#shadcn", label: "shadcn/ui audit" },
    },
  ]

  return (
    <ul className="grid gap-px border bg-border md:grid-cols-2 lg:grid-cols-3">
      {rules.map((rule) => (
        <li key={rule.title} className="flex flex-col gap-3 bg-background p-5">
          <rule.icon aria-hidden="true" className="size-5 text-primary" />
          <p className={headingVariants({ level: 4 })}>{rule.title}</p>
          <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
            {rule.body}
          </p>
          <Link href={rule.link.href} className={cn(LINK, "w-fit text-sm")}>
            {rule.link.label}
          </Link>
        </li>
      ))}
    </ul>
  )
}
