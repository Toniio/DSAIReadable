import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import type { Args, Story } from "@/site/playground/types"

type Side = "top" | "right" | "bottom" | "left"

function side(args: Args): Side {
  return args.side === "top" || args.side === "bottom" || args.side === "left"
    ? args.side
    : "right"
}

/** SheetTitle names the dialog: an empty one falls back to the default. */
function title(args: Args): string {
  return String(args.title).trim() || "Account details"
}

function AccountSheet({ args }: { args: Args }) {
  return (
    <div className="flex min-h-svh items-center justify-center p-8">
      <Sheet key={String(args.open)} defaultOpen={Boolean(args.open)}>
        <SheetTrigger asChild>
          <Button variant="outline">Edit account</Button>
        </SheetTrigger>
        <SheetContent
          side={side(args)}
          showCloseButton={Boolean(args.showCloseButton)}
        >
          <SheetHeader>
            <SheetTitle>{title(args)}</SheetTitle>
            <SheetDescription>
              Update your name and email, then save.
            </SheetDescription>
          </SheetHeader>
          <FieldGroup className="px-4">
            <Field>
              <FieldLabel htmlFor="sheet-name">Name</FieldLabel>
              <Input id="sheet-name" defaultValue="Maya Johnson" />
            </Field>
            <Field>
              <FieldLabel htmlFor="sheet-email">Email</FieldLabel>
              <Input
                id="sheet-email"
                type="email"
                defaultValue="maya@example.com"
              />
            </Field>
          </FieldGroup>
          <SheetFooter>
            <Button type="submit">Save changes</Button>
            <SheetClose asChild>
              <Button variant="outline">Cancel</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}

/**
 * Sheet: an account form in a side panel. `open` shows the panel on the
 * canvas; the code leaves it out, since the trigger opens it.
 */
const story: Story = {
  controls: [
    { kind: "boolean", name: "open", default: true },
    {
      kind: "select",
      name: "side",
      options: ["top", "right", "bottom", "left"],
      default: "right",
    },
    { kind: "boolean", name: "showCloseButton", default: true },
    { kind: "text", name: "title", default: "Account details" },
  ],
  layout: "fullscreen",
  grid: false,
  render: (args) => <AccountSheet args={args} />,
  code: (args) => {
    const props = [
      side(args) === "right" ? "" : `side="${side(args)}"`,
      args.showCloseButton ? "" : "showCloseButton={false}",
    ].filter(Boolean)
    const content = props.length
      ? `      <SheetContent ${props.join(" ")}>`
      : `      <SheetContent>`
    return `import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export function Example() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Edit account</Button>
      </SheetTrigger>
${content}
        <SheetHeader>
          <SheetTitle>${title(args)}</SheetTitle>
          <SheetDescription>
            Update your name and email, then save.
          </SheetDescription>
        </SheetHeader>
        <FieldGroup className="px-4">
          <Field>
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <Input id="name" defaultValue="Maya Johnson" />
          </Field>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input id="email" type="email" defaultValue="maya@example.com" />
          </Field>
        </FieldGroup>
        <SheetFooter>
          <Button type="submit">Save changes</Button>
          <SheetClose asChild>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
`
  },
}

export default story
