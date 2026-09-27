/**
 * WCAG colour maths shared by the token lints. A module, not a script: it
 * runs nothing when imported.
 */

/** WCAG 2.x relative luminance of a `#rrggbb` colour. */
export function luminance(hex: string): number {
  const h = hex.replace("#", "")
  const channels = [0, 2, 4]
    .map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)))
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
}
