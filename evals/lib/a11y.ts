/**
 * Stage B, accessibility: the screens rendered in headless Chromium by
 * `evals/a11y/screens.test.tsx` (the component tests' axe and focus checks),
 * read back from Vitest's JSON report.
 */

import { spawnSync } from "node:child_process"
import { existsSync, readFileSync } from "node:fs"
import { join, resolve } from "node:path"

export interface A11yResult {
  renders: boolean
  axe: boolean
  focus: boolean
  failures: string[]
}

interface VitestReport {
  testResults: {
    assertionResults: {
      ancestorTitles: string[]
      title: string
      status: string
      failureMessages: string[]
    }[]
    message?: string
  }[]
}

/**
 * Hooks read from a null dispatcher: React loaded twice, when Vite optimizes a
 * dependency it found mid-run and reloads the page. The screen is not at
 * fault, and a second run, on the optimized dependencies, renders it.
 */
const REACT_TWICE = /Cannot read properties of null \(reading 'use[A-Z]\w*'\)/

export function scoreA11y(
  root: string,
  screensDir: string,
  ids: string[]
): Map<string, A11yResult> {
  const first = runA11y(root, screensDir, ids)
  const twice = [...first].filter(([, r]) =>
    r.failures.some((f) => REACT_TWICE.test(f))
  )
  if (twice.length === 0) return first
  console.log(
    `  React loaded twice for ${twice.map(([id]) => id).join(", ")}: stage B runs again`
  )
  return runA11y(root, screensDir, ids)
}

function runA11y(
  root: string,
  screensDir: string,
  ids: string[]
): Map<string, A11yResult> {
  const output = join(resolve(screensDir), "..", "a11y.json")
  const run = spawnSync(
    "npx",
    [
      "vitest",
      "run",
      "--config",
      "evals/a11y/vitest.config.ts",
      "--reporter=json",
      `--outputFile=${output}`,
    ],
    {
      cwd: root,
      encoding: "utf-8",
      env: { ...process.env, EVALS_SCREENS: resolve(screensDir) },
      maxBuffer: 64 * 1024 * 1024,
    }
  )
  if (!existsSync(output))
    throw new Error(
      `stage B did not run:\n${(run.stdout + run.stderr).slice(-3000)}`
    )
  const report = JSON.parse(readFileSync(output, "utf-8")) as VitestReport
  const out = new Map<string, A11yResult>()
  for (const id of ids)
    out.set(id, { renders: false, axe: false, focus: false, failures: [] })
  for (const file of report.testResults)
    for (const test of file.assertionResults) {
      const result = out.get(test.ancestorTitles[0] ?? "")
      if (!result) continue
      const passed = test.status === "passed"
      if (test.title === "renders") result.renders = passed
      if (test.title === "axe") result.axe = passed
      if (test.title === "focus") result.focus = passed
      if (!passed)
        result.failures.push(
          `${test.title}: ${(test.failureMessages[0] ?? test.status).split("\n").slice(0, 12).join("\n")}`
        )
    }
  return out
}
