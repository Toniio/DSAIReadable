import type { Metadata } from "next"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { OVERLAY_BASE } from "@/lib/overlay"
import { cn } from "@/lib/utils"
import { FoundationPage } from "@/site/foundation-docs/b/foundation-page"
import {
  ClassList,
  Code,
  shortName,
  StatusBadge,
} from "@/site/foundation-docs/b/token-bits"
import { foundation } from "@/site/lib/nav"
import { tailwindClasses, tokenGroup, type Token } from "@/site/lib/tokens"
import { DocSection } from "@/site/ui/doc-section"
import { InlineMarkdown } from "@/site/ui/markdown"

const ENTRY = foundation("opacity")

export const metadata: Metadata = {
  title: ENTRY.label,
  description: ENTRY.summary,
}

const SECTIONS = [
  { id: "tokens", label: "Tokens" },
  { id: "binary-states", label: "Binary states" },
]

/** What each token stands for on screen: the state, or what replaced it. */
function Sample({ entry }: { entry: Token }) {
  const name = shortName(entry, "opacity")
  if (name === "disabled")
    return (
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button">Save</Button>
        <Button type="button" disabled>
          Save
        </Button>
      </div>
    )
  if (name === "placeholder")
    return <Input aria-label="Search accounts" placeholder="Search accounts…" />
  return (
    <div className="relative isolate flex h-16 w-full items-center justify-center overflow-hidden border bg-background">
      <span className="text-sm">The page behind</span>
      {/* The scrim modal surfaces draw: a tint, not an opacity. */}
      <div className={cn(OVERLAY_BASE, "absolute left-1/2")} />
    </div>
  )
}

export default function OpacityPage() {
  const scale = tokenGroup("opacity")
  const active = scale.filter((entry) => entry.status === "active")

  return (
    <FoundationPage slug="opacity" sections={SECTIONS}>
      <DocSection
        id="tokens"
        title="Tokens"
        description={
          <>
            {scale.length} tokens, {active.length} active. The deprecated ones
            show what replaced them: a placeholder is a color, a backdrop is a
            tint.
          </>
        }
      >
        <ul className="grid gap-px border bg-border md:grid-cols-3">
          {scale.map((entry) => (
            <li
              key={entry.token}
              className="flex flex-col gap-3 bg-background p-4"
            >
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm font-medium">
                  {entry.token}
                </span>
                <StatusBadge status={entry.status} />
              </span>
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs">{entry.value.light}</span>
                {tailwindClasses(entry.cssVar).length ? (
                  <ClassList classes={tailwindClasses(entry.cssVar)} />
                ) : null}
              </span>
              <p className="text-xs leading-relaxed text-muted-foreground">
                <InlineMarkdown>{entry.description ?? ""}</InlineMarkdown>
              </p>
              {entry.replacement ? (
                <p className="text-xs">
                  Replaced by <Code>{entry.replacement}</Code>
                </p>
              ) : null}
              <div className="mt-auto flex min-h-16 items-center border-t pt-3">
                <Sample entry={entry} />
              </div>
            </li>
          ))}
        </ul>
      </DocSection>

      <DocSection
        id="binary-states"
        title="Binary states"
        description="Opacity shows, hides or disables. Three classes exist; every other opacity class is rejected by ESLint. To quiet a text or an icon, use a color."
      >
        <ul className="grid gap-px border bg-border sm:grid-cols-3">
          <li className="flex flex-col gap-3 bg-background p-4">
            <Code className="w-fit">opacity-0</Code>
            <div className="flex h-16 items-center justify-center border border-dashed">
              <Badge className="opacity-0">Hidden</Badge>
            </div>
            <p className="text-xs text-muted-foreground">Hidden</p>
          </li>
          <li className="flex flex-col gap-3 bg-background p-4">
            <Code className="w-fit">opacity-100</Code>
            <div className="flex h-16 items-center justify-center border border-dashed">
              <Badge className="opacity-100">Shown</Badge>
            </div>
            <p className="text-xs text-muted-foreground">Shown</p>
          </li>
          <li className="flex flex-col gap-3 bg-background p-4">
            <ClassList
              classes={active.flatMap((entry) => tailwindClasses(entry.cssVar))}
            />
            <div className="flex h-16 items-center justify-center border border-dashed">
              <Button type="button" disabled>
                Disabled
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Disabled, under its variant:{" "}
              <Code>disabled:opacity-disabled</Code>
            </p>
          </li>
        </ul>
      </DocSection>
    </FoundationPage>
  )
}
