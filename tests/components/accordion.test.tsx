import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { userEvent } from "vitest/browser"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

function Example() {
  return (
    <>
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Section 1</AccordionTrigger>
          <AccordionContent>Content of the first section.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Section 2</AccordionTrigger>
          <AccordionContent>Content of the second section.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Section 3</AccordionTrigger>
          <AccordionContent>Content of the third section.</AccordionContent>
        </AccordionItem>
      </Accordion>
      <button type="button">After</button>
    </>
  )
}

function trigger(name: string) {
  return screen.getByRole("button", { name })
}

describe("Accordion", () => {
  it("role: each trigger is a button in a heading, with aria-expanded and aria-controls; each panel is a region", async () => {
    render(<Example />)
    const first = trigger("Section 1")
    expect(first.closest("h1, h2, h3, h4, h5, h6")).not.toBeNull()
    expect(first.getAttribute("aria-expanded")).toBe("false")
    expect(screen.queryByRole("region")).toBeNull()

    await userEvent.click(first)
    expect(first.getAttribute("aria-expanded")).toBe("true")
    const panel = screen.getByRole("region")
    expect(first.getAttribute("aria-controls")).toBe(panel.id)
  })

  it("accessible name: the trigger text names the button and labels the panel", async () => {
    render(<Example />)
    await userEvent.click(trigger("Section 2"))
    const panel = screen.getByRole("region", { name: "Section 2" })
    expect(panel.textContent).toBe("Content of the second section.")
  })

  it("Enter / Space: opens or closes the focused trigger's panel", async () => {
    render(<Example />)
    const first = trigger("Section 1")
    first.focus()

    await userEvent.keyboard("{Enter}")
    expect(first.getAttribute("aria-expanded")).toBe("true")
    expect(screen.getByRole("region", { name: "Section 1" })).toBeTruthy()
    await userEvent.keyboard("{Enter}")
    expect(first.getAttribute("aria-expanded")).toBe("false")
    expect(screen.queryByRole("region")).toBeNull()

    await userEvent.keyboard(" ")
    expect(first.getAttribute("aria-expanded")).toBe("true")
    await userEvent.keyboard(" ")
    expect(first.getAttribute("aria-expanded")).toBe("false")
  })

  it("ArrowDown / ArrowUp: next / previous trigger", async () => {
    render(<Example />)
    trigger("Section 1").focus()

    await userEvent.keyboard("{ArrowDown}")
    expect(document.activeElement).toBe(trigger("Section 2"))
    await userEvent.keyboard("{ArrowDown}")
    expect(document.activeElement).toBe(trigger("Section 3"))
    await userEvent.keyboard("{ArrowUp}")
    expect(document.activeElement).toBe(trigger("Section 2"))
    await userEvent.keyboard("{ArrowUp}")
    expect(document.activeElement).toBe(trigger("Section 1"))
  })

  it("Home / End: first / last trigger", async () => {
    render(<Example />)
    trigger("Section 2").focus()

    await userEvent.keyboard("{End}")
    expect(document.activeElement).toBe(trigger("Section 3"))
    await userEvent.keyboard("{Home}")
    expect(document.activeElement).toBe(trigger("Section 1"))
  })

  it("Tab: leaves the triggers for the next focusable content", async () => {
    render(<Example />)
    trigger("Section 3").focus()

    await userEvent.tab()
    expect(document.activeElement).toBe(trigger("After"))
  })
})
