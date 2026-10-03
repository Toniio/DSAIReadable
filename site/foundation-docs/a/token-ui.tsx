import { Fragment } from "react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { CopyButton } from "@/site/ui/copy-button"

/**
 * A color laid over the page surface of its mode, so a translucent value
 * shows as it renders. Both values are data read from the token build.
 */
export function Fill({
  value,
  surface,
  className,
}: {
  value: string
  surface: string
  className?: string
}) {
  return (
    <div className={cn("relative", className)} style={{ background: surface }}>
      <div className="absolute inset-0" style={{ background: value }} />
    </div>
  )
}

/**
 * A color laid over both page surfaces side by side: a primitive has one
 * value, and a translucent step only shows on the dark surface it is for.
 */
export function DualFill({
  value,
  surfaces,
  className,
}: {
  value: string
  surfaces: { light: string; dark: string }
  className?: string
}) {
  return (
    <div className={cn("relative flex", className)}>
      <div className="flex-1" style={{ background: surfaces.light }} />
      <div className="flex-1" style={{ background: surfaces.dark }} />
      <div className="absolute inset-0" style={{ background: value }} />
    </div>
  )
}

/** Plain text whose `code spans` render as code, as the token docs write them. */
export function Ticks({ children }: { children: string }) {
  const parts = children.split("`")
  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <code key={index} className="font-mono">
            {part}
          </code>
        ) : (
          <span key={index}>{part.replace(/\*\*/g, "")}</span>
        )
      )}
    </>
  )
}

/** A dotted token name that wraps after a dot rather than inside a segment. */
export function DottedName({ name }: { name: string }) {
  return name.split(".").map((part, index) => (
    <Fragment key={index}>
      {index ? (
        <>
          .<wbr />
        </>
      ) : null}
      {part}
    </Fragment>
  ))
}

/**
 * A name to copy: a CSS variable, a class. It is cut short with an ellipsis
 * where it has no room; with `wrap`, it wraps after a hyphen instead, for a
 * table column whose names must be read whole.
 */
export function CopyCode({
  value,
  wrap = false,
  className,
}: {
  value: string
  wrap?: boolean
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex min-w-0 gap-0.5",
        wrap ? "items-start" : "items-center",
        className
      )}
    >
      <code
        className={cn(
          "min-w-0 bg-muted px-1 py-0.5 font-mono text-xs",
          wrap ? "break-words" : "truncate"
        )}
      >
        {value}
      </code>
      <CopyButton value={value} label={`Copy ${value}`} />
    </span>
  )
}

/** A code name shown without a copy button: a token name, a private step. */
export function Code({
  children,
  className,
}: {
  children: string
  className?: string
}) {
  return (
    <code
      className={cn(
        "bg-muted px-1 py-0.5 font-mono text-xs break-all",
        className
      )}
    >
      {children}
    </code>
  )
}

/** The lifecycle of a token, when it is not plainly active. */
export function StatusBadge({
  status,
  replacement,
}: {
  status: "active" | "reserved" | "deprecated"
  replacement?: string
}) {
  if (status === "reserved") return <Badge variant="outline">reserved</Badge>
  if (status === "deprecated")
    return (
      <Badge variant="destructive">
        {replacement ? `deprecated: use ${replacement}` : "deprecated"}
      </Badge>
    )
  return null
}
