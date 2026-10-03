# Search

## Metadata

| Field | Value  |
| ----- | ------ |
| Name  | search |
| Kind  | Task   |

## Role

Finds the entries of a collection that match a text query, and says plainly when nothing does.

## Usage

- **MUST** — build the field from `InputGroup`: a leading `MagnifyingGlassIcon`, an `InputGroupInput` with `type="search"`, and a clear button once the field holds text
- **MUST** — give the field an accessible name that names the collection: `aria-label="Search projects"`; the placeholder never stands in for it
- **MUST** — update the results as the person types, 300 ms after the last keystroke, and at once on `Enter`
- **MUST** — show the results in the collection's own presentation (`Table` or `ItemGroup`), with their count in a `aria-live="polite"` region
- **MUST** — when nothing matches, show an `Empty` that repeats the query and offers `Clear search`
- **MUST** — keep the query in the URL query string (`?q=`), so the results survive a reload
- **Note** — a search across the whole product, opened from anywhere with a shortcut, is a `CommandDialog`: see the [`Command`](../components/Command.md) spec

## Structure

| Region     | Content                                       | Components                                                             |
| ---------- | --------------------------------------------- | ---------------------------------------------------------------------- |
| Field      | The query, its icon and its clear button      | `InputGroup`, `InputGroupAddon`, `InputGroupInput`, `InputGroupButton` |
| Count      | The number of results                         | a `<p>` with `aria-live="polite"`                                      |
| Results    | The entries that match                        | `Item` inside an `ItemGroup`, or `Table`                               |
| No results | The query that matched nothing, and a way out | `Empty`                                                                |

## Components

| Component          | Variant / props                               | Job                                             |
| ------------------ | --------------------------------------------- | ----------------------------------------------- |
| `InputGroup`       | —                                             | Holds the icon, the field and the clear button  |
| `InputGroupInput`  | `type="search"`, `aria-label`                 | The query                                       |
| `InputGroupButton` | `size="icon-xs"`, `aria-label="Clear search"` | Empties the field and puts the focus back in it |
| `ItemGroup`        | —                                             | The results                                     |
| `Empty`            | —                                             | Nothing matches the query                       |

## Spacing

- **MUST** — cap the field at `max-w-sm` above a collection; it takes the full width inside a `Sheet` or a narrow column
- **MUST** — keep the field, the count and the results in one `flex flex-col gap-4` column

## Content

| Element     | Write                                                                | Not                      |
| ----------- | -------------------------------------------------------------------- | ------------------------ |
| Placeholder | `Search projects…`                                                   | `Search...`, `Type here` |
| Count       | `3 results for "launch"`                                             | `Results: 3`             |
| No results  | `No results for "lanch"` · `Check the spelling or try another word.` | `0 results found.`       |
| Clear       | `Clear search`                                                       | `Reset`                  |

## Code example

```tsx
"use client"

import * as React from "react"
import { MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Item, ItemContent, ItemGroup, ItemTitle } from "@/components/ui/item"

export function ProjectSearch({ projects }: { projects: string[] }) {
  const [query, setQuery] = React.useState("")
  const results = projects.filter((name) =>
    name.toLowerCase().includes(query.trim().toLowerCase())
  )

  return (
    <div className="flex flex-col gap-4">
      <InputGroup className="max-w-sm">
        <InputGroupAddon>
          <MagnifyingGlassIcon />
        </InputGroupAddon>
        <InputGroupInput
          type="search"
          aria-label="Search projects"
          placeholder="Search projects…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        {query && (
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              size="icon-xs"
              aria-label="Clear search"
              onClick={() => setQuery("")}
            >
              <XIcon />
            </InputGroupButton>
          </InputGroupAddon>
        )}
      </InputGroup>
      {query && (
        <p aria-live="polite" className="text-sm text-muted-foreground">
          {results.length} {results.length === 1 ? "result" : "results"} for
          &quot;{query}&quot;
        </p>
      )}
      {results.length > 0 ? (
        <ItemGroup>
          {results.map((name) => (
            <Item key={name} variant="outline">
              <ItemContent>
                <ItemTitle>{name}</ItemTitle>
              </ItemContent>
            </Item>
          ))}
        </ItemGroup>
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No results for &quot;{query}&quot;</EmptyTitle>
            <EmptyDescription>
              Check the spelling or try another word.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" onClick={() => setQuery("")}>
              Clear search
            </Button>
          </EmptyContent>
        </Empty>
      )}
    </div>
  )
}
```

## Cross-references

- [filter](./filter.md) — narrows the same collection by its attributes
- [empty-state](./empty-state.md) — the view when nothing matches
- [loading](./loading.md) — the results while the query runs on the server
- [`InputGroup`](../components/InputGroup.md), [`Item`](../components/Item.md), [`Empty`](../components/Empty.md), [`Command`](../components/Command.md) — the component specs
