/**
 * WCAG color math shared by the token lints. A module, not a script: it
 * runs nothing when imported.
 */

/** WCAG 2.x relative luminance of a `#rrggbb` color. */
export function luminance(hex: string): number {
  const h = hex.replace("#", "")
  const channels = [0, 2, 4]
    .map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)))
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
}

/**
 * Paints `top` at `alpha` over the opaque `bottom`, as the browser composites
 * Tailwind's `bg-<role>/<n>` onto the surface below: a linear mix of the
 * gamma-encoded sRGB channels, rounded to 8 bits.
 */
export function blend(top: string, alpha: number, bottom: string): string {
  const channels = (hex: string) =>
    [0, 2, 4].map((i) => parseInt(hex.replace("#", "").slice(i, i + 2), 16))
  const [t, b] = [channels(top), channels(bottom)]
  return (
    "#" +
    t
      .map((v, i) => Math.round(alpha * v + (1 - alpha) * b[i]))
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")
  )
}
