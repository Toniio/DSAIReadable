/**
 * What the design system's context costs an agent, read from the streams
 * evals:generate keeps (`<task>.jsonl`, evals/README.md): per tool and per
 * `response_format`, the calls, the characters they sent back, and those
 * characters times the turns that send them again. Every turn resends the
 * whole conversation, so an answer read early costs once per turn after it.
 *
 *   npm run evals:context -- evals/.work/claude-code/<label> [<dir>…] [--reserve]
 *
 * `--reserve` sends each recorded call of a `dsaireadable_*` tool again, to the
 * MCP server of this checkout, and estimates what the same sessions would
 * have cost with its answers: each turn's input tokens, less the change in
 * size of the answers before it. The characters per token are the run's own
 * (each turn's growth in tokens against the characters of the results it
 * added). An estimate on the same turns: only a run measures the real cost,
 * since the answers also change what the agent does next.
 */

import { readdirSync, readFileSync } from "node:fs"
import { basename, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { parseArgs } from "node:util"

import { connectMcp } from "./lib/claude"
import {
  readStream,
  resultKey,
  resultText,
  type StreamTurn,
} from "./lib/stream"

const ROOT = fileURLToPath(new URL("..", import.meta.url))

const { values, positionals } = parseArgs({
  options: { reserve: { type: "boolean", default: false } },
  allowPositionals: true,
  strict: true,
})
if (positionals.length === 0) {
  console.error(
    "❌ evals:context: name a run, npm run evals:context -- evals/.work/claude-code/<label>"
  )
  process.exit(1)
}

const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = sorted.length >> 1
  return sorted.length === 0
    ? 0
    : sorted.length % 2
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2
}
const int = (n: number) => Math.round(n).toLocaleString("en-US")
const kib = (chars: number) => `${int(chars / 1024)} KiB`
const pct = (n: number) => `${n > 0 ? "+" : ""}${Math.round(n * 100)} %`

interface Session {
  task: string
  turns: StreamTurn[]
}

/**
 * The characters of tool results per input token: a least-squares line
 * through each turn's growth in tokens against the characters of the results
 * it added. Its intercept is what a turn adds besides (its own text and tool
 * inputs), which the line keeps out of the ratio.
 */
function charsPerToken(sessions: Session[]) {
  const points = sessions.flatMap(({ turns }) =>
    turns.slice(0, -1).map((turn, k) => ({
      x: turn.calls.reduce((a, c) => a + (c.resultChars ?? 0), 0),
      y: turns[k + 1].context - turn.context,
    }))
  )
  const n = points.length
  const mx = points.reduce((a, p) => a + p.x, 0) / n
  const my = points.reduce((a, p) => a + p.y, 0) / n
  const sxx = points.reduce((a, p) => a + (p.x - mx) ** 2, 0)
  const sxy = points.reduce((a, p) => a + (p.x - mx) * (p.y - my), 0)
  return n > 1 && sxx > 0 && sxy > 0 ? sxx / sxy : undefined
}

function measure(dir: string) {
  const sessions: Session[] = readdirSync(dir)
    .filter((f) => f.endsWith(".jsonl"))
    .sort()
    .map((f) => ({
      task: basename(f, ".jsonl"),
      turns: readStream(readFileSync(join(dir, f), "utf-8")),
    }))
    .filter((s) => s.turns.length > 0)
  const rows = new Map<
    string,
    { calls: number; chars: number; resent: number }
  >()
  for (const { turns } of sessions)
    turns.forEach((turn, k) => {
      for (const call of turn.calls) {
        if (call.resultChars === undefined) continue
        const row = rows.get(resultKey(call.tool, call.input)) ?? {
          calls: 0,
          chars: 0,
          resent: 0,
        }
        row.calls++
        row.chars += call.resultChars
        row.resent += call.resultChars * (turns.length - 1 - k)
        rows.set(resultKey(call.tool, call.input), row)
      }
    })
  return { sessions, rows, ratio: charsPerToken(sessions) }
}

const inputOf = (turns: StreamTurn[]) =>
  turns.reduce((a, t) => a + t.context, 0)

function table(header: string[], lines: string[][]) {
  return [
    `| ${header.join(" | ")} |`,
    `| ${header.map(() => "---").join(" | ")} |`,
    ...lines.map((l) => `| ${l.join(" | ")} |`),
  ].join("\n")
}

/** What a client that reads the structured answer sees, as Claude Code does; the text otherwise. */
function rendered(answer: {
  content?: unknown
  structuredContent?: unknown
  isError?: boolean
}) {
  return answer.structuredContent !== undefined && !answer.isError
    ? JSON.stringify(answer.structuredContent)
    : resultText(answer.content)
}

const server = values.reserve ? await connectMcp(ROOT) : undefined
const served = new Map<string, number>()

for (const dir of positionals.map((d) => resolve(d))) {
  const { sessions, rows, ratio } = measure(dir)
  if (sessions.length === 0) {
    console.error(`❌ evals:context: no <task>.jsonl stream in ${dir}`)
    process.exit(1)
  }
  const total = [...rows.values()].reduce((a, r) => a + r.chars, 0)
  const resent = [...rows.values()].reduce((a, r) => a + r.resent, 0)
  const inputs = sessions.map((s) => inputOf(s.turns))
  console.log(
    `\n## ${basename(dir)}\n\n${sessions.length} sessions · median ${int(median(inputs))} input tokens per screen · median ${median(sessions.map((s) => s.turns.length))} turns · ${kib(total)} of tool results${ratio ? ` · ${ratio.toFixed(2)} characters per token` : ""}\n`
  )
  console.log(
    table(
      [
        "Tool",
        "Calls",
        "Sent back",
        "Share",
        "× turns after",
        "Share",
        "≈ tokens per screen",
      ],
      [...rows.entries()]
        .sort((a, b) => b[1].resent - a[1].resent)
        .map(([key, r]) => [
          `\`${key}\``,
          String(r.calls),
          kib(r.chars),
          pct(r.chars / total).slice(1),
          kib(r.resent),
          pct(r.resent / resent).slice(1),
          ratio ? int(r.resent / ratio / sessions.length) : "—",
        ])
    )
  )

  if (!server) continue
  if (!ratio) {
    console.log("\nNo turn grew with a tool result: nothing to estimate.")
    continue
  }
  const after = new Map<string, number>()
  let errors = 0
  const estimates: number[] = []
  for (const { turns } of sessions) {
    let saved = 0
    for (const [k, turn] of turns.entries())
      for (const call of turn.calls) {
        if (
          call.resultChars === undefined ||
          !call.tool.startsWith("dsaireadable_")
        )
          continue
        const id = `${call.tool}\0${JSON.stringify(call.input)}`
        let chars = served.get(id)
        if (chars === undefined) {
          const answer = await server.mcp.callTool({
            name: call.tool,
            arguments: call.input,
          })
          if (answer.isError) errors++
          chars = rendered(answer).length
          served.set(id, chars)
        }
        const key = resultKey(call.tool, call.input)
        after.set(key, (after.get(key) ?? 0) + chars)
        saved += ((call.resultChars - chars) / ratio) * (turns.length - 1 - k)
      }
    estimates.push(inputOf(turns) - saved)
  }
  const before = [...after.keys()].reduce((a, k) => a + rows.get(k)!.chars, 0)
  const now = [...after.values()].reduce((a, n) => a + n, 0)
  console.log(
    `\nRe-served by this checkout: the \`dsaireadable_*\` results go from ${kib(before)} to ${kib(now)} (${pct(now / before - 1)}); estimated median input tokens per screen ${int(median(inputs))} → ${int(median(estimates))} (${pct(median(estimates) / median(inputs) - 1)}), on the same turns${errors ? ` · ${errors} answers are now errors` : ""}.\n`
  )
  console.log(
    table(
      ["Tool", "Calls", "Recorded", "Re-served", "Change"],
      [...after.entries()]
        .sort((a, b) => rows.get(b[0])!.chars - rows.get(a[0])!.chars)
        .map(([key, chars]) => [
          `\`${key}\``,
          String(rows.get(key)!.calls),
          kib(rows.get(key)!.chars),
          kib(chars),
          pct(chars / rows.get(key)!.chars - 1),
        ])
    )
  )
}
await server?.mcp.close()
