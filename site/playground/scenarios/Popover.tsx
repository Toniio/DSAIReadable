import { useId } from "react"
import { SlidersHorizontalIcon } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { Args, Story } from "@/site/playground/types"

type Side = "top" | "right" | "bottom" | "left"
type Align = "start" | "center" | "end"

function shape(args: Args) {
  return {
    open: Boolean(args.open),
    side: String(args.side) as Side,
    align: String(args.align) as Align,
    sideOffset: Math.min(Math.max(Math.round(Number(args.sideOffset)), 0), 32),
    title: String(args.title),
  }
}

function PopoverStory({ args }: { args: Args }) {
  const s = shape(args)
  const id = useId()
  return (
    // Room on every side, so each `side` has space before Radix flips it.
    <div className="flex min-h-96 items-center justify-center p-8">
      <Popover defaultOpen={s.open}>
        <PopoverTrigger asChild>
          <Button variant="outline">
            <SlidersHorizontalIcon data-icon="inline-start" />
            {s.title}
          </Button>
        </PopoverTrigger>
        <PopoverContent side={s.side} align={s.align} sideOffset={s.sideOffset}>
          <PopoverHeader>
            <PopoverTitle as="h3">{s.title}</PopoverTitle>
            <PopoverDescription>Set the size of the layer.</PopoverDescription>
          </PopoverHeader>
          <Field orientation="horizontal">
            <FieldLabel htmlFor={`${id}-width`}>Width</FieldLabel>
            <Input id={`${id}-width`} defaultValue="320" />
          </Field>
          <Field orientation="horizontal">
            <FieldLabel htmlFor={`${id}-height`}>Height</FieldLabel>
            <Input id={`${id}-height`} defaultValue="240" />
          </Field>
        </PopoverContent>
      </Popover>
    </div>
  )
}

function code(args: Args): string {
  const s = shape(args)
  const content = [
    ...(s.side === "bottom" ? [] : [`side="${s.side}"`]),
    ...(s.align === "center" ? [] : [`align="${s.align}"`]),
    ...(s.sideOffset === 4 ? [] : [`sideOffset={${s.sideOffset}}`]),
  ]
  return [
    'import { SlidersHorizontalIcon } from "@phosphor-icons/react"',
    "",
    'import { Button } from "@/components/ui/button"',
    'import { Field, FieldLabel } from "@/components/ui/field"',
    'import { Input } from "@/components/ui/input"',
    "import {",
    "  Popover,",
    "  PopoverContent,",
    "  PopoverDescription,",
    "  PopoverHeader,",
    "  PopoverTitle,",
    "  PopoverTrigger,",
    '} from "@/components/ui/popover"',
    "",
    "export function Example() {",
    "  return (",
    `    <Popover${s.open ? " defaultOpen" : ""}>`,
    "      <PopoverTrigger asChild>",
    '        <Button variant="outline">',
    '          <SlidersHorizontalIcon data-icon="inline-start" />',
    `          ${s.title}`,
    "        </Button>",
    "      </PopoverTrigger>",
    `      <PopoverContent${content.map((prop) => ` ${prop}`).join("")}>`,
    "        <PopoverHeader>",
    `          <PopoverTitle as="h3">${s.title}</PopoverTitle>`,
    "          <PopoverDescription>Set the size of the layer.</PopoverDescription>",
    "        </PopoverHeader>",
    '        <Field orientation="horizontal">',
    '          <FieldLabel htmlFor="width">Width</FieldLabel>',
    '          <Input id="width" defaultValue="320" />',
    "        </Field>",
    '        <Field orientation="horizontal">',
    '          <FieldLabel htmlFor="height">Height</FieldLabel>',
    '          <Input id="height" defaultValue="240" />',
    "        </Field>",
    "      </PopoverContent>",
    "    </Popover>",
    "  )",
    "}",
    "",
  ].join("\n")
}

/**
 * Popover: a Dimensions panel of two fields under its trigger. `open` mounts
 * it open (`defaultOpen`), so the panel can still be closed and opened again;
 * `side`, `align` and `sideOffset` place it against the trigger. The title is
 * an h3, as it would sit under a section's h2.
 */
const story: Story = {
  controls: [
    { kind: "boolean", name: "open", default: true },
    {
      kind: "select",
      name: "side",
      options: ["top", "right", "bottom", "left"],
      default: "bottom",
    },
    {
      kind: "select",
      name: "align",
      options: ["start", "center", "end"],
      default: "center",
    },
    {
      kind: "number",
      name: "sideOffset",
      default: 4,
      min: 0,
      max: 32,
    },
    { kind: "text", name: "title", default: "Dimensions" },
  ],
  render: (args) => <PopoverStory key={String(args.open)} args={args} />,
  code,
  layout: "fullscreen",
  grid: false,
}

export default story
