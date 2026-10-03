import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Args, Story } from "@/site/playground/types"

type Side = "top" | "right" | "bottom" | "left"
type Align = "start" | "center" | "end"

interface MenuArgs {
  open: boolean
  modal: boolean
  side: Side
  align: Align
  inset: boolean
  disabled: boolean
  variant: "default" | "destructive"
}

/** Wider than the trigger, which the content matches by default. */
const WIDTH = "w-48"

const SIDES: Side[] = ["top", "right", "bottom", "left"]
const ALIGNS: Align[] = ["start", "center", "end"]

function read(args: Args): MenuArgs {
  const side = String(args.side) as Side
  const align = String(args.align) as Align
  return {
    open: Boolean(args.open),
    modal: Boolean(args.modal),
    side: SIDES.includes(side) ? side : "bottom",
    align: ALIGNS.includes(align) ? align : "start",
    inset: Boolean(args.inset),
    disabled: Boolean(args.disabled),
    variant: args.variant === "destructive" ? "destructive" : "default",
  }
}

function AccountMenu({ a }: { a: MenuArgs }) {
  const [statusBar, setStatusBar] = useState(true)
  return (
    <DropdownMenu defaultOpen={a.open} modal={a.modal}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Options</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side={a.side} align={a.align} className={WIDTH}>
        <DropdownMenuLabel inset={a.inset}>My account</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem inset={a.inset}>Profile</DropdownMenuItem>
          <DropdownMenuItem inset={a.inset} disabled={a.disabled}>
            Billing
          </DropdownMenuItem>
          <DropdownMenuItem inset={a.inset}>Settings</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          inset={a.inset}
          checked={statusBar}
          onCheckedChange={(checked) => setStatusBar(checked === true)}
        >
          Status bar
        </DropdownMenuCheckboxItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger inset={a.inset}>Share</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>Copy link</DropdownMenuItem>
            <DropdownMenuItem>Send by email</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem inset={a.inset} variant={a.variant}>
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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

/** Lines of `element` at `indent`, written relative to the content's base. */
function nested(lines: string[]): string[] {
  return lines.map((line) => line.slice(8))
}

function code(args: Args): string {
  const a = read(args)
  const inset = a.inset ? " inset" : ""
  const root = [a.open ? "defaultOpen" : "", a.modal ? "" : "modal={false}"]
    .filter(Boolean)
    .map((prop) => ` ${prop}`)
    .join("")
  const content = [
    a.side === "bottom" ? "" : `side="${a.side}"`,
    a.align === "start" ? "" : `align="${a.align}"`,
    `className="${WIDTH}"`,
  ]
    .filter(Boolean)
    .map((prop) => ` ${prop}`)
    .join("")
  const insets = a.inset ? ["inset"] : []
  const lines = [
    `<DropdownMenuLabel${inset}>My account</DropdownMenuLabel>`,
    "<DropdownMenuGroup>",
    `  <DropdownMenuItem${inset}>Profile</DropdownMenuItem>`,
    ...nested(
      element(
        10,
        "DropdownMenuItem",
        [...insets, ...(a.disabled ? ["disabled"] : [])],
        "Billing"
      )
    ),
    `  <DropdownMenuItem${inset}>Settings</DropdownMenuItem>`,
    "</DropdownMenuGroup>",
    "<DropdownMenuSeparator />",
    "<DropdownMenuCheckboxItem",
    ...(a.inset ? ["  inset"] : []),
    "  checked={statusBar}",
    "  onCheckedChange={(checked) => setStatusBar(checked === true)}",
    ">",
    "  Status bar",
    "</DropdownMenuCheckboxItem>",
    "<DropdownMenuSub>",
    `  <DropdownMenuSubTrigger${inset}>Share</DropdownMenuSubTrigger>`,
    "  <DropdownMenuSubContent>",
    "    <DropdownMenuItem>Copy link</DropdownMenuItem>",
    "    <DropdownMenuItem>Send by email</DropdownMenuItem>",
    "  </DropdownMenuSubContent>",
    "</DropdownMenuSub>",
    "<DropdownMenuSeparator />",
    ...nested(
      element(
        8,
        "DropdownMenuItem",
        [
          ...insets,
          ...(a.variant === "destructive" ? ['variant="destructive"'] : []),
        ],
        "Log out"
      )
    ),
  ]
  return `import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Example() {
  const [statusBar, setStatusBar] = useState(true)
  return (
    <DropdownMenu${root}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Options</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent${content}>
${lines.map((line) => `        ${line}`).join("\n")}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
`
}

/**
 * DropdownMenu: an account menu on its trigger. With `open` on it starts
 * open; a Radix menu closes when its window loses focus, as the canvas does
 * when the reader clicks a control, so every change remounts it. `modal`
 * starts off: a modal menu open on load hides the rest of the canvas from
 * assistive technology while its trigger stays focusable, which axe reports
 * (aria-hidden-focus).
 */
const story: Story = {
  controls: [
    { kind: "boolean", name: "open", default: true },
    { kind: "boolean", name: "modal", default: false },
    { kind: "select", name: "side", options: SIDES, default: "bottom" },
    { kind: "select", name: "align", options: ALIGNS, default: "start" },
    { kind: "boolean", name: "inset", default: false },
    { kind: "boolean", name: "disabled", default: false },
    {
      kind: "select",
      name: "variant",
      options: ["default", "destructive"],
      default: "default",
    },
  ],
  render: (args) => {
    const a = read(args)
    return (
      <div className="flex justify-center px-8 py-60">
        <AccountMenu key={JSON.stringify(a)} a={a} />
      </div>
    )
  },
  code,
  layout: "fullscreen",
  grid: false,
}

export default story
