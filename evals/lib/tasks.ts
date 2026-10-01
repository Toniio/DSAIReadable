/**
 * The reference tasks (`evals/tasks.json`) and their gold standard: the
 * `## Code example` of a page pattern or a component spec, the code agents are
 * told to follow. A generated screen is compared with it, never with a test
 * page.
 */

import { readFileSync } from "node:fs"
import { resolve } from "node:path"

import { specExample } from "../../tests/spec-examples"

export interface Task {
  id: string
  prompt: string
  gold: { pattern?: string; component?: string; render?: string }
}

export function loadTasks(root: string, only?: string[]): Task[] {
  const { tasks } = JSON.parse(
    readFileSync(resolve(root, "evals/tasks.json"), "utf-8")
  ) as { tasks: Task[] }
  const ids = new Set(tasks.map((t) => t.id))
  for (const id of only ?? [])
    if (!ids.has(id)) throw new Error(`evals/tasks.json has no task "${id}"`)
  return only?.length ? tasks.filter((t) => only.includes(t.id)) : tasks
}

/** Where a task's gold standard is written. */
function goldSource(task: Task): string {
  const { pattern, component } = task.gold
  if (pattern) return `specs/patterns/${pattern}.md`
  if (component) return `specs/components/${component}.md`
  throw new Error(`${task.id}: "gold" names no pattern or component`)
}

/**
 * The gold standard as a screen: the spec's example, with a default export
 * that mounts it when the example exports a component that takes props.
 */
export function goldScreen(root: string, task: Task): string {
  const code = specExample(
    readFileSync(resolve(root, goldSource(task)), "utf-8")
  )
  if (/^export default /m.test(code)) return code
  if (!task.gold.render)
    throw new Error(
      `${task.id}: the example of ${goldSource(task)} has no default export — give the task a "render"`
    )
  return `${code}\nexport default function EvalScreen() {\n  return ${task.gold.render}\n}\n`
}

/** The design-system modules a screen imports: `button` for `@/components/ui/button`. */
export function designSystemImports(code: string): string[] {
  return [
    ...new Set(
      [...code.matchAll(/from\s+["']@\/components\/ui\/([\w-]+)["']/g)].map(
        (m) => m[1]
      )
    ),
  ].sort()
}
