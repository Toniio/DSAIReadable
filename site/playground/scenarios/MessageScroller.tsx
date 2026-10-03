import { type ComponentProps, useState } from "react"

import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Button } from "@/components/ui/button"
import { Message, MessageContent } from "@/components/ui/message"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"
import type { Args, Story } from "@/site/playground/types"

type Position = "start" | "end" | "last-anchor"
type ButtonProps = ComponentProps<typeof MessageScrollerButton>

interface Turn {
  id: string
  from: "assistant" | "user"
  text: string
}

/** What each side says, in turn: the thread is as long as `messages` asks. */
const LINES: Record<Turn["from"], string[]> = {
  assistant: [
    "Your order left the warehouse this morning.",
    "It is due on Thursday, between 9 and 12.",
    "I can send a text when the driver is close.",
    "The courier is ParcelGo, tracking code PG 4471.",
  ],
  user: [
    "Where is my order?",
    "Can it come on Friday instead?",
    "Yes, please send a text.",
    "Thanks, that is all for now.",
  ],
}

/** The thread: turns alternate, the assistant first; one id per turn. */
function thread(count: number): Turn[] {
  return Array.from({ length: count }, (_, index) => {
    const from = index % 2 === 0 ? "assistant" : "user"
    const line = LINES[from][Math.floor(index / 2) % LINES[from].length]
    return { id: String(index + 1), from, text: line }
  })
}

function shape(args: Args) {
  return {
    count: Math.min(Math.max(Math.round(Number(args.messages)), 2), 60),
    position: String(args.defaultScrollPosition) as Position,
    autoScroll: Boolean(args.autoScroll),
    start: Boolean(args.startButton),
    variant: String(args.variant) as NonNullable<ButtonProps["variant"]>,
    size: String(args.size) as NonNullable<ButtonProps["size"]>,
  }
}

function MessageScrollerStory({ args }: { args: Args }) {
  const s = shape(args)
  const [messages, setMessages] = useState(() => thread(s.count))
  const button = {
    variant: s.variant,
    size: s.size,
  }
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <div className="h-80 border">
        <MessageScrollerProvider
          defaultScrollPosition={s.position}
          autoScroll={s.autoScroll}
        >
          <MessageScroller>
            <MessageScrollerViewport aria-label="Order support conversation">
              <MessageScrollerContent className="p-4">
                {messages.map((turn) => (
                  <MessageScrollerItem
                    key={turn.id}
                    messageId={turn.id}
                    scrollAnchor={turn.from === "user"}
                  >
                    <Message align={turn.from === "user" ? "end" : "start"}>
                      <MessageContent>
                        <Bubble
                          variant={
                            turn.from === "user" ? "default" : "secondary"
                          }
                        >
                          <BubbleContent>{turn.text}</BubbleContent>
                        </Bubble>
                      </MessageContent>
                    </Message>
                  </MessageScrollerItem>
                ))}
              </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton {...button} />
            {s.start ? (
              <MessageScrollerButton direction="start" {...button} />
            ) : null}
          </MessageScroller>
        </MessageScrollerProvider>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="self-start"
        onClick={() =>
          setMessages((list) => [
            ...list,
            {
              id: String(list.length + 1),
              from: "assistant",
              text: "Update: the driver is two stops away.",
            },
          ])
        }
      >
        Add a reply
      </Button>
    </div>
  )
}

function code(args: Args): string {
  const s = shape(args)
  const provider = [
    ...(s.position === "end" ? [] : [`defaultScrollPosition="${s.position}"`]),
    ...(s.autoScroll ? ["autoScroll"] : []),
  ]
  const button = [
    ...(s.variant === "secondary" ? [] : [`variant="${s.variant}"`]),
    ...(s.size === "icon-sm" ? [] : [`size="${s.size}"`]),
  ]
  const attrs = (list: string[]) => list.map((prop) => ` ${prop}`).join("")
  return [
    '"use client"',
    "",
    'import { useState } from "react"',
    "",
    'import { Bubble, BubbleContent } from "@/components/ui/bubble"',
    'import { Button } from "@/components/ui/button"',
    'import { Message, MessageContent } from "@/components/ui/message"',
    "import {",
    "  MessageScroller,",
    "  MessageScrollerButton,",
    "  MessageScrollerContent,",
    "  MessageScrollerItem,",
    "  MessageScrollerProvider,",
    "  MessageScrollerViewport,",
    '} from "@/components/ui/message-scroller"',
    "",
    'type Speaker = "assistant" | "user"',
    "",
    "const lines: Record<Speaker, string[]> = {",
    ...(["assistant", "user"] as const).flatMap((from) => [
      `  ${from}: [`,
      ...LINES[from].map((line) => `    ${JSON.stringify(line)},`),
      "  ],",
    ]),
    "}",
    "",
    "// The turns alternate, the assistant first.",
    `const thread = Array.from({ length: ${s.count} }, (_, index) => {`,
    '  const from: Speaker = index % 2 === 0 ? "assistant" : "user"',
    "  return {",
    "    id: String(index + 1),",
    "    from,",
    "    text: lines[from][Math.floor(index / 2) % lines[from].length],",
    "  }",
    "})",
    "",
    "export function Example() {",
    "  const [messages, setMessages] = useState(thread)",
    "  return (",
    '    <div className="flex w-full max-w-md flex-col gap-3">',
    '      <div className="h-80 border">',
    `        <MessageScrollerProvider${attrs(provider)}>`,
    "          <MessageScroller>",
    '            <MessageScrollerViewport aria-label="Order support conversation">',
    '              <MessageScrollerContent className="p-4">',
    "                {messages.map((turn) => (",
    "                  <MessageScrollerItem",
    "                    key={turn.id}",
    "                    messageId={turn.id}",
    '                    scrollAnchor={turn.from === "user"}',
    "                  >",
    '                    <Message align={turn.from === "user" ? "end" : "start"}>',
    "                      <MessageContent>",
    "                        <Bubble",
    "                          variant={",
    '                            turn.from === "user" ? "default" : "secondary"',
    "                          }",
    "                        >",
    "                          <BubbleContent>{turn.text}</BubbleContent>",
    "                        </Bubble>",
    "                      </MessageContent>",
    "                    </Message>",
    "                  </MessageScrollerItem>",
    "                ))}",
    "              </MessageScrollerContent>",
    "            </MessageScrollerViewport>",
    `            <MessageScrollerButton${attrs(button)} />`,
    ...(s.start
      ? [
          `            <MessageScrollerButton direction="start"${attrs(button)} />`,
        ]
      : []),
    "          </MessageScroller>",
    "        </MessageScrollerProvider>",
    "      </div>",
    "      <Button",
    '        variant="outline"',
    '        size="sm"',
    '        className="self-start"',
    "        onClick={() =>",
    "          setMessages((list) => [",
    "            ...list,",
    "            {",
    "              id: String(list.length + 1),",
    '              from: "assistant",',
    '              text: "Update: the driver is two stops away.",',
    "            },",
    "          ])",
    "        }",
    "      >",
    "        Add a reply",
    "      </Button>",
    "    </div>",
    "  )",
    "}",
    "",
  ].join("\n")
}

/**
 * MessageScroller: an order-support thread in a panel of fixed height, with
 * "Add a reply" to watch it follow new messages. `defaultScrollPosition` and
 * `autoScroll` are the provider's; the first is read on mount, so a change
 * remounts the thread. The end button shows once there is somewhere to go:
 * scroll up, or open the thread at its start.
 */
const story: Story = {
  controls: [
    {
      kind: "select",
      name: "defaultScrollPosition",
      options: ["start", "end", "last-anchor"],
      default: "end",
    },
    { kind: "number", name: "messages", default: 24, min: 2, max: 60 },
    { kind: "boolean", name: "autoScroll", default: false },
    { kind: "boolean", name: "startButton", default: false },
    {
      kind: "select",
      name: "variant",
      options: [
        "default",
        "secondary",
        "outline",
        "ghost",
        "destructive",
        "link",
      ],
      default: "secondary",
    },
    {
      kind: "select",
      name: "size",
      options: ["icon-xs", "icon-sm", "icon", "icon-lg"],
      default: "icon-sm",
    },
  ],
  render: (args) => (
    <MessageScrollerStory
      key={`${args.defaultScrollPosition}-${args.messages}`}
      args={args}
    />
  ),
  code,
  layout: "padded",
  grid: false,
}

export default story
