/**
 * Writes llms.txt at the root: the design system's documentation map for
 * agents, in the llms.txt v2 format (llmstxt.org) — an H1, a summary in a
 * blockquote, then H2 sections of `- [name](url): notes` links.
 *
 * The entry points are listed below by hand; the foundations, the page
 * patterns and the component specs are read from specs/, each pattern with its
 * kind and each component with its category, both with the one sentence of
 * their Role section. A spec added, renamed or re-worded
 * therefore changes llms.txt, and `--check` fails until it is regenerated.
 * Every link is an absolute URL to the raw file on `main`, so the map works
 * whether the agent reads the clone or fetches it from GitHub; the script
 * refuses a link whose file does not exist.
 *
 *   npx tsx scripts/build-llms-txt.ts [--check]
 */

import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const CHECK = process.argv.includes("--check")
const OUTPUT = resolve(ROOT, "llms.txt")
const RAW = "https://raw.githubusercontent.com/Toniio/DSAIReadable/main"

type Link = { path: string; name: string; notes?: string }

const START: Link[] = [
  {
    path: "README.md",
    name: "README",
    notes:
      "what the design system is, how to install its components and run its MCP server",
  },
  {
    path: "registry/conventions/dsaireadable.md",
    name: "Conventions",
    notes:
      "the rules for any UI written with the components — the file the `conventions` registry item installs",
  },
  {
    path: "AGENTS.md",
    name: "AGENTS.md",
    notes: "the rules for changing this repository",
  },
  {
    path: "CONTRIBUTING.md",
    name: "Contributing",
    notes: "branches, commits, pull requests and the checks CI runs",
  },
]

const MACHINE: Link[] = [
  {
    path: "design-system.index.json",
    name: "design-system.index.json",
    notes:
      "the inventory: every component with its code path, status and sizes, the composition rules and the glossary",
  },
  {
    path: "design-system.schema.json",
    name: "design-system.schema.json",
    notes: "the JSON Schema of the inventory",
  },
  {
    path: "specs/tokens/token-reference.md",
    name: "Token reference",
    notes:
      "every token with its CSS variable, status, light and dark values and Tailwind class",
  },
  {
    path: "tokens.manifest.json",
    name: "tokens.manifest.json",
    notes: "the same tokens as JSON",
  },
  {
    path: "registry.json",
    name: "registry.json",
    notes:
      "the shadcn registry; install an item with `npx shadcn@latest add Toniio/DSAIReadable/<item>`",
  },
]

const OPTIONAL: Link[] = [
  {
    path: "PROJECT_STRUCTURE.md",
    name: "Project structure",
    notes: "where each kind of file lives and which files are generated",
  },
  {
    path: "mcp-server/AGENTS.md",
    name: "MCP server rules",
    notes: "the rules for changing the MCP server",
  },
  { path: "CHANGELOG.md", name: "Changelog" },
  { path: "SECURITY.md", name: "Security policy" },
]

const read = (path: string) => readFileSync(resolve(ROOT, path), "utf-8")
const specFiles = (dir: string) =>
  readdirSync(resolve(ROOT, dir))
    .filter((file) => file.endsWith(".md"))
    .sort()
    .map((file) => `${dir}/${file}`)

/** A foundation is named by its H1, without the trailing "Foundation". */
const foundations: Link[] = specFiles("specs/foundations").map((path) => {
  const title = /^# (.+)$/m.exec(read(path))?.[1]
  if (!title) throw new Error(`${path}: no H1`)
  return { path, name: title.replace(/ Foundation$/, "") }
})

/** A component spec carries its category (Metadata) and its Role sentence. */
const components: Link[] = specFiles("specs/components").map((path) => {
  const spec = read(path)
  const name = /^# (.+)$/m.exec(spec)?.[1]
  const category = /^\| Category +\| (.+?) +\|$/m.exec(spec)?.[1]
  const role = /^## Role\n\n(.+)$/m.exec(spec)?.[1]
  if (!name || !category || !role)
    throw new Error(`${path}: no H1, Category or one-line Role`)
  return { path, name, notes: `${category} — ${role}` }
})

/** A page pattern carries its kind (Metadata) and its Role sentence. */
const patterns: Link[] = specFiles("specs/patterns").map((path) => {
  const spec = read(path)
  const name = /^# (.+)$/m.exec(spec)?.[1]
  const kind = /^\| Kind +\| (.+?) +\|$/m.exec(spec)?.[1]
  const role = /^## Role\n\n(.+)$/m.exec(spec)?.[1]
  if (!name || !kind || !role)
    throw new Error(`${path}: no H1, Kind or one-line Role`)
  return { path, name, notes: `${kind} — ${role}` }
})

const sections: [string, Link[]][] = [
  ["Start here", START],
  ["Machine-readable sources", MACHINE],
  ["Foundations", foundations],
  ["Page patterns", patterns],
  ["Component specs", components],
  ["Optional", OPTIONAL],
]

const missing = sections
  .flatMap(([, links]) => links)
  .filter((link) => !existsSync(resolve(ROOT, link.path)))
  .map((link) => link.path)
if (missing.length > 0) {
  console.error(
    `❌ build-llms-txt: link to a file that does not exist: ${missing.join(", ")}`
  )
  process.exit(1)
}

const item = ({ path, name, notes }: Link) =>
  `- [${name}](${RAW}/${path})${notes ? `: ${notes}` : ""}`

const text = [
  "# DSAIReadable",
  "",
  "> An AI-readable design system for React 19, Next.js 16 and Tailwind CSS v4, built on shadcn/ui. Components install from a shadcn registry as source code; tokens, specs and composition rules are published as structured files an agent can read, and a local MCP server serves them as tools.",
  "",
  "Code written with this design system uses its components, never a native element they replace; styles through its semantic Tailwind classes or `var(--…)` tokens, never a raw value (hex, `px`, `rem`, `ms`); and Phosphor icons (`@phosphor-icons/react`) only. Dark mode is the `.dark` class on `<html>`. Read a component's spec before using or changing it: it is the behavioral source of truth, in 13 sections. A screen that carries out a common task (create, edit, delete, filter, search, sign in, settings) starts from its page pattern.",
  "",
  ...sections.flatMap(([title, links]) => [
    `## ${title}`,
    "",
    ...links.map(item),
    "",
  ]),
].join("\n")

const current = existsSync(OUTPUT) ? readFileSync(OUTPUT, "utf-8") : ""
if (CHECK) {
  if (current !== text) {
    console.error(
      "❌ build-llms-txt: llms.txt is out of step with specs/.\n" +
        "   Run `npm run docs:llms` and commit the result."
    )
    process.exit(1)
  }
} else if (current !== text) writeFileSync(OUTPUT, text)

console.log(
  `✅ build-llms-txt: ${components.length} component specs, ${patterns.length} page patterns and ${foundations.length} foundations ${CHECK ? "listed in" : "written to"} llms.txt.`
)
