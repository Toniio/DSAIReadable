import { useId, useState } from "react"

import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import type { Args, Story } from "@/site/playground/types"

/** The bounds and step, kept valid: max above min, a step that fits in between. */
function bounds(args: Args) {
  const min = Number(args.min) || 0
  const max = Math.max(min + 1, Number(args.max) || 0)
  const step = Math.min(max - min, Math.max(1, Number(args.step) || 1))
  return { min, max, step }
}

/** A start value on the step grid: the middle, or the quarters for a range. */
function startValue(args: Args): number[] {
  const { min, max, step } = bounds(args)
  const at = (share: number) =>
    min + Math.round(((max - min) * share) / step) * step
  return args.range ? [at(0.25), at(0.75)] : [at(0.5)]
}

/** An array literal as Prettier writes it: `[25, 75]`. */
function list(values: (string | number)[]): string {
  return `[${values.map((value) => JSON.stringify(value)).join(", ")}]`
}

function copyFor(args: Args) {
  return args.range
    ? {
        label: "Price range",
        thumbLabels: ["Minimum price", "Maximum price"],
        format: (values: number[]) => `$${values[0]} to $${values[1]}`,
      }
    : {
        label: "Volume",
        thumbLabels: undefined,
        format: (values: number[]) => String(values[0]),
      }
}

function LabeledSlider({ args }: { args: Args }) {
  const id = useId()
  const [values, setValues] = useState(() => startValue(args))
  const { min, max, step } = bounds(args)
  const copy = copyFor(args)
  const vertical = args.orientation === "vertical"
  return (
    <div
      className={cn("flex flex-col gap-3", vertical ? "items-center" : "w-64")}
    >
      <div className="flex items-center justify-between gap-4">
        <Label id={`${id}-label`}>{copy.label}</Label>
        <span className="text-xs text-muted-foreground tabular-nums">
          {copy.format(values)}
        </span>
      </div>
      <Slider
        defaultValue={startValue(args)}
        onValueChange={setValues}
        min={min}
        max={max}
        step={step}
        orientation={vertical ? "vertical" : undefined}
        disabled={Boolean(args.disabled)}
        aria-labelledby={`${id}-label`}
        thumbLabels={copy.thumbLabels}
      />
    </div>
  )
}

/** Slider: a volume, or a price range with two thumbs, its value shown as text. */
const story: Story = {
  controls: [
    { kind: "boolean", name: "range", default: false },
    { kind: "number", name: "min", default: 0, min: 0, max: 1000 },
    { kind: "number", name: "max", default: 100, min: 1, max: 1000 },
    { kind: "number", name: "step", default: 1, min: 1, max: 100 },
    {
      kind: "select",
      name: "orientation",
      options: ["horizontal", "vertical"],
      default: "horizontal",
    },
    { kind: "boolean", name: "disabled", default: false },
  ],
  render: (args) => (
    <LabeledSlider
      key={[args.range, args.min, args.max, args.step].join("-")}
      args={args}
    />
  ),
  code: (args) => {
    const { min, max, step } = bounds(args)
    const copy = copyFor(args)
    const vertical = args.orientation === "vertical"
    const start = startValue(args)
    const props = [
      `defaultValue={${list(start)}}`,
      `onValueChange={setValues}`,
      min === 0 ? "" : `min={${min}}`,
      max === 100 ? "" : `max={${max}}`,
      step === 1 ? "" : `step={${step}}`,
      vertical ? `orientation="vertical"` : "",
      args.disabled ? "disabled" : "",
      `aria-labelledby="${args.range ? "price" : "volume"}-label"`,
      copy.thumbLabels ? `thumbLabels={${list(copy.thumbLabels)}}` : "",
    ].filter(Boolean)
    const shown = args.range ? "`$${values[0]} to $${values[1]}`" : "values[0]"
    return `import { useState } from "react"

import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

export function Example() {
  const [values, setValues] = useState(${list(start)})
  return (
    <div className="${vertical ? "flex flex-col items-center gap-3" : "flex w-64 flex-col gap-3"}">
      <div className="flex items-center justify-between gap-4">
        <Label id="${args.range ? "price" : "volume"}-label">${copy.label}</Label>
        <span className="text-xs text-muted-foreground tabular-nums">
          {${shown}}
        </span>
      </div>
      <Slider
${props.map((prop) => `        ${prop}`).join("\n")}
      />
    </div>
  )
}
`
  },
}

export default story
