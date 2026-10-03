import type { Metadata } from "next"

import { FoundationPage } from "@/site/foundation-docs/b/foundation-page"
import {
  Code,
  ModePanels,
  shortName,
} from "@/site/foundation-docs/b/token-bits"
import { foundation } from "@/site/lib/nav"
import { darkValue, tailwindClasses, tokenGroup } from "@/site/lib/tokens"
import { DocSection } from "@/site/ui/doc-section"

const ENTRY = foundation("elevation")

export const metadata: Metadata = {
  title: ENTRY.label,
  description: ENTRY.summary,
}

const SECTIONS = [{ id: "levels", label: "Levels" }]

export default function ElevationPage() {
  const levels = tokenGroup("elevation")

  return (
    <FoundationPage slug="elevation" sections={SECTIONS}>
      <DocSection
        id="levels"
        title="Levels"
        description={
          <>
            {levels.length} shadows, each drawn by its token in both modes. Dark
            mode raises their opacity: a light shadow disappears on a dark
            surface. Each class switches to its dark value on its own.
          </>
        }
      >
        <ModePanels>
          {(mode) => (
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {levels.map((entry) => (
                <li
                  key={entry.token}
                  className="flex min-h-28 flex-col justify-between gap-3 bg-popover p-4 text-popover-foreground"
                  style={{ boxShadow: `var(${entry.cssVar})` }}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-mono text-sm font-medium">
                      {shortName(entry, "elevation")}
                    </span>
                    <Code>{tailwindClasses(entry.cssVar)[0]}</Code>
                  </span>
                  <span className="font-mono text-xs leading-relaxed break-words text-muted-foreground">
                    {mode === "light" ? entry.value.light : darkValue(entry)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </ModePanels>
      </DocSection>
    </FoundationPage>
  )
}
