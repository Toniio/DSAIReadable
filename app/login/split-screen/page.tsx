"use client"

import { Logo } from "@/components/ui/logo"
import { Heading } from "@/components/ui/heading"
import { Illustration } from "@/components/ui/illustration"
import { PasswordInput } from "@/components/ui/password-input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export default function LoginSplitScreen() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Left — Illustration */}
      <Illustration className="hidden lg:flex" alt="Sign-in illustration" />

      {/* Right — Form */}
      <div className="flex flex-col items-center justify-center px-6 py-12">
        <div className="flex w-full max-w-sm flex-col gap-8">
          <Logo />

          <div className="flex flex-col gap-1">
            <Heading level={1}>Sign in</Heading>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to access your account.
            </p>
          </div>

          <form className="flex flex-col gap-5">
            <Field>
              <FieldLabel htmlFor="email-split">Email address</FieldLabel>
              <Input
                id="email-split"
                type="email"
                placeholder="name@company.com"
                autoComplete="email"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="password-split">Password</FieldLabel>
              <PasswordInput
                id="password-split"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </Field>

            <div className="flex items-center justify-between">
              <Field orientation="horizontal">
                <Checkbox id="remember-split" />
                <FieldLabel htmlFor="remember-split">Remember me</FieldLabel>
              </Field>
              <Button variant="link" className="h-auto p-0 text-xs" asChild>
                <a href="#">Forgot password?</a>
              </Button>
            </div>

            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </form>

          <FieldDescription className="text-center">
            Don&apos;t have an account? <a href="#">Sign up</a>
          </FieldDescription>
        </div>
      </div>
    </div>
  )
}
