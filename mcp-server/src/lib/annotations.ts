import type { ToolAnnotations } from "@modelcontextprotocol/server"

/**
 * Annotations of every tool this server exposes.
 *
 * Without them, the MCP defaults describe a tool as destructive and open-world,
 * so a client may ask the user to confirm each call. Every tool here reads the
 * pre-compiled context cache (dsaireadable_validate_screen and dsaireadable_validate_code only analyze the code they are
 * given): nothing is written, and nothing outside the cache is reached.
 */
export const READ_ONLY: ToolAnnotations = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
}
