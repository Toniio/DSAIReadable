import { ImageIcon } from "@phosphor-icons/react"

import { AspectRatio } from "@/components/ui/aspect-ratio"
import type { Args, Story } from "@/site/playground/types"

/** Each ratio offered, as the reader names it and as the prop takes it. */
const RATIOS: Record<string, { value: number; code: string }> = {
  "1:1": { value: 1, code: "1" },
  "4:3": { value: 4 / 3, code: "4 / 3" },
  "16:9": { value: 16 / 9, code: "16 / 9" },
  "21:9": { value: 21 / 9, code: "21 / 9" },
}

function resolve(args: Args) {
  const label = String(args.ratio) in RATIOS ? String(args.ratio) : "1:1"
  return { label, ...RATIOS[label] }
}

/**
 * AspectRatio: a media frame at the chosen ratio. The site ships no image,
 * so a placeholder fills the frame the way an `object-cover` image would.
 */
const story: Story = {
  controls: [
    {
      kind: "select",
      name: "ratio",
      options: Object.keys(RATIOS),
      default: "1:1",
    },
  ],
  render: (args) => {
    const { label, value } = resolve(args)
    return (
      <div className="w-64">
        <AspectRatio ratio={value}>
          <div
            role="img"
            aria-label={`Image placeholder, ${label}`}
            className="flex size-full items-center justify-center bg-muted text-muted-foreground"
          >
            <ImageIcon className="size-8" />
          </div>
        </AspectRatio>
      </div>
    )
  },
  code: (args) => {
    const { label, code } = resolve(args)
    const root =
      label === "1:1" ? "<AspectRatio>" : `<AspectRatio ratio={${code}}>`
    return `import { ImageIcon } from "@phosphor-icons/react"

import { AspectRatio } from "@/components/ui/aspect-ratio"

export function Example() {
  return (
    <div className="w-64">
      ${root}
        <div
          role="img"
          aria-label="Image placeholder, ${label}"
          className="flex size-full items-center justify-center bg-muted text-muted-foreground"
        >
          <ImageIcon className="size-8" />
        </div>
      </AspectRatio>
    </div>
  )
}
`
  },
}

export default story
