import type { Args, Control } from "@/site/playground/types"

/** The args the controls start from. */
export function defaultArgs(controls: Control[]): Args {
  return Object.fromEntries(
    controls.map((control) => [control.name, control.default])
  )
}

/** The args as the component takes them: a numeric option becomes a number. */
export function resolveArgs(controls: Control[], args: Args): Args {
  const out: Args = { ...args }
  for (const control of controls) {
    if (
      control.kind === "select" &&
      control.numeric &&
      out[control.name] !== undefined
    )
      out[control.name] = Number(out[control.name])
  }
  return out
}
