# Filter

## Metadata

| Field | Value  |
| ----- | ------ |
| Name  | filter |
| Kind  | Task   |

## Role

Narrows a collection to the entries whose attributes match what the person picks, and says how many are left.

## Usage

- **MUST** — place the filters in a bar right above the collection they narrow, never in a separate page
- **MUST** — apply a filter as soon as its value changes: no `Apply` button
- **MUST** — pick each control from its number of values (rule-20): a `ToggleGroup` `type="single"` for 2 to 5 exclusive views of the same list (`All`, `Active`, `Archived`), a `Select` for 6 to 15 values, a `Combobox` beyond 15
- **MUST** — keep the active filters in the URL query string, so a filtered view survives a reload and can be shared
- **MUST** — show the number of results in a `aria-live="polite"` region, so a screen reader hears the effect of each change
- **MUST** — show `Clear filters` only while at least one filter is active, and the same action in the [empty state](./empty-state.md) when nothing matches
- **Note** — a text query belongs to [search](./search.md); both can sit in the same bar, the search field first

## Structure

| Region     | Content                                                | Components                                    |
| ---------- | ------------------------------------------------------ | --------------------------------------------- |
| Filter bar | One control per attribute, then `Clear filters`        | `ToggleGroup`, `Select`, `Combobox`, `Button` |
| Count      | The number of entries left, with the collection's noun | a `<p>` with `aria-live="polite"`             |
| Collection | The entries that match                                 | `Table`, or `Item` inside an `ItemGroup`      |
| No results | What matched nothing, and how to widen the view        | `Empty`                                       |

## Components

| Component     | Variant / props                                    | Job                                          |
| ------------- | -------------------------------------------------- | -------------------------------------------- |
| `ToggleGroup` | `type="single"`, `variant="outline"`, `aria-label` | 2 to 5 exclusive views of the list           |
| `Select`      | a `SelectTrigger` with an `aria-label`             | One value out of 6 to 15                     |
| `Combobox`    | —                                                  | One value out of more than 15, or searchable |
| `Button`      | `variant="ghost"`                                  | `Clear filters`                              |
| `Empty`       | —                                                  | No entry matches the filters                 |

## Spacing

- **MUST** — lay the bar out as `flex flex-wrap items-center gap-2`, so it wraps on a narrow screen instead of scrolling
- **MUST** — keep the bar, the count and the collection in one `flex flex-col gap-4` column

## Content

| Element    | Write                                               | Not                                |
| ---------- | --------------------------------------------------- | ---------------------------------- |
| Control    | `Status` · `Owner` (the attribute's name)           | `Filter by status:`                |
| Clear      | `Clear filters`                                     | `Reset`, `X`                       |
| Count      | `12 projects` · `1 project`                         | `Showing 12 results`, `12 item(s)` |
| No results | `No projects match these filters` · `Clear filters` | `No data.`                         |

## Code example

```tsx
"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

const OWNERS = ["Ana", "Ben", "Chloe", "Dev", "Eli", "Femi"]

export function ProjectFilters({ count }: { count: number }) {
  const [status, setStatus] = React.useState("all")
  const [owner, setOwner] = React.useState("")
  const active = status !== "all" || owner !== ""

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
        {active && (
          <Button
            variant="ghost"
            onClick={() => {
              setStatus("all")
              setOwner("")
            }}
          >
            Clear filters
          </Button>
        )}
      </div>
      <p aria-live="polite" className="text-sm text-muted-foreground">
        {count} {count === 1 ? "project" : "projects"}
      </p>
      {/* The collection: a Table, or an ItemGroup */}
    </div>
  )
}
```

## Cross-references

- [search](./search.md) — narrows the same collection by a text query
- [empty-state](./empty-state.md) — the view when no entry matches
- [navigation](./navigation.md) — `Pagination` below a filtered collection
- [`ToggleGroup`](../components/ToggleGroup.md), [`Select`](../components/Select.md), [`Combobox`](../components/Combobox.md) — the component specs; rule-20 of `design-system.index.json` picks between them
