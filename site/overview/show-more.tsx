"use client"

import { useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"

import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import { DisclosureTrigger } from "@/site/mcp-skills-docs/disclosure"

/**
 * The entries of an Overview list past the first few, closed at first. When
 * they carry anchors a spec links to (a composition rule, `/#rule-21`) and
 * the address names one of them, the list opens and the page jumps to it,
 * which a closed list cannot do.
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

  // Once the rule is rendered: the jump made before it existed found nothing.
  // An open list needs no help, the browser's own jump finds the rule.
  useEffect(() => {
    if (!open || !target.current) return
    document.getElementById(target.current)?.scrollIntoView()
    target.current = undefined
  }, [open])

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="flex flex-col gap-3"
    >
      <CollapsibleContent>{children}</CollapsibleContent>
      <DisclosureTrigger>
        {open ? `Show fewer ${noun}` : `Show ${count} more ${noun}`}
      </DisclosureTrigger>
    </Collapsible>
  )
}
