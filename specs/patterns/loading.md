# Loading

## Metadata

| Field | Value   |
| ----- | ------- |
| Name  | loading |
| Kind  | UI      |

## Role

Shows that content or an action is on its way, with the indicator that matches what the person is waiting for and how long.

## Usage

- **MUST** — pick the indicator from what is loading:

  - content whose shape is known (a list, a card, a table): `Skeleton`s in its place, as many as the entries expected
  - an action the person started (a button, a form): a `Spinner` inside the button that started it
  - a task whose progress can be measured, or that lasts more than 10 s: `Progress`, with a label that says what is happening

- **MUST NOT** — show an indicator for a wait under 300 ms: it flashes and reads as a glitch
- **MUST** — match each `Skeleton` to the size of the content it stands for, so its arrival does not shift the layout
- **MUST** — set `aria-busy="true"` on the region that is loading, and name every `Spinner` and `Progress` after the action (`aria-label="Loading projects"`)
- **MUST NOT** — block the whole page with a spinner: the header and the navigation stay usable while a region loads
- **MUST** — replace the indicator with the content, an [empty state](./empty-state.md) or an `Alert` `variant="destructive"` — never leave it on screen after the request ends

## Structure

| Region    | Content                                              | Components          |
| --------- | ---------------------------------------------------- | ------------------- |
| Content   | Placeholders in the shape of the entries to come     | `Skeleton`          |
| Action    | The button that started the action, with its spinner | `Button`, `Spinner` |
| Long task | How far the task has gone, and what it is doing      | `Progress`, a label |

## Components

| Component  | Variant / props                                          | Job                                          |
| ---------- | -------------------------------------------------------- | -------------------------------------------- |
| `Skeleton` | the size classes of the content it replaces (`h-4 w-48`) | Holds the place of content that is coming    |
| `Spinner`  | `aria-label` naming the action                           | An action under 10 s, inside its button      |
| `Progress` | `value`, `aria-label`                                    | A measured task, or one that lasts over 10 s |
| `Button`   | `disabled`, `aria-busy` while pending                    | The action that is running                   |

## Spacing

- **MUST** — give the skeletons the same container, gaps and paddings as the content they stand for: a skeleton row is a real row with `Skeleton`s in its cells
- **MUST** — keep a `Spinner` inside its `Button`, before the label, with the button's own gap

## Content

| Element        | Write                            | Not                         |
| -------------- | -------------------------------- | --------------------------- |
| Pending button | `Saving…` · `Signing in…`        | `Loading...`, `Please wait` |
| Region label   | `Loading your projects…`         | `Loading…`                  |
| Long task      | `Importing 120 of 480 contacts…` | `Processing, please wait`   |

## Code example

```tsx
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function ProjectCardsLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading your projects…"
      className="grid gap-4 md:grid-cols-3"
    >
      {Array.from({ length: 3 }, (_, index) => (
        <Card key={index}>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-48" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

## Cross-references

- [saving](./saving.md) — the pending state of a save button
- [empty-state](./empty-state.md) — what replaces the indicator when there is nothing to show
- [`Skeleton`](../components/Skeleton.md), [`Spinner`](../components/Spinner.md), [`Progress`](../components/Progress.md) — the component specs
