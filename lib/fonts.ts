import { Geist, JetBrains_Mono } from "next/font/google"

/**
 * The typefaces of the lyra brand, the default. next/font self-hosts them and
 * sets `--font-sans` and `--font-mono`, which `typography.font-family.*` reads
 * (tokens:lint-fonts). The root layout puts `fontVariables` on <html>.
 */
const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const fontVariables = [fontSans.variable, fontMono.variable]
