"use client"

import { toast } from "sonner"

import { Button } from "@/components/ui/button"

export default function DeleteProject() {
  const name = "Website redesign"

  return (
    <Button
      variant="destructive"
      onClick={() => toast.success(`"${name}" is deleted.`)}
    >
      Delete project
    </Button>
  )
}
