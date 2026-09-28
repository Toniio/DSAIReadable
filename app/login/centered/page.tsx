"use client"

import { Logo } from "@/components/ui/logo"
import { Heading } from "@/components/ui/heading"
import { PasswordInput } from "@/components/ui/password-input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export default function LoginCentered() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted/30 px-4 py-12">
      <div className="flex w-full max-w-md flex-col items-center gap-6">
        <Logo size="lg" />

        <Card className="w-full">
          <CardHeader>
            <CardTitle>
              <Heading level={2}>Sign in</Heading>
            </CardTitle>
            <CardDescription>
              Enter your credentials to access your account.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form className="flex flex-col gap-5">
              <Field>
                <FieldLabel htmlFor="email-centered">Email address</FieldLabel>
                <Input
                  id="email-centered"
                  type="email"
                  placeholder="name@company.com"
                  autoComplete="email"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="password-centered">Password</FieldLabel>
                <PasswordInput
                  id="password-centered"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </Field>

              <div className="flex items-center justify-between">
                <Field orientation="horizontal">
                  <Checkbox id="remember-centered" />
                  <FieldLabel htmlFor="remember-centered">
                    Remember me
                  </FieldLabel>
                </Field>
                <Button variant="link" className="h-auto p-0 text-xs" asChild>
                  <a href="#">Forgot password?</a>
                </Button>
              </div>

              <Button type="submit" className="w-full">
                Sign in
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center">
            <FieldDescription>
              Don&apos;t have an account? <a href="#">Sign up</a>
            </FieldDescription>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
