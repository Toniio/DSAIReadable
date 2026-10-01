"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Heading } from "@/components/ui/heading"
import { Input } from "@/components/ui/input"

export default function SettingsPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-section bg-background px-page py-section text-foreground">
      <Heading level={1}>Settings</Heading>
      <div className="flex flex-col gap-6">
        <Card>
          <form>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>How your teammates see you.</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="display-name">Display name</FieldLabel>
                  <Input
                    id="display-name"
                    name="displayName"
                    defaultValue="Ana"
                  />
                </Field>
              </FieldGroup>
            </CardContent>
            <CardFooter>
              <Button type="submit">Save changes</Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </main>
  )
}
