import { CaretDownIcon } from "@phosphor-icons/react"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { userEvent } from "vitest/browser"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

function Example() {
  return (
    <Collapsible>
      <CollapsibleTrigger>Show details</CollapsibleTrigger>
      <CollapsibleContent>
        <p>Extra content revealed on click.</p>
      </CollapsibleContent>
    </Collapsible>
  )
}

describe("Collapsible", () => {
  it("role: the trigger is a button with aria-expanded and aria-controls", async () => {
    render(<Example />)
    const trigger = screen.getByRole("button", { name: "Show details" })
    expect(trigger.getAttribute("aria-expanded")).toBe("false")
    expect(screen.queryByText("Extra content revealed on click.")).toBeNull()

    await userEvent.click(trigger)
    expect(trigger.getAttribute("aria-expanded")).toBe("true")
    const content = screen.getByText("Extra content revealed on click.")
    const controlled = trigger.getAttribute("aria-controls")
    expect(controlled).toBeTruthy()
    expect(content.closest(`[id="${controlled}"]`)).not.toBeNull()
  })

  it("accessible name: the trigger text, or an aria-label when it holds only an icon", () => {
    render(
      <>
        <Example />
        <Collapsible>
          <CollapsibleTrigger aria-label="Show shipping details">
            <CaretDownIcon aria-hidden="true" />
          </CollapsibleTrigger>
          <CollapsibleContent>Ships in two days.</CollapsibleContent>
        </Collapsible>
      </>
    )
    expect(screen.getByRole("button", { name: "Show details" })).toBeTruthy()
    expect(
      screen.getByRole("button", { name: "Show shipping details" })
    ).toBeTruthy()
  })

  it("Enter / Space: opens / closes the content", async () => {
    render(<Example />)
    const trigger = screen.getByRole("button", { name: "Show details" })
    trigger.focus()

    await userEvent.keyboard("{Enter}")
    expect(trigger.getAttribute("aria-expanded")).toBe("true")
    expect(screen.getByText("Extra content revealed on click.")).toBeTruthy()
    await userEvent.keyboard("{Enter}")
    expect(trigger.getAttribute("aria-expanded")).toBe("false")
    expect(screen.queryByText("Extra content revealed on click.")).toBeNull()

    await userEvent.keyboard(" ")
    expect(trigger.getAttribute("aria-expanded")).toBe("true")
    expect(screen.getByText("Extra content revealed on click.")).toBeTruthy()
    await userEvent.keyboard(" ")
    expect(trigger.getAttribute("aria-expanded")).toBe("false")
    expect(screen.queryByText("Extra content revealed on click.")).toBeNull()
  })
})
