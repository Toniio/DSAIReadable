import type { Metadata } from "next"
import { PlusIcon } from "@phosphor-icons/react/ssr"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { FoundationPage } from "@/site/foundation-docs/spec-pages/foundation-page"
import {
  ClassList,
  Code,
  Dimension,
} from "@/site/foundation-docs/spec-pages/token-bits"
import { foundation } from "@/site/lib/nav"
import { tailwindClasses, tokenGroup } from "@/site/lib/tokens"
import { DocSection } from "@/site/ui/doc-section"
import { InlineMarkdown } from "@/site/ui/markdown"

const ENTRY = foundation("size")

export const metadata: Metadata = {
  title: ENTRY.label,
  description: ENTRY.summary,
}

const SECTIONS = [{ id: "target", label: "Minimum target" }]

export default function SizePage() {
  const [target] = tokenGroup("size.target")

  return (
    <FoundationPage slug="size" sections={SECTIONS}>
      <DocSection
        id="target"
        title="Minimum target"
        description={
          <>
            <Code>{target.token}</Code>, the smallest area a pointer has to hit.
            A control may be drawn smaller, as long as its clickable area is
            not. The dashed frames mark the area that takes the click.
          </>
        }
      >
        <div className="flex flex-col gap-2 border p-4">
          <span className="flex flex-wrap items-baseline gap-2">
            <span className="font-mono text-sm font-medium">
              {target.token}
            </span>
            <Dimension value={target.value.light} />
          </span>
          <ClassList
            classes={[
              ...(target.docs?.tailwind?.split(" ") ?? []),
              ...tailwindClasses(target.cssVar).filter((value) =>
                value.startsWith("size-")
              ),
            ]}
          />
          <p className="text-xs leading-relaxed text-muted-foreground">
            <InlineMarkdown>{target.description ?? ""}</InlineMarkdown>
          </p>
        </div>
        <div className="grid gap-px border bg-border md:grid-cols-2">
          <figure className="flex flex-col gap-4 bg-background p-6">
            <div className="flex h-24 items-center justify-center bg-muted">
              <div className="relative">
                <Button
                  type="button"
                  variant="outline"
                  size="icon-xs"
                  aria-label="Add a row"
                >
                  <PlusIcon />
                </Button>
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 border border-dashed border-foreground"
                />
              </div>
            </div>
            <figcaption className="flex flex-col gap-1 text-xs leading-relaxed">
              <span className="font-medium">Drawn at the target</span>
              <span className="text-muted-foreground">
                A <Code>Button</Code> at <Code>size=&quot;icon-xs&quot;</Code>,
                the smallest size a button takes: its box is the target.
              </span>
            </figcaption>
          </figure>
          <figure className="flex flex-col gap-4 bg-background p-6">
            <div className="flex h-24 items-center justify-center bg-muted">
              <div className="flex items-center gap-3">
                <div className="relative flex">
                  <Checkbox id="size-terms" defaultChecked />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -inset-x-3 -inset-y-2 border border-dashed border-foreground"
                  />
                </div>
                <Label htmlFor="size-terms">Email me updates</Label>
              </div>
            </div>
            <figcaption className="flex flex-col gap-1 text-xs leading-relaxed">
              <span className="font-medium">
                Drawn smaller, hit area extended
              </span>
              <span className="text-muted-foreground">
                A <Code>Checkbox</Code> draws a <Code>size-4</Code> box and
                takes the click through{" "}
                <Code>after:-inset-x-3 after:-inset-y-2</Code>, without moving
                the drawing.
              </span>
            </figcaption>
          </figure>
        </div>
      </DocSection>
    </FoundationPage>
  )
}
