import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { userEvent } from "vitest/browser"

import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import { UI_STRINGS } from "@/lib/ui-strings"

function Example({
  setApi,
  startIndex = 0,
}: {
  setApi?: (api: CarouselApi) => void
  startIndex?: number
}) {
  return (
    <>
      <Button variant="outline">Before</Button>
      <Carousel
        className="mx-12 w-full max-w-xs"
        aria-label="Featured products"
        opts={{ startIndex }}
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
      <Button variant="outline">After</Button>
    </>
  )
}

function previous() {
  return screen.getByRole("button", {
    name: UI_STRINGS.carousel.previous,
  }) as HTMLButtonElement
}

function next() {
  return screen.getByRole("button", {
    name: UI_STRINGS.carousel.next,
  }) as HTMLButtonElement
}

describe("Carousel", () => {
  it("role: a region described as a carousel, each slide a group described as a slide", () => {
    render(<Example />)
    const region = screen.getByRole("region", { name: "Featured products" })
    expect(region.getAttribute("aria-roledescription")).toBe("carousel")
    const slides = screen.getAllByRole("group")
    expect(slides).toHaveLength(3)
    for (const slide of slides) {
      expect(slide.getAttribute("aria-roledescription")).toBe("slide")
      expect(region.contains(slide)).toBe(true)
    }
  })

  it("accessible name: the carousel is named by its aria-label, its buttons from UI_STRINGS", () => {
    render(<Example />)
    expect(
      screen.getByRole("region", { name: "Featured products" })
    ).toBeTruthy()
    expect(previous()).toBeTruthy()
    expect(next()).toBeTruthy()
  })

  it("ArrowLeft / ArrowRight: previous / next slide, while focus is inside the carousel", async () => {
    let api: CarouselApi
    render(<Example setApi={(value) => (api = value)} />)
    await expect.poll(() => api?.selectedScrollSnap()).toBe(0)

    // Focus outside the carousel: the arrows do not move it.
    screen.getByRole("button", { name: "Before" }).focus()
    await userEvent.keyboard("{ArrowRight}")
    expect(api!.selectedScrollSnap()).toBe(0)

    await expect.poll(() => next().disabled).toBe(false)
    next().focus()
    await userEvent.keyboard("{ArrowRight}")
    await expect.poll(() => api!.selectedScrollSnap()).toBe(1)
    await userEvent.keyboard("{ArrowLeft}")
    await expect.poll(() => api!.selectedScrollSnap()).toBe(0)
  })

  it("Tab: reaches the previous / next buttons and the slides' content", async () => {
    render(<Example startIndex={1} />)
    await expect.poll(() => previous().disabled).toBe(false)
    await expect.poll(() => next().disabled).toBe(false)

    screen.getByRole("button", { name: "Before" }).focus()
    await userEvent.tab()
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "View slide 2" })
    )
    await userEvent.tab()
    expect(document.activeElement).toBe(previous())
    await userEvent.tab()
    expect(document.activeElement).toBe(next())
    await userEvent.tab()
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "After" })
    )
  })
})
