import { Fragment } from "react"

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import type { Args, Story } from "@/site/playground/types"

const PANELS = ["Files", "Editor", "Preview", "Console"]

/** Even shares that add up to 100, the first panel taking what is left over. */
function sizes(count: number): string[] {
  const share = Math.floor(100 / count)
  return Array.from(
    { length: count },
    (_, index) => `${index === 0 ? 100 - share * (count - 1) : share}%`
  )
}

function panelCount(args: Args): number {
  return Math.min(PANELS.length, Math.max(2, Number(args.panels) || 2))
}

function handleLabel(name: string, args: Args): string {
  return `${name} ${args.orientation === "vertical" ? "height" : "width"}`
}

function Panels({ args }: { args: Args }) {
  const count = panelCount(args)
  const orientation = args.orientation === "vertical" ? "vertical" : undefined
  return (
    <ResizablePanelGroup
      key={`${args.orientation}-${count}`}
      orientation={orientation}
      className="min-h-52 border"
    >
      {sizes(count).map((size, index) => (
        <Fragment key={PANELS[index]}>
          {index > 0 ? (
            <ResizableHandle
              withHandle={Boolean(args.withHandle)}
              disabled={Boolean(args.disabled)}
              aria-label={handleLabel(PANELS[index - 1], args)}
            />
          ) : null}
          <ResizablePanel defaultSize={size} minSize="15%">
            <div className="flex h-full items-center justify-center p-4 text-xs font-medium">
              {PANELS[index]}
            </div>
          </ResizablePanel>
        </Fragment>
      ))}
    </ResizablePanelGroup>
  )
}

/** Resizable: an editor layout split into panels the reader drags apart. */
const story: Story = {
  controls: [
    {
      kind: "select",
      name: "orientation",
      options: ["horizontal", "vertical"],
      default: "horizontal",
    },
    { kind: "number", name: "panels", default: 2, min: 2, max: 4 },
    { kind: "boolean", name: "withHandle", default: false },
    { kind: "boolean", name: "disabled", default: false },
  ],
  layout: "padded",
  render: (args) => <Panels args={args} />,
  code: (args) => {
    const count = panelCount(args)
    const group =
      args.orientation === "vertical"
        ? `    <ResizablePanelGroup orientation="vertical" className="min-h-52 border">`
        : `    <ResizablePanelGroup className="min-h-52 border">`
    const handle = (index: number) => {
      const props = [
        args.withHandle ? "withHandle" : "",
        args.disabled ? "disabled" : "",
        `aria-label="${handleLabel(PANELS[index - 1], args)}"`,
      ].filter(Boolean)
      return `      <ResizableHandle ${props.join(" ")} />`
    }
    const panels = sizes(count).map((size, index) =>
      [
        index > 0 ? handle(index) : "",
        `      <ResizablePanel defaultSize="${size}" minSize="15%">`,
        `        <div className="flex h-full items-center justify-center p-4 text-xs font-medium">`,
        `          ${PANELS[index]}`,
        `        </div>`,
        `      </ResizablePanel>`,
      ]
        .filter(Boolean)
        .join("\n")
    )
    return `import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

export function Example() {
  return (
${group}
${panels.join("\n")}
    </ResizablePanelGroup>
  )
}
`
  },
}

export default story
