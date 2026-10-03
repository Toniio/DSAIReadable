import type { ComponentProps } from "react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from "@/components/ui/message"
import type { Args, Story } from "@/site/playground/types"

type Align = "start" | "end"
type BubbleVariant = NonNullable<ComponentProps<typeof Bubble>["variant"]>

/** Who speaks on each side: the assistant at the start, the user at the end. */
const SPEAKERS = {
  start: { name: "Assistant", initials: "AI", status: "Edited" },
  end: { name: "Maya Johnson", initials: "MJ", status: "Read" },
} as const

function shape(args: Args) {
  const align = String(args.align) as Align
  return {
    align,
    speaker: SPEAKERS[align],
    variant: String(args.variant) as BubbleVariant,
    text: String(args.children),
    avatar: Boolean(args.avatar),
    header: Boolean(args.header),
    footer: Boolean(args.footer),
  }
}

function MessageStory({ args }: { args: Args }) {
  const s = shape(args)
  return (
    <div className="w-80">
      <Message align={s.align}>
        {s.avatar ? (
          <MessageAvatar>
            <Avatar>
              <AvatarFallback>{s.speaker.initials}</AvatarFallback>
            </Avatar>
          </MessageAvatar>
        ) : null}
        <MessageContent>
          {s.header ? <MessageHeader>{s.speaker.name}</MessageHeader> : null}
          <Bubble variant={s.variant}>
            <BubbleContent>{s.text}</BubbleContent>
          </Bubble>
          {s.footer ? <MessageFooter>{s.speaker.status}</MessageFooter> : null}
        </MessageContent>
      </Message>
    </div>
  )
}

function code(args: Args): string {
  const s = shape(args)
  const parts = [
    "Message",
    ...(s.avatar ? ["MessageAvatar"] : []),
    "MessageContent",
    ...(s.footer ? ["MessageFooter"] : []),
    ...(s.header ? ["MessageHeader"] : []),
  ]
  return [
    ...(s.avatar
      ? ['import { Avatar, AvatarFallback } from "@/components/ui/avatar"']
      : []),
    'import { Bubble, BubbleContent } from "@/components/ui/bubble"',
    parts.length > 3
      ? [
          "import {",
          ...parts.map((part) => `  ${part},`),
          '} from "@/components/ui/message"',
        ].join("\n")
      : `import { ${parts.join(", ")} } from "@/components/ui/message"`,
    "",
    "export function Example() {",
    "  return (",
    '    <div className="w-80">',
    `      <Message${s.align === "start" ? "" : ` align="${s.align}"`}>`,
    ...(s.avatar
      ? [
          "        <MessageAvatar>",
          "          <Avatar>",
          `            <AvatarFallback>${s.speaker.initials}</AvatarFallback>`,
          "          </Avatar>",
          "        </MessageAvatar>",
        ]
      : []),
    "        <MessageContent>",
    ...(s.header
      ? [`          <MessageHeader>${s.speaker.name}</MessageHeader>`]
      : []),
    `          <Bubble${s.variant === "default" ? "" : ` variant="${s.variant}"`}>`,
    `            <BubbleContent>${s.text}</BubbleContent>`,
    "          </Bubble>",
    ...(s.footer
      ? [`          <MessageFooter>${s.speaker.status}</MessageFooter>`]
      : []),
    "        </MessageContent>",
    "      </Message>",
    "    </div>",
    "  )",
    "}",
    "",
  ].join("\n")
}

/**
 * Message: one turn of a conversation. `align` puts it on the assistant's
 * side or the user's, and names the speaker to match; `variant` is the
 * Bubble's, and `ghost` drops the header and footer padding (the `ghost`
 * state). The avatar moves up above a footer.
 */
const story: Story = {
  controls: [
    {
      kind: "select",
      name: "align",
      options: ["start", "end"],
      default: "start",
    },
    {
      kind: "select",
      name: "variant",
      options: [
        "default",
        "secondary",
        "muted",
        "tinted",
        "outline",
        "ghost",
        "destructive",
      ],
      default: "default",
    },
    { kind: "text", name: "children", default: "Your order ships tomorrow." },
    { kind: "boolean", name: "avatar", default: true },
    { kind: "boolean", name: "header", default: true },
    { kind: "boolean", name: "footer", default: false },
  ],
  render: (args) => <MessageStory args={args} />,
  code,
}

export default story
