"use client"

import { useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"

import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import { DisclosureTrigger } from "@/site/mcp-skills-docs/disclosure"

/**
 * The composition rules past the first few, closed at first. A spec links to
 * a rule by its anchor (`/#rule-21`): when the address names one of these,
 * the list opens and the page jumps to it, which a closed list cannot do.
 */
export function MoreRules({
  ids,
  children,
}: {
  ids: string[]
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
        {open ? "Show fewer rules" : `Show ${ids.length} more rules`}
      </DisclosureTrigger>
    </Collapsible>
  )
}
