/**
 * DTCG 2025.10 conformance of tokens/*.json (`npm run tokens:lint-dtcg`).
 *
 * `tz check` on tokens/tokens.resolver.json parses and lints the default
 * permutation only: a broken reference in the dark context passed it. This
 * script runs the same parser and the same rules (terrazzo.config.ts) on every
 * permutation the resolver declares — light, then dark.
 *
 *   npx tsx scripts/lint-dtcg.ts
 */

import { loadConfig, loadTokens } from "@terrazzo/cli"
import { Logger, lintRunner, parse } from "@terrazzo/parser"

const logger = new Logger()
const { config } = await loadConfig({ cmd: "check", flags: {}, logger })
const sources = await loadTokens(config.tokens, { logger })
if (!sources?.length) throw new Error("terrazzo.config.ts names no tokens")

const parsed = await parse(sources, { config, logger, continueOnError: true })
const permutations = parsed.resolver.listPermutations?.() ?? [{}]

for (const input of permutations) {
  const label = JSON.stringify(input)
  try {
    const tokens = parsed.resolver.apply(input)
    await lintRunner({ tokens, sources: parsed.sources, config, logger })
  } catch (error) {
    console.error(`❌ lint-dtcg: permutation ${label}\n${String(error)}`)
    process.exit(1)
  }
  console.log(`✅ lint-dtcg: ${label} conforms to DTCG 2025.10`)
}
