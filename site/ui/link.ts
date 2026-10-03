import { FOCUS_OUTLINE_RESET, FOCUS_RING } from "@/lib/focus"
import { cn } from "@/lib/utils"

/**
 * A text link: the action color, underlined. A link has no border, so its
 * focus draws the solid outline focus.md asks of a borderless element, inside
 * the halo of the ring.
 */
export const LINK = cn(
  "text-primary underline underline-offset-4",
  FOCUS_OUTLINE_RESET,
  FOCUS_RING,
  "focus-visible:outline-(length:--border-width-default) focus-visible:outline-ring focus-visible:outline-solid"
)
