import "@/styles/globals.css"

import { cleanup } from "@testing-library/react"
import { afterEach } from "vitest"

// Unlike tests/setup.ts, no no-motion.css: these tests read the animations and
// transitions that styles/globals.css leaves under prefers-reduced-motion.
// Testing Library unmounts between tests on its own only when test globals are
// enabled; they are not. The theme goes back to light for the next test.
afterEach(() => {
  cleanup()
  document.documentElement.classList.remove("dark")
})
