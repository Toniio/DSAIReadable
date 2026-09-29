#!/usr/bin/env tsx
/**
 * lint-token-naming.ts
 *
 * Validates every token key in the three tiers against a declarative grammar.
 *
 * The previous implementation matched a single regex,
 * `^(foundation)(\.[a-z0-9-]+){1,4}$`, which accepted any kebab-case segment
 * in any position: `color.foo.bar.baz` passed. It also never opened
 * `primitive.json`, so the private tier was unchecked.
 *
 * The grammar below is a closed table. Every foundation declares the exact
 * shapes it accepts, and every variable segment resolves to a closed enum or
 * an explicit pattern. Introducing a new role or a new state is therefore a
 * deliberate edit to this table, which is the point: the lint is a gate, not
 * a formality.
 *
 * Note on `component.json`: its keys are `shadcn.<alias>`, and the alias
 * vocabulary is dictated by upstream shadcn/ui, not by us. Segment shape is
 * checked here; that each alias resolves to a real semantic token is checked
 * from the other side by `lint-theme-bridge.ts`.
 *
 * Every tier is also held to the DTCG 2025.10 vocabulary that Terrazzo lets
 * through: a `$type` outside the Format Module (`font-weight` for
 * `fontWeight`), or a `$`-property it does not define (`$private`), is an
 * error — Terrazzo accepts both silently.
 *
 * The dark context (tokens/tokens.resolver.json) is held to the semantic
 * tier's rules: each override names an existing semantic token, keeps its
 * `$type`, carries nothing but `$type` and `$value`, and is a `{…}` reference.
 * A mode left in `$extensions.modes`, the convention the resolver replaced,
 * is an error: no DTCG tool reads it.
 *
 * Exit 1 on any invalid key.
 */

import fs from "fs"
import path from "path"
import {
  DTCG_TYPES,
  loadTokens,
  MODES,
  PRIMITIVE_ROOT,
  primitiveGroups,
  type Tokens,
} from "../mcp-server/src/lib/dtcg.js"

// ---------------------------------------------------------------------------
// Closed enums — a variable segment may only take one of these values
// ---------------------------------------------------------------------------
const ENUMS: Record<string, string[]> = {
  // Tier 1 — palettes and raw scales
  palette: [
    "mist",
    "violet",
    "green",
    "blue",
    "yellow",
    "amber",
    "plum",
    "red",
    "white-alpha",
  ],
  colorKeyword: ["black", "white", "transparent", "current"],
  mode: ["light", "dark"],
  spaceAlias: [
    "page",
    "section",
    "content",
    "content-sm",
    "content-lg",
    "sidebar",
    "sidebar-mobile",
    "focus-ring-width",
  ],
  /** Tier 1 carries `base` plus every step resolved from it (see P1-04). */
  radiusPrimitive: [
    "none",
    "base",
    "xs",
    "sm",
    "md",
    "lg",
    "xl",
    "2xl",
    "3xl",
    "4xl",
    "full",
  ],

  // Tier 2 — semantic roles
  emphasis: ["default", "subtle", "bold", "elevated", "inverse"],
  /** Closed state enum. A state is never fused into a role segment. */
  state: ["hover", "active", "focus", "disabled", "selected"],
  /** Foreground relationship: the color that sits *on* a surface. */
  onSurface: ["default", "on", "foreground"],
  textRole: ["action", "destructive"],
  borderRole: ["default", "subtle", "input", "focus"],
  iconRole: ["default", "subtle", "action"],
  feedbackRole: ["error", "success", "warning", "info"],
  /** Colors that ignore the mode — shadcn's bg-white / bg-black. */
  staticColor: ["white", "black"],
  sidebarSurface: ["background", "foreground", "border", "ring"],
  sidebarRole: ["primary", "accent"],
  elevationSize: ["xs", "sm", "md", "lg", "xl", "2xl", "inner"],
  radiusSize: [
    "none",
    "xs",
    "sm",
    "md",
    "lg",
    "xl",
    "2xl",
    "3xl",
    "4xl",
    "full",
  ],
  componentSize: ["xs", "sm", "md", "lg", "xl"],
  layoutName: [
    "page-padding",
    "section-gap",
    "content-sm",
    "content-default",
    "content-lg",
    "sidebar",
    "sidebar-mobile",
    "sidebar-icon",
  ],
  opacityRole: ["disabled", "placeholder", "overlay"],
  /** Tailwind's responsive variants — the only breakpoints there are. */
  breakpoint: ["sm", "md", "lg", "xl", "2xl"],
  borderWidthRole: ["default", "chart-indicator", "separation"],
  zLayer: [
    "dropdown",
    "sticky",
    "fixed",
    "overlay",
    "modal",
    "popover",
    "tooltip",
    "toast",
  ],

  // Shared across tiers
  durationName: ["instant", "fast", "normal", "slow", "slower", "extra-slow"],
  easingName: ["default", "in", "out", "spring"],
  fontFamily: ["sans", "mono", "serif"],
  fontWeight: ["normal", "medium", "semibold", "bold"],
  letterSpacing: ["tight", "normal", "wide", "wider"],
  lineHeight: ["tight", "snug", "normal", "relaxed", "loose"],
  typeScale: ["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl"],
}

// ---------------------------------------------------------------------------
// Pattern-backed segments — open numeric scales
// ---------------------------------------------------------------------------
const PATTERNS: Record<string, { pattern: RegExp; label: string }> = {
  paletteStep: { pattern: /^\d{1,3}$/, label: "numeric step 0–950" },
  spaceStep: {
    pattern: /^\d+(?:-\d+)?$/,
    label: "numeric step, halves written with a dash (0-5, 1, 24)",
  },
  widthStep: {
    pattern: /^\d+(?:-\d+)?$/,
    label: "width in px, halves written with a dash (1, 1-5)",
  },
  opacityStep: {
    pattern: /^0-\d{2}$/,
    label: "two-digit hundredth (0-05, 0-50)",
  },
  chartIndex: { pattern: /^\d{1,2}$/, label: "1-based chart series index" },
  shadcnAlias: {
    pattern: /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/,
    label: "kebab-case shadcn/ui variable name",
  },
}

// ---------------------------------------------------------------------------
// Grammar — foundation → accepted shapes, per tier
//
// A shape is written as dot-separated segments. `<name>` is a variable
// segment resolved against ENUMS or PATTERNS; anything else is a literal.
// ---------------------------------------------------------------------------
type Grammar = Record<string, string[]>

const TYPOGRAPHY_SHAPES = [
  "typography.font-family.<fontFamily>",
  "typography.font-weight.<fontWeight>",
  "typography.letter-spacing.<letterSpacing>",
  "typography.line-height.<lineHeight>",
  "typography.size.<typeScale>",
]

const MOTION_SHAPES = [
  "motion.duration.<durationName>",
  "motion.easing.<easingName>",
]

const PRIMITIVE_GRAMMAR: Grammar = {
  "border-width": ["border-width.<widthStep>"],
  breakpoint: ["breakpoint.<breakpoint>"],
  color: ["color.<palette>.<paletteStep>", "color.<colorKeyword>"],
  elevation: ["elevation.<mode>.<elevationSize>"],
  motion: MOTION_SHAPES,
  opacity: ["opacity.<opacityStep>"],
  radius: ["radius.<radiusPrimitive>"],
  space: ["space.<spaceStep>", "space.<spaceAlias>"],
  typography: TYPOGRAPHY_SHAPES,
  zindex: ["zindex.<zLayer>"],
}

const SEMANTIC_GRAMMAR: Grammar = {
  "border-width": ["border-width.<borderWidthRole>"],
  breakpoint: ["breakpoint.<breakpoint>"],
  color: [
    "color.background.<emphasis>",
    "color.text.<emphasis>",
    "color.text.<textRole>.<onSurface>",
    "color.border.<borderRole>",
    "color.icon.<iconRole>",
    "color.action.background.<onSurface>",
    "color.action.background.<state>",
    "color.feedback.<feedbackRole>.<onSurface>",
    "color.feedback.<feedbackRole>.<emphasis>",
    "color.chart.<chartIndex>",
    "color.chart.sequential.<chartIndex>",
    "color.static.<staticColor>",
    "color.sidebar.<sidebarSurface>",
    "color.sidebar.<sidebarRole>.<onSurface>",
  ],
  elevation: ["elevation.<elevationSize>"],
  motion: MOTION_SHAPES,
  opacity: ["opacity.<opacityRole>"],
  radius: ["radius.<radiusSize>"],
  space: [
    "space.component.<componentSize>",
    "space.layout.<layoutName>",
    "space.focus-ring-width",
  ],
  typography: TYPOGRAPHY_SHAPES,
  zindex: ["zindex.<zLayer>"],
}

const COMPONENT_GRAMMAR: Grammar = {
  shadcn: ["shadcn.<shadcnAlias>"],
}

// ---------------------------------------------------------------------------
// Fused role+state segments — rejected with a dedicated message
// ---------------------------------------------------------------------------
const FUSED_STATE_SEGMENTS = [
  /-hover(ed)?$/,
  /-focus(ed)?$/,
  /-active(d)?$/,
  /-pressed$/,
  /-selected$/,
  /-checked$/,
  /-disabled$/,
  /-indeterminate$/,
]

// ---------------------------------------------------------------------------
// Shape matching
// ---------------------------------------------------------------------------
function segmentMatches(segment: string, spec: string): boolean {
  if (!spec.startsWith("<")) return segment === spec

  const name = spec.slice(1, -1)
  const values = ENUMS[name]
  if (values) return values.includes(segment)

  const pattern = PATTERNS[name]
  if (pattern) return pattern.pattern.test(segment)

  throw new Error(`Grammar references unknown segment type <${name}>`)
}

function shapeMatches(key: string, shape: string): boolean {
  const segments = key.split(".")
  const specs = shape.split(".")
  if (segments.length !== specs.length) return false
  return segments.every((segment, i) => segmentMatches(segment, specs[i]))
}

/** Human-readable expansion of a shape, used in error messages. */
function describeShape(shape: string): string {
  return shape
    .split(".")
    .map((spec) => {
      if (!spec.startsWith("<")) return spec
      const name = spec.slice(1, -1)
      const values = ENUMS[name]
      if (values) return `{${values.join("|")}}`
      const pattern = PATTERNS[name]
      return pattern ? `{${pattern.label}}` : spec
    })
    .join(".")
}

// ---------------------------------------------------------------------------
// Flatten nested JSON to dot-notation keys (skip DTCG meta-keys)
// ---------------------------------------------------------------------------
/** The `$`-properties the DTCG Format Module 2025.10 defines on a token. */
const DTCG_META_KEYS = new Set([
  "$value",
  "$type",
  "$description",
  "$extensions",
  "$deprecated",
])
/** On a group, `$value` excepted. */
const DTCG_GROUP_KEYS = new Set(
  [...DTCG_META_KEYS].filter((key) => key !== "$value")
)

function flattenKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  const keys: string[] = []
  for (const [key, value] of Object.entries(obj)) {
    if (DTCG_META_KEYS.has(key)) continue
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const child = value as Record<string, unknown>
      if ("$value" in child) {
        keys.push(fullKey)
      } else {
        keys.push(...flattenKeys(child, fullKey))
      }
    }
  }
  return keys
}

// ---------------------------------------------------------------------------
// Validate a single key against a grammar
// ---------------------------------------------------------------------------
interface KeyError {
  key: string
  reason: string
}

/**
 * A value of Tiers 2 and 3, or of a mode override, that is not a `{…}`
 * reference. A literal there means a design decision was duplicated instead
 * of pointing at the tier below.
 */
function literalError(
  key: string,
  label: string,
  value: unknown
): KeyError | null {
  if (typeof value === "string" && /^\{[^{}]+\}$/.test(value.trim()))
    return null
  const literal = typeof value === "string" ? value : JSON.stringify(value)
  return {
    key,
    reason: `${label} is the literal ${literal}, not a {…} reference. Move the value into tokens/primitive.json and alias it here.`,
  }
}

/** Tiers 2 and 3 are alias layers: every value must be a `{…}` reference. */
function checkReferencePurity(
  obj: Record<string, unknown>,
  prefix = ""
): KeyError[] {
  const errors: KeyError[] = []

  for (const [key, value] of Object.entries(obj)) {
    if (DTCG_META_KEYS.has(key)) continue
    if (!value || typeof value !== "object" || Array.isArray(value)) continue

    const child = value as Record<string, unknown>
    const fullKey = prefix ? `${prefix}.${key}` : key

    if (!("$value" in child)) {
      errors.push(...checkReferencePurity(child, fullKey))
      continue
    }

    const error = literalError(fullKey, "$value", child.$value)
    if (error) errors.push(error)
  }

  return errors
}

/**
 * Modes belong to tokens/tokens.resolver.json. `$extensions.modes`, on a
 * token or a group, is the house convention it replaced.
 */
function checkNoExtensionModes(
  obj: Record<string, unknown>,
  prefix = ""
): KeyError[] {
  const errors: KeyError[] = []
  const ext = obj.$extensions as Record<string, unknown> | undefined
  if (ext && "modes" in ext)
    errors.push({
      key: prefix || "(root)",
      reason: `$extensions.modes is not read any more: a mode's value goes in the file its context names in tokens/tokens.resolver.json (dark: tokens/semantic.dark.json).`,
    })
  for (const [key, value] of Object.entries(obj))
    if (!key.startsWith("$") && value && typeof value === "object")
      errors.push(
        ...checkNoExtensionModes(
          value as Record<string, unknown>,
          prefix ? `${prefix}.${key}` : key
        )
      )
  return errors
}

/** Each override of a mode context redefines the value of a semantic token. */
function checkOverrides(tokens: Tokens): KeyError[] {
  const semantic = tokens.tiers.semantic.tree
  const errors: KeyError[] = []
  const lookup = (path: string) => {
    let node: unknown = semantic
    for (const seg of path.split(".")) {
      if (!node || typeof node !== "object") return undefined
      node = (node as Record<string, unknown>)[seg]
    }
    return node && typeof node === "object" && "$value" in node
      ? {
          $type: (node as Record<string, unknown>).$type,
          $value: (node as Record<string, unknown>).$value,
        }
      : undefined
  }
  for (const mode of MODES)
    for (const [key, override] of tokens.overrides[mode]) {
      const where = `${override.file} → ${key}`
      const target = lookup(key)
      if (!target) {
        errors.push({
          key: where,
          reason: `The ${mode} context overrides a token tokens/semantic.json does not define. A mode changes the value of a semantic token; it never adds one.`,
        })
        continue
      }
      if (override.$type !== target.$type)
        errors.push({
          key: where,
          reason: `$type "${String(override.$type)}" differs from the semantic token's "${String(target.$type)}".`,
        })
      const error = literalError(where, `mode "${mode}"`, override.$value)
      if (error) errors.push(error)
      if (key.startsWith("color.static."))
        errors.push({
          key: where,
          reason: `color.static.* never has an override: these colors ignore the mode by definition. Remove it.`,
        })
      else if (
        JSON.stringify(override.$value) === JSON.stringify(target.$value)
      )
        errors.push({
          key: where,
          reason: `The ${mode} context repeats the value of tokens/semantic.json. Remove it: the mode already inherits the default value, and a frozen copy diverges when that value changes.`,
        })
    }
  return errors
}

/** The keys of an override file: `$type` and `$value` on each token, no more. */
function checkOverrideKeys(
  obj: Record<string, unknown>,
  prefix = ""
): KeyError[] {
  const errors: KeyError[] = []
  const isToken = "$value" in obj
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith("$")) {
      if (!isToken || (key !== "$type" && key !== "$value"))
        errors.push({
          key: prefix || "(root)",
          reason: `"${key}" does not belong in an override: it carries $type and $value only; the description, status and docs stay on the token in tokens/semantic.json.`,
        })
      continue
    }
    if (!isToken && value && typeof value === "object" && !Array.isArray(value))
      errors.push(
        ...checkOverrideKeys(
          value as Record<string, unknown>,
          prefix ? `${prefix}.${key}` : key
        )
      )
  }
  return errors
}

/**
 * DTCG 2025.10 vocabulary: every `$`-property is one the Format Module
 * defines, and every `$type` one of its types.
 */
function checkDtcgVocabulary(
  obj: Record<string, unknown>,
  prefix = ""
): KeyError[] {
  const errors: KeyError[] = []
  const isToken = "$value" in obj
  const allowed = isToken ? DTCG_META_KEYS : DTCG_GROUP_KEYS
  const where = prefix || "(root)"

  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith("$")) {
      if (!allowed.has(key))
        errors.push({
          key: where,
          reason: `"${key}" is not a DTCG 2025.10 ${isToken ? "token" : "group"} property. Allowed: ${[...allowed].join(", ")}; anything else goes under $extensions.`,
        })
      if (key === "$type" && !DTCG_TYPES.has(value as string))
        errors.push({
          key: where,
          reason: `$type "${String(value)}" is not a DTCG 2025.10 type. Expected one of: ${[...DTCG_TYPES].join(", ")}.`,
        })
      continue
    }
    if (!isToken && value && typeof value === "object" && !Array.isArray(value))
      errors.push(
        ...checkDtcgVocabulary(
          value as Record<string, unknown>,
          prefix ? `${prefix}.${key}` : key
        )
      )
  }
  return errors
}

function validateKey(key: string, grammar: Grammar): KeyError | null {
  const segments = key.split(".")
  const foundation = segments[0]
  const shapes = grammar[foundation]

  if (!shapes) {
    return {
      key,
      reason: `Unknown foundation "${foundation}". Allowed in this tier: ${Object.keys(
        grammar
      )
        .sort()
        .join(", ")}.`,
    }
  }

  for (const segment of segments.slice(1)) {
    for (const fused of FUSED_STATE_SEGMENTS) {
      if (fused.test(segment)) {
        return {
          key,
          reason: `Segment "${segment}" fuses a role and a state. Split them into separate segments. Valid states: ${ENUMS.state.join(
            ", "
          )}.`,
        }
      }
    }
  }

  if (shapes.some((shape) => shapeMatches(key, shape))) return null

  const sameDepth = shapes.filter(
    (shape) => shape.split(".").length === segments.length
  )
  const candidates = sameDepth.length > 0 ? sameDepth : shapes

  return {
    key,
    reason: `No declared shape accepts this key. Expected one of:\n       ${candidates
      .map(describeShape)
      .join("\n       ")}`,
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
interface TierSpec {
  file: string
  grammar: Grammar
  label: string
  /** Tiers above the primitive layer may only hold `{…}` references. */
  referencesOnly: boolean
  /** Tier 1 nests its foundations under the `primitive` group. */
  primitiveRoot?: boolean
}

function report(
  rel: string,
  errors: KeyError[],
  keyCount: number,
  label: string
) {
  if (errors.length === 0) {
    console.log(`✅ ${rel} — ${keyCount} keys, all valid (${label})`)
    return
  }
  console.log(`❌ ${rel} — ${errors.length} problem(s) in ${keyCount} keys`)
  for (const e of errors) {
    console.log(`   • ${e.key}`)
    console.log(`     ${e.reason}`)
  }
}

function main() {
  const root = process.cwd()
  const tiers: TierSpec[] = [
    {
      file: path.join(root, "tokens", "primitive.json"),
      grammar: PRIMITIVE_GRAMMAR,
      label: "Tier 1 — primitive, private",
      referencesOnly: false,
      primitiveRoot: true,
    },
    {
      file: path.join(root, "tokens", "semantic.json"),
      grammar: SEMANTIC_GRAMMAR,
      label: "Tier 2 — semantic",
      referencesOnly: true,
    },
    {
      file: path.join(root, "tokens", "component.json"),
      grammar: COMPONENT_GRAMMAR,
      label: "Tier 3 — component aliases",
      referencesOnly: true,
    },
  ]

  let totalKeys = 0
  let totalErrors = 0

  for (const tier of tiers) {
    if (!fs.existsSync(tier.file)) {
      console.error(`❌ File not found: ${tier.file}`)
      totalErrors++
      continue
    }

    const file = JSON.parse(fs.readFileSync(tier.file, "utf-8")) as Record<
      string,
      unknown
    >
    // The primitives sit under one `primitive` group; the grammar starts
    // below it, at the foundation.
    const data = tier.primitiveRoot ? primitiveGroups(file) : file
    const keys = flattenKeys(data)
    const errors = keys
      .map((key) => validateKey(key, tier.grammar))
      .filter((e): e is KeyError => e !== null)
    errors.push(...checkDtcgVocabulary(file))
    if (tier.primitiveRoot)
      for (const key of Object.keys(file))
        if (!key.startsWith("$") && key !== PRIMITIVE_ROOT)
          errors.push({
            key,
            reason: `tokens/primitive.json holds a single "${PRIMITIVE_ROOT}" group; move "${key}" under it.`,
          })

    if (tier.referencesOnly) errors.push(...checkReferencePurity(data))
    errors.push(...checkNoExtensionModes(file))

    totalKeys += keys.length
    totalErrors += errors.length

    report(path.relative(root, tier.file), errors, keys.length, tier.label)
  }

  // The mode contexts of tokens/tokens.resolver.json.
  const tokens = loadTokens(root)
  const overrideFiles = new Set(
    MODES.flatMap((mode) =>
      [...tokens.overrides[mode].values()].map((o) => o.file)
    )
  )
  for (const file of overrideFiles) {
    const data = JSON.parse(
      fs.readFileSync(path.join(root, file), "utf-8")
    ) as Record<string, unknown>
    const keys = flattenKeys(data)
    const errors = [
      ...keys
        .map((key) => validateKey(key, SEMANTIC_GRAMMAR))
        .filter((e): e is KeyError => e !== null),
      ...checkOverrideKeys(data),
      ...checkNoExtensionModes(data),
    ]
    totalKeys += keys.length
    totalErrors += errors.length
    report(file, errors, keys.length, "Tier 2 — mode overrides")
  }
  const overrideErrors = checkOverrides(tokens)
  totalErrors += overrideErrors.length
  if (overrideErrors.length > 0) report("mode overrides", overrideErrors, 0, "")

  console.log(
    `\n📊 Summary: ${totalErrors} error(s) in ${totalKeys} keys across ${tiers.length} tier(s) and ${overrideFiles.size} mode file(s).`
  )

  if (totalErrors > 0) {
    console.error(
      "\n❌ Token validation failed. Fix the keys, or extend the grammar table in scripts/lint-token-naming.ts if the new shape is deliberate."
    )
    process.exit(1)
  }

  console.log(
    "\n✅ All token keys conform to the declared grammar, and both alias tiers hold references only."
  )
  process.exit(0)
}

main()
