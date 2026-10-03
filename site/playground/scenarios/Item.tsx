import type { ReactNode } from "react"
import Link from "next/link"
import { DotsThreeIcon, FileIcon } from "@phosphor-icons/react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import type { Args, Story } from "@/site/playground/types"

type Variant = "default" | "outline" | "muted"
type Size = "default" | "sm" | "xs"
type Media = "default" | "icon" | "image"

/** The files the list shows; the first one takes the `title` control. */
const FILES = [
  {
    title: "Annual report 2024",
    detail: "Last edited 2 days ago",
    type: "PDF",
    initials: "AR",
    anchor: "annual-report",
  },
  {
    title: "Q3 budget review",
    detail: "Shared by Maya Johnson",
    type: "XLSX",
    initials: "BR",
    anchor: "budget-review",
  },
  {
    title: "Brand guidelines",
    detail: "Updated last week",
    type: "PDF",
    initials: "BG",
    anchor: "brand-guidelines",
  },
  {
    title: "Onboarding checklist",
    detail: "12 tasks, 4 done",
    type: "DOC",
    initials: "OC",
    anchor: "onboarding-checklist",
  },
]

function shape(args: Args) {
  const count = Math.min(Math.max(Math.round(Number(args.items)), 1), 4)
  return {
    variant: String(args.variant) as Variant,
    size: String(args.size) as Size,
    media: String(args.mediaVariant) as Media,
    description: Boolean(args.description),
    // A link row holds no other control: its actions are left out.
    actions: Boolean(args.actions) && !args.asChild,
    link: Boolean(args.asChild),
    files: FILES.slice(0, count).map((file, index) =>
      index === 0 ? { ...file, title: String(args.title) } : file
    ),
  }
}

function ItemStory({ args }: { args: Args }) {
  const s = shape(args)
  return (
    <ItemGroup className="w-80">
      {s.files.map((file) => {
        const body: ReactNode = (
          <>
            <ItemMedia variant={s.media}>
              {s.media === "image" ? (
                <Avatar className="size-full">
                  <AvatarFallback>{file.initials}</AvatarFallback>
                </Avatar>
              ) : (
                <FileIcon />
              )}
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{file.title}</ItemTitle>
              {s.description ? (
                <ItemDescription>{file.detail}</ItemDescription>
              ) : null}
            </ItemContent>
            {s.actions ? (
              <ItemActions>
                <Badge variant="secondary">{file.type}</Badge>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`More actions for ${file.title}`}
                >
                  <DotsThreeIcon />
                </Button>
              </ItemActions>
            ) : null}
          </>
        )
        return s.link ? (
          <Item key={file.anchor} variant={s.variant} size={s.size} asChild>
            <Link href={`#${file.anchor}`}>{body}</Link>
          </Item>
        ) : (
          <Item key={file.anchor} variant={s.variant} size={s.size}>
            {body}
          </Item>
        )
      })}
    </ItemGroup>
  )
}

function code(args: Args): string {
  const s = shape(args)
  const itemProps = [
    ...(s.variant === "default" ? [] : [`variant="${s.variant}"`]),
    ...(s.size === "default" ? [] : [`size="${s.size}"`]),
    ...(s.link ? ["asChild"] : []),
  ]
  const pad = s.link ? "  " : ""
  const row = (file: (typeof s.files)[number]) => [
    `      <Item${itemProps.map((prop) => ` ${prop}`).join("")}>`,
    ...(s.link ? [`        <a href="#${file.anchor}">`] : []),
    `${pad}        <ItemMedia${s.media === "default" ? "" : ` variant="${s.media}"`}>`,
    ...(s.media === "image"
      ? [
          `${pad}          <Avatar className="size-full">`,
          `${pad}            <AvatarFallback>${file.initials}</AvatarFallback>`,
          `${pad}          </Avatar>`,
        ]
      : [`${pad}          <FileIcon />`]),
    `${pad}        </ItemMedia>`,
    `${pad}        <ItemContent>`,
    `${pad}          <ItemTitle>${file.title}</ItemTitle>`,
    ...(s.description
      ? [`${pad}          <ItemDescription>${file.detail}</ItemDescription>`]
      : []),
    `${pad}        </ItemContent>`,
    ...(s.actions
      ? [
          "        <ItemActions>",
          `          <Badge variant="secondary">${file.type}</Badge>`,
          "          <Button",
          '            variant="ghost"',
          '            size="icon-sm"',
          `            aria-label="More actions for ${file.title}"`,
          "          >",
          "            <DotsThreeIcon />",
          "          </Button>",
          "        </ItemActions>",
        ]
      : []),
    ...(s.link ? ["        </a>"] : []),
    "      </Item>",
  ]
  const icons = [
    ...(s.actions ? ["DotsThreeIcon"] : []),
    ...(s.media === "image" ? [] : ["FileIcon"]),
  ]
  const parts = [
    "Item",
    ...(s.actions ? ["ItemActions"] : []),
    "ItemContent",
    ...(s.description ? ["ItemDescription"] : []),
    "ItemGroup",
    "ItemMedia",
    "ItemTitle",
  ]
  return [
    ...(icons.length
      ? [`import { ${icons.join(", ")} } from "@phosphor-icons/react"`, ""]
      : []),
    ...(s.media === "image"
      ? ['import { Avatar, AvatarFallback } from "@/components/ui/avatar"']
      : []),
    ...(s.actions
      ? [
          'import { Badge } from "@/components/ui/badge"',
          'import { Button } from "@/components/ui/button"',
        ]
      : []),
    "import {",
    ...parts.map((part) => `  ${part},`),
    '} from "@/components/ui/item"',
    "",
    "export function Example() {",
    "  return (",
    '    <ItemGroup className="w-80">',
    ...s.files.flatMap(row),
    "    </ItemGroup>",
    "  )",
    "}",
    "",
  ].join("\n")
}

/**
 * Item: a list of files in an ItemGroup. `variant` and `size` frame each row,
 * `mediaVariant` is the ItemMedia axis (icon, or an avatar as the image);
 * `asChild` makes each row a link, which draws the hover and focus states
 * and leaves the actions out, since a link row holds no other control.
 */
const story: Story = {
  controls: [
    {
      kind: "select",
      name: "variant",
      options: ["default", "outline", "muted"],
      default: "default",
    },
    {
      kind: "select",
      name: "size",
      options: ["default", "sm", "xs"],
      default: "default",
    },
    {
      kind: "select",
      name: "mediaVariant",
      options: ["default", "icon", "image"],
      default: "default",
    },
    { kind: "text", name: "title", default: "Annual report 2024" },
    { kind: "number", name: "items", default: 1, min: 1, max: 4 },
    { kind: "boolean", name: "description", default: true },
    { kind: "boolean", name: "actions", default: true },
    { kind: "boolean", name: "asChild", default: false },
  ],
  render: (args) => <ItemStory args={args} />,
  code,
}

export default story
