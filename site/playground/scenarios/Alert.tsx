import {
  CheckCircleIcon,
  InfoIcon,
  WarningCircleIcon,
  WarningIcon,
} from "@phosphor-icons/react"

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import type { Args, Story } from "@/site/playground/types"

type Variant = "default" | "destructive" | "success" | "warning"

/** A message per tone: the icon, the words and the action that fit it. */
const TONES: Record<
  Variant,
  {
    Icon: typeof InfoIcon
    icon: string
    title: string
    description: string
    action: string
  }
> = {
  default: {
    Icon: InfoIcon,
    icon: "InfoIcon",
    title: "New version available",
    description: "Refresh the page to load the latest release.",
    action: "Refresh",
  },
  destructive: {
    Icon: WarningCircleIcon,
    icon: "WarningCircleIcon",
    title: "Payment failed",
    description: "Check your card details and try again.",
    action: "Retry",
  },
  success: {
    Icon: CheckCircleIcon,
    icon: "CheckCircleIcon",
    title: "Settings saved",
    description: "Your changes are live for the whole team.",
    action: "Undo",
  },
  warning: {
    Icon: WarningIcon,
    icon: "WarningIcon",
    title: "Session expires soon",
    description: "Save your work: you will be signed out in five minutes.",
    action: "Extend",
  },
}

const VARIANTS = Object.keys(TONES) as Variant[]

/**
 * The words shown: the tone's own until the reader types others, so the
 * default copy follows the variant and the axis grid reads true.
 */
function resolve(args: Args) {
  const variant = VARIANTS.includes(args.variant as Variant)
    ? (args.variant as Variant)
    : "default"
  const tone = TONES[variant]
  const title = String(args.title)
  const description = String(args.description)
  return {
    variant,
    tone,
    title: title === TONES.default.title ? tone.title : title,
    description:
      description === TONES.default.description
        ? tone.description
        : description,
    showIcon: Boolean(args.showIcon),
    showAction: Boolean(args.showAction),
  }
}

/** Text as a JSX child: braces and angle brackets go in an expression. */
function text(value: string): string {
  return /[{}<>]/.test(value) ? `{${JSON.stringify(value)}}` : value
}

/** Alert: one message per tone, with its icon, description and action as controls. */
const story: Story = {
  controls: [
    {
      kind: "select",
      name: "variant",
      options: VARIANTS,
      default: "default",
    },
    { kind: "text", name: "title", default: TONES.default.title },
    { kind: "text", name: "description", default: TONES.default.description },
    { kind: "boolean", name: "showIcon", default: true },
    { kind: "boolean", name: "showAction", default: false },
  ],
  render: (args) => {
    const { variant, tone, title, description, showIcon, showAction } =
      resolve(args)
    const { Icon } = tone
    return (
      <Alert variant={variant} className="max-w-md">
        {showIcon ? <Icon /> : null}
        <AlertTitle>{title}</AlertTitle>
        {description ? (
          <AlertDescription>{description}</AlertDescription>
        ) : null}
        {showAction ? (
          <AlertAction>
            <Button size="xs" variant="outline">
              {tone.action}
            </Button>
          </AlertAction>
        ) : null}
      </Alert>
    )
  },
  code: (args) => {
    const { variant, tone, title, description, showIcon, showAction } =
      resolve(args)
    const parts = ["Alert", ...(showAction ? ["AlertAction"] : [])]
    parts.push(...(description ? ["AlertDescription"] : []), "AlertTitle")
    const imports = [
      showIcon
        ? `import { ${tone.icon} } from "@phosphor-icons/react"\n\n`
        : "",
      `import { ${parts.join(", ")} } from "@/components/ui/alert"`,
      showAction ? `\nimport { Button } from "@/components/ui/button"` : "",
    ].join("")
    const variantProp = variant === "default" ? "" : ` variant="${variant}"`
    const body = [
      `    <Alert${variantProp} className="max-w-md">`,
      showIcon ? `      <${tone.icon} />` : "",
      `      <AlertTitle>${text(title)}</AlertTitle>`,
      description
        ? `      <AlertDescription>\n        ${text(description)}\n      </AlertDescription>`
        : "",
      showAction
        ? `      <AlertAction>\n        <Button size="xs" variant="outline">\n          ${tone.action}\n        </Button>\n      </AlertAction>`
        : "",
      `    </Alert>`,
    ]
      .filter(Boolean)
      .join("\n")
    return `${imports}

export function Example() {
  return (
${body}
  )
}
`
  },
}

export default story
