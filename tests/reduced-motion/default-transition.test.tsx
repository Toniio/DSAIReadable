import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

// This project loads styles/globals.css without tests/no-motion.css, so the
// transitions are the ones the stylesheet draws. A transition with no duration
// class (a hover or focus color change) takes `--default-transition-duration`,
// which Tailwind sets to 150ms and the @theme bridge sets to
// motion.duration.fast (100ms); its curve reads motion.easing.default, which
// holds the same cubic-bezier as Tailwind's.
const FAST = "0.1s"
const EASING_DEFAULT = "cubic-bezier(0.4, 0, 0.2, 1)"

function Example() {
  return (
    <>
      <Button>Save</Button>
      <Input aria-label="Name" />
      <Switch aria-label="Notifications" />
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">Account</TabsTrigger>
        </TabsList>
      </Tabs>
    </>
  )
}

describe.each(["light", "dark"])("Default transition (%s)", (theme) => {
  it("a transition with no duration class runs at motion.duration.fast, on motion.easing.default", () => {
    document.documentElement.classList.toggle("dark", theme === "dark")
    render(<Example />)
    for (const element of [
      screen.getByRole("button", { name: "Save" }),
      screen.getByRole("textbox", { name: "Name" }),
      screen.getByRole("switch", { name: "Notifications" }),
      screen.getByRole("tab", { name: "Account" }),
    ]) {
      const style = getComputedStyle(element)
      expect(style.transitionDuration, element.dataset.slot).toBe(FAST)
      expect(style.transitionTimingFunction, element.dataset.slot).toBe(
        EASING_DEFAULT
      )
    }
  })
})
