/**
 * What a component file says about its own exports, read from their JSDoc:
 * a one-line description and an `@example`. The JSDoc is the single source of
 * both; `component-specs.json` serves them next to each export, and the
 * deprecation chain (`@deprecated`) reads the same declarations.
 *
 * Pure functions: the generator reads the files, the tests feed them invented
 * ones.
 */

import ts from "typescript"

export interface ExportDoc {
  name: string
  /** The JSDoc's first paragraph, on one line. */
  description: string
  /** The `@example` body, as written (JSX, no import, no fence). */
  example: string
}

export function parseComponentFile(code: string, importPath: string) {
  return ts.createSourceFile(
    `${importPath}.tsx`,
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  )
}

/**
 * The declarations a component file exports, by exported name: functions and
 * variables written inline with `export` or listed in a closing
 * `export { … }`. `export { local as public }` exposes `public`; the
 * declaration is `local`'s.
 */
export function exportedDeclarations(file: ts.SourceFile) {
  const exported = new Set<string>()
  /** The specifier of each name listed in a closing `export { … }`. */
  const specifiers = new Map<string, ts.ExportSpecifier>()
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
      for (const spec of statement.exportClause.elements) {
        const local = (spec.propertyName ?? spec.name).text
        exported.add(local)
        specifiers.set(local, spec)
      }
  }
  return { exported, declared, specifiers }
}

/** A JSDoc comment as plain text: `{@link Name}` reads as `Name`. */
export function plainText(comment: ts.JSDocTag["comment"]): string {
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

/** The last JSDoc block written on a declaration, with its tags. */
function docOf(node: ts.Node) {
  const blocks = (node as { jsDoc?: ts.JSDoc[] }).jsDoc
  return blocks?.[blocks.length - 1]
}

/**
 * The JSDoc written before an export specifier, where an export has no
 * declaration of its own (`export { useThing }` of an imported hook): the
 * comment is parsed as if it sat above a declaration.
 */
function specifierDoc(file: ts.SourceFile, spec: ts.ExportSpecifier) {
  const ranges = ts.getLeadingCommentRanges(file.text, spec.getFullStart())
  const block = ranges
    ?.map((r) => file.text.slice(r.pos, r.end))
    .filter((c) => c.startsWith("/**"))
    .pop()
  if (!block) return undefined
  const parsed = ts.createSourceFile(
    "doc.ts",
    `${block}\nconst x = 0`,
    ts.ScriptTarget.Latest,
    true
  )
  return docOf(parsed.statements[0])
}

/**
 * The description and example of the runtime exports of one component file, in
 * declaration order. An export with no JSDoc, or a JSDoc without one of the
 * two, is listed with an empty string: the completeness test names it.
 * Types are not runtime exports and are left out.
 */
export function exportDocs(code: string, importPath: string): ExportDoc[] {
  const file = parseComponentFile(code, importPath)
  const { exported, declared, specifiers } = exportedDeclarations(file)
  const read = (name: string, doc: ts.JSDoc | undefined): ExportDoc => {
    const example = doc?.tags?.find((t) => t.tagName.text === "example")
    return {
      name,
      description: doc
        ? plainText(doc.comment)
            .replace(/\s*\n\s*/g, " ")
            .trim()
        : "",
      example: example ? plainText(example.comment) : "",
    }
  }
  const docs: ExportDoc[] = []
  for (const [name, node] of declared) {
    if (!exported.has(name)) continue
    if (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node))
      continue
    docs.push(read(name, docOf(node)))
  }
  for (const [name, spec] of specifiers)
    if (!declared.has(name) && !spec.isTypeOnly)
      docs.push(read(name, specifierDoc(file, spec)))
  return docs
}
