import { useId } from "react"

import { Label } from "@/components/ui/label"
import {
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
} from "@/components/ui/native-select"
import type { Args, Story } from "@/site/playground/types"

/** The cities, flat or grouped by coast. */
const GROUPS = [
  {
    label: "East Coast",
    options: [
      { value: "boston", label: "Boston" },
      { value: "new-york", label: "New York" },
    ],
  },
  {
    label: "West Coast",
    options: [
      { value: "seattle", label: "Seattle" },
      { value: "portland", label: "Portland" },
    ],
  },
]

function shape(args: Args) {
  return {
    label: String(args.label),
    size: String(args.size) as "sm" | "default",
    disabled: Boolean(args.disabled),
    invalid: Boolean(args["aria-invalid"]),
    placeholder: Boolean(args.placeholder),
    grouped: Boolean(args.grouped),
  }
}

function NativeSelectStory({ args }: { args: Args }) {
  const s = shape(args)
  const id = useId()
  return (
    <div className="flex w-56 flex-col gap-2">
      <Label htmlFor={id}>{s.label}</Label>
      <NativeSelect
        id={id}
        size={s.size}
        defaultValue={s.placeholder ? "" : "boston"}
        disabled={s.disabled}
        aria-invalid={s.invalid || undefined}
        className="w-full"
      >
        <NativeSelectOption value="">Choose a city</NativeSelectOption>
        {s.grouped
          ? GROUPS.map((group) => (
              <NativeSelectOptGroup key={group.label} label={group.label}>
                {group.options.map((option) => (
                  <NativeSelectOption key={option.value} value={option.value}>
                    {option.label}
                  </NativeSelectOption>
                ))}
              </NativeSelectOptGroup>
            ))
          : GROUPS.flatMap((group) => group.options).map((option) => (
              <NativeSelectOption key={option.value} value={option.value}>
                {option.label}
              </NativeSelectOption>
            ))}
      </NativeSelect>
    </div>
  )
}

function code(args: Args): string {
  const s = shape(args)
  const option = (pad: string) => (entry: { value: string; label: string }) =>
    `${pad}<NativeSelectOption value="${entry.value}">${entry.label}</NativeSelectOption>`
  const options = s.grouped
    ? GROUPS.flatMap((group) => [
        `        <NativeSelectOptGroup label="${group.label}">`,
        ...group.options.map(option("          ")),
        "        </NativeSelectOptGroup>",
      ])
    : GROUPS.flatMap((group) => group.options).map(option("        "))
  const props = [
    'id="city"',
    ...(s.size === "default" ? [] : [`size="${s.size}"`]),
    // The empty option comes first, so it is selected unless told otherwise.
    ...(s.placeholder ? [] : ['defaultValue="boston"']),
    ...(s.disabled ? ["disabled"] : []),
    ...(s.invalid ? ["aria-invalid"] : []),
    'className="w-full"',
  ]
  const parts = [
    "NativeSelect",
    ...(s.grouped ? ["NativeSelectOptGroup"] : []),
    "NativeSelectOption",
  ]
  return [
    'import { Label } from "@/components/ui/label"',
    ...(s.grouped
      ? [
          "import {",
          ...parts.map((part) => `  ${part},`),
          '} from "@/components/ui/native-select"',
        ]
      : [
          `import { ${parts.join(", ")} } from "@/components/ui/native-select"`,
        ]),
    "",
    "export function Example() {",
    "  return (",
    '    <div className="flex w-56 flex-col gap-2">',
    `      <Label htmlFor="city">${s.label}</Label>`,
    ...(`      <NativeSelect ${props.join(" ")}>`.length <= 80
      ? [`      <NativeSelect ${props.join(" ")}>`]
      : [
          "      <NativeSelect",
          ...props.map((prop) => `        ${prop}`),
          "      >",
        ]),
    '        <NativeSelectOption value="">Choose a city</NativeSelectOption>',
    ...options,
    "      </NativeSelect>",
    "    </div>",
    "  )",
    "}",
    "",
  ].join("\n")
}

/**
 * NativeSelect: the browser's own dropdown, with its Label. `size` is the
 * component's prop, not the native attribute; `placeholder` leaves the empty
 * option selected, which mutes the text; `grouped` sorts the options into
 * NativeSelectOptGroups. The open list is the browser's: no state of the
 * canvas can draw it.
 */
const story: Story = {
  controls: [
    {
      kind: "select",
      name: "size",
      options: ["sm", "default"],
      default: "default",
    },
    { kind: "text", name: "label", default: "City" },
    { kind: "boolean", name: "placeholder", default: true },
    { kind: "boolean", name: "grouped", default: false },
    { kind: "boolean", name: "disabled", default: false },
    { kind: "boolean", name: "aria-invalid", default: false },
  ],
  render: (args) => (
    <NativeSelectStory key={String(args.placeholder)} args={args} />
  ),
  code,
}

export default story
