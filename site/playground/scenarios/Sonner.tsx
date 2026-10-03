import { useEffect } from "react"
import { toast, type ExternalToast } from "sonner"

import { Button } from "@/components/ui/button"
import { Toaster, type ToasterProps } from "@/components/ui/sonner"
import type { Args, Story } from "@/site/playground/types"

const TYPES = ["default", "success", "info", "warning", "error", "loading"]
const POSITIONS = [
  "top-left",
  "top-center",
  "top-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
]

type ToastType = "success" | "info" | "warning" | "error" | "loading"

interface Content {
  type: string
  message: string
  description: string
  action: boolean
}

function content(args: Args): Content {
  return {
    type: TYPES.includes(String(args.type)) ? String(args.type) : "default",
    message: String(args.message).trim() || "Event created",
    description: String(args.description).trim(),
    action: Boolean(args.action),
  }
}

/** Calls `toast()`, or `toast.success()` and its siblings, as the code does. */
function show(
  { type, message, description, action }: Content,
  extra: ExternalToast = {}
) {
  const options: ExternalToast = {
    description: description || undefined,
    action: action
      ? { label: "Undo", onClick: () => toast("Event removed") }
      : undefined,
    ...extra,
  }
  return type === "default"
    ? toast(message, options)
    : toast[type as ToastType](message, options)
}

function ToastDemo({ args }: { args: Args }) {
  const { type, message, description, action } = content(args)

  // The canvas shows the toast up front, held open, and shows it again when
  // a control changes it; the button shows it the way the code does.
  useEffect(() => {
    const id = show(
      { type, message, description, action },
      { duration: Number.POSITIVE_INFINITY }
    )
    return () => {
      toast.dismiss(id)
    }
  }, [type, message, description, action])

  return (
    <div className="flex min-h-svh items-center justify-center p-8">
      <Button
        variant="outline"
        onClick={() => show({ type, message, description, action })}
      >
        Show toast
      </Button>
      <Toaster
        position={
          (POSITIONS.includes(String(args.position))
            ? args.position
            : "bottom-right") as ToasterProps["position"]
        }
        closeButton={Boolean(args.closeButton)}
        expand={Boolean(args.expand)}
      />
    </div>
  )
}

/**
 * Sonner: a toast of each type, shown from a button. The canvas also shows
 * it on its own, held open, so each control change is visible at once.
 */
const story: Story = {
  controls: [
    { kind: "select", name: "type", options: TYPES, default: "default" },
    { kind: "text", name: "message", default: "Event created" },
    {
      kind: "text",
      name: "description",
      default: "Monday, January 6 at 9:00 AM",
    },
    { kind: "boolean", name: "action", default: false },
    {
      kind: "select",
      name: "position",
      options: POSITIONS,
      default: "bottom-right",
    },
    { kind: "boolean", name: "closeButton", default: false },
    { kind: "boolean", name: "expand", default: false },
  ],
  layout: "fullscreen",
  grid: false,
  render: (args) => <ToastDemo args={args} />,
  code: (args) => {
    const { type, message, description, action } = content(args)
    const call = type === "default" ? "toast" : `toast.${type}`
    const options = [
      description ? `description: ${JSON.stringify(description)},` : "",
      action
        ? `action: { label: "Undo", onClick: () => toast("Event removed") },`
        : "",
    ].filter(Boolean)
    const body = options.length
      ? `${call}(${JSON.stringify(message)}, {
${options.map((line) => `            ${line}`).join("\n")}
          })`
      : `${call}(${JSON.stringify(message)})`
    const toaster = [
      args.position === "bottom-right" ? "" : `position="${args.position}"`,
      args.closeButton ? "closeButton" : "",
      args.expand ? "expand" : "",
    ].filter(Boolean)
    return `import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/sonner"

export function Example() {
  return (
    <>
      <Button
        variant="outline"
        onClick={() =>
          ${body}
        }
      >
        Show toast
      </Button>
      {/* Mount the Toaster once, in the root layout, next to {children} */}
      <Toaster${toaster.length ? ` ${toaster.join(" ")}` : ""} />
    </>
  )
}
`
  },
}

export default story
