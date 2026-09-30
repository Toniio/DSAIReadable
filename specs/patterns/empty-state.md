# Empty state

## Metadata

| Field | Value       |
| ----- | ----------- |
| Name  | empty-state |
| Kind  | UI          |

## Role

Fills a view that has nothing to show with what happened and the next step, instead of a blank space.

## Usage

- **MUST** — pick the message and the action from why the view is empty (see Content): a first use offers the create action, a search or a filter offers to clear it, a finished list offers nothing, a missing permission names who can give access
- **MUST NOT** — use an `Empty` for a failure to load: that is an `Alert` `variant="destructive"` that says how to fix it
- **MUST** — show one `Empty` per view, in place of the collection it stands for — the header and the create action of the page stay
- **MUST** — keep the description to two sentences, framed around the action to take
- **MUST** — pass `EmptyTitle` the heading level below the section that holds it (`as="h3"` under an `h2`)
- **MUST NOT** — put information in `EmptyMedia`: the icon is decorative

## Structure

| Region      | Content                                      | Components                    |
| ----------- | -------------------------------------------- | ----------------------------- |
| Media       | One Phosphor icon that names the collection  | `EmptyMedia` `variant="icon"` |
| Title       | What is empty, in a few words                | `EmptyTitle`                  |
| Description | Why, and what to do, in one or two sentences | `EmptyDescription`            |
| Action      | One primary action, and at most one other    | `EmptyContent`, `Button`      |

## Components

| Component    | Variant / props                  | Job                             |
| ------------ | -------------------------------- | ------------------------------- |
| `Empty`      | —                                | Holds the empty state, centered |
| `EmptyMedia` | `variant="icon"`                 | The decorative icon             |
| `EmptyTitle` | `as` one level below its section | The heading of the empty state  |
| `Button`     | `variant="default"`              | The first-use action            |
| `Button`     | `variant="outline"`              | `Clear search`, `Clear filters` |

## Spacing

- **MUST** — let `Empty` lay out its own parts: no class on its header, title or description
- **MUST** — give the `Empty` the place of the collection it replaces, inside the same column, so the page does not jump when the first entry arrives

## Content

| Situation | Write                                                                    | Not             |
| --------- | ------------------------------------------------------------------------ | --------------- |
| First use | `No projects yet` · `Create your first project to get started.`          | `No data.`      |
| No match  | `No results for "lanch"` · `Check the spelling or try another word.`     | `0 results.`    |
| All done  | `You're all caught up` · `New invoices show up here.`                    | `Empty list!`   |
| Access    | `You don't have access to this project` · `Ask its owner to invite you.` | `403 Forbidden` |

## Code example

```tsx
import { FolderIcon, PlusIcon } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export function NoProjects({ onCreate }: { onCreate: () => void }) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FolderIcon />
        </EmptyMedia>
        <EmptyTitle as="h3">No projects yet</EmptyTitle>
        <EmptyDescription>
          Create your first project to get started.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={onCreate}>
          <PlusIcon />
          Create project
        </Button>
      </EmptyContent>
    </Empty>
  )
}
```

## Cross-references

- [create](./create.md) — the action a first-use empty state offers
- [search](./search.md), [filter](./filter.md) — the empty state when nothing matches
- [loading](./loading.md) — what shows before the view knows it is empty
- [`Empty`](../components/Empty.md), [`Alert`](../components/Alert.md) — the component specs
