import path from "node:path"
import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react"
import Link from "next/link"
import ReactMarkdown, { type Components } from "react-markdown"
import remarkGfm from "remark-gfm"

import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { componentByName } from "@/site/lib/components"
import { anchor, stripComments } from "@/site/lib/markdown"
import { FOUNDATION_GROUPS } from "@/site/lib/nav"
import { sourceUrl } from "@/site/lib/site"
import { CodeBlock } from "@/site/ui/code-block"
import { LINK } from "@/site/ui/link"

const FOUNDATIONS = new Set(
  FOUNDATION_GROUPS.flatMap((group) => group.items.map((item) => item.slug))
)

/**
 * A link of a spec, made a link of the site: `../components/Field.md` →
 * `/components/field/`, `./create.md` → `/patterns/create/`. A link to any
 * other repository file opens it on GitHub at the release tag.
 */
function siteHref(href: string, from?: string): string {
  if (/^[a-z]+:/i.test(href) || href.startsWith("#") || !from) return href
  const [file, hash] = href.split("#")
  const target = path.posix.join(path.posix.dirname(from), file)
  const suffix = hash ? `#${hash}` : ""
  const component = /^specs\/components\/(\w+)\.md$/.exec(target)?.[1]
  if (component) {
    const entry = componentByName(component)
    if (entry) return `/components/${entry.slug}/${suffix}`
  }
  const pattern = /^specs\/patterns\/([\w-]+)\.md$/.exec(target)?.[1]
  if (pattern) return `/patterns/${pattern}/${suffix}`
  const foundation = /^specs\/foundations\/([\w-]+)\.md$/.exec(target)?.[1]
  if (foundation && FOUNDATIONS.has(foundation))
    return `/foundations/${foundation}/${suffix}`
  if (target === "specs/tokens/token-reference.md")
    return "/foundations/tokens/"
  return sourceUrl(target) + suffix
}

/** The text of a rendered node, for a heading's anchor. */
function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(textOf).join("")
  if (isValidElement<{ children?: ReactNode }>(node))
    return textOf(node.props.children)
  return ""
}

type Level = 1 | 2 | 3 | 4

function components(from: string | undefined, shift: number): Components {
  const heading = (level: number) =>
    function MarkdownHeading({ children }: { children?: ReactNode }) {
      const clamped = Math.min(4, Math.max(2, level + shift)) as Level
      return (
        <Heading
          level={clamped}
          id={anchor(textOf(children))}
          className="scroll-mt-20"
        >
          {children}
        </Heading>
      )
    }

  return {
    h1: heading(1),
    h2: heading(2),
    h3: heading(3),
    h4: heading(4),
    p: ({ children }) => <p className="text-sm leading-relaxed">{children}</p>,
    ul: ({ children }) => (
      <ul className="flex list-disc flex-col gap-1 pl-5 text-sm leading-relaxed">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="flex list-decimal flex-col gap-1 pl-5 text-sm leading-relaxed">
        {children}
      </ol>
    ),
    blockquote: ({ children }) => (
      <blockquote className="flex flex-col gap-2 border-l border-primary pl-4 text-muted-foreground">
        {children}
      </blockquote>
    ),
    hr: () => <Separator />,
    strong: ({ children }) => (
      <strong className="font-semibold text-foreground">{children}</strong>
    ),
    a: ({ href = "", children }) => (
      <Link href={siteHref(href, from)} className={LINK}>
        {children}
      </Link>
    ),
    code: ({ children }) => (
      <code className="bg-muted px-1 py-0.5 font-mono text-xs">{children}</code>
    ),
    pre: ({ children }) => {
      const child = Children.toArray(children)[0] as
        ReactElement<{ className?: string; children?: ReactNode }> | undefined
      const language = /language-([\w-]+)/.exec(
        child?.props.className ?? ""
      )?.[1]
      return (
        <CodeBlock code={textOf(child?.props.children)} language={language} />
      )
    },
    table: ({ children }) => <Table>{children}</Table>,
    thead: ({ children }) => <TableHeader>{children}</TableHeader>,
    tbody: ({ children }) => <TableBody>{children}</TableBody>,
    tr: ({ children }) => <TableRow>{children}</TableRow>,
    th: ({ children }) => <TableHead>{children}</TableHead>,
    td: ({ children }) => (
      <TableCell className="align-top whitespace-normal">{children}</TableCell>
    ),
  }
}

/**
 * Markdown from the specs, rendered with the design system's own parts. The
 * generated-section markers are dropped, and links to other specs point at
 * their page on the site.
 */
export function Markdown({
  children,
  from,
  shift = 0,
  className,
}: {
  children: string
  /** The repository file the text comes from, to resolve its relative links. */
  from?: string
  /** Moves every heading down: 1 makes a `##` a level 3, under a section's own heading. */
  shift?: number
  className?: string
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-4", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components(from, shift)}
      >
        {stripComments(children)}
      </ReactMarkdown>
    </div>
  )
}

/** One line of Markdown, without a paragraph around it: a table cell, a list item. */
export function InlineMarkdown({
  children,
  from,
}: {
  children: string
  from?: string
}) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        ...components(from, 0),
        p: ({ children }) => <>{children}</>,
      }}
    >
      {children}
    </ReactMarkdown>
  )
}
