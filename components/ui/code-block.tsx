"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { UI_STRINGS } from "@/lib/ui-strings"
import { Button } from "@/components/ui/button"
import { CheckIcon, CopyIcon } from "@phosphor-icons/react"

const codeBlockVariants = cva(
  "group/code-block relative flex w-full min-w-0 flex-col overflow-hidden rounded-none text-sm has-[>[data-slot=code-block-content]:focus-visible]:ring-(length:--space-focus-ring-width) has-[>[data-slot=code-block-content]:focus-visible]:ring-ring/50 data-[size=sm]:text-xs",
  {
    variants: {
      variant: {
        default:
          "border border-input text-foreground has-[>[data-slot=code-block-content]:focus-visible]:border-ring dark:bg-input-fill/30",
        destructive:
          "border border-destructive/30 text-destructive has-[>[data-slot=code-block-content]:focus-visible]:border-ring dark:border-destructive/40",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

/**
 * A block of code, terminal output or a diff, in one color; `variant="destructive"` marks failed output and `size="sm"` fits a tool's output in a `Trace`.
 *
 * @example
 * <CodeBlock>
 *   <CodeBlockContent>npm install zod</CodeBlockContent>
 * </CodeBlock>
 */
function CodeBlock({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof codeBlockVariants> & { size?: "default" | "sm" }) {
  return (
    <div
      data-slot="code-block"
      data-variant={variant}
      data-size={size}
      className={cn(codeBlockVariants({ variant }), className)}
      {...props}
    />
  )
}

/**
 * The row above the code that holds its `CodeBlockTitle` and its `CodeBlockActions`.
 *
 * @example
 * <CodeBlock>
 *   <CodeBlockHeader>
 *     <CodeBlockTitle>Terminal</CodeBlockTitle>
 *   </CodeBlockHeader>
 *   <CodeBlockContent>npm run build</CodeBlockContent>
 * </CodeBlock>
 */
function CodeBlockHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="code-block-header"
      className={cn(
        "flex min-w-0 shrink-0 items-center gap-2 px-3 pt-3 text-muted-foreground group-data-[size=sm]/code-block:px-2 group-data-[size=sm]/code-block:pt-2 group-data-[variant=destructive]/code-block:text-destructive *:has-[>[data-slot=code-block-title]]:min-w-0",
        className
      )}
      {...props}
    />
  )
}

/**
 * The file name or the label of the code, with an optional Phosphor icon before it; it truncates on one line.
 *
 * @example
 * <CodeBlock>
 *   <CodeBlockHeader>
 *     <CodeBlockTitle>
 *       <FileTsIcon />
 *       app/api/chat/route.ts
 *     </CodeBlockTitle>
 *   </CodeBlockHeader>
 * </CodeBlock>
 */
function CodeBlockTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="code-block-title"
      className={cn(
        "min-w-0 truncate font-sans text-xs font-medium text-foreground group-data-[variant=destructive]/code-block:text-destructive [&_svg]:pointer-events-none [&_svg]:inline-block [&_svg]:align-middle [&_svg:not([class*='size-'])]:size-3.5 *:[svg]:me-1.5",
        className
      )}
      {...props}
    />
  )
}

/**
 * The buttons of a code block, a `CodeBlockCopyButton` first; at the end of the `CodeBlockHeader`, or floating at the top end of a block with no header, shown on hover and focus.
 *
 * @example
 * <CodeBlock>
 *   <CodeBlockActions>
 *     <CodeBlockCopyButton value="npm run build" />
 *   </CodeBlockActions>
 *   <CodeBlockContent>npm run build</CodeBlockContent>
 * </CodeBlock>
 */
function CodeBlockActions({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="code-block-actions"
      className={cn(
        // allow-raw: local-stacking — z-10 keeps floating actions above the scrolling content of the block
        "-my-1 ms-auto -me-1.5 flex shrink-0 items-center gap-1 [[data-slot=code-block]>&]:absolute [[data-slot=code-block]>&]:end-2 [[data-slot=code-block]>&]:top-2 [[data-slot=code-block]>&]:z-10 [[data-slot=code-block]>&]:m-0 [[data-slot=code-block]>&]:opacity-0 [[data-slot=code-block]>&]:transition-opacity [[data-slot=code-block]>&]:group-focus-within/code-block:opacity-100 [[data-slot=code-block]>&]:group-hover/code-block:opacity-100 group-data-[size=sm]/code-block:[[data-slot=code-block]>&]:end-1.5 group-data-[size=sm]/code-block:[[data-slot=code-block]>&]:top-1.5 [[data-slot=code-block]>&]:pointer-coarse:opacity-100 [[data-slot=code-block]>&]:*:[button]:bg-background [[data-slot=code-block]>&]:*:[button]:not-focus-visible:ring-(length:--border-width-default) [[data-slot=code-block]>&]:*:[button]:not-focus-visible:ring-foreground/10",
        className
      )}
      {...props}
    />
  )
}

/**
 * A ghost icon `Button` that copies `value` to the clipboard, then says "Copied" for two seconds; `copyLabel` and `copiedLabel` replace its two names.
 *
 * @example
 * <CodeBlockActions>
 *   <CodeBlockCopyButton
 *     value="npm install zod"
 *     copyLabel="Copy the install command"
 *   />
 * </CodeBlockActions>
 */
function CodeBlockCopyButton({
  value,
  variant = "ghost",
  size = "icon-xs",
  copyLabel = UI_STRINGS.codeBlock.copy,
  copiedLabel = UI_STRINGS.codeBlock.copied,
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button> & {
  value: string
  copyLabel?: string
  copiedLabel?: string
}) {
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    if (!copied) {
      return
    }

    const timeout = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timeout)
  }, [copied])

  return (
    <>
      <Button
        data-slot="code-block-copy-button"
        data-copied={copied || undefined}
        variant={variant}
        size={size}
        aria-label={copied ? copiedLabel : copyLabel}
        className={cn(className)}
        onClick={(event) => {
          onClick?.(event)
          navigator.clipboard
            .writeText(value)
            .then(() => setCopied(true))
            .catch(() => {})
        }}
        {...props}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </Button>
      <span aria-live="polite" className="sr-only">
        {copied ? copiedLabel : ""}
      </span>
    </>
  )
}

/**
 * The `pre` that holds the code, a string or a list of `CodeBlockLine`; it scrolls, or wraps with `wrap`, numbers its lines with `lineNumbers` and is a tab stop so the keyboard can scroll it.
 *
 * @example
 * <CodeBlock>
 *   <CodeBlockContent lineNumbers startLine={12}>
 *     {"const total = items.length\nreturn total"}
 *   </CodeBlockContent>
 * </CodeBlock>
 */
function CodeBlockContent({
  className,
  children,
  style,
  wrap = false,
  lineNumbers = false,
  startLine = 1,
  ...props
}: React.ComponentProps<"pre"> & {
  wrap?: boolean
  lineNumbers?: boolean
  startLine?: number
}) {
  return (
    <pre
      data-slot="code-block-content"
      data-wrap={wrap || undefined}
      data-numbered={lineNumbers || undefined}
      dir="ltr"
      tabIndex={0}
      style={{ counterReset: `line ${startLine - 1}`, ...style }}
      className={cn(
        // focus-managed: the CodeBlock draws the ring and the ring-colored border while its content has focus-visible
        "min-h-0 min-w-0 scroll-fade-x overflow-auto px-3 py-3 text-start font-mono leading-relaxed outline-hidden group-has-data-[slot=code-block-footer]/code-block:pb-2 group-has-data-[slot=code-block-header]/code-block:pt-2 group-data-[size=sm]/code-block:px-2 group-data-[size=sm]/code-block:py-2 group-data-[size=sm]/code-block:group-has-data-[slot=code-block-header]/code-block:pt-1.5 data-wrap:scroll-fade-y data-wrap:wrap-break-word data-wrap:whitespace-pre-wrap",
        className
      )}
      {...props}
    >
      <code
        data-slot="code-block-code"
        className="grid min-h-lh min-w-max content-start in-data-numbered:grid-cols-[auto_1fr] in-data-wrap:min-w-0"
      >
        {lineNumbers && typeof children === "string"
          ? children
              .replace(/\n$/, "")
              .split("\n")
              .map((line, index) => (
                <CodeBlockLine key={index}>{line}</CodeBlockLine>
              ))
          : children}
      </code>
    </pre>
  )
}

const codeBlockLineVariants = cva(
  "relative -mx-3 block min-h-lh px-3 group-data-[size=sm]/code-block:-mx-2 group-data-[size=sm]/code-block:px-2 before:min-w-6 before:text-end before:text-muted-foreground after:absolute after:start-1 after:top-0 after:text-muted-foreground after:select-none in-data-numbered:col-span-2 in-data-numbered:grid in-data-numbered:grid-cols-subgrid in-data-numbered:gap-x-3 in-data-numbered:[counter-increment:line] in-data-numbered:before:content-[counter(line)] in-data-numbered:before:select-none in-data-numbered:supports-[content:counter(line)_/_'']:before:content-[counter(line)_/_'']",
  {
    variants: {
      variant: {
        default: "",
        added: "bg-muted after:content-['+']",
        removed: "bg-destructive/10 after:text-destructive after:content-['−']",
        highlighted: "bg-muted",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

/**
 * One line of a `CodeBlockContent`; `variant` marks it `added` (+), `removed` (−) or `highlighted`, and an empty line still copies as a blank line.
 *
 * @example
 * <CodeBlock>
 *   <CodeBlockContent>
 *     <CodeBlockLine variant="removed">const limit = 10</CodeBlockLine>
 *     <CodeBlockLine variant="added">const limit = 20</CodeBlockLine>
 *   </CodeBlockContent>
 * </CodeBlock>
 */
function CodeBlockLine({
  className,
  variant = "default",
  children,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof codeBlockLineVariants>) {
  // An empty line holds a newline so copying a selection keeps blank lines.
  const empty =
    children === undefined ||
    children === null ||
    children === "" ||
    (Array.isArray(children) && children.length === 0)

  return (
    <span
      data-slot="code-block-line"
      data-variant={variant}
      className={cn(codeBlockLineVariants({ variant }), className)}
      {...props}
    >
      <span data-slot="code-block-line-content" className="min-w-0">
        {empty ? "\n" : children}
      </span>
    </span>
  )
}

/**
 * The row under the code, for a note on the output or a "Show more" `Button`.
 *
 * @example
 * <CodeBlock>
 *   <CodeBlockContent>npm test</CodeBlockContent>
 *   <CodeBlockFooter>Exited with code 0</CodeBlockFooter>
 * </CodeBlock>
 */
function CodeBlockFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="code-block-footer"
      className={cn(
        "flex min-w-0 shrink-0 items-center gap-2 px-3 pb-3 text-muted-foreground group-data-[size=sm]/code-block:px-2 group-data-[size=sm]/code-block:pb-2",
        className
      )}
      {...props}
    />
  )
}

export {
  CodeBlock,
  CodeBlockHeader,
  CodeBlockTitle,
  CodeBlockActions,
  CodeBlockCopyButton,
  CodeBlockContent,
  CodeBlockLine,
  CodeBlockFooter,
}

export type CodeBlockProps = React.ComponentProps<typeof CodeBlock>
export type CodeBlockActionsProps = React.ComponentProps<
  typeof CodeBlockActions
>
export type CodeBlockContentProps = React.ComponentProps<
  typeof CodeBlockContent
>
export type CodeBlockCopyButtonProps = React.ComponentProps<
  typeof CodeBlockCopyButton
>
export type CodeBlockFooterProps = React.ComponentProps<typeof CodeBlockFooter>
export type CodeBlockHeaderProps = React.ComponentProps<typeof CodeBlockHeader>
export type CodeBlockLineProps = React.ComponentProps<typeof CodeBlockLine>
export type CodeBlockTitleProps = React.ComponentProps<typeof CodeBlockTitle>
