"use client"

import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"
import { CopyButton } from "@/site/ui/copy-button"
import { FOCUS_BORDERLESS } from "@/site/ui/link"

/**
 * A block of code with its language and a copy button. Single color: the
 * design system has no syntax-highlighting tokens, and the chart colors are
 * for data only.
 */
export function CodeBlock({
  code,
  language,
  title,
  className,
}: {
  code: string
  language?: string
  /** A caption above the code: a file name, "Install". */
  title?: string
  className?: string
}) {
  const text = code.replace(/\n$/, "")
  const pre = useRef<HTMLPreElement>(null)

  // A block that scrolls sideways takes focus, so the keyboard can scroll it
  // (axe scrollable-region-focusable); one that fits adds no tab stop.
  useEffect(() => {
    const element = pre.current
    if (!element) return
    const update = () => {
      if (element.scrollWidth > element.clientWidth + 1) element.tabIndex = 0
      else element.removeAttribute("tabindex")
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(element)
    if (element.firstElementChild) observer.observe(element.firstElementChild)
    return () => observer.disconnect()
  }, [])

  return (
    <div className={cn("flex min-w-0 flex-col border bg-muted", className)}>
      <div className="flex min-h-9 items-center justify-between gap-2 border-b pr-1 pl-3">
        <span className="truncate text-xs text-muted-foreground">
          {title ?? language ?? "code"}
        </span>
        <CopyButton value={text} label={`Copy ${title ?? "the code"}`} />
      </div>
      <pre
        ref={pre}
        className={cn(
          "overflow-x-auto p-4 font-mono text-xs leading-relaxed text-foreground",
          FOCUS_BORDERLESS
        )}
      >
        <code className="inline-block min-w-full">{text}</code>
      </pre>
    </div>
  )
}

/**
 * A one-line command with a copy button: an install, an npx call. On a
 * narrow screen it wraps, so the part that differs from one command to the
 * next (the item's name, at the end) is read before it is copied.
 */
export function CommandLine({
  command,
  label,
}: {
  command: string
  label: string
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 border bg-muted py-1 pr-1 pl-3">
      <code className="min-w-0 flex-1 font-mono text-xs break-all">
        {command}
      </code>
      <CopyButton value={command} label={label} />
    </div>
  )
}
