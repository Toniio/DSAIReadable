/**
 * Code validation with the design system's own ESLint rules.
 *
 * `dsaireadable_validate_screen` reads the text of a screen; this reads the
 * syntax tree. The rules are those of `@dsaireadable/eslint-plugin` (its `core`
 * config: the ones that need no stylesheet), the same a project runs on its
 * own code, so a screen that passes here does not fail the project's lint on
 * those rules. A TypeScript pass reports what ESLint cannot: code that does not
 * parse, a name that is not defined.
 *
 * Nothing touches the disk: the code is linted and type-checked in memory.
 */

import plugin from "@dsaireadable/eslint-plugin"
import tsParser from "@typescript-eslint/parser"
import { Linter } from "eslint"
import ts from "typescript"

type Severity = "error" | "warning"

interface CodeIssue {
  source: "eslint" | "typescript"
  severity: Severity
  /** An ESLint rule (`dsaireadable/no-raw-values`) or a TypeScript code (`TS2304`). */
  rule: string
  message: string
  line: number
  column: number
}

export interface CodeReport {
  total_issues: number
  errors: number
  warnings: number
  passed: boolean
  issues: CodeIssue[]
}

const FILENAME = "screen.tsx"

/**
 * TypeScript sees one file and none of its imports: the design system's
 * components, React and every other module are out of reach, so a type error
 * there says nothing about the code (an untyped call fails every overload).
 * Syntax errors are always reported; of the semantic ones, only the kind that
 * needs no types: a name that does not exist, a name declared twice, a
 * constant assigned to.
 */
const SCOPE_ERRORS = new Set([
  2304, // Cannot find name
  2552, // Cannot find name; did you mean
  2451, // Cannot redeclare block-scoped variable
  2300, // Duplicate identifier
  2448, // Block-scoped variable used before its declaration
  2588, // Cannot assign to a constant
])

const linter = new Linter()

const eslintConfig: Linter.Config[] = [
  {
    files: ["**/*.tsx"],
    languageOptions: {
      parser: tsParser as Linter.Parser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  ...(plugin.configs.core as unknown as Linter.Config[]),
]

function eslintIssues(code: string): CodeIssue[] {
  return linter.verify(code, eslintConfig, { filename: FILENAME }).map((m) => ({
    source: "eslint" as const,
    severity: m.severity === 2 || m.fatal ? "error" : "warning",
    rule: m.ruleId ?? "parse-error",
    message: m.message,
    line: m.line,
    column: m.column,
  }))
}

function typescriptIssues(code: string): CodeIssue[] {
  const options: ts.CompilerOptions = {
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    jsx: ts.JsxEmit.Preserve,
    lib: ["lib.esnext.d.ts", "lib.dom.d.ts"],
    types: [],
    noEmit: true,
    skipLibCheck: true,
    noResolve: true,
  }
  const host = ts.createCompilerHost(options)
  const file = ts.createSourceFile(
    FILENAME,
    code,
    ts.ScriptTarget.ESNext,
    true,
    ts.ScriptKind.TSX
  )
  const getSourceFile = host.getSourceFile.bind(host)
  host.getSourceFile = (name, ...rest) =>
    name === FILENAME ? file : getSourceFile(name, ...rest)
  host.fileExists = (name) => name === FILENAME || ts.sys.fileExists(name)

  const program = ts.createProgram([FILENAME], options, host)
  const diagnostics = [
    ...program.getSyntacticDiagnostics(file),
    ...program
      .getSemanticDiagnostics(file)
      .filter((d) => SCOPE_ERRORS.has(d.code)),
  ]
  return diagnostics.map((d) => {
    const at =
      d.start === undefined
        ? { line: 0, character: 0 }
        : file.getLineAndCharacterOfPosition(d.start)
    return {
      source: "typescript" as const,
      severity: "error" as const,
      rule: `TS${d.code}`,
      message: ts.flattenDiagnosticMessageText(d.messageText, " "),
      line: at.line + 1,
      column: at.character + 1,
    }
  })
}

export function validateCode(code: string): CodeReport {
  const syntax = typescriptIssues(code)
  // Both parsers report the same syntax error: keep the TypeScript one, which
  // also finds the errors ESLint cannot reach.
  const lint = eslintIssues(code).filter(
    (i) => i.rule !== "parse-error" || syntax.length === 0
  )
  const issues = [...lint, ...syntax].sort(
    (a, b) => a.line - b.line || a.column - b.column
  )
  const errors = issues.filter((i) => i.severity === "error").length
  return {
    total_issues: issues.length,
    errors,
    warnings: issues.length - errors,
    passed: issues.length === 0,
    issues,
  }
}
