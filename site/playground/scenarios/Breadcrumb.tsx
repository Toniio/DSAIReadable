import { Fragment } from "react"
import { DotOutlineIcon } from "@phosphor-icons/react"

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { text } from "@/site/playground/jsx"
import type { Args, Story } from "@/site/playground/types"

/** The parent pages, from the top of the hierarchy down. */
const PARENTS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/products/shoes", label: "Shoes" },
  { href: "/products/shoes/running", label: "Running" },
  { href: "/products/shoes/running/trail", label: "Trail running" },
]

/** A count control's value, kept in its range whatever the input holds. */
function clamp(value: Args[string], min: number, max: number): number {
  const number = Math.round(Number(value))
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : min
}

function resolve(args: Args) {
  const parents = PARENTS.slice(0, clamp(args.items, 2, PARENTS.length + 1) - 1)
  // Collapsed, a trail longer than 3 steps keeps its first and last parent.
  const collapse = Boolean(args.collapsed) && parents.length > 2
  const steps = collapse
    ? [parents[0], null, parents[parents.length - 1]]
    : parents
  return {
    steps,
    dot: args.separator === "dot",
    page: String(args.page).trim() || "Trail Runner 3",
  }
}

/** Breadcrumb: a product trail whose depth, ellipsis and separator are controls. */
const story: Story = {
  controls: [
    { kind: "number", name: "items", default: 3, min: 2, max: 6 },
    { kind: "boolean", name: "collapsed", default: false },
    {
      kind: "select",
      name: "separator",
      options: ["caret", "dot"],
      default: "caret",
    },
    { kind: "text", name: "page", default: "Trail Runner 3" },
  ],
  render: (args) => {
    const { steps, dot, page } = resolve(args)
    return (
      <Breadcrumb>
        <BreadcrumbList>
          {steps.map((step) => (
            <Fragment key={step ? step.href : "ellipsis"}>
              <BreadcrumbItem>
                {step ? (
                  <BreadcrumbLink href={step.href}>{step.label}</BreadcrumbLink>
                ) : (
                  <BreadcrumbEllipsis />
                )}
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                {dot ? <DotOutlineIcon /> : undefined}
              </BreadcrumbSeparator>
            </Fragment>
          ))}
          <BreadcrumbItem>
            <BreadcrumbPage>{page}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
  },
  code: (args) => {
    const { steps, dot, page } = resolve(args)
    const separator = dot
      ? [
          `      <BreadcrumbSeparator>`,
          `        <DotOutlineIcon />`,
          `      </BreadcrumbSeparator>`,
        ]
      : [`      <BreadcrumbSeparator />`]
    const lines = [
      `    <Breadcrumb>`,
      `      <BreadcrumbList>`,
      ...steps.flatMap((step) => [
        `        <BreadcrumbItem>`,
        step
          ? `          <BreadcrumbLink href="${step.href}">${step.label}</BreadcrumbLink>`
          : `          <BreadcrumbEllipsis />`,
        `        </BreadcrumbItem>`,
        ...separator.map((line) => `  ${line}`),
      ]),
      `        <BreadcrumbItem>`,
      `          <BreadcrumbPage>${text(page)}</BreadcrumbPage>`,
      `        </BreadcrumbItem>`,
      `      </BreadcrumbList>`,
      `    </Breadcrumb>`,
    ]
    const parts = [
      "Breadcrumb",
      ...(steps.includes(null) ? ["BreadcrumbEllipsis"] : []),
      "BreadcrumbItem",
      "BreadcrumbLink",
      "BreadcrumbList",
      "BreadcrumbPage",
      "BreadcrumbSeparator",
    ]
    return `${dot ? `import { DotOutlineIcon } from "@phosphor-icons/react"\n\n` : ""}import {
${parts.map((part) => `  ${part},`).join("\n")}
} from "@/components/ui/breadcrumb"

export function Example() {
  return (
${lines.join("\n")}
  )
}
`
  },
}

export default story
