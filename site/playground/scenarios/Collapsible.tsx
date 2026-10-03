import { CaretUpDownIcon } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import type { Args, Story } from "@/site/playground/types"

const ITEMS = [
  "Trail running shoes",
  "Rain jacket",
  "Water bottle",
  "Wool socks",
  "Headlamp",
  "Trekking poles",
]

const ROW = "border px-3 py-2 text-xs"

function read(args: Args) {
  return {
    defaultOpen: Boolean(args.defaultOpen),
    disabled: Boolean(args.disabled),
    items: Math.min(Math.max(Number(args.items) || 2, 2), ITEMS.length),
    title: String(args.title),
  }
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

function heading(title: string, items: number): string {
  return `${title}: ${items} items`
}

/** Collapsible: one order whose first item shows, the rest behind the trigger. */
const story: Story = {
  controls: [
    { kind: "boolean", name: "defaultOpen", default: false },
    { kind: "boolean", name: "disabled", default: false },
    { kind: "text", name: "title", default: "Order 4189" },
    { kind: "number", name: "items", default: 3, min: 2, max: ITEMS.length },
  ],
  render: (args) => {
    const a = read(args)
    const [first, ...rest] = ITEMS.slice(0, a.items)
    return (
      <Collapsible
        key={String(a.defaultOpen)}
        defaultOpen={a.defaultOpen}
        disabled={a.disabled}
        className="flex w-sm max-w-full flex-col gap-2"
      >
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-medium">{heading(a.title, a.items)}</p>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <CaretUpDownIcon />
              <span className="sr-only">Toggle items</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        <div className={ROW}>{first}</div>
        <CollapsibleContent className="flex flex-col gap-2">
          {rest.map((item) => (
            <div key={item} className={ROW}>
              {item}
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>
    )
  },
  code: (args) => {
    const a = read(args)
    const [first, ...rest] = ITEMS.slice(0, a.items)
    const props = [
      a.defaultOpen ? "defaultOpen" : "",
      a.disabled ? "disabled" : "",
      'className="flex w-sm max-w-full flex-col gap-2"',
    ].filter(Boolean)
    return `import { CaretUpDownIcon } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

export function Example() {
  return (
${opening(4, "Collapsible", props).join("\n")}
      <div className="flex items-center justify-between gap-4">
${element(8, "p", ['className="text-sm font-medium"'], heading(a.title, a.items)).join("\n")}
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="icon-sm">
            <CaretUpDownIcon />
            <span className="sr-only">Toggle items</span>
          </Button>
        </CollapsibleTrigger>
      </div>
${element(6, "div", [`className="${ROW}"`], first).join("\n")}
      <CollapsibleContent className="flex flex-col gap-2">
${rest.flatMap((item) => element(8, "div", [`className="${ROW}"`], item)).join("\n")}
      </CollapsibleContent>
    </Collapsible>
  )
}
`
  },
}

export default story
