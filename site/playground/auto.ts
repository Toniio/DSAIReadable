import type { ComponentType } from "react"

import type { Args, Control } from "@/site/playground/types"

type Module = Record<string, unknown>

/**
 * A component the generic playground renders alone: `<Button {...args}>Button</Button>`.
 * Its controls are derived from the data (site/lib/playground.ts): the cva
 * axes, then the spec's Props / API table for the props listed here.
 */
export interface AutoStory {
  /** The export rendered. */
  export: string
  load: () => Promise<Module>
  /** The text child, editable; none for a component without children (Input). */
  children?: string
  /** Props whose control is derived from the data. */
  props?: string[]
  /** Controls the data cannot give: a native prop (`disabled`), an ARIA state. */
  controls?: Control[]
  /** Props always passed, not editable: an accessible name, a size for a shape. */
  fixed?: Args
}

const disabled: Control = { kind: "boolean", name: "disabled", default: false }
const invalid: Control = {
  kind: "boolean",
  name: "aria-invalid",
  default: false,
}

/** The components whose playground is generic, by spec name. */
export const AUTO: Record<string, AutoStory> = {
  Badge: {
    export: "Badge",
    load: () => import("@/components/ui/badge"),
    children: "Badge",
    props: ["variant"],
  },
  Button: {
    export: "Button",
    load: () => import("@/components/ui/button"),
    children: "Button",
    props: ["variant", "size"],
    controls: [disabled, invalid],
  },
  Checkbox: {
    export: "Checkbox",
    load: () => import("@/components/ui/checkbox"),
    props: ["disabled", "required"],
    controls: [
      { kind: "boolean", name: "defaultChecked", default: false },
      invalid,
    ],
    fixed: { "aria-label": "Accept the terms" },
  },
  Heading: {
    export: "Heading",
    load: () => import("@/components/ui/heading"),
    children: "Team settings",
    props: ["level"],
  },
  Illustration: {
    export: "Illustration",
    load: () => import("@/components/ui/illustration"),
    props: ["alt"],
  },
  Input: {
    export: "Input",
    load: () => import("@/components/ui/input"),
    controls: [
      {
        kind: "select",
        name: "type",
        options: ["text", "email", "number", "search", "tel", "url", "file"],
        default: "text",
      },
      { kind: "text", name: "placeholder", default: "name@example.com" },
      disabled,
      invalid,
    ],
    fixed: { "aria-label": "Email address" },
  },
  Kbd: {
    export: "Kbd",
    load: () => import("@/components/ui/kbd"),
    children: "Ctrl",
  },
  Label: {
    export: "Label",
    load: () => import("@/components/ui/label"),
    children: "Email address",
  },
  Logo: {
    export: "Logo",
    load: () => import("@/components/ui/logo"),
    props: ["size"],
  },
  PasswordInput: {
    export: "PasswordInput",
    load: () => import("@/components/ui/password-input"),
    props: ["placeholder"],
    controls: [disabled, invalid],
    fixed: { "aria-label": "Password" },
  },
  Progress: {
    export: "Progress",
    load: () => import("@/components/ui/progress"),
    controls: [
      { kind: "number", name: "value", default: 60, min: 0, max: 100, step: 5 },
    ],
    fixed: { "aria-label": "Upload progress", className: "w-64" },
  },
  Separator: {
    export: "Separator",
    load: () => import("@/components/ui/separator"),
    props: ["orientation", "decorative"],
    fixed: {
      className:
        "data-[orientation=horizontal]:w-64 data-[orientation=vertical]:h-16",
    },
  },
  Skeleton: {
    export: "Skeleton",
    load: () => import("@/components/ui/skeleton"),
    fixed: { className: "h-4 w-64" },
  },
  Spinner: {
    export: "Spinner",
    load: () => import("@/components/ui/spinner"),
    props: ["aria-label"],
  },
  Switch: {
    export: "Switch",
    load: () => import("@/components/ui/switch"),
    props: ["size", "disabled"],
    controls: [{ kind: "boolean", name: "defaultChecked", default: false }],
    fixed: { "aria-label": "Email notifications" },
  },
  Textarea: {
    export: "Textarea",
    load: () => import("@/components/ui/textarea"),
    props: ["placeholder", "disabled"],
    controls: [invalid],
    fixed: { "aria-label": "Message", className: "w-80" },
  },
  Toggle: {
    export: "Toggle",
    load: () => import("@/components/ui/toggle"),
    children: "Bold",
    props: ["variant", "size", "disabled"],
    controls: [{ kind: "boolean", name: "defaultPressed", default: false }],
  },
}

/** The component an auto story renders, once its module is loaded. */
export function autoComponent(
  module: Module,
  story: AutoStory
): ComponentType<Record<string, unknown>> {
  return module[story.export] as ComponentType<Record<string, unknown>>
}
