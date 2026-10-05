/**
 * The most characters one answer of a tool holds. Claude Code refuses an MCP
 * result over 25,000 tokens by default (MAX_MCP_OUTPUT_TOKENS): the agent
 * reads an error and the path of a file that holds the answer, which an agent
 * with no Read tool never opens. The 0.3.0 evals ran at 2.47 characters per
 * token, which puts that limit near 61,700 characters; 40,000 stays under it
 * down to 1.6 characters per token. src/test.ts calls every tool with its
 * widest input against it.
 */
export const MAX_ANSWER_CHARS = 40_000

/**
 * How many of `items`, from the first, fit in `room` characters of a JSON
 * array: at least one, so a list read page by page always moves forward.
 */
export function fitting(items: readonly unknown[], room: number): number {
  let used = 0
  for (const [k, item] of items.entries()) {
    used += JSON.stringify(item).length + (k > 0 ? 1 : 0)
    if (used > room) return Math.max(k, 1)
  }
  return items.length
}

/**
 * A validation report that fits in one answer: its counts stay whole, and the
 * issues past the cap are counted in `issues_not_listed` instead of listed.
 * Fixing the listed issues and validating again lists the next ones.
 */
export function withinCap<R extends { issues: unknown[] }>(report: R) {
  const envelope = JSON.stringify({
    ...report,
    issues: [],
    issues_not_listed: report.issues.length,
  }).length
  const listed = fitting(report.issues, MAX_ANSWER_CHARS - envelope)
  return listed === report.issues.length
    ? report
    : {
        ...report,
        issues: report.issues.slice(0, listed),
        issues_not_listed: report.issues.length - listed,
      }
}
