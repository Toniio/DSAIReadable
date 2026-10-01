declare module "virtual:eval-screens" {
  import type { ComponentType } from "react"

  /** One loader per generated screen of the run, keyed by its task id. */
  export const screens: Record<
    string,
    () => Promise<{ default: ComponentType }>
  >
}
