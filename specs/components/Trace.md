# Trace

## Metadata

| Field         | Value                   |
| ------------- | ----------------------- |
| Name          | Trace                   |
| Category      | Conversation            |
| Status        | beta                    |
| figma_node_id |                         |
| code_path     | components/ui/trace.tsx |

## Role

The steps an assistant takes while it works (a tool call, its reasoning, the sources it read), one line each, every step included, with its status and, when it has some, details that open under the line.

## Usage

- Show each step of the assistant's work as a `TraceLine`, a finished step with nothing to open included: a `TraceIcon`, a `TraceTitle` that says what happened, and a `TraceDescription` for a duration, a count or a diff stat
- Show the details of a step under it with a `TraceCollapsible`: the `TraceLine` in a `TraceCollapsibleTrigger`, the details in a `TraceCollapsibleContent`
- Show a tool's output in the details with a `CodeBlock` of `size="sm"`, `variant="destructive"` for a step that failed
- Set `status="running"` while a step runs (its title shimmers), `status="error"` when it failed, `status="pending"` before it starts, and no status once it is done
- Open the details of a running step with `open` and `onOpenChange`, and let the reader's click win: `open={open ?? running}`
- Group the steps of one turn in one `Trace`; text the assistant writes between two steps goes between two `Trace` lists
- Make a line open a page, a `Dialog` or a `Sheet` by wrapping the `TraceLine` in the link or the trigger, directly in `Trace`, which styles it

<!-- rule-23: generated from design-system.index.json by scripts/build-spec-choices.ts — do not edit by hand. -->

- **Choice** (`rule-23`) — Build a conversation from its family, one component per job. The scrolling thread that follows new messages: `MessageScroller`, one `MessageScrollerItem` per message. One turn of a speaker, with avatar, header and footer: `Message`, `align="end"` for the user's own turns. The text of a turn: `Bubble` inside `MessageContent`, `variant="ghost"` for an answer that reads as a document. Code in an answer: `CodeBlock`, in one color, inside a `ghost` or `outline` `Bubble`, with a `CodeBlockCopyButton` in its `CodeBlockActions`. Every step of the assistant's work (a tool call, its reasoning, a search), running, failed or done, with details or without: `Trace`, one `TraceLine` per step, wrapped in a `TraceCollapsible` when it has details. An event of the conversation that is not a step of the assistant's work (a date, "Conversation resumed", "Ana joined"): `Marker`, `variant="separator"` between days. A file sent or received: `Attachment`, several in an `AttachmentGroup`. Questions the assistant asks one at a time: `Questionnaire`; a form shown all at once, outside the thread: `Field`s in a `form`.

## Constraints

- **MUST** — state the status in the words of `TraceTitle`: "Running npm test", "Failed to run npm test", "Run npm test" for a pending step. The shimmer and the color are not announced, and a pending step looks like a done one (WCAG 1.4.1)
- **MUST** — write `TraceTitle` as one sentence that says what happened ("Edited trace.tsx", not "trace.tsx"), on one line: it truncates, and it names the trigger
- **MUST** — wrap a `TraceLine` in a `TraceCollapsibleTrigger`, a link or a dialog trigger to make it act: a `TraceLine` alone is text, not a tab stop
- **MUST NOT** — use a `Trace` for an event that is not a step of the assistant's work (a date, "Conversation resumed", "Ana joined") → `Marker`
- **MUST NOT** — put what the assistant says to the user in a `Trace` → a `Bubble` in `MessageContent`
- **MUST NOT** — tighten the `gap-2` between the steps of a `Trace`: a trigger or a wrapped link is 16px tall (20px in nova) and meets the 24px target size through the spacing exception, which the 8px gap gives with no margin in lyra (WCAG 2.5.8, `specs/foundations/size.md`)
- **MUST** — give a block with a muted fill placed in `TraceCollapsibleContent` its own `text-foreground`: the details are muted text (`CodeBlock` sets its own color)
- **Note** — a pending step has no style of its own: shadcn/ui dims it to 60% opacity, which puts its muted text at 2.55:1 in light (WCAG 1.4.3)
- **Note** — `TraceIcon` is hidden from screen readers (`aria-hidden`): the title carries the meaning

## Dependencies

- `Collapsible`, `CollapsibleTrigger` and `CollapsibleContent` from `@/components/ui/collapsible` (Radix Collapsible)
- `CaretRightIcon` from `@phosphor-icons/react`
- The `shimmer` utility of `shadcn/tailwind.css` and the `accordion-down` / `accordion-up` animations of `tw-animate-css`, imported by `styles/globals.css`
- The `cn` utility from `@/lib/cn`

## Anatomy

| Slot                                          | Role                                                                               |
| --------------------------------------------- | ---------------------------------------------------------------------------------- |
| `data-slot="trace"`                           | Column of steps; styles a link or a trigger that wraps a `TraceLine`               |
| `data-slot="trace-line"`                      | One step: icon, title, description; carries `data-status`                          |
| `data-slot="trace-icon"`                      | Icon before the title, or the caret after it; hidden from screen readers           |
| `data-slot="trace-title"`                     | The sentence that names the step; truncated; shimmers while `running`              |
| `data-slot="trace-description"`               | Secondary text after the title, not truncated                                      |
| `data-slot="trace-collapsible"`               | A step with details; holds the open / closed state                                 |
| `data-slot="trace-collapsible-trigger"`       | The button around the `TraceLine`; adds the caret that turns when the step is open |
| `data-slot="trace-collapsible-content"`       | The details, shown when open; their height animates                                |
| `data-slot="trace-collapsible-content-inner"` | The muted column of the details, under a rule aligned with the icon                |

## Tokens

<!-- Generated by scripts/build-spec-tokens.ts from the component's code — do not edit by hand. -->

| Token                            | Classes and variables                                  | Where                                                                                                             |
| -------------------------------- | ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `border-width.default`           | `border-l` · `outline-(length:--border-width-default)` | `TraceCollapsibleContent` · `TraceCollapsibleTrigger` · `Trace`                                                   |
| `color.border.focus`             | `outline-ring` · `ring-ring/50`                        | `TraceCollapsibleTrigger` · `Trace`                                                                               |
| `color.text.default`             | `text-foreground`                                      | `TraceCollapsibleTrigger` · `TraceLine`                                                                           |
| `color.text.destructive.default` | `text-destructive`                                     | `TraceCollapsibleTrigger` · `TraceLine`                                                                           |
| `color.text.subtle`              | `text-muted-foreground`                                | `TraceCollapsibleContent` · `TraceCollapsibleTrigger` · `TraceDescription` · `TraceLine`                          |
| `motion.duration.fast`           | `transition-colors` · `transition-transform`           | `TraceCollapsibleTrigger` · `TraceLine`                                                                           |
| `motion.duration.normal`         | `duration-normal`                                      | `TraceCollapsibleContent`                                                                                         |
| `motion.easing.default`          | `transition-colors` · `transition-transform`           | `TraceCollapsibleTrigger` · `TraceLine`                                                                           |
| `radius.item`                    | `rounded-item`                                         | `TraceCollapsibleTrigger` · `Trace`                                                                               |
| `space.focus-ring-width`         | `ring-(length:--space-focus-ring-width)`               | `TraceCollapsibleTrigger` · `Trace`                                                                               |
| `space.scale.0`                  | `min-w-0`                                              | `TraceCollapsibleContent` · `TraceCollapsibleTrigger` · `TraceCollapsible` · `TraceLine` · `TraceTitle` · `Trace` |
| `space.scale.1`                  | `-ml-1` · `gap-1` · `mb-1` · `pr-1`                    | `TraceCollapsibleContent` · `TraceCollapsibleTrigger` · `TraceIcon`                                               |
| `space.scale.1-5`                | `ml-1.5`                                               | `TraceCollapsibleContent`                                                                                         |
| `space.scale.2`                  | `gap-2` · `mt-2`                                       | `TraceCollapsibleContent` · `TraceLine` · `Trace`                                                                 |
| `space.scale.3-5`                | `pl-3.5` · `size-3.5`                                  | `TraceCollapsibleContent` · `TraceIcon`                                                                           |
| `typography.line-height.relaxed` | `leading-relaxed`                                      | `TraceCollapsibleContent`                                                                                         |
| `typography.size-line-height.ui` | `text-ui`                                              | `TraceLine`                                                                                                       |
| `typography.size.ui`             | `text-ui`                                              | `TraceLine`                                                                                                       |

Collected from `components/ui/trace.tsx` and the `lib/` constants it imports; Tailwind resolves each class down to its semantic token. **Where**: the sub-component, the `cva` variant path or the constant the class comes from. Classes that read no token (`w-full`, `flex`, layout) are left out.

Composes `Collapsible` — its tokens are listed in its own spec.

## Props / API

<!-- Generated by scripts/build-spec-api.ts from the TypeScript exports. Only the descriptions are edited by hand; they are kept. -->

### `Trace`

Renders `<div>`.

| Prop       | Type                          | Default | Description          |
| ---------- | ----------------------------- | ------- | -------------------- |
| `...props` | `React.ComponentProps<"div">` | —       | Native `<div>` props |

### `TraceLine`

Renders `<span>`.

| Prop       | Type                                | Default | Description                                                                                                                                                        |
| ---------- | ----------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `status`   | `"running" \| "error" \| "pending"` | —       | `running` while the step runs (the title shimmers), `error` when it failed (`text-destructive`), `pending` before it starts; none once done. The title says it too |
| `...props` | `React.ComponentProps<"span">`      | —       | Native `<span>` props                                                                                                                                              |

### `TraceIcon`

Renders `<span>`.

| Prop       | Type                           | Default | Description           |
| ---------- | ------------------------------ | ------- | --------------------- |
| `...props` | `React.ComponentProps<"span">` | —       | Native `<span>` props |

### `TraceTitle`

Renders `<span>`.

| Prop       | Type                           | Default | Description           |
| ---------- | ------------------------------ | ------- | --------------------- |
| `...props` | `React.ComponentProps<"span">` | —       | Native `<span>` props |

### `TraceDescription`

Renders `<span>`.

| Prop       | Type                           | Default | Description           |
| ---------- | ------------------------------ | ------- | --------------------- |
| `...props` | `React.ComponentProps<"span">` | —       | Native `<span>` props |

### `TraceCollapsible`

Renders `Collapsible`.

| Prop           | Type                                                                                                                                                                                                           | Default | Description                                                                                                            |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------- |
| `onOpenChange` | `NonNullable< React.ComponentProps<typeof Collapsible>["onOpenChange"] >`                                                                                                                                      | —       | Called with the new open state; required with `open`                                                                   |
| `open`         | `boolean`                                                                                                                                                                                                      | —       | Open state (controlled), passed with `onOpenChange`; leave both out for a step that opens on click, from `defaultOpen` |
| `...props`     | `Omit<React.ComponentProps<typeof Collapsible>, "asChild" \| "open"> & ( \| { open?: undefined } \| { open: boolean onOpenChange: NonNullable< React.ComponentProps<typeof Collapsible>["onOpenChange"] > } )` | —       | Props passed to the rendered element                                                                                   |

### `TraceCollapsibleTrigger`

Renders `CollapsibleTrigger`.

| Prop       | Type                                                               | Default | Description                          |
| ---------- | ------------------------------------------------------------------ | ------- | ------------------------------------ |
| `...props` | `Omit<React.ComponentProps<typeof CollapsibleTrigger>, "asChild">` | —       | Props passed to the rendered element |

### `TraceCollapsibleContent`

Renders `CollapsibleContent`.

| Prop       | Type                                                               | Default | Description                          |
| ---------- | ------------------------------------------------------------------ | ------- | ------------------------------------ |
| `...props` | `Omit<React.ComponentProps<typeof CollapsibleContent>, "asChild">` | —       | Props passed to the rendered element |

<!-- End of the generated part. -->

## Variants

<!-- Generated by scripts/build-spec-variants.ts from mcp-server/context/component-variants.json — do not edit by hand. -->

No variant axis: the component does not call `cva()`. Its appearance is set through its props and, as a last resort, through `className` with token classes.

## States

<!-- Generated by scripts/build-spec-states.ts from the component's classes. Only the descriptions are edited by hand; they are kept. -->

| State     | Classes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Description                                                                                                                                                                              |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `default` | —                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | A muted line (`text-muted-foreground`); its details closed, the caret pointing to the end                                                                                                |
| `hover`   | `hover:text-foreground`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | A trigger, or a link that wraps a line, turns to `text-foreground`; an error line keeps its color                                                                                        |
| `focus`   | `*:has-[>[data-slot=trace-line]]:focus-visible:outline-(length:--border-width-default)` · `*:has-[>[data-slot=trace-line]]:focus-visible:outline-ring` · `*:has-[>[data-slot=trace-line]]:focus-visible:outline-solid` · `*:has-[>[data-slot=trace-line]]:focus-visible:ring-(length:--space-focus-ring-width)` · `*:has-[>[data-slot=trace-line]]:focus-visible:ring-ring/50` · `focus-visible:outline-(length:--border-width-default)` · `focus-visible:outline-ring` · `focus-visible:outline-solid` · `focus-visible:ring-(length:--space-focus-ring-width)` · `focus-visible:ring-ring/50` | A trigger, or a link or dialog trigger that wraps a line in `Trace`, draws the focus ring (`space.focus-ring-width`, `ring-ring/50`) and a solid `outline-ring` (`border-width.default`) |
| `open`    | `data-open:animate-accordion-down` · `group-aria-expanded/trace-collapsible-trigger:rotate-90`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | The details grow to their height (`animate-accordion-down`) and the caret turns a quarter (`rotate-90`)                                                                                  |
| `closing` | `data-closed:animate-accordion-up`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | The details shrink back (`animate-accordion-up`), then leave the page                                                                                                                    |
| `error`   | `data-[status=error]:in-[a:hover,button:hover]:text-destructive` · `data-[status=error]:text-destructive` · `has-[[data-status=error]]:text-destructive`                                                                                                                                                                                                                                                                                                                                                                                                                                        | `status="error"`: the line, and the trigger that holds it, in `text-destructive`, hovered too                                                                                            |
| `running` | `data-[status=running]:*:data-[slot=trace-title]:shimmer`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | `status="running"`: the title shimmers (`shimmer`), and holds still under `prefers-reduced-motion`                                                                                       |

Collected from `components/ui/trace.tsx` and the `lib/` constants it imports. **Classes**: each class whose variants name the state, as written (`dark:` included); a class that stacks two states is listed under both. `—`: no class of its own — `default` is what the other states change.

Composes `Collapsible` — its states are listed in its own spec.

<!-- End of the generated part. -->

## Accessibility

**Pattern**: [Disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/) for a step with details (Radix Collapsible); plain text for a step without

**Role**: `Trace` is a `div` and `TraceLine` a `span`, with no role. `TraceCollapsibleTrigger` is a `button` with `aria-expanded` and `aria-controls`. A line wrapped in a link or a dialog trigger takes the role of that element.

**Keyboard**:

| Key               | Action                                                                  |
| ----------------- | ----------------------------------------------------------------------- |
| `Tab`             | Moves to the trigger of each step with details; a line alone is skipped |
| `Enter` / `Space` | Opens or closes the details of a step                                   |

**Accessible name**: The trigger is named by the text of its `TraceLine`: the `TraceTitle`, then the `TraceDescription` ("Edited trace.tsx +12 −3"). The icons and the caret are hidden.

**Pitfalls**:

- Closed details leave the accessibility tree: the line says the outcome without them ("Failed to run npm test", not "npm test").
- The shimmer of a running title stops under `prefers-reduced-motion`, and the details open and close at once: the title still says the step runs.
- A step whose status changes keeps its `TraceLine`: change its `status` and its title in place (same `key`), so a trigger that has focus keeps it.

## Code example

```tsx
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceDescription,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "@/components/ui/trace"
import { CodeBlock, CodeBlockContent } from "@/components/ui/code-block"
import { MagnifyingGlassIcon, TerminalIcon } from "@phosphor-icons/react"

export default function Example() {
  return (
    <Trace>
      <TraceCollapsible defaultOpen>
        <TraceCollapsibleTrigger>
          <TraceLine>
            <TraceIcon>
              <TerminalIcon />
            </TraceIcon>
            <TraceTitle>Ran npm install</TraceTitle>
            <TraceDescription>4 s</TraceDescription>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent>
          <CodeBlock size="sm">
            <CodeBlockContent wrap>added 214 packages in 4s</CodeBlockContent>
          </CodeBlock>
        </TraceCollapsibleContent>
      </TraceCollapsible>
      <TraceCollapsible defaultOpen>
        <TraceCollapsibleTrigger>
          <TraceLine status="error">
            <TraceIcon>
              <TerminalIcon />
            </TraceIcon>
            <TraceTitle>Failed to run npm test</TraceTitle>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent>
          <CodeBlock size="sm" variant="destructive">
            <CodeBlockContent wrap>
              {"FAIL tests/cart.test.ts\nExpected 3 items, received 2"}
            </CodeBlockContent>
          </CodeBlock>
        </TraceCollapsibleContent>
      </TraceCollapsible>
      <TraceLine status="running">
        <TraceIcon>
          <MagnifyingGlassIcon />
        </TraceIcon>
        <TraceTitle>Searching the docs for cart limits</TraceTitle>
      </TraceLine>
    </Trace>
  )
}
```

## Cross-references

- `Marker` — an event of the conversation that is not a step of the assistant's work (a date, a resumed session), where every step, a finished one with nothing to open included, is a `TraceLine`
- `CodeBlock` — the output of a tool in the details of a step, `size="sm"`
- `Collapsible` — the disclosure each `TraceCollapsible` renders
- `Message` — the turn the steps belong to; its `Bubble` holds the answer
- `Accordion` — sections of a page that open one at a time, outside a conversation
