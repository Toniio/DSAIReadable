import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
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

  it("ArrowDown / ArrowRight: moves to the next option and checks it", async () => {
    render(<Example defaultValue="standard" />)
    await userEvent.tab()
    await userEvent.keyboard("{ArrowDown}")
    expect(document.activeElement).toBe(radio("Express"))
    expect(checked()).toEqual(["express"])
    await userEvent.keyboard("{ArrowRight}")
    expect(document.activeElement).toBe(radio("Priority"))
    expect(checked()).toEqual(["priority"])
  })

  it("ArrowUp / ArrowLeft: moves to the previous option and checks it", async () => {
    render(<Example defaultValue="priority" />)
    await userEvent.tab()
    await userEvent.keyboard("{ArrowUp}")
    expect(document.activeElement).toBe(radio("Express"))
    expect(checked()).toEqual(["express"])
    await userEvent.keyboard("{ArrowLeft}")
    expect(document.activeElement).toBe(radio("Standard"))
    expect(checked()).toEqual(["standard"])
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
