# Sign in

## Metadata

| Field | Value   |
| ----- | ------- |
| Name  | sign-in |
| Kind  | Task    |

## Role

Lets a person with an account prove who they are with their email and password, and recovers from a failed attempt without making them start over.

## Usage

- **MUST** — center one `Card` of `max-w-sm` on an otherwise empty page: no navigation, no sidebar
- **MUST** — ask for the email in an `Input` `type="email"` `autoComplete="email"` and the password in a `PasswordInput` `autoComplete="current-password"`, so password managers fill both
- **MUST** — on a failed attempt, show one `Alert` `variant="destructive"` above the fields, keep the email, empty the password and move the focus to the password field
- **MUST NOT** — say which of the two was wrong: the message covers both, so it does not reveal whether an account exists
- **MUST** — show a `Spinner` in the submit button while the request runs, and keep the button from sending twice
- **MUST** — link to password recovery right under the password field, and to sign-up under the card
- **MUST** — write `sign in`, `sign up` and `sign out`, never `log in` or `login` ([voice and tone](../foundations/voice-and-tone.md))

## Structure

| Region  | Content                                            | Components                                      |
| ------- | -------------------------------------------------- | ----------------------------------------------- |
| Page    | A full-height page that centers the card           | a `<main>`                                      |
| Header  | The page title and one line on what it opens       | `CardHeader`, `Heading`, `CardDescription`      |
| Error   | What failed and what to do, after a failed attempt | `Alert` `variant="destructive"`                 |
| Fields  | Email, then password and its recovery link         | `FieldGroup`, `Field`, `Input`, `PasswordInput` |
| Action  | The submit button, full width                      | `Button`, `Spinner`                             |
| Sign-up | One line and a link, below the card                | `Button` `variant="link"` with `asChild`        |

## Components

| Component       | Variant / props                                    | Job                                     |
| --------------- | -------------------------------------------------- | --------------------------------------- |
| `Card`          | `className="w-full max-w-sm"`                      | Holds the whole form                    |
| `Heading`       | `level={3}` `as="h1"`                              | The page's only `h1`, at card size      |
| `PasswordInput` | `autoComplete="current-password"`                  | The password, with its show/hide button |
| `Alert`         | `variant="destructive"`                            | The failed attempt                      |
| `Button`        | `type="submit"`, `className="w-full"`, `aria-busy` | Sends the form                          |
| `Button`        | `variant="link"`, `asChild` around a `Link`        | Password recovery and sign-up           |
| `Spinner`       | `aria-label="Signing in"`                          | The pending state of the submit button  |

## Spacing

- **MUST** — center the card with `flex min-h-screen items-center justify-center px-page` on the page
- **MUST** — let `FieldGroup` space the fields (`gap-5`); the `Alert` sits first inside it
- **MUST** — keep the card and the sign-up line in one `flex w-full max-w-sm flex-col gap-4` column

## Content

| Element  | Write                                                            | Not                                    |
| -------- | ---------------------------------------------------------------- | -------------------------------------- |
| Title    | `Sign in`                                                        | `Login`, `Welcome back!!`              |
| Submit   | `Sign in` · `Signing in…` while pending                          | `Submit`, `Log in`                     |
| Error    | `That email and password don't match. Check them and try again.` | `Invalid password.`, `User not found.` |
| Recovery | `Forgot your password?`                                          | `Reset password here`                  |
| Sign-up  | `New here? Create an account`                                    | `No account? Register now!`            |

## Code example

```tsx
"use client"

import * as React from "react"
import Link from "next/link"
import { WarningCircleIcon } from "@phosphor-icons/react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Heading } from "@/components/ui/heading"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Spinner } from "@/components/ui/spinner"

export default function SignInPage() {
  const [pending, setPending] = React.useState(false)
  const [failed, setFailed] = React.useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    // Send the form; on a failure:
    setFailed(true)
    setPending(false)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-page text-foreground">
      <div className="flex w-full max-w-sm flex-col gap-4">
        <Card>
          <CardHeader>
            <Heading level={3} as="h1">
              Sign in
            </Heading>
            <CardDescription>Pick up where you left off.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                {failed && (
                  <Alert variant="destructive">
                    <WarningCircleIcon />
                    <AlertTitle>We couldn't sign you in</AlertTitle>
                    <AlertDescription>
                      That email and password don't match. Check them and try
                      again.
                    </AlertDescription>
                  </Alert>
                )}
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <PasswordInput
                    id="password"
                    name="password"
                    autoComplete="current-password"
                    required
                  />
                  <Button variant="link" asChild className="self-start">
                    <Link href="/forgot-password">Forgot your password?</Link>
                  </Button>
                </Field>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={pending}
                  aria-busy={pending}
                >
                  {pending ? (
                    <>
                      <Spinner aria-label="Signing in" />
                      Signing in…
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
        <p className="text-center text-sm text-muted-foreground">
          New here?{" "}
          <Button variant="link" asChild>
            <Link href="/sign-up">Create an account</Link>
          </Button>
        </p>
      </div>
    </main>
  )
}
```

## Cross-references

- [form](./form.md) — the labels, validation and error messages of the fields
- [saving](./saving.md) — the pending state of a submit button
- [voice and tone](../foundations/voice-and-tone.md) — `sign in`, never `log in`
- [`Card`](../components/Card.md), [`PasswordInput`](../components/PasswordInput.md), [`Alert`](../components/Alert.md), [`Spinner`](../components/Spinner.md) — the component specs
