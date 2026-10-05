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
 * (charsPerToken). An estimate on the same turns: only a run measures the
 * real cost, since the answers also change what the agent does next. A result
 * Claude Code refused for its size was recorded as its error, which is what
 * the agent read: those calls are kept as recorded and weighed apart.
 */

import { existsSync, readdirSync, readFileSync } from "node:fs"
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
/** Claude Code's limit on one MCP result, in tokens: MAX_MCP_OUTPUT_TOKENS, 25,000 by default. */
const CLIENT_LIMIT_TOKENS = Number(process.env.MAX_MCP_OUTPUT_TOKENS) || 25_000
const kib = (chars: number) => `${int(chars / 1024)} KiB`
const pct = (n: number) => `${n > 0 ? "+" : ""}${Math.round(n * 100)} %`

interface Session {
  task: string
  turns: StreamTurn[]
}

/**
 * The characters of tool results per input token. Each turn's growth in
 * tokens is fitted, by least squares, to the characters of the results it
 * added and the characters it wrote itself (its text and tool inputs), which
 * the next turn sends too: a turn that writes the screen gets little back, so
 * a fit on the results alone would read its writing as theirs. The ratio is
 * one over the results' coefficient.
 */
function charsPerToken(sessions: Session[]) {
  const points = sessions.flatMap(({ turns }) =>
    turns.slice(0, -1).map((turn, k) => ({
      x: turn.calls.reduce((a, c) => a + (c.resultChars ?? 0), 0),
      o: turn.ownChars,
      y: turns[k + 1].context - turn.context,
    }))
  )
  const n = points.length
  const mean = (f: (p: (typeof points)[number]) => number) =>
    points.reduce((a, p) => a + f(p), 0) / n
  const [mx, mo, my] = [mean((p) => p.x), mean((p) => p.o), mean((p) => p.y)]
  const s = (f: (p: (typeof points)[number]) => number) =>
    points.reduce((a, p) => a + f(p), 0)
  const sxx = s((p) => (p.x - mx) ** 2)
  const soo = s((p) => (p.o - mo) ** 2)
  const sxo = s((p) => (p.x - mx) * (p.o - mo))
  const sxy = s((p) => (p.x - mx) * (p.y - my))
  const soy = s((p) => (p.o - mo) * (p.y - my))
  const det = sxx * soo - sxo ** 2
  const slope = det > 0 ? (sxy * soo - sxo * soy) / det : 0
  return n > 2 && slope > 0 ? 1 / slope : undefined
}

/** The streams of a run's finished tasks: an unfinished one has no metrics, and the report leaves it out too. */
function measure(dir: string) {
  const sessions: Session[] = readdirSync(dir)
    .filter(
      (f) =>
        f.endsWith(".jsonl") &&
        existsSync(join(dir, `${basename(f, ".jsonl")}.metrics.json`))
    )
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
/** Each distinct call's answer: its characters, and whether it is now an error. */
const served = new Map<string, { chars: number; isError: boolean }>()

for (const dir of positionals.map((d) => resolve(d))) {
  const { sessions, rows, ratio } = measure(dir)
  if (sessions.length === 0) {
    console.error(`❌ evals:context: no <task>.jsonl stream in ${dir}`)
    process.exit(1)
  }
  const total = [...rows.values()].reduce((a, r) => a + r.chars, 0)
  const resent = [...rows.values()].reduce((a, r) => a + r.resent, 0)
  const inputs = sessions.map((s) => inputOf(s.turns))
  const refusals = sessions
    .flatMap((s) => s.turns.flatMap((t) => t.calls))
    .filter((c) => c.refused).length
  console.log(
    `\n## ${basename(dir)}\n\n${sessions.length} sessions · median ${int(median(inputs))} input tokens per screen · median ${median(sessions.map((s) => s.turns.length))} turns · ${kib(total)} of tool results${ratio ? ` · ${ratio.toFixed(2)} characters per token` : ""}${refusals ? ` · ${refusals} results refused by Claude Code for their size` : ""}\n`
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
  /** Per key, the calls the agent read: how many, recorded and re-served characters. */
  const after = new Map<
    string,
    { calls: number; recorded: number; now: number }
  >()
  /** Per key, the calls Claude Code refused, and how many of them would still pass its limit. */
  const refused = new Map<
    string,
    { calls: number; recorded: number; now: number; over: number }
  >()
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
        let answer = served.get(id)
        if (answer === undefined) {
          // A tool this checkout no longer has is a protocol error, not an
          // error result: count it as the error answer the agent would read.
          const reply = await server.mcp
            .callTool({ name: call.tool, arguments: call.input })
            .catch((error: unknown) => ({
              content: String(error),
              isError: true,
            }))
          answer = { chars: rendered(reply).length, isError: !!reply.isError }
          served.set(id, answer)
        }
        const key = resultKey(call.tool, call.input)
        // The recorded turns carried Claude Code's error, not the answer:
        // counting the answer would weigh characters the agent never read.
        if (call.refused) {
          const row = refused.get(key) ?? {
            calls: 0,
            recorded: 0,
            now: 0,
            over: 0,
          }
          row.calls++
          row.recorded += call.resultChars
          row.now += answer.chars
          if (answer.chars / ratio > CLIENT_LIMIT_TOKENS) row.over++
          refused.set(key, row)
          continue
        }
        if (answer.isError) errors++
        const row = after.get(key) ?? { calls: 0, recorded: 0, now: 0 }
        row.calls++
        row.recorded += call.resultChars
        row.now += answer.chars
        after.set(key, row)
        saved +=
          ((call.resultChars - answer.chars) / ratio) * (turns.length - 1 - k)
      }
    estimates.push(inputOf(turns) - saved)
  }
  const before = [...after.values()].reduce((a, r) => a + r.recorded, 0)
  const now = [...after.values()].reduce((a, r) => a + r.now, 0)
  const refusedCalls = [...refused.values()].reduce((a, r) => a + r.calls, 0)
  console.log(
    `\nRe-served by this checkout: the \`dsaireadable_*\` results go from ${kib(before)} to ${kib(now)} (${pct(now / before - 1)}); estimated median input tokens per screen ${int(median(inputs))} → ${int(median(estimates))} (${pct(median(estimates) / median(inputs) - 1)}), on the same turns${errors ? ` · ${errors} answers are now errors` : ""}${refusedCalls ? ` · the ${refusedCalls} results Claude Code refused stay as recorded, below` : ""}.\n`
  )
  console.log(
    table(
      ["Tool", "Calls", "Recorded", "Re-served", "Change"],
      [...after.entries()]
        .sort((a, b) => b[1].recorded - a[1].recorded)
        .map(([key, r]) => [
          `\`${key}\``,
          String(r.calls),
          kib(r.recorded),
          kib(r.now),
          pct(r.now / r.recorded - 1),
        ])
    )
  )
  if (refused.size === 0) continue
  console.log(
    `\nRefused by Claude Code for their size ("exceeds maximum allowed tokens", over ${int(CLIENT_LIMIT_TOKENS)} tokens): the agent read the error, so the estimate above keeps it. Re-served, at ${ratio.toFixed(2)} characters per token:\n`
  )
  console.log(
    table(
      [
        "Tool",
        "Calls",
        "Recorded error",
        "Re-served",
        "≈ tokens each",
        "Still refused",
      ],
      [...refused.entries()].map(([key, r]) => [
        `\`${key}\``,
        String(r.calls),
        kib(r.recorded),
        kib(r.now),
        int(r.now / r.calls / ratio),
        `${r.over} of ${r.calls}`,
      ])
    )
  )
}
await server?.mcp.close()
