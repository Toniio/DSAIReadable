import { Geist, JetBrains_Mono } from "next/font/google"

/**
 * The typefaces of the design system. next/font self-hosts them and sets
 * `--font-<key>`, which `typography.font-family.<key>` describes
 * (tokens:lint-fonts). The root layout puts `fontVariables` on <html>.
 */
export const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const fontVariables = [fontSans.variable, fontMono.variable]
