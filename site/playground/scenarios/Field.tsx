import { useId } from "react"

import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { Args, Story } from "@/site/playground/types"

type Orientation = "vertical" | "horizontal" | "responsive"
type Control = "input" | "choice-card"

const ORIENTATIONS: Orientation[] = ["vertical", "horizontal", "responsive"]

interface FieldArgs {
  control: Control
  orientation: Orientation
  invalid: boolean
  disabled: boolean
  description: boolean
}

function read(args: Args): FieldArgs {
  const orientation = String(args.orientation) as Orientation
  return {
    control: args.control === "choice-card" ? "choice-card" : "input",
    orientation: ORIENTATIONS.includes(orientation) ? orientation : "vertical",
    invalid: Boolean(args["data-invalid"]),
    disabled: Boolean(args["data-disabled"]),
    description: Boolean(args.description),
  }
}

const GROUP = "w-md max-w-full"
/** In a row, the input shares the width with the label column. */
const SHARE = "flex-1"
const HELP = "We only use it to send receipts."
const ERROR = "Enter a valid email address."
const CARD_TITLE = "Accept the terms of service"
const CARD_HELP = "We keep a copy of the version you accept."
const CARD_ERROR = "Accept the terms to continue."

/** The ids the control is described by: its help text, then its error. */
function describedBy(a: FieldArgs, id: string): string | undefined {
  const ids = [
    a.description ? `${id}-help` : null,
    a.invalid ? `${id}-error` : null,
  ].filter(Boolean)
  return ids.length ? ids.join(" ") : undefined
}

function Example({ a }: { a: FieldArgs }) {
  const id = useId()
  const state = {
    "data-invalid": a.invalid ? "true" : undefined,
    "data-disabled": a.disabled ? "true" : undefined,
  }
  if (a.control === "choice-card")
    return (
      <FieldGroup className={GROUP}>
        <FieldLabel htmlFor={id}>
          <Field orientation={a.orientation} {...state}>
            <Checkbox
              id={id}
              aria-labelledby={`${id}-title`}
              disabled={a.disabled}
              aria-invalid={a.invalid || undefined}
              aria-describedby={describedBy(a, id)}
            />
            <FieldContent>
              <FieldTitle id={`${id}-title`}>{CARD_TITLE}</FieldTitle>
              {a.description ? (
                <FieldDescription id={`${id}-help`}>
                  {CARD_HELP}
                </FieldDescription>
              ) : null}
              {a.invalid ? (
                <FieldError id={`${id}-error`}>{CARD_ERROR}</FieldError>
              ) : null}
            </FieldContent>
          </Field>
        </FieldLabel>
      </FieldGroup>
    )
  const input = (
    <Input
      id={id}
      type="email"
      placeholder="you@example.com"
      className={a.orientation === "vertical" ? undefined : SHARE}
      disabled={a.disabled}
      aria-invalid={a.invalid || undefined}
      aria-describedby={describedBy(a, id)}
    />
  )
  const label = <FieldLabel htmlFor={id}>Email address</FieldLabel>
  const help = a.description ? (
    <FieldDescription id={`${id}-help`}>{HELP}</FieldDescription>
  ) : null
  const error = a.invalid ? (
    <FieldError id={`${id}-error`}>{ERROR}</FieldError>
  ) : null
  return (
    <FieldGroup className={GROUP}>
      {a.orientation === "vertical" ? (
        <Field orientation="vertical" {...state}>
          {label}
          {input}
          {help}
          {error}
        </Field>
      ) : (
        <Field orientation={a.orientation} {...state}>
          <FieldContent>
            {label}
            {help}
            {error}
          </FieldContent>
          {input}
        </Field>
      )}
    </FieldGroup>
  )
}

/** The column Prettier wraps at: the code panel shows formatted code. */
const COLUMNS = 80

/** Text filled to the column, the way Prettier wraps JSX text. */
function fill(indent: number, text: string): string[] {
  const pad = " ".repeat(indent)
  const lines: string[] = []
  let current = ""
  for (const word of text.split(" ")) {
    const next = current ? `${current} ${word}` : word
    if (current && pad.length + next.length > COLUMNS) {
      lines.push(pad + current)
      current = word
    } else current = next
  }
  return [...lines, pad + current]
}

/** `<Name props>` opening a block of children, at `indent`. */
function opening(indent: number, name: string, props: string[]): string[] {
  const pad = " ".repeat(indent)
  const line = `${pad}<${[name, ...props].join(" ")}>`
  if (line.length <= COLUMNS) return [line]
  return [
    `${pad}<${name}`,
    ...props.map((prop) => `${pad}  ${prop}`),
    `${pad}>`,
  ]
}

/** An element with a text child, or none, as Prettier prints it at `indent`. */
function element(
  indent: number,
  name: string,
  props: string[],
  text?: string
): string[] {
  const pad = " ".repeat(indent)
  const open = [name, ...props].join(" ")
  const line =
    text === undefined
      ? `${pad}<${open} />`
      : `${pad}<${open}>${text}</${name}>`
  // Prettier breaks an element with children and several props, even short.
  const fits = text === undefined || props.length < 2
  if (fits && line.length <= COLUMNS) return [line]
  if (text === undefined)
    return [
      `${pad}<${name}`,
      ...props.map((prop) => `${pad}  ${prop}`),
      `${pad}/>`,
    ]
  return [
    ...opening(indent, name, props),
    ...fill(indent + 2, text),
    `${pad}</${name}>`,
  ]
}

/** An import, its names on one line when it fits. */
function importLine(names: string[], from: string): string {
  const line = `import { ${names.join(", ")} } from "${from}"`
  if (line.length <= COLUMNS) return line
  return `import {\n${names.map((name) => `  ${name},`).join("\n")}\n} from "${from}"`
}

function code(args: Args): string {
  const a = read(args)
  const field = [
    a.orientation === "vertical" ? "" : `orientation="${a.orientation}"`,
    a.invalid ? 'data-invalid="true"' : "",
    a.disabled ? 'data-disabled="true"' : "",
  ].filter(Boolean)
  const described = describedBy(a, "email")
  if (a.control === "choice-card") {
    const card = [
      'id="terms"',
      'aria-labelledby="terms-title"',
      a.disabled ? "disabled" : "",
      a.invalid ? "aria-invalid" : "",
      described
        ? `aria-describedby="${described.replaceAll("email", "terms")}"`
        : "",
    ].filter(Boolean)
    const content = [
      ...element(12, "FieldTitle", ['id="terms-title"'], CARD_TITLE),
      ...(a.description
        ? element(12, "FieldDescription", ['id="terms-help"'], CARD_HELP)
        : []),
      ...(a.invalid
        ? element(12, "FieldError", ['id="terms-error"'], CARD_ERROR)
        : []),
    ]
    const imports = [
      "Field",
      "FieldContent",
      ...(a.description ? ["FieldDescription"] : []),
      ...(a.invalid ? ["FieldError"] : []),
      "FieldGroup",
      "FieldLabel",
      "FieldTitle",
    ]
    return `import { Checkbox } from "@/components/ui/checkbox"
${importLine(imports, "@/components/ui/field")}

export function Example() {
  return (
    <FieldGroup className="${GROUP}">
      <FieldLabel htmlFor="terms">
${opening(8, "Field", field).join("\n")}
${element(10, "Checkbox", card).join("\n")}
          <FieldContent>
${content.join("\n")}
          </FieldContent>
        </Field>
      </FieldLabel>
    </FieldGroup>
  )
}
`
  }
  const input = [
    'id="email"',
    'type="email"',
    'placeholder="you@example.com"',
    a.orientation === "vertical" ? "" : `className="${SHARE}"`,
    a.disabled ? "disabled" : "",
    a.invalid ? "aria-invalid" : "",
    described ? `aria-describedby="${described}"` : "",
  ].filter(Boolean)
  // In a row, the label and its notes sit in a FieldContent, one level deeper.
  const label = (indent: number) =>
    element(indent, "FieldLabel", ['htmlFor="email"'], "Email address")
  const notes = (indent: number) => [
    ...(a.description
      ? element(indent, "FieldDescription", ['id="email-help"'], HELP)
      : []),
    ...(a.invalid
      ? element(indent, "FieldError", ['id="email-error"'], ERROR)
      : []),
  ]
  const body =
    a.orientation === "vertical"
      ? [...label(8), ...element(8, "Input", input), ...notes(8)]
      : [
          "        <FieldContent>",
          ...label(10),
          ...notes(10),
          "        </FieldContent>",
          ...element(8, "Input", input),
        ]
  const imports = [
    "Field",
    ...(a.orientation === "vertical" ? [] : ["FieldContent"]),
    ...(a.description ? ["FieldDescription"] : []),
    ...(a.invalid ? ["FieldError"] : []),
    "FieldGroup",
    "FieldLabel",
  ]
  return `${importLine(imports, "@/components/ui/field")}
import { Input } from "@/components/ui/input"

export function Example() {
  return (
    <FieldGroup className="${GROUP}">
${opening(6, "Field", field).join("\n")}
${body.join("\n")}
      </Field>
    </FieldGroup>
  )
}
`
}

/**
 * Field: an email field, or a checkbox choice card, in each orientation;
 * `data-invalid` and `data-disabled` go on the Field, and their ARIA and
 * native counterparts on the control.
 */
const story: Story = {
  controls: [
    {
      kind: "select",
      name: "control",
      options: ["input", "choice-card"],
      default: "input",
    },
    {
      kind: "select",
      name: "orientation",
      options: ORIENTATIONS,
      default: "vertical",
    },
    { kind: "boolean", name: "data-invalid", default: false },
    { kind: "boolean", name: "data-disabled", default: false },
    { kind: "boolean", name: "description", default: true },
  ],
  render: (args) => <Example a={read(args)} />,
  code,
  layout: "padded",
}

export default story
