"use client"

import Link from "next/link"
import { CaretLeft } from "@phosphor-icons/react"
import { Logo } from "@/components/ui/logo"
import { Heading } from "@/components/ui/heading"
import { PasswordInput } from "@/components/ui/password-input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export default function LoginSecure() {
  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-foreground px-4 py-12">
      {/* Background dot pattern */}
      <div
        className="absolute inset-0 text-background/5"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Back link */}
      <div className="absolute top-6 left-6">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-background/70 hover:bg-background/10 hover:text-background"
          asChild
        >
          <Link href="/login">
            <CaretLeft className="size-4" />
            Back
          </Link>
        </Button>
      </div>

      {/* Form */}
      <div className="relative z-1 flex w-full max-w-sm flex-col items-center gap-8 text-background">
        <Logo
          size="lg"
          className="text-background [&_div]:bg-background [&_div]:text-foreground"
        />

        <div className="flex flex-col items-center gap-2 text-center">
          <Heading level={1} className="text-background">
            Secure sign-in
          </Heading>
          <p className="text-sm text-background/70">
            Access your personal account
          </p>
        </div>

        <form className="flex w-full flex-col gap-5">
          <Field>
            <FieldLabel htmlFor="email-secure" className="text-background/80">
              Email address
            </FieldLabel>
            <Input
              id="email-secure"
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
              className="border-background/20 bg-background/10 text-background placeholder:text-background/40 focus-visible:border-background/40 focus-visible:ring-background/20"
            />
          </Field>

          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel
                htmlFor="password-secure"
                className="text-background/80"
              >
                Password
              </FieldLabel>
              <Button
                variant="link"
                className="h-auto p-0 text-xs text-background/60 hover:text-background"
                asChild
              >
                <a href="#">Forgot?</a>
              </Button>
            </div>
            <PasswordInput
              id="password-secure"
              placeholder="••••••••"
              autoComplete="current-password"
              className="border-background/20 bg-background/10 text-background placeholder:text-background/40 focus-visible:border-background/40 focus-visible:ring-background/20 [&_button]:text-background/60 [&_button:hover]:text-background"
            />
          </Field>

          <Field orientation="horizontal">
            <Checkbox
              id="remember-secure"
              className="border-background/30 data-checked:border-background data-checked:bg-background data-checked:text-foreground"
            />
            <FieldLabel
              htmlFor="remember-secure"
              className="text-background/80"
            >
              Remember me
            </FieldLabel>
          </Field>

          <Button
            type="submit"
            className="w-full bg-background text-foreground hover:bg-background/90"
          >
            Sign in
          </Button>
        </form>

        <FieldDescription className="text-center text-background/60 [&_a]:text-background/80 [&_a:hover]:text-background">
          Don&apos;t have an account?{" "}
          <a href="#" className="underline underline-offset-2">
            Sign up
          </a>
        </FieldDescription>
      </div>
    </div>
  )
}
