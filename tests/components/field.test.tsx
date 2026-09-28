import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

import { axeViolations } from "../axe"

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
