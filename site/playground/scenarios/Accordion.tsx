import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import type { Args, Story } from "@/site/playground/types"

const FAQ = [
  {
    value: "shipping",
    question: "How long does shipping take?",
    answer: "Orders leave our warehouse within two days.",
  },
  {
    value: "returns",
    question: "Can I return an item?",
    answer: "You can return any item within 30 days.",
  },
  {
    value: "billing",
    question: "When am I billed?",
    answer: "You are billed on the first of each month.",
  },
  {
    value: "privacy",
    question: "Who can see my data?",
    answer: "Only the people you invite to your workspace.",
  },
  {
    value: "cancel",
    question: "How do I cancel my plan?",
    answer: "Open Billing in your settings, then choose Cancel plan.",
  },
]

/** A count control's value, kept in its range whatever the input holds. */
function clamp(value: Args[string], min: number, max: number): number {
  const number = Math.round(Number(value))
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : min
}

/** What the args draw: the items shown, and the one open on first render. */
function resolve(args: Args) {
  const items = FAQ.slice(0, clamp(args.items, 1, FAQ.length))
  const open =
    args.defaultValue === "none" ? undefined : String(args.defaultValue)
  return {
    items,
    open,
    multiple: args.type === "multiple",
    collapsible: args.type !== "multiple" && Boolean(args.collapsible),
    disabled: Boolean(args.disabled),
  }
}

/** Accordion: a FAQ whose opening mode, open item and length are controls. */
const story: Story = {
  controls: [
    {
      kind: "select",
      name: "type",
      options: ["single", "multiple"],
      default: "single",
    },
    { kind: "boolean", name: "collapsible", default: false },
    {
      kind: "select",
      name: "defaultValue",
      options: ["none", ...FAQ.map((item) => item.value)],
      default: "none",
    },
    { kind: "boolean", name: "disabled", default: false },
    { kind: "number", name: "items", default: 3, min: 1, max: FAQ.length },
  ],
  render: (args) => {
    const { items, open, multiple, collapsible, disabled } = resolve(args)
    const children = items.map((item) => (
      <AccordionItem key={item.value} value={item.value}>
        <AccordionTrigger>{item.question}</AccordionTrigger>
        <AccordionContent>{item.answer}</AccordionContent>
      </AccordionItem>
    ))
    // Radix reads defaultValue once: a new mode or open item remounts it.
    const key = `${args.type}-${open ?? "none"}`
    return multiple ? (
      <Accordion
        key={key}
        type="multiple"
        defaultValue={open ? [open] : undefined}
        disabled={disabled}
        className="w-80"
      >
        {children}
      </Accordion>
    ) : (
      <Accordion
        key={key}
        type="single"
        collapsible={collapsible}
        defaultValue={open}
        disabled={disabled}
        className="w-80"
      >
        {children}
      </Accordion>
    )
  },
  code: (args) => {
    const { items, open, multiple, collapsible, disabled } = resolve(args)
    const props = [
      `type="${multiple ? "multiple" : "single"}"`,
      collapsible ? "collapsible" : "",
      open ? `defaultValue=${multiple ? `{["${open}"]}` : `"${open}"`}` : "",
      disabled ? "disabled" : "",
      `className="w-80"`,
    ].filter(Boolean)
    const root =
      `    <Accordion ${props.join(" ")}>`.length <= 80
        ? `    <Accordion ${props.join(" ")}>`
        : `    <Accordion\n${props.map((prop) => `      ${prop}`).join("\n")}\n    >`
    const body = items
      .map((item) =>
        [
          `      <AccordionItem value="${item.value}">`,
          `        <AccordionTrigger>${item.question}</AccordionTrigger>`,
          `        <AccordionContent>`,
          `          ${item.answer}`,
          `        </AccordionContent>`,
          `      </AccordionItem>`,
        ].join("\n")
      )
      .join("\n")
    return `import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export function Example() {
  return (
${root}
${body}
    </Accordion>
  )
}
`
  },
}

export default story
