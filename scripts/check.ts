/**
 * Runs the CI checks locally in one call and prints only what failed.
 *
 * Every step runs even after a failure, so one run reports everything. A
 * passing step prints one line; a failing step prints the tail of its output.
 * Left to CI because they are slow or networked: `shadcn registry validate`
 * and `registry:test-install`.
 *
 *   npx tsx scripts/check.ts
 */

import { spawnSync } from "node:child_process"
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const CONTEXT_DIR = resolve(ROOT, "mcp-server/context")
const TAIL = 60

type Result = { ok: boolean; output: string }

function run(command: string): Result {
  const result = spawnSync(`${command} 2>&1`, {
    cwd: ROOT,
    shell: true,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    env: { ...process.env, FORCE_COLOR: "0", NO_COLOR: "1" },
  })
  return { ok: result.status === 0, output: result.stdout ?? "" }
}

function snapshot(dir: string): Map<string, string> {
  const files = new Map<string, string>()
  if (!existsSync(dir)) return files
  for (const entry of readdirSync(dir, { recursive: true, encoding: "utf8" })) {
    const path = join(dir, entry)
    if (statSync(path).isFile()) files.set(entry, readFileSync(path, "utf8"))
  }
  return files
}

/** CI regenerates the MCP context and fails on any diff; same test, scoped to the context folder. */
function contextFreshness(): Result {
  const before = snapshot(CONTEXT_DIR)
  const generated = run("npm run -s generate-context")
  if (!generated.ok) return generated
  const after = snapshot(CONTEXT_DIR)
  const drifted = [...new Set([...before.keys(), ...after.keys()])].filter(
    (file) => before.get(file) !== after.get(file)
  )
  if (drifted.length === 0) return { ok: true, output: "" }
  return {
    ok: false,
    output: [
      "The context had drifted from its sources and was regenerated. Review and commit:",
      ...drifted.map((file) => `  mcp-server/context/${file}`),
    ].join("\n"),
  }
}

const STEPS: [string, () => Result][] = [
  ["tokens-validate", () => run("npm run -s tokens-validate")],
  ["typecheck:all", () => run("npm run -s typecheck:all")],
  ["lint", () => run("npm run -s lint")],
  ["lint:language", () => run("npm run -s lint:language")],
  ["prettier --check", () => run('npx prettier --check "**/*.{ts,tsx,md}"')],
  ["knip", () => run("npm run -s knip")],
  ["release:check", () => run("npm run -s release:check")],
  ["index:validate", () => run("npm run -s index:validate")],
  ["specs:validate", () => run("npm run -s specs:validate")],
  ["registry:check", () => run("npm run -s registry:check")],
  ["release:test", () => run("npm run -s release:test")],
  ["context freshness", contextFreshness],
  ["mcp:test", () => run("npm run -s mcp:test")],
  ["test:components", () => run("npm run -s test:components")],
]

const failed: string[] = []
for (const [name, step] of STEPS) {
  const start = performance.now()
  const { ok, output } = step()
  const seconds = ((performance.now() - start) / 1000).toFixed(1)
  console.log(`${ok ? "ok  " : "FAIL"}  ${name.padEnd(18)} ${seconds}s`)
  if (ok) continue
  failed.push(name)
  const lines = output.trimEnd().split("\n")
  if (lines.length > TAIL) {
    console.log(`      … ${lines.length - TAIL} earlier lines omitted`)
  }
  console.log(
    lines
      .slice(-TAIL)
      .map((line) => `      ${line}`)
      .join("\n")
  )
}

console.log(
  failed.length === 0
    ? `\nAll ${STEPS.length} checks passed.`
    : `\n${failed.length} of ${STEPS.length} checks failed: ${failed.join(", ")}`
)
process.exit(failed.length === 0 ? 0 : 1)
