import { useCallback, useLayoutEffect, useRef, useState } from "react"

/** A window event that closes a Radix overlay with no action of the reader. */
type WindowCause = "blur" | "resize"

/**
 * State a scenario stages on the canvas, such as a menu shown open, kept
 * through the changes the window makes on its own. Radix closes a menu when
 * its window loses focus, and a Select when its window resizes too: the
 * canvas loses focus each time the reader clicks the page around it (the
 * theme, the width, a forced state) and resizes with the width, so the
 * overlay would close while its `open` control still reads on. A change made
 * while the window dispatches one of `causes` is dropped; every other one (an
 * item chosen, Escape, a click outside, the trigger) goes through.
 *
 * A check of `document.hasFocus()` would not do: a click into a frame that
 * does not have focus dispatches its pointerdown before the frame takes it,
 * so a click outside the menu, or on its trigger, would no longer close it.
 */
export function useStagedState<T>(
  initial: T,
  causes: readonly WindowCause[]
): [T, (next: T) => void] {
  const [value, setValue] = useState(initial)
  const dispatching = useRef(false)
  // A string, so a list written inline does not add the listeners again.
  const events = causes.join(" ")

  // The window runs the listeners of an event it is the target of in the
  // order they were added, capture or not: the mark has to be added before
  // the one Radix adds. A layout effect runs before every passive effect of
  // the same commit, where Radix adds it for an overlay open on mount.
  useLayoutEffect(() => {
    const names = events.split(" ")
    let timer: number | undefined
    const mark = (event: Event) => {
      // The blur of an element inside passes the window too, on its way down:
      // focus moving on the canvas is the reader's, and may close the menu.
      if (event.target !== window) return
      dispatching.current = true
      // Radix closes in the same dispatch: the mark ends with the next task.
      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        dispatching.current = false
      })
    }
    for (const name of names)
      window.addEventListener(name, mark, { capture: true })
    return () => {
      for (const name of names)
        window.removeEventListener(name, mark, { capture: true })
      window.clearTimeout(timer)
    }
  }, [events])

  const change = useCallback((next: T) => {
    if (!dispatching.current) setValue(next)
  }, [])
  return [value, change]
}
