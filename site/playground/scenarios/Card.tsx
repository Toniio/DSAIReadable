import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { Args, Story } from "@/site/playground/types"

const DESCRIPTION = "Choose who can edit this project."
const CONTENT = "Three people can edit this project. Invite more from Members."

function resolve(args: Args) {
  return {
    size: args.size === "sm" ? ("sm" as const) : ("default" as const),
    title: String(args.title).trim() || "Team settings",
    showDescription: Boolean(args.showDescription),
    showAction: Boolean(args.showAction),
    showFooter: Boolean(args.showFooter),
  }
}

/** Text as a JSX child: braces and angle brackets go in an expression. */
function text(value: string): string {
  return /[{}<>]/.test(value) ? `{${JSON.stringify(value)}}` : value
}

/** Card: a settings card whose size and parts are controls. */
const story: Story = {
  controls: [
    {
      kind: "select",
      name: "size",
      options: ["default", "sm"],
      default: "default",
    },
    { kind: "text", name: "title", default: "Team settings" },
    { kind: "boolean", name: "showDescription", default: true },
    { kind: "boolean", name: "showAction", default: false },
    { kind: "boolean", name: "showFooter", default: true },
  ],
  layout: "padded",
  render: (args) => {
    const { size, title, showDescription, showAction, showFooter } =
      resolve(args)
    return (
      <Card size={size} className="max-w-sm">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {showDescription ? (
            <CardDescription>{DESCRIPTION}</CardDescription>
          ) : null}
          {showAction ? (
            <CardAction>
              <Button variant="outline" size="sm">
                Edit
              </Button>
            </CardAction>
          ) : null}
        </CardHeader>
        <CardContent>
          <p>{CONTENT}</p>
        </CardContent>
        {showFooter ? (
          <CardFooter className="justify-end gap-2">
            <Button variant="outline">Cancel</Button>
            <Button>Save changes</Button>
          </CardFooter>
        ) : null}
      </Card>
    )
  },
  code: (args) => {
    const { size, title, showDescription, showAction, showFooter } =
      resolve(args)
    const parts = [
      "Card",
      ...(showAction ? ["CardAction"] : []),
      "CardContent",
      ...(showDescription ? ["CardDescription"] : []),
      ...(showFooter ? ["CardFooter"] : []),
      "CardHeader",
      "CardTitle",
    ]
    const lines = [
      size === "default"
        ? `    <Card className="max-w-sm">`
        : `    <Card size="${size}" className="max-w-sm">`,
      `      <CardHeader>`,
      `        <CardTitle>${text(title)}</CardTitle>`,
      ...(showDescription
        ? [`        <CardDescription>${DESCRIPTION}</CardDescription>`]
        : []),
      ...(showAction
        ? [
            `        <CardAction>`,
            `          <Button variant="outline" size="sm">`,
            `            Edit`,
            `          </Button>`,
            `        </CardAction>`,
          ]
        : []),
      `      </CardHeader>`,
      `      <CardContent>`,
      `        <p>${CONTENT}</p>`,
      `      </CardContent>`,
      ...(showFooter
        ? [
            `      <CardFooter className="justify-end gap-2">`,
            `        <Button variant="outline">Cancel</Button>`,
            `        <Button>Save changes</Button>`,
            `      </CardFooter>`,
          ]
        : []),
      `    </Card>`,
    ]
    const needsButton = showAction || showFooter
    return `${needsButton ? `import { Button } from "@/components/ui/button"\n` : ""}import {
${parts.map((part) => `  ${part},`).join("\n")}
} from "@/components/ui/card"

export function Example() {
  return (
${lines.join("\n")}
  )
}
`
  },
}

export default story
