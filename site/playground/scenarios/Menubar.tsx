import { useState } from "react"

import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar"
import type { Args, Story } from "@/site/playground/types"

type Align = "start" | "center" | "end"

function shape(args: Args) {
  const destructive = String(args.variant) === "destructive"
  return {
    open: Boolean(args.open),
    loop: Boolean(args.loop),
    align: String(args.align) as Align,
    inset: Boolean(args.inset),
    disabled: Boolean(args.disabled),
    destructive,
    // An irreversible action, and only that, takes the destructive variant.
    last: destructive ? "Delete project" : "Close window",
  }
}

function MenubarStory({ args }: { args: Args }) {
  const s = shape(args)
  const [grid, setGrid] = useState(true)
  const [rulers, setRulers] = useState(false)
  const [zoom, setZoom] = useState("fit")
  const align = s.align === "start" ? undefined : s.align
  return (
    // Room below the bar for the open menu and its submenu.
    <div className="flex min-h-96 items-start justify-center p-8">
      <Menubar defaultValue={s.open ? "file" : undefined} loop={s.loop}>
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent align={align}>
            <MenubarItem inset={s.inset}>New window</MenubarItem>
            <MenubarItem inset={s.inset} disabled={s.disabled}>
              Open recent
            </MenubarItem>
            <MenubarSeparator />
            <MenubarSub>
              <MenubarSubTrigger inset={s.inset}>Export</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem>As PDF</MenubarItem>
                <MenubarItem>As image</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
            <MenubarSeparator />
            <MenubarItem
              inset={s.inset}
              variant={s.destructive ? "destructive" : "default"}
            >
              {s.last}
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu value="edit">
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarContent align={align}>
            <MenubarItem inset={s.inset}>Undo</MenubarItem>
            <MenubarItem inset={s.inset}>Redo</MenubarItem>
            <MenubarSeparator />
            <MenubarItem inset={s.inset}>Find</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu value="view">
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarContent align={align}>
            <MenubarCheckboxItem
              checked={grid}
              onCheckedChange={(checked) => setGrid(checked === true)}
            >
              Show grid
            </MenubarCheckboxItem>
            <MenubarCheckboxItem
              checked={rulers}
              onCheckedChange={(checked) => setRulers(checked === true)}
            >
              Show rulers
            </MenubarCheckboxItem>
            <MenubarSeparator />
            <MenubarLabel inset>Zoom</MenubarLabel>
            <MenubarRadioGroup value={zoom} onValueChange={setZoom}>
              <MenubarRadioItem value="fit">Fit to window</MenubarRadioItem>
              <MenubarRadioItem value="actual">Actual size</MenubarRadioItem>
            </MenubarRadioGroup>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </div>
  )
}

/**
 * A MenubarItem of a menu, as Prettier writes it: on one line when it fits
 * in 80 columns and has one prop at most, the text on its own line otherwise.
 */
function leaf(props: string[], text: string): string[] {
  const open = `          <MenubarItem${props.map((prop) => ` ${prop}`).join("")}>`
  const line = `${open}${text}</MenubarItem>`
  if (line.length <= 80 && props.length < 2) return [line]
  return [open, `            ${text}`, "          </MenubarItem>"]
}

function code(args: Args): string {
  const s = shape(args)
  const inset = s.inset ? " inset" : ""
  const content = `<MenubarContent${s.align === "start" ? "" : ` align="${s.align}"`}>`
  const root = [
    ...(s.open ? ['defaultValue="file"'] : []),
    ...(s.loop ? ["loop"] : []),
  ]
  return [
    '"use client"',
    "",
    'import { useState } from "react"',
    "",
    "import {",
    "  Menubar,",
    "  MenubarCheckboxItem,",
    "  MenubarContent,",
    "  MenubarItem,",
    "  MenubarLabel,",
    "  MenubarMenu,",
    "  MenubarRadioGroup,",
    "  MenubarRadioItem,",
    "  MenubarSeparator,",
    "  MenubarSub,",
    "  MenubarSubContent,",
    "  MenubarSubTrigger,",
    "  MenubarTrigger,",
    '} from "@/components/ui/menubar"',
    "",
    "export function Example() {",
    "  const [grid, setGrid] = useState(true)",
    "  const [rulers, setRulers] = useState(false)",
    '  const [zoom, setZoom] = useState("fit")',
    "  return (",
    `    <Menubar${root.map((prop) => ` ${prop}`).join("")}>`,
    '      <MenubarMenu value="file">',
    "        <MenubarTrigger>File</MenubarTrigger>",
    `        ${content}`,
    `          <MenubarItem${inset}>New window</MenubarItem>`,
    ...leaf(
      [...(s.inset ? ["inset"] : []), ...(s.disabled ? ["disabled"] : [])],
      "Open recent"
    ),
    "          <MenubarSeparator />",
    "          <MenubarSub>",
    `            <MenubarSubTrigger${inset}>Export</MenubarSubTrigger>`,
    "            <MenubarSubContent>",
    "              <MenubarItem>As PDF</MenubarItem>",
    "              <MenubarItem>As image</MenubarItem>",
    "            </MenubarSubContent>",
    "          </MenubarSub>",
    "          <MenubarSeparator />",
    ...leaf(
      [
        ...(s.inset ? ["inset"] : []),
        ...(s.destructive ? ['variant="destructive"'] : []),
      ],
      s.last
    ),
    "        </MenubarContent>",
    "      </MenubarMenu>",
    '      <MenubarMenu value="edit">',
    "        <MenubarTrigger>Edit</MenubarTrigger>",
    `        ${content}`,
    `          <MenubarItem${inset}>Undo</MenubarItem>`,
    `          <MenubarItem${inset}>Redo</MenubarItem>`,
    "          <MenubarSeparator />",
    `          <MenubarItem${inset}>Find</MenubarItem>`,
    "        </MenubarContent>",
    "      </MenubarMenu>",
    '      <MenubarMenu value="view">',
    "        <MenubarTrigger>View</MenubarTrigger>",
    `        ${content}`,
    "          <MenubarCheckboxItem",
    "            checked={grid}",
    "            onCheckedChange={(checked) => setGrid(checked === true)}",
    "          >",
    "            Show grid",
    "          </MenubarCheckboxItem>",
    "          <MenubarCheckboxItem",
    "            checked={rulers}",
    "            onCheckedChange={(checked) => setRulers(checked === true)}",
    "          >",
    "            Show rulers",
    "          </MenubarCheckboxItem>",
    "          <MenubarSeparator />",
    "          <MenubarLabel inset>Zoom</MenubarLabel>",
    "          <MenubarRadioGroup value={zoom} onValueChange={setZoom}>",
    '            <MenubarRadioItem value="fit">Fit to window</MenubarRadioItem>',
    '            <MenubarRadioItem value="actual">Actual size</MenubarRadioItem>',
    "          </MenubarRadioGroup>",
    "        </MenubarContent>",
    "      </MenubarMenu>",
    "    </Menubar>",
    "  )",
    "}",
    "",
  ].join("\n")
}

/**
 * Menubar: File, Edit and View menus, with a submenu, checkable items and a
 * radio group. `open` mounts it with File open (`defaultValue`), so it still
 * closes and opens, and every change of a control mounts it again; `variant` makes the last File item the destructive
 * "Delete project"; `inset` lines plain items up with the checkable ones.
 * No item shows a shortcut: the spec wants a real handler behind each one.
 */
const story: Story = {
  controls: [
    { kind: "boolean", name: "open", default: true },
    {
      kind: "select",
      name: "align",
      options: ["start", "center", "end"],
      default: "start",
    },
    {
      kind: "select",
      name: "variant",
      options: ["default", "destructive"],
      default: "default",
    },
    { kind: "boolean", name: "inset", default: false },
    { kind: "boolean", name: "disabled", default: false },
    { kind: "boolean", name: "loop", default: false },
  ],
  // Any change remounts the bar: a Radix menu closes when its window loses
  // focus, which a click on the controls does, and the change shows on File.
  render: (args) => <MenubarStory key={JSON.stringify(args)} args={args} />,
  code,
  layout: "fullscreen",
  grid: false,
}

export default story
