import { render, screen } from "@testing-library/react"
import { FilePdfIcon } from "@phosphor-icons/react"
import { describe, expect, it } from "vitest"
import { userEvent } from "vitest/browser"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { Message, MessageContent } from "@/components/ui/message"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"

function slot(name: string) {
  return document.querySelector<HTMLElement>(`[data-slot="${name}"]`)!
}

function AccordionExample() {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger>Section 1</AccordionTrigger>
        <AccordionContent>Content of the first section.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Section 2</AccordionTrigger>
        <AccordionContent>Content of the second section.</AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

function InputOTPExample() {
  return (
    <InputOTP maxLength={6} aria-label="Verification code">
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  )
}

function CarouselExample({ setApi }: { setApi?: (api: CarouselApi) => void }) {
  return (
    <Carousel
      className="mx-12 w-full max-w-xs"
      aria-label="Featured products"
      setApi={setApi}
    >
      <CarouselContent>
        <CarouselItem>Slide 1</CarouselItem>
        <CarouselItem>
          <Button variant="outline">View slide 2</Button>
        </CarouselItem>
        <CarouselItem>Slide 3</CarouselItem>
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}

// Enough messages to overflow the h-96 frame of the spec's example.
const messages = Array.from({ length: 40 }, (_, i) => ({
  id: String(i + 1),
  from: i % 2 === 0 ? "assistant" : "user",
  text: `Message ${i + 1}`,
}))

function MessageScrollerExample() {
  return (
    <div className="h-96">
      <MessageScrollerProvider>
        <MessageScroller>
          <MessageScrollerViewport>
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
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
          <MessageScrollerButton direction="start" />
        </MessageScroller>
      </MessageScrollerProvider>
    </div>
  )
}

function SidebarExample() {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent>
          <nav aria-label="Main">
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive>Dashboard</SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>Settings</SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </nav>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
      <main className="flex-1 p-4">
        <SidebarTrigger />
        <p>Main content</p>
      </main>
    </SidebarProvider>
  )
}

describe("Reduced motion: components", () => {
  it("runs in a browser that reports prefers-reduced-motion: reduce", () => {
    expect(matchMedia("(prefers-reduced-motion: reduce)").matches).toBe(true)
  })

  it("Accordion: opens and closes at once, with no height animation", async () => {
    render(<AccordionExample />)
    const trigger = screen.getByRole("button", { name: "Section 1" })
    await userEvent.click(trigger)
    const panel = screen.getByRole("region", { name: "Section 1" })
    expect(panel.dataset.slot).toBe("accordion-content")
    expect(getComputedStyle(panel).animationName).toBe("none")

    await userEvent.click(trigger)
    // With no closing animation, Radix hides the panel at once.
    expect(panel.dataset.state).toBe("closed")
    expect(panel.hidden).toBe(true)
    expect(screen.queryByRole("region")).toBeNull()
  })

  it("Skeleton: holds still, with no pulse", () => {
    render(<Skeleton className="h-4 w-48" />)
    expect(getComputedStyle(slot("skeleton")).animationName).toBe("none")
  })

  it("InputOTP: the caret of the active slot holds still, with no blink", async () => {
    render(<InputOTPExample />)
    screen.getByRole("textbox", { name: "Verification code" }).focus()
    await expect
      .poll(() =>
        document.querySelector(
          '[data-slot="input-otp-slot"][data-active="true"] .animate-caret-blink'
        )
      )
      .not.toBeNull()
    const caret = document.querySelector(
      '[data-slot="input-otp-slot"][data-active="true"] .animate-caret-blink'
    )!
    expect(getComputedStyle(caret).animationName).toBe("none")
  })

  it("Attachment: an uploading title does not shimmer and stays readable", () => {
    render(
      <Attachment state="uploading">
        <AttachmentMedia>
          <FilePdfIcon />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>report.pdf</AttachmentTitle>
          <AttachmentDescription>2.4 MB</AttachmentDescription>
        </AttachmentContent>
      </Attachment>
    )
    const style = getComputedStyle(slot("attachment-title"))
    expect(style.animationName).toBe("none")
    expect(style.backgroundImage).toBe("none")
    // The text is painted in its color again, not clipped to the gradient.
    expect(style.getPropertyValue("-webkit-text-fill-color")).toBe(style.color)
  })

  it("Spinner: keeps spinning, on purpose", () => {
    render(<Spinner />)
    expect(getComputedStyle(screen.getByRole("status")).animationName).toBe(
      "spin"
    )
  })

  it("Carousel: jumps to a slide instead of scrolling to it", async () => {
    let api: CarouselApi
    render(<CarouselExample setApi={(value) => (api = value)} />)
    await expect.poll(() => api).toBeDefined()
    expect(api!.internalEngine().options.duration).toBe(0)
  })

  it("MessageScroller: the scroll button fades, with no slide or scale", () => {
    render(<MessageScrollerExample />)
    for (const button of document.querySelectorAll(
      '[data-slot="message-scroller-button"]'
    ))
      expect(getComputedStyle(button).transitionProperty).toBe("opacity")
  })

  it("Sidebar: collapses and expands at once on the desktop viewport", () => {
    render(<SidebarExample />)
    for (const name of [
      "sidebar-gap",
      "sidebar-container",
      "sidebar-group-label",
      "sidebar-menu-button",
    ])
      expect(getComputedStyle(slot(name)).transitionProperty, name).toBe("none")
  })
})
