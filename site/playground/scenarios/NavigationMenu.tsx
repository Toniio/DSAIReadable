import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import type { Args, Story } from "@/site/playground/types"

/** The two panels: each link with the line that says where it goes. */
const MENUS = [
  {
    value: "products",
    label: "Products",
    links: [
      {
        anchor: "analytics",
        title: "Analytics",
        text: "See how people use your product.",
      },
      {
        anchor: "automations",
        title: "Automations",
        text: "Run routine tasks on a schedule.",
      },
      {
        anchor: "reports",
        title: "Reports",
        text: "Share the numbers with your team.",
      },
    ],
  },
  {
    value: "resources",
    label: "Resources",
    links: [
      {
        anchor: "guides",
        title: "Guides",
        text: "Step-by-step help for each feature.",
      },
      {
        anchor: "changelog",
        title: "Changelog",
        text: "What changed in each release.",
      },
      {
        anchor: "community",
        title: "Community",
        text: "Questions and answers from other users.",
      },
    ],
  },
]

function shape(args: Args) {
  return {
    open: Boolean(args.open),
    viewport: Boolean(args.viewport),
    indicator: Boolean(args.indicator),
    active: Boolean(args.active),
  }
}

function NavigationMenuStory({ args }: { args: Args }) {
  const s = shape(args)
  return (
    // Room below the bar: the open panel is positioned, not portaled.
    <div className="flex min-h-96 items-start justify-center p-8">
      <NavigationMenu
        aria-label="Product site"
        viewport={s.viewport}
        defaultValue={s.open ? "products" : undefined}
      >
        <NavigationMenuList>
          {MENUS.map((menu) => (
            <NavigationMenuItem key={menu.value} value={menu.value}>
              <NavigationMenuTrigger>{menu.label}</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-72 gap-1">
                  {menu.links.map((link) => (
                    <li key={link.anchor}>
                      <NavigationMenuLink
                        href={`#${link.anchor}`}
                        className="flex-col items-start gap-1"
                      >
                        <span className="font-medium">{link.title}</span>
                        <span className="text-muted-foreground">
                          {link.text}
                        </span>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          ))}
          <NavigationMenuItem>
            <NavigationMenuLink
              href="#pricing"
              active={s.active}
              className={navigationMenuTriggerStyle()}
            >
              Pricing
            </NavigationMenuLink>
          </NavigationMenuItem>
          {s.indicator ? <NavigationMenuIndicator /> : null}
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  )
}

function code(args: Args): string {
  const s = shape(args)
  const root = [
    'aria-label="Product site"',
    ...(s.viewport ? [] : ["viewport={false}"]),
    ...(s.open ? ['defaultValue="products"'] : []),
  ]
  const menus = MENUS.flatMap((menu) => [
    `        <NavigationMenuItem value="${menu.value}">`,
    `          <NavigationMenuTrigger>${menu.label}</NavigationMenuTrigger>`,
    "          <NavigationMenuContent>",
    '            <ul className="grid w-72 gap-1">',
    ...menu.links.flatMap((link) => [
      "              <li>",
      "                <NavigationMenuLink",
      `                  href="#${link.anchor}"`,
      '                  className="flex-col items-start gap-1"',
      "                >",
      `                  <span className="font-medium">${link.title}</span>`,
      '                  <span className="text-muted-foreground">',
      `                    ${link.text}`,
      "                  </span>",
      "                </NavigationMenuLink>",
      "              </li>",
    ]),
    "            </ul>",
    "          </NavigationMenuContent>",
    "        </NavigationMenuItem>",
  ])
  return [
    "import {",
    "  NavigationMenu,",
    "  NavigationMenuContent,",
    ...(s.indicator ? ["  NavigationMenuIndicator,"] : []),
    "  NavigationMenuItem,",
    "  NavigationMenuLink,",
    "  NavigationMenuList,",
    "  NavigationMenuTrigger,",
    "  navigationMenuTriggerStyle,",
    '} from "@/components/ui/navigation-menu"',
    "",
    "export function Example() {",
    "  return (",
    ...(`    <NavigationMenu ${root.join(" ")}>`.length <= 80
      ? [`    <NavigationMenu ${root.join(" ")}>`]
      : [
          "    <NavigationMenu",
          ...root.map((prop) => `      ${prop}`),
          "    >",
        ]),
    "      <NavigationMenuList>",
    ...menus,
    "        <NavigationMenuItem>",
    "          <NavigationMenuLink",
    '            href="#pricing"',
    ...(s.active ? ["            active"] : []),
    "            className={navigationMenuTriggerStyle()}",
    "          >",
    "            Pricing",
    "          </NavigationMenuLink>",
    "        </NavigationMenuItem>",
    ...(s.indicator ? ["        <NavigationMenuIndicator />"] : []),
    "      </NavigationMenuList>",
    "    </NavigationMenu>",
    "  )",
    "}",
    "",
  ].join("\n")
}

/**
 * NavigationMenu: a site header with two panels of links and a direct link.
 * `open` mounts it with Products open (`defaultValue`), so it still closes
 * and opens; `viewport` draws the panels in the shared viewport or inline
 * under their trigger; `active` marks Pricing as the current page
 * (`aria-current`); `indicator` adds the arrow under the open trigger. The
 * landmark has a name of its own, apart from the page's main navigation.
 * The canvas starts closed: while a panel is open, Radix renders a focusable
 * proxy inside aria-hidden (axe aria-hidden-focus), a finding of the
 * component, not of the story.
 */
const story: Story = {
  controls: [
    { kind: "boolean", name: "open", default: false },
    { kind: "boolean", name: "viewport", default: true },
    { kind: "boolean", name: "active", default: false },
    { kind: "boolean", name: "indicator", default: false },
  ],
  render: (args) => <NavigationMenuStory key={String(args.open)} args={args} />,
  code,
  layout: "fullscreen",
  grid: false,
}

export default story
