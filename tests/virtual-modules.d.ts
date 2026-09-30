declare module "virtual:spec-examples" {
  import type { ComponentType } from "react"

  /** One loader per `specs/components/<Name>.md`, keyed by `<Name>`. */
  export const examples: Record<
    string,
    () => Promise<{ default: ComponentType }>
  >
}
