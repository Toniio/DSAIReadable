import { userEvent } from "vitest/browser"

import {
  describeElement,
  indicatorContrast,
  MIN_CONTRAST,
  snapshot,
} from "./focus-measure"

export { borderPaint, ringOf } from "./focus-measure"

/**
 * Walks the tab order of what is rendered with real Tab key presses, in the
 * light theme and then in the dark one (the `.dark` class on `<html>`), and
 * returns each tab stop whose focus indicator has no part reaching 3:1 against
 * what it is drawn on, prefixed with its theme and followed by the best
 * contrast it reached. `max` bounds each walk: enough to cross the largest
 * example and come back to `<body>`.
 */
export async function unmarkedTabStops(max = 40): Promise<string[]> {
  const root = document.documentElement
  const initiallyDark = root.classList.contains("dark")
  const unmarked: string[] = []
  try {
    for (const theme of ["light", "dark"] as const) {
      root.classList.toggle("dark", theme === "dark")
      for (const stop of await walkTabStops(max)) {
        unmarked.push(`${theme} ${stop}`)
      }
    }
  } finally {
    root.classList.toggle("dark", initiallyDark)
  }
  return unmarked
}

async function walkTabStops(max: number): Promise<string[]> {
  // The tests run in an iframe: past the last tab stop, focus leaves it for
  // the runner's page. An anchor out of the tab order, focused first, brings
  // it back and starts the sequence before what is rendered.
  const anchor = document.createElement("span")
  anchor.tabIndex = -1
  document.body.prepend(anchor)
  anchor.focus()
  // What was rendered with focus (`autoFocus`) has just lost it to the anchor.
  // An indicator drawn from React state, like InputOTP's active slot, goes on
  // the next render: the first snapshot waits a frame for it, as the
  // documentation site's crawl does, or the first Tab press compares the
  // indicator with itself and seems to show nothing.
  await new Promise(requestAnimationFrame)
  const unmarked: string[] = []
  const seen = new Set<Element>()
  try {
    for (let i = 0; i < max; i++) {
      const before = snapshot()
      // A real Tab key press from Playwright, so :focus-visible matches.
      await userEvent.keyboard("{Tab}")
      await new Promise(requestAnimationFrame)
      const focused = document.activeElement
      if (!focused || focused === document.body || seen.has(focused)) break
      seen.add(focused)
      const shown = indicatorContrast(focused, before, snapshot())
      if (shown < MIN_CONTRAST) {
        unmarked.push(`${describeElement(focused)} ${shown.toFixed(2)}:1`)
      }
    }
  } finally {
    anchor.remove()
  }
  return unmarked
}
