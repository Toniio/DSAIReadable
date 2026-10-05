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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function ProjectDetails() {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    // Send the changes
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Project details</CardTitle>
          <CardDescription>
            Everyone on the project sees these details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="project-name">Name</FieldLabel>
              <Input id="project-name" name="name" defaultValue="Q3 launch" />
            </Field>
            <Field>
              <FieldLabel htmlFor="project-summary">Summary</FieldLabel>
              <Textarea
                id="project-summary"
                name="summary"
                defaultValue="The campaign for the new pricing."
              />
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter>
          <Button type="submit">Save changes</Button>
        </CardFooter>
      </form>
    </Card>
  )
}
