import Link from "next/link"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import type { Args, Story } from "@/site/playground/types"

type Side = "top" | "right" | "bottom" | "left"
type Align = "start" | "center" | "end"

const SIDES: Side[] = ["top", "right", "bottom", "left"]
const ALIGNS: Align[] = ["start", "center", "end"]

interface CardArgs {
  open: boolean
  side: Side
  align: Align
  openDelay: number
  closeDelay: number
}

function read(args: Args): CardArgs {
  const side = String(args.side) as Side
  const align = String(args.align) as Align
  return {
    open: Boolean(args.open),
    side: SIDES.includes(side) ? side : "bottom",
    align: ALIGNS.includes(align) ? align : "center",
    openDelay: Math.max(Number(args.openDelay) || 0, 0),
    closeDelay: Math.max(Number(args.closeDelay) || 0, 0),
  }
}

function Profile() {
  return (
    <div className="flex gap-3">
      <Avatar>
        <AvatarFallback>JC</AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">James Carter</p>
        <p className="text-xs text-muted-foreground">
          Front-end developer. Joined in March 2024.
        </p>
      </div>
    </div>
  )
}

function code(args: Args): string {
  const a = read(args)
  const root = [
    a.open ? "defaultOpen" : "",
    a.openDelay === 700 ? "" : `openDelay={${a.openDelay}}`,
    a.closeDelay === 300 ? "" : `closeDelay={${a.closeDelay}}`,
  ]
    .filter(Boolean)
    .map((prop) => ` ${prop}`)
    .join("")
  const content = [
    a.side === "bottom" ? "" : `side="${a.side}"`,
    a.align === "center" ? "" : `align="${a.align}"`,
  ]
    .filter(Boolean)
    .map((prop) => ` ${prop}`)
    .join("")
  return `import Link from "next/link"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"

export function Example() {
  return (
    <HoverCard${root}>
      <HoverCardTrigger asChild>
        <Button variant="link" asChild>
          <Link href="#jcarter">@jcarter</Link>
        </Button>
      </HoverCardTrigger>
      <HoverCardContent${content}>
        <div className="flex gap-3">
          <Avatar>
            <AvatarFallback>JC</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">James Carter</p>
            <p className="text-xs text-muted-foreground">
              Front-end developer. Joined in March 2024.
            </p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
`
}

/**
 * HoverCard: a profile preview on a mention. With `open` on it starts open,
 * and remounts when `open` changes; hovering or focusing the link opens it
 * after `openDelay`.
 */
const story: Story = {
  controls: [
    { kind: "boolean", name: "open", default: true },
    { kind: "select", name: "side", options: SIDES, default: "bottom" },
    { kind: "select", name: "align", options: ALIGNS, default: "center" },
    {
      kind: "number",
      name: "openDelay",
      default: 700,
      min: 0,
      max: 2000,
      step: 100,
    },
    {
      kind: "number",
      name: "closeDelay",
      default: 300,
      min: 0,
      max: 2000,
      step: 100,
    },
  ],
  render: (args) => {
    const a = read(args)
    return (
      <div className="flex justify-center px-8 py-28">
        <HoverCard
          key={String(a.open)}
          defaultOpen={a.open}
          openDelay={a.openDelay}
          closeDelay={a.closeDelay}
        >
          <HoverCardTrigger asChild>
            <Button variant="link" asChild>
              <Link href="#jcarter">@jcarter</Link>
            </Button>
          </HoverCardTrigger>
          <HoverCardContent side={a.side} align={a.align}>
            <Profile />
          </HoverCardContent>
        </HoverCard>
      </div>
    )
  },
  code,
  layout: "fullscreen",
  grid: false,
}

export default story
