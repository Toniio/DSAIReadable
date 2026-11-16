/**
 * The fonts lib/fonts.ts (lyra) and lib/fonts-nova.ts (nova) load with
 * next/font, and the typography tokens that drive them.
 *
 * next/font self-hosts the faces and adjusts their fallback metrics, which a
 * CSS variable naming a family cannot do, and it sets `--font-<face>` on
 * <html>. tokens.css reads that variable first, so the
 * `typography.font-family.*` tokens choose the face a brand renders in.
 * lint-font-tokens holds each token to the face its brand's file loads.
 */

import { readFileSync } from "node:fs"
import { resolve } from "node:path"

export const FONTS = "lib/fonts.ts"
export const NOVA_FONTS = "lib/fonts-nova.ts"

interface LoadedFont {
  /** next/font loader, e.g. `JetBrains_Mono`. */
  loader: string
  /** Family it loads: the loader's name with spaces, e.g. `JetBrains Mono`. */
  family: string
  /** CSS variable it sets, e.g. `--font-mono`; undefined when it sets none. */
  variable?: string
  /** Character subsets it loads, e.g. `["latin"]`. */
  subsets: string[]
}

export interface NextFonts {
  loaded: LoadedFont[]
  /** Loaders imported from next/font/google but never called. */
  unused: string[]
}

export function nextFontsOf(root: string, file: string = FONTS): NextFonts {
  const source = readFileSync(resolve(root, file), "utf-8")
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
      subsets: [
        ...(call[1].match(/subsets:\s*\[([^\]]*)\]/)?.[1] ?? "").matchAll(
          /"([^"]+)"/g
        ),
      ].map((m) => m[1]),
    })
  }
  return {
    loaded,
    unused: imported.filter((l) => !loaded.some((f) => f.loader === l)),
  }
}

/** First family of a font stack: `JetBrains Mono, monospace` → `JetBrains Mono`. */
export const firstFamily = (stack: string) =>
  stack
    .split(",")[0]
    .trim()
    .replace(/^["']|["']$/g, "")
