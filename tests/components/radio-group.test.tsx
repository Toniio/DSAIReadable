import { render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { userEvent } from "vitest/browser"

import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

function Example({ defaultValue }: { defaultValue?: string }) {
  return (
    <RadioGroup defaultValue={defaultValue} aria-label="Delivery">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="standard" id="standard" />
        <Label htmlFor="standard">Standard</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="express" id="express" />
        <Label htmlFor="express">Express</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="priority" id="priority" />
        <Label htmlFor="priority">Priority</Label>
      </div>
    </RadioGroup>
  )
}

function radio(name: string) {
  return screen.getByRole("radio", { name })
}

function checked() {
  return screen
    .getAllByRole("radio")
    .filter((item) => item.getAttribute("aria-checked") === "true")
    .map((item) => item.id)
}

describe("RadioGroup", () => {
  it("role: a radiogroup of radios, each with aria-checked", () => {
    render(<Example defaultValue="standard" />)
    const group = screen.getByRole("radiogroup")
    const radios = screen.getAllByRole("radio")
    expect(radios).toHaveLength(3)
    for (const item of radios) expect(group.contains(item)).toBe(true)
    expect(radios.map((item) => item.getAttribute("aria-checked"))).toEqual([
      "true",
      "false",
      "false",
    ])
  })

  it("accessible name: each option by its tied Label, the group by its aria-label", () => {
    render(<Example />)
    expect(screen.getByRole("radiogroup", { name: "Delivery" })).toBeTruthy()
    for (const name of ["Standard", "Express", "Priority"]) {
      expect(radio(name).id).toBe(name.toLowerCase())
    }
  })

  it("Tab: enters the group on the checked option", async () => {
    render(<Example defaultValue="express" />)
    await userEvent.tab()
    expect(document.activeElement).toBe(radio("Express"))
    // The group is a single tab stop.
    await userEvent.tab()
    expect(document.activeElement).toBe(document.body)
  })

  // Radix moves the focus in a timeout (RovingFocus), and checks the option it
  // lands on only while an arrow key is still down: a keyup sent before that
  // timeout, as a loaded CI runner does, moves the focus and checks nothing.
  // Each arrow is held until the option is checked, as a keystroke lasts.
  async function arrow(key: string, name: string) {
    await userEvent.keyboard(`{${key}>}`)
    await expect.poll(() => document.activeElement).toBe(radio(name))
    await expect.poll(checked).toEqual([name.toLowerCase()])
    await userEvent.keyboard(`{/${key}}`)
  }

  it("ArrowDown / ArrowRight: moves to the next option and checks it", async () => {
    render(<Example defaultValue="standard" />)
    await userEvent.tab()
    await arrow("ArrowDown", "Express")
    await arrow("ArrowRight", "Priority")
  })

  it("ArrowUp / ArrowLeft: moves to the previous option and checks it", async () => {
    render(<Example defaultValue="priority" />)
    await userEvent.tab()
    await arrow("ArrowUp", "Express")
    await arrow("ArrowLeft", "Standard")
  })

  it("Space: checks the focused option", async () => {
    render(<Example />)
    await userEvent.tab()
    expect(document.activeElement).toBe(radio("Standard"))
    expect(checked()).toEqual([])
    await userEvent.keyboard(" ")
    expect(checked()).toEqual(["standard"])
  })
})

describe("RadioGroupItem, checked and invalid", () => {
  afterEach(() => document.documentElement.classList.remove("dark"))

  it.each(["light", "dark"] as const)(
    "keeps the border of a checked item in %s",
    (theme) => {
      document.documentElement.classList.toggle("dark", theme === "dark")
      render(
        <>
          <RadioGroup defaultValue="plain" aria-label="Plain plan">
            <RadioGroupItem value="plain" aria-label="Plain" />
          </RadioGroup>
          <RadioGroup defaultValue="invalid" aria-label="Invalid plan">
            <RadioGroupItem value="invalid" aria-label="Invalid" aria-invalid />
          </RadioGroup>
        </>
      )
      const plain = getComputedStyle(radio("Plain")).borderTopColor
      expect(getComputedStyle(radio("Invalid")).borderTopColor).toBe(plain)
    }
  )
})
