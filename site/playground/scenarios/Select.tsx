import { Fragment } from "react"

import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Args, Story } from "@/site/playground/types"

const GROUPS = [
  { label: "Fruits", items: ["Apple", "Banana", "Blueberry", "Grapes"] },
  { label: "Vegetables", items: ["Carrot", "Leek", "Spinach"] },
]

const VALUES = GROUPS.flatMap((group) => group.items).map((item) =>
  item.toLowerCase()
)

type Props = Record<string, string | number | boolean | undefined>

/** An opening tag as Prettier writes it: one line, or one prop per line past 80 columns. */
function tag(name: string, props: Props, indent: string, close = ">") {
  const attributes = Object.entries(props).flatMap(([key, value]) => {
    if (value === undefined || value === false) return []
    if (value === true) return [key]
    return typeof value === "string"
      ? [`${key}=${JSON.stringify(value)}`]
      : [`${key}={${JSON.stringify(value)}}`]
  })
  const line = `${indent}<${[name, ...attributes].join(" ")}${close === ">" ? ">" : " />"}`
  if (line.length <= 80) return line
  const lines = attributes.map((attribute) => `${indent}  ${attribute}`)
  return `${indent}<${name}\n${lines.join("\n")}\n${indent}${close}`
}

/** The props of each part, without the ones equal to their default. */
function parts(args: Args) {
  const value = String(args.defaultValue)
  return {
    root: {
      defaultValue: value === "none" ? undefined : value,
      disabled: Boolean(args.disabled),
    },
    trigger: {
      id: "food",
      size: args.size === "sm" ? "sm" : undefined,
      "aria-invalid": Boolean(args["aria-invalid"]),
    },
    value: { placeholder: String(args.placeholder) },
    content: {
      position: args.position === "popper" ? "popper" : undefined,
      align: args.align === "center" ? undefined : String(args.align),
    },
  }
}

function FoodSelect({ args }: { args: Args }) {
  const props = parts(args)
  return (
    <div className="flex min-h-svh items-center justify-center p-8">
      <div className="flex flex-col gap-2">
        <Label htmlFor="food">Favorite food</Label>
        <Select
          key={`${args.open}-${args.defaultValue}`}
          defaultOpen={Boolean(args.open)}
          defaultValue={props.root.defaultValue}
          disabled={props.root.disabled}
        >
          <SelectTrigger
            id="food"
            size={args.size === "sm" ? "sm" : "default"}
            aria-invalid={props.trigger["aria-invalid"] || undefined}
          >
            <SelectValue placeholder={props.value.placeholder} />
          </SelectTrigger>
          <SelectContent
            position={args.position === "popper" ? "popper" : "item-aligned"}
            align={
              args.align === "start" || args.align === "end"
                ? args.align
                : "center"
            }
          >
            {GROUPS.map((group, index) => (
              <Fragment key={group.label}>
                {index > 0 ? <SelectSeparator /> : null}
                <SelectGroup>
                  <SelectLabel>{group.label}</SelectLabel>
                  {group.items.map((item) => (
                    <SelectItem key={item} value={item.toLowerCase()}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </Fragment>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

/**
 * Select: a favorite food out of two groups. `open` shows the list on the
 * canvas; the code leaves it out, since the list opens from the trigger.
 */
const story: Story = {
  controls: [
    { kind: "boolean", name: "open", default: true },
    {
      kind: "select",
      name: "defaultValue",
      options: ["none", ...VALUES],
      default: "none",
    },
    { kind: "text", name: "placeholder", default: "Choose a food" },
    {
      kind: "select",
      name: "size",
      options: ["default", "sm"],
      default: "default",
    },
    {
      kind: "select",
      name: "position",
      options: ["item-aligned", "popper"],
      default: "item-aligned",
    },
    {
      kind: "select",
      name: "align",
      options: ["start", "center", "end"],
      default: "center",
    },
    { kind: "boolean", name: "disabled", default: false },
    { kind: "boolean", name: "aria-invalid", default: false },
  ],
  layout: "fullscreen",
  grid: false,
  render: (args) => <FoodSelect args={args} />,
  code: (args) => {
    const props = parts(args)
    const groups = GROUPS.map((group, index) =>
      [
        index > 0 ? `          <SelectSeparator />` : "",
        `          <SelectGroup>`,
        `            <SelectLabel>${group.label}</SelectLabel>`,
        ...group.items.map(
          (item) =>
            `            <SelectItem value="${item.toLowerCase()}">${item}</SelectItem>`
        ),
        `          </SelectGroup>`,
      ]
        .filter(Boolean)
        .join("\n")
    )
    return `import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function Example() {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="food">Favorite food</Label>
${tag("Select", props.root, "      ")}
${tag("SelectTrigger", props.trigger, "        ")}
${tag("SelectValue", props.value, "          ", "/>")}
        </SelectTrigger>
${tag("SelectContent", props.content, "        ")}
${groups.join("\n")}
        </SelectContent>
      </Select>
    </div>
  )
}
`
  },
}

export default story
