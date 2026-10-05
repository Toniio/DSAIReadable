"use client"

import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

async function saveProfile(data: FormData) {
  const response = await fetch("/api/profile", { method: "POST", body: data })
  if (!response.ok) throw new Error(response.statusText)
}

export default function ProfileForm() {
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await saveProfile(new FormData(event.currentTarget))
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="display-name">Display name</FieldLabel>
          <Input id="display-name" name="displayName" defaultValue="Ana" />
        </Field>
        <div className="flex gap-2">
          <Button type="submit">Save changes</Button>
        </div>
      </FieldGroup>
    </form>
  )
}
