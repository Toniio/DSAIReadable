import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Avatar, AvatarBadge, AvatarFallback } from "@/components/ui/avatar"

import { axeViolations } from "../axe"

function Example({ label }: { label?: string }) {
  return (
    <Avatar>
      <AvatarFallback>CN</AvatarFallback>
      <AvatarBadge aria-label={label} />
    </Avatar>
  )
}

describe("Avatar", () => {
  it("role: a labeled AvatarBadge is an image, with no prohibited aria-label in either theme", async () => {
    render(<Example label="Online" />)
    const badge = screen.getByRole("img", { name: "Online" })
    expect(badge.getAttribute("data-slot")).toBe("avatar-badge")
    expect(await axeViolations()).toEqual([])
  })

  it("accessible name: the badge is named by its aria-label; an unlabeled badge is no image", () => {
    const { unmount } = render(<Example label="3 new messages" />)
    expect(screen.getByRole("img").getAttribute("aria-label")).toBe(
      "3 new messages"
    )
    unmount()
    render(<Example />)
    expect(screen.queryByRole("img")).toBeNull()
  })
})
