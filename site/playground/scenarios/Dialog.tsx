import { useId } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Args, Story } from "@/site/playground/types"

interface DialogArgs {
  open: boolean
  showCloseButton: boolean
  footerCloseButton: boolean
  description: boolean
  title: string
}

const FOOTER_CLOSE = "DialogFooter.showCloseButton"
const DESCRIPTION = "Update how your name appears to your team."

function read(args: Args): DialogArgs {
  return {
    open: Boolean(args.open),
    showCloseButton: Boolean(args.showCloseButton),
    footerCloseButton: Boolean(args[FOOTER_CLOSE]),
    description: Boolean(args.description),
    title: String(args.title),
  }
}

function ProfileDialog({ a }: { a: DialogArgs }) {
  const name = useId()
  const username = useId()
  return (
    <Dialog defaultOpen={a.open}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit profile</Button>
      </DialogTrigger>
      <DialogContent
        showCloseButton={a.showCloseButton}
        {...(a.description ? {} : { "aria-describedby": undefined })}
      >
        <DialogHeader>
          <DialogTitle>{a.title}</DialogTitle>
          {a.description ? (
            <DialogDescription>{DESCRIPTION}</DialogDescription>
          ) : null}
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor={name}>Name</Label>
            <Input id={name} defaultValue="Maria Lopez" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={username}>Username</Label>
            <Input id={username} defaultValue="mlopez" />
          </div>
        </div>
        <DialogFooter showCloseButton={a.footerCloseButton}>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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

function code(args: Args): string {
  const a = read(args)
  const root = a.open ? "<Dialog defaultOpen>" : "<Dialog>"
  const content = [
    a.showCloseButton ? "" : " showCloseButton={false}",
    a.description ? "" : " aria-describedby={undefined}",
  ].join("")
  const header = [
    ...element(10, "DialogTitle", [], a.title),
    ...(a.description ? element(10, "DialogDescription", [], DESCRIPTION) : []),
  ]
  return `import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
${a.description ? "  DialogDescription,\n" : ""}  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function Example() {
  return (
    ${root}
      <DialogTrigger asChild>
        <Button variant="outline">Edit profile</Button>
      </DialogTrigger>
      <DialogContent${content}>
        <DialogHeader>
${header.join("\n")}
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" defaultValue="Maria Lopez" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" defaultValue="mlopez" />
          </div>
        </div>
        <DialogFooter${a.footerCloseButton ? " showCloseButton" : ""}>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
`
}

/**
 * Dialog: a profile form opened from its trigger. With `open` on it starts
 * open, and remounts when `open` changes, so it still closes and reopens by
 * hand.
 */
const story: Story = {
  anatomy: { open: true },
  controls: [
    { kind: "boolean", name: "open", default: true },
    { kind: "boolean", name: "showCloseButton", default: true },
    { kind: "boolean", name: FOOTER_CLOSE, default: false },
    { kind: "boolean", name: "description", default: true },
    { kind: "text", name: "title", default: "Edit profile" },
  ],
  render: (args) => {
    const a = read(args)
    return (
      <div className="flex min-h-svh items-center justify-center py-48">
        <ProfileDialog key={String(a.open)} a={a} />
      </div>
    )
  },
  code,
  layout: "fullscreen",
  grid: false,
}

export default story
