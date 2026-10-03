import type { ComponentType } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import type { IconProps, IconWeight } from "@phosphor-icons/react"
import * as Glyphs from "@phosphor-icons/react/ssr"

import { cn } from "@/lib/utils"
import {
  IconCatalog,
  IconSettings,
  UsedIcons,
} from "@/site/foundation-docs/spec-pages/icon-browser"
import {
  WEIGHTS,
  type IconSize,
} from "@/site/foundation-docs/spec-pages/icon-settings"
import { iconRules, usedIcons } from "@/site/foundation-docs/spec-pages/icons"
import { FoundationPage } from "@/site/foundation-docs/spec-pages/foundation-page"
import { LINK } from "@/site/ui/link"
import { remToPx } from "@/site/foundation-docs/spec-pages/spec"
import { Code } from "@/site/foundation-docs/spec-pages/token-bits"
import { foundation } from "@/site/lib/nav"
import { tokenByName } from "@/site/lib/tokens"
import { CodeBlock } from "@/site/ui/code-block"
import { DocSection } from "@/site/ui/doc-section"

const ENTRY = foundation("icons")

export const metadata: Metadata = {
  title: ENTRY.label,
  description: ENTRY.summary,
}

const SECTIONS = [
  { id: "rules", label: "Rules" },
  { id: "in-use", label: "In the components" },
  { id: "catalog", label: "Full catalog" },
]

/**
 * Each weight's glyph shows only when the grid picks it: whole classes, one
 * per weight, so that Tailwind compiles each.
 */
const WEIGHT_CLASS: Record<IconWeight, string> = {
  regular: "group-data-[weight=regular]/icons:block",
  bold: "group-data-[weight=bold]/icons:block",
  fill: "group-data-[weight=fill]/icons:block",
  duotone: "group-data-[weight=duotone]/icons:block",
  thin: "group-data-[weight=thin]/icons:block",
  light: "group-data-[weight=light]/icons:block",
}

const SIZE_CLASSES =
  "size-4 group-data-[size=5]/icons:size-5 group-data-[size=6]/icons:size-6"

/** The size steps the toggle offers, labeled with their token's value. */
const STEPS: IconSize["step"][] = ["4", "5", "6"]

/** An icon of the library by its export name, drawn on the server. */
const glyphs = Glyphs as unknown as Record<
  string,
  ComponentType<IconProps> | undefined
>

export default function IconsPage() {
  const rules = iconRules()
  const used = usedIcons(rules.library)
  const sizes: IconSize[] = STEPS.map((step) => {
    const token = tokenByName(`space.scale.${step}`)
    const px = token ? remToPx(token.value.light) : undefined
    return { step, label: px === undefined ? `size-${step}` : `${px}px` }
  })
  const components = new Set(
    used.flatMap((icon) => icon.usedBy.map((user) => user.slug))
  )
  const example = used[0]?.name ?? "XIcon"

  return (
    <FoundationPage slug="icons" sections={SECTIONS}>
      {/* The bullets are the rules: the summary and the rule paragraph of
          icons.json say the same again, so the page shows neither. */}
      <DocSection
        id="rules"
        title="Rules"
        description="The icon rules, as agents read them from the MCP server."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-3 border p-4">
            <ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed">
              {rules.usage.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground">
              Browse the library on{" "}
              <Link href={rules.catalog_url} className={LINK}>
                phosphoricons.com
              </Link>
              .
            </p>
          </div>
          <CodeBlock
            title="Import"
            language="tsx"
            code={`import { ${example} } from "${rules.library}"\n\n<${example} />`}
          />
        </div>
      </DocSection>

      <IconSettings>
        <DocSection
          id="in-use"
          title="In the components"
          description={
            <>
              {used.length} icons, imported by {components.size} components.
              Select one to copy its import line; the links under it open the
              components that use it.
            </>
          }
        >
          <UsedIcons
            library={rules.library}
            sizes={sizes}
            icons={used.map((icon) => {
              const Glyph = glyphs[icon.name]
              return {
                ...icon,
                glyph: Glyph ? (
                  <>
                    {WEIGHTS.map((weight) => (
                      <Glyph
                        key={weight}
                        weight={weight}
                        aria-hidden="true"
                        className={cn(
                          "hidden",
                          WEIGHT_CLASS[weight],
                          SIZE_CLASSES
                        )}
                      />
                    ))}
                  </>
                ) : (
                  <Code>?</Code>
                ),
              }
            })}
          />
        </DocSection>

        <DocSection
          id="catalog"
          title="Full catalog"
          description={
            <>
              Any icon of <Code>{rules.library}</Code> may be used: the ones
              above are only those the components draw.
            </>
          }
        >
          <IconCatalog
            library={rules.library}
            sizes={sizes}
            catalogUrl={rules.catalog_url}
          />
        </DocSection>
      </IconSettings>
    </FoundationPage>
  )
}
