#!/usr/bin/env tsx
/**
 * Package test: the server a consumer gets from npm starts from a blank folder.
 *
 * `npm pack` builds the package, exactly as `npm publish` would; this test then
 *
 *   ① reads the file list of the tarball: `dist/` and `context/` only, no test,
 *      no generator, no agent file, and no `tsx` among the runtime dependencies;
 *   ② runs the tarball through `npx` from an empty folder, outside this
 *      repository, and talks to it over stdio: `initialize`, `tools/list`, then
 *      one call that has to read the context cache from the installed package.
 *
 * It installs the package's dependencies from the npm registry, so it needs
 * the network.
 *
 *   npx tsx src/test-package.ts
 */

import { spawnSync } from "node:child_process"
import { mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { Client } from "@modelcontextprotocol/client"
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio"

const PACKAGE = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const manifest = JSON.parse(
  readFileSync(join(PACKAGE, "package.json"), "utf-8")
) as {
  version: string
  bin: Record<string, string>
  dependencies: Record<string, string>
}

const failures: string[] = []
function expect(ok: boolean, what: string) {
  console.log(`${ok ? "ok  " : "FAIL"}  ${what}`)
  if (!ok) failures.push(what)
}

const tmp = mkdtempSync(join(tmpdir(), "dsai-package-"))
try {
  // ① the tarball
  const packed = spawnSync(
    "npm",
    ["pack", "--json", "--pack-destination", tmp],
    { cwd: PACKAGE, encoding: "utf8" }
  )
  if (packed.status !== 0) {
    throw new Error(`npm pack failed:\n${packed.stdout}${packed.stderr}`)
  }
  const [{ filename, files }] = JSON.parse(packed.stdout) as [
    { filename: string; files: { path: string }[] },
  ]
  const paths = files.map((file) => file.path)
  const outside = paths.filter(
    (path) =>
      !/^(dist|context)\//.test(path) &&
      !["package.json", "README.md", "LICENSE"].includes(path)
  )
  expect(
    outside.length === 0,
    `the tarball holds dist/ and context/ only${outside.length ? ` (also: ${outside.join(", ")})` : ""}`
  )
  const unwanted = paths.filter((path) =>
    /(^|\/)(test|test-package|generate|dtcg)\.js$|AGENTS|CLAUDE|\.ts$/.test(
      path
    )
  )
  expect(
    unwanted.length === 0,
    `no test, generator, agent file or TypeScript source${unwanted.length ? ` (found: ${unwanted.join(", ")})` : ""}`
  )
  expect(
    paths.includes(manifest.bin["dsaireadable-mcp"]) &&
      paths.filter((path) => /^context\/.+\.json$/.test(path)).length >= 16,
    "the bin and the 16 context files are in the tarball"
  )
  expect(
    !("tsx" in manifest.dependencies) &&
      !("typescript" in manifest.dependencies),
    "tsx and typescript are not runtime dependencies"
  )

  // ② the tarball, run the way a consumer runs it
  const empty = join(tmp, "empty")
  mkdirSync(empty)
  const client = new Client({ name: "package-test", version: "0.0.0" })
  const transport = new StdioClientTransport({
    command: "npx",
    args: ["--yes", "--package", join(tmp, filename), "dsaireadable-mcp"],
    cwd: empty,
    env: Object.fromEntries(
      Object.entries(process.env).filter(
        (entry): entry is [string, string] => typeof entry[1] === "string"
      )
    ),
  })
  try {
    await client.connect(transport, { timeout: 300_000 })
    expect(
      client.getServerVersion()?.version === manifest.version,
      `initialize answers with the package version, ${manifest.version}`
    )
    const { tools } = await client.listTools()
    expect(
      tools.length > 0 &&
        tools.every((t) => t.name.startsWith("dsaireadable_")),
      `tools/list answers with ${tools.length} dsaireadable_* tools`
    )
    const overview = (await client.callTool({
      name: "dsaireadable_get_design_system_overview",
      arguments: {},
    })) as { isError?: boolean; structuredContent?: Record<string, unknown> }
    expect(
      !overview.isError &&
        overview.structuredContent?.design_system_version === manifest.version,
      "a tool reads the context cache of the installed package"
    )
    const patterns = (await client.callTool({
      name: "dsaireadable_list_patterns",
      arguments: {},
    })) as { isError?: boolean }
    expect(
      !patterns.isError,
      "list_patterns runs from a folder with no design/patterns/"
    )
  } finally {
    await client.close()
  }
} catch (error) {
  failures.push(String(error))
  console.error(error)
} finally {
  rmSync(tmp, { recursive: true, force: true })
}

if (failures.length > 0) {
  console.error(`\n❌ test-package: ${failures.length} failed`)
  process.exit(1)
}
console.log("\n✅ test-package: the tarball starts from an empty folder")
