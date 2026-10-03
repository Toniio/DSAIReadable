import type { MouseEvent } from "react"
import { ThumbsUpIcon } from "@phosphor-icons/react"

import {
  Bubble,
  BubbleContent,
  BubbleGroup,
  BubbleReactions,
} from "@/components/ui/bubble"
import type { Args, Story } from "@/site/playground/types"

const VARIANTS = [
  "default",
  "secondary",
  "muted",
  "tinted",
  "outline",
  "ghost",
  "destructive",
] as const

type Variant = (typeof VARIANTS)[number]

const HREF = "/messages/1042"

function resolve(args: Args) {
  return {
    variant: VARIANTS.includes(args.variant as Variant)
      ? (args.variant as Variant)
      : "default",
    align: args.align === "end" ? ("end" as const) : ("start" as const),
    content:
      String(args.children).trim() || "Is the design review still at 3 PM?",
    clickable: Boolean(args.clickable),
    showReactions: Boolean(args.showReactions),
    side: args.side === "top" ? ("top" as const) : ("bottom" as const),
  }
}

/** The canvas keeps the reader on it: a bubble link does not navigate. */
function stay(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault()
}

/** Text as a JSX child: braces and angle brackets go in an expression. */
function text(value: string): string {
  return /[{}<>]/.test(value) ? `{${JSON.stringify(value)}}` : value
}

/** Bubble: one turn's text, its variant, side, link and reactions as controls. */
const story: Story = {
  controls: [
    {
      kind: "select",
      name: "variant",
      options: [...VARIANTS],
      default: "default",
    },
    {
      kind: "select",
      name: "align",
      options: ["start", "end"],
      default: "start",
    },
    {
      kind: "text",
      name: "children",
      default: "Is the design review still at 3 PM?",
    },
    { kind: "boolean", name: "clickable", default: false },
    { kind: "boolean", name: "showReactions", default: false },
    {
      kind: "select",
      name: "side",
      options: ["top", "bottom"],
      default: "bottom",
    },
  ],
  render: (args) => {
    const { variant, align, content, clickable, showReactions, side } =
      resolve(args)
    return (
      <BubbleGroup className="w-80 py-6">
        <Bubble variant={variant} align={align}>
          {clickable ? (
            <BubbleContent asChild>
              <a href={HREF} onClick={stay}>
                {content}
              </a>
            </BubbleContent>
          ) : (
            <BubbleContent>{content}</BubbleContent>
          )}
          {showReactions ? (
            <BubbleReactions side={side} aria-label="2 reactions: thumbs up">
              <ThumbsUpIcon />2
            </BubbleReactions>
          ) : null}
        </Bubble>
      </BubbleGroup>
    )
  },
  code: (args) => {
    const { variant, align, content, clickable, showReactions, side } =
      resolve(args)
    const props = [
      variant === "default" ? "" : ` variant="${variant}"`,
      align === "start" ? "" : ` align="${align}"`,
    ].join("")
    const body = clickable
      ? [
          `        <BubbleContent asChild>`,
          `          <a href="${HREF}">${text(content)}</a>`,
          `        </BubbleContent>`,
        ]
      : [`        <BubbleContent>${text(content)}</BubbleContent>`]
    const reactions = showReactions
      ? [
          `        <BubbleReactions${side === "bottom" ? "" : ` side="${side}"`} aria-label="2 reactions: thumbs up">`,
          `          <ThumbsUpIcon />2`,
          `        </BubbleReactions>`,
        ]
      : []
    const parts = [
      "Bubble",
      "BubbleContent",
      "BubbleGroup",
      ...(showReactions ? ["BubbleReactions"] : []),
    ]
    return `${showReactions ? `import { ThumbsUpIcon } from "@phosphor-icons/react"\n\n` : ""}import {
${parts.map((part) => `  ${part},`).join("\n")}
} from "@/components/ui/bubble"

export function Example() {
  return (
    <BubbleGroup className="w-80 py-6">
      <Bubble${props}>
${[...body, ...reactions].join("\n")}
      </Bubble>
    </BubbleGroup>
  )
}
`
  },
}

export default story
