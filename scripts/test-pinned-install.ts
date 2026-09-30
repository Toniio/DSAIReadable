/**
 * What a pinned install pins.
 *
 * A consumer can pin an item to a release tag: `shadcn add
 * Toniio/DSAIReadable/button#v1.2.0`. The shadcn CLI reads that item at the
 * tag, but the registry dependencies it lists are addressed without a ref
 * (`Toniio/DSAIReadable/design-system`), and the CLI does not hand the parent's
 * ref down to them: they are read from the default branch. Pinning one item
 * therefore does not reproduce a release; the README says so (Publishing
 * identity) and this test states the same thing, so that the day the CLI pins
 * them, it fails and tells us to drop the limit.
 *
 * It runs the installed CLI against a throwaway git remote with two commits,
 * the tag `v1.0.0` and `main`, which differ in every file. Nothing leaves the
 * machine: git is redirected to the local remote (`url.<base>.insteadOf`) and
 * the CLI's reads of raw.githubusercontent.com are served from it.
 *
 *   npx tsx scripts/test-pinned-install.ts
 */

import { spawnSync } from "node:child_process"
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const SHADCN = join(ROOT, "node_modules/.bin/shadcn")
const BASE = "Toniio/DSAIReadable"

// The fixture mirrors the real registry: an item addressed in full, which
// depends on the base item, addressed in full and with no ref. Fail if the real
// registry stops being shaped that way, since the test would then say nothing.
const registry = JSON.parse(
  readFileSync(join(ROOT, "registry.json"), "utf-8")
) as { items: { name: string; registryDependencies?: string[] }[] }
const button = registry.items.find((item) => item.name === "button")
if (!button?.registryDependencies?.includes(`${BASE}/design-system`)) {
  console.error(
    `❌ test-pinned-install: the button item no longer depends on ${BASE}/design-system`
  )
  process.exit(1)
}

const tmp = mkdtempSync(join(tmpdir(), "dsai-pinned-"))
const remote = join(tmp, "remote", `${BASE}.git`)
const app = join(tmp, "app")

function git(...args: string[]) {
  const result = spawnSync("git", args, { cwd: remote, encoding: "utf8" })
  if (result.status !== 0)
    throw new Error(`git ${args.join(" ")}: ${result.stderr}`)
}

/** One commit of the fixture registry, every file carrying `label`. */
function commit(label: string) {
  writeFileSync(
    join(remote, "registry.json"),
    JSON.stringify({
      $schema: "https://ui.shadcn.com/schema/registry.json",
      name: "dsaireadable",
      homepage: `https://github.com/${BASE}`,
      items: [
        {
          name: "button",
          type: "registry:ui",
          registryDependencies: [`${BASE}/design-system`],
          files: [{ path: "components/ui/button.tsx", type: "registry:ui" }],
        },
        {
          name: "design-system",
          type: "registry:lib",
          files: [{ path: "lib/utils.ts", type: "registry:lib" }],
        },
      ],
    })
  )
  mkdirSync(join(remote, "components/ui"), { recursive: true })
  mkdirSync(join(remote, "lib"), { recursive: true })
  writeFileSync(
    join(remote, "components/ui/button.tsx"),
    `export const button = "${label}"\n`
  )
  writeFileSync(
    join(remote, "lib/utils.ts"),
    `export const utils = "${label}"\n`
  )
  git("add", "-A")
  git(
    "-c",
    "user.name=test",
    "-c",
    "user.email=test@example.com",
    "commit",
    "-qm",
    label
  )
}

/** Serves the CLI's reads of raw.githubusercontent.com from the local remote. */
const PRELOAD = `
import { execFileSync } from "node:child_process"
const real = globalThis.fetch
globalThis.fetch = async (input, init) => {
  const url = new URL(typeof input === "string" ? input : (input.url ?? String(input)))
  if (url.hostname !== "raw.githubusercontent.com") return real(input, init)
  const [, owner, repo, sha, ...path] = url.pathname.split("/")
  try {
    const body = execFileSync("git", [
      "-C", process.env.FAKE_REMOTE + "/" + owner + "/" + repo + ".git",
      "show", sha + ":" + decodeURIComponent(path.join("/")),
    ])
    return new Response(body, { status: 200 })
  } catch {
    return new Response("Not Found", { status: 404 })
  }
}
`

/** Installs `addresses` into a blank app and returns what landed in it. */
function install(addresses: string[]) {
  rmSync(join(app, "src"), { recursive: true, force: true })
  mkdirSync(join(app, "src"), { recursive: true })
  const result = spawnSync(
    SHADCN,
    ["add", ...addresses, "--yes", "--overwrite", "--silent"],
    {
      cwd: app,
      encoding: "utf8",
      env: {
        ...process.env,
        FORCE_COLOR: "0",
        FAKE_REMOTE: join(tmp, "remote"),
        NODE_OPTIONS: `--import ${join(tmp, "preload.mjs")}`,
        GIT_CONFIG_COUNT: "1",
        GIT_CONFIG_KEY_0: `url.file://${join(tmp, "remote")}/.insteadOf`,
        GIT_CONFIG_VALUE_0: "https://github.com/",
      },
    }
  )
  if (result.status !== 0) {
    throw new Error(
      `shadcn add ${addresses.join(" ")} failed:\n${result.stdout}${result.stderr}`
    )
  }
  const read = (file: string) => readFileSync(join(app, file), "utf-8")
  return { button: read("src/ui/button.tsx"), utils: read("src/lib/utils.ts") }
}

const failures: string[] = []
function expect(ok: boolean, what: string) {
  console.log(`${ok ? "ok  " : "FAIL"}  ${what}`)
  if (!ok) failures.push(what)
}

try {
  mkdirSync(remote, { recursive: true })
  git("init", "-q", "-b", "main")
  commit("v1")
  git("tag", "v1.0.0")
  commit("main")

  mkdirSync(app, { recursive: true })
  writeFileSync(join(tmp, "preload.mjs"), PRELOAD)
  writeFileSync(
    join(app, "package.json"),
    JSON.stringify({ name: "app", dependencies: {} })
  )
  writeFileSync(
    join(app, "tsconfig.json"),
    JSON.stringify({
      compilerOptions: { baseUrl: ".", paths: { "~/*": ["./src/*"] } },
    })
  )
  writeFileSync(
    join(app, "components.json"),
    JSON.stringify({
      $schema: "https://ui.shadcn.com/schema.json",
      style: "new-york",
      rsc: false,
      tsx: true,
      tailwind: {
        config: "",
        css: "src/app.css",
        baseColor: "neutral",
        cssVariables: true,
      },
      aliases: {
        components: "~/components",
        utils: "~/lib/utils",
        ui: "~/ui",
        lib: "~/lib",
        hooks: "~/hooks",
      },
    })
  )

  const item = install([`${BASE}/button#v1.0.0`])
  expect(item.button.includes('"v1"'), "the pinned item is read at its tag")
  expect(
    item.utils.includes('"main"'),
    "its internal dependency is read from the default branch, not from the tag"
  )

  const both = install([
    `${BASE}/design-system#v1.0.0`,
    `${BASE}/button#v1.0.0`,
  ])
  expect(
    both.utils.includes('"main"'),
    "pinning the dependency as well does not change that"
  )
} finally {
  rmSync(tmp, { recursive: true, force: true })
}

if (failures.length > 0) {
  console.error(
    "\n❌ test-pinned-install: the shadcn CLI no longer behaves as the README says.\n" +
      "   If it now pins internal dependencies to the parent's tag, remove the limit from\n" +
      "   the README (Publishing identity) and from CONTRIBUTING (Versioning), then this test."
  )
  process.exit(1)
}
console.log(
  "\n✅ test-pinned-install: a pinned install pins the requested item only"
)
