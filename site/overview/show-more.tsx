"use client"

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react"
import type { ReactNode } from "react"
import { CaretDownIcon, CaretUpIcon } from "@phosphor-icons/react/ssr"

import { Button } from "@/components/ui/button"

/**
 * The entries of an Overview list past the first few, closed at first.
 *
 * They stay in the page, `hidden="until-found"`: the browser's find in page
 * reaches them and opens the list (`beforematch`), where a browser without
 * it keeps them hidden. Radix's `CollapsibleContent` cannot do this, it
 * renders nothing while closed. When the entries carry anchors a spec links
 * to (a composition rule, `/#rule-21`) and the address names one of them,
 * the list opens and the page jumps to it.
 */
export function ShowMore({
  count,
  noun,
  ids = [],
  children,
}: {
  /** How many entries the list hides. */
  count: number
  /** What an entry is, in the plural: "rules", "terms". */
  noun: string
  /** The anchors of the hidden entries, if they have any. */
  ids?: string[]
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const target = useRef<string>(undefined)
  const content = useRef<HTMLDivElement>(null)
  const contentId = useId()

  useEffect(() => {
    const reveal = () => {
      const id = decodeURIComponent(window.location.hash.slice(1))
      if (!ids.includes(id)) return
      target.current = id
      setOpen(true)
    }
    reveal()
    window.addEventListener("hashchange", reveal)
    return () => window.removeEventListener("hashchange", reveal)
  }, [ids])

  // React writes `hidden` as a boolean: the value that lets find in page in
  // is set here, before the browser paints the closed list.
  useLayoutEffect(() => {
    const node = content.current
    if (!node) return
    if (!open) node.setAttribute("hidden", "until-found")
    const found = () => setOpen(true)
    node.addEventListener("beforematch", found)
    return () => node.removeEventListener("beforematch", found)
  }, [open])

  // Once the list is open: a jump made while it was hidden found nothing.
  useEffect(() => {
    if (!open || !target.current) return
    document.getElementById(target.current)?.scrollIntoView()
    target.current = undefined
  }, [open])

  return (
    <div className="flex flex-col gap-3">
      <div ref={content} id={contentId} hidden={!open}>
        {children}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="xs"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen(!open)}
        className="group/disclosure -ml-2 w-fit"
      >
        {open ? `Show fewer ${noun}` : `Show ${count} more ${noun}`}
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
    </div>
  )
}
