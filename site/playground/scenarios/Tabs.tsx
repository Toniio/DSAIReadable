import {
  ClockCounterClockwiseIcon,
  CodeIcon,
  EyeIcon,
  GearIcon,
} from "@phosphor-icons/react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Args, Story } from "@/site/playground/types"

const TABS = [
  {
    value: "preview",
    label: "Preview",
    icon: EyeIcon,
    iconName: "EyeIcon",
    text: "Your changes appear here as you edit.",
  },
  {
    value: "code",
    label: "Code",
    icon: CodeIcon,
    iconName: "CodeIcon",
    text: "The generated code appears here.",
  },
  {
    value: "settings",
    label: "Settings",
    icon: GearIcon,
    iconName: "GearIcon",
    text: "The project settings appear here.",
  },
  {
    value: "history",
    label: "History",
    icon: ClockCounterClockwiseIcon,
    iconName: "ClockCounterClockwiseIcon",
    text: "Past versions appear here.",
  },
]

function shown(args: Args) {
  const count = Math.min(TABS.length, Math.max(2, Number(args.tabs) || 2))
  return TABS.slice(0, count)
}

function ProjectTabs({ args }: { args: Args }) {
  const tabs = shown(args)
  return (
    <Tabs
      defaultValue="preview"
      orientation={args.orientation === "vertical" ? "vertical" : "horizontal"}
      className="w-full max-w-sm"
    >
      <TabsList
        variant={args.variant === "line" ? "line" : "default"}
        aria-label="Project views"
      >
        {tabs.map((tab, index) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            disabled={Boolean(args.disabled) && index === tabs.length - 1}
          >
            {args.icons ? <tab.icon data-icon="inline-start" /> : null}
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          {tab.text}
        </TabsContent>
      ))}
    </Tabs>
  )
}

/** Tabs: the views of a project, one panel at a time. */
const story: Story = {
  controls: [
    {
      kind: "select",
      name: "variant",
      options: ["default", "line"],
      default: "default",
    },
    {
      kind: "select",
      name: "orientation",
      options: ["horizontal", "vertical"],
      default: "horizontal",
    },
    { kind: "number", name: "tabs", default: 3, min: 2, max: TABS.length },
    { kind: "boolean", name: "icons", default: false },
    { kind: "boolean", name: "disabled", default: false },
  ],
  render: (args) => <ProjectTabs args={args} />,
  code: (args) => {
    const tabs = shown(args)
    const icons = Boolean(args.icons)
    const root =
      args.orientation === "vertical"
        ? `    <Tabs
      defaultValue="preview"
      orientation="vertical"
      className="w-full max-w-sm"
    >`
        : `    <Tabs defaultValue="preview" className="w-full max-w-sm">`
    const list =
      args.variant === "line"
        ? `      <TabsList variant="line" aria-label="Project views">`
        : `      <TabsList aria-label="Project views">`
    const triggers = tabs.map((tab, index) => {
      const disabled = Boolean(args.disabled) && index === tabs.length - 1
      const open = `        <TabsTrigger value="${tab.value}"${disabled ? " disabled" : ""}>`
      if (!icons) return `${open}${tab.label}</TabsTrigger>`
      return `${open}
          <${tab.iconName} data-icon="inline-start" />
          ${tab.label}
        </TabsTrigger>`
    })
    const panels = tabs.map((tab) => {
      const line = `      <TabsContent value="${tab.value}">${tab.text}</TabsContent>`
      return line.length <= 80
        ? line
        : `      <TabsContent value="${tab.value}">\n        ${tab.text}\n      </TabsContent>`
    })
    const iconImport = icons
      ? `import {
${tabs
  .map((tab) => `  ${tab.iconName},`)
  .sort()
  .join("\n")}
} from "@phosphor-icons/react"

`
      : ""
    return `${iconImport}import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function Example() {
  return (
${root}
${list}
${triggers.join("\n")}
      </TabsList>
${panels.join("\n")}
    </Tabs>
  )
}
`
  },
}

export default story
