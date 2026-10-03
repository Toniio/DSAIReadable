import { CopyIcon } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { Args, Story } from "@/site/playground/types"

type Side = "top" | "right" | "bottom" | "left"
type Align = "start" | "center" | "end"

/** The props that differ from their default, as the components take them. */
function parts(args: Args) {
  const side = ["right", "bottom", "left"].includes(String(args.side))
    ? (args.side as Side)
    : undefined
  const align =
    args.align === "start" || args.align === "end"
      ? (args.align as Align)
      : undefined
  const offset = Number(args.sideOffset) || 0
  const delay = Number(args.delayDuration) || 0
  return {
    label: String(args.label).trim() || "Copy",
    side,
    align,
    sideOffset: offset === 0 ? undefined : offset,
    delayDuration: delay === 0 ? undefined : delay,
    shortcut: Boolean(args.shortcut),
  }
}

function CopyButton({ args }: { args: Args }) {
  const { label, side, align, sideOffset, delayDuration, shortcut } =
    parts(args)
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip key={String(args.open)} defaultOpen={Boolean(args.open)}>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" aria-label={label}>
            <CopyIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent side={side} align={align} sideOffset={sideOffset}>
          {label}
          {shortcut ? <Kbd>⌘C</Kbd> : null}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

/**
 * Tooltip: the name and shortcut of an icon button. `open` shows the bubble
 * on the canvas; the code leaves it out, since hover and focus open it.
 */
const story: Story = {
  anatomy: { open: true },
  controls: [
    { kind: "boolean", name: "open", default: true },
    { kind: "text", name: "label", default: "Copy" },
    { kind: "boolean", name: "shortcut", default: true },
    {
      kind: "select",
      name: "side",
      options: ["top", "right", "bottom", "left"],
      default: "top",
    },
    {
      kind: "select",
      name: "align",
      options: ["start", "center", "end"],
      default: "center",
    },
    { kind: "number", name: "sideOffset", default: 0, min: 0, max: 16 },
    {
      kind: "number",
      name: "delayDuration",
      default: 0,
      min: 0,
      max: 1000,
      step: 100,
    },
  ],
  grid: false,
  render: (args) => <CopyButton args={args} />,
  code: (args) => {
    const { label, side, align, sideOffset, delayDuration, shortcut } =
      parts(args)
    const content = [
      side ? `side="${side}"` : "",
      align ? `align="${align}"` : "",
      sideOffset === undefined ? "" : `sideOffset={${sideOffset}}`,
    ].filter(Boolean)
    const provider =
      delayDuration === undefined
        ? `    <TooltipProvider>`
        : `    <TooltipProvider delayDuration={${delayDuration}}>`
    return `import { CopyIcon } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"${shortcut ? `\nimport { Kbd } from "@/components/ui/kbd"` : ""}
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function Example() {
  return (
${provider}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" aria-label=${JSON.stringify(label)}>
            <CopyIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent${content.length ? ` ${content.join(" ")}` : ""}>
          ${shortcut ? `${label} <Kbd>⌘C</Kbd>` : label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
`
  },
}

export default story
