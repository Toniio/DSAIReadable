import { FOCUS_OUTLINE_RESET, FOCUS_RING } from "@/lib/focus"
import { cn } from "@/lib/utils"

/**
 * The focus of an element with no border: a link, a block of code, the
 * header's home link. FOCUS_RING colors a border and draws a halo at 50%; the
 * halo alone is under 3:1, so a borderless element adds the solid outline
 * focus.md asks for, inside the halo.
 */
export const FOCUS_BORDERLESS = cn(
  FOCUS_OUTLINE_RESET,
  FOCUS_RING,
  "focus-visible:outline-(length:--border-width-default) focus-visible:outline-ring focus-visible:outline-solid"
)

/** A text link: the action color, underlined, with the borderless focus. */
export const LINK = cn(
  "text-primary underline underline-offset-4",
  FOCUS_BORDERLESS
)
