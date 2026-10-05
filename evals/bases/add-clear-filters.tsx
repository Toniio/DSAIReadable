"use client"

import * as React from "react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

const OWNERS = ["Ana", "Ben", "Chloe", "Dev", "Eli", "Femi"]

export default function ProjectFilters({ count = 12 }: { count?: number }) {
  const [status, setStatus] = React.useState("all")
  const [owner, setOwner] = React.useState("")

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <ToggleGroup
          type="single"
          variant="outline"
          value={status}
          onValueChange={(value) => setStatus(value || "all")}
          aria-label="Status"
        >
          <ToggleGroupItem value="all">All</ToggleGroupItem>
          <ToggleGroupItem value="active">Active</ToggleGroupItem>
          <ToggleGroupItem value="archived">Archived</ToggleGroupItem>
        </ToggleGroup>
        <Select value={owner} onValueChange={setOwner}>
          <SelectTrigger aria-label="Owner">
            <SelectValue placeholder="Owner" />
          </SelectTrigger>
          <SelectContent>
            {OWNERS.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <p aria-live="polite" className="text-sm text-muted-foreground">
        {count} {count === 1 ? "project" : "projects"}
      </p>
      {/* The collection: a Table, or an ItemGroup */}
    </div>
  )
}
