/**
 * What evals/generate-claude-code.ts gives the sessions of each condition and
 * writes in run.json before the first one: the command line, the hash of the
 * sources they read, and the run's description. Functions of the condition and
 * the checkout alone, so `npm run evals:test` checks them without starting a
 * session.
 */

import { createHash } from "node:crypto"
import { existsSync, readdirSync, readFileSync } from "node:fs"
import { join, relative, resolve } from "node:path"

import { MAX_TURNS, mcpServerLaunch, PROMPT, SYSTEM, WITH_MCP } from "./claude"

/** The name the sessions know the MCP server by: its tools are `mcp__dsaireadable__*`. */
export const SERVER = "dsaireadable"
export const CONDITIONS = ["none", "mcp", "mcp-skills", "mcp-prompt"] as const
export type Condition = (typeof CONDITIONS)[number]

const EFFORT = "high"

/**
 * What a condition gives a session: the MCP server, the skills of skills/,
 * and a first message rendered from the server's build_screen prompt. Claude
 * Code lists that prompt as `/mcp__dsaireadable__build_screen`, but splits a
 * slash command's arguments on whitespace and gives each word to the next
 * argument (2.1.318): a request of several words cannot reach `task`. The
 * script asks the server for the prompt itself, as a client that fills its
 * arguments does, and sends the text it renders (evals/README.md).
 */
export function conditionOf(condition: Condition) {
  return {
    mcp: condition !== "none",
    skills: condition === "mcp-skills",
    prompt: condition === "mcp-prompt",
  }
}

/** The skills of skills/: each folder with a SKILL.md. */
export function skillsOf(root: string): string[] {
  return readdirSync(resolve(root, "skills")).filter((name) =>
    existsSync(resolve(root, "skills", name, "SKILL.md"))
  )
}

/**
 * What Claude Code is told: the claude generator's instructions (the answer
 * format alone under mcp-prompt, whose prompt says how to use the server),
 * and the server and the tools of the condition.
 */
export function sessionArgs(
  root: string,
  model: string,
  condition: Condition
): string[] {
  const has = conditionOf(condition)
  return [
    "-p",
    "--model",
    model,
    "--output-format",
    "stream-json",
    "--verbose",
    "--append-system-prompt",
    SYSTEM + (has.mcp && !has.prompt ? WITH_MCP : ""),
    // Hidden from `claude --help`, defined in Claude Code 2.1.76 and 2.1.285.
    "--max-turns",
    String(MAX_TURNS),
    "--effort",
    EFFORT,
    "--permission-mode",
    "dontAsk",
    "--setting-sources",
    "project",
    "--strict-mcp-config",
    ...(has.mcp
      ? [
          "--mcp-config",
          JSON.stringify({
            mcpServers: {
              [SERVER]: { type: "stdio", ...mcpServerLaunch(root) },
            },
          }),
        ]
      : []),
    "--tools",
    has.skills ? "Skill,Read" : "",
    // Read needs no rule: inside the session's folder, where .claude/skills/
    // sits, it is allowed, and dontAsk denies it anywhere else.
    ...(has.mcp
      ? [
          "--allowedTools",
          has.skills ? `mcp__${SERVER},Skill` : `mcp__${SERVER}`,
        ]
      : []),
    ...(has.skills ? [] : ["--disable-slash-commands"]),
    "--no-session-persistence",
    "--no-chrome",
  ]
}

/**
 * A hash of what the sessions read from this checkout: the MCP server's
 * sources and context, the skills, the instructions, and under mcp-prompt the
 * prompt's fixed arguments. A resumed run must find the same, or its tasks
 * would be measured against different sources.
 */
export function sourcesHash(root: string, condition: Condition): string {
  const hash = createHash("sha256")
  hash.update(SYSTEM + WITH_MCP)
  if (conditionOf(condition).prompt) hash.update(JSON.stringify(PROMPT))
  const walk = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const path = join(dir, entry.name)
      return entry.isDirectory() ? walk(path) : [path]
    })
  for (const dir of ["mcp-server/src", "mcp-server/context", "skills"])
    for (const file of walk(resolve(root, dir)).sort())
      hash.update(`\0${relative(root, file)}\0`).update(readFileSync(file))
  return hash.digest("hex").slice(0, 16)
}

/** `<label>/run.json`: what the replay generator of evals/run.ts reads of a run. */
export interface RunFile {
  generator: "claude-code"
  claudeCode: string
  claudePath: string
  model: string
  modelOption: string
  condition: Condition
  context: "mcp" | "none"
  skills: string[]
  /** The MCP prompt each session started from, under mcp-prompt. */
  prompt?: string
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

/**
 * The run.json of a new run, before its first session: the model id and the
 * Claude Code version are filled in by the first session's init message.
 */
export function newRunFile(
  root: string,
  run: Pick<
    RunFile,
    "condition" | "modelOption" | "claudePath" | "designSystem"
  >
): RunFile {
  const has = conditionOf(run.condition)
  return {
    generator: "claude-code",
    claudeCode: "",
    claudePath: run.claudePath,
    model: "",
    modelOption: run.modelOption,
    condition: run.condition,
    context: has.mcp ? "mcp" : "none",
    skills: has.skills ? skillsOf(root) : [],
    ...(has.prompt && { prompt: PROMPT.name }),
    sessionSkills: [],
    sessionPlugins: [],
    maxTurns: MAX_TURNS,
    effort: EFFORT,
    sources: sourcesHash(root, run.condition),
    designSystem: run.designSystem,
    tasks: {},
  }
}
