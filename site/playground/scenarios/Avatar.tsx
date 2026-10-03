import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "@/components/ui/avatar"
import type { Args, Story } from "@/site/playground/types"

/** The other members of the group, after the first avatar. */
const OTHERS = ["JK", "SC", "OH"]

/** A count control's value, kept in its range whatever the input holds. */
function clamp(value: Args[string], min: number, max: number): number {
  const number = Math.round(Number(value))
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : min
}

function resolve(args: Args) {
  const members = clamp(args.members, 2, 12)
  // The spec's rule: up to 4 avatars, beyond that the first 3 and a count.
  const shown = members <= 4 ? members : 3
  return {
    size: (["sm", "lg"].includes(String(args.size)) ? args.size : "default") as
      "default" | "sm" | "lg",
    initials: String(args.initials).trim().slice(0, 3) || "ML",
    showBadge: Boolean(args.showBadge),
    group: Boolean(args.group),
    others: OTHERS.slice(0, shown - 1),
    rest: members - shown,
  }
}

/** Text as a JSX child: braces and angle brackets go in an expression. */
function text(value: string): string {
  return /[{}<>]/.test(value) ? `{${JSON.stringify(value)}}` : value
}

/**
 * Avatar: initials at each size, with a status badge, alone or in a group.
 * The site ships no photo, so every avatar shows its `AvatarFallback`, the
 * state an `AvatarImage` that fails to load also lands in.
 */
const story: Story = {
  controls: [
    {
      kind: "select",
      name: "size",
      options: ["default", "sm", "lg"],
      default: "default",
    },
    { kind: "text", name: "initials", default: "ML" },
    { kind: "boolean", name: "showBadge", default: false },
    { kind: "boolean", name: "group", default: false },
    { kind: "number", name: "members", default: 5, min: 2, max: 12 },
  ],
  render: (args) => {
    const { size, initials, showBadge, group, others, rest } = resolve(args)
    const first = (
      <Avatar size={size}>
        <AvatarFallback>{initials}</AvatarFallback>
        {showBadge ? <AvatarBadge role="img" aria-label="Online" /> : null}
      </Avatar>
    )
    if (!group) return first
    return (
      <AvatarGroup>
        {first}
        {others.map((other) => (
          <Avatar key={other} size={size}>
            <AvatarFallback>{other}</AvatarFallback>
          </Avatar>
        ))}
        {rest > 0 ? <AvatarGroupCount>+{rest}</AvatarGroupCount> : null}
      </AvatarGroup>
    )
  },
  code: (args) => {
    const { size, initials, showBadge, group, others, rest } = resolve(args)
    const sizeProp = size === "default" ? "" : ` size="${size}"`
    const pad = group ? "  " : ""
    const first = [
      `${pad}    <Avatar${sizeProp}>`,
      `${pad}      <AvatarFallback>${text(initials)}</AvatarFallback>`,
      ...(showBadge
        ? [`${pad}      <AvatarBadge role="img" aria-label="Online" />`]
        : []),
      `${pad}    </Avatar>`,
    ]
    const lines = group
      ? [
          `    <AvatarGroup>`,
          ...first,
          ...others.flatMap((other) => [
            `      <Avatar${sizeProp}>`,
            `        <AvatarFallback>${other}</AvatarFallback>`,
            `      </Avatar>`,
          ]),
          ...(rest > 0
            ? [`      <AvatarGroupCount>+${rest}</AvatarGroupCount>`]
            : []),
          `    </AvatarGroup>`,
        ]
      : first
    const parts = [
      "Avatar",
      ...(showBadge ? ["AvatarBadge"] : []),
      "AvatarFallback",
      ...(group ? ["AvatarGroup"] : []),
      ...(group && rest > 0 ? ["AvatarGroupCount"] : []),
    ]
    const imports =
      parts.length > 3
        ? `import {\n${parts.map((part) => `  ${part},`).join("\n")}\n} from "@/components/ui/avatar"`
        : `import { ${parts.join(", ")} } from "@/components/ui/avatar"`
    return `${imports}

export function Example() {
  return (
${lines.join("\n")}
  )
}
`
  },
}

export default story
