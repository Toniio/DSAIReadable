import { cleanup } from "@testing-library/react"
import { afterEach } from "vitest"

// Testing Library unmounts between tests on its own only when test globals are
// enabled; they are not.
afterEach(() => {
  cleanup()
})

// jsdom has no layout engine. Radix and Base UI call these browser APIs while
// positioning popups and moving the highlighted option into view; the stubs
// only let them run, nothing here asserts on geometry.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverStub

Element.prototype.scrollIntoView ??= function scrollIntoView() {}
Element.prototype.hasPointerCapture ??= function hasPointerCapture() {
  return false
}
Element.prototype.releasePointerCapture ??= function releasePointerCapture() {}
