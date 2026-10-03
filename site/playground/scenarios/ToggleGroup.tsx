import {
  GridFourIcon,
  ListIcon,
  TableIcon,
  TextBIcon,
  TextItalicIcon,
  TextUnderlineIcon,
} from "@phosphor-icons/react"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { Args, Story } from "@/site/playground/types"

/** An exclusive choice of view, or formatting options that combine. */
const SETS = {
  single: {
    label: "View",
    initial: "list",
    items: [
      { value: "list", label: "List view", icon: ListIcon, name: "ListIcon" },
      {
        value: "grid",
        label: "Grid view",
        icon: GridFourIcon,
        name: "GridFourIcon",
      },
      {
        value: "table",
        label: "Table view",
        icon: TableIcon,
        name: "TableIcon",
      },
    ],
  },
  multiple: {
    label: "Text formatting",
    initial: "bold",
    items: [
      { value: "bold", label: "Bold", icon: TextBIcon, name: "TextBIcon" },
      {
        value: "italic",
        label: "Italic",
        icon: TextItalicIcon,
        name: "TextItalicIcon",
      },
      {
        value: "underline",
        label: "Underline",
        icon: TextUnderlineIcon,
        name: "TextUnderlineIcon",
      },
    ],
  },
}

/** The props shared by both kinds of group, as the component takes them. */
function shared(args: Args) {
  return {
    variant: args.variant === "outline" ? ("outline" as const) : undefined,
    size:
      args.size === "sm" || args.size === "lg"
        ? (args.size as "sm" | "lg")
        : undefined,
    spacing: Number(args.spacing),
    orientation:
      args.orientation === "vertical" ? ("vertical" as const) : undefined,
    disabled: Boolean(args.disabled),
  }
}

function Group({ args }: { args: Args }) {
  const multiple = args.type === "multiple"
  const set = multiple ? SETS.multiple : SETS.single
  const items = set.items.map((item) => (
    <ToggleGroupItem
      key={item.value}
      value={item.value}
      aria-label={item.label}
    >
      <item.icon />
    </ToggleGroupItem>
  ))
  // Radix types each kind of group apart: one branch per type.
  return multiple ? (
    <ToggleGroup
      key="multiple"
      type="multiple"
      defaultValue={[set.initial]}
      aria-label={set.label}
      {...shared(args)}
    >
      {items}
    </ToggleGroup>
  ) : (
    <ToggleGroup
      key="single"
      type="single"
      defaultValue={set.initial}
      aria-label={set.label}
      {...shared(args)}
    >
      {items}
    </ToggleGroup>
  )
}

/** ToggleGroup: a view switcher (single) or a formatting toolbar (multiple). */
const story: Story = {
  controls: [
    {
      kind: "select",
      name: "type",
      options: ["single", "multiple"],
      default: "single",
    },
    {
      kind: "select",
      name: "variant",
      options: ["default", "outline"],
      default: "default",
    },
    {
      kind: "select",
      name: "size",
      options: ["default", "sm", "lg"],
      default: "default",
    },
    { kind: "number", name: "spacing", default: 2, min: 0, max: 4 },
    {
      kind: "select",
      name: "orientation",
      options: ["horizontal", "vertical"],
      default: "horizontal",
    },
    { kind: "boolean", name: "disabled", default: false },
  ],
  render: (args) => <Group args={args} />,
  code: (args) => {
    const multiple = args.type === "multiple"
    const set = multiple ? SETS.multiple : SETS.single
    const { variant, size, spacing, orientation, disabled } = shared(args)
    const props = [
      `type="${multiple ? "multiple" : "single"}"`,
      multiple
        ? `defaultValue={["${set.initial}"]}`
        : `defaultValue="${set.initial}"`,
      variant ? `variant="${variant}"` : "",
      size ? `size="${size}"` : "",
      spacing === 2 ? "" : `spacing={${spacing}}`,
      orientation ? `orientation="${orientation}"` : "",
      disabled ? "disabled" : "",
      `aria-label="${set.label}"`,
    ].filter(Boolean)
    const items = set.items.map(
      (
        item
      ) => `      <ToggleGroupItem value="${item.value}" aria-label="${item.label}">
        <${item.name} />
      </ToggleGroupItem>`
    )
    // One line when it fits in 80 columns, one entry per line otherwise, as Prettier does.
    const icons = set.items.map((item) => item.name).sort()
    const inlineImport = `import { ${icons.join(", ")} } from "@phosphor-icons/react"`
    const iconImport =
      inlineImport.length <= 80
        ? inlineImport
        : `import {\n${icons.map((icon) => `  ${icon},`).join("\n")}\n} from "@phosphor-icons/react"`
    const inlineRoot = `    <ToggleGroup ${props.join(" ")}>`
    const root =
      inlineRoot.length <= 80
        ? inlineRoot
        : `    <ToggleGroup\n${props.map((prop) => `      ${prop}`).join("\n")}\n    >`
    return `${iconImport}

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export function Example() {
  return (
${root}
${items.join("\n")}
    </ToggleGroup>
  )
}
`
  },
}

export default story
