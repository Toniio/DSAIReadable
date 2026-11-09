import { DM_Sans, Geist_Mono, Lora } from "next/font/google"

/**
 * The typefaces of the nova brand: `typography.font-family.*` reads
 * `--font-lora`, `--font-dm-sans` and `--font-geist-mono` under `.nova`
 * (tokens:lint-fonts). Lyra is the default, so nothing preloads them.
 */
const fontLora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  preload: false,
})

const fontDmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  preload: false,
})

const fontGeistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  preload: false,
})

export const novaFontVariables = [
  fontLora.variable,
  fontDmSans.variable,
  fontGeistMono.variable,
]
