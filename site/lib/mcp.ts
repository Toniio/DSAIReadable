import { fileSize, folders, listFiles, readText } from "@/site/lib/repo"

/**
 * What the MCP server registers and serves, read from its sources and its
 * context cache at build time: the names the Overview lists and the counts
 * the MCP & Skills pages show.
 */

/** The names a file of the server's sources registers with `register<kind>`. */
function registered(file: string, kind: string): string[] {
  return [
    ...readText(file).matchAll(
      new RegExp(`register${kind}\\(\\s*"([\\w-]+)"`, "g")
    ),
  ].map((match) => match[1])
}

/** The tools the MCP server registers, by name, from its sources. */
export function mcpTools(): string[] {
  return listFiles("mcp-server/src/tools", ".ts")
    .filter((file) => !file.endsWith(".test.ts"))
    .flatMap((file) => registered(`mcp-server/src/tools/${file}`, "Tool"))
}

/** The prompts the MCP server registers, by name. */
export function mcpPrompts(): string[] {
  return registered("mcp-server/src/prompts/index.ts", "Prompt")
}

/** The resources the MCP server registers, by name. */
export function mcpResources(): string[] {
  return registered("mcp-server/src/resources/index.ts", "Resource")
}

/** The agent skills of skills/. */
export function skills(): string[] {
  return folders("skills")
}

/** The context cache the server answers from: its files and their total size. */
export function contextCache(): {
  files: string[]
  bytes: number
  largest: { file: string; bytes: number }
} {
  const sizes = listFiles("mcp-server/context", ".json").map((file) => ({
    file,
    bytes: fileSize(`mcp-server/context/${file}`),
  }))
  const largest = [...sizes].sort((a, b) => b.bytes - a.bytes)[0]
  return {
    files: sizes.map((entry) => entry.file),
    bytes: sizes.reduce((total, entry) => total + entry.bytes, 0),
    largest,
  }
}

/** The most characters one answer of the server may hold (`MAX_ANSWER_CHARS`). */
export function answerCap(): number {
  const match = /MAX_ANSWER_CHARS = ([\d_]+)/.exec(
    readText("mcp-server/src/lib/answer-size.ts")
  )
  if (!match) throw new Error("mcp-server/src/lib/answer-size.ts: no cap")
  return Number(match[1].replace(/_/g, ""))
}
