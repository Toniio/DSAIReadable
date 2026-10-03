import { Fragment } from "react"
import {
  CaretDownIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CaretUpIcon,
} from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
} from "@/components/ui/button-group"
import type { Args, Story } from "@/site/playground/types"

const VARIANTS = ["outline", "secondary", "default", "ghost"] as const
const SIZES = ["xs", "sm", "default", "lg"] as const

type Variant = (typeof VARIANTS)[number]
type Size = (typeof SIZES)[number]

function resolve(args: Args) {
  const vertical = args.orientation === "vertical"
  return {
    orientation: vertical ? ("vertical" as const) : ("horizontal" as const),
    vertical,
    variant: VARIANTS.includes(args.variant as Variant)
      ? (args.variant as Variant)
      : "outline",
    size: SIZES.includes(args.size as Size) ? (args.size as Size) : "default",
    showSeparator: Boolean(args.showSeparator),
    showText: Boolean(args.showText),
  }
}

/**
 * ButtonGroup: a pager. `orientation` is the group's own axis; `variant` and
 * `size` go to its Buttons, the outline ones the spec's example uses.
 */
const story: Story = {
  controls: [
    {
      kind: "select",
      name: "orientation",
      options: ["horizontal", "vertical"],
      default: "horizontal",
    },
    {
      kind: "select",
      name: "variant",
      options: [...VARIANTS],
      default: "outline",
    },
    { kind: "select", name: "size", options: [...SIZES], default: "default" },
    { kind: "boolean", name: "showSeparator", default: false },
    { kind: "boolean", name: "showText", default: false },
  ],
  render: (args) => {
    const { orientation, vertical, variant, size, showSeparator, showText } =
      resolve(args)
    const Previous = vertical ? CaretUpIcon : CaretLeftIcon
    const Next = vertical ? CaretDownIcon : CaretRightIcon
    const ids = ["previous", ...(showText ? ["text"] : []), "next"]
    return (
      <ButtonGroup orientation={orientation} aria-label="Pagination">
        {ids.map((id, index) => (
          <Fragment key={id}>
            {showSeparator && index > 0 ? (
              <ButtonGroupSeparator
                orientation={vertical ? "horizontal" : "vertical"}
              />
            ) : null}
            {id === "previous" ? (
              <Button variant={variant} size={size}>
                <Previous data-icon="inline-start" />
                Previous
              </Button>
            ) : id === "text" ? (
              <ButtonGroupText>Page 2 of 8</ButtonGroupText>
            ) : (
              <Button variant={variant} size={size}>
                Next
                <Next data-icon="inline-end" />
              </Button>
            )}
          </Fragment>
        ))}
      </ButtonGroup>
    )
  },
  code: (args) => {
    const { orientation, vertical, variant, size, showSeparator, showText } =
      resolve(args)
    const previous = vertical ? "CaretUpIcon" : "CaretLeftIcon"
    const next = vertical ? "CaretDownIcon" : "CaretRightIcon"
    const buttonProps = [
      variant === "default" ? "" : ` variant="${variant}"`,
      size === "default" ? "" : ` size="${size}"`,
    ].join("")
    const separator = showSeparator
      ? [
          vertical
            ? `      <ButtonGroupSeparator orientation="horizontal" />`
            : `      <ButtonGroupSeparator />`,
        ]
      : []
    const lines = [
      `    <ButtonGroup orientation="${orientation}" aria-label="Pagination">`,
      `      <Button${buttonProps}>`,
      `        <${previous} data-icon="inline-start" />`,
      `        Previous`,
      `      </Button>`,
      ...separator,
      ...(showText
        ? [`      <ButtonGroupText>Page 2 of 8</ButtonGroupText>`, ...separator]
        : []),
      `      <Button${buttonProps}>`,
      `        Next`,
      `        <${next} data-icon="inline-end" />`,
      `      </Button>`,
      `    </ButtonGroup>`,
    ]
    const parts = [
      "ButtonGroup",
      ...(showSeparator ? ["ButtonGroupSeparator"] : []),
      ...(showText ? ["ButtonGroupText"] : []),
    ]
    const icons = [next, previous].sort()
    const groupImport =
      parts.length > 2
        ? `import {\n${parts.map((part) => `  ${part},`).join("\n")}\n} from "@/components/ui/button-group"`
        : `import { ${parts.join(", ")} } from "@/components/ui/button-group"`
    return `import { ${icons.join(", ")} } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
${groupImport}

export function Example() {
  return (
${lines.join("\n")}
  )
}
`
  },
}

export default story
