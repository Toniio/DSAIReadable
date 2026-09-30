#!/usr/bin/env tsx
/**
 * Package test: the server a consumer gets from npm starts from a blank folder.
 *
 * `npm pack` builds the package, exactly as `npm publish` would; this test then
 *
 *   ① reads the file list of the tarball: `dist/` and `context/` only, no test,
 *      no generator, no agent file, and no `tsx` among the runtime dependencies;
 *   ② packs the ESLint plugin the server depends on, the same way, and checks
 *      that the server pins exactly that version;
 *   ③ runs both tarballs through `npx` from an empty folder, outside this
 *      repository, and talks to the server over stdio: `initialize`,
 *      `tools/list`, one call that has to read the context cache from the
 *      installed package, one that has to run the plugin's rules.
 *
 * The plugin is not on the registry before the first release, so its tarball
 * is installed beside the server's. The rest of the dependencies come from the
 * npm registry: the test needs the network.
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
const PLUGIN = resolve(PACKAGE, "../packages/eslint-plugin")
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

/** `npm pack` builds the package as `npm publish` would; returns the tarball and its file list. */
function pack(cwd: string, destination: string) {
  const packed = spawnSync(
    "npm",
    ["pack", "--json", "--pack-destination", destination],
    { cwd, encoding: "utf8" }
  )
  if (packed.status !== 0) {
    throw new Error(`npm pack failed:\n${packed.stdout}${packed.stderr}`)
  }
  const [{ filename, files }] = JSON.parse(packed.stdout) as [
    { filename: string; files: { path: string }[] },
  ]
  return { filename, paths: files.map((file) => file.path) }
}

const tmp = mkdtempSync(join(tmpdir(), "dsai-package-"))
try {
  // ① the tarball
  const { filename, paths } = pack(PACKAGE, tmp)
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
  expect(!("tsx" in manifest.dependencies), "tsx is not a runtime dependency")

  // ② the plugin
  const plugin = pack(PLUGIN, tmp)
  const pluginManifest = JSON.parse(
    readFileSync(join(PLUGIN, "package.json"), "utf-8")
  ) as { version: string }
  const pluginOutside = plugin.paths.filter(
    (path) =>
      !/^dist\//.test(path) &&
      !["package.json", "README.md", "LICENSE"].includes(path)
  )
  expect(
    pluginOutside.length === 0 &&
      plugin.paths.includes("dist/index.js") &&
      !plugin.paths.some(
        (path) => /test\.js$|\.ts$/.test(path) && !path.endsWith(".d.ts")
      ),
    `the plugin tarball holds dist/ only, without its tests${pluginOutside.length ? ` (also: ${pluginOutside.join(", ")})` : ""}`
  )
  expect(
    manifest.dependencies["@dsaireadable/eslint-plugin"] ===
      pluginManifest.version,
    `the server pins the plugin to ${pluginManifest.version}`
  )

  // ③ the tarballs, run the way a consumer runs it
  const empty = join(tmp, "empty")
  mkdirSync(empty)
  const client = new Client({ name: "package-test", version: "0.0.0" })
  const transport = new StdioClientTransport({
    command: "npx",
    args: [
      "--yes",
      "--package",
      join(tmp, filename),
      "--package",
      join(tmp, plugin.filename),
      "dsaireadable-mcp",
    ],
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
    const validated = (await client.callTool({
      name: "dsaireadable_validate_code",
      arguments: {
        code: 'export const C = () => <button className="bg-[#fff]" />',
      },
    })) as {
      isError?: boolean
      structuredContent?: { issues: { rule: string }[] }
    }
    const rules = validated.structuredContent?.issues.map((i) => i.rule) ?? []
    expect(
      !validated.isError &&
        rules.includes("dsaireadable/no-native-interactive-elements") &&
        rules.includes("dsaireadable/no-raw-values"),
      "validate_code runs the plugin's rules from the installed packages"
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
