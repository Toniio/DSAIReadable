import type { NextConfig } from "next"
import path from "node:path"

// site/ is an app inside the design-system repository: the components it
// renders (components/ui, lib, hooks, styles, tokens.css) live one level up.
const repoRoot = path.join(import.meta.dirname, "..")
// GitHub Pages serves the site under /<repository>/: SITE_BASE_PATH sets it.
const basePath = process.env.SITE_BASE_PATH ?? ""

const nextConfig: NextConfig = {
  turbopack: { root: repoRoot },
  // A static site: every page is prerendered at build time from the
  // repository's files, so it can be served from GitHub Pages.
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  basePath,
  // next/link prefixes its links; an iframe's src is written by hand.
  env: { NEXT_PUBLIC_SITE_BASE_PATH: basePath },
  // The repository's agent rules live in the root AGENTS.md (§ 10): next dev
  // must not write its own into site/.
  agentRules: false,
  // The previews are iframes: the dev badge would sit inside each one.
  devIndicators: false,
}

export default nextConfig
