import type { ComponentProps } from "react"

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import type { Args, Story } from "@/site/playground/types"

type Size = NonNullable<ComponentProps<typeof PaginationLink>["size"]>

/**
 * The entries of the list: every page up to 7, then the first, the last and
 * the neighbors of the current one, with an ellipsis for each gap.
 */
function entries(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1)
  const kept = [...new Set([1, current - 1, current, current + 1, total])]
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b)
  return kept.flatMap((page, index) => {
    const gap = index > 0 ? page - kept[index - 1] : 1
    if (gap === 2) return [page - 1, page]
    if (gap > 2) return ["ellipsis" as const, page]
    return [page]
  })
}

function shape(args: Args) {
  const total = Math.min(Math.max(Math.round(Number(args.totalPages)), 1), 20)
  const current = Math.min(
    Math.max(Math.round(Number(args.currentPage)), 1),
    total
  )
  return {
    current,
    total,
    size: String(args.size) as Size,
    list: entries(current, total),
  }
}

function PaginationStory({ args }: { args: Args }) {
  const s = shape(args)
  return (
    <Pagination>
      <PaginationContent>
        {s.current > 1 ? (
          <PaginationItem>
            <PaginationPrevious href={`#page-${s.current - 1}`} />
          </PaginationItem>
        ) : null}
        {s.list.map((entry, index) =>
          entry === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={entry}>
              <PaginationLink
                href={`#page-${entry}`}
                aria-label={`Page ${entry}`}
                isActive={entry === s.current}
                size={s.size}
              >
                {entry}
              </PaginationLink>
            </PaginationItem>
          )
        )}
        {s.current < s.total ? (
          <PaginationItem>
            <PaginationNext href={`#page-${s.current + 1}`} />
          </PaginationItem>
        ) : null}
      </PaginationContent>
    </Pagination>
  )
}

function code(args: Args): string {
  const s = shape(args)
  const link = (page: number) => {
    const props = [
      `href="#page-${page}"`,
      `aria-label="Page ${page}"`,
      ...(page === s.current ? ["isActive"] : []),
      ...(s.size === "icon" ? [] : [`size="${s.size}"`]),
    ]
    // Two props or more: Prettier puts the page number on its own line.
    const open = `          <PaginationLink ${props.join(" ")}>`
    return [
      ...(open.length <= 80
        ? [open]
        : [
            "          <PaginationLink",
            ...props.map((prop) => `            ${prop}`),
            "          >",
          ]),
      `            ${page}`,
      "          </PaginationLink>",
    ]
  }
  const items = [
    ...(s.current > 1
      ? [
          "        <PaginationItem>",
          `          <PaginationPrevious href="#page-${s.current - 1}" />`,
          "        </PaginationItem>",
        ]
      : []),
    ...s.list.flatMap((entry) => [
      "        <PaginationItem>",
      ...(entry === "ellipsis"
        ? ["          <PaginationEllipsis />"]
        : link(entry)),
      "        </PaginationItem>",
    ]),
    ...(s.current < s.total
      ? [
          "        <PaginationItem>",
          `          <PaginationNext href="#page-${s.current + 1}" />`,
          "        </PaginationItem>",
        ]
      : []),
  ]
  const parts = [
    "Pagination",
    "PaginationContent",
    ...(s.list.includes("ellipsis") ? ["PaginationEllipsis"] : []),
    "PaginationItem",
    "PaginationLink",
    ...(s.current < s.total ? ["PaginationNext"] : []),
    ...(s.current > 1 ? ["PaginationPrevious"] : []),
  ]
  return [
    "import {",
    ...parts.map((part) => `  ${part},`),
    '} from "@/components/ui/pagination"',
    "",
    "export function Example() {",
    "  return (",
    "    <Pagination>",
    "      <PaginationContent>",
    ...items,
    "      </PaginationContent>",
    "    </Pagination>",
    "  )",
    "}",
    "",
  ].join("\n")
}

/**
 * Pagination: the links of a paged list. The component holds no state, so
 * `currentPage` and `totalPages` are the page's: past 7 pages, the list keeps
 * the first, the last and the current page's neighbors behind ellipses.
 * Previous and Next leave the first and last pages; each number is named
 * "Page 3" for a screen reader. `size` sizes the numbered links.
 */
const story: Story = {
  controls: [
    {
      kind: "number",
      name: "currentPage",
      default: 2,
      min: 1,
      max: 20,
    },
    {
      kind: "number",
      name: "totalPages",
      default: 10,
      min: 1,
      max: 20,
    },
    {
      kind: "select",
      name: "size",
      options: [
        "default",
        "xs",
        "sm",
        "lg",
        "icon",
        "icon-xs",
        "icon-sm",
        "icon-lg",
      ],
      default: "icon",
    },
  ],
  render: (args) => <PaginationStory args={args} />,
  code,
}

export default story
