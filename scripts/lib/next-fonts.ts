/**
 * The fonts lib/fonts.ts loads with next/font, and the typography tokens
 * that describe them.
 *
 * The typefaces are loaded by next/font, not by the tokens: it self-hosts
 * them and adjusts their fallback metrics, which a CSS variable naming a
 * family cannot do. So `typography.font-family.<key>` does not drive the
 * font — it describes the family next/font loads under `--font-<key>`, and
 * lint-font-tokens holds it to that. Loaded that way, a font-family token
 * counts as consumed for lint-token-lifecycle.
 */

import { readFileSync } from "node:fs"
import { resolve } from "node:path"

export const FONTS = "lib/fonts.ts"

export interface LoadedFont {
  /** next/font loader, e.g. `JetBrains_Mono`. */
  loader: string
  /** Family it loads: the loader's name with spaces, e.g. `JetBrains Mono`. */
  family: string
  /** CSS variable it sets, e.g. `--font-mono`; undefined when it sets none. */
  variable?: string
}

export interface NextFonts {
  loaded: LoadedFont[]
  /** Loaders imported from next/font/google but never called. */
  unused: string[]
}

export function nextFontsOf(root: string): NextFonts {
  const source = readFileSync(resolve(root, FONTS), "utf-8")
  const imported = [
    ...(
      source.match(/import\s*\{([^}]*)\}\s*from\s*"next\/font\/google"/)?.[1] ??
      ""
    ).split(","),
  ]
    .map((s) => s.trim())
    .filter(Boolean)

  const loaded: LoadedFont[] = []
  for (const loader of imported) {
    const call = source.match(
      new RegExp(`=\\s*${loader}\\(\\s*\\{([\\s\\S]*?)\\}\\s*\\)`)
    )
    if (!call) continue
    loaded.push({
      loader,
      family: loader.replace(/_/g, " "),
      variable: call[1].match(/variable:\s*"([^"]+)"/)?.[1],
    })
  }
  return {
    loaded,
    unused: imported.filter((l) => !loaded.some((f) => f.loader === l)),
  }
}

/** `typography.font-family.mono` → `--font-mono`. */
export const fontVariableOf = (tokenPath: string) =>
  tokenPath.match(/^typography\.font-family\.([\w-]+)$/)?.[1]
    ? `--font-${tokenPath.split(".").pop()}`
    : undefined

/** First family of a font stack: `JetBrains Mono, monospace` → `JetBrains Mono`. */
export const firstFamily = (stack: string) =>
  stack
    .split(",")[0]
    .trim()
    .replace(/^["']|["']$/g, "")
