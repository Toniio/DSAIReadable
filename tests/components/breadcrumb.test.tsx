import { isInaccessible, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { UI_STRINGS } from "@/lib/ui-strings"

function Collapsed() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#home">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbEllipsis />
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Settings</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}

describe("Breadcrumb", () => {
  it("role: a navigation landmark around a list; the current page carries aria-current", () => {
    render(<Collapsed />)
    const nav = screen.getByRole("navigation", {
      name: UI_STRINGS.breadcrumb.landmark,
    })
    expect(nav.querySelector("ol")).toBeTruthy()
    expect(screen.getByText("Settings").getAttribute("aria-current")).toBe(
      "page"
    )
  })

  it("accessible name: the ellipsis announces its srLabel, and hides only its icon", () => {
    render(<Collapsed />)
    const ellipsis = document.querySelector(
      "[data-slot=breadcrumb-ellipsis]"
    ) as HTMLElement
    expect(
      isInaccessible(screen.getByText(UI_STRINGS.breadcrumb.ellipsis))
    ).toBe(false)
    expect(ellipsis.querySelector("svg")?.getAttribute("aria-hidden")).toBe(
      "true"
    )
  })
})
