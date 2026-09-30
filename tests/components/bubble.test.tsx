import { render, screen } from "@testing-library/react"
import type { MouseEvent } from "react"
import { describe, expect, it, vi } from "vitest"
import { userEvent } from "vitest/browser"

import {
  Bubble,
  BubbleContent,
  BubbleGroup,
  BubbleReactions,
} from "@/components/ui/bubble"
import { Message, MessageContent } from "@/components/ui/message"

function Example({
  onRetry,
  onReply,
  onReact,
}: {
  onRetry?: () => void
  onReply?: (event: MouseEvent) => void
  onReact?: () => void
}) {
  return (
    <Message align="end">
      <MessageContent>
        <BubbleGroup>
          <Bubble>
            <BubbleContent>Is the meeting still at 3?</BubbleContent>
          </Bubble>
          <Bubble variant="muted">
            <BubbleContent asChild>
              <button type="button" onClick={onRetry}>
                Retry sending
              </button>
            </BubbleContent>
          </Bubble>
          <Bubble variant="secondary">
            <BubbleContent asChild>
              <a href="#agenda" onClick={onReply}>
                See the agenda
              </a>
            </BubbleContent>
            <BubbleReactions>
              <button
                type="button"
                aria-label="3 people reacted with thumbs up"
                onClick={onReact}
              >
                👍 3
              </button>
            </BubbleReactions>
          </Bubble>
        </BubbleGroup>
      </MessageContent>
    </Message>
  )
}

describe("Bubble", () => {
  it("role: div elements with no role; a BubbleContent through asChild takes the role of its element", () => {
    render(<Example />)
    const plain = screen.getByText("Is the meeting still at 3?")
    expect(plain.dataset.slot).toBe("bubble-content")
    expect(plain.tagName).toBe("DIV")
    expect(plain.getAttribute("role")).toBeNull()
    const bubble = plain.closest<HTMLElement>('[data-slot="bubble"]')!
    expect(bubble.tagName).toBe("DIV")
    expect(bubble.getAttribute("role")).toBeNull()

    const button = screen.getByRole("button", { name: "Retry sending" })
    expect(button.dataset.slot).toBe("bubble-content")
    const link = screen.getByRole("link", { name: "See the agenda" })
    expect(link.dataset.slot).toBe("bubble-content")
  })

  it("accessible name: a clickable BubbleContent by its text, an emoji-only reaction by its aria-label", () => {
    render(<Example />)
    expect(screen.getByRole("button", { name: "Retry sending" })).toBeTruthy()
    expect(screen.getByRole("link", { name: "See the agenda" })).toBeTruthy()
    const reaction = screen.getByRole("button", {
      name: "3 people reacted with thumbs up",
    })
    expect(reaction.closest('[data-slot="bubble-reactions"]')).not.toBeNull()
  })

  it("Tab: moves to a BubbleContent rendered as a button or an a, and to reactions", async () => {
    render(<Example />)
    const stops = [
      screen.getByRole("button", { name: "Retry sending" }),
      screen.getByRole("link", { name: "See the agenda" }),
      screen.getByRole("button", { name: "3 people reacted with thumbs up" }),
    ]
    for (const stop of stops) {
      await userEvent.tab()
      expect(document.activeElement).toBe(stop)
    }
    // The plain BubbleContent is text: it is never a tab stop.
    await userEvent.tab({ shift: true })
    await userEvent.tab({ shift: true })
    await userEvent.tab({ shift: true })
    expect(document.activeElement).toBe(document.body)
  })

  it("Enter/Space: activates it, natively", async () => {
    const onRetry = vi.fn()
    const onReply = vi.fn((event: MouseEvent) => event.preventDefault())
    const onReact = vi.fn()
    render(<Example onRetry={onRetry} onReply={onReply} onReact={onReact} />)

    screen.getByRole("button", { name: "Retry sending" }).focus()
    await userEvent.keyboard("{Enter}")
    expect(onRetry).toHaveBeenCalledTimes(1)
    await userEvent.keyboard(" ")
    expect(onRetry).toHaveBeenCalledTimes(2)

    screen.getByRole("link", { name: "See the agenda" }).focus()
    await userEvent.keyboard("{Enter}")
    expect(onReply).toHaveBeenCalledTimes(1)

    screen
      .getByRole("button", { name: "3 people reacted with thumbs up" })
      .focus()
    await userEvent.keyboard("{Enter}")
    expect(onReact).toHaveBeenCalledTimes(1)
    await userEvent.keyboard(" ")
    expect(onReact).toHaveBeenCalledTimes(2)
  })
})
