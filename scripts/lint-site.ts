/**
 * Lints the documentation site with the config a consuming project runs:
 * `@dsaireadable/eslint-plugin`'s `recommended` (`designSystemLinter`,
 * evals/lib/static.ts), with inline `eslint-disable` comments ignored.
 *
 * The site is built with the design system the way a product is, and it is
 * the first screen a person or an agent reads to learn it: a native
 * `<button>`, an off-system class or an inline SVG in it would teach the
 * opposite of the rules. The repository's own ESLint config (npm run lint)
 * covers the site too; this adds the consumer rules it does not run, such as
 * `no-native-interactive-elements`, and covers the specs' examples copied
 * into site/generated/, which npm run lint leaves to this script.
 *
 *   npx tsx scripts/lint-site.ts
 */

import { dirname, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { designSystemLinter } from "../evals/lib/static"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")

const eslint = designSystemLinter(ROOT, { allowInlineConfig: false })
const results = await eslint.lintFiles(["site/**/*.tsx"])

let problems = 0
for (const result of results) {
  for (const message of result.messages) {
    problems++
    console.error(
      `${relative(ROOT, result.filePath)}:${message.line}:${message.column}  ${message.ruleId ?? "parse"}  ${message.message}`
    )
  }
}

if (problems > 0) {
  console.error(
    `\n❌ lint-site: ${problems} problem(s) in site/ under the consumer config.`
  )
  process.exit(1)
}
console.log(
  `✅ lint-site: ${results.length} files of site/ pass the consumer config.`
)
