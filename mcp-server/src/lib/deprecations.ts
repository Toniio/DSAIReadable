/**
 * What the design system has deprecated, read from its two sources of truth so
 * that an agent finds it through every channel:
 *
 *   - a token: `$deprecated` (DTCG 2025.10, § 5.2.4) plus
 *     `$extensions["design.dsaireadable"].replacement`, the path of the token
 *     that takes its place;
 *   - a component export: a JSDoc `@deprecated` tag in `components/ui/*.tsx`,
 *     with `{@link Replacement}` for what to use instead.
 *
 * `dsaireadable_get_deprecations` serves the result, the token docs and the
 * manifest carry the tokens, and `@dsaireadable/eslint-plugin` lints the same
 * lists (`no-deprecated-imports`, `no-deprecated-token`). Pure functions: the
 * generator reads the files, the tests feed them invented ones.
 */

import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import ts from "typescript"

/** The `$extensions` key this design system's own properties live under. */
const EXTENSION = "design.dsaireadable"

interface TokenNode {
  $value?: unknown
  $description?: string
  $deprecated?: boolean | string
  $extensions?: Record<string, unknown>
}

export interface TokenDeprecation {
  token: string
  css_var: string
  /** The Tailwind class the token is bridged to (`$extensions.docs.tailwind`). */
  tailwind: string | null
  message: string
  replacement: { token: string; css_var: string } | null
}

export interface ExportDeprecation {
  name: string
  /** What a project imports it from: `@/components/ui/button`. */
  import_path: string
  message: string
  /** The export to use instead, from `{@link Name}`. */
  replacement: string | null
}

export interface Deprecations {
  tokens: TokenDeprecation[]
  exports: ExportDeprecation[]
}

/** The lists `@dsaireadable/eslint-plugin` lints, keyed as its rules read them. */
export interface LintLists {
  /** `@/components/ui/foo#Bar` → reason. */
  imports: Record<string, string>
  /** `--color-x` or a Tailwind class → reason. */
  tokens: Record<string, string>
}

const cssVarOf = (token: string) => `--${token.replace(/\./g, "-")}`

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

/** The `replacement` a token declares, or null. */
export function replacementOf(node: TokenNode): string | null {
  const own = node.$extensions?.[EXTENSION]
  if (own === undefined) return null
  const replacement = isObject(own) ? own.replacement : undefined
  if (replacement === undefined) return null
  if (typeof replacement !== "string" || replacement === "")
    throw new Error(
      `$extensions["${EXTENSION}"].replacement must name a token path, such as "color.text.subtle"`
    )
  return replacement
}

/** The deprecated leaves of a token tree, in document order. */
export function tokenDeprecations(
  tree: Record<string, unknown>,
  path: string[] = []
): TokenDeprecation[] {
  return Object.entries(tree).flatMap(([key, child]) => {
    if (key.startsWith("$") || !isObject(child)) return []
    const here = [...path, key]
    if (!("$value" in child)) return tokenDeprecations(child, here)
    const node = child as TokenNode
    if (node.$deprecated === undefined || node.$deprecated === false) return []
    const token = here.join(".")
    const replacement = replacementOf(node)
    const docs = node.$extensions?.docs
    const tailwind =
      isObject(docs) && typeof docs.tailwind === "string" ? docs.tailwind : null
    return [
      {
        token,
        css_var: cssVarOf(token),
        tailwind,
        message:
          typeof node.$deprecated === "string"
            ? node.$deprecated
            : (node.$description ?? "Deprecated."),
        replacement: replacement
          ? { token: replacement, css_var: cssVarOf(replacement) }
          : null,
      },
    ]
  })
}

/** A JSDoc comment as plain text: `{@link Name}` reads as `Name`. */
function plainText(comment: ts.JSDocTag["comment"]): string {
  if (comment === undefined) return ""
  if (typeof comment === "string") return comment.trim()
  return comment
    .map((part) =>
      ts.isJSDocLink(part) ||
      ts.isJSDocLinkCode(part) ||
      ts.isJSDocLinkPlain(part)
        ? (part.name?.getText() ?? part.text)
        : part.text
    )
    .join("")
    .trim()
}

/**
 * The exports of one component file that carry a JSDoc `@deprecated` tag. The
 * tag sits on the declaration, which shadcn/ui components export either inline
 * or in a closing `export { … }`, so both count. An export that says nothing
 * about what to do instead is an error: a deprecation without guidance leaves
 * the agent where it started.
 */
export function exportDeprecations(
  code: string,
  importPath: string
): ExportDeprecation[] {
  const file = ts.createSourceFile(
    `${importPath}.tsx`,
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  )

  const exported = new Set<string>()
  const declared = new Map<string, ts.Node>()
  for (const statement of file.statements) {
    const inline =
      ts.canHaveModifiers(statement) &&
      ts
        .getModifiers(statement)
        ?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
    const names: string[] = []
    if (ts.isVariableStatement(statement)) {
      for (const decl of statement.declarationList.declarations)
        if (ts.isIdentifier(decl.name)) names.push(decl.name.text)
    } else if (
      (ts.isFunctionDeclaration(statement) ||
        ts.isClassDeclaration(statement) ||
        ts.isInterfaceDeclaration(statement) ||
        ts.isTypeAliasDeclaration(statement)) &&
      statement.name
    ) {
      names.push(statement.name.text)
    }
    for (const name of names) {
      declared.set(name, statement)
      if (inline) exported.add(name)
    }
    if (
      ts.isExportDeclaration(statement) &&
      !statement.moduleSpecifier &&
      statement.exportClause &&
      ts.isNamedExports(statement.exportClause)
    )
      for (const spec of statement.exportClause.elements)
        // `export { local as public }` exposes `public`; the tag is on `local`.
        exported.add((spec.propertyName ?? spec.name).text)
  }

  const found: ExportDeprecation[] = []
  for (const [name, node] of declared) {
    if (!exported.has(name)) continue
    const tag = ts.getJSDocDeprecatedTag(node)
    if (!tag) continue
    const message = plainText(tag.comment)
    if (message === "")
      throw new Error(
        `${importPath}: ${name} is @deprecated without a message — say what to use instead, with {@link Replacement}`
      )
    const link = Array.isArray(tag.comment)
      ? tag.comment.find(
          (part) =>
            ts.isJSDocLink(part) ||
            ts.isJSDocLinkCode(part) ||
            ts.isJSDocLinkPlain(part)
        )
      : undefined
    found.push({
      name,
      import_path: importPath,
      message,
      replacement:
        link && "name" in link && link.name ? link.name.getText() : null,
    })
  }
  return found
}

/** The reason a lint message gives: the message, and the replacement if it does not name it. */
const reasonOf = (
  message: string,
  replacement: string | null,
  names: string[]
) =>
  replacement && !names.some((n) => message.includes(n))
    ? `${message} Use ${replacement} instead.`
    : message

/** What `@dsaireadable/eslint-plugin` needs, derived so the lint cannot drift from the data. */
export function lintLists({ tokens, exports }: Deprecations): LintLists {
  const lists: LintLists = { imports: {}, tokens: {} }
  for (const e of exports)
    lists.imports[`${e.import_path}#${e.name}`] = reasonOf(
      e.message,
      e.replacement,
      e.replacement ? [e.replacement] : []
    )
  for (const t of tokens) {
    const reason = reasonOf(
      t.message,
      t.replacement?.css_var ?? null,
      t.replacement ? [t.replacement.token, t.replacement.css_var] : []
    )
    lists.tokens[t.css_var] = reason
    if (t.tailwind) lists.tokens[t.tailwind] = reason
  }
  return lists
}

/**
 * Everything deprecated in a checkout: the semantic tokens, and the exports of
 * `components/ui/*.tsx`. Both the context generator and the plugin's list read
 * it, so they cannot disagree.
 */
export function collectDeprecations(
  root: string,
  semanticTree: Record<string, unknown>
): Deprecations {
  const ui = join(root, "components/ui")
  return {
    tokens: tokenDeprecations(semanticTree),
    exports: readdirSync(ui)
      .filter((f) => f.endsWith(".tsx"))
      .sort()
      .flatMap((f) =>
        exportDeprecations(
          readFileSync(join(ui, f), "utf-8"),
          `@/components/ui/${f.replace(/\.tsx$/, "")}`
        )
      ),
  }
}
