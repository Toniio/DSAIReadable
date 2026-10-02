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

declare module "virtual:jsdoc-examples" {
  import type { ComponentType } from "react"

  /**
   * The `@example` of the runtime exports of each `components/ui/<file>.tsx`
   * that writes one as JSX, keyed by `<file>`: the export names, and a loader
   * of a component per name.
   */
  export const jsdocExamples: Record<
    string,
    {
      names: string[]
      load: () => Promise<{ examples: Record<string, ComponentType> }>
    }
  >
}
