import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

/**
 * The `cn` of the design system's components and of any class string that holds
 * a role. It has its own file, next to the stock `lib/utils.ts` of shadcn/ui,
 * so that installing a component never asks to overwrite a file the project
 * already has.
 *
 * The radius and text roles are classes tailwind-merge does not know: it reads
 * `text-ui` as a color and drops it next to `text-muted-foreground`.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      radius: ["surface", "control", "item", "inset", "mark", "pill"],
      text: ["ui", "description", "title", "control"],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
