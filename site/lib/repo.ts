import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import path from "node:path"

/**
 * The repository root. The site is built from the repository's own files —
 * the specs, the tokens, the MCP context — read at build time. The npm
 * scripts run from the root; `next dev` started inside site/ runs one level
 * below it.
 */
export const ROOT = existsSync(path.join(process.cwd(), "specs"))
  ? process.cwd()
  : path.join(process.cwd(), "..")

const cache = new Map<string, unknown>()

/** A file of the repository, as text. */
export function readText(file: string): string {
  return readFileSync(path.join(ROOT, file), "utf-8")
}

/** A JSON file of the repository, parsed once per build. */
export function readJson<T>(file: string): T {
  if (!cache.has(file)) cache.set(file, JSON.parse(readText(file)))
  return cache.get(file) as T
}

/** The files of a repository folder with an extension, sorted by name. */
export function listFiles(dir: string, extension: string): string[] {
  const full = path.join(ROOT, dir)
  if (!existsSync(full)) return []
  return readdirSync(full)
    .filter((file) => file.endsWith(extension))
    .sort()
}

/** The names of the folders under a repository folder, sorted. */
export function folders(dir: string): string[] {
  return readdirSync(path.join(ROOT, dir), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
}

/** The size of a repository file, in bytes. */
export function fileSize(file: string): number {
  return statSync(path.join(ROOT, file)).size
}

/** Whether a repository path exists. */
export function exists(file: string): boolean {
  return existsSync(path.join(ROOT, file))
}
