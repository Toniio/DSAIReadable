"use client"

import * as React from "react"
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react"

import { UI_STRINGS } from "@/lib/ui-strings"
type CarouselApi = UseEmblaCarouselType[1]
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
type CarouselOptions = UseCarouselParameters[0]
type CarouselPlugin = UseCarouselParameters[1]

export type CarouselConfig = {
  opts?: CarouselOptions
  plugins?: CarouselPlugin
  orientation?: "horizontal" | "vertical"
  setApi?: (api: CarouselApi) => void
}

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: ReturnType<typeof useEmblaCarousel>[1]
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
} & CarouselConfig

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

/**
 * Reads the carousel state, the Embla `api` and the scroll handlers, from a component rendered inside a `Carousel`.
 *
 * @example
 * const { scrollNext, canScrollNext } = useCarousel()
 */
function useCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }

  return context
}

/**
 * A scroller that moves between slides with buttons or the arrow keys; set `orientation` for a horizontal or vertical track.
 *
 * @example
 * <Carousel aria-label="Featured products">
 *   <CarouselContent>
 *     <CarouselItem>Trail shoes</CarouselItem>
 *     <CarouselItem>Rain jacket</CarouselItem>
 *   </CarouselContent>
 *   <CarouselPrevious />
 *   <CarouselNext />
 * </Carousel>
 */
function Carousel({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & CarouselConfig) {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y",
    },
    plugins
  )
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)

  const onSelect = React.useCallback((api: CarouselApi) => {
    if (!api) return
    setCanScrollPrev(api.canScrollPrev())
    setCanScrollNext(api.canScrollNext())
  }, [])

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev()
  }, [api])

  const scrollNext = React.useCallback(() => {
    api?.scrollNext()
  }, [api])

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault()
        scrollPrev()
      } else if (event.key === "ArrowRight") {
        event.preventDefault()
        scrollNext()
      }
    },
    [scrollPrev, scrollNext]
  )

  React.useEffect(() => {
    if (!api || !setApi) return
    setApi(api)
  }, [api, setApi])

  React.useEffect(() => {
    if (!api) return
    // Embla is an imperative library: the initial slide state can only be read
    // once the carousel is mounted, so this first sync is unavoidable.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    onSelect(api)
    api.on("reInit", onSelect)
    api.on("select", onSelect)

    return () => {
      api?.off("select", onSelect)
    }
  }, [api, onSelect])

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api: api,
        opts,
        orientation:
          orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}
    >
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn("relative", className)}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  )
}

/**
 * The scrolling track of a `Carousel` that holds every `CarouselItem`.
 *
 * @example
 * <Carousel aria-label="Customer stories">
 *   <CarouselContent>
 *     <CarouselItem>Story one</CarouselItem>
 *   </CarouselContent>
 * </Carousel>
 */
function CarouselContent({ className, ...props }: React.ComponentProps<"div">) {
  const { carouselRef, orientation } = useCarousel()

  return (
    <div
      ref={carouselRef}
      className="overflow-hidden"
      data-slot="carousel-content"
    >
      <div
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className
        )}
        {...props}
      />
    </div>
  )
}

/**
 * One slide of a `Carousel`, announced to screen readers as a slide of the carousel.
 *
 * @example
 * <CarouselContent>
 *   <CarouselItem>Our first customer story</CarouselItem>
 * </CarouselContent>
 */
function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
  const { orientation } = useCarousel()

  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className
      )}
      {...props}
    />
  )
}

/**
 * The button that scrolls a `Carousel` back one slide; it disables itself at the first slide.
 *
 * @example
 * <Carousel aria-label="Photos">
 *   <CarouselContent>
 *     <CarouselItem>Photo one</CarouselItem>
 *   </CarouselContent>
 *   <CarouselPrevious />
 * </Carousel>
 */
function CarouselPrevious({
  className,
  srLabel = UI_STRINGS.carousel.previous,
  variant = "outline",
  size = "icon-sm",
  ...props
}: React.ComponentProps<typeof Button> & { srLabel?: string }) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel()

  return (
    <Button
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      className={cn(
        "absolute touch-manipulation",
        orientation === "horizontal"
          ? "inset-y-0 -left-12 my-auto"
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <CaretLeftIcon />
      <span className="sr-only">{srLabel}</span>
    </Button>
  )
}

/**
 * The button that scrolls a `Carousel` forward one slide; it disables itself at the last slide.
 *
 * @example
 * <Carousel aria-label="Photos">
 *   <CarouselContent>
 *     <CarouselItem>Photo one</CarouselItem>
 *   </CarouselContent>
 *   <CarouselNext />
 * </Carousel>
 */
function CarouselNext({
  className,
  srLabel = UI_STRINGS.carousel.next,
  variant = "outline",
  size = "icon-sm",
  ...props
}: React.ComponentProps<typeof Button> & { srLabel?: string }) {
  const { orientation, scrollNext, canScrollNext } = useCarousel()

  return (
    <Button
      data-slot="carousel-next"
      variant={variant}
      size={size}
      className={cn(
        "absolute touch-manipulation",
        orientation === "horizontal"
          ? "inset-y-0 -right-12 my-auto"
          : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <CaretRightIcon />
      <span className="sr-only">{srLabel}</span>
    </Button>
  )
}

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  useCarousel,
}

export type CarouselContentProps = React.ComponentProps<typeof CarouselContent>
export type CarouselItemProps = React.ComponentProps<typeof CarouselItem>
export type CarouselNextProps = React.ComponentProps<typeof CarouselNext>
export type CarouselPreviousProps = React.ComponentProps<
  typeof CarouselPrevious
>
export type CarouselProps = React.ComponentProps<typeof Carousel>
