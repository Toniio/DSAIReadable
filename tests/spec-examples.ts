import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"

import type { Plugin } from "vite"

const SPECS_DIR = "specs/components"
const FOUNDATIONS_DIR = "specs/foundations"
const VIRTUAL_ID = "virtual:spec-examples"
const EXAMPLE_SUFFIX = ".example.tsx"
/** `specs/foundations/<name>.L<line>.example.tsx`: the block whose fence opens at `<line>`. */
const FOUNDATION_EXAMPLE =
  /\/specs\/foundations\/([^/]+?)\.L(\d+)\.example\.tsx$/
/** A fence that opens a code block, whatever its form. */
const ANY_FENCE = /^\s*(`{3,}|~{3,})\s*(\S*)/

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

interface FoundationBlock {
  /** The line of the opening fence, from 1. */
  line: number
  lang: "tsx" | "ts"
  code: string
}

/**
 * Every ```tsx and ```ts block of a foundation, in order. A fence is written
 * alone on its line, unindented, closed by a bare ``` — any other form of a
 * tsx or ts fence throws, so no block escapes the checks unseen.
 */
export function foundationBlocks(
  markdown: string,
  file = "the foundation"
): FoundationBlock[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n")
  const blocks: FoundationBlock[] = []
  for (let i = 0; i < lines.length; i++) {
    const fence = ANY_FENCE.exec(lines[i])
    if (!fence) continue
    const lang = fence[2].toLowerCase()
    if (lines[i] === "```tsx" || lines[i] === "```ts") {
      const end = lines.indexOf("```", i + 1)
      if (end < 0)
        throw new Error(`${file}:${i + 1}: the ${lang} block is not closed`)
      blocks.push({
        line: i + 1,
        lang: lang as FoundationBlock["lang"],
        code: `${lines.slice(i + 1, end).join("\n")}\n`,
      })
      i = end
      continue
    }
    if (/^tsx?\b/.test(lang))
      throw new Error(
        `${file}:${i + 1}: write a tsx or ts fence alone on its line, unindented: \`\`\`tsx or \`\`\`ts`
      )
    // Any other block (bash, css, plain text): skip to its closing fence.
    const close = lines.findIndex(
      (line, j) => j > i && line.trim().startsWith(fence[1])
    )
    if (close < 0) break
    i = close
  }
  return blocks
}

/**
 * A foundation block that imports what it renders and exports it by default:
 * rendered and audited like a component's example. Any other block is a
 * fragment, which scripts/lint-foundation-examples.ts lints and nothing renders.
 */
export function isCompleteModule(code: string): boolean {
  return /^import /m.test(code) && /^export default /m.test(code)
}

/**
 * Serves each spec's code example as a module. `virtual:spec-examples`
 * exports `examples`, one loader per spec, keyed by component name; each
 * loader imports `specs/components/<Name>.example.tsx`, a module that exists
 * only here, built from `specs/components/<Name>.md`. It also exports
 * `foundationExamples`, one loader per complete module of
 * `specs/foundations/*.md`, keyed `<file>.md:<line>`.
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
        const foundations = readdirSync(path.join(root, FOUNDATIONS_DIR))
          .filter((file) => file.endsWith(".md"))
          .sort()
          .flatMap((file) => {
            const source = path.join(root, FOUNDATIONS_DIR, file)
            this.addWatchFile(source)
            return foundationBlocks(
              readFileSync(source, "utf8"),
              `${FOUNDATIONS_DIR}/${file}`
            )
              .filter(
                (block) => block.lang === "tsx" && isCompleteModule(block.code)
              )
              .map(
                (block) =>
                  `  ${JSON.stringify(`${file}:${block.line}`)}: () => import(${JSON.stringify(
                    `/${FOUNDATIONS_DIR}/${file.slice(0, -".md".length)}.L${block.line}${EXAMPLE_SUFFIX}`
                  )}),`
              )
          })
        return `export const examples = {\n${loaders.join("\n")}\n}\nexport const foundationExamples = {\n${foundations.join("\n")}\n}\n`
      }
      const foundation = FOUNDATION_EXAMPLE.exec(id)
      if (foundation) {
        const [, name, line] = foundation
        const file = path.join(root, FOUNDATIONS_DIR, `${name}.md`)
        this.addWatchFile(file)
        const block = foundationBlocks(
          readFileSync(file, "utf8"),
          `${FOUNDATIONS_DIR}/${name}.md`
        ).find((b) => b.line === Number(line))
        if (!block)
          throw new Error(
            `${FOUNDATIONS_DIR}/${name}.md: no tsx block at line ${line}`
          )
        return block.code
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
