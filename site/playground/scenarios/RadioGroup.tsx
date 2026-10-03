import { useId } from "react"

import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { Args, Story } from "@/site/playground/types"

const OPTIONS = [
  { value: "standard", label: "Standard" },
  { value: "express", label: "Express" },
  { value: "priority", label: "Priority" },
]

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

function DeliveryMethod({ args }: { args: Args }) {
  const id = useId()
  const value = String(args.defaultValue)
  return (
    <RadioGroup
      key={value}
      defaultValue={value === "none" ? undefined : value}
      disabled={Boolean(args.disabled)}
      aria-label={String(args["aria-label"]) || undefined}
      className="w-fit"
    >
      {OPTIONS.map((option) => (
        <div key={option.value} className="flex items-center gap-2">
          <RadioGroupItem
            value={option.value}
            id={`${id}-${option.value}`}
            aria-invalid={args["aria-invalid"] ? true : undefined}
          />
          <Label htmlFor={`${id}-${option.value}`}>{option.label}</Label>
        </div>
      ))}
    </RadioGroup>
  )
}

/** RadioGroup: one delivery method out of three, every option visible. */
const story: Story = {
  controls: [
    {
      kind: "select",
      name: "defaultValue",
      options: ["none", ...OPTIONS.map((option) => option.value)],
      default: "standard",
    },
    { kind: "text", name: "aria-label", default: "Delivery method" },
    { kind: "boolean", name: "disabled", default: false },
    { kind: "boolean", name: "aria-invalid", default: false },
  ],
  render: (args) => <DeliveryMethod args={args} />,
  code: (args) => {
    const value = String(args.defaultValue)
    const root = tag(
      "RadioGroup",
      {
        defaultValue: value === "none" ? undefined : value,
        disabled: Boolean(args.disabled),
        "aria-label": String(args["aria-label"]) || undefined,
        className: "w-fit",
      },
      "    "
    )
    const items = OPTIONS.map((option) =>
      [
        `      <div className="flex items-center gap-2">`,
        tag(
          "RadioGroupItem",
          {
            value: option.value,
            id: option.value,
            "aria-invalid": Boolean(args["aria-invalid"]),
          },
          "        ",
          "/>"
        ),
        `        <Label htmlFor="${option.value}">${option.label}</Label>`,
        `      </div>`,
      ].join("\n")
    )
    return `import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export function Example() {
  return (
${root}
${items.join("\n")}
    </RadioGroup>
  )
}
`
  },
}

export default story
