import { useId } from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Label } from "@/components/ui/label"
import type { Args, Story } from "@/site/playground/types"

type Direction = "bottom" | "top" | "left" | "right"

interface DrawerArgs {
  open: boolean
  direction: Direction
  dismissible: boolean
  title: string
}

const DIRECTIONS: Direction[] = ["bottom", "top", "left", "right"]
const FILTERS = ["In stock only", "Free shipping", "On sale"]

function read(args: Args): DrawerArgs {
  const direction = String(args.direction) as Direction
  return {
    open: Boolean(args.open),
    direction: DIRECTIONS.includes(direction) ? direction : "bottom",
    dismissible: Boolean(args.dismissible),
    title: String(args.title),
  }
}

function FiltersDrawer({ a }: { a: DrawerArgs }) {
  const id = useId()
  return (
    <Drawer
      defaultOpen={a.open}
      direction={a.direction}
      dismissible={a.dismissible}
    >
      <DrawerTrigger asChild>
        <Button variant="outline">Open filters</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{a.title}</DrawerTitle>
          <DrawerDescription>
            Narrow down your search with the filters below.
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-3 px-4">
          {FILTERS.map((filter, index) => (
            <div key={filter} className="flex items-center gap-2">
              <Checkbox id={`${id}-${index}`} />
              <Label htmlFor={`${id}-${index}`}>{filter}</Label>
            </div>
          ))}
        </div>
        <DrawerFooter>
          <Button>Apply</Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
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
  const root = [
    a.open ? "defaultOpen" : "",
    a.direction === "bottom" ? "" : `direction="${a.direction}"`,
    a.dismissible ? "" : "dismissible={false}",
  ].filter(Boolean)
  const filters = FILTERS.map(
    (filter, index) => `          <div className="flex items-center gap-2">
            <Checkbox id="filter-${index + 1}" />
            <Label htmlFor="filter-${index + 1}">${filter}</Label>
          </div>`
  ).join("\n")
  return `import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Label } from "@/components/ui/label"

export function Example() {
  return (
    <Drawer${root.length ? ` ${root.join(" ")}` : ""}>
      <DrawerTrigger asChild>
        <Button variant="outline">Open filters</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
${element(10, "DrawerTitle", [], a.title).join("\n")}
          <DrawerDescription>
            Narrow down your search with the filters below.
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-3 px-4">
${filters}
        </div>
        <DrawerFooter>
          <Button>Apply</Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
`
}

/**
 * Drawer: a filters panel from any edge. With `open` on it starts open, and
 * remounts when `open` or `direction` changes, so it still closes and reopens
 * by hand.
 */
const story: Story = {
  controls: [
    { kind: "boolean", name: "open", default: true },
    {
      kind: "select",
      name: "direction",
      options: DIRECTIONS,
      default: "bottom",
    },
    { kind: "boolean", name: "dismissible", default: true },
    { kind: "text", name: "title", default: "Filters" },
  ],
  render: (args) => {
    const a = read(args)
    return (
      <div className="flex min-h-svh items-center justify-center py-56">
        <FiltersDrawer key={`${a.open}-${a.direction}`} a={a} />
      </div>
    )
  },
  code,
  layout: "fullscreen",
  grid: false,
}

export default story
