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

/**
 * What Claude Code answers in place of an MCP result over its output limit
 * (MAX_MCP_OUTPUT_TOKENS, 25,000 tokens by default): the size, the path of a
 * file holding the result, and how to read it.
 */
const CLIENT_LIMIT =
  /^Error: result \([\d,]+ characters\) exceeds maximum allowed tokens\b/

interface StreamCall {
  id: string
  /** The tool's own name, without Claude Code's `mcp__<server>__` prefix. */
  tool: string
  input: Record<string, unknown>
  /** The characters of what the call sent back; undefined when no result came. */
  resultChars?: number
  /** Claude Code refused the result for its size: the agent read that error, not the answer. */
  refused?: boolean
}

export interface StreamTurn {
  /** The input tokens the turn sent: uncached, read from the cache and written to it. */
  context: number
  /** The characters the turn wrote itself, which the next turn sends again: its text and its tool inputs. */
  ownChars: number
  calls: StreamCall[]
}

/** The volume of a tool's results: per tool, and per `response_format` when the call passed one. */
export type ToolResults = Record<string, { calls: number; chars: number }>

interface Line {
  type?: string
  parent_tool_use_id?: string | null
  /** A user line Claude Code adds itself, such as the SKILL.md a Skill call loads. */
  isSynthetic?: boolean
  message?: {
    id?: string
    content?:
      | string
      | {
          type: string
          id?: string
          name?: string
          text?: string
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

/**
 * The turns of the main loop, in order; a subagent's lines are left out. A
 * Skill call's result only says the skill is launching: Claude Code sends its
 * SKILL.md in the synthetic user line that follows, counted with the call.
 */
export function readStream(text: string): StreamTurn[] {
  const turns = new Map<string, StreamTurn>()
  const calls = new Map<string, StreamCall>()
  let answered: StreamCall | undefined
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
      answered = undefined
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
          ownChars: 0,
          calls: [],
        }
        turns.set(line.message.id, turn)
      }
      for (const block of Array.isArray(content) ? content : []) {
        if (block.type === "text") turn.ownChars += block.text?.length ?? 0
        if (block.type === "tool_use")
          turn.ownChars += JSON.stringify(block.input ?? {}).length
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
      }
    } else if (line.type === "user" && Array.isArray(content)) {
      for (const block of content) {
        const call =
          block.type === "tool_result" && block.tool_use_id
            ? calls.get(block.tool_use_id)
            : undefined
        if (call) {
          const text = resultText(block.content)
          call.resultChars = text.length
          if (CLIENT_LIMIT.test(text)) call.refused = true
          answered = call
        } else if (
          line.isSynthetic &&
          block.type === "text" &&
          answered?.tool === "Skill"
        )
          answered.resultChars! += block.text?.length ?? 0
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

/** What a session did, turn by turn: the input tokens each turn sent, and the calls it made at once. */
export interface TimelineTurn {
  context: number
  calls: { tool: string; format?: string; chars?: number }[]
}

/** The calls of each turn in the order the agent wrote them, without their inputs: the history is public. */
export function timeline(turns: StreamTurn[]): TimelineTurn[] {
  return turns.map(({ context, calls }) => ({
    context,
    calls: calls.map(({ tool, input, resultChars }) => {
      const format = input.response_format
      return {
        tool,
        ...(typeof format === "string" && { format }),
        ...(resultChars !== undefined && { chars: resultChars }),
      }
    }),
  }))
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
