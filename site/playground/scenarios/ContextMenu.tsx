import { useEffect, useRef, useState } from "react"

import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { FOCUS_OUTLINE_RESET, FOCUS_RING } from "@/lib/focus"
import { cn } from "@/lib/utils"
import { useStagedState } from "@/site/playground/scenarios/use-staged-state"
import type { Args, Story } from "@/site/playground/types"

interface MenuArgs {
  open: boolean
  modal: boolean
  variant: "default" | "destructive"
  inset: boolean
  disabled: boolean
  submenu: boolean
  checkboxItem: boolean
  radioGroup: boolean
}

function read(args: Args): MenuArgs {
  return {
    open: Boolean(args.open),
    modal: Boolean(args.modal),
    variant: args.variant === "destructive" ? "destructive" : "default",
    inset: Boolean(args.inset),
    disabled: Boolean(args.disabled),
    submenu: Boolean(args.submenu),
    checkboxItem: Boolean(args.checkboxItem),
    radioGroup: Boolean(args.radioGroup),
  }
}

const AREA =
  "flex h-36 w-64 items-center justify-center border border-dashed text-xs text-muted-foreground"

/** The window events that close a Radix menu: see `useStagedState`. */
const CAUSES = ["blur"] as const

function Menu({ a }: { a: MenuArgs }) {
  const trigger = useRef<HTMLSpanElement>(null)
  // Closed until the right-click below opens it where the pointer is.
  const [open, setOpen] = useStagedState(false, CAUSES)
  const [showGrid, setShowGrid] = useState(true)
  const [sort, setSort] = useState("name")

  // A context menu opens where the pointer is: the canvas opens it with a
  // right-click at the center of the area, the way a reader would.
  useEffect(() => {
    const area = trigger.current
    if (!a.open || !area) return
    const box = area.getBoundingClientRect()
    area.dispatchEvent(
      new MouseEvent("contextmenu", {
        bubbles: true,
        cancelable: true,
        clientX: box.left + box.width / 2,
        clientY: box.top + box.height / 2,
      })
    )
  }, [a.open])

  return (
    <ContextMenu open={open} onOpenChange={setOpen} modal={a.modal}>
      <ContextMenuTrigger
        ref={trigger}
        tabIndex={0}
        className={cn(AREA, FOCUS_OUTLINE_RESET, FOCUS_RING)}
      >
        Right-click here
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem inset={a.inset}>
          Copy
          <ContextMenuShortcut>⌘C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem inset={a.inset} disabled={a.disabled}>
          Paste
          <ContextMenuShortcut>⌘V</ContextMenuShortcut>
        </ContextMenuItem>
        {a.submenu ? (
          <ContextMenuSub>
            <ContextMenuSubTrigger inset={a.inset}>Share</ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem>Copy link</ContextMenuItem>
              <ContextMenuItem>Send by email</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
        ) : null}
        {a.checkboxItem ? (
          <>
            <ContextMenuSeparator />
            <ContextMenuCheckboxItem
              inset={a.inset}
              checked={showGrid}
              onCheckedChange={setShowGrid}
            >
              Show grid
            </ContextMenuCheckboxItem>
          </>
        ) : null}
        {a.radioGroup ? (
          <>
            <ContextMenuSeparator />
            <ContextMenuLabel inset={a.inset}>Sort by</ContextMenuLabel>
            <ContextMenuRadioGroup value={sort} onValueChange={setSort}>
              <ContextMenuRadioItem inset={a.inset} value="name">
                Name
              </ContextMenuRadioItem>
              <ContextMenuRadioItem inset={a.inset} value="date">
                Date modified
              </ContextMenuRadioItem>
            </ContextMenuRadioGroup>
          </>
        ) : null}
        <ContextMenuSeparator />
        <ContextMenuItem inset={a.inset} variant={a.variant}>
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
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
  const insets = a.inset ? ["inset"] : []
  const lines = [
    `<ContextMenuItem${inset}>`,
    "  Copy",
    "  <ContextMenuShortcut>⌘C</ContextMenuShortcut>",
    "</ContextMenuItem>",
    `<ContextMenuItem${inset}${a.disabled ? " disabled" : ""}>`,
    "  Paste",
    "  <ContextMenuShortcut>⌘V</ContextMenuShortcut>",
    "</ContextMenuItem>",
    ...(a.submenu
      ? [
          "<ContextMenuSub>",
          `  <ContextMenuSubTrigger${inset}>Share</ContextMenuSubTrigger>`,
          "  <ContextMenuSubContent>",
          "    <ContextMenuItem>Copy link</ContextMenuItem>",
          "    <ContextMenuItem>Send by email</ContextMenuItem>",
          "  </ContextMenuSubContent>",
          "</ContextMenuSub>",
        ]
      : []),
    ...(a.checkboxItem
      ? [
          "<ContextMenuSeparator />",
          "<ContextMenuCheckboxItem",
          ...(a.inset ? ["  inset"] : []),
          "  checked={showGrid}",
          "  onCheckedChange={setShowGrid}",
          ">",
          "  Show grid",
          "</ContextMenuCheckboxItem>",
        ]
      : []),
    ...(a.radioGroup
      ? [
          "<ContextMenuSeparator />",
          `<ContextMenuLabel${inset}>Sort by</ContextMenuLabel>`,
          "<ContextMenuRadioGroup value={sort} onValueChange={setSort}>",
          ...nested(
            element(
              10,
              "ContextMenuRadioItem",
              [...insets, 'value="name"'],
              "Name"
            )
          ),
          ...nested(
            element(
              10,
              "ContextMenuRadioItem",
              [...insets, 'value="date"'],
              "Date modified"
            )
          ),
          "</ContextMenuRadioGroup>",
        ]
      : []),
    "<ContextMenuSeparator />",
    ...nested(
      element(
        8,
        "ContextMenuItem",
        [
          ...insets,
          ...(a.variant === "destructive" ? ['variant="destructive"'] : []),
        ],
        "Delete"
      )
    ),
  ]
  const imports = [
    "ContextMenu",
    ...(a.checkboxItem ? ["ContextMenuCheckboxItem"] : []),
    "ContextMenuContent",
    "ContextMenuItem",
    ...(a.radioGroup
      ? ["ContextMenuLabel", "ContextMenuRadioGroup", "ContextMenuRadioItem"]
      : []),
    "ContextMenuSeparator",
    "ContextMenuShortcut",
    ...(a.submenu
      ? ["ContextMenuSub", "ContextMenuSubContent", "ContextMenuSubTrigger"]
      : []),
    "ContextMenuTrigger",
  ]
  const state = [
    ...(a.checkboxItem
      ? ["  const [showGrid, setShowGrid] = useState(true)"]
      : []),
    ...(a.radioGroup ? ['  const [sort, setSort] = useState("name")'] : []),
  ]
  return `${state.length ? 'import { useState } from "react"\n\n' : ""}import {
${imports.map((name) => `  ${name},`).join("\n")}
} from "@/components/ui/context-menu"
import { FOCUS_OUTLINE_RESET, FOCUS_RING } from "@/lib/focus"
import { cn } from "@/lib/utils"

export function Example() {
${state.length ? `${state.join("\n")}\n` : ""}  return (
    <ContextMenu${a.modal ? "" : " modal={false}"}>
      <ContextMenuTrigger
        tabIndex={0}
        className={cn(
          "${AREA}",
          FOCUS_OUTLINE_RESET,
          FOCUS_RING
        )}
      >
        Right-click here
      </ContextMenuTrigger>
      <ContextMenuContent>
${lines.map((line) => `        ${line}`).join("\n")}
      </ContextMenuContent>
    </ContextMenu>
  )
}
`
}

/**
 * ContextMenu: a right-click area and its menu; with `open` on, the canvas
 * right-clicks the center of the area once, so the menu shows where a
 * pointer would open it, and stays open while the reader clicks the page
 * around the canvas; every change of a control mounts it again, so the
 * change shows on the open menu. `modal` starts off: a modal menu open on
 * load hides the focusable area from assistive technology, which axe reports
 * (aria-hidden-focus).
 */
const story: Story = {
  anatomy: { open: true },
  controls: [
    { kind: "boolean", name: "open", default: true },
    { kind: "boolean", name: "modal", default: false },
    {
      kind: "select",
      name: "variant",
      options: ["default", "destructive"],
      default: "default",
    },
    { kind: "boolean", name: "inset", default: false },
    { kind: "boolean", name: "disabled", default: false },
    { kind: "boolean", name: "submenu", default: true },
    { kind: "boolean", name: "checkboxItem", default: true },
    { kind: "boolean", name: "radioGroup", default: false },
  ],
  render: (args) => {
    const a = read(args)
    return (
      <div className="flex min-h-svh justify-center p-8">
        <Menu key={JSON.stringify(a)} a={a} />
      </div>
    )
  },
  code,
  layout: "fullscreen",
  grid: false,
}

export default story
