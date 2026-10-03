import { Fragment } from "react"

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import type { Args, Story } from "@/site/playground/types"

function itemCount(args: Args): number {
  return Math.min(100, Math.max(1, Number(args.items) || 1))
}

/** The release tags, newest first: `v1.2.0-beta.50` down to `.1`. */
function tags(count: number): string[] {
  return Array.from(
    { length: count },
    (_, index) => `v1.2.0-beta.${count - index}`
  )
}

function Area({ args }: { args: Args }) {
  const count = itemCount(args)
  if (args.orientation === "horizontal")
    return (
      <ScrollArea
        role="region"
        aria-label="Releases"
        className="w-96 max-w-full border"
      >
        <div className="flex w-max gap-4 p-4">
          {tags(count).map((tag) => (
            <figure key={tag} className="flex flex-col gap-2">
              <div className="size-32 bg-muted" />
              <figcaption className="text-xs text-muted-foreground">
                {tag}
              </figcaption>
            </figure>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    )
  return (
    <ScrollArea role="region" aria-label="Tags" className="h-72 w-48 border">
      <div className="p-4">
        <p className="mb-4 text-sm font-medium">Tags</p>
        {tags(count).map((tag, index) => (
          <Fragment key={tag}>
            {index > 0 ? <Separator className="my-2" /> : null}
            <p className="text-xs">{tag}</p>
          </Fragment>
        ))}
      </div>
    </ScrollArea>
  )
}

/** ScrollArea: a list of release tags, or a row of releases, that outgrows its box. */
const story: Story = {
  controls: [
    {
      kind: "select",
      name: "orientation",
      options: ["vertical", "horizontal"],
      default: "vertical",
    },
    { kind: "number", name: "items", default: 50, min: 1, max: 100 },
  ],
  render: (args) => <Area args={args} />,
  code: (args) => {
    const count = itemCount(args)
    const list = `const tags = Array.from(
  { length: ${count} },
  (_, index) => \`v1.2.0-beta.\${${count} - index}\`
)`
    if (args.orientation === "horizontal")
      return `import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

${list}

export function Example() {
  return (
    <ScrollArea
      role="region"
      aria-label="Releases"
      className="w-96 max-w-full border"
    >
      <div className="flex w-max gap-4 p-4">
        {tags.map((tag) => (
          <figure key={tag} className="flex flex-col gap-2">
            <div className="size-32 bg-muted" />
            <figcaption className="text-xs text-muted-foreground">
              {tag}
            </figcaption>
          </figure>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
`
    return `import { Fragment } from "react"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

${list}

export function Example() {
  return (
    <ScrollArea role="region" aria-label="Tags" className="h-72 w-48 border">
      <div className="p-4">
        <p className="mb-4 text-sm font-medium">Tags</p>
        {tags.map((tag, index) => (
          <Fragment key={tag}>
            {index > 0 ? <Separator className="my-2" /> : null}
            <p className="text-xs">{tag}</p>
          </Fragment>
        ))}
      </div>
    </ScrollArea>
  )
}
`
  },
}

export default story
