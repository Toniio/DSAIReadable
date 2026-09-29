/**
 * Color difference as people see it, including with a color vision
 * deficiency. A module, not a script: it runs nothing when imported.
 *
 *   · OKLab (Björn Ottosson, 2020) — a perceptual space where Euclidean
 *     distance tracks visible difference far better than RGB or HSL;
 *   · Machado, Oliveira & Fernandes (2009) matrices at full severity, applied
 *     in linear RGB, for protanopia and deuteranopia — together about 6 % of
 *     men, the population a categorical palette most often fails.
 */

type Rgb = [number, number, number]

const toLinear = (c: number) =>
  c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)

/** `#rrggbb` → linear sRGB channels in [0, 1]. */
export function linearRgb(hex: string): Rgb {
  const h = hex.replace("#", "")
  return [0, 2, 4].map((i) =>
    toLinear(parseInt(h.slice(i, i + 2), 16) / 255)
  ) as Rgb
}

function oklab([r, g, b]: Rgb): Rgb {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ]
}

const MACHADO: Record<"protanopia" | "deuteranopia", number[][]> = {
  protanopia: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
  deuteranopia: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881],
  ],
}

export type Vision = "normal" | keyof typeof MACHADO
export const VISIONS: Vision[] = ["normal", "protanopia", "deuteranopia"]

/** How a color appears to someone with the given vision. */
export function simulate(rgb: Rgb, vision: Vision): Rgb {
  if (vision === "normal") return rgb
  const m = MACHADO[vision]
  return m.map((row) =>
    Math.min(
      1,
      Math.max(0, row[0] * rgb[0] + row[1] * rgb[1] + row[2] * rgb[2])
    )
  ) as Rgb
}

/** Euclidean distance in OKLab, as seen with the given vision. */
export function deltaE(
  a: string,
  b: string,
  vision: Vision = "normal"
): number {
  const [x, y] = [a, b].map((hex) => oklab(simulate(linearRgb(hex), vision)))
  return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2])
}
