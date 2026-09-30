import type { TSESTree } from "@typescript-eslint/utils"
import { contextOf, createRule, textOf } from "./utils.js"

/** Tailwind's default palette: none of it is part of this design system. */
const PALETTE =
  "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose"

const PALETTE_CLASS = new RegExp(
  `^!?-?(?:bg|text|border|ring|fill|stroke|from|via|to|outline|divide|accent|caret|decoration|shadow)-(?:${PALETTE})-\\d{2,3}(?:/.+)?$`
)
const ARBITRARY_VALUE = /^!?-?[a-z][\w-]*-\[/
const HEX = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![\w-])/
const COLOR_FUNCTION = /\b(?:rgba?|hsla?|oklch|oklab|lab|lch|color-mix)\s*\(/
const RAW_UNIT = /(?<![\w.-])\d*\.?\d+(?:px|rem|ms)\b/

/** The utility of a class: what follows its last variant (`dark:hover:bg-x` → `bg-x`). */
function utilityOf(token: string): string {
  let depth = 0
  let start = 0
  for (let i = 0; i < token.length; i++) {
    const c = token[i]
    if (c === "[") depth++
    else if (c === "]") depth--
    else if (c === ":" && depth === 0) start = i + 1
  }
  return token.slice(start)
}

type MessageId =
  | "hex"
  | "colorFunction"
  | "palette"
  | "arbitrary"
  | "unit"
  | "primitive"
  | "mediaDark"

export default createRule<[], MessageId>({
  name: "no-raw-values",
  meta: {
    type: "problem",
    docs: {
      description:
        "Forbid raw values in styles: colors, arbitrary Tailwind values, the default palette, primitive tokens",
    },
    messages: {
      hex: 'Raw hex color "{{value}}". Colors come from tokens (text-primary, bg-muted…), which carry their dark-mode value.',
      colorFunction:
        'Raw color function "{{value}}". Colors come from tokens, which already carry their dark-mode value.',
      palette:
        'Tailwind default palette class "{{value}}": the palette is removed from this design system. Use a semantic class (bg-primary, text-muted-foreground…).',
      arbitrary:
        'Arbitrary Tailwind value "{{value}}". Use a class the design system maps to a token (p-4, rounded-md, duration-fast…).',
      unit: 'Raw value "{{value}}" in an inline style. Use a token class instead of px, rem or ms.',
      primitive:
        "Primitive tokens are private (Tier 1): use a semantic token (var(--color-…)) or its Tailwind class.",
      mediaDark:
        "prefers-color-scheme: dark mode is class-based in this design system (.dark on <html>): use the `dark:` variant.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const check = (node: TSESTree.Node) => {
      const text = textOf(node)
      if (text === undefined) return
      const report = (messageId: MessageId, value = "") =>
        context.report({ node, messageId, data: { value } })

      // Wherever they are written.
      if (text.includes("--ds-prim-")) report("primitive")
      if (text.includes("prefers-color-scheme")) report("mediaDark")

      const where = contextOf(node)
      if (where === "style") {
        const hex = HEX.exec(text)
        if (hex) return report("hex", hex[0])
        const fn = COLOR_FUNCTION.exec(text)
        if (fn) return report("colorFunction", fn[0].replace(/\s*\($/, "()"))
        const unit = RAW_UNIT.exec(text)
        if (unit) report("unit", unit[0])
        return
      }
      if (where !== "class") return

      for (const token of text.split(/\s+/).filter(Boolean)) {
        const utility = utilityOf(token)
        const hex = HEX.exec(token)
        const fn = COLOR_FUNCTION.exec(token)
        if (hex) report("hex", hex[0])
        else if (fn) report("colorFunction", fn[0].replace(/\s*\($/, "()"))
        else if (PALETTE_CLASS.test(utility)) report("palette", utility)
        else if (ARBITRARY_VALUE.test(utility)) report("arbitrary", utility)
      }
    }
    return { Literal: check, TemplateElement: check }
  },
})
