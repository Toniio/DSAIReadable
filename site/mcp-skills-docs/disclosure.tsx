import type { ReactNode } from "react"
import { CaretDownIcon, CaretUpIcon } from "@phosphor-icons/react/ssr"

import { Button } from "@/components/ui/button"
import { CollapsibleTrigger } from "@/components/ui/collapsible"

/**
 * The button that opens and closes a `Collapsible` of the section, a long
 * answer or table closed at first. Its caret points up while it is open, as
 * the design system's `Accordion` does; its text lines up with the content.
 */
export function DisclosureTrigger({ children }: { children: ReactNode }) {
  return (
    <CollapsibleTrigger asChild>
      <Button
        type="button"
        variant="ghost"
        size="xs"
        className="group/disclosure -ml-2 w-fit"
      >
        {children}
        <CaretDownIcon
          data-icon="inline-end"
          aria-hidden="true"
          className="group-aria-expanded/disclosure:hidden"
        />
        <CaretUpIcon
          data-icon="inline-end"
          aria-hidden="true"
          className="hidden group-aria-expanded/disclosure:inline"
        />
      </Button>
    </CollapsibleTrigger>
  )
}
