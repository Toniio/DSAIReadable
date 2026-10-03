import {
  MagnifyingGlassIcon,
  PaperclipIcon,
  PaperPlaneRightIcon,
  XIcon,
} from "@phosphor-icons/react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import type { Args, Story } from "@/site/playground/types"

type Align = "inline-start" | "inline-end" | "block-start" | "block-end"
type Size = "xs" | "sm" | "icon-xs" | "icon-sm"
type Prop = [name: string, value: string | number | boolean | undefined]

/** A JSX attribute: `name="text"`, `name={2}`, `name`; nothing when unset or false. */
function attr([name, value]: Prop): string | null {
  if (value === undefined || value === false) return null
  if (value === true) return name
  return typeof value === "string"
    ? `${name}=${JSON.stringify(value)}`
    : `${name}={${value}}`
}

/** An opening tag, on one line or one prop per line past 80 columns, as Prettier writes it. */
function tag(depth: number, name: string, props: Prop[], selfClosing = false) {
  const pad = "  ".repeat(depth)
  const attrs = props.map(attr).filter((value) => value !== null)
  const line = `${pad}<${name}${attrs.map((value) => ` ${value}`).join("")}${selfClosing ? " />" : ">"}`
  if (line.length <= 80) return line
  return [
    `${pad}<${name}`,
    ...attrs.map((value) => `${pad}  ${value}`),
    `${pad}${selfClosing ? "/>" : ">"}`,
  ].join("\n")
}

/**
 * An element around a text, as Prettier writes it: on one line when it fits
 * in 80 columns and has one prop at most, the text on its own line otherwise.
 */
function leaf(depth: number, name: string, props: Prop[], text: string) {
  const open = tag(depth, name, props)
  const line = `${open}${text}</${name}>`
  const many = props.map(attr).filter((value) => value !== null).length > 1
  if (line.length <= 80 && !many) return [line]
  return [
    open,
    `${"  ".repeat(depth + 1)}${text}`,
    `${"  ".repeat(depth)}</${name}>`,
  ]
}

/**
 * The parts the controls choose. An inline add-on goes with a one-line search
 * field, a block add-on with a reply box: the two kinds never mix in a group.
 */
function shape(args: Args) {
  const align = String(args.align) as Align
  const size = String(args.size) as Size
  const block = align === "block-start" || align === "block-end"
  const iconOnly = size === "icon-xs" || size === "icon-sm"
  const action = !block
    ? { text: "Clear", label: "Clear search", icon: "XIcon" }
    : align === "block-start"
      ? { text: "Attach", label: "Attach a file", icon: "PaperclipIcon" }
      : { text: "Send", label: "Send reply", icon: "PaperPlaneRightIcon" }
  return {
    align,
    size,
    block,
    iconOnly,
    action,
    note:
      align === "block-start"
        ? "Reply to Maya Johnson"
        : "Visible to your team",
    rule: align === "block-start" ? "border-b" : "border-t",
    disabled: Boolean(args.disabled),
    invalid: Boolean(args["aria-invalid"]),
  }
}

const ICONS = { XIcon, PaperclipIcon, PaperPlaneRightIcon }

function InputGroupStory({ args }: { args: Args }) {
  const s = shape(args)
  const Icon = ICONS[s.action.icon as keyof typeof ICONS]
  const field = {
    disabled: s.disabled,
    "aria-invalid": s.invalid || undefined,
  }
  const button = (
    <InputGroupButton
      size={s.size}
      className={s.block ? "ml-auto" : undefined}
      aria-label={s.iconOnly ? s.action.label : undefined}
      disabled={s.disabled}
    >
      {s.iconOnly ? <Icon /> : s.action.text}
    </InputGroupButton>
  )
  return (
    <InputGroup className="w-80" aria-disabled={s.disabled || undefined}>
      {s.block ? (
        <InputGroupTextarea
          placeholder="Write a reply"
          aria-label="Reply"
          {...field}
        />
      ) : (
        <InputGroupInput
          placeholder="Search projects"
          aria-label="Search projects"
          {...field}
        />
      )}
      {s.block ? (
        <InputGroupAddon align={s.align} className={s.rule}>
          <InputGroupText>{s.note}</InputGroupText>
          {button}
        </InputGroupAddon>
      ) : (
        <>
          <InputGroupAddon align={s.align}>
            <InputGroupText>
              <MagnifyingGlassIcon />
            </InputGroupText>
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">{button}</InputGroupAddon>
        </>
      )}
    </InputGroup>
  )
}

function code(args: Args): string {
  const s = shape(args)
  const icons = [
    ...(s.block ? [] : ["MagnifyingGlassIcon"]),
    ...(s.iconOnly ? [s.action.icon] : []),
  ].sort()
  const parts = [
    "InputGroup",
    "InputGroupAddon",
    "InputGroupButton",
    s.block ? "InputGroupTextarea" : "InputGroupInput",
    "InputGroupText",
  ].sort()
  const field = tag(
    3,
    s.block ? "InputGroupTextarea" : "InputGroupInput",
    [
      ["placeholder", s.block ? "Write a reply" : "Search projects"],
      ["aria-label", s.block ? "Reply" : "Search projects"],
      ["disabled", s.disabled],
      ["aria-invalid", s.invalid],
    ],
    true
  )
  const buttonProps: Prop[] = [
    ["size", s.size === "xs" ? undefined : s.size],
    ["className", s.block ? "ml-auto" : undefined],
    ["aria-label", s.iconOnly ? s.action.label : undefined],
    ["disabled", s.disabled],
  ]
  const depth = 4
  const button = s.iconOnly
    ? [
        tag(depth, "InputGroupButton", buttonProps),
        `${"  ".repeat(depth + 1)}<${s.action.icon} />`,
        `${"  ".repeat(depth)}</InputGroupButton>`,
      ]
    : leaf(depth, "InputGroupButton", buttonProps, s.action.text)
  const addons = s.block
    ? [
        tag(3, "InputGroupAddon", [
          ["align", s.align],
          ["className", s.rule],
        ]),
        `        <InputGroupText>${s.note}</InputGroupText>`,
        ...button,
        "      </InputGroupAddon>",
      ]
    : [
        tag(3, "InputGroupAddon", [
          ["align", s.align === "inline-start" ? undefined : s.align],
        ]),
        "        <InputGroupText>",
        "          <MagnifyingGlassIcon />",
        "        </InputGroupText>",
        "      </InputGroupAddon>",
        '      <InputGroupAddon align="inline-end">',
        ...button,
        "      </InputGroupAddon>",
      ]
  return [
    ...(icons.length
      ? [`import { ${icons.join(", ")} } from "@phosphor-icons/react"`, ""]
      : []),
    "import {",
    ...parts.map((part) => `  ${part},`),
    '} from "@/components/ui/input-group"',
    "",
    "export function Example() {",
    "  return (",
    tag(2, "InputGroup", [
      ["className", "w-80"],
      ["aria-disabled", s.disabled],
    ]),
    field,
    ...addons,
    "    </InputGroup>",
    "  )",
    "}",
    "",
  ].join("\n")
}

/**
 * InputGroup: a search field with a leading icon and a clear button, or a
 * reply box with a header or footer row; `align` places the add-on, `size`
 * sizes its button, and the field carries `disabled` and `aria-invalid`.
 * Disabled, the button is disabled too and the group says so to assistive
 * technology (`aria-disabled`), since it only dims.
 */
const story: Story = {
  controls: [
    {
      kind: "select",
      name: "align",
      options: ["inline-start", "inline-end", "block-start", "block-end"],
      default: "inline-start",
    },
    {
      kind: "select",
      name: "size",
      options: ["xs", "sm", "icon-xs", "icon-sm"],
      default: "xs",
    },
    { kind: "boolean", name: "disabled", default: false },
    { kind: "boolean", name: "aria-invalid", default: false },
  ],
  render: (args) => <InputGroupStory args={args} />,
  code,
}

export default story
