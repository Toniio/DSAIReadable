import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"

import type { Plugin } from "vite"

const SPECS_DIR = "specs/components"
const VIRTUAL_ID = "virtual:spec-examples"
const EXAMPLE_SUFFIX = ".example.tsx"

/**
 * The TSX of a spec's `## Code example` section, as written: the example
 * agents copy is the one the tests render, never a parallel fixture.
 */
export function specExample(markdown: string): string {
  const section = /^## Code example\n([\s\S]*?)(?=^## |(?![\s\S]))/m.exec(
    markdown
  )?.[1]
  const code = section && /^```tsx\n([\s\S]*?)^```/m.exec(section)?.[1]
  if (!code) throw new Error("No ```tsx block under ## Code example")
  return code
}

/**
 * Serves each spec's code example as a module. `virtual:spec-examples`
 * exports `examples`, one loader per spec, keyed by component name; each
 * loader imports `specs/components/<Name>.example.tsx`, a module that exists
 * only here, built from `specs/components/<Name>.md`.
 */
export function specExamples(): Plugin {
  let root = process.cwd()
  return {
    name: "dsaireadable:spec-examples",
    enforce: "pre",
    configResolved(config) {
      root = config.root
    },
    resolveId(id) {
      if (id === VIRTUAL_ID) return `\0${VIRTUAL_ID}`
      const file = id.startsWith(root) ? id : path.join(root, id)
      if (file.endsWith(EXAMPLE_SUFFIX)) return file
    },
    load(id) {
      if (id === `\0${VIRTUAL_ID}`) {
        const names = readdirSync(path.join(root, SPECS_DIR))
          .filter((file) => file.endsWith(".md"))
          .map((file) => file.slice(0, -".md".length))
        const loaders = names.map(
          (name) =>
            `  ${JSON.stringify(name)}: () => import(${JSON.stringify(
              `/${SPECS_DIR}/${name}${EXAMPLE_SUFFIX}`
            )}),`
        )
        return `export const examples = {\n${loaders.join("\n")}\n}\n`
      }
      if (id.endsWith(EXAMPLE_SUFFIX)) {
        const spec = id.slice(0, -EXAMPLE_SUFFIX.length) + ".md"
        this.addWatchFile(spec)
        try {
          return specExample(readFileSync(spec, "utf8"))
        } catch (error) {
          throw new Error(`${path.relative(root, spec)}: ${error}`)
        }
      }
    },
  }
}
