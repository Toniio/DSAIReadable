import { fileURLToPath } from "node:url"

import { defineConfig } from "vitest/config"

/**
 * Component tests: the design system's components rendered in jsdom, queried
 * through their accessibility tree and checked with axe-core.
 *
 *   npm run test:components
 */
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
  test: {
    environment: "jsdom",
    include: ["tests/components/**/*.test.tsx"],
    setupFiles: ["tests/setup.ts"],
  },
})
