/**
 * The model side of the harness: a Claude agent that answers a task with one
 * screen, connected to the design system's MCP server (`--context mcp`) or
 * with no context at all (`--context none`, the baseline the server is
 * measured against), and the rubric of stage C.
 *
 * Needs ANTHROPIC_API_KEY. The measured model is the one named: no fallback to
 * another model, so a refusal counts as a task with no output.
 */

import { resolve } from "node:path"

import Anthropic from "@anthropic-ai/sdk"
import { Client } from "@modelcontextprotocol/client"
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio"

import type { GenerationMetrics, RubricResult } from "./report"
import type { Task } from "./tasks"

const MAX_TURNS = 25
const JUDGE_MODEL = "claude-opus-5-5"

const SYSTEM = `You build screens for a React and Next.js app that uses the DSAIReadable design system: shadcn/ui components in @/components/ui/<name>, Tailwind CSS v4 classes limited to the design system's tokens, and Phosphor icons from @phosphor-icons/react.

Answer with exactly one \`\`\`tsx code block: a complete module whose default export renders the screen and takes no props. Put sample data inline.`

const WITH_MCP = `\n\nThe dsaireadable MCP server describes the design system: its components, page patterns, tokens and rules, and validates code. Use it before and after you write the screen.`

function client(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY)
    throw new Error(
      "ANTHROPIC_API_KEY is not set: the claude generator and the rubric call the Claude API (evals/README.md)"
    )
  return new Anthropic()
}

/** The design system's MCP server over stdio, as a local install runs it. */
async function connectMcp(root: string) {
  const mcp = new Client({ name: "dsaireadable-evals", version: "1.0.0" })
  await mcp.connect(
    new StdioClientTransport({
      command: process.execPath,
      args: ["--import", "tsx", resolve(root, "mcp-server/src/index.ts")],
      stderr: "ignore",
    })
  )
  const { tools } = await mcp.listTools()
  const definitions: Anthropic.Tool[] = tools.map((t) => ({
    name: t.name,
    description: t.description ?? "",
    input_schema: t.inputSchema as Anthropic.Tool.InputSchema,
  }))
  return { mcp, definitions }
}

/** The last ```tsx block of the answer, or null. */
function screenOf(text: string): string | null {
  const blocks = [
    ...text.matchAll(/```(?:tsx|jsx|typescript)?\n([\s\S]*?)```/g),
  ]
  return blocks.at(-1)?.[1] ?? null
}

export function claudeGenerator(options: {
  root: string
  model: string
  context: "mcp" | "none"
}) {
  const anthropic = client()
  let server: Awaited<ReturnType<typeof connectMcp>> | undefined

  return async (task: Task) => {
    if (options.context === "mcp" && !server)
      server = await connectMcp(options.root)
    const metrics: GenerationMetrics = {
      turns: 0,
      toolCalls: 0,
      toolErrors: 0,
      inputTokens: 0,
      outputTokens: 0,
      tools: {},
    }
    const messages: Anthropic.MessageParam[] = [
      { role: "user", content: task.prompt },
    ]
    let text = ""
    while (metrics.turns < MAX_TURNS) {
      metrics.turns++
      const response = await anthropic.messages.create({
        model: options.model,
        max_tokens: 16000,
        system: SYSTEM + (server ? WITH_MCP : ""),
        output_config: { effort: "high" },
        ...(server && { tools: server.definitions }),
        messages,
      })
      metrics.inputTokens +=
        response.usage.input_tokens +
        (response.usage.cache_read_input_tokens ?? 0) +
        (response.usage.cache_creation_input_tokens ?? 0)
      metrics.outputTokens += response.usage.output_tokens
      text = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("\n")
      if (response.stop_reason === "refusal") return { code: null, metrics }
      if (response.stop_reason === "pause_turn") {
        messages.push({ role: "assistant", content: response.content })
        continue
      }
      const calls = response.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
      )
      if (calls.length === 0 || !server) break
      if (response.stop_reason === "max_tokens") break

      messages.push({ role: "assistant", content: response.content })
      // Every result of the turn goes back in one user message.
      const results: Anthropic.ToolResultBlockParam[] = []
      for (const call of calls) {
        metrics.toolCalls++
        metrics.tools[call.name] = (metrics.tools[call.name] ?? 0) + 1
        try {
          const result = await server.mcp.callTool({
            name: call.name,
            arguments: call.input as Record<string, unknown>,
          })
          const content = (result.content as { type: string; text?: string }[])
            .flatMap((c) => (c.type === "text" && c.text ? [c.text] : []))
            .join("\n")
          if (result.isError) metrics.toolErrors++
          results.push({
            type: "tool_result",
            tool_use_id: call.id,
            content,
            ...(result.isError && { is_error: true }),
          })
        } catch (error) {
          metrics.toolErrors++
          results.push({
            type: "tool_result",
            tool_use_id: call.id,
            content: String(error),
            is_error: true,
          })
        }
      }
      messages.push({ role: "user", content: results })
    }
    return { code: screenOf(text), metrics }
  }
}

const CRITERIA = [
  "component_choice",
  "variants",
  "hierarchy",
  "content",
] as const

const RUBRIC = `You grade a screen generated for a design system against the system's own reference implementation for the same request. Score each criterion from 1 to 5:

- component_choice: the screen uses the components the reference uses for each job, or an equally valid one the design system offers; 1 when it rebuilds by hand what a component provides.
- variants: variants, sizes and props match their job (one primary action, destructive for what cannot be undone, the right input type).
- hierarchy: one clear title, a visual hierarchy and grouping as clear as the reference's, nothing that competes with the main action.
- content: the copy follows the reference's voice (sentence case, verbs on actions, errors that say what to do), and every control is named.

Judge only what the code shows. Explain the lowest scores in one or two sentences.`

const SCHEMA = {
  type: "object",
  properties: {
    ...Object.fromEntries(
      CRITERIA.map((c) => [c, { type: "integer", enum: [1, 2, 3, 4, 5] }])
    ),
    notes: { type: "string" },
  },
  required: [...CRITERIA, "notes"],
  additionalProperties: false,
}

/** Stage C: a model grades the screen against the gold standard. */
export async function gradeRubric(input: {
  task: Task
  screen: string
  gold: string
}): Promise<RubricResult> {
  const response = await client().messages.create({
    model: process.env.EVALS_JUDGE_MODEL ?? JUDGE_MODEL,
    max_tokens: 16000,
    system: RUBRIC,
    output_config: {
      effort: "medium",
      format: { type: "json_schema", schema: SCHEMA },
    },
    messages: [
      {
        role: "user",
        content: `<request>\n${input.task.prompt}\n</request>\n\n<reference>\n${input.gold}\n</reference>\n\n<screen>\n${input.screen}\n</screen>`,
      },
    ],
  })
  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
  const parsed = JSON.parse(text) as Record<
    (typeof CRITERIA)[number],
    number
  > & {
    notes: string
  }
  return {
    scores: Object.fromEntries(CRITERIA.map((c) => [c, parsed[c]])),
    notes: parsed.notes,
  }
}
