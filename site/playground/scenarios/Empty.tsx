import Link from "next/link"
import { FolderIcon, PlusIcon } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import type { Args, Story } from "@/site/playground/types"

type Level = "h1" | "h2" | "h3" | "h4" | "h5" | "h6"

const LEVELS: Level[] = ["h1", "h2", "h3", "h4", "h5", "h6"]

interface EmptyArgs {
  variant: "default" | "icon"
  as: Level
  title: string
  action: boolean
  border: boolean
}

/** The default media is free-form: a large icon stands in for an illustration. */
const ILLUSTRATION = "size-12 text-muted-foreground"

function read(args: Args): EmptyArgs {
  const level = String(args.as) as Level
  return {
    variant: args.variant === "icon" ? "icon" : "default",
    as: LEVELS.includes(level) ? level : "h2",
    title: String(args.title),
    action: Boolean(args.action),
    border: Boolean(args.border),
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

function code(args: Args): string {
  const a = read(args)
  const media =
    a.variant === "default" ? "<EmptyMedia>" : '<EmptyMedia variant="icon">'
  const icon =
    a.variant === "icon"
      ? "<FolderIcon />"
      : `<FolderIcon className="${ILLUSTRATION}" />`
  const title = element(
    8,
    "EmptyTitle",
    a.as === "h2" ? [] : [`as="${a.as}"`],
    a.title
  )
  const action = a.action
    ? `
      <EmptyContent>
        <Button size="sm">
          <PlusIcon />
          Create a project
        </Button>
      </EmptyContent>`
    : ""
  return `import Link from "next/link"
import { FolderIcon${a.action ? ", PlusIcon" : ""} } from "@phosphor-icons/react"

${a.action ? 'import { Button } from "@/components/ui/button"\n' : ""}import {
  Empty,
${a.action ? "  EmptyContent,\n" : ""}  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export function Example() {
  return (
    <Empty${a.border ? ' className="border"' : ""}>
      <EmptyHeader>
        ${media}
          ${icon}
        </EmptyMedia>
${title.join("\n")}
        <EmptyDescription>
          You have not created a project yet.{" "}
          <Link href="#guide">Read the guide</Link> to start one.
        </EmptyDescription>
      </EmptyHeader>${action}
    </Empty>
  )
}
`
}

/** Empty: a project list with nothing in it yet, and the action that fills it. */
const story: Story = {
  controls: [
    {
      kind: "select",
      name: "variant",
      options: ["default", "icon"],
      default: "default",
    },
    { kind: "select", name: "as", options: LEVELS, default: "h2" },
    { kind: "text", name: "title", default: "No projects yet" },
    { kind: "boolean", name: "action", default: true },
    { kind: "boolean", name: "border", default: false },
  ],
  render: (args) => {
    const a = read(args)
    return (
      <Empty className={a.border ? "border" : undefined}>
        <EmptyHeader>
          <EmptyMedia variant={a.variant}>
            {a.variant === "icon" ? (
              <FolderIcon />
            ) : (
              <FolderIcon className={ILLUSTRATION} />
            )}
          </EmptyMedia>
          <EmptyTitle as={a.as}>{a.title}</EmptyTitle>
          <EmptyDescription>
            You have not created a project yet.{" "}
            <Link href="#guide">Read the guide</Link> to start one.
          </EmptyDescription>
        </EmptyHeader>
        {a.action ? (
          <EmptyContent>
            <Button size="sm">
              <PlusIcon />
              Create a project
            </Button>
          </EmptyContent>
        ) : null}
      </Empty>
    )
  },
  code,
}

export default story
