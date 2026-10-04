/**
 * The stream of a Claude Code session in print mode (`--output-format
 * stream-json`), as evals/generate-claude-code.ts keeps it in `<task>.jsonl`:
 * the turns of the main loop, the context each one sent, the tool calls it
 * made and the size of what each call sent back.
 *
 * Every turn sends the whole conversation again, so a tool result costs its
 * size once per turn that follows it: the measure of evals/context.ts.
 */

/** Claude Code names an MCP tool `mcp__<server>__<tool>`. */
const MCP_PREFIX = /^mcp__.+?__/

interface StreamCall {
  id: string
  /** The tool's own name, without Claude Code's `mcp__<server>__` prefix. */
  tool: string
  input: Record<string, unknown>
  /** The characters of what the call sent back; undefined when no result came. */
  resultChars?: number
}

export interface StreamTurn {
  /** The input tokens the turn sent: uncached, read from the cache and written to it. */
  context: number
  calls: StreamCall[]
}

/** The volume of a tool's results: per tool, and per `response_format` when the call passed one. */
export type ToolResults = Record<string, { calls: number; chars: number }>

interface Line {
  type?: string
  parent_tool_use_id?: string | null
  message?: {
    id?: string
    content?:
      | string
      | {
          type: string
          id?: string
          name?: string
          input?: unknown
          tool_use_id?: string
          content?: unknown
        }[]
    usage?: {
      input_tokens?: number
      cache_read_input_tokens?: number
      cache_creation_input_tokens?: number
    }
  }
}

/** The text of a tool result: a string, or text blocks. */
export function resultText(content: unknown): string {
  if (typeof content === "string") return content
  if (!Array.isArray(content)) return ""
  return content
    .flatMap((b: { type?: string; text?: string }) =>
      b.type === "text" && b.text ? [b.text] : []
    )
    .join("\n")
}

/** The turns of the main loop, in order; a subagent's lines are left out. */
export function readStream(text: string): StreamTurn[] {
  const turns = new Map<string, StreamTurn>()
  const calls = new Map<string, StreamCall>()
  for (const raw of text.split("\n")) {
    if (!raw.trim()) continue
    let line: Line
    try {
      line = JSON.parse(raw) as Line
    } catch {
      continue
    }
    if (line.parent_tool_use_id != null) continue
    const content = line.message?.content
    if (line.type === "assistant" && line.message?.id) {
      // One line per content block: the blocks of one response share its id
      // and its usage, whose input is final; its output_tokens is not, the
      // result line holds the total.
      let turn = turns.get(line.message.id)
      if (!turn) {
        const usage = line.message.usage ?? {}
        turn = {
          context:
            (usage.input_tokens ?? 0) +
            (usage.cache_read_input_tokens ?? 0) +
            (usage.cache_creation_input_tokens ?? 0),
          calls: [],
        }
        turns.set(line.message.id, turn)
      }
      for (const block of Array.isArray(content) ? content : [])
        if (block.type === "tool_use" && block.id && block.name) {
          const call: StreamCall = {
            id: block.id,
            tool: block.name.replace(MCP_PREFIX, ""),
            input:
              block.input && typeof block.input === "object"
                ? (block.input as Record<string, unknown>)
                : {},
          }
          turn.calls.push(call)
          calls.set(call.id, call)
        }
    } else if (line.type === "user" && Array.isArray(content)) {
      for (const block of content) {
        const call =
          block.type === "tool_result" && block.tool_use_id
            ? calls.get(block.tool_use_id)
            : undefined
        if (call) call.resultChars = resultText(block.content).length
      }
    }
  }
  return [...turns.values()]
}

/** The key a call's volume is counted under: `dsaireadable_get_pattern:detailed` when it passed a response_format. */
export function resultKey(tool: string, input: Record<string, unknown>) {
  const format = input.response_format
  return typeof format === "string" ? `${tool}:${format}` : tool
}

/** The volume each tool sent back over a session. */
export function toolResults(turns: StreamTurn[]): ToolResults {
  const results: ToolResults = {}
  for (const call of turns.flatMap((t) => t.calls)) {
    if (call.resultChars === undefined) continue
    const entry = (results[resultKey(call.tool, call.input)] ??= {
      calls: 0,
      chars: 0,
    })
    entry.calls++
    entry.chars += call.resultChars
  }
  return results
}

/** Adds the volumes of `more` into `into`. */
export function addResults(into: ToolResults, more: ToolResults) {
  for (const [key, { calls, chars }] of Object.entries(more)) {
    const entry = (into[key] ??= { calls: 0, chars: 0 })
    entry.calls += calls
    entry.chars += chars
  }
  return into
}
