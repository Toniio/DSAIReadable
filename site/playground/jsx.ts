import type { Args, Control } from "@/site/playground/types"

/**
 * A prop as JSX: `variant="outline"`, `level={2}`, `disabled`. A JSX string
 * has no escapes, and decodes HTML entities: a string with a quote, a
 * backslash or an ampersand is written as a JavaScript string in braces.
 */
function attribute(name: string, value: Args[string]): string {
  if (value === true) return name
  if (typeof value === "string")
    return /["\\&]/.test(value)
      ? `${name}={${JSON.stringify(value)}}`
      : `${name}="${value}"`
  return `${name}={${JSON.stringify(value)}}`
}

/**
 * A text child as JSX: as is, or as a JavaScript string in braces when it
 * holds a character JSX would read as code or as an entity (`{`, `<`, `&`).
 */
export function text(value: string): string {
  return /[{}<>&]/.test(value) ? `{${JSON.stringify(value)}}` : value
}

/** The props a control changed from its default, ready to write as JSX. */
export function changedArgs(controls: Control[], args: Args): Args {
  const out: Args = {}
  for (const control of controls) {
    if (control.name === "children") continue
    const value = args[control.name]
    if (value === undefined || value === "") continue
    if (value === control.default && !control.always) continue
    out[control.name] =
      control.kind === "select" && control.numeric ? Number(value) : value
  }
  return out
}

/**
 * The code of an element: `<Button variant="outline">Save</Button>`, on one
 * line, or one prop per line when it would be long. `children` is written as
 * given: pass a text through `text()`.
 */
export function element(name: string, props: Args, children?: string): string {
  const attributes = Object.entries(props).map(([key, value]) =>
    attribute(key, value)
  )
  const inline = attributes.length ? ` ${attributes.join(" ")}` : ""
  const multiline = inline.length > 60
  const open = multiline
    ? `<${name}\n${attributes.map((line) => `  ${line}`).join("\n")}\n`
    : `<${name}${inline}`
  if (children === undefined || children === "")
    return `${open}${multiline ? "" : " "}/>`
  return `${open}>${multiline ? "\n  " : ""}${children}${multiline ? "\n" : ""}</${name}>`
}

/** A module that imports a component, and any other import given, and renders it. */
export function snippet(
  file: string,
  name: string,
  jsx: string,
  imports: string[] = []
): string {
  const body = jsx
    .split("\n")
    .map((line) => `    ${line}`)
    .join("\n")
  const head = [
    ...imports,
    `import { ${name} } from "@/components/ui/${file}"`,
  ].join("\n")
  return `${head}\n\nexport function Example() {\n  return (\n${body}\n  )\n}\n`
}
