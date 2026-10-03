import { cn } from "@/lib/utils"
import { CopyButton } from "@/site/ui/copy-button"
import { FOCUS_OUTLINE_RESET, FOCUS_RING } from "@/lib/focus"

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
  return (
    <div className={cn("flex min-w-0 flex-col border bg-muted", className)}>
      <div className="flex min-h-9 items-center justify-between gap-2 border-b pr-1 pl-3">
        <span className="truncate text-xs text-muted-foreground">
          {title ?? language ?? "code"}
        </span>
        <CopyButton value={text} label={`Copy ${title ?? "the code"}`} />
      </div>
      <pre
        tabIndex={0}
        className={cn(
          "overflow-x-auto p-4 font-mono text-xs leading-relaxed text-foreground",
          FOCUS_OUTLINE_RESET,
          FOCUS_RING
        )}
      >
        <code>{text}</code>
      </pre>
    </div>
  )
}

/** A one-line command with a copy button: an install, an npx call. */
export function CommandLine({
  command,
  label,
}: {
  command: string
  label: string
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 border bg-muted py-1 pr-1 pl-3">
      <code className="min-w-0 flex-1 truncate font-mono text-xs">
        {command}
      </code>
      <CopyButton value={command} label={label} />
    </div>
  )
}
