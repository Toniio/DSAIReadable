"use client"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { cn } from "@/lib/utils"
import type { Args, Story } from "@/site/playground/types"

const PRODUCTS = [
  "Trail shoes",
  "Rain jacket",
  "Hiking poles",
  "Headlamp",
  "Water filter",
  "Camp stove",
  "Sleeping bag",
  "Day pack",
  "Compass",
  "First aid kit",
]

/** The share of the track a slide takes, by slides per view. */
const BASIS: Record<string, string> = {
  "1": "",
  "2": "basis-1/2",
  "3": "basis-1/3",
}

const ALIGNS = ["start", "center", "end"] as const
type Align = (typeof ALIGNS)[number]

/** A count control's value, kept in its range whatever the input holds. */
function clamp(value: Args[string], min: number, max: number): number {
  const number = Math.round(Number(value))
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : min
}

function resolve(args: Args) {
  const vertical = args.orientation === "vertical"
  return {
    orientation: vertical ? ("vertical" as const) : ("horizontal" as const),
    vertical,
    loop: Boolean(args.loop),
    align: ALIGNS.includes(args.align as Align)
      ? (args.align as Align)
      : "center",
    products: PRODUCTS.slice(0, clamp(args.items, 1, PRODUCTS.length)),
    basis: BASIS[String(args.perView)] ?? "",
  }
}

const SLIDE =
  "flex items-center justify-center border bg-card p-6 text-sm font-medium"

/**
 * Carousel: a product gallery. The previous and next buttons sit outside the
 * track, so the frame keeps room for them on both sides.
 */
const story: Story = {
  controls: [
    {
      kind: "select",
      name: "orientation",
      options: ["horizontal", "vertical"],
      default: "horizontal",
    },
    { kind: "boolean", name: "loop", default: false },
    {
      kind: "select",
      name: "align",
      options: [...ALIGNS],
      default: "center",
    },
    { kind: "number", name: "items", default: 5, min: 1, max: PRODUCTS.length },
    {
      kind: "select",
      name: "perView",
      options: Object.keys(BASIS),
      default: "1",
    },
  ],
  layout: "padded",
  render: (args) => {
    const { orientation, vertical, loop, align, products, basis } =
      resolve(args)
    return (
      <div className={vertical ? "py-12" : "px-12"}>
        <Carousel
          // Embla sets its axis once: a new orientation remounts it.
          key={orientation}
          orientation={orientation}
          opts={{ loop, align }}
          className="mx-auto w-full max-w-xs"
          aria-label="Featured products"
        >
          <CarouselContent className={vertical ? "h-56" : undefined}>
            {products.map((product) => (
              <CarouselItem key={product} className={basis || undefined}>
                <div
                  className={cn(SLIDE, vertical ? "h-full" : "aspect-square")}
                >
                  {product}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    )
  },
  code: (args) => {
    const { orientation, vertical, loop, align, products, basis } =
      resolve(args)
    const options = [
      ...(align === "center" ? [] : [`align: "${align}"`]),
      ...(loop ? ["loop: true"] : []),
    ]
    const props = [
      ...(vertical ? [`orientation="${orientation}"`] : []),
      ...(options.length ? [`opts={{ ${options.join(", ")} }}`] : []),
      `className="mx-auto w-full max-w-xs"`,
      `aria-label="Featured products"`,
    ]
    const item = basis
      ? `<CarouselItem key={product} className="${basis}">`
      : `<CarouselItem key={product}>`
    const slide = cn(SLIDE, vertical ? "h-full" : "aspect-square")
    return `import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

const PRODUCTS = [
${products.map((product) => `  "${product}",`).join("\n")}
]

export function Example() {
  return (
    <div className="${vertical ? "py-12" : "px-12"}">
      <Carousel
${props.map((prop) => `        ${prop}`).join("\n")}
      >
        ${vertical ? `<CarouselContent className="h-56">` : "<CarouselContent>"}
          {PRODUCTS.map((product) => (
            ${item}
              <div className="${slide}">
                {product}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  )
}
`
  },
}

export default story
