#!/usr/bin/env tsx
//
// lint-raw-values.ts
// Scans components/, src/, hooks/, lib/, styles/ and site/ (the documentation site) for raw CSS values AND Tailwind utility misuses.
// Errors:   raw colors, raw layout spacing, raw border-radius, raw durations, raw TW utilities (z-N, duration-N, duration-[X], ease-[X], ring-N, ring, ring-[X], outline-N, outline, outline-offset-N, outline-[X], rounded-[X], text-[size], shadow-[X], arbitrary spacing)
// Warnings: unusual opacity values
// Respects: allow-raw comments (block or inline) as opt-outs
// Never exempt: a Primitive token (--ds-prim-*), a prefers-color-scheme query and a raw ring or outline width (ring-N, ring, outline-N, outline, outline-offset-N), whatever the comment says
// Exit 1 on any ERROR.
//

import fs from "fs"
import path from "path"
import { glob } from "glob"

// ---------------------------------------------------------------------------
// Token suggestion map — maps raw value pattern → semantic CSS variable
// ---------------------------------------------------------------------------
const COLOR_SUGGESTIONS: Record<string, string> = {
  "#000000": "--color-text-default",
  "#000": "--color-text-default",
  "#ffffff": "--color-background-default",
  "#fff": "--color-background-default",
  "#f8fafc": "--color-background-subtle",
  "#f1f5f9": "--color-background-subtle",
  "#e2e8f0": "--color-border-default",
  "#cbd5e1": "--color-border-subtle",
  "#94a3b8": "--color-text-subtle",
  "#64748b": "--color-text-subtle",
  "#334155": "--color-text-default",
  "#1e293b": "--color-text-default",
  "#0f172a": "--color-text-default",
}

const SPACING_SUGGESTIONS: [RegExp, string][] = [
  [/\b4px\b/, "--space-1 (4px)"],
  [/\b8px\b/, "--space-2 (8px)"],
  [/\b12px\b/, "--space-3 (12px)"],
  [/\b16px\b/, "--space-4 (16px)"],
  [/\b20px\b/, "--space-5 (20px)"],
  [/\b24px\b/, "--space-6 (24px)"],
  [/\b32px\b/, "--space-8 (32px)"],
  [/\b40px\b/, "--space-10 (40px)"],
  [/\b48px\b/, "--space-12 (48px)"],
  [/\b64px\b/, "--space-16 (64px)"],
  [/\b0\.25rem\b/, "--space-1 (0.25rem)"],
  [/\b0\.5rem\b/, "--space-2 (0.5rem)"],
  [/\b0\.75rem\b/, "--space-3 (0.75rem)"],
  [/\b1rem\b/, "--space-4 (1rem)"],
  [/\b1\.5rem\b/, "--space-6 (1.5rem)"],
  [/\b2rem\b/, "--space-8 (2rem)"],
]

// ---------------------------------------------------------------------------
// Pattern definitions
// ---------------------------------------------------------------------------
interface RuleDefinition {
  pattern: RegExp
  level: "error" | "warning"
  category: string
  suggest: (match: string) => string
}

const CSS_RULES: RuleDefinition[] = [
  // --- Colors (error) -------------------------------------------------------
  {
    pattern: /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6,8})\b/g,
    level: "error",
    category: "color-hex",
    suggest: (m) =>
      COLOR_SUGGESTIONS[m.toLowerCase()] ?? "--color-* (check semantic.json)",
  },
  {
    pattern: /\brgba?\s*\([^)]+\)/g,
    level: "error",
    category: "color-rgb",
    suggest: () => "--color-* (check semantic.json)",
  },
  {
    pattern: /\bhsl[a]?\s*\([^)]+\)/g,
    level: "error",
    category: "color-hsl",
    suggest: () => "--color-* (check semantic.json)",
  },
  {
    pattern: /\boklch\s*\([^)]+\)/g,
    level: "error",
    category: "color-oklch",
    suggest: () => "--color-* (check semantic.json)",
  },
  {
    pattern: /\boklab\s*\([^)]+\)/g,
    level: "error",
    category: "color-oklab",
    suggest: () => "--color-* (check semantic.json)",
  },
  {
    pattern: /\bcolor-mix\s*\([^)]+\)/g,
    level: "error",
    category: "color-mix",
    suggest: () =>
      "--color-* with an opacity modifier (bg-primary/10) — check semantic.json",
  },
  // --- Layout spacing (error) -----------------------------------------------
  {
    pattern:
      /(?:padding|margin|gap|top|right|bottom|left|width|height|inset)\s*:\s*[0-9]+(?:\.[0-9]+)?(?:px|rem|em)\b/g,
    level: "error",
    category: "spacing-layout",
    suggest: (m) => {
      for (const [re, suggestion] of SPACING_SUGGESTIONS) {
        if (re.test(m)) return `var(${suggestion})`
      }
      return "--space-* (check semantic.json)"
    },
  },
  // --- Border radius (error) ------------------------------------------------
  {
    pattern: /border-radius\s*:\s*[0-9]+(?:\.[0-9]+)?(?:px|rem|em)\b/g,
    level: "error",
    category: "border-radius",
    suggest: () => "--radius-* (check semantic.json)",
  },
  // --- Durations (error) ----------------------------------------------------
  {
    pattern: /\b[0-9]+ms\b/g,
    level: "error",
    category: "duration",
    suggest: () => "--duration-* (check semantic.json)",
  },
  // --- Unusual opacity (warning) --------------------------------------------
  {
    pattern: /opacity\s*:\s*0\.[1-9][0-9]*/g,
    level: "warning",
    category: "opacity",
    suggest: () => "--opacity-* (check semantic.json)",
  },
]

// ---------------------------------------------------------------------------
// Tier and theming rules — AGENTS.md § 1, no allow-raw opt-out
// ---------------------------------------------------------------------------
// An allow-raw comment excuses a value the token layer cannot express yet.
// These two are not values: a Primitive reference skips the tier that owns
// light and dark, and a prefers-color-scheme query builds a second dark mode
// beside the `.dark` class. Neither has a legitimate exception.
const STRICT_RULES: RuleDefinition[] = [
  {
    pattern: /--ds-prim-[\w-]*/g,
    level: "error",
    category: "primitive-token",
    suggest: () =>
      "the Semantic token that references it (tokens/semantic.json) — Tier 1 is private",
  },
  {
    pattern: /prefers-color-scheme/g,
    level: "error",
    category: "dark-mode-media",
    suggest: () =>
      "the `dark:` variant — dark mode is the `.dark` class on <html>",
  },
]

// ---------------------------------------------------------------------------
// Tailwind utility rules — applied on className strings only
// ---------------------------------------------------------------------------
interface TwRuleDefinition {
  pattern: RegExp
  level: "error" | "warning"
  category: string
  suggest: (match: string) => string
  /** If true, skip matches that use var() or calc() with var() inside brackets */
  allowVarCalc?: boolean
  /** If true, skip comment lines: the pattern is also an ordinary word */
  skipComments?: boolean
  /**
   * If true, an allow-raw comment does not excuse it: a token form always
   * exists, and an exemption granted for another value on the same line must
   * not hide it.
   */
  neverExempt?: boolean
}

const RING_WIDTH_SUGGESTION =
  "a token width: SURFACE_OUTLINE or SEPARATION_RING (@/lib/surface), FOCUS_RING (@/lib/focus), or ring-(length:--border-width-*) under a variant"

const OUTLINE_WIDTH_SUGGESTION =
  "outline-(length:--border-width-*) — a token width, as the Tabs trigger does; an offset needs a token too"

const TW_RULES: TwRuleDefinition[] = [
  // z-index with raw numeric values (z-0 and z-1 are fine for local stacking, z-10/z-20/z-50 etc. are not)
  {
    pattern: /\bz-(\d+)\b/g,
    level: "error",
    category: "tw-zindex",
    suggest: (m) => {
      const n = parseInt(m.replace("z-", ""), 10)
      if (n <= 1) return ""
      if (n >= 50) return "z-modal / z-popover / z-tooltip / z-overlay"
      if (n >= 20) return "z-sticky"
      return "z-dropdown / z-fixed"
    },
  },
  // duration with raw numeric values
  {
    pattern: /\bduration-(\d+)\b/g,
    level: "error",
    category: "tw-duration",
    suggest: (m) => {
      const n = parseInt(m.replace("duration-", ""), 10)
      if (n <= 100) return "duration-fast"
      if (n <= 200) return "duration-normal"
      if (n <= 300) return "duration-slow"
      return "duration-extra-slow"
    },
  },
  // duration-[250ms], ease-[cubic-bezier(…)], delay-[…] — arbitrary motion.
  // Reading a token stays free: ease-(--motion-easing-out) is not matched.
  {
    pattern: /\b(?:duration|ease|delay)-\[([^\]]+)\]/g,
    level: "error",
    category: "tw-motion-arbitrary",
    suggest: (m) =>
      m.startsWith("ease")
        ? "ease-default / ease-in / ease-out / ease-spring"
        : "duration-fast / duration-normal / duration-slow / duration-slower",
    allowVarCalc: true,
  },
  // ring-[Xpx] arbitrary ring widths
  {
    pattern: /\bring-\[([^\]]+)\]/g,
    level: "error",
    category: "tw-ring-arbitrary",
    suggest: () => RING_WIDTH_SUGGESTION,
    allowVarCalc: true,
  },
  // ring-1, ring-2 … and a bare `ring` — Tailwind compiles them to fixed
  // pixel widths, so a surface outlined with one ignores border-width.default
  // when a field's border follows it. ring-0 is a reset and stays allowed.
  {
    pattern: /(?<![\w-])ring-([1-9]\d*)(?![\w.-])/g,
    level: "error",
    category: "tw-ring-width-raw",
    suggest: () => RING_WIDTH_SUGGESTION,
    skipComments: true,
    neverExempt: true,
  },
  {
    pattern: /(?<=^|[\s"'`:])ring(?=[\s"'`]|$)/g,
    level: "error",
    category: "tw-ring-width-raw",
    suggest: () => RING_WIDTH_SUGGESTION,
    skipComments: true,
    neverExempt: true,
  },
  // outline-1, outline-2 …, a bare `outline` (1px in v4) and outline-offset-N:
  // the same fixed pixel widths as ring-N, drawn by the focus indicator of a
  // component that paints its own outline. outline-0 and outline-offset-0 are
  // resets and stay allowed; `"outline"` alone in quotes is a variant name
  // (variant="outline"), not the utility, and is not matched.
  {
    pattern: /(?<![\w-])outline-(?:offset-)?([1-9]\d*)(?![\w.-])/g,
    level: "error",
    category: "tw-outline-width-raw",
    suggest: () => OUTLINE_WIDTH_SUGGESTION,
    skipComments: true,
    neverExempt: true,
  },
  {
    pattern: /(?<=[\s:])outline(?=[\s"'`]|$)|(?<=["'`])outline(?=\s)/g,
    level: "error",
    category: "tw-outline-width-raw",
    suggest: () => OUTLINE_WIDTH_SUGGESTION,
    skipComments: true,
    neverExempt: true,
  },
  // outline-[2px], outline-offset-[3px] — arbitrary outline widths
  {
    pattern: /\boutline-(?:offset-)?\[([^\]]+)\]/g,
    level: "error",
    category: "tw-outline-arbitrary",
    suggest: () => OUTLINE_WIDTH_SUGGESTION,
    allowVarCalc: true,
  },
  // min-[600px]:, max-[900px]: — arbitrary viewport breakpoints. The
  // responsive prefixes are the contract (specs/foundations/breakpoints.md);
  // container queries (@min-[…]:) have their own scale and are not matched.
  {
    pattern: /(?<![@\w-])(?:min|max)-\[([^\]]+)\]:/g,
    level: "error",
    category: "tw-breakpoint-arbitrary",
    suggest: () => "sm: / md: / lg: (or max-md: …) — breakpoint.* tokens",
  },
  // border-[Xpx], border-t-[X], divide-x-[X] — arbitrary border widths.
  // A plain `border` reads --border-width-default through the @theme bridge;
  // any other width is a border-width.* token (e.g. border-chart-indicator).
  {
    pattern: /\b(?:border(?:-[xytrbse])?|divide-[xy])-\[([^\]]+)\]/g,
    level: "error",
    category: "tw-border-width-arbitrary",
    suggest: () =>
      "border (border-width.default) or a border-width.* utility such as border-chart-indicator",
    allowVarCalc: true,
  },
  // border-2, divide-y-4 — Tailwind's bare numbers are pixel widths written
  // in the component. border-0 is a reset and stays allowed.
  {
    pattern: /\b(?:border(?:-[xytrbse])?|divide-[xy])-([1-9]\d*)(?![\w.-])/g,
    level: "error",
    category: "tw-border-width-arbitrary",
    suggest: () =>
      "border (border-width.default) or a border-width.* utility such as border-chart-indicator",
  },
  // The v4 parenthesis form: border-(length:3px). Reading a custom property,
  // border-(--color-border) or border-(length:--x), is left alone.
  {
    pattern:
      /\b(?:border(?:-[xytrbse])?|divide-[xy])-\((?![a-z-]*:?--)(?:[a-z-]+:)?([^)]+)\)/g,
    level: "error",
    category: "tw-border-width-arbitrary",
    suggest: () =>
      "border (border-width.default) or a border-width.* utility such as border-chart-indicator",
    allowVarCalc: true,
  },
  // rounded-[Xpx] arbitrary border radius (except inherit)
  {
    pattern: /\brounded(?:-[a-z]+)?-\[([^\]]+)\]/g,
    level: "error",
    category: "tw-radius-arbitrary",
    suggest: () => "rounded-xs / rounded-sm / rounded-md / rounded-lg",
    allowVarCalc: true,
  },
  // text-[size] with px/rem/em — arbitrary font sizes
  {
    pattern: /\btext-\[(\d+(?:\.\d+)?(?:px|rem|em))\]/g,
    level: "error",
    category: "tw-text-arbitrary",
    suggest: () => "text-xs / text-sm / text-base / text-lg (use scale)",
  },
  // shadow-[...] arbitrary shadows
  {
    pattern: /\bshadow-\[([^\]]+)\]/g,
    level: "error",
    category: "tw-shadow-arbitrary",
    suggest: () => "shadow-sm / shadow-md / shadow-lg / ring-1 ring-*",
    allowVarCalc: true,
  },
  // Arbitrary spacing values: p-[X], m-[X], w-[X], h-[X], gap-[X], etc.
  {
    pattern:
      /\b(?:p|px|py|pt|pb|pl|pr|ps|pe|m|mx|my|mt|mb|ml|mr|ms|me|w|h|min-w|max-w|min-h|max-h|gap|gap-x|gap-y|top|bottom|left|right|inset|inset-x|inset-y|grid-cols|grid-rows|basis|size|translate-x|translate-y)-\[([^\]]+)\]/g,
    level: "error",
    category: "tw-spacing-arbitrary",
    suggest: () => "Use token-based utility (check spacing scale)",
    allowVarCalc: true,
  },
]

// ---------------------------------------------------------------------------
// Scanner
// ---------------------------------------------------------------------------
interface Violation {
  file: string
  line: number
  column: number
  level: "error" | "warning"
  category: string
  raw: string
  suggestion: string
}

function hasAllowRaw(line: string): boolean {
  return /\/[/*]\s*allow-raw:/.test(line)
}

// ---------------------------------------------------------------------------
// allow-raw registry — an inline exemption is only valid if it is declared
// ---------------------------------------------------------------------------
interface RegisteredExemption {
  id: string
  file: string
  reason: string
  token_candidate: string | null
  review_after: string
}

const REGISTRY_PATH = "tokens/allow-raw.registry.json"

interface ExemptionUse {
  id: string | null
  file: string
  line: number
}

function loadRegistry(root: string): RegisteredExemption[] {
  const raw = fs.readFileSync(path.join(root, REGISTRY_PATH), "utf-8")
  const parsed = JSON.parse(raw) as { exemptions?: RegisteredExemption[] }
  return parsed.exemptions ?? []
}

/** Extracts the identifier of an `allow-raw: <id>` comment, if well formed. */
function allowRawId(line: string): string | null {
  const match = line.match(/allow-raw:\s*([a-z0-9-]+)/)
  return match ? match[1] : null
}

/**
 * Cross-checks inline exemptions against the registry. Three failure modes:
 * an exemption used but never declared, a declared exemption no longer used
 * (dead entry), and a declared exemption whose review date has passed.
 */
function auditRegistry(
  registry: RegisteredExemption[],
  uses: ExemptionUse[],
  today: Date
): string[] {
  const problems: string[] = []
  const declared = new Set(registry.map((e) => `${e.id}@${e.file}`))
  const used = new Set<string>()

  for (const use of uses) {
    if (!use.id) {
      problems.push(
        `${use.file}:${use.line} — malformed exemption. Expected \`allow-raw: <id> — <reason>\` with a kebab-case id declared in ${REGISTRY_PATH}.`
      )
      continue
    }

    const key = `${use.id}@${use.file}`
    used.add(key)

    if (!declared.has(key)) {
      problems.push(
        `${use.file}:${use.line} — exemption \`${use.id}\` is not declared for this file in ${REGISTRY_PATH}. Add an entry with a reason, a token_candidate and a review_after date.`
      )
    }
  }

  for (const entry of registry) {
    const key = `${entry.id}@${entry.file}`

    if (!used.has(key)) {
      problems.push(
        `${REGISTRY_PATH} — exemption \`${entry.id}\` declared for ${entry.file} is no longer used in the code. Remove the entry.`
      )
      continue
    }

    const reviewDate = new Date(entry.review_after)
    if (Number.isNaN(reviewDate.getTime())) {
      problems.push(
        `${REGISTRY_PATH} — exemption \`${entry.id}\` (${entry.file}) has an invalid review_after: "${entry.review_after}". Expected YYYY-MM-DD.`
      )
    } else if (reviewDate < today) {
      const candidate = entry.token_candidate
        ? ` Token candidate: ${entry.token_candidate}.`
        : ""
      problems.push(
        `${REGISTRY_PATH} — exemption \`${entry.id}\` (${entry.file}) was due for review on ${entry.review_after}. Re-justify it and push the date, or remove the exemption.${candidate}`
      )
    }
  }

  return problems
}

/** A comment continuation line, e.g. the 2nd line of a multi-line rationale. */
function isCommentLine(line: string): boolean {
  return /^\s*(?:\/\/|\/\*|\*)/.test(line)
}

/**
 * An `allow-raw` comment covers its own line and the code line it directly
 * introduces — walking back only across contiguous comment lines, so a
 * multi-line rationale still works.
 *
 * The previous implementation scanned 5 lines back unconditionally, which
 * silently exempted unrelated code further down the file.
 */
function isExempt(lines: string[], index: number): boolean {
  if (hasAllowRaw(lines[index])) return true

  for (let i = index - 1; i >= 0; i--) {
    if (hasAllowRaw(lines[i])) return true
    if (!isCommentLine(lines[i])) return false
  }

  return false
}

/**
 * An arbitrary value is free only when it *reads* a design decision without
 * making one.
 *
 * Reading is free: `[var(--sidebar-width)]`, `[var(--space-scale-4)]`, `[50%]`. The
 * value comes from the token layer, and changing the token changes the
 * component.
 *
 * Arithmetic is a decision: `calc(var(--x) + 2px)`, `calc(100% - var(--y))`,
 * `calc(var(--space-scale-72) - var(--space-scale-9))` all encode a relationship invented in
 * the component, which no token can express and no agent can discover. Those
 * must be justified by a registered `allow-raw`, whatever they are built from.
 *
 * This is stricter than "contains var() or calc()", which passed every
 * expression in the codebase as long as a token appeared somewhere inside it.
 */
function isPureTokenRead(bracketContent: string): boolean {
  const value = bracketContent.trim()

  // A literal length is never a token read.
  if (/(?<![\w.-])\d+(?:\.\d+)?(?:px|rem|em)\b/.test(value)) return false

  // Arithmetic anywhere - including inside calc() - is a decision, not a read.
  if (/\bcalc\(/.test(value)) return false
  if (/[+*/]/.test(value)) return false
  if (/\S\s*-\s+|\s+-\s*\S/.test(value)) return false

  // A single token read. Tailwind's --spacing() helper no longer compiles:
  // the spacing scale is locked (styles/globals.css).
  const tokenRead = /^var\(--[\w-]+\)$/
  if (tokenRead.test(value)) return true

  // A bare percentage is relative to the parent box, not a design value.
  if (/^\d+(?:\.\d+)?%$/.test(value)) return true

  // Grid/flex track lists built only from intrinsic keywords and fr units
  // describe structure, not size: grid-cols-[auto_1fr], grid-rows-[auto_auto].
  const intrinsicTrack =
    /^(?:auto|min-content|max-content|\d+(?:\.\d+)?fr)(?:[_\s]+(?:auto|min-content|max-content|\d+(?:\.\d+)?fr))*$/
  if (intrinsicTrack.test(value)) return true

  return false
}

/** Check if a match is inside a className-like context (string literal or template literal) */
function isInClassName(line: string, matchIndex: number): boolean {
  // Heuristic: check if there's a quote or backtick before the match on the same line
  const before = line.substring(0, matchIndex)
  const lastQuote = Math.max(
    before.lastIndexOf('"'),
    before.lastIndexOf("'"),
    before.lastIndexOf("`")
  )
  return lastQuote >= 0
}

function scanFile(filePath: string): {
  violations: Violation[]
  uses: ExemptionUse[]
} {
  const content = fs.readFileSync(filePath, "utf-8")
  const lines = content.split("\n")
  const violations: Violation[] = []
  const uses: ExemptionUse[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (hasAllowRaw(line)) {
      uses.push({ id: allowRawId(line), file: filePath, line: i + 1 })
    }

    for (const rule of STRICT_RULES) {
      for (const match of line.matchAll(rule.pattern)) {
        violations.push({
          file: filePath,
          line: i + 1,
          column: match.index + 1,
          level: rule.level,
          category: rule.category,
          raw: match[0],
          suggestion: rule.suggest(match[0]),
        })
      }
    }

    const exempt = isExempt(lines, i)

    // CSS property rules — apply everywhere
    for (const rule of exempt ? [] : CSS_RULES) {
      const regex = new RegExp(rule.pattern.source, rule.pattern.flags)
      let match: RegExpExecArray | null
      while ((match = regex.exec(line)) !== null) {
        violations.push({
          file: filePath,
          line: i + 1,
          column: match.index + 1,
          level: rule.level,
          category: rule.category,
          raw: match[0],
          suggestion: rule.suggest(match[0]),
        })
      }
    }

    // Tailwind utility rules — only in className-like contexts
    for (const rule of TW_RULES) {
      if (!rule.neverExempt && exempt) continue
      const regex = new RegExp(rule.pattern.source, rule.pattern.flags)
      let match: RegExpExecArray | null
      while ((match = regex.exec(line)) !== null) {
        // Skip z-0 (valid reset)
        if (rule.category === "tw-zindex") {
          const num = parseInt(match[1], 10)
          if (num === 0) continue
        }

        // Skip duration-0 (valid reset)
        if (rule.category === "tw-duration") {
          const num = parseInt(match[1], 10)
          if (num === 0) continue
        }

        if (rule.skipComments && isCommentLine(line)) continue

        // Skip when the bracket only reads a token, makes no arithmetic
        if (rule.allowVarCalc && match[1] && isPureTokenRead(match[1])) continue

        // Skip rounded-[inherit] — structural pattern
        if (rule.category === "tw-radius-arbitrary" && match[1] === "inherit")
          continue

        // Only flag if inside a className-like context
        if (!isInClassName(line, match.index)) continue

        const suggestion = rule.suggest(match[0])
        if (!suggestion) continue // e.g. z-0 returns empty

        violations.push({
          file: filePath,
          line: i + 1,
          column: match.index + 1,
          level: rule.level,
          category: rule.category,
          raw: match[0],
          suggestion,
        })
      }
    }
  }

  return { violations, uses }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const root = path.resolve(process.cwd())
  const patterns = [
    "components/**/*.{css,scss,ts,tsx}",
    "src/**/*.{css,scss,ts,tsx}",
    "hooks/**/*.{css,scss,ts,tsx}",
    "lib/**/*.{css,scss,ts,tsx}",
    "styles/**/*.{css,scss,ts,tsx}",
    "site/**/*.{css,scss,ts,tsx}",
  ]

  // `mcp-server/**` is deliberately out of scope: it emits no CSS. The hex
  // values it contains are counter-examples inside the rules served to agents
  // ("NEVER use bg-[#432dd7]") and documented token values — scanning it would
  // only produce exemptions on rule text.
  const ignorePatterns = [
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "**/*.d.ts",
    "mcp-server/**",
    "tokens/**",
    "tokens.css",
    "scripts/**",
    // The documentation site's build output.
    "site/.next/**",
    "site/out/**",
  ]

  let allFiles: string[] = []
  for (const pattern of patterns) {
    const files = await glob(pattern, {
      cwd: root,
      ignore: ignorePatterns,
      absolute: true,
    })
    allFiles = allFiles.concat(files)
  }
  allFiles = [...new Set(allFiles)]

  const allViolations: Violation[] = []
  const allUses: ExemptionUse[] = []
  for (const file of allFiles) {
    const { violations, uses } = scanFile(file)
    allViolations.push(...violations)
    for (const use of uses) {
      allUses.push({ ...use, file: path.relative(root, use.file) })
    }
  }

  const registryProblems = auditRegistry(
    loadRegistry(root),
    allUses,
    new Date()
  )

  if (registryProblems.length > 0) {
    console.log(
      `\n📋 allow-raw registry (${registryProblems.length} problem${registryProblems.length > 1 ? "s" : ""})`
    )
    for (const problem of registryProblems) {
      console.log(`  ❌ ${problem}`)
    }
  }

  const errors = allViolations.filter((v) => v.level === "error")
  const warnings = allViolations.filter((v) => v.level === "warning")

  if (allViolations.length === 0 && registryProblems.length === 0) {
    console.log(
      `✅ lint-raw-values: 0 violations found, ${allUses.length} registered exemption(s).`
    )
    process.exit(0)
  }

  // Print grouped by file
  const byFile = new Map<string, Violation[]>()
  for (const v of allViolations) {
    const rel = path.relative(root, v.file)
    if (!byFile.has(rel)) byFile.set(rel, [])
    byFile.get(rel)!.push(v)
  }

  // Sort files by violation count (densest first)
  const sortedFiles = [...byFile.entries()].sort(
    (a, b) => b[1].length - a[1].length
  )

  for (const [file, viols] of sortedFiles) {
    console.log(
      `\n📄 ${file} (${viols.length} violation${viols.length > 1 ? "s" : ""})`
    )
    for (const v of viols) {
      const icon = v.level === "error" ? "❌" : "⚠️ "
      console.log(
        `  ${icon} ${file}:${v.line}:${v.column} — [${v.category}] \`${v.raw}\` → ${v.suggestion}`
      )
    }
  }

  console.log(
    `\n📊 Summary: ${errors.length} error(s), ${warnings.length} warning(s) across ${byFile.size} file(s), ${registryProblems.length} registry problem(s).`
  )

  if (errors.length > 0 || registryProblems.length > 0) {
    console.error(
      "\n❌ Failing. Fix all raw values and registry problems before committing."
    )
    process.exit(1)
  } else {
    console.warn("\n⚠️  Warnings found. No blocking errors.")
    process.exit(0)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
