"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export default function AccountForm() {
  const [emailError, setEmailError] = React.useState("")

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const email = String(new FormData(event.currentTarget).get("email"))
    setEmailError(
      email.includes("@")
        ? ""
        : "Enter an email address, like name@example.com."
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="max-w-2xl">
      <FieldGroup>
        <FieldSet>
          <FieldLegend>Contact</FieldLegend>
          <FieldGroup>
            <Field data-invalid={emailError ? "true" : undefined}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                aria-invalid={emailError ? true : undefined}
              />
              <FieldError>{emailError}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="company">Company (optional)</FieldLabel>
              <Input id="company" name="company" autoComplete="organization" />
            </Field>
          </FieldGroup>
        </FieldSet>
        <div className="flex gap-2">
          <Button type="submit">Create account</Button>
        </div>
      </FieldGroup>
    </form>
  )
}
