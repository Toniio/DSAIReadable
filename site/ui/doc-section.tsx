import type { ReactNode } from "react"

import { Heading } from "@/components/ui/heading"

/**
 * A section of a page, with the `id` its "On this page" link points at. The
 * heading is a level 2; a section's own subsections use level 3.
 */
export function DocSection({
  id,
  title,
  description,
  actions,
  children,
}: {
  id: string
  title: string
  description?: ReactNode
  /** Controls placed on the heading's line: a view switch, a filter. */
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="flex scroll-mt-20 flex-col gap-4"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Heading level={2} id={`${id}-title`}>
            {title}
          </Heading>
          {description ? (
            <div className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {description}
            </div>
          ) : null}
        </div>
        {actions}
      </div>
      {children}
    </section>
  )
}
