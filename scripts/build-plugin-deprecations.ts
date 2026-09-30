/**
 * The deprecation lists `@dsaireadable/eslint-plugin` lints, written into its
 * source: a published plugin reads no repository, so what the design system has
 * deprecated travels in the package, generated from the same data as
 * `dsaireadable_get_deprecations` (tokens' `$deprecated`, components' JSDoc
 * `@deprecated`). `npm run generate-context` runs it after the context cache.
 *
 *   npx tsx scripts/build-plugin-deprecations.ts
 */

import { writeFileSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { format, resolveConfig } from "prettier"
import { loadTokens } from "../mcp-server/src/lib/dtcg.js"
import {
  collectDeprecations,
  lintLists,
} from "../mcp-server/src/lib/deprecations.js"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const TARGET = resolve(ROOT, "packages/eslint-plugin/src/deprecations.ts")

const lists = lintLists(
  collectDeprecations(ROOT, loadTokens(ROOT).tiers.semantic.tree)
)

const source = `/**
 * GENERATED — DO NOT EDIT. Written by scripts/build-plugin-deprecations.ts
 * from the tokens' \`$deprecated\` and the components' JSDoc \`@deprecated\`;
 * \`npm run generate-context\` regenerates it.
 *
 * What the design system has deprecated, and why. \`no-deprecated-imports\`
 * reads the first list: an import source (\`@/components/ui/foo\`) or one of its
 * named exports (\`@/components/ui/foo#Bar\`). \`no-deprecated-token\` reads the
 * second: a CSS variable (\`--opacity-placeholder\`) or a Tailwind class.
 */
export const DEPRECATED_IMPORTS: Record<string, string> = ${JSON.stringify(lists.imports, null, 2)}

export const DEPRECATED_TOKENS: Record<string, string> = ${JSON.stringify(lists.tokens, null, 2)}
`

writeFileSync(
  TARGET,
  await format(source, {
    ...(await resolveConfig(TARGET)),
    filepath: TARGET,
  })
)
console.log(
  `✅ build-plugin-deprecations: ${Object.keys(lists.imports).length} import(s), ${Object.keys(lists.tokens).length} token key(s) → packages/eslint-plugin/src/deprecations.ts`
)
