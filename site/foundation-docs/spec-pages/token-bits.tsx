import type { ReactNode } from "react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { lightScope, remToPx } from "@/site/foundation-docs/spec-pages/spec"
import type { Token } from "@/site/lib/tokens"

/**
 * The class that turns a subtree dark (tokens.css, the `dark:` variant). A
 * theme hook, not a utility: the Tailwind lint, which knows utilities only,
 * reads it from here rather than from a class attribute.
 */
const DARK_THEME = "dark"

/** A token name, a class, a value: inline code. */
export function Code({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <code className={cn("bg-muted px-1 py-0.5 font-mono text-xs", className)}>
      {children}
    </code>
  )
}

/** A token's lifecycle, shown only when it is not `active`. */
export function StatusBadge({ status }: { status: Token["status"] }) {
  if (status === "active") return null
  return (
    <Badge variant={status === "reserved" ? "warning" : "destructive"}>
      {status}
    </Badge>
  )
}

/** `1.5rem` and, after it, `24px`: the value as written, then in pixels. */
export function Dimension({ value }: { value: string }) {
  const px = remToPx(value)
  return (
    <span className="font-mono text-xs">
      {value}
      {px !== undefined && !value.endsWith("px") ? (
        <span className="text-muted-foreground"> · {px}px</span>
      ) : null}
    </span>
  )
}

/** The classes a token answers to, as code chips; a dash when it has none. */
export function ClassList({
  classes,
  empty = "—",
}: {
  classes: string[]
  empty?: string
}) {
  if (!classes.length)
    return <span className="text-xs text-muted-foreground">{empty}</span>
  return (
    <span className="flex flex-wrap gap-1">
      {classes.map((value) => (
        <Code key={value}>{value}</Code>
      ))}
    </span>
  )
}

/** A token's short name within its group: `space.scale.4` → `4`. */
export function shortName(entry: Token, prefix: string): string {
  return entry.token.slice(prefix.length + 1)
}

/**
 * A light and a dark panel, side by side: the same content in both modes.
 * On a dark page, the light panel resets the semantic variables, and
 * `data-theme-scope="light"` keeps the `dark:` variant out of it
 * (site/app/site.css).
 */
export function ModePanels({
  children,
}: {
  children: (mode: "light" | "dark") => ReactNode
}) {
  return (
    <div className="grid gap-px border bg-border md:grid-cols-2">
      <div
        data-theme-scope="light"
        style={lightScope()}
        className="flex flex-col gap-4 bg-background p-6 text-foreground"
      >
        <p className="text-xs font-medium text-muted-foreground">Light</p>
        {children("light")}
      </div>
      <div className={DARK_THEME}>
        <div className="flex h-full flex-col gap-4 bg-background p-6 text-foreground">
          <p className="text-xs font-medium text-muted-foreground">Dark</p>
          {children("dark")}
        </div>
      </div>
    </div>
  )
}
