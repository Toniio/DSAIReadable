import { readFileSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))

/** Absolute path to the pre-compiled context cache. */
export let contextDir = resolve(__dirname, "../../context")

const cache = new Map<string, unknown>()

/**
 * Load a pre-compiled context file.
 *
 * Throws on failure rather than returning `{}`. A silent empty object makes a
 * missing or corrupt cache look like an empty design system, so agents receive
 * confidently wrong answers. The MCP SDK turns a thrown error into a tool
 * result with `isError: true`, which surfaces the problem to the caller.
 */
export function loadContext<T = unknown>(filename: string): T {
  if (cache.has(filename)) return cache.get(filename) as T

  const filePath = resolve(contextDir, filename)
  let raw: string

  try {
    raw = readFileSync(filePath, "utf-8")
  } catch (err) {
    const reason =
      (err as NodeJS.ErrnoException).code === "ENOENT"
        ? "not found"
        : String(err)
    const message =
      `Context file "${filename}" could not be read (${reason}) at ${filePath}. ` +
      `Run \`npm run generate-context\` in mcp-server/ to rebuild the context cache.`
    console.error(`[mcp] ${message}`)
    throw new Error(message)
  }

  let data: T
  try {
    data = JSON.parse(raw) as T
  } catch (err) {
    const message =
      `Context file "${filename}" contains invalid JSON (${(err as Error).message}) at ${filePath}. ` +
      `Run \`npm run generate-context\` in mcp-server/ to regenerate it.`
    console.error(`[mcp] ${message}`)
    throw new Error(message)
  }

  cache.set(filename, data)
  return data
}

/** Wrap a JSON-serialisable payload as an MCP text result. */
export function text(data: unknown): {
  content: { type: "text"; text: string }[]
} {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  }
}

/**
 * Wrap a lookup that found nothing as a tool error. Without `isError`, an
 * agent reads `{ error }` as a successful answer; with it, it sees a failed
 * call and the names it can pass instead.
 */
export function notFound(
  error: string,
  available: string[]
): {
  content: { type: "text"; text: string }[]
  isError: true
} {
  return { ...text({ error, available }), isError: true }
}

/**
 * Serve the cache from another directory, and forget what was loaded. Tests
 * point it at an empty directory to see each tool fail on a missing cache.
 */
export function setContextDir(dir: string): void {
  contextDir = dir
  cache.clear()
}
