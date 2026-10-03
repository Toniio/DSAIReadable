import type { ReactNode } from "react"

import { Heading } from "@/components/ui/heading"

/** A page's title, its one-paragraph lead, and what sits under them. */
export function PageHeader({
  title,
  lead,
  eyebrow,
  children,
}: {
  title: string
  lead?: ReactNode
  /** A short line above the title: the category, the section. */
  eyebrow?: ReactNode
  children?: ReactNode
}) {
  return (
    <header className="flex flex-col gap-4">
      {eyebrow ? (
        <div className="text-sm text-muted-foreground">{eyebrow}</div>
      ) : null}
      <Heading level={1}>{title}</Heading>
      {lead ? (
        <div className="max-w-3xl text-base leading-relaxed text-muted-foreground">
          {lead}
        </div>
      ) : null}
      {children}
    </header>
  )
}
