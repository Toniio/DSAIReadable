/**
 * Stage A, deterministic: what the design system's own tooling says about a
 * generated screen, with no model and no browser.
 *
 * - `compiles`: TypeScript with the repository's configuration, against the
 *   real components: a wrong prop or a missing import fails here.
 * - `lint`: ESLint with `@dsaireadable/eslint-plugin`'s `recommended` config,
 *   the one a consuming project runs — native interactive elements, imports
 *   from another UI kit, inline SVG, raw values, classes the design system
 *   does not generate. Its findings are counted by family.
 * - `coverage`: the share of the design-system modules the gold standard
 *   imports that the screen imports too.
 */

import { resolve } from "node:path"

import tsParser from "@typescript-eslint/parser"
import { ESLint, type Linter } from "eslint"
import ts from "typescript"

import plugin from "../../packages/eslint-plugin/src/index"

export type LintFamily =
  | "native-elements"
  | "external-imports"
  | "off-system-classes"
  | "inline-svg"
  | "deprecated"
  | "parse"

const FAMILY: Record<string, LintFamily> = {
  "dsaireadable/no-native-interactive-elements": "native-elements",
  "dsaireadable/no-external-ui-imports": "external-imports",
  "dsaireadable/no-inline-svg": "inline-svg",
  "dsaireadable/no-raw-values": "off-system-classes",
  "dsaireadable/no-class-interpolation": "off-system-classes",
  "better-tailwindcss/no-unknown-classes": "off-system-classes",
  "better-tailwindcss/no-restricted-classes": "off-system-classes",
  "dsaireadable/no-deprecated-imports": "deprecated",
  "dsaireadable/no-deprecated-token": "deprecated",
}

export interface StaticResult {
  compiles: boolean
  typeErrors: string[]
  lint: boolean
  lintErrors: string[]
  lintByFamily: Partial<Record<LintFamily, number>>
  coverage: number
  missing: string[]
}

/** TypeScript diagnostics per file, every file in one program. */
function typeErrors(root: string, files: string[]): Map<string, string[]> {
  const configFile = ts.findConfigFile(root, ts.sys.fileExists, "tsconfig.json")
  if (!configFile) throw new Error("no tsconfig.json at the repository root")
  const parsed = ts.getParsedCommandLineOfConfigFile(configFile, undefined, {
    ...ts.sys,
    onUnRecoverableConfigFileDiagnostic: (d) => {
      throw new Error(ts.flattenDiagnosticMessageText(d.messageText, " "))
    },
  })
  if (!parsed) throw new Error(`cannot read ${configFile}`)
  const program = ts.createProgram(files, { ...parsed.options, noEmit: true })
  const out = new Map<string, string[]>()
  for (const file of files) {
    const source = program.getSourceFile(file)
    const diagnostics = source ? ts.getPreEmitDiagnostics(program, source) : []
    out.set(
      file,
      diagnostics.map((d) => {
        const at =
          d.file && d.start !== undefined
            ? d.file.getLineAndCharacterOfPosition(d.start)
            : { line: 0, character: 0 }
        return `${at.line + 1}:${at.character + 1} TS${d.code} ${ts.flattenDiagnosticMessageText(d.messageText, " ")}`
      })
    )
  }
  return out
}

/**
 * ESLint with `@dsaireadable/eslint-plugin`'s `recommended` config, the one a
 * consuming project runs, from `root` so its Tailwind half reads
 * `styles/globals.css`. Stage A lints the screens with it, and
 * scripts/lint-foundation-examples.ts the examples of the foundations, with
 * `allowInlineConfig: false` so an `eslint-disable` comment cannot hide a finding.
 */
export function designSystemLinter(
  root: string,
  options: Pick<ESLint.Options, "allowInlineConfig"> = {}
): ESLint {
  return new ESLint({
    ...options,
    cwd: root,
    overrideConfigFile: true,
    overrideConfig: [
      {
        files: ["**/*.tsx"],
        languageOptions: {
          parser: tsParser as Linter.Parser,
          parserOptions: { ecmaFeatures: { jsx: true } },
        },
      },
      ...(plugin.configs.recommended as unknown as Linter.Config[]),
    ],
  })
}

async function lintResults(root: string, files: string[]) {
  const eslint = designSystemLinter(root)
  const out = new Map<string, Linter.LintMessage[]>()
  for (const result of await eslint.lintFiles(files))
    out.set(
      resolve(result.filePath),
      result.messages.filter((m) => m.severity === 2 || m.fatal)
    )
  return out
}

/**
 * Scores the screens of a run. `screens` maps a task id to its file; `expected`
 * maps it to the design-system modules of its gold standard.
 */
export async function scoreStatic(
  root: string,
  screens: Map<string, string>,
  expected: Map<string, string[]>,
  imported: Map<string, string[]>
): Promise<Map<string, StaticResult>> {
  const files = [...screens.values()].map((f) => resolve(f))
  const types = typeErrors(root, files)
  const lint = await lintResults(root, files)
  const out = new Map<string, StaticResult>()
  for (const [id, file] of screens) {
    const path = resolve(file)
    const typeList = types.get(path) ?? []
    const messages = lint.get(path) ?? []
    const lintByFamily: Partial<Record<LintFamily, number>> = {}
    for (const m of messages) {
      const family = m.ruleId ? FAMILY[m.ruleId] : "parse"
      if (family) lintByFamily[family] = (lintByFamily[family] ?? 0) + 1
    }
    const want = expected.get(id) ?? []
    const have = new Set(imported.get(id) ?? [])
    const missing = want.filter((m) => !have.has(m))
    out.set(id, {
      compiles: typeList.length === 0,
      typeErrors: typeList,
      lint: messages.length === 0,
      lintErrors: messages.map(
        (m) => `${m.line}:${m.column} ${m.ruleId ?? "parse"} ${m.message}`
      ),
      lintByFamily,
      coverage:
        want.length === 0 ? 1 : (want.length - missing.length) / want.length,
      missing,
    })
  }
  return out
}
