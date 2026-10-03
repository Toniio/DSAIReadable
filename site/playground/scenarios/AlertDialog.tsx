"use client"

import { useState } from "react"
import { TrashIcon } from "@phosphor-icons/react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import type { Args, Story } from "@/site/playground/types"

const DESCRIPTION =
  "The project and its files are removed for everyone on your team. This cannot be undone."

/** Text as a JSX child: braces and angle brackets go in an expression. */
function text(value: string): string {
  return /[{}<>]/.test(value) ? `{${JSON.stringify(value)}}` : value
}

function resolve(args: Args) {
  return {
    open: Boolean(args.open),
    size: args.size === "sm" ? ("sm" as const) : ("default" as const),
    variant:
      args.variant === "destructive"
        ? ("destructive" as const)
        : ("default" as const),
    showMedia: Boolean(args.showMedia),
    title: String(args.title),
  }
}

/**
 * The dialog, open on first render when `open` is set. Opened that way it
 * leaves the focus where the reader is, in the page's controls: moving it
 * into the canvas would trap the keyboard in a dialog nobody opened. Opened
 * from its trigger, it focuses Cancel, as the spec says.
 */
function StagedAlertDialog({
  open,
  size,
  variant,
  showMedia,
  title,
}: ReturnType<typeof resolve>) {
  const [staged, setStaged] = useState(open)
  return (
    <AlertDialog
      defaultOpen={open}
      onOpenChange={(next) => {
        if (!next) setStaged(false)
      }}
    >
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Delete project</Button>
      </AlertDialogTrigger>
      <AlertDialogContent
        size={size}
        onOpenAutoFocus={
          staged ? (event: Event) => event.preventDefault() : undefined
        }
      >
        <AlertDialogHeader>
          {showMedia ? (
            <AlertDialogMedia>
              <TrashIcon />
            </AlertDialogMedia>
          ) : null}
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{DESCRIPTION}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep project</AlertDialogCancel>
          <AlertDialogAction variant={variant}>
            Delete project
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

/**
 * AlertDialog: a deletion to confirm. `open` shows it open on the canvas;
 * the reader can still close it and reopen it from its trigger.
 */
const story: Story = {
  controls: [
    { kind: "boolean", name: "open", default: true },
    {
      kind: "select",
      name: "size",
      options: ["default", "sm"],
      default: "default",
    },
    {
      kind: "select",
      name: "variant",
      options: ["default", "destructive"],
      default: "default",
    },
    { kind: "boolean", name: "showMedia", default: false },
    { kind: "text", name: "title", default: "Delete this project?" },
  ],
  layout: "fullscreen",
  grid: false,
  render: (args) => (
    <div className="flex min-h-svh items-center justify-center p-8">
      {/* Radix reads defaultOpen once: a new `open` remounts the dialog. */}
      <StagedAlertDialog key={String(Boolean(args.open))} {...resolve(args)} />
    </div>
  ),
  code: (args) => {
    const { size, variant, showMedia, title } = resolve(args)
    const parts = [
      "AlertDialog",
      "AlertDialogAction",
      "AlertDialogCancel",
      "AlertDialogContent",
      "AlertDialogDescription",
      "AlertDialogFooter",
      "AlertDialogHeader",
      ...(showMedia ? ["AlertDialogMedia"] : []),
      "AlertDialogTitle",
      "AlertDialogTrigger",
    ]
    const lines = [
      `    <AlertDialog>`,
      `      <AlertDialogTrigger asChild>`,
      `        <Button variant="destructive">Delete project</Button>`,
      `      </AlertDialogTrigger>`,
      size === "default"
        ? `      <AlertDialogContent>`
        : `      <AlertDialogContent size="${size}">`,
      `        <AlertDialogHeader>`,
      ...(showMedia
        ? [
            `          <AlertDialogMedia>`,
            `            <TrashIcon />`,
            `          </AlertDialogMedia>`,
          ]
        : []),
      `          <AlertDialogTitle>${text(title)}</AlertDialogTitle>`,
      `          <AlertDialogDescription>`,
      `            The project and its files are removed for everyone on your`,
      `            team. This cannot be undone.`,
      `          </AlertDialogDescription>`,
      `        </AlertDialogHeader>`,
      `        <AlertDialogFooter>`,
      `          <AlertDialogCancel>Keep project</AlertDialogCancel>`,
      variant === "default"
        ? `          <AlertDialogAction>Delete project</AlertDialogAction>`
        : `          <AlertDialogAction variant="${variant}">\n            Delete project\n          </AlertDialogAction>`,
      `        </AlertDialogFooter>`,
      `      </AlertDialogContent>`,
      `    </AlertDialog>`,
    ]
    const icon = showMedia
      ? `import { TrashIcon } from "@phosphor-icons/react"\n\n`
      : ""
    return `${icon}import {
${parts.map((part) => `  ${part},`).join("\n")}
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

export function Example() {
  return (
${lines.join("\n")}
  )
}
`
  },
}

export default story
