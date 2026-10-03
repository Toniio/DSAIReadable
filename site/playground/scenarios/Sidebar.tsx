import {
  CubeIcon,
  DotsThreeIcon,
  FolderIcon,
  GearIcon,
  HouseIcon,
  PlusIcon,
  TrayIcon,
  UserCircleIcon,
} from "@phosphor-icons/react"

import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import type { Args, Story } from "@/site/playground/types"

const BUTTON_VARIANT = "SidebarMenuButton.variant"
const BUTTON_SIZE = "SidebarMenuButton.size"

/** The props of each part that differ from their default. */
function parts(args: Args) {
  const pick = <T extends string>(value: Args[string], options: T[]) =>
    options.find((option) => option === value)
  return {
    side: pick(args.side, ["right"]),
    variant: pick(args.variant, ["floating", "inset"]),
    collapsible: pick(args.collapsible, ["icon", "none"]),
    button: {
      variant: pick(args[BUTTON_VARIANT], ["outline"]),
      size: pick(args[BUTTON_SIZE], ["sm", "lg"]),
    },
  }
}

function AppSidebar({ args }: { args: Args }) {
  const { side, variant, collapsible, button } = parts(args)
  return (
    <Sidebar side={side} variant={variant} collapsible={collapsible}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip="Acme Inc">
              <span className="flex size-8 shrink-0 items-center justify-center bg-sidebar-primary text-sidebar-primary-foreground">
                <CubeIcon />
              </span>
              <span className="font-medium">Acme Inc</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <nav aria-label="Workspace">
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarGroupAction aria-label="Add a project">
              <PlusIcon />
            </SidebarGroupAction>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive tooltip="Home" {...button}>
                    <HouseIcon />
                    <span>Home</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Inbox" {...button}>
                    <TrayIcon />
                    <span>Inbox</span>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>12</SidebarMenuBadge>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Projects" {...button}>
                    <FolderIcon />
                    <span>Projects</span>
                  </SidebarMenuButton>
                  <SidebarMenuAction
                    showOnHover
                    aria-label="More options for Projects"
                  >
                    <DotsThreeIcon />
                  </SidebarMenuAction>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Settings" {...button}>
                    <GearIcon />
                    <span>Settings</span>
                  </SidebarMenuButton>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton href="#team">
                        Team
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton href="#billing">
                        Billing
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </nav>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Maya Johnson" {...button}>
              <UserCircleIcon />
              <span>Maya Johnson</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

function Page() {
  return (
    <SidebarInset>
      <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger />
        <Separator
          orientation="vertical"
          className="data-vertical:h-4 data-vertical:self-center"
        />
        <span className="text-sm font-medium">Home</span>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="h-24 bg-muted" />
          <div className="h-24 bg-muted" />
          <div className="h-24 bg-muted" />
        </div>
        <div className="min-h-72 flex-1 bg-muted" />
      </div>
    </SidebarInset>
  )
}

function AppShell({ args }: { args: Args }) {
  const sidebar = <AppSidebar args={args} />
  // A right sidebar comes after the page, so its gap takes the right edge.
  const right = args.side === "right"
  return (
    <SidebarProvider
      key={String(args.defaultOpen)}
      defaultOpen={Boolean(args.defaultOpen)}
    >
      {right ? null : sidebar}
      <Page />
      {right ? sidebar : null}
    </SidebarProvider>
  )
}

type Props = Record<string, string | number | boolean | undefined>

/** An opening tag as Prettier writes it: one line, or one prop per line past 80 columns. */
function tag(name: string, props: Props, indent: string, close = ">") {
  const attributes = Object.entries(props).flatMap(([key, value]) => {
    if (value === undefined || value === false) return []
    if (value === true) return [key]
    return typeof value === "string"
      ? [`${key}=${JSON.stringify(value)}`]
      : [`${key}={${JSON.stringify(value)}}`]
  })
  const line = `${indent}<${[name, ...attributes].join(" ")}${close === ">" ? ">" : " />"}`
  if (line.length <= 80) return line
  const lines = attributes.map((attribute) => `${indent}  ${attribute}`)
  return `${indent}<${name}\n${lines.join("\n")}\n${indent}${close}`
}

/**
 * Sidebar: an app shell with a collapsible side navigation, in a frame of
 * its own, so its fixed panel and its mobile sheet stay inside the canvas.
 */
const story: Story = {
  controls: [
    {
      kind: "select",
      name: "side",
      options: ["left", "right"],
      default: "left",
    },
    {
      kind: "select",
      name: "variant",
      options: ["sidebar", "floating", "inset"],
      default: "sidebar",
    },
    {
      kind: "select",
      name: "collapsible",
      options: ["offcanvas", "icon", "none"],
      default: "offcanvas",
    },
    { kind: "boolean", name: "defaultOpen", default: true },
    {
      kind: "select",
      name: BUTTON_VARIANT,
      options: ["default", "outline"],
      default: "default",
    },
    {
      kind: "select",
      name: BUTTON_SIZE,
      options: ["default", "sm", "lg"],
      default: "default",
    },
  ],
  layout: "fullscreen",
  grid: false,
  render: (args) => <AppShell args={args} />,
  code: (args) => {
    const { side, variant, collapsible, button } = parts(args)
    const item = (name: string, icon: string, extra: string[] = []) =>
      [
        `                  <SidebarMenuItem>`,
        tag(
          "SidebarMenuButton",
          { isActive: name === "Home", tooltip: name, ...button },
          "                    "
        ),
        `                      <${icon} />`,
        `                      <span>${name}</span>`,
        `                    </SidebarMenuButton>`,
        ...extra.map((line) => `                    ${line}`),
        `                  </SidebarMenuItem>`,
      ].join("\n")
    const sidebar = `${tag("Sidebar", { side, variant, collapsible }, "      ")}
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" tooltip="Acme Inc">
                <span className="flex size-8 shrink-0 items-center justify-center bg-sidebar-primary text-sidebar-primary-foreground">
                  <CubeIcon />
                </span>
                <span className="font-medium">Acme Inc</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <nav aria-label="Workspace">
            <SidebarGroup>
              <SidebarGroupLabel>Workspace</SidebarGroupLabel>
              <SidebarGroupAction aria-label="Add a project">
                <PlusIcon />
              </SidebarGroupAction>
              <SidebarGroupContent>
                <SidebarMenu>
${[
  item("Home", "HouseIcon"),
  item("Inbox", "TrayIcon", ["<SidebarMenuBadge>12</SidebarMenuBadge>"]),
  item("Projects", "FolderIcon", [
    `<SidebarMenuAction`,
    `  showOnHover`,
    `  aria-label="More options for Projects"`,
    `>`,
    `  <DotsThreeIcon />`,
    `</SidebarMenuAction>`,
  ]),
  item("Settings", "GearIcon", [
    `<SidebarMenuSub>`,
    `  <SidebarMenuSubItem>`,
    `    <SidebarMenuSubButton href="#team">`,
    `      Team`,
    `    </SidebarMenuSubButton>`,
    `  </SidebarMenuSubItem>`,
    `  <SidebarMenuSubItem>`,
    `    <SidebarMenuSubButton href="#billing">`,
    `      Billing`,
    `    </SidebarMenuSubButton>`,
    `  </SidebarMenuSubItem>`,
    `</SidebarMenuSub>`,
  ]),
].join("\n")}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </nav>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
${tag("SidebarMenuButton", { tooltip: "Maya Johnson", ...button }, "              ")}
                <UserCircleIcon />
                <span>Maya Johnson</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>`
    const page = `      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator
            orientation="vertical"
            className="data-vertical:h-4 data-vertical:self-center"
          />
          <span className="text-sm font-medium">Home</span>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="h-24 bg-muted" />
            <div className="h-24 bg-muted" />
            <div className="h-24 bg-muted" />
          </div>
          <div className="min-h-72 flex-1 bg-muted" />
        </div>
      </SidebarInset>`
    const provider = args.defaultOpen
      ? `    <SidebarProvider>`
      : `    <SidebarProvider defaultOpen={false}>`
    return `import {
  CubeIcon,
  DotsThreeIcon,
  FolderIcon,
  GearIcon,
  HouseIcon,
  PlusIcon,
  TrayIcon,
  UserCircleIcon,
} from "@phosphor-icons/react"

import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export function Example() {
  return (
${provider}
${side === "right" ? `${page}\n${sidebar}` : `${sidebar}\n${page}`}
    </SidebarProvider>
  )
}
`
  },
}

export default story
