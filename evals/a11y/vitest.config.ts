import { readdirSync } from "node:fs"
import { join, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import tailwindcss from "@tailwindcss/vite"
import { playwright } from "@vitest/browser-playwright"
import type { Plugin } from "vite"
import { defineConfig } from "vitest/config"

const ROOT = fileURLToPath(new URL("../..", import.meta.url))
const VIRTUAL_ID = "virtual:eval-screens"

/**
 * Serves the screens of one run (`EVALS_SCREENS`, a folder of `<task>.tsx`)
 * as `virtual:eval-screens`: one loader per task, keyed by its id.
 */
function evalScreens(): Plugin {
  return {
    name: "dsaireadable:eval-screens",
    resolveId(id) {
      if (id === VIRTUAL_ID) return `\0${VIRTUAL_ID}`
    },
    load(id) {
      if (id !== `\0${VIRTUAL_ID}`) return
      const dir = process.env.EVALS_SCREENS
      if (!dir) throw new Error("EVALS_SCREENS names no folder of screens")
      const loaders = readdirSync(dir)
        .filter((file) => file.endsWith(".tsx"))
        .map(
          (file) =>
            `  ${JSON.stringify(file.slice(0, -".tsx".length))}: () => import(${JSON.stringify(
              "/" +
                join(resolve(dir), file).slice(ROOT.length).replace(/^\//, "")
            )}),`
        )
      return `export const screens = {\n${loaders.join("\n")}\n}\n`
    },
  }
}

/**
 * Stage B of the conformance harness (evals/README.md): each generated screen
 * rendered in headless Chromium, with the component tests' own checks (axe,
 * light and dark; a focus indicator on every tab stop). Run by `evals/run.ts`.
 */
export default defineConfig({
  root: ROOT,
  plugins: [tailwindcss(), evalScreens()],
  // The screens are served by a plugin, out of reach of Vite's dependency
  // scan: scanning them with the components prebundles React and the
  // primitives once, instead of a second copy discovered mid-run.
  optimizeDeps: {
    entries: [
      "components/**/*.tsx",
      "hooks/**/*.ts",
      "lib/**/*.ts",
      "evals/a11y/*.tsx",
      ...(process.env.EVALS_SCREENS
        ? [`${relative(ROOT, resolve(process.env.EVALS_SCREENS))}/*.tsx`]
        : []),
    ],
  },
  resolve: {
    alias: {
      "@": ROOT,
      // A screen can navigate (useRouter) without an app router mounted.
      "next/navigation": fileURLToPath(
        new URL("./next-navigation.ts", import.meta.url)
      ),
    },
  },
  // A screen is written for a Next.js app: `next/link` reads `process.env`,
  // which Next defines at build time.
  define: { "process.env": "{}" },
  test: {
    include: ["evals/a11y/screens.test.tsx"],
    setupFiles: ["tests/setup.ts"],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }],
      viewport: { width: 1280, height: 800 },
    },
  },
})
