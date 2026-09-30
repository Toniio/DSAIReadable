import { fileURLToPath } from "node:url"

import tailwindcss from "@tailwindcss/vite"
import { playwright } from "@vitest/browser-playwright"
import { defineConfig } from "vitest/config"

import { specExamples } from "./tests/spec-examples"

/**
 * Component tests: the design system's components rendered in headless
 * Chromium with `styles/globals.css`, queried through their accessibility tree
 * and checked with axe-core. `tests/examples.test.tsx` renders the code example
 * of every spec, served by the `specExamples` plugin. A real browser computes what jsdom cannot: color
 * contrast, geometry (target size) and the focus style.
 *
 *   npm run test:components
 *
 * Chromium comes from Playwright: `npx playwright install chromium` once.
 */
export default defineConfig({
  plugins: [tailwindcss(), specExamples()],
  // The spec examples are served by a plugin, out of reach of Vite's dependency
  // scan: scanning the components they import prebundles React and the
  // primitives once, instead of a second copy discovered mid-run.
  optimizeDeps: {
    entries: ["components/**/*.tsx", "hooks/**/*.ts", "lib/**/*.ts"],
  },
  resolve: {
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
  test: {
    include: ["tests/**/*.test.tsx"],
    setupFiles: ["tests/setup.ts"],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }],
      // A desktop viewport: below `md`, Sidebar becomes a Sheet and Dialog
      // takes the full width.
      viewport: { width: 1280, height: 800 },
    },
  },
})
