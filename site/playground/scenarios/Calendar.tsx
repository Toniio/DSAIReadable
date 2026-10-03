"use client"

import { useState } from "react"
import type { DateRange } from "react-day-picker"

import { Calendar } from "@/components/ui/calendar"
import type { Args, Story } from "@/site/playground/types"

const MODES = ["single", "multiple", "range"] as const
const CAPTIONS = [
  "label",
  "dropdown",
  "dropdown-months",
  "dropdown-years",
] as const
const BUTTON_VARIANTS = [
  "default",
  "outline",
  "secondary",
  "ghost",
  "destructive",
  "link",
] as const

type Mode = (typeof MODES)[number]
type Caption = (typeof CAPTIONS)[number]
type ButtonVariant = (typeof BUTTON_VARIANTS)[number]

/** Fixed dates: the canvas opens on October 2026 whatever the day. */
const MONTH = new Date(2026, 9)
/** Weekdays only, so they stay selectable when weekends are disabled. */
const SINGLE = new Date(2026, 9, 8)
const MULTIPLE = [new Date(2026, 9, 6), SINGLE, new Date(2026, 9, 14)]
const RANGE: DateRange = {
  from: new Date(2026, 9, 12),
  to: new Date(2026, 9, 16),
}
const WEEKENDS = { dayOfWeek: [0, 6] }

/** A count control's value, kept in its range whatever the input holds. */
function clamp(value: Args[string], min: number, max: number): number {
  const number = Math.round(Number(value))
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : min
}

function resolve(args: Args) {
  return {
    mode: MODES.includes(args.mode as Mode) ? (args.mode as Mode) : "single",
    captionLayout: CAPTIONS.includes(args.captionLayout as Caption)
      ? (args.captionLayout as Caption)
      : "label",
    showOutsideDays: Boolean(args.showOutsideDays),
    buttonVariant: BUTTON_VARIANTS.includes(args.buttonVariant as ButtonVariant)
      ? (args.buttonVariant as ButtonVariant)
      : "ghost",
    showWeekNumber: Boolean(args.showWeekNumber),
    disabled: Boolean(args.disabled),
    numberOfMonths: clamp(args.numberOfMonths, 1, 3),
  }
}

/**
 * The calendar with its selection held in state. It stands alone, as in the
 * spec's example: in a Card, whose fill is the same token as `bg-muted`, the
 * range's middle days and today's fill would not show.
 */
function CalendarStory({
  mode,
  disabled,
  ...props
}: ReturnType<typeof resolve>) {
  const [day, setDay] = useState<Date | undefined>(SINGLE)
  const [days, setDays] = useState<Date[] | undefined>(MULTIPLE)
  const [range, setRange] = useState<DateRange | undefined>(RANGE)
  const shared = {
    ...props,
    defaultMonth: MONTH,
    disabled: disabled ? WEEKENDS : undefined,
  }
  if (mode === "range")
    return (
      <Calendar {...shared} mode="range" selected={range} onSelect={setRange} />
    )
  if (mode === "multiple")
    return (
      <Calendar
        {...shared}
        mode="multiple"
        selected={days}
        onSelect={setDays}
      />
    )
  return <Calendar {...shared} mode="single" selected={day} onSelect={setDay} />
}

/** The state each mode holds, as the Code panel writes it. */
const STATE: Record<Mode, string> = {
  single: `const [date, setDate] = useState<Date | undefined>(new Date(2026, 9, 8))`,
  multiple: `const [dates, setDates] = useState<Date[] | undefined>([
    new Date(2026, 9, 6),
    new Date(2026, 9, 8),
    new Date(2026, 9, 14),
  ])`,
  range: `const [range, setRange] = useState<DateRange | undefined>({
    from: new Date(2026, 9, 12),
    to: new Date(2026, 9, 16),
  })`,
}

const SELECTION: Record<Mode, string[]> = {
  single: ["selected={date}", "onSelect={setDate}"],
  multiple: ["selected={dates}", "onSelect={setDates}"],
  range: ["selected={range}", "onSelect={setRange}"],
}

/**
 * Calendar: a date picker opened on October 2026. Its selection
 * mode, caption, navigation buttons and disabled weekends are controls.
 */
const story: Story = {
  controls: [
    { kind: "select", name: "mode", options: [...MODES], default: "single" },
    {
      kind: "select",
      name: "captionLayout",
      options: [...CAPTIONS],
      default: "label",
    },
    { kind: "boolean", name: "showOutsideDays", default: true },
    {
      kind: "select",
      name: "buttonVariant",
      options: [...BUTTON_VARIANTS],
      default: "ghost",
    },
    { kind: "boolean", name: "showWeekNumber", default: false },
    { kind: "boolean", name: "disabled", default: false },
    { kind: "number", name: "numberOfMonths", default: 1, min: 1, max: 3 },
  ],
  layout: "padded",
  render: (args) => <CalendarStory {...resolve(args)} />,
  code: (args) => {
    const {
      mode,
      captionLayout,
      showOutsideDays,
      buttonVariant,
      showWeekNumber,
      disabled,
      numberOfMonths,
    } = resolve(args)
    const props = [
      `mode="${mode}"`,
      ...SELECTION[mode],
      "defaultMonth={new Date(2026, 9)}",
      ...(captionLayout === "label"
        ? []
        : [`captionLayout="${captionLayout}"`]),
      ...(showOutsideDays ? [] : ["showOutsideDays={false}"]),
      ...(buttonVariant === "ghost"
        ? []
        : [`buttonVariant="${buttonVariant}"`]),
      ...(showWeekNumber ? ["showWeekNumber"] : []),
      ...(disabled ? ["disabled={{ dayOfWeek: [0, 6] }}"] : []),
      ...(numberOfMonths === 1 ? [] : [`numberOfMonths={${numberOfMonths}}`]),
    ]
    return `"use client"

import { useState } from "react"
${mode === "range" ? `import type { DateRange } from "react-day-picker"\n` : ""}
import { Calendar } from "@/components/ui/calendar"

export function Example() {
  ${STATE[mode]}

  return (
    <Calendar
${props.map((prop) => `      ${prop}`).join("\n")}
    />
  )
}
`
  },
}

export default story
