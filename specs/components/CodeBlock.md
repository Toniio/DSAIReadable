# CodeBlock

## Metadata

| Field         | Value                        |
| ------------- | ---------------------------- |
| Name          | CodeBlock                    |
| Category      | Typography                   |
| Status        | beta                         |
| figma_node_id |                              |
| code_path     | components/ui/code-block.tsx |

## Role

A block of code, terminal output or a diff, in one color, with an optional header that names it and a button that copies it.

## Usage

- Show code in an assistant's answer, inside the `Bubble` of its `MessageContent`, between two paragraphs
- Show a command, a file or a log, named in a `CodeBlockTitle` with a `CodeBlockCopyButton` next to it in `CodeBlockActions`, both in a `CodeBlockHeader`
- Show the output of a tool in a `TraceCollapsibleContent` with `size="sm"`, and failed output with `variant="destructive"`
- Number the lines with `lineNumbers`, from `startLine` for an excerpt of a longer file
- Wrap long lines with `wrap` (an error message, a log), and cap a long block with a `max-h-*` class on `CodeBlockContent`, which then scrolls inside the block
- Mark the lines of a diff with `CodeBlockLine variant="added"` or `variant="removed"`, and the lines to look at with `variant="highlighted"`
- Float the copy button over a block with no header by placing `CodeBlockActions` directly in `CodeBlock`, before `CodeBlockContent`: it shows on hover and on focus, and always on a touch screen
- Put a "Show more" `Button` or a note on the output in a `CodeBlockFooter`

<!-- rule-23: generated from design-system.index.json by scripts/build-spec-choices.ts — do not edit by hand. -->

- **Choice** (`rule-23`) — Build a conversation from its family, one component per job. The scrolling thread that follows new messages: `MessageScroller`, one `MessageScrollerItem` per message. One turn of a speaker, with avatar, header and footer: `Message`, `align="end"` for the user's own turns. The text of a turn: `Bubble` inside `MessageContent`, `variant="ghost"` for an answer that reads as a document. Code in an answer: `CodeBlock`, in one color, with a `CodeBlockCopyButton` in its `CodeBlockActions`. A step of the assistant's work that has a status or details to open (a tool call, its reasoning, its sources): `Trace`, one `TraceLine` per step, wrapped in a `TraceCollapsible` when it has details. An event nobody said, with nothing to open (a date, "Conversation resumed"): `Marker`, `variant="separator"` between days. A file sent or received: `Attachment`, several in an `AttachmentGroup`. Questions the assistant asks one at a time: `Questionnaire`; a form shown all at once, outside the thread: `Field`s in a `form`.

## Constraints

- **MUST** — pass `CodeBlockCopyButton` the exact text the block shows, in `value`
- **MUST NOT** — add a syntax highlighter or a color per token (shiki, Prism, highlight.js, shadcn/ui's `use-highlighted-code` hook): the design system has no syntax tokens, and shiki's GitHub themes put tokens under 4.5:1 (the orange of a variable at 3.49:1 on white, the gray of a comment at 3.78:1 on the block's dark fill, WCAG 1.4.3)
- **MUST NOT** — color the code with the chart colors or a status color: the code is `text-foreground`, or `text-destructive` with `variant="destructive"`
- **MUST** — write code inside a sentence (a file name, a prop) as a `<code>` element in the text, and keep `CodeBlock` for a block of its own
- **SHOULD** — name what the copy button copies with `copyLabel` ("Copy route.ts") **unless** the block is the only one on the screen: several buttons named "Copy" cannot be told apart (WCAG 2.4.6)
- **MUST NOT** — remove the tab stop of a `CodeBlockContent` that scrolls (`tabIndex={-1}`): focus is how the keyboard scrolls it (WCAG 2.1.1)
- **Note** — `size="sm"` sets the code in `text-xs` with tighter padding; the `size` of `CodeBlockCopyButton` takes the `Button` scale and defaults to `icon-xs`
- **Note** — floating `CodeBlockActions` take a raw `z-10` to stay above the code that scrolls under them. It is internal to the component, declared in `tokens/allow-raw.registry.json` (`local-stacking`) and listed in `specs/foundations/elevation.md`

## Dependencies

- `class-variance-authority` for the `CodeBlock` and `CodeBlockLine` variants
- `Button` from `@/components/ui/button` (rendered by `CodeBlockCopyButton`)
- `CopyIcon` and `CheckIcon` from `@phosphor-icons/react`
- The default names of the copy button, `UI_STRINGS.codeBlock`, from `@/lib/ui-strings`
- The `scroll-fade-x` and `scroll-fade-y` utilities of `shadcn/tailwind.css`, imported by `styles/globals.css`
- The Clipboard API (`navigator.clipboard.writeText`), which the browser grants on HTTPS and on `localhost` only
- The `cn` utility from `@/lib/utils`
- **Not shipped**: shadcn/ui's `use-highlighted-code` hook and its `lib/highlighter.tsx`, which bring shiki and the hex colors of its themes. The registry item depends on `button` alone

## Anatomy

| Slot                                  | Role                                                                                                  |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `data-slot="code-block"`              | The block; carries `data-variant` and `data-size`; draws the border and the focus ring of its content |
| `data-slot="code-block-header"`       | Row above the code: the title, then the actions at its end                                            |
| `data-slot="code-block-title"`        | File name or label, with an optional icon; truncated on one line                                      |
| `data-slot="code-block-actions"`      | Buttons at the end of the header, or floating at the top end of a block with no header                |
| `data-slot="code-block-copy-button"`  | Ghost icon `Button` that copies `value`, followed by its live region; carries `data-copied`           |
| `data-slot="code-block-content"`      | The `pre`, a tab stop, `dir="ltr"`; carries `data-wrap` and `data-numbered`                           |
| `data-slot="code-block-code"`         | The `code` element inside it, a grid of lines                                                         |
| `data-slot="code-block-line"`         | One line; carries `data-variant`; draws its number and its diff marker                                |
| `data-slot="code-block-line-content"` | The text of the line                                                                                  |
| `data-slot="code-block-footer"`       | Row under the code                                                                                    |

## Tokens

<!-- Generated by scripts/build-spec-tokens.ts from the component's code — do not edit by hand. -->

| Token                            | Classes and variables                                                     | Where                                                                                                                                                                |
| -------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `border-width.default`           | `border` · `ring-(length:--border-width-default)`                         | `CodeBlockActions` · `codeBlockVariants.variant.default` · `codeBlockVariants.variant.destructive`                                                                   |
| `color.background.default`       | `bg-background`                                                           | `CodeBlockActions`                                                                                                                                                   |
| `color.background.input`         | `bg-input-fill/30`                                                        | `codeBlockVariants.variant.default`                                                                                                                                  |
| `color.background.subtle`        | `bg-muted`                                                                | `codeBlockLineVariants.variant.added` · `codeBlockLineVariants.variant.highlighted`                                                                                  |
| `color.border.focus`             | `border-ring` · `ring-ring/50`                                            | `codeBlockVariants.variant.default` · `codeBlockVariants.variant.destructive` · `codeBlockVariants`                                                                  |
| `color.border.input`             | `border-input`                                                            | `codeBlockVariants.variant.default`                                                                                                                                  |
| `color.feedback.error.default`   | `bg-destructive/10` · `border-destructive/30` · `border-destructive/40`   | `codeBlockLineVariants.variant.removed` · `codeBlockVariants.variant.destructive`                                                                                    |
| `color.text.default`             | `ring-foreground/10` · `text-foreground`                                  | `CodeBlockActions` · `CodeBlockTitle` · `codeBlockVariants.variant.default`                                                                                          |
| `color.text.destructive.default` | `text-destructive`                                                        | `CodeBlockHeader` · `CodeBlockTitle` · `codeBlockLineVariants.variant.removed` · `codeBlockVariants.variant.destructive`                                             |
| `color.text.subtle`              | `text-muted-foreground`                                                   | `CodeBlockFooter` · `CodeBlockHeader` · `codeBlockLineVariants`                                                                                                      |
| `motion.duration.fast`           | `transition-opacity`                                                      | `CodeBlockActions`                                                                                                                                                   |
| `motion.easing.default`          | `transition-opacity`                                                      | `CodeBlockActions`                                                                                                                                                   |
| `space.focus-ring-width`         | `ring-(length:--space-focus-ring-width)`                                  | `codeBlockVariants`                                                                                                                                                  |
| `space.scale.0`                  | `m-0` · `min-h-0` · `min-w-0` · `top-0`                                   | `CodeBlockActions` · `CodeBlockContent` · `CodeBlockFooter` · `CodeBlockHeader` · `CodeBlockLine` · `CodeBlockTitle` · `codeBlockLineVariants` · `codeBlockVariants` |
| `space.scale.1`                  | `-my-1` · `gap-1` · `start-1`                                             | `CodeBlockActions` · `codeBlockLineVariants`                                                                                                                         |
| `space.scale.1-5`                | `-me-1.5` · `end-1.5` · `me-1.5` · `pt-1.5` · `top-1.5`                   | `CodeBlockActions` · `CodeBlockContent` · `CodeBlockTitle`                                                                                                           |
| `space.scale.2`                  | `-mx-2` · `end-2` · `gap-2` · `pb-2` · `pt-2` · `px-2` · `py-2` · `top-2` | `CodeBlockActions` · `CodeBlockContent` · `CodeBlockFooter` · `CodeBlockHeader` · `codeBlockLineVariants`                                                            |
| `space.scale.3`                  | `-mx-3` · `gap-x-3` · `pb-3` · `pt-3` · `px-3` · `py-3`                   | `CodeBlockContent` · `CodeBlockFooter` · `CodeBlockHeader` · `codeBlockLineVariants`                                                                                 |
| `space.scale.3-5`                | `size-3.5`                                                                | `CodeBlockTitle`                                                                                                                                                     |
| `space.scale.6`                  | `min-w-6`                                                                 | `codeBlockLineVariants`                                                                                                                                              |
| `typography.font-family.mono`    | `font-mono`                                                               | `CodeBlockContent`                                                                                                                                                   |
| `typography.font-family.sans`    | `font-sans`                                                               | `CodeBlockTitle`                                                                                                                                                     |
| `typography.font-weight.medium`  | `font-medium`                                                             | `CodeBlockTitle`                                                                                                                                                     |
| `typography.line-height.relaxed` | `leading-relaxed`                                                         | `CodeBlockContent`                                                                                                                                                   |
| `typography.size-line-height.sm` | `text-sm`                                                                 | `codeBlockVariants`                                                                                                                                                  |
| `typography.size-line-height.xs` | `text-xs`                                                                 | `CodeBlockTitle` · `codeBlockVariants`                                                                                                                               |
| `typography.size.sm`             | `text-sm`                                                                 | `codeBlockVariants`                                                                                                                                                  |
| `typography.size.xs`             | `text-xs`                                                                 | `CodeBlockTitle` · `codeBlockVariants`                                                                                                                               |

Collected from `components/ui/code-block.tsx` and the `lib/` constants it imports; Tailwind resolves each class down to its semantic token. **Where**: the sub-component, the `cva` variant path or the constant the class comes from. Classes that read no token (`w-full`, `flex`, layout) are left out.

Composes `Button` — Button in CodeBlockCopyButton: variant ghost, size icon-xs; its tokens are listed in its own spec.

## Props / API

<!-- Generated by scripts/build-spec-api.ts from the TypeScript exports. Only the descriptions are edited by hand; they are kept. -->

### `CodeBlock`

Renders `<div>`.

| Prop       | Type                          | Default     | Description                                                                            |
| ---------- | ----------------------------- | ----------- | -------------------------------------------------------------------------------------- |
| `variant`  | `"default" \| "destructive"`  | `"default"` | See **Variants**                                                                       |
| `size`     | `"default" \| "sm"`           | `"default"` | `sm` sets the code in `text-xs` with tighter padding, for a tool's output in a `Trace` |
| `...props` | `React.ComponentProps<"div">` | —           | Native `<div>` props                                                                   |

### `CodeBlockHeader`

Renders `<div>`.

| Prop       | Type                          | Default | Description          |
| ---------- | ----------------------------- | ------- | -------------------- |
| `...props` | `React.ComponentProps<"div">` | —       | Native `<div>` props |

### `CodeBlockTitle`

Renders `<div>`.

| Prop       | Type                          | Default | Description          |
| ---------- | ----------------------------- | ------- | -------------------- |
| `...props` | `React.ComponentProps<"div">` | —       | Native `<div>` props |

### `CodeBlockActions`

Renders `<div>`.

| Prop       | Type                          | Default | Description          |
| ---------- | ----------------------------- | ------- | -------------------- |
| `...props` | `React.ComponentProps<"div">` | —       | Native `<div>` props |

### `CodeBlockCopyButton`

Renders `Button`.

| Prop          | Type                                                                                 | Default                       | Description                                                                                             |
| ------------- | ------------------------------------------------------------------------------------ | ----------------------------- | ------------------------------------------------------------------------------------------------------- |
| `value`       | `string`                                                                             | —                             | The text the button copies: the code the block shows                                                    |
| `variant`     | `"link" \| "default" \| "destructive" \| "outline" \| "secondary" \| "ghost"`        | `"ghost"`                     | `Button` prop — see its spec                                                                            |
| `size`        | `"default" \| "xs" \| "sm" \| "lg" \| "icon" \| "icon-xs" \| "icon-sm" \| "icon-lg"` | `"icon-xs"`                   | `Button` prop — see its spec                                                                            |
| `copyLabel`   | `string`                                                                             | `UI_STRINGS.codeBlock.copy`   | Accessible name of the button; name what it copies when several blocks share a screen ("Copy route.ts") |
| `copiedLabel` | `string`                                                                             | `UI_STRINGS.codeBlock.copied` | Its name for two seconds after a copy, also announced by its live region                                |
| `...props`    | `React.ComponentProps<typeof Button>`                                                | —                             | `Button` props                                                                                          |

### `CodeBlockContent`

Renders `<pre>`.

| Prop          | Type                          | Default | Description                                                                                                     |
| ------------- | ----------------------------- | ------- | --------------------------------------------------------------------------------------------------------------- |
| `wrap`        | `boolean`                     | `false` | Wraps long lines instead of scrolling them sideways; the edges then fade at the top and bottom                  |
| `lineNumbers` | `boolean`                     | `false` | Numbers each line, splitting a string child into `CodeBlockLine`s; the numbers are neither copied nor announced |
| `startLine`   | `number`                      | `1`     | Number of the first line, with `lineNumbers`                                                                    |
| `...props`    | `React.ComponentProps<"pre">` | —       | Native `<pre>` props                                                                                            |

### `CodeBlockLine`

Renders `<span>`.

| Prop       | Type                                                 | Default     | Description           |
| ---------- | ---------------------------------------------------- | ----------- | --------------------- |
| `variant`  | `"default" \| "added" \| "removed" \| "highlighted"` | `"default"` | See **Variants**      |
| `...props` | `React.ComponentProps<"span">`                       | —           | Native `<span>` props |

### `CodeBlockFooter`

Renders `<div>`.

| Prop       | Type                          | Default | Description          |
| ---------- | ----------------------------- | ------- | -------------------- |
| `...props` | `React.ComponentProps<"div">` | —       | Native `<div>` props |

<!-- End of the generated part. -->

## Variants

<!-- Generated by scripts/build-spec-variants.ts from mcp-server/context/component-variants.json — do not edit by hand. -->

| Component       | Axis      | Values                                          | Default   |
| --------------- | --------- | ----------------------------------------------- | --------- |
| `CodeBlock`     | `variant` | `default` · `destructive`                       | `default` |
| `CodeBlockLine` | `variant` | `default` · `added` · `removed` · `highlighted` | `default` |

What each axis means (appearance, intent, size…) is stated under **Props / API**.

## States

<!-- Generated by scripts/build-spec-states.ts from the component's classes. Only the descriptions are edited by hand; they are kept. -->

| State     | Classes                                                                                                                                                                                                                                                                                                        | Description                                                                                                                                                                                                                  |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `default` | —                                                                                                                                                                                                                                                                                                              | The code in `text-foreground` (`text-destructive` with `variant="destructive"`) in a `border-input` frame, filled with `bg-input-fill/30` in dark; floating actions are transparent                                          |
| `hover`   | `[[data-slot=code-block]>&]:group-hover/code-block:opacity-100`                                                                                                                                                                                                                                                | Floating `CodeBlockActions` show (`opacity-100`), as they always do on a touch screen (`pointer-coarse`)                                                                                                                     |
| `focus`   | `[[data-slot=code-block]>&]:group-focus-within/code-block:opacity-100` · `has-[>[data-slot=code-block-content]:focus-visible]:border-ring` · `has-[>[data-slot=code-block-content]:focus-visible]:ring-(length:--space-focus-ring-width)` · `has-[>[data-slot=code-block-content]:focus-visible]:ring-ring/50` | While the code has focus-visible, the block draws the focus ring (`space.focus-ring-width`, `ring-ring/50`) and turns its border `border-ring`, in both variants; floating actions show while focus is anywhere in the block |

Collected from `components/ui/code-block.tsx` and the `lib/` constants it imports. **Classes**: each class whose variants name the state, as written (`dark:` included); a class that stacks two states is listed under both. `—`: no class of its own — `default` is what the other states change.

Composes `Button` — Button in CodeBlockCopyButton: variant ghost, size icon-xs; its states are listed in its own spec.

<!-- End of the generated part. -->

## Accessibility

**Pattern**: Preformatted text in a focusable scroll region, and a [button](https://www.w3.org/WAI/ARIA/apg/patterns/button/) that copies it

**Role**: `CodeBlockContent` is a `pre` holding a `code` element, with no role of its own and `dir="ltr"` on any page. `CodeBlockCopyButton` is a native `button` (`Button`), followed by a visually hidden `aria-live="polite"` region.

**Keyboard**:

| Key                        | Action                                                                                        |
| -------------------------- | --------------------------------------------------------------------------------------------- |
| `Tab`                      | Moves to the copy button, then to the code; floating actions show while focus is in the block |
| `Enter` / `Space`          | On the copy button: copies `value`, renames the button "Copied" and announces it              |
| `ArrowLeft` / `ArrowRight` | On the code: scrolls a long line horizontally, natively                                       |

**Accessible name**: The copy button is named "Copy" (`UI_STRINGS.codeBlock.copy`), then "Copied" (`UI_STRINGS.codeBlock.copied`) for two seconds after a copy; `copyLabel` and `copiedLabel` replace them. `CodeBlockTitle` is visible text, not the name of the code.

**Pitfalls**:

- The copy fails without a word outside a secure context (plain HTTP) or when the browser denies the clipboard: the button keeps its "Copy" name and nothing is announced.
- Line numbers and the `+` / `−` markers of a diff are drawn by pseudo-elements and left out of a copied selection. The numbers are hidden from screen readers; a diff line says added or removed by its marker as well as its fill, so the change does not rest on color (WCAG 1.4.1).
- A copy button next to code that is still streaming in copies the part received so far: keep it `disabled` until the block is complete.

## Code example

```tsx
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockTitle,
} from "@/components/ui/code-block"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Message, MessageContent } from "@/components/ui/message"
import { FileTsIcon } from "@phosphor-icons/react"

const route = `export async function GET() {
  const orders = await db.order.findMany({ take: 20 })
  return Response.json(orders)
}`

export default function Example() {
  return (
    <Message>
      <MessageContent>
        <Bubble variant="ghost">
          <BubbleContent className="flex flex-col gap-3">
            <p>This route returns the 20 latest orders:</p>
            <CodeBlock>
              <CodeBlockHeader>
                <CodeBlockTitle>
                  <FileTsIcon />
                  app/api/orders/route.ts
                </CodeBlockTitle>
                <CodeBlockActions>
                  <CodeBlockCopyButton
                    value={route}
                    copyLabel="Copy route.ts"
                  />
                </CodeBlockActions>
              </CodeBlockHeader>
              <CodeBlockContent lineNumbers>{route}</CodeBlockContent>
            </CodeBlock>
            <p>Call it from the orders page to fill the table.</p>
          </BubbleContent>
        </Bubble>
      </MessageContent>
    </Message>
  )
}
```

## Cross-references

- `Trace` — the steps of an assistant's work, whose details hold a `size="sm"` `CodeBlock` with a tool's output
- `Bubble` — the text of a turn, `variant="ghost"`, that holds a `CodeBlock` in an answer
- `Kbd` — a key or a shortcut inside a sentence, where a `CodeBlock` is a block of its own
- `Button` — rendered by `CodeBlockCopyButton`, with its variants and sizes
- `ScrollArea` — a scrolling region with a custom scrollbar, for content other than code
