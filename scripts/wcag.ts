/**
 * Contrast math shared by the token lints: WCAG 2.x, which the lints enforce,
 * and APCA, which they only report. A module, not a script: it runs nothing
 * when imported.
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

/** APCA-W3 0.1.9 constants (SAPC 0.0.98G-4g), the version the WCAG 3 draft cites. */
const APCA = {
  trc: 2.4,
  coefficients: [0.2126729, 0.7151522, 0.072175],
  normBg: 0.56,
  normText: 0.57,
  revText: 0.62,
  revBg: 0.65,
  blackThreshold: 0.022,
  blackClamp: 1.414,
  scale: 1.14,
  offset: 0.027,
  deltaYMin: 0.0005,
  loClip: 0.1,
}

/** APCA screen luminance of a `#rrggbb` color, soft-clamped near black. */
function apcaLuminance(hex: string): number {
  const h = hex.replace("#", "")
  const y = [0, 2, 4]
    .map((i) => Math.pow(parseInt(h.slice(i, i + 2), 16) / 255, APCA.trc))
    .reduce((sum, v, i) => sum + v * APCA.coefficients[i], 0)
  return y < APCA.blackThreshold
    ? y + Math.pow(APCA.blackThreshold - y, APCA.blackClamp)
    : y
}

/**
 * APCA lightness contrast (Lc) of `text` on `background`, signed: positive
 * for dark text on a light background, negative for light text on a dark
 * one. Unlike a WCAG 2.x ratio, the order of the two colors matters.
 */
export function apcaContrast(text: string, background: string): number {
  const [yText, yBg] = [apcaLuminance(text), apcaLuminance(background)]
  if (Math.abs(yBg - yText) < APCA.deltaYMin) return 0
  if (yBg > yText) {
    const sapc = (yBg ** APCA.normBg - yText ** APCA.normText) * APCA.scale
    return sapc < APCA.loClip ? 0 : (sapc - APCA.offset) * 100
  }
  const sapc = (yBg ** APCA.revBg - yText ** APCA.revText) * APCA.scale
  return sapc > -APCA.loClip ? 0 : (sapc + APCA.offset) * 100
}
