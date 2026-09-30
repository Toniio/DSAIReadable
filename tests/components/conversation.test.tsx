import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "@/components/ui/attachment"
import { Bubble, BubbleContent, BubbleReactions } from "@/components/ui/bubble"
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker"
import {
  Message,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from "@/components/ui/message"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"
import { UI_STRINGS } from "@/lib/ui-strings"
import { SparkleIcon, XIcon } from "@phosphor-icons/react"

import { axeViolations } from "../axe"

function Conversation() {
  return (
    <MessageScrollerProvider>
      <MessageScroller>
        <MessageScrollerViewport>
          <MessageScrollerContent>
            <MessageScrollerItem messageId="today">
              <Marker variant="separator">
                <MarkerContent>Today</MarkerContent>
              </Marker>
            </MessageScrollerItem>
            <MessageScrollerItem messageId="1">
              <Message>
                <MessageContent>
                  <MessageHeader>Assistant</MessageHeader>
                  <Bubble variant="secondary">
                    <BubbleContent>How can I help?</BubbleContent>
                  </Bubble>
                </MessageContent>
              </Message>
            </MessageScrollerItem>
            <MessageScrollerItem messageId="2" scrollAnchor>
              <Message align="end">
                <MessageContent>
                  <MessageHeader>You</MessageHeader>
                  <Bubble>
                    <BubbleContent asChild>
                      <button type="button">Where is my order?</button>
                    </BubbleContent>
                    <BubbleReactions aria-label="1 reaction: thumbs up">
                      👍
                    </BubbleReactions>
                  </Bubble>
                  <MessageFooter>Read</MessageFooter>
                </MessageContent>
              </Message>
            </MessageScrollerItem>
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton />
        <MessageScrollerButton direction="start" />
      </MessageScroller>
    </MessageScrollerProvider>
  )
}

describe("MessageScroller", () => {
  it("names its region from UI_STRINGS and holds the messages in a log", () => {
    render(<Conversation />)
    const region = screen.getByRole("region", {
      name: UI_STRINGS.messageScroller.viewport,
    })
    const log = within(region).getByRole("log")
    expect(log.getAttribute("aria-relevant")).toBe("additions")
    expect(within(log).getByText("Where is my order?")).toBeTruthy()
  })

  it("takes the text of its jump buttons from UI_STRINGS, per direction", () => {
    render(<Conversation />)
    const buttons = document.querySelectorAll(
      '[data-slot="message-scroller-button"]'
    )
    expect([...buttons].map((b) => b.textContent)).toEqual([
      UI_STRINGS.messageScroller.scrollToEnd,
      UI_STRINGS.messageScroller.scrollToStart,
    ])
  })

  it("has no axe violation around a whole conversation", async () => {
    render(<Conversation />)
    expect(await axeViolations()).toEqual([])
  })
})

describe("Message and Bubble", () => {
  it("expose the side of the turn and the bubble's variant as data attributes", () => {
    render(<Conversation />)
    const turn = screen
      .getByText("Where is my order?")
      .closest('[data-slot="message"]')
    expect(turn?.getAttribute("data-align")).toBe("end")
    const bubble = screen
      .getByText("How can I help?")
      .closest('[data-slot="bubble"]')
    expect(bubble?.getAttribute("data-variant")).toBe("secondary")
  })

  it("renders a clickable BubbleContent as the button it is given", () => {
    render(<Conversation />)
    const button = screen.getByRole("button", { name: "Where is my order?" })
    expect(button.getAttribute("data-slot")).toBe("bubble-content")
  })
})

describe("Marker", () => {
  it("hides its icon from screen readers and keeps its text", () => {
    render(
      <Marker>
        <MarkerIcon>
          <SparkleIcon />
        </MarkerIcon>
        <MarkerContent>Searched 4 sources</MarkerContent>
      </Marker>
    )
    const icon = document.querySelector('[data-slot="marker-icon"]')
    expect(icon?.getAttribute("aria-hidden")).toBe("true")
    expect(screen.getByText("Searched 4 sources")).toBeTruthy()
  })
})

describe("Attachment", () => {
  function File({ onOpen }: { onOpen?: () => void }) {
    return (
      <Attachment state="error">
        <AttachmentMedia>
          <SparkleIcon />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>report.pdf</AttachmentTitle>
          <AttachmentDescription>Upload failed</AttachmentDescription>
        </AttachmentContent>
        <AttachmentActions>
          <AttachmentAction aria-label="Remove report.pdf">
            <XIcon />
          </AttachmentAction>
        </AttachmentActions>
        <AttachmentTrigger aria-label="Open report.pdf" onClick={onOpen} />
      </Attachment>
    )
  }

  it("reaches the action, then the trigger, from the keyboard", async () => {
    const user = userEvent.setup()
    let opened = 0
    render(<File onOpen={() => opened++} />)
    const tile = document.querySelector('[data-slot="attachment"]')
    expect(tile?.getAttribute("data-state")).toBe("error")

    await user.tab()
    const action = screen.getByRole("button", { name: "Remove report.pdf" })
    expect(document.activeElement).toBe(action)
    expect(action.getAttribute("data-variant")).toBe("ghost")
    expect(action.getAttribute("data-size")).toBe("icon-xs")

    await user.tab()
    const trigger = screen.getByRole("button", { name: "Open report.pdf" })
    expect(document.activeElement).toBe(trigger)
    expect(trigger.getAttribute("type")).toBe("button")
    await user.keyboard("{Enter}")
    expect(opened).toBe(1)
  })

  it("has no axe violation", async () => {
    render(<File />)
    expect(await axeViolations()).toEqual([])
  })
})
