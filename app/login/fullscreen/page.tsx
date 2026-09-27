"use client"

import { Logo } from "@/components/ui/logo"
import { Heading } from "@/components/ui/heading"
import { PasswordInput } from "@/components/ui/password-input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export default function LoginFullscreen() {
  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-foreground px-4 py-12">
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-5"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Form */}
      <div className="relative z-1 flex w-full max-w-sm flex-col gap-8 text-background">
        <Logo
          size="lg"
          className="text-background [&_div]:bg-background [&_div]:text-foreground"
        />

        <div className="flex flex-col gap-1">
          <Heading level={1} className="text-background">
            Se connecter
          </Heading>
          <p className="text-sm text-background/70">
            Entrez vos identifiants pour accéder à votre espace.
          </p>
        </div>

        <form className="flex flex-col gap-5">
          <Field>
            <FieldLabel htmlFor="email-full" className="text-background/80">
              Adresse e-mail
            </FieldLabel>
            <Input
              id="email-full"
              type="email"
              placeholder="nom@entreprise.fr"
              autoComplete="email"
              className="border-background/20 bg-background/10 text-background placeholder:text-background/40 focus-visible:border-background/40 focus-visible:ring-background/20"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="password-full" className="text-background/80">
              Mot de passe
            </FieldLabel>
            <PasswordInput
              id="password-full"
              placeholder="••••••••"
              autoComplete="current-password"
              className="border-background/20 bg-background/10 text-background placeholder:text-background/40 focus-visible:border-background/40 focus-visible:ring-background/20 [&_button]:text-background/60 [&_button:hover]:text-background"
            />
          </Field>

          <div className="flex items-center justify-between">
            <Field orientation="horizontal">
              <Checkbox
                id="remember-full"
                className="border-background/30 data-checked:border-background data-checked:bg-background data-checked:text-foreground"
              />
              <FieldLabel
                htmlFor="remember-full"
                className="text-background/80"
              >
                Se souvenir de moi
              </FieldLabel>
            </Field>
            <Button
              variant="link"
              className="h-auto p-0 text-xs text-background/80 hover:text-background"
              asChild
            >
              <a href="#">Mot de passe oublié ?</a>
            </Button>
          </div>

          <Button
            type="submit"
            className="w-full bg-background text-foreground hover:bg-background/90"
          >
            Se connecter
          </Button>
        </form>

        <FieldDescription className="text-center text-background/60 [&_a]:text-background/80 [&_a:hover]:text-background">
          Pas encore de compte ? <a href="#">Créer un compte</a>
        </FieldDescription>
      </div>
    </div>
  )
}
