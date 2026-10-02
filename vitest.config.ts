import { fileURLToPath } from "node:url"

import tailwindcss from "@tailwindcss/vite"
import { playwright } from "@vitest/browser-playwright"
import { configDefaults, defineConfig } from "vitest/config"

import { specExamples } from "./tests/spec-examples"

/**
 * Component tests: the design system's components rendered in headless
 * Chromium with `styles/globals.css`, queried through their accessibility tree
 * and checked with axe-core. `tests/examples.test.tsx` renders the code example
 * of every spec, served by the `specExamples` plugin. A real browser computes what jsdom cannot: color
 * contrast, geometry (target size) and the focus style.
 *
 * Two projects, both run by `npm run test:components`:
 * - `components`: every test but the reduced-motion ones, with animations and
 *   transitions off (`tests/no-motion.css`), so the tests read end states;
 * - `reduced-motion`: `tests/reduced-motion/`, in a browser that reports
 *   `prefers-reduced-motion: reduce` and with the animations on, to check what
 *   the stylesheet does under the query.
 *
 *   npm run test:components
 *
 * Chromium comes from Playwright: `npx playwright install chromium` once.
 */

/**
 * Headless Chromium at a desktop viewport (below `md`, Sidebar becomes a
 * Sheet and Dialog takes the full width), with the motion preference pinned so
 * the host's setting changes nothing.
 */
function chromium(reducedMotion: "reduce" | "no-preference") {
  return {
    enabled: true,
    headless: true,
    provider: playwright({ contextOptions: { reducedMotion } }),
    instances: [{ browser: "chromium" as const }],
    viewport: { width: 1280, height: 800 },
  }
}

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
    // Each project names its own files, setup and browser: `extends` would
    // concatenate them with the root's.
    projects: [
      {
        extends: true,
        test: {
          name: "components",
          include: ["tests/**/*.test.tsx"],
          exclude: [...configDefaults.exclude, "tests/reduced-motion/**"],
          setupFiles: ["tests/setup.ts"],
          browser: chromium("no-preference"),
        },
      },
      {
        extends: true,
        test: {
          name: "reduced-motion",
          include: ["tests/reduced-motion/**/*.test.tsx"],
          setupFiles: ["tests/reduced-motion/setup.ts"],
          browser: chromium("reduce"),
        },
      },
    ],
  },
})
