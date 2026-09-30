import "@/styles/globals.css"
import "./no-motion.css"

import { cleanup } from "@testing-library/react"
import { afterEach } from "vitest"

// Testing Library unmounts between tests on its own only when test globals are
// enabled; they are not. The theme goes back to light for the next test.
afterEach(() => {
  cleanup()
  document.documentElement.classList.remove("dark")
})
