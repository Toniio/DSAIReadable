import Link from "next/link"
import { MagnifyingGlassIcon } from "@phosphor-icons/react"

import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker"
import type { Args, Story } from "@/site/playground/types"

type Variant = "default" | "separator" | "border"

function shape(args: Args) {
  return {
    variant: String(args.variant) as Variant,
    text: String(args.children),
    icon: Boolean(args.icon),
    link: Boolean(args.asChild),
  }
}

function MarkerStory({ args }: { args: Args }) {
  const s = shape(args)
  const inner = (
    <>
      {s.icon ? (
        <MarkerIcon>
          <MagnifyingGlassIcon />
        </MarkerIcon>
      ) : null}
      <MarkerContent>{s.text}</MarkerContent>
    </>
  )
  // A fixed width: the separator rules grow into the room the marker has.
  return (
    <div className="w-80 max-w-full">
      {s.link ? (
        <Marker variant={s.variant} asChild>
          <Link href="#sources">{inner}</Link>
        </Marker>
      ) : (
        <Marker variant={s.variant}>{inner}</Marker>
      )}
    </div>
  )
}

function code(args: Args): string {
  const s = shape(args)
  const props = [
    ...(s.variant === "default" ? [] : [`variant="${s.variant}"`]),
    ...(s.link ? ["asChild"] : []),
  ]
  const pad = s.link ? "  " : ""
  const parts = ["Marker", "MarkerContent", ...(s.icon ? ["MarkerIcon"] : [])]
  return [
    ...(s.icon
      ? ['import { MagnifyingGlassIcon } from "@phosphor-icons/react"', ""]
      : []),
    `import { ${parts.join(", ")} } from "@/components/ui/marker"`,
    "",
    "export function Example() {",
    "  return (",
    '    <div className="w-80 max-w-full">',
    `      <Marker${props.map((prop) => ` ${prop}`).join("")}>`,
    ...(s.link ? ['        <a href="#sources">'] : []),
    ...(s.icon
      ? [
          `${pad}        <MarkerIcon>`,
          `${pad}          <MagnifyingGlassIcon />`,
          `${pad}        </MarkerIcon>`,
        ]
      : []),
    `${pad}        <MarkerContent>${s.text}</MarkerContent>`,
    ...(s.link ? ["        </a>"] : []),
    "      </Marker>",
    "    </div>",
    "  )",
    "}",
    "",
  ].join("\n")
}

/**
 * Marker: one event line of a conversation. `variant` draws it plain,
 * between two rules or above a border; `asChild` makes it a link, the only
 * way it reacts to hover. The text stays in a MarkerContent, the icon in a
 * MarkerIcon.
 */
const story: Story = {
  controls: [
    {
      kind: "select",
      name: "variant",
      options: ["default", "separator", "border"],
      default: "default",
    },
    { kind: "text", name: "children", default: "Searched 4 sources" },
    { kind: "boolean", name: "icon", default: true },
    { kind: "boolean", name: "asChild", default: false },
  ],
  render: (args) => <MarkerStory args={args} />,
  code,
}

export default story
