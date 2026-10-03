import type { IconWeight } from "@phosphor-icons/react"

/** The weights the icon library draws, the default first. */
export const WEIGHTS: IconWeight[] = [
  "regular",
  "bold",
  "fill",
  "duotone",
  "thin",
  "light",
]

/** The sizes the toggle offers: the step of the spacing scale and its value. */
export interface IconSize {
  step: "4" | "5" | "6"
  /** The value of the step, for the toggle's label: `16px`. */
  label: string
}
