import { useId } from "react"

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox"
import { Label } from "@/components/ui/label"
import type { Args, Story } from "@/site/playground/types"

/** More than 15 options: the threshold of rule-20 for a Combobox. */
const COUNTRIES = [
  "Argentina",
  "Australia",
  "Brazil",
  "Canada",
  "Chile",
  "Denmark",
  "Egypt",
  "Finland",
  "Germany",
  "India",
  "Japan",
  "Kenya",
  "Mexico",
  "Norway",
  "Portugal",
  "Spain",
  "Sweden",
  "United States",
]

const SELECTED = ["Canada", "Japan"]

interface ComboboxArgs {
  open: boolean
  multiple: boolean
  showTrigger: boolean
  showClear: boolean
  disabled: boolean
  invalid: boolean
  placeholder: string
}

function read(args: Args): ComboboxArgs {
  return {
    open: Boolean(args.open),
    multiple: Boolean(args.multiple),
    showTrigger: Boolean(args.showTrigger),
    showClear: Boolean(args.showClear),
    disabled: Boolean(args.disabled),
    invalid: Boolean(args["aria-invalid"]),
    placeholder: String(args.placeholder),
  }
}

function Options() {
  return (
    <>
      <ComboboxEmpty>No countries found.</ComboboxEmpty>
      <ComboboxList>
        {(item: string) => (
          <ComboboxItem key={item} value={item}>
            {item}
          </ComboboxItem>
        )}
      </ComboboxList>
    </>
  )
}

function CountryCombobox(a: ComboboxArgs) {
  const id = useId()
  const anchor = useComboboxAnchor()
  return (
    <div className="flex w-xs max-w-full flex-col gap-2">
      <Label htmlFor={id}>Country</Label>
      {a.multiple ? (
        <Combobox
          multiple
          items={COUNTRIES}
          defaultValue={SELECTED}
          defaultOpen={a.open && !a.disabled}
          disabled={a.disabled}
        >
          <ComboboxChips ref={anchor}>
            <ComboboxValue>
              {(values: string[]) => (
                <>
                  {values.map((value) => (
                    <ComboboxChip key={value}>{value}</ComboboxChip>
                  ))}
                  <ComboboxChipsInput
                    id={id}
                    placeholder={a.placeholder}
                    aria-invalid={a.invalid || undefined}
                  />
                </>
              )}
            </ComboboxValue>
          </ComboboxChips>
          <ComboboxContent anchor={anchor}>
            <Options />
          </ComboboxContent>
        </Combobox>
      ) : (
        <Combobox items={COUNTRIES} defaultOpen={a.open && !a.disabled}>
          <ComboboxInput
            id={id}
            placeholder={a.placeholder}
            showTrigger={a.showTrigger}
            showClear={a.showClear}
            disabled={a.disabled}
            aria-invalid={a.invalid || undefined}
          />
          <ComboboxContent>
            <Options />
          </ComboboxContent>
        </Combobox>
      )}
    </div>
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

const OPTIONS = `          <ComboboxEmpty>No countries found.</ComboboxEmpty>
          <ComboboxList>
            {(item: string) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>`

function code(args: Args): string {
  const a = read(args)
  const countries = `const countries = [
${COUNTRIES.map((country) => `  "${country}",`).join("\n")}
]`
  if (a.multiple) {
    const root = [
      "multiple",
      "items={countries}",
      `defaultValue={[${SELECTED.map((value) => `"${value}"`).join(", ")}]}`,
      a.open && !a.disabled ? "defaultOpen" : "",
      a.disabled ? "disabled" : "",
    ].filter(Boolean)
    const input = [
      'id="country"',
      `placeholder="${a.placeholder}"`,
      a.invalid ? "aria-invalid" : "",
    ].filter(Boolean)
    return `import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox"
import { Label } from "@/components/ui/label"

${countries}

export function Example() {
  const anchor = useComboboxAnchor()
  return (
    <div className="flex w-xs max-w-full flex-col gap-2">
      <Label htmlFor="country">Country</Label>
${opening(6, "Combobox", root).join("\n")}
        <ComboboxChips ref={anchor}>
          <ComboboxValue>
            {(values: string[]) => (
              <>
                {values.map((value) => (
                  <ComboboxChip key={value}>{value}</ComboboxChip>
                ))}
${element(16, "ComboboxChipsInput", input).join("\n")}
              </>
            )}
          </ComboboxValue>
        </ComboboxChips>
        <ComboboxContent anchor={anchor}>
${OPTIONS}
        </ComboboxContent>
      </Combobox>
    </div>
  )
}
`
  }
  const root = [
    "items={countries}",
    a.open && !a.disabled ? "defaultOpen" : "",
  ].filter(Boolean)
  const input = [
    'id="country"',
    `placeholder="${a.placeholder}"`,
    a.showTrigger ? "" : "showTrigger={false}",
    a.showClear ? "showClear" : "",
    a.disabled ? "disabled" : "",
    a.invalid ? "aria-invalid" : "",
  ].filter(Boolean)
  return `import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { Label } from "@/components/ui/label"

${countries}

export function Example() {
  return (
    <div className="flex w-xs max-w-full flex-col gap-2">
      <Label htmlFor="country">Country</Label>
${opening(6, "Combobox", root).join("\n")}
${element(8, "ComboboxInput", input).join("\n")}
        <ComboboxContent>
${OPTIONS}
        </ComboboxContent>
      </Combobox>
    </div>
  )
}
`
}

/**
 * Combobox: a country picker, single or multiple, opened on the canvas unless
 * it is disabled; it remounts when `open`, `multiple` or `disabled` changes,
 * so it can still be closed and reopened by hand.
 */
const story: Story = {
  anatomy: { open: true },
  controls: [
    { kind: "boolean", name: "open", default: true },
    { kind: "boolean", name: "multiple", default: false },
    { kind: "boolean", name: "showTrigger", default: true },
    { kind: "boolean", name: "showClear", default: false },
    { kind: "boolean", name: "disabled", default: false },
    { kind: "boolean", name: "aria-invalid", default: false },
    { kind: "text", name: "placeholder", default: "Select a country" },
  ],
  render: (args) => {
    const a = read(args)
    return (
      <div className="flex min-h-svh justify-center p-8">
        <CountryCombobox key={`${a.multiple}-${a.open}-${a.disabled}`} {...a} />
      </div>
    )
  },
  code,
  layout: "fullscreen",
  grid: false,
}

export default story
