declare module "virtual:spec-examples" {
  import type { ComponentType } from "react"

  /** One loader per `specs/components/<Name>.md`, keyed by `<Name>`. */
  export const examples: Record<
    string,
    () => Promise<{ default: ComponentType }>
  >

  /**
   * One loader per complete module (imports and a default export) among the
   * tsx blocks of `specs/foundations/*.md`, keyed by `<file>.md:<line>`.
   */
  export const foundationExamples: Record<
    string,
    () => Promise<{ default: ComponentType }>
  >
}
