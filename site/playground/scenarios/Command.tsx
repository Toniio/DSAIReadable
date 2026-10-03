import { useState } from "react"
import {
  FileTextIcon,
  GearIcon,
  HouseIcon,
  UserPlusIcon,
} from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import type { Args, Story } from "@/site/playground/types"

interface CommandArgs {
  dialog: boolean
  open: boolean
  loop: boolean
  shortcuts: boolean
  separator: boolean
  disabled: boolean
  checked: boolean
  placeholder: string
}

function read(args: Args): CommandArgs {
  return {
    dialog: Boolean(args.dialog),
    open: Boolean(args.open),
    loop: Boolean(args.loop),
    shortcuts: Boolean(args.shortcuts),
    separator: Boolean(args.separator),
    disabled: Boolean(args.disabled),
    checked: Boolean(args["data-checked"]),
    placeholder: String(args.placeholder),
  }
}

const FRAME = "w-sm max-w-full border shadow-md"
const TITLE = "Command palette"
const DESCRIPTION = "Search for a command to run"

function Palette({ a }: { a: CommandArgs }) {
  return (
    <Command loop={a.loop} className={a.dialog ? undefined : FRAME}>
      <CommandInput placeholder={a.placeholder} aria-label="Search commands" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Actions">
          <CommandItem>
            <FileTextIcon />
            New file
            {a.shortcuts ? <CommandShortcut>⌘N</CommandShortcut> : null}
          </CommandItem>
          <CommandItem disabled={a.disabled}>
            <UserPlusIcon />
            Invite a teammate
            {a.shortcuts ? <CommandShortcut>⌘I</CommandShortcut> : null}
          </CommandItem>
        </CommandGroup>
        {a.separator ? <CommandSeparator /> : null}
        <CommandGroup heading="Settings">
          <CommandItem data-checked={a.checked ? "true" : undefined}>
            <GearIcon />
            Show hidden files
          </CommandItem>
          <CommandItem>
            <HouseIcon />
            Go to home
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  )
}

function PaletteDialog({ a }: { a: CommandArgs }) {
  const [open, setOpen] = useState(a.open)
  return (
    <div className="flex min-h-96 items-center justify-center">
      <Button variant="outline" onClick={() => setOpen(true)}>
        Open the command palette
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title={TITLE}
        description={DESCRIPTION}
      >
        <Palette a={a} />
      </CommandDialog>
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

function item(icon: string, label: string, extra: string[] = []): string[] {
  const [props, ...children] = extra
  return [
    `<CommandItem${props ?? ""}>`,
    `  <${icon} />`,
    `  ${label}`,
    ...children.map((child) => `  ${child}`),
    "</CommandItem>",
  ]
}

function code(args: Args): string {
  const a = read(args)
  const shortcut = (keys: string) =>
    a.shortcuts ? [`<CommandShortcut>${keys}</CommandShortcut>`] : []
  const list = [
    "<CommandEmpty>No results found.</CommandEmpty>",
    '<CommandGroup heading="Actions">',
    ...item("FileTextIcon", "New file", ["", ...shortcut("⌘N")]).map(
      (line) => `  ${line}`
    ),
    ...item("UserPlusIcon", "Invite a teammate", [
      a.disabled ? " disabled" : "",
      ...shortcut("⌘I"),
    ]).map((line) => `  ${line}`),
    "</CommandGroup>",
    ...(a.separator ? ["<CommandSeparator />"] : []),
    '<CommandGroup heading="Settings">',
    ...item("GearIcon", "Show hidden files", [
      a.checked ? ' data-checked="true"' : "",
    ]).map((line) => `  ${line}`),
    ...item("HouseIcon", "Go to home").map((line) => `  ${line}`),
    "</CommandGroup>",
  ]
  const commandProps = [
    a.loop ? " loop" : "",
    a.dialog ? "" : ` className="${FRAME}"`,
  ].join("")
  const palette = (indent: number) => {
    const pad = " ".repeat(indent)
    return [
      `${pad}<Command${commandProps}>`,
      ...element(indent + 2, "CommandInput", [
        `placeholder="${a.placeholder}"`,
        'aria-label="Search commands"',
      ]),
      `${pad}  <CommandList>`,
      ...list.map((line) => `${pad}    ${line}`),
      `${pad}  </CommandList>`,
      `${pad}</Command>`,
    ].join("\n")
  }
  const imports = [
    "Command",
    ...(a.dialog ? ["CommandDialog"] : []),
    "CommandEmpty",
    "CommandGroup",
    "CommandInput",
    "CommandItem",
    "CommandList",
    ...(a.separator ? ["CommandSeparator"] : []),
    ...(a.shortcuts ? ["CommandShortcut"] : []),
  ]
  const icons = `import {
  FileTextIcon,
  GearIcon,
  HouseIcon,
  UserPlusIcon,
} from "@phosphor-icons/react"`
  const commandImport = `import {
${imports.map((name) => `  ${name},`).join("\n")}
} from "@/components/ui/command"`
  if (!a.dialog)
    return `${icons}

${commandImport}

export function Example() {
  return (
${palette(4)}
  )
}
`
  return `import { useState } from "react"
${icons}

import { Button } from "@/components/ui/button"
${commandImport}

export function Example() {
  const [open, setOpen] = useState(${a.open})
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Open the command palette
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="${TITLE}"
        description="${DESCRIPTION}"
      >
${palette(8)}
      </CommandDialog>
    </>
  )
}
`
}

/**
 * Command: the palette inline, or in its dialog opened from a button; the
 * dialog starts open when `open` is on.
 */
const story: Story = {
  controls: [
    { kind: "boolean", name: "dialog", default: false },
    { kind: "boolean", name: "open", default: true },
    { kind: "boolean", name: "loop", default: false },
    { kind: "boolean", name: "shortcuts", default: true },
    { kind: "boolean", name: "separator", default: true },
    { kind: "boolean", name: "disabled", default: false },
    { kind: "boolean", name: "data-checked", default: false },
    { kind: "text", name: "placeholder", default: "Search for a command…" },
  ],
  render: (args) => {
    const a = read(args)
    return a.dialog ? (
      <PaletteDialog key={String(a.open)} a={a} />
    ) : (
      <Palette a={a} />
    )
  },
  code,
}

export default story
