import { cleanup, render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { describe, expect, it } from "vitest"
import { userEvent } from "vitest/browser"

import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"

import { axeViolations } from "../axe"
import { ringOf, unmarkedTabStops } from "../focus"

function EmailField({ error }: { error?: string }) {
  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel htmlFor="email">Email</FieldLabel>
      <Input
        id="email"
        type="email"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? "email-hint email-error" : "email-hint"}
      />
      <FieldDescription id="email-hint">
        We never share your address.
      </FieldDescription>
      {error && <FieldError id="email-error">{error}</FieldError>}
    </Field>
  )
}

describe("Field", () => {
  it("groups its control, named by the label and described by the description", () => {
    render(<EmailField />)
    expect(screen.getByRole("group").dataset.slot).toBe("field")
    const input = screen.getByRole("textbox", {
      name: "Email",
      description: "We never share your address.",
    })
    expect(input.getAttribute("aria-invalid")).toBeNull()
  })

  it("applies the orientation variant", () => {
    render(<Field orientation="horizontal">content</Field>)
    const field = screen.getByRole("group")
    expect(field.dataset.orientation).toBe("horizontal")
    expect(field.classList).toContain("flex-row")
    expect(field.classList).not.toContain("flex-col")
  })

  it("announces an error and ties it to the invalid control", () => {
    render(<EmailField error="Enter a valid email address." />)
    expect(screen.getByRole("alert").textContent).toBe(
      "Enter a valid email address."
    )
    const input = screen.getByRole("textbox", {
      name: "Email",
      description: "We never share your address. Enter a valid email address.",
    })
    expect(input.getAttribute("aria-invalid")).toBe("true")
  })

  it("renders no alert without an error", () => {
    render(<FieldError errors={[]} />)
    expect(screen.queryByRole("alert")).toBeNull()
  })

  it("deduplicates errors and lists them when several remain", () => {
    render(
      <FieldError
        errors={[
          { message: "Required." },
          { message: "Too short." },
          { message: "Required." },
        ]}
      />
    )
    const items = screen.getAllByRole("listitem").map((li) => li.textContent)
    expect(items).toEqual(["Required.", "Too short."])
  })

  it("names a radio group by its legend", () => {
    render(
      <FieldSet>
        <FieldLegend>Plan</FieldLegend>
        <RadioGroup defaultValue="free">
          <Field orientation="horizontal">
            <RadioGroupItem value="free" id="plan-free" />
            <FieldLabel htmlFor="plan-free">Free</FieldLabel>
          </Field>
        </RadioGroup>
      </FieldSet>
    )
    expect(screen.getByRole("group", { name: "Plan" }).tagName).toBe("FIELDSET")
    expect(screen.getByRole("radio", { name: "Free" })).toBeTruthy()
  })

  it("has no axe violations, valid or in error", async () => {
    render(
      <>
        <EmailField />
        <Field>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <Input id="name" aria-invalid aria-describedby="name-error" />
          <FieldError id="name-error">Required.</FieldError>
        </Field>
      </>
    )
    expect(await axeViolations()).toEqual([])
  })
})

/**
 * A choice card is a FieldLabel that wraps a Field: the card draws the only
 * focus ring (border-ring and a ring), and the control inside it draws none and
 * keeps its resting border. A FieldLabel that wraps a control directly is not a
 * card: the control keeps its own ring there.
 */
const controls = {
  Checkbox: {
    role: "checkbox",
    render: (props: { checked?: boolean; invalid?: boolean }) => (
      <Checkbox
        id="choice"
        defaultChecked={props.checked}
        aria-invalid={props.invalid || undefined}
      />
    ),
  },
  RadioGroupItem: {
    role: "radio",
    render: (props: { checked?: boolean; invalid?: boolean }) => (
      <RadioGroup defaultValue={props.checked ? "pro" : undefined}>
        <RadioGroupItem
          value="pro"
          id="choice"
          aria-invalid={props.invalid || undefined}
        />
      </RadioGroup>
    ),
  },
  Switch: {
    role: "switch",
    render: (props: { checked?: boolean; invalid?: boolean }) => (
      <Switch
        id="choice"
        defaultChecked={props.checked}
        aria-invalid={props.invalid || undefined}
      />
    ),
  },
}

function ChoiceCard({ children }: { children: ReactNode }) {
  return (
    <FieldLabel htmlFor="choice">
      <Field orientation="horizontal">
        <FieldContent>
          <FieldTitle>Pro plan</FieldTitle>
          <FieldDescription>Unlimited projects for your team.</FieldDescription>
        </FieldContent>
        {children}
      </Field>
    </FieldLabel>
  )
}

async function tabTo(role: string) {
  const control = screen.getByRole(role)
  const rest = getComputedStyle(control).borderTopColor
  await userEvent.keyboard("{Tab}")
  await new Promise(requestAnimationFrame)
  expect(document.activeElement).toBe(control)
  return { control, rest }
}

describe("Field, choice card", () => {
  const states = [
    ["unchecked", {}],
    ["checked", { checked: true }],
    ["invalid", { invalid: true }],
  ] as const

  describe.each(Object.entries(controls))("%s", (_, { role, render: draw }) => {
    describe.each(states)("%s", (_state, props) => {
      it.each(["light", "dark"] as const)(
        "draws one focus ring, the card's, in %s",
        async (theme) => {
          document.documentElement.classList.toggle("dark", theme === "dark")
          render(<ChoiceCard>{draw(props)}</ChoiceCard>)
          const { control, rest } = await tabTo(role)
          const card = screen.getByText("Pro plan").closest("label")!
          expect(ringOf(card), "the card's ring").toBeGreaterThan(0)
          expect(ringOf(control), "the control's ring").toBe(0)
          expect(getComputedStyle(control).borderTopColor).toBe(rest)
        }
      )
    })
  })

  it.each(Object.keys(controls))(
    "%s: the card's indicator keeps a solid 3:1 part, light and dark",
    async (name) => {
      const { render: draw } = controls[name as keyof typeof controls]
      render(<ChoiceCard>{draw({})}</ChoiceCard>)
      expect(await unmarkedTabStops(5)).toEqual([])
    }
  )

  it.each(["Checkbox", "Switch"] as const)(
    "%s in a FieldLabel that is not a card keeps its own ring, light and dark",
    async (name) => {
      const { role, render: draw } = controls[name]
      for (const theme of ["light", "dark"] as const) {
        document.documentElement.classList.toggle("dark", theme === "dark")
        render(
          <FieldLabel htmlFor="choice">
            {draw({})}
            Airplane mode
          </FieldLabel>
        )
        const { control } = await tabTo(role)
        expect(ringOf(control), `${theme} ring`).toBeGreaterThan(0)
        cleanup()
      }
    }
  )

  it.each(["light", "dark"] as const)(
    "a focused checked Checkbox outside a card draws border-ring in %s, as it does alone",
    async (theme) => {
      document.documentElement.classList.toggle("dark", theme === "dark")
      render(<Checkbox id="choice" defaultChecked aria-label="Alone" />)
      const alone = (await tabTo("checkbox")).control
      const expected = getComputedStyle(alone).borderTopColor
      cleanup()

      render(
        <FieldLabel htmlFor="choice">
          <Checkbox id="choice" defaultChecked />
          Accept the terms
        </FieldLabel>
      )
      const { control } = await tabTo("checkbox")
      expect(getComputedStyle(control).borderTopColor).toBe(expected)
    }
  )
})

describe("Field, disabled neighbor", () => {
  it("does not dim an enabled Checkbox because another control of its Field is disabled", () => {
    render(
      <Field orientation="horizontal">
        <Checkbox id="other" aria-label="Other" />
        <Input aria-label="Other, please specify" disabled />
      </Field>
    )
    expect(getComputedStyle(screen.getByRole("checkbox")).opacity).toBe("1")
  })

  it("still dims a disabled Checkbox", () => {
    render(
      <Field orientation="horizontal">
        <Checkbox id="other" aria-label="Other" disabled />
      </Field>
    )
    expect(getComputedStyle(screen.getByRole("checkbox")).opacity).toBe("0.5")
  })
})
