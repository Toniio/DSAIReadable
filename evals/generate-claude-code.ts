/**
 * Generates the screens of the conformance harness with Claude Code in print
 * mode (`claude -p`), on the subscription it is logged in with: no API key.
 * The replay generator of evals/run.ts then scores them on stages A and B
 * (evals/README.md, "Measuring without an API key").
 *
 * Each task runs in an empty folder outside the repository, with the claude
 * generator's instructions (`SYSTEM`, `WITH_MCP` of evals/lib/claude.ts)
 * appended to Claude Code's own system prompt, under one condition:
 *
 *   none        no MCP server, no skill: the baseline
 *   mcp         the dsaireadable MCP server, started from this checkout
 *   mcp-skills  the server, and the skills of skills/ in the session's .claude/skills/
 *
 * The session loads none of the user's own configuration (user settings,
 * plugins, hooks, CLAUDE.md, auto memory, MCP servers, claude.ai connectors;
 * the plugins and skills built into Claude Code stay, and run.json lists them),
 * gets an environment built from an allowlist, has no built-in tool except
 * `Skill` and `Read` under mcp-skills (`Read` within its own folder), and
 * stops after MAX_TURNS turns. Its init message is checked before anything
 * counts: no API key, no plugin, the expected MCP server, tools and skills —
 * otherwise the run stops.
 *
 * Output, evals/.work/claude-code/<label>/: per task `<task>.tsx` (when the
 * answer holds a tsx block), `<task>.metrics.json` (written last: the task is
 * done) and the session's stream `<task>.jsonl`; `run.json` with the exact
 * model id, the Claude Code version and a hash of the sources the sessions
 * read (the MCP server, its context, the skills, the instructions). A task
 * already done is skipped, so after a usage limit the same command resumes;
 * it refuses to resume when the model, Claude Code or those sources changed.
 *
 *   npm run evals:generate -- --model sonnet --condition mcp [--label 0.1.1-sonnet-mcp]
 *     [--tasks a,b | --suite skills] [--timeout-minutes 20] [--claude <path>] [--dry-run]
 *
 * `--dry-run` prints the command and the environment, and starts the MCP
 * server through the exact launch to list its tools: no session, no model.
 * Exit codes: 0 done, 1 an error, 2 stopped on a usage limit (rerun to
 * resume), 3 some tasks left to rerun.
 */

import { execFileSync, execSync, spawn } from "node:child_process"
import { createHash } from "node:crypto"
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import { tmpdir } from "node:os"
import { join, relative, resolve } from "node:path"
import { createInterface } from "node:readline"
import { fileURLToPath } from "node:url"
import { parseArgs } from "node:util"

import {
  connectMcp,
  MAX_TURNS,
  mcpServerLaunch,
  screenOf,
  SYSTEM,
  WITH_MCP,
} from "./lib/claude"
import type { GenerationMetrics } from "./lib/report"
import { loadTasks, taskMessage, type Task } from "./lib/tasks"

const ROOT = fileURLToPath(new URL("..", import.meta.url))
const SERVER = "dsaireadable"
const MCP_PREFIX = `mcp__${SERVER}__`
const CONDITIONS = ["none", "mcp", "mcp-skills"] as const
type Condition = (typeof CONDITIONS)[number]
/** The Claude Code release whose flags and stream this script was checked against. */
const CHECKED_ON = "2.1.285"

const { values } = parseArgs({
  options: {
    model: { type: "string" },
    condition: { type: "string" },
    label: { type: "string" },
    tasks: { type: "string" },
    suite: { type: "string" },
    "timeout-minutes": { type: "string", default: "20" },
    claude: { type: "string", default: "claude" },
    "dry-run": { type: "boolean", default: false },
  },
  strict: true,
})

function fail(message: string, code = 1): never {
  console.error(`❌ evals:generate: ${message}`)
  process.exit(code)
}

const model = values.model ?? fail("--model is required (sonnet, opus…)")
const condition = (values.condition ?? "") as Condition
if (!CONDITIONS.includes(condition))
  fail(`--condition is one of ${CONDITIONS.join(", ")}`)
const label = values.label ?? `${model}-${condition}`
if (!/^[\w.-]+$/.test(label))
  fail(`--label "${label}": letters, digits, dots and dashes`)
const timeoutMs = Number(values["timeout-minutes"]) * 60_000
if (!(timeoutMs > 0)) fail("--timeout-minutes is a positive number")
const CLAUDE = values.claude

const withMcp = condition !== "none"
const withSkills = condition === "mcp-skills"
const SKILLS = readdirSync(resolve(ROOT, "skills")).filter((name) =>
  existsSync(resolve(ROOT, "skills", name, "SKILL.md"))
)
const OUT = join(ROOT, "evals/.work/claude-code", label)
const tasks = loadTasks(ROOT, values.tasks?.split(","), values.suite)

// ---------------------------------------------------------------------------
// The session
// ---------------------------------------------------------------------------

/** What Claude Code is told: the same as the claude generator, plus the server and the tools of the condition. */
const ARGS = [
  "-p",
  "--model",
  model,
  "--output-format",
  "stream-json",
  "--verbose",
  "--append-system-prompt",
  SYSTEM + (withMcp ? WITH_MCP : ""),
  // Hidden from `claude --help`, defined in Claude Code 2.1.76 and 2.1.285.
  "--max-turns",
  String(MAX_TURNS),
  "--effort",
  "high",
  "--permission-mode",
  "dontAsk",
  "--setting-sources",
  "project",
  "--strict-mcp-config",
  ...(withMcp
    ? [
        "--mcp-config",
        JSON.stringify({
          mcpServers: { [SERVER]: { type: "stdio", ...mcpServerLaunch(ROOT) } },
        }),
      ]
    : []),
  "--tools",
  withSkills ? "Skill,Read" : "",
  // Read needs no rule: inside the session's folder, where .claude/skills/
  // sits, it is allowed, and dontAsk denies it anywhere else.
  ...(withMcp
    ? ["--allowedTools", withSkills ? `mcp__${SERVER},Skill` : `mcp__${SERVER}`]
    : []),
  ...(withSkills ? [] : ["--disable-slash-commands"]),
  "--no-session-persistence",
  "--no-chrome",
]

/**
 * The variables a session takes from the shell: none of ANTHROPIC_* (an API
 * key would win over the subscription) or of a parent session's CLAUDE_*.
 * CLAUDE_CONFIG_DIR and the proxy and certificate variables carry no
 * credential: they tell Claude Code where its login is and how to reach it.
 */
const KEEP = [
  "HOME",
  "PATH",
  "USER",
  "LOGNAME",
  "SHELL",
  "TMPDIR",
  "LANG",
  "LC_ALL",
  "LC_CTYPE",
  "TERM",
  "CLAUDE_CONFIG_DIR",
  "HTTP_PROXY",
  "HTTPS_PROXY",
  "NO_PROXY",
  "http_proxy",
  "https_proxy",
  "no_proxy",
  "NODE_EXTRA_CA_CERTS",
  "NODE_USE_SYSTEM_CA",
  "SSL_CERT_FILE",
  "SSL_CERT_DIR",
]
const ENV: Record<string, string> = {
  ...Object.fromEntries(
    KEEP.flatMap((name) =>
      process.env[name] === undefined ? [] : [[name, process.env[name]!]]
    )
  ),
  CLAUDE_CODE_DISABLE_CLAUDE_MDS: "1",
  CLAUDE_CODE_DISABLE_AUTO_MEMORY: "1",
  ENABLE_CLAUDEAI_MCP_SERVERS: "false",
  // The MCP tools load up front, as the claude generator gives them.
  ENABLE_TOOL_SEARCH: "false",
  DISABLE_AUTOUPDATER: "1",
  MCP_TIMEOUT: "60000",
}

/** The lines of the stream this script reads; the rest of each message is ignored. */
interface StreamLine {
  type?: string
  subtype?: string
  // init
  apiKeySource?: string
  claude_code_version?: string
  model?: string
  tools?: string[]
  mcp_servers?: { name: string; status: string }[]
  skills?: string[]
  plugins?: { name: string; path?: string; source?: string }[]
  // assistant, user
  parent_tool_use_id?: string | null
  error?: string
  message?: {
    id?: string
    model?: string
    content?: {
      type: string
      text?: string
      name?: string
      is_error?: boolean
    }[]
  }
  // rate_limit_event
  rate_limit_info?: {
    status?: string
    isUsingOverage?: boolean
    resetsAt?: number | string
  }
  // result
  is_error?: boolean
  result?: string
  errors?: unknown[]
  num_turns?: number
  stop_reason?: string | null
  total_cost_usd?: number
  duration_ms?: number
  usage?: {
    input_tokens?: number
    output_tokens?: number
    cache_read_input_tokens?: number
    cache_creation_input_tokens?: number
  }
  permission_denials?: unknown[]
}

interface Init {
  claudeCode: string
  model: string
  skills: string[]
  plugins: string[]
}

/** A plugin Claude Code ships inside its own binary (2.1.285 lists `cc-plugin-diff@builtin`…): part of the product measured, not the user's configuration. */
const isBuiltin = (plugin: { path?: string; source?: string }) =>
  plugin.path === "builtin" || (plugin.source ?? "").endsWith("@builtin")

/** Why the init message of a session does not match its condition; empty when it does. */
function initProblems(init: StreamLine): string[] {
  const problems: string[] = []
  if (init.apiKeySource === "/login managed key")
    problems.push(
      "Claude Code is logged in with a Console API key, not the subscription: run `claude /logout`, then log in again with the subscription"
    )
  else if (init.apiKeySource !== "none")
    problems.push(
      `Claude Code would authenticate with "${init.apiKeySource}", not the subscription: run from a shell where no API key is set (ANTHROPIC_API_KEY, apiKeyHelper)`
    )
  const plugins = (init.plugins ?? []).filter((p) => !isBuiltin(p))
  if (plugins.length > 0)
    problems.push(
      `plugins are loaded: ${plugins.map((p) => `${p.name} (${p.source ?? p.path ?? "?"})`).join(", ")}`
    )
  const servers = init.mcp_servers ?? []
  if (withMcp) {
    if (
      servers.length !== 1 ||
      servers[0].name !== SERVER ||
      servers[0].status !== "connected"
    )
      problems.push(
        `the MCP servers are ${JSON.stringify(servers)}, not "${SERVER}" connected`
      )
  } else if (servers.length > 0)
    problems.push(`MCP servers are loaded: ${JSON.stringify(servers)}`)
  const unexpected = (init.tools ?? []).filter(
    (tool) =>
      !(withMcp && tool.startsWith(MCP_PREFIX)) &&
      !(withSkills && (tool === "Skill" || tool === "Read"))
  )
  if (unexpected.length > 0)
    problems.push(`tools outside the condition: ${unexpected.join(", ")}`)
  if (withMcp && !(init.tools ?? []).some((t) => t.startsWith(MCP_PREFIX)))
    problems.push(`no ${SERVER} tool is listed`)
  const skills = init.skills ?? []
  const ours = SKILLS.filter((name) => skills.includes(name))
  if (withSkills && ours.length !== SKILLS.length)
    problems.push(
      `the skills of skills/ are not all loaded (${SKILLS.join(", ")}; listed: ${skills.join(", ")})`
    )
  if (!withSkills && ours.length > 0)
    problems.push(`skills of skills/ are loaded: ${ours.join(", ")}`)
  return problems
}

type Outcome =
  | {
      kind: "done"
      code: string | null
      metrics: GenerationMetrics
      about: Record<string, unknown>
      /** What the session's init message listed. */
      session: Init
      /** A usage limit was reached once this answer was complete: stop after writing it. */
      stopAfter?: string
    }
  | { kind: "retry"; reason: string }
  | { kind: "stop"; reason: string; exitCode: number }

const lastLine = (text: string) => text.trim().split("\n").at(-1) ?? ""

/** Runs one task in a fresh folder outside the repository and reads its stream. */
async function session(task: Task, init: { value?: Init }): Promise<Outcome> {
  const wd = mkdtempSync(join(tmpdir(), "dsaireadable-evals-"))
  try {
    if (withSkills)
      for (const name of SKILLS)
        cpSync(
          resolve(ROOT, "skills", name),
          join(wd, ".claude/skills", name),
          { recursive: true }
        )
    const child = spawn(CLAUDE, ARGS, { cwd: wd, env: ENV })
    child.stdin.end(taskMessage(ROOT, task))
    let stderr = ""
    child.stderr.on("data", (chunk: Buffer) => {
      stderr = (stderr + chunk.toString()).slice(-2000)
    })
    const exited = new Promise<number | null>((done) =>
      child.on("close", (code) => done(code))
    )
    let killer: NodeJS.Timeout | undefined
    const stop = () => {
      child.kill("SIGTERM")
      killer ??= setTimeout(() => {
        if (child.exitCode === null && child.signalCode === null)
          child.kill("SIGKILL")
      }, 10_000)
    }
    let timedOut = false
    const timer = setTimeout(() => {
      timedOut = true
      stop()
    }, timeoutMs)

    const stream: string[] = []
    const ids = new Set<string>()
    const models = new Set<string>()
    const tools: Record<string, number> = {}
    let lastId: string | undefined
    let lastText: string[] = []
    let toolCalls = 0
    let toolErrors = 0
    let result: StreamLine | undefined
    /** An API error of the main loop (rate_limit, billing_error, authentication_failed…), and its text. */
    let apiError: { error: string; text: string } | undefined
    let limitResets: number | string | undefined
    let problems: string[] = []
    let sessionInit: Init | undefined

    for await (const line of createInterface({ input: child.stdout })) {
      if (!line.trim()) continue
      stream.push(line)
      let message: StreamLine
      try {
        message = JSON.parse(line) as StreamLine
      } catch {
        continue
      }
      if (message.type === "system" && message.subtype === "init") {
        problems = initProblems(message)
        const about: Init = {
          claudeCode: message.claude_code_version ?? "?",
          model: message.model ?? "?",
          skills: message.skills ?? [],
          plugins: (message.plugins ?? []).map((p) => p.source ?? p.name),
        }
        if (
          init.value &&
          (init.value.model !== about.model ||
            init.value.claudeCode !== about.claudeCode)
        )
          problems.push(
            `this run was measured with ${init.value.model} on Claude Code ${init.value.claudeCode}, this session has ${about.model} on ${about.claudeCode}: give it another --label`
          )
        if (problems.length > 0) {
          stop()
          break
        }
        init.value ??= about
        sessionInit = about
      } else if (
        message.type === "assistant" &&
        message.parent_tool_use_id == null
      ) {
        // One line per content block: the blocks of one response share its id.
        const id = message.message?.id
        if (id && id !== lastId) {
          ids.add(id)
          lastId = id
          lastText = []
        }
        if (message.message?.model) models.add(message.message.model)
        for (const block of message.message?.content ?? []) {
          if (block.type === "text" && block.text) lastText.push(block.text)
          if (block.type === "tool_use" && block.name) {
            toolCalls++
            const name = block.name.startsWith(MCP_PREFIX)
              ? block.name.slice(MCP_PREFIX.length)
              : block.name
            tools[name] = (tools[name] ?? 0) + 1
          }
        }
        if (message.error)
          apiError = {
            error: message.error,
            text: (message.message?.content ?? [])
              .map((b) => b.text ?? "")
              .join(" ")
              .trim(),
          }
      } else if (message.type === "user") {
        for (const block of message.message?.content ?? [])
          if (block.type === "tool_result" && block.is_error) toolErrors++
      } else if (
        message.type === "rate_limit_event" &&
        message.rate_limit_info?.status === "rejected" &&
        // On extra usage the request is still served: not a limit.
        !message.rate_limit_info.isUsingOverage
      )
        limitResets = message.rate_limit_info.resetsAt ?? "?"
      else if (message.type === "result") result = message
    }
    const exitCode = await exited
    clearTimeout(timer)
    clearTimeout(killer)
    writeFileSync(join(OUT, `${task.id}.jsonl`), stream.join("\n") + "\n")

    if (problems.length > 0)
      return {
        kind: "stop",
        exitCode: 1,
        reason: `the session does not match the condition "${condition}":\n   - ${problems.join("\n   - ")}`,
      }
    if (apiError?.error === "authentication_failed")
      return {
        kind: "stop",
        exitCode: 1,
        reason: `Claude Code is not logged in: run \`claude\` once and log in (${apiError.text})`,
      }
    const limit =
      apiError && ["rate_limit", "billing_error"].includes(apiError.error)
        ? `${apiError.error}: ${apiError.text}`
        : limitResets !== undefined
          ? `rate limit, resets at ${limitResets}`
          : undefined

    // A complete answer counts even when a limit or the timeout came after it.
    const refused = result?.stop_reason === "refusal"
    const complete =
      result !== undefined &&
      result.usage !== undefined &&
      (refused ||
        result.subtype === "error_max_turns" ||
        (result.subtype === "success" && !result.is_error))
    if (complete) {
      const usage = result!.usage!
      return {
        kind: "done",
        // A refusal is a task with no output, as the claude generator counts it.
        code: refused ? null : screenOf(lastText.join("\n")),
        metrics: {
          turns: ids.size || (result!.num_turns ?? 0),
          toolCalls,
          toolErrors,
          inputTokens:
            (usage.input_tokens ?? 0) +
            (usage.cache_read_input_tokens ?? 0) +
            (usage.cache_creation_input_tokens ?? 0),
          outputTokens: usage.output_tokens ?? 0,
          tools,
        },
        about: {
          subtype: result!.subtype,
          stopReason: result!.stop_reason ?? null,
          numTurns: result!.num_turns,
          costUsd: result!.total_cost_usd,
          durationMs: result!.duration_ms,
          models: [...models],
          permissionDenials: result!.permission_denials?.length ?? 0,
        },
        session: sessionInit!,
        ...(limit && { stopAfter: limit }),
      }
    }
    if (limit)
      return {
        kind: "stop",
        exitCode: 2,
        reason: `usage limit reached (${limit}): rerun the same command to resume`,
      }
    if (timedOut)
      return {
        kind: "retry",
        reason: `timed out after ${values["timeout-minutes"]} min`,
      }
    if (!result)
      return {
        kind: "retry",
        reason: `no result (exit ${exitCode}): ${lastLine(stderr)}`,
      }
    return {
      kind: "retry",
      reason: `${result.subtype ?? "error"}: ${
        apiError?.text ||
        result.result ||
        JSON.stringify(result.errors ?? []) ||
        lastLine(stderr)
      }`,
    }
  } finally {
    rmSync(wd, { recursive: true, force: true })
  }
}

// ---------------------------------------------------------------------------
// The run
// ---------------------------------------------------------------------------

/**
 * A hash of what the sessions read from this checkout: the MCP server's
 * sources and context, the skills, the instructions. A resumed run must find
 * the same, or its tasks would be measured against different sources.
 */
function sourcesHash(): string {
  const hash = createHash("sha256")
  hash.update(SYSTEM + WITH_MCP)
  const walk = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const path = join(dir, entry.name)
      return entry.isDirectory() ? walk(path) : [path]
    })
  for (const dir of ["mcp-server/src", "mcp-server/context", "skills"])
    for (const file of walk(resolve(ROOT, dir)).sort())
      hash.update(`\0${relative(ROOT, file)}\0`).update(readFileSync(file))
  return hash.digest("hex").slice(0, 16)
}

interface RunFile {
  generator: "claude-code"
  claudeCode: string
  claudePath: string
  model: string
  modelOption: string
  condition: Condition
  context: "mcp" | "none"
  skills: string[]
  /** Every skill the sessions listed, Claude Code's bundled ones included. */
  sessionSkills: string[]
  /** Every plugin built into Claude Code that the sessions listed. */
  sessionPlugins: string[]
  maxTurns: number
  effort: string
  sources: string
  designSystem: { version: string; commit: string; dirty: boolean }
  tasks: Record<string, Record<string, unknown>>
}

if (process.env.CLAUDECODE || process.env.CLAUDE_CODE_ENTRYPOINT)
  console.warn(
    "⚠️  evals:generate runs inside a Claude Code session: the sessions it starts get a clean environment, but run it from a plain terminal."
  )

const claudePath = (() => {
  try {
    return execFileSync("/bin/sh", ["-c", 'command -v "$1"', "sh", CLAUDE], {
      env: ENV,
      encoding: "utf8",
    }).trim()
  } catch {
    return CLAUDE
  }
})()
const claudeVersion = (() => {
  try {
    return execFileSync(CLAUDE, ["--version"], { env: ENV, encoding: "utf8" })
      .trim()
      .split(" ")[0]
  } catch {
    return fail(
      `\`${CLAUDE}\` does not run: install Claude Code, or pass --claude <path>`
    )
  }
})()
console.log(`Claude Code ${claudeVersion} (${claudePath})`)
if (claudeVersion !== CHECKED_ON)
  console.warn(
    `⚠️  This script was checked against Claude Code ${CHECKED_ON}: the flags and the stream of ${claudeVersion} may differ. Run one task first (--tasks sign-in --label smoke), or pass --claude <path> to a ${CHECKED_ON} install.`
  )

if (values["dry-run"]) {
  const shown = ARGS.map((arg) =>
    arg.length > 120 ? `${JSON.stringify(arg.slice(0, 117))}…` : arg
  )
  console.log(
    `${tasks.length} task(s), condition "${condition}", output evals/.work/claude-code/${label}/`
  )
  console.log(`\n${CLAUDE} ${shown.join(" ")}\n`)
  console.log(`Environment: ${Object.keys(ENV).join(", ")}`)
  if (withSkills)
    console.log(`Skills copied into .claude/skills/: ${SKILLS.join(", ")}`)
  if (withMcp) {
    const { mcp, definitions } = await connectMcp(ROOT)
    await mcp.close()
    if (definitions.length === 0) fail(`the ${SERVER} MCP server lists no tool`)
    console.log(
      `MCP server "${SERVER}" started through the session's launch: ${definitions.length} tools.`
    )
  }
  console.log("\n✅ evals:generate --dry-run: no session started.")
  process.exit(0)
}

mkdirSync(OUT, { recursive: true })
const runFile = join(OUT, "run.json")
const sources = sourcesHash()
const run: RunFile = existsSync(runFile)
  ? (JSON.parse(readFileSync(runFile, "utf-8")) as RunFile)
  : {
      generator: "claude-code",
      claudeCode: "",
      claudePath,
      model: "",
      modelOption: model,
      condition,
      context: withMcp ? "mcp" : "none",
      skills: withSkills ? SKILLS : [],
      sessionSkills: [],
      sessionPlugins: [],
      maxTurns: MAX_TURNS,
      effort: "high",
      sources,
      designSystem: {
        version: (
          JSON.parse(readFileSync(join(ROOT, "package.json"), "utf-8")) as {
            version: string
          }
        ).version,
        commit: execSync("git rev-parse HEAD", {
          cwd: ROOT,
          encoding: "utf-8",
        }).trim(),
        dirty:
          execSync("git status --porcelain", {
            cwd: ROOT,
            encoding: "utf-8",
          }).trim() !== "",
      },
      tasks: {},
    }
if (run.condition !== condition || run.modelOption !== model)
  fail(
    `evals/.work/claude-code/${label}/ holds a run of --model ${run.modelOption} --condition ${run.condition}: give this one another --label`
  )
const init: { value?: Init } = run.model
  ? {
      value: {
        claudeCode: run.claudeCode,
        model: run.model,
        skills: run.sessionSkills,
        plugins: run.sessionPlugins,
      },
    }
  : {}

let produced = 0
let skipped = 0
const retry: string[] = []
for (const task of tasks) {
  if (existsSync(join(OUT, `${task.id}.metrics.json`))) {
    skipped++
    continue
  }
  if (sourcesHash() !== run.sources)
    fail(
      `the MCP server, its context, the skills or the instructions changed since this run started (evals/.work/claude-code/${label}/run.json): give this one another --label`
    )
  // A screen left by an attempt that did not finish must not be scored.
  rmSync(join(OUT, `${task.id}.tsx`), { force: true })
  process.stdout.write(`  ${task.id}… `)
  const outcome = await session(task, init)
  if (outcome.kind === "stop") {
    console.log("stopped")
    fail(outcome.reason, outcome.exitCode)
  }
  if (outcome.kind === "retry") {
    console.log(`not done (${outcome.reason})`)
    retry.push(task.id)
    continue
  }
  if (outcome.code !== null)
    writeFileSync(join(OUT, `${task.id}.tsx`), outcome.code)
  run.claudeCode = init.value!.claudeCode
  run.model = init.value!.model
  // The lists vary from one session to the next: keep every name seen.
  const union = (a: string[], b: string[]) => [...new Set([...a, ...b])].sort()
  run.sessionSkills = union(run.sessionSkills, outcome.session.skills)
  run.sessionPlugins = union(run.sessionPlugins, outcome.session.plugins)
  run.tasks[task.id] = outcome.about
  writeFileSync(runFile, JSON.stringify(run, null, 2) + "\n")
  // Last: the task is done.
  writeFileSync(
    join(OUT, `${task.id}.metrics.json`),
    JSON.stringify(outcome.metrics, null, 2) + "\n"
  )
  produced++
  console.log(
    `${outcome.code === null ? "no screen" : "written"} (${outcome.metrics.turns} turns, ${outcome.metrics.toolCalls} tool calls)`
  )
  if (outcome.stopAfter)
    fail(
      `usage limit reached (${outcome.stopAfter}) after ${task.id}, which is kept: rerun the same command to resume`,
      2
    )
}

const left = retry.length
console.log(
  `\n${left > 0 ? "⚠️ " : "✅"} evals:generate: ${produced} task(s) measured, ${skipped} already done, ${left} not done${left > 0 ? ` (${retry.join(", ")}): rerun the same command` : ""}. Score with:\n   npm run evals -- --generator replay --from evals/.work/claude-code/${label} --label ${label} --no-rubric --record`
)
if (left > 0) process.exit(3)
