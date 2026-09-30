/**
 * The public API of the design system's component files, read by the
 * TypeScript checker: for each runtime export, what it is (component, hook,
 * cva function, other), what a component renders, and which props it takes —
 * with their types as the checker sees them and their defaults as the code
 * writes them.
 */

import { resolve } from "node:path"
import ts from "typescript"

interface ApiProp {
  name: string
  type: string
  /** Default written in the code (destructuring initialiser), if any. */
  default?: string
  /** Declared in the component's own file (inline type, cva variants). */
  own: boolean
  /** File that declares it, when another component file does (`variant` of Button). */
  from?: string
  /** Declared by React's DOM attribute types (`id`, `onClick`…), not by a component or a library. */
  dom: boolean
}

interface Rendered {
  /** The element that receives the rest props: `<div>`, `SliderPrimitive.Root`… */
  element: string
  /** The prop that swaps the element: `asChild` (Slot) or `as` (tag). */
  swappedBy?: "asChild" | "as"
  /** The outermost element, when the props go to one inside it. */
  inside?: string
}

export type ApiExport =
  | {
      kind: "component"
      name: string
      renders: Rendered
      /** Base props type(s) as written, e.g. `React.ComponentProps<"div">`. */
      rest?: string
      /** Every prop the component's type accepts, by name. */
      accepts: Map<string, ApiProp>
      /** Own and defaulted props: the rows the spec must document. */
      documented: ApiProp[]
    }
  | { kind: "hook"; name: string; signature: string; returns: string }
  | { kind: "variants"; name: string }
  | { kind: "other"; name: string; type: string }

export function loadProgram(root: string, files: string[]): ts.Program {
  const configPath = resolve(root, "tsconfig.json")
  const config = ts.readConfigFile(configPath, ts.sys.readFile)
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root)
  return ts.createProgram(
    files.map((f) => resolve(root, f)),
    { ...parsed.options, noEmit: true, incremental: false }
  )
}

const FLAGS =
  ts.TypeFormatFlags.NoTruncation |
  ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope

/** `"a" | "b" | null | undefined` → `"a" | "b"`: optionality is the table's job. */
function typeText(checker: ts.TypeChecker, type: ts.Type, at: ts.Node) {
  // A named type (React.ReactNode, HTMLInputAutoCompleteAttribute) is shown
  // by its name: splitting it to drop undefined would unroll it.
  if (type.aliasSymbol) return checker.typeToString(type, at, FLAGS)
  const nonNull = checker.getNonNullableType(type)
  if (nonNull.aliasSymbol) return checker.typeToString(nonNull, at, FLAGS)
  // `alias | undefined` loses the alias; the declaration still names it.
  const named = type.isUnion()
    ? type.types.find((t) => t.aliasSymbol)
    : undefined
  if (
    named &&
    type.isUnion() &&
    type.types.every(
      (t) =>
        t === named || t.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Null)
    )
  )
    return checker.typeToString(named, at, FLAGS)
  const parts = type.isUnion() ? type.types : [type]
  const kept = parts.filter(
    (t) => !(t.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Null))
  )
  if (kept.length === parts.length) return checker.typeToString(type, at, FLAGS)
  // `boolean` is `true | false` inside a union: keep it whole.
  const hasTrue = kept.some((t) => checker.typeToString(t) === "true")
  const hasFalse = kept.some((t) => checker.typeToString(t) === "false")
  const texts = kept
    .filter(
      (t) =>
        !(
          hasTrue &&
          hasFalse &&
          ["true", "false"].includes(checker.typeToString(t))
        )
    )
    .map((t) => checker.typeToString(t, at, FLAGS))
  if (hasTrue && hasFalse) texts.push("boolean")
  return texts.join(" | ")
}

/** Distinct member types joined; a function type is parenthesized first. */
function unionText(texts: string[]): string {
  const distinct = [...new Set(texts)]
  if (distinct.length === 1) return distinct[0]
  return distinct.map((t) => (t.includes("=>") ? `(${t})` : t)).join(" | ")
}

/** The tag of the JSX element that spreads the rest props (`{...props}`). */
function spreadTarget(fn: ts.FunctionLikeDeclaration): string | undefined {
  const param = fn.parameters[0]
  if (!param || !ts.isObjectBindingPattern(param.name)) return undefined
  const rest = param.name.elements.find((e) => e.dotDotDotToken)?.name.getText()
  if (!rest) return undefined
  let tag: string | undefined
  const visit = (node: ts.Node): void => {
    if (tag) return
    if (
      (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
      node.attributes.properties.some(
        (a) => ts.isJsxSpreadAttribute(a) && a.expression.getText() === rest
      )
    ) {
      tag = node.tagName.getText()
      return
    }
    ts.forEachChild(node, visit)
  }
  if (fn.body) visit(fn.body)
  return tag
}

/** The outermost JSX tag a function returns. */
function renderedTag(fn: ts.FunctionLikeDeclaration): string | undefined {
  let tag: string | undefined
  const visit = (node: ts.Node): void => {
    if (tag) return
    if (ts.isReturnStatement(node) && node.expression) {
      let e: ts.Expression = node.expression
      while (ts.isParenthesizedExpression(e)) e = e.expression
      if (ts.isJsxElement(e)) tag = e.openingElement.tagName.getText()
      else if (ts.isJsxSelfClosingElement(e)) tag = e.tagName.getText()
      else if (ts.isJsxFragment(e)) tag = "<>"
      return
    }
    // Nested functions (callbacks, render props) return their own JSX.
    if (ts.isFunctionLike(node) && node !== fn) return
    ts.forEachChild(node, visit)
  }
  if (fn.body) visit(fn.body)
  return tag
}

const showTag = (t: string) => (/^[a-z]/.test(t) ? `<${t}>` : t)

/**
 * What a returned tag stands for. `Comp` is either
 * `const Comp = asChild ? Slot.Root : "button"` (→ `<button>`, swapped by
 * asChild), a destructured `as: Comp = "h2"` (→ `<h2>`, swapped by as) or
 * `const Comp = as ?? \`h${level}\`` (→ `<h{level}>`, swapped by as).
 */
function renderedOf(fn: ts.FunctionLikeDeclaration, tag: string): Rendered {
  const param = fn.parameters[0]
  if (param && ts.isObjectBindingPattern(param.name))
    for (const el of param.name.elements)
      if (
        el.name.getText() === tag &&
        el.propertyName?.getText() === "as" &&
        el.initializer &&
        ts.isStringLiteral(el.initializer)
      )
        return { element: showTag(el.initializer.text), swappedBy: "as" }

  let rendered: Rendered | undefined
  const visit = (node: ts.Node): void => {
    if (!ts.isVariableDeclaration(node) || node.name.getText() !== tag) {
      ts.forEachChild(node, visit)
      return
    }
    let init = node.initializer
    while (
      init &&
      (ts.isParenthesizedExpression(init) || ts.isAsExpression(init))
    )
      init = init.expression
    let right = init && ts.isBinaryExpression(init) ? init.right : undefined
    while (
      right &&
      (ts.isParenthesizedExpression(right) || ts.isAsExpression(right))
    )
      right = right.expression
    if (
      init &&
      ts.isConditionalExpression(init) &&
      init.condition.getText() === "asChild"
    ) {
      const f = init.whenFalse
      rendered = {
        element: showTag(ts.isStringLiteral(f) ? f.text : f.getText()),
        swappedBy: "asChild",
      }
    } else if (
      init &&
      ts.isBinaryExpression(init) &&
      init.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken &&
      init.left.getText() === "as" &&
      right &&
      ts.isTemplateExpression(right)
    ) {
      const t = right
      const text =
        t.head.text +
        t.templateSpans
          .map((s) => `{${s.expression.getText()}}${s.literal.text}`)
          .join("")
      rendered = { element: showTag(text), swappedBy: "as" }
    }
    ts.forEachChild(node, visit)
  }
  if (fn.body) visit(fn.body)
  return rendered ?? { element: showTag(tag) }
}

/** Base types of `A & B & { own } & VariantProps<…>`: A and B, as written. */
function restText(annotation: ts.TypeNode | undefined): string | undefined {
  if (!annotation) return undefined
  const members = ts.isIntersectionTypeNode(annotation)
    ? annotation.types
    : [annotation]
  const base = members.filter(
    (m) =>
      !ts.isTypeLiteralNode(m) &&
      !(ts.isTypeReferenceNode(m) && m.typeName.getText() === "VariantProps")
  )
  return base.length > 0
    ? base.map((m) => m.getText().replace(/\s+/g, " ")).join(" & ")
    : undefined
}

function componentOf(
  checker: ts.TypeChecker,
  name: string,
  fn: ts.FunctionLikeDeclaration
): ApiExport {
  const file = fn.getSourceFile()
  const param = fn.parameters[0]
  const accepts = new Map<string, ApiProp>()
  const defaults = new Map<string, string>()

  if (param && ts.isObjectBindingPattern(param.name))
    for (const el of param.name.elements) {
      if (el.dotDotDotToken || !el.initializer) continue
      const key = (el.propertyName ?? el.name).getText().replace(/^"|"$/g, "")
      defaults.set(key, el.initializer.getText())
    }

  if (param) {
    const type = checker.getTypeAtLocation(param)
    // A union (Radix Accordion: single | multiple) only has the props its
    // members share; each member's own props are props too.
    // A prop several members declare takes each member's type: `type` is
    // "single" | "multiple", `value` is string | string[].
    const symbols = new Map<string, ts.Symbol[]>()
    for (const member of type.isUnion() ? type.types : [type])
      for (const symbol of checker.getPropertiesOfType(member))
        symbols.set(symbol.name, [...(symbols.get(symbol.name) ?? []), symbol])
    for (const variants of symbols.values()) {
      const symbol = variants[0]
      const decls = symbol.getDeclarations() ?? []
      const own = decls.some((d) => d.getSourceFile() === file)
      // A type the file writes itself is shown as written: the checker would
      // expand `React.ComponentProps<typeof TooltipContent>` into its members.
      const written = decls.find(
        (d): d is ts.PropertySignature =>
          ts.isPropertySignature(d) &&
          d.getSourceFile() === file &&
          d.type !== undefined
      )
      const elsewhere = decls
        .map((d) => d.getSourceFile().fileName)
        .find((f) => f !== file.fileName && /\/components\/ui\//.test(f))
      accepts.set(symbol.name, {
        name: symbol.name,
        from: own
          ? undefined
          : elsewhere?.replace(/^.*\/(components\/ui\/)/, "$1"),
        type: written
          ? written.type!.getText().replace(/\s+/g, " ")
          : unionText(
              variants.map((v) =>
                typeText(
                  checker,
                  checker.getTypeOfSymbolAtLocation(v, param),
                  param
                )
              )
            ),
        default: defaults.get(symbol.name),
        own,
        dom: decls.every((d) =>
          /\/node_modules\/@types\/react\//.test(d.getSourceFile().fileName)
        ),
      })
    }
  }

  const outer = renderedTag(fn)
  const target = spreadTarget(fn) ?? outer
  const renders: Rendered = target ? renderedOf(fn, target) : { element: "—" }
  if (outer && target && outer !== target && /^[a-z]/.test(outer))
    renders.inside = showTag(outer)
  const documented = [...accepts.values()].filter(
    (p) => p.own || p.default !== undefined
  )
  return {
    kind: "component",
    name,
    renders,
    rest: restText(param?.type),
    accepts,
    documented,
  }
}

/** Runtime exports of a component file, in `export { … }` order. */
export function apiOf(program: ts.Program, file: string): ApiExport[] {
  const checker = program.getTypeChecker()
  const sf = program.getSourceFile(file)
  if (!sf) throw new Error(`${file}: not in the program`)

  const declarations = new Map<string, ts.Node>()
  for (const st of sf.statements) {
    if (ts.isFunctionDeclaration(st) && st.name)
      declarations.set(st.name.text, st)
    if (ts.isVariableStatement(st))
      for (const d of st.declarationList.declarations)
        declarations.set(d.name.getText(), d)
  }

  const names: string[] = []
  for (const st of sf.statements) {
    if (
      ts.isExportDeclaration(st) &&
      !st.isTypeOnly &&
      st.exportClause &&
      ts.isNamedExports(st.exportClause)
    )
      for (const e of st.exportClause.elements) {
        if (e.isTypeOnly) continue
        names.push(e.name.text)
        // Re-exported from a package (the hooks of @shadcn/react): its
        // declaration is the package's.
        if (declarations.has((e.propertyName ?? e.name).text)) continue
        const local = checker.getExportSpecifierLocalTargetSymbol(e)
        const target =
          local && local.flags & ts.SymbolFlags.Alias
            ? checker.getAliasedSymbol(local)
            : local
        const decl = target?.declarations?.[0]
        if (decl) declarations.set(e.name.text, decl)
      }
    const exported = ts.canHaveModifiers(st)
      ? ts.getModifiers(st)?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
      : false
    if (exported && ts.isFunctionDeclaration(st) && st.name)
      names.push(st.name.text)
    if (exported && ts.isVariableStatement(st))
      for (const d of st.declarationList.declarations)
        names.push(d.name.getText())
  }

  return names.map((name): ApiExport => {
    const decl = declarations.get(name)
    const fn =
      decl && ts.isFunctionDeclaration(decl)
        ? decl
        : decl &&
            ts.isVariableDeclaration(decl) &&
            decl.initializer &&
            (ts.isArrowFunction(decl.initializer) ||
              ts.isFunctionExpression(decl.initializer))
          ? decl.initializer
          : undefined
    if (
      decl &&
      ts.isVariableDeclaration(decl) &&
      decl.initializer &&
      ts.isCallExpression(decl.initializer) &&
      decl.initializer.expression.getText() === "cva"
    )
      return { kind: "variants", name }
    if (fn && /^use[A-Z]/.test(name)) {
      const signature = checker.getSignatureFromDeclaration(fn)!
      return {
        kind: "hook",
        name,
        signature: `${name}(${fn.parameters.map((p) => p.getText()).join(", ")})`,
        returns: checker.typeToString(
          checker.getReturnTypeOfSignature(signature),
          fn,
          FLAGS
        ),
      }
    }
    if (fn && /^[A-Z]/.test(name)) return componentOf(checker, name, fn)
    const node = decl ?? sf
    return {
      kind: "other",
      name,
      type: checker.typeToString(checker.getTypeAtLocation(node), node, FLAGS),
    }
  })
}
