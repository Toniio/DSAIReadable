import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { userEvent } from "vitest/browser"

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "@/components/ui/attachment"
import { ArrowClockwiseIcon, FilePdfIcon, XIcon } from "@phosphor-icons/react"

function File({
  name,
  onOpen,
  onRetry,
  onRemove,
}: {
  name: string
  onOpen?: () => void
  onRetry?: () => void
  onRemove?: () => void
}) {
  return (
    <Attachment>
      <AttachmentMedia>
        <FilePdfIcon />
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>{name}</AttachmentTitle>
        <AttachmentDescription>2.4 MB</AttachmentDescription>
      </AttachmentContent>
      <AttachmentActions>
        <AttachmentAction aria-label={`Retry ${name}`} onClick={onRetry}>
          <ArrowClockwiseIcon />
        </AttachmentAction>
        <AttachmentAction aria-label={`Remove ${name}`} onClick={onRemove}>
          <XIcon />
        </AttachmentAction>
      </AttachmentActions>
      <AttachmentTrigger aria-label={`Open ${name}`} onClick={onOpen} />
    </Attachment>
  )
}

// Enough tiles to overflow the 1280px viewport, so the group scrolls.
const names = Array.from({ length: 12 }, (_, i) => `report-${i + 1}.pdf`)

describe("Attachment", () => {
  it("role: a div with no role, a native button trigger (a link through asChild) and Button actions", () => {
    render(
      <>
        <File name="report.pdf" />
        <Attachment>
          <AttachmentContent>
            <AttachmentTitle>notes.md</AttachmentTitle>
          </AttachmentContent>
          <AttachmentTrigger asChild>
            <a href="#notes" aria-label="Open notes.md" />
          </AttachmentTrigger>
        </Attachment>
      </>
    )
    const [tile] = document.querySelectorAll('[data-slot="attachment"]')
    expect(tile.tagName).toBe("DIV")
    expect(tile.getAttribute("role")).toBeNull()

    const trigger = screen.getByRole("button", { name: "Open report.pdf" })
    expect(trigger.tagName).toBe("BUTTON")
    expect(trigger.getAttribute("type")).toBe("button")
    expect(trigger.dataset.slot).toBe("attachment-trigger")

    const link = screen.getByRole("link", { name: "Open notes.md" })
    expect(link.dataset.slot).toBe("attachment-trigger")
    expect(link.hasAttribute("type")).toBe(false)

    const action = screen.getByRole("button", { name: "Remove report.pdf" })
    expect(action.tagName).toBe("BUTTON")
    expect(action.dataset.slot).toBe("attachment-action")
    expect(action.dataset.variant).toBe("ghost")
    expect(action.dataset.size).toBe("icon-xs")
  })

  it("accessible name: the trigger holds no text and is named by its aria-label, each action by its own", () => {
    render(<File name="report.pdf" />)
    const trigger = screen.getByRole("button", { name: "Open report.pdf" })
    expect(trigger.textContent).toBe("")
    expect(
      screen.getByRole("button", { name: "Retry report.pdf" })
    ).toBeTruthy()
    expect(
      screen.getByRole("button", { name: "Remove report.pdf" })
    ).toBeTruthy()
  })

  it("Tab: moves to each action, then to the trigger", async () => {
    render(
      <AttachmentGroup>
        <File name="report.pdf" />
        <File name="photo.jpg" />
      </AttachmentGroup>
    )
    const order = [
      "Retry report.pdf",
      "Remove report.pdf",
      "Open report.pdf",
      "Retry photo.jpg",
      "Remove photo.jpg",
      "Open photo.jpg",
    ]
    for (const name of order) {
      await userEvent.tab()
      expect(document.activeElement).toBe(screen.getByRole("button", { name }))
    }
  })

  it("Enter/Space: opens the file (trigger) or runs the action", async () => {
    const onOpen = vi.fn()
    const onRemove = vi.fn()
    render(<File name="report.pdf" onOpen={onOpen} onRemove={onRemove} />)

    screen.getByRole("button", { name: "Open report.pdf" }).focus()
    await userEvent.keyboard("{Enter}")
    expect(onOpen).toHaveBeenCalledTimes(1)
    await userEvent.keyboard(" ")
    expect(onOpen).toHaveBeenCalledTimes(2)

    screen.getByRole("button", { name: "Remove report.pdf" }).focus()
    await userEvent.keyboard("{Enter}")
    expect(onRemove).toHaveBeenCalledTimes(1)
    await userEvent.keyboard(" ")
    expect(onRemove).toHaveBeenCalledTimes(2)
    expect(onOpen).toHaveBeenCalledTimes(2)
  })

  it("ArrowLeft / ArrowRight: scrolls an AttachmentGroup horizontally, natively", async () => {
    render(
      <AttachmentGroup>
        {names.map((name) => (
          <File key={name} name={name} />
        ))}
      </AttachmentGroup>
    )
    const group = document.querySelector<HTMLElement>(
      '[data-slot="attachment-group"]'
    )!
    expect(group.scrollWidth).toBeGreaterThan(group.clientWidth)
    screen.getByRole("button", { name: "Open report-1.pdf" }).focus()
    expect(group.scrollLeft).toBe(0)

    await userEvent.keyboard("{ArrowRight}")
    await expect.poll(() => group.scrollLeft).toBeGreaterThan(0)
    await userEvent.keyboard("{ArrowLeft}")
    await expect.poll(() => group.scrollLeft).toBe(0)
  })
})
