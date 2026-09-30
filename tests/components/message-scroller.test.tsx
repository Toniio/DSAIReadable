import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { userEvent } from "vitest/browser"

import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Message, MessageContent } from "@/components/ui/message"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"
import { UI_STRINGS } from "@/lib/ui-strings"

// Enough messages to overflow the h-96 frame of the spec's example.
const messages = Array.from({ length: 40 }, (_, i) => ({
  id: String(i + 1),
  from: i % 2 === 0 ? "assistant" : "user",
  text: `Message ${i + 1}`,
}))

function Example({ label }: { label?: string }) {
  return (
    <div className="h-96">
      <MessageScrollerProvider>
        <MessageScroller>
          <MessageScrollerViewport aria-label={label}>
            <MessageScrollerContent>
              {messages.map((m) => (
                <MessageScrollerItem key={m.id} messageId={m.id}>
                  <Message align={m.from === "user" ? "end" : "start"}>
                    <MessageContent>
                      <Bubble
                        variant={m.from === "user" ? "default" : "secondary"}
                      >
                        <BubbleContent>{m.text}</BubbleContent>
                      </Bubble>
                    </MessageContent>
                  </Message>
                </MessageScrollerItem>
              ))}
              <MessageScrollerItem messageId="retry">
                <Message align="end">
                  <MessageContent>
                    <Bubble variant="muted">
                      <BubbleContent asChild>
                        <button type="button">Retry sending</button>
                      </BubbleContent>
                    </Bubble>
                  </MessageContent>
                </Message>
              </MessageScrollerItem>
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
          <MessageScrollerButton direction="start" />
        </MessageScroller>
      </MessageScrollerProvider>
    </div>
  )
}

function viewport() {
  return screen.getByRole("region", {
    name: UI_STRINGS.messageScroller.viewport,
  })
}

function maxScroll(el: HTMLElement) {
  return el.scrollHeight - el.clientHeight
}

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(resolve))
}

// The items skip their layout out of view (content-visibility: auto) and take
// an estimated height until they render once: scroll through the thread so
// each one renders and keeps its real height, and the scroll range is stable.
async function settle(region: HTMLElement) {
  for (let top = 0; top < region.scrollHeight; top += region.clientHeight / 2) {
    region.scrollTop = top
    await nextFrame()
    await nextFrame()
  }
  region.scrollTop = region.scrollHeight
  await expect.poll(() => region.scrollTop).toBe(maxScroll(region))
}

/** Waits for a scroll animation to end and returns where it stopped. */
async function scrollStopped(region: HTMLElement) {
  let last = Number.NaN
  while (region.scrollTop !== last) {
    last = region.scrollTop
    for (let i = 0; i < 5; i++) await nextFrame()
  }
  return last
}

/** Renders the thread, settles it at its end, focuses the viewport. */
async function focusedAtEnd() {
  render(<Example />)
  const region = viewport()
  await settle(region)
  expect(maxScroll(region)).toBeGreaterThan(region.clientHeight)
  region.focus()
  return region
}

describe("MessageScroller", () => {
  it("role: the viewport is a focusable region named Messages and the content is a log of additions", () => {
    render(<Example />)
    const region = viewport()
    expect(region.dataset.slot).toBe("message-scroller-viewport")
    expect(region.tabIndex).toBe(0)
    const log = within(region).getByRole("log")
    expect(log.dataset.slot).toBe("message-scroller-content")
    expect(log.getAttribute("aria-relevant")).toBe("additions")
    expect(within(log).getByText("Message 1")).toBeTruthy()
  })

  it("accessible name: the viewport from UI_STRINGS or aria-label, the buttons from UI_STRINGS or their children", async () => {
    const { unmount } = render(<Example />)
    expect(viewport()).toBeTruthy()
    const [end, start] = document.querySelectorAll<HTMLElement>(
      '[data-slot="message-scroller-button"]'
    )
    expect(end.textContent).toBe(UI_STRINGS.messageScroller.scrollToEnd)
    expect(start.textContent).toBe(UI_STRINGS.messageScroller.scrollToStart)
    // At the end of the thread, the start button is active and exposed.
    await expect
      .poll(() =>
        screen.queryByRole("button", {
          name: UI_STRINGS.messageScroller.scrollToStart,
        })
      )
      .not.toBeNull()
    unmount()

    render(
      <MessageScrollerProvider>
        <MessageScroller>
          <MessageScrollerViewport aria-label="Order #1042">
            <MessageScrollerContent>
              <MessageScrollerItem messageId="1">Hello</MessageScrollerItem>
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton>Latest</MessageScrollerButton>
        </MessageScroller>
      </MessageScrollerProvider>
    )
    expect(screen.getByRole("region", { name: "Order #1042" })).toBeTruthy()
    const button = document.querySelector<HTMLElement>(
      '[data-slot="message-scroller-button"]'
    )!
    expect(button.textContent).toBe("Latest")
  })

  it("Tab: moves to the viewport, then into the messages' controls", async () => {
    render(<Example />)
    const region = viewport()
    await expect.poll(() => region.scrollTop).toBe(maxScroll(region))
    await userEvent.tab()
    expect(document.activeElement).toBe(region)
    await userEvent.tab()
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Retry sending" })
    )
  })

  it("ArrowUp/ArrowDown: scrolls the viewport by a line", async () => {
    const region = await focusedAtEnd()
    const end = region.scrollTop

    await userEvent.keyboard("{ArrowUp}")
    const up = await scrollStopped(region)
    expect(up).toBeLessThan(end)
    expect(end - up).toBeLessThan(region.clientHeight / 4)

    await userEvent.keyboard("{ArrowDown}")
    expect(await scrollStopped(region)).toBe(end)
  })

  it("PageUp/PageDown: scrolls the viewport by a page", async () => {
    const region = await focusedAtEnd()
    const end = region.scrollTop
    const page = region.clientHeight / 2

    await userEvent.keyboard("{PageUp}")
    const up = await scrollStopped(region)
    expect(end - up).toBeGreaterThan(page)

    await userEvent.keyboard("{PageUp}")
    const twoUp = await scrollStopped(region)
    expect(up - twoUp).toBeGreaterThan(page)

    await userEvent.keyboard("{PageDown}")
    expect((await scrollStopped(region)) - twoUp).toBeGreaterThan(page)
  })

  it("Home/End: scrolls to the first or the last message", async () => {
    const region = await focusedAtEnd()

    await userEvent.keyboard("{Home}")
    expect(await scrollStopped(region)).toBe(0)
    expect(
      within(region).getByText("Message 1").getBoundingClientRect().top
    ).toBeGreaterThanOrEqual(region.getBoundingClientRect().top)

    await userEvent.keyboard("{End}")
    expect(await scrollStopped(region)).toBe(maxScroll(region))
  })

  it("Enter/Space: on a MessageScrollerButton: jumps to its end", async () => {
    const region = await focusedAtEnd()
    const scrollToEnd = () =>
      screen.getByRole("button", {
        name: UI_STRINGS.messageScroller.scrollToEnd,
      })
    const scrollToStart = () =>
      screen.getByRole("button", {
        name: UI_STRINGS.messageScroller.scrollToStart,
      })

    await expect.poll(() => scrollToStart().tabIndex).not.toBe(-1)
    scrollToStart().focus()
    await userEvent.keyboard("{Enter}")
    expect(await scrollStopped(region)).toBe(0)

    await expect.poll(() => scrollToEnd().tabIndex).not.toBe(-1)
    scrollToEnd().focus()
    await userEvent.keyboard(" ")
    expect(await scrollStopped(region)).toBe(maxScroll(region))
  })
})
