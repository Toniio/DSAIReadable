/**
 * Records what the MCP server serves into site/generated/mcp/, for the Tools
 * page of the documentation site.
 *
 * The page shows each tool as an agent meets it: its definition, and what it
 * answers. Next.js cannot run the server while it renders a page, so this
 * script starts it from the sources of this checkout, over stdio, as a client
 * does (evals/lib/claude.ts), and writes what it serves:
 *
 * - tools.json: each tool's definition as `tools/list` serves it (name,
 *   title, description, input schema, annotations), and its answer to the
 *   example input of EXAMPLES; for a tool that takes `response_format`, the
 *   concise and the detailed answer of the same input;
 * - resources.json: the resources, the number of each that resources/list
 *   lists, and the size of one read of each;
 * - prompts.json: the prompts as prompts/list serves them, and the call
 *   budget build_screen sets.
 *
 * An answer is the text the server sends, compact JSON, its characters
 * counted as the eval harness counts them. The files change with the context
 * cache, the server's code and its dependencies: --check fails when they no
 * longer match what the server serves (npm run site:check), and
 * `npm run site:mcp` writes them again.
 *
 *   npx tsx scripts/build-site-mcp.ts [--check]
 */

import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { format, resolveConfig } from "prettier"

import { connectMcp } from "../evals/lib/claude"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const CHECK = process.argv.includes("--check")
const OUT = resolve(ROOT, "site/generated/mcp")

/** A short screen with one real error, the default palette, for both validators. */
const SCREEN = `import { Button } from "@/components/ui/button"

export default function SaveBar() {
  return (
    <div className="flex justify-end gap-2 bg-blue-50 p-4">
      <Button variant="outline">Cancel</Button>
      <Button>Save</Button>
    </div>
  )
}
`

/**
 * The input each tool answers on the page: one that shows what it serves,
 * filtered where the whole answer would be long. A tool the server adds
 * without an entry here fails the script.
 */
const EXAMPLES: Record<string, Record<string, unknown>> = {
  dsaireadable_get_design_system_overview: {},
  dsaireadable_get_components: { category: "Forms" },
  dsaireadable_get_component_specs: { component_name: "Button" },
  dsaireadable_get_tokens: { category: "radius" },
  dsaireadable_get_deprecations: {},
  dsaireadable_get_changelog: { limit: 3 },
  dsaireadable_get_typography: {},
  dsaireadable_get_icons: {},
  dsaireadable_get_design_rules: { category: "Button" },
  dsaireadable_list_patterns: { kind: "task" },
  dsaireadable_get_pattern: { name: "create" },
  dsaireadable_get_dataviz_recommendation: { objective: "evolution" },
  dsaireadable_get_dataviz_specs: { chart_type: "line" },
  dsaireadable_get_ux_writing_rules: {},
  dsaireadable_get_glossary: { term: "asChild" },
  dsaireadable_get_content_library: { category: "messages" },
  dsaireadable_get_stats: {},
  dsaireadable_validate_screen: { code: SCREEN },
  dsaireadable_validate_code: { code: SCREEN },
}

/** The resource each template is read at, for the size of one read. */
const RESOURCE_EXAMPLES: Record<string, string> = {
  "component-spec": "ds://component/Button/spec",
  token: "ds://token/color.background.default",
}

/** The arguments build_screen is opened with, to read the budget it sets. */
const BUILD_SCREEN_ARGS = {
  task: "A sign-in form",
  device: "desktop",
  mode: "light",
}

const problems: string[] = []
const { mcp } = await connectMcp(ROOT)

/** The text of a tool's answer, or of its error. */
async function answer(name: string, args: Record<string, unknown>) {
  const result = (await mcp.callTool({ name, arguments: args })) as {
    content: { type: string; text?: string }[]
    isError?: boolean
  }
  const text = result.content.map((part) => part.text ?? "").join("")
  if (result.isError)
    problems.push(`${name} ${JSON.stringify(args)} answered an error: ${text}`)
  return { input: args, text, chars: text.length }
}

// ── The tools ──────────────────────────────────────────────────────────────

const { tools } = await mcp.listTools()
for (const name of Object.keys(EXAMPLES))
  if (!tools.some((tool) => tool.name === name))
    problems.push(`EXAMPLES names ${name}, which the server does not serve`)

const recordedTools = []
for (const tool of tools) {
  const example = EXAMPLES[tool.name]
  if (!example) {
    problems.push(`${tool.name} has no example input in EXAMPLES`)
    continue
  }
  const takesFormat = "response_format" in (tool.inputSchema.properties ?? {})
  const answers = takesFormat
    ? [
        { format: "concise", ...(await answer(tool.name, example)) },
        {
          format: "detailed",
          ...(await answer(tool.name, {
            ...example,
            response_format: "detailed",
          })),
        },
      ]
    : [await answer(tool.name, example)]
  // A validator's example shows what it catches: a report that passes
  // would show nothing.
  if (
    tool.name.startsWith("dsaireadable_validate_") &&
    answers.some((entry) => JSON.parse(entry.text).passed !== false)
  )
    problems.push(`${tool.name}: the example screen reports no issue`)
  recordedTools.push({
    name: tool.name,
    title: tool.title,
    description: tool.description,
    inputSchema: tool.inputSchema,
    annotations: tool.annotations,
    answers,
  })
}

// ── The resources ──────────────────────────────────────────────────────────

const { resourceTemplates } = await mcp.listResourceTemplates()
const { resources } = await mcp.listResources()

/** A URI template as a pattern: `ds://token/{path}` matches `ds://token/a.b`. */
const pattern = (template: string) =>
  new RegExp(
    `^${template
      .split(/\{[^}]+\}/)
      .map((part) => part.replace(/[.*+?^$()[\]\\|/]/g, "\\$&"))
      .join("[^/]+")}$`
  )

/** The characters of one read of a resource. */
async function read(uri: string) {
  const { contents } = await mcp.readResource({ uri })
  const text = contents
    .map((content) => ("text" in content ? content.text : ""))
    .join("")
  return { uri, chars: text.length }
}

const recordedResources = []
for (const template of resourceTemplates) {
  const uri = RESOURCE_EXAMPLES[template.name]
  if (!uri) {
    problems.push(`The resource ${template.name} has no example URI`)
    continue
  }
  const matches = pattern(template.uriTemplate)
  recordedResources.push({
    name: template.name,
    title: template.title,
    uriTemplate: template.uriTemplate,
    description: template.description,
    mimeType: template.mimeType,
    listed: resources.filter((resource) => matches.test(resource.uri)).length,
    example: await read(uri),
  })
}
const templated = resourceTemplates.map((template) =>
  pattern(template.uriTemplate)
)
for (const resource of resources) {
  if (templated.some((matches) => matches.test(resource.uri))) continue
  recordedResources.push({
    name: resource.name,
    title: resource.title,
    uri: resource.uri,
    description: resource.description,
    mimeType: resource.mimeType,
    listed: 1,
    example: await read(resource.uri),
  })
}

// ── The prompts ────────────────────────────────────────────────────────────

const { prompts } = await mcp.listPrompts()
const opened = await mcp.getPrompt({
  name: "build_screen",
  arguments: BUILD_SCREEN_ARGS,
})
const budget = opened.messages
  .map((message) => ("text" in message.content ? message.content.text : ""))
  .join("\n")
  .match(/call budget: (.+?):?\*\*/)?.[1]
if (!budget) problems.push("build_screen no longer states a call budget")

await mcp.close()

if (problems.length > 0) {
  for (const problem of problems) console.error(`❌ ${problem}`)
  process.exit(1)
}

// ── The files ──────────────────────────────────────────────────────────────

const files = new Map<string, unknown>([
  ["tools.json", { tools: recordedTools }],
  ["resources.json", { resources: recordedResources }],
  ["prompts.json", { prompts, buildScreenBudget: budget }],
])

const stale: string[] = []
let bytes = 0
for (const [file, data] of files) {
  const target = resolve(OUT, file)
  const next = await format(JSON.stringify(data), {
    ...(await resolveConfig(target)),
    filepath: target,
  })
  bytes += Buffer.byteLength(next)
  const current = existsSync(target) ? readFileSync(target, "utf-8") : null
  if (next === current) continue
  if (CHECK) stale.push(file)
  else {
    mkdirSync(OUT, { recursive: true })
    writeFileSync(target, next)
  }
}
// A dotfile is the system's, not ours (a Finder .DS_Store).
for (const file of existsSync(OUT) ? readdirSync(OUT) : []) {
  if (files.has(file) || file.startsWith(".")) continue
  if (CHECK) stale.push(`${file} (no longer generated)`)
  else rmSync(resolve(OUT, file))
}

if (CHECK && stale.length > 0) {
  console.error(
    `❌ build-site-mcp: ${stale.length} file(s) of site/generated/mcp out of date with the MCP server: ${stale.join(", ")}\n` +
      "   Run `npm run site:mcp` and commit the result."
  )
  process.exit(1)
}
const summary = `${recordedTools.length} tools, ${recordedResources.length} resources, ${prompts.length} prompts, ${Math.round(bytes / 1000)} KB`
console.log(
  CHECK
    ? `✅ build-site-mcp: site/generated/mcp matches the MCP server (${summary}).`
    : `✅ build-site-mcp: ${summary} written to site/generated/mcp.`
)
