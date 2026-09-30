# Attachment

## Metadata

| Field         | Value                        |
| ------------- | ---------------------------- |
| Name          | Attachment                   |
| Category      | Conversation                 |
| Status        | beta                         |
| figma_node_id |                              |
| code_path     | components/ui/attachment.tsx |

## Role

A tile that stands for one file sent or received — its icon or preview, its name, its size — with its upload state and its actions.

## Usage

- Show a file attached to a message, or queued in a composer before it is sent
- Show the progress of an upload with `state="uploading"` or `state="processing"`, and a failed one with `state="error"`
- Show an empty slot waiting for a file with `state="idle"` (dashed border)
- Show an image preview with `AttachmentMedia variant="image"`, a file type icon with the default `variant="icon"`
- Lay tiles out as a card with `orientation="vertical"`, or as a row (default)
- Open the file on click with an `AttachmentTrigger` stretched over the tile
- Remove or retry the file with `AttachmentAction` buttons in `AttachmentActions`
- Scroll several tiles horizontally in an `AttachmentGroup`

<!-- rule-23: generated from design-system.index.json by scripts/build-spec-choices.ts — do not edit by hand. -->

- **Choice** (`rule-23`) — Build a conversation from its family, one component per job. The scrolling thread that follows new messages: `MessageScroller`, one `MessageScrollerItem` per message. One turn of a speaker, with avatar, header and footer: `Message`, `align="end"` for the user's own turns. The text of a turn: `Bubble` inside `MessageContent`, `variant="ghost"` for an answer that reads as a document. An event nobody said (a date, a tool call, "Conversation resumed"): `Marker`, `variant="separator"` between days. A file sent or received: `Attachment`, several in an `AttachmentGroup`. Questions the assistant asks one at a time: `Questionnaire`; a form shown all at once, outside the thread: `Field`s in a `form`.

## Constraints

- **MUST** — set `state` from the real upload: `uploading` while bytes are sent, `processing` while the server reads the file, `error` when it failed, `done` when it is usable
- **MUST** — show the file name in `AttachmentTitle` and its size or type in `AttachmentDescription`; on `error`, say what failed in `AttachmentDescription`
- **MUST** — give every `AttachmentAction` an `aria-label` that names the action and the file ("Remove report.pdf")
- **MUST NOT** — put more than 2 `AttachmentAction`s in a tile → open a `DropdownMenu` from one of them
- **MUST** — place `AttachmentTrigger` as the last child of the tile, with the file name as its accessible name, when the tile opens the file
- **Note** — the `size` of `Attachment` takes `default`, `sm` and `xs`; the `size` of `AttachmentAction` takes the `Button` scale and defaults to `icon-xs`
- **Note** — the tile orders its own parts with raw z-index values: `AttachmentTrigger` (`z-10`) lies over the media and the content, `AttachmentActions` (`z-20`) over the trigger. They are internal to the component, declared in `tokens/allow-raw.registry.json` (`local-stacking`) and listed in `specs/foundations/elevation.md`

## Dependencies

- `class-variance-authority` for the `Attachment` and `AttachmentMedia` variants
- `Slot.Root` from `radix-ui` (used by `AttachmentTrigger` when `asChild={true}`)
- `Button` from `@/components/ui/button` (rendered by `AttachmentAction`)
- The focus ring from `@/lib/focus`
- The `shimmer`, `scroll-fade-x` and `no-scrollbar` utilities of `shadcn/tailwind.css`, imported by `styles/globals.css`
- The `cn` utility from `@/lib/utils`

## Anatomy

| Slot                                 | Role                                                                                  |
| ------------------------------------ | ------------------------------------------------------------------------------------- |
| `data-slot="attachment-group"`       | Horizontal scroller of tiles, snapping to each                                        |
| `data-slot="attachment"`             | The tile; carries `data-state`, `data-size`, `data-orientation`; draws the focus ring |
| `data-slot="attachment-media"`       | Square frame for an icon, an image or a `Spinner`; carries `data-variant`             |
| `data-slot="attachment-content"`     | Column of the title and the description                                               |
| `data-slot="attachment-title"`       | File name, truncated; shimmers while `uploading` or `processing`                      |
| `data-slot="attachment-description"` | Size, type or error; turns to `text-destructive` on `error`                           |
| `data-slot="attachment-actions"`     | Buttons above the trigger; in the top corner of a vertical tile                       |
| `data-slot="attachment-action"`      | A `Button`, `ghost` and `icon-xs` by default                                          |
| `data-slot="attachment-trigger"`     | A `button` (or its child with `asChild`) stretched over the tile                      |

## Tokens

<!-- Generated by scripts/build-spec-tokens.ts from the component's code — do not edit by hand. -->

| Token                            | Classes and variables                             | Where                                                                                                                              |
| -------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `border-width.default`           | `border`                                          | `attachmentVariants`                                                                                                               |
| `color.background.subtle`        | `bg-card` · `bg-muted` · `bg-muted/50`            | `attachmentMediaVariants` · `attachmentVariants`                                                                                   |
| `color.border.focus`             | `border-ring` · `ring-ring/50`                    | `attachmentVariants` via `FOCUS_RING_WITHIN` (`lib/focus.ts`)                                                                      |
| `color.feedback.error.default`   | `bg-destructive/10` · `border-destructive/30`     | `attachmentMediaVariants` · `attachmentVariants`                                                                                   |
| `color.text.default`             | `text-card-foreground` · `text-foreground`        | `attachmentMediaVariants` · `attachmentVariants`                                                                                   |
| `color.text.destructive.default` | `text-destructive`                                | `AttachmentDescription` · `attachmentMediaVariants`                                                                                |
| `color.text.subtle`              | `text-muted-foreground`                           | `AttachmentDescription`                                                                                                            |
| `space.focus-ring-width`         | `ring-(length:--space-focus-ring-width)`          | `attachmentVariants` via `FOCUS_RING_WITHIN` (`lib/focus.ts`)                                                                      |
| `space.scale.0`                  | `inset-0` · `min-w-0`                             | `AttachmentContent` · `AttachmentDescription` · `AttachmentGroup` · `AttachmentTitle` · `AttachmentTrigger` · `attachmentVariants` |
| `space.scale.0-5`                | `mt-0.5`                                          | `AttachmentDescription`                                                                                                            |
| `space.scale.1`                  | `gap-1` · `p-1` · `px-1` · `py-1` · `scroll-px-1` | `AttachmentActions` · `AttachmentContent` · `AttachmentGroup` · `attachmentVariants.size.sm` · `attachmentVariants.size.xs`        |
| `space.scale.1-5`                | `gap-1.5` · `p-1.5` · `px-1.5` · `py-1.5`         | `attachmentVariants.size.default` · `attachmentVariants.size.sm` · `attachmentVariants.size.xs`                                    |
| `space.scale.10`                 | `w-10`                                            | `attachmentMediaVariants`                                                                                                          |
| `space.scale.2`                  | `gap-2` · `px-2`                                  | `attachmentVariants.size.default`                                                                                                  |
| `space.scale.2-5`                | `gap-2.5`                                         | `attachmentVariants.size.sm`                                                                                                       |
| `space.scale.24`                 | `w-24`                                            | `attachmentVariants.orientation.vertical`                                                                                          |
| `space.scale.3`                  | `gap-3` · `right-3` · `top-3`                     | `AttachmentActions` · `AttachmentGroup`                                                                                            |
| `space.scale.3-5`                | `size-3.5`                                        | `attachmentMediaVariants`                                                                                                          |
| `space.scale.32`                 | `w-32`                                            | `attachmentVariants.orientation.vertical`                                                                                          |
| `space.scale.4`                  | `size-4`                                          | `attachmentMediaVariants`                                                                                                          |
| `space.scale.40`                 | `min-w-40`                                        | `attachmentVariants.orientation.horizontal`                                                                                        |
| `space.scale.6`                  | `size-6`                                          | `attachmentMediaVariants`                                                                                                          |
| `space.scale.7`                  | `w-7`                                             | `attachmentMediaVariants`                                                                                                          |
| `space.scale.8`                  | `w-8`                                             | `attachmentMediaVariants`                                                                                                          |
| `typography.font-weight.medium`  | `font-medium`                                     | `AttachmentTitle`                                                                                                                  |
| `typography.line-height.tight`   | `leading-tight`                                   | `AttachmentContent`                                                                                                                |
| `typography.size-line-height.xs` | `text-xs`                                         | `AttachmentDescription` · `attachmentVariants.size.default` · `attachmentVariants.size.sm` · `attachmentVariants.size.xs`          |
| `typography.size.xs`             | `text-xs`                                         | `AttachmentDescription` · `attachmentVariants.size.default` · `attachmentVariants.size.sm` · `attachmentVariants.size.xs`          |

Collected from `components/ui/attachment.tsx` and the `lib/` constants it imports; Tailwind resolves each class down to its semantic token. **Where**: the sub-component, the `cva` variant path or the constant the class comes from. Classes that read no token (`w-full`, `flex`, layout) are left out.

Composes `Button` — its tokens are listed in its own spec.

## Props / API

<!-- Generated by scripts/build-spec-api.ts from the TypeScript exports. Only the descriptions are edited by hand; they are kept. -->

### `Attachment`

Renders `<div>`.

| Prop          | Type                                                         | Default        | Description                                                                                       |
| ------------- | ------------------------------------------------------------ | -------------- | ------------------------------------------------------------------------------------------------- |
| `size`        | `"default" \| "sm" \| "xs"`                                  | `"default"`    | See **Variants**                                                                                  |
| `orientation` | `"horizontal" \| "vertical"`                                 | `"horizontal"` | See **Variants**                                                                                  |
| `state`       | `"idle" \| "uploading" \| "processing" \| "error" \| "done"` | `"done"`       | Upload state of the file: sets the border, the media color and the title shimmer (see **States**) |
| `...props`    | `React.ComponentProps<"div">`                                | —              | Native `<div>` props                                                                              |

### `AttachmentGroup`

Renders `<div>`.

| Prop       | Type                          | Default | Description          |
| ---------- | ----------------------------- | ------- | -------------------- |
| `...props` | `React.ComponentProps<"div">` | —       | Native `<div>` props |

### `AttachmentMedia`

Renders `<div>`.

| Prop       | Type                          | Default  | Description          |
| ---------- | ----------------------------- | -------- | -------------------- |
| `variant`  | `"icon" \| "image"`           | `"icon"` | See **Variants**     |
| `...props` | `React.ComponentProps<"div">` | —        | Native `<div>` props |

### `AttachmentContent`

Renders `<div>`.

| Prop       | Type                          | Default | Description          |
| ---------- | ----------------------------- | ------- | -------------------- |
| `...props` | `React.ComponentProps<"div">` | —       | Native `<div>` props |

### `AttachmentTitle`

Renders `<span>`.

| Prop       | Type                           | Default | Description           |
| ---------- | ------------------------------ | ------- | --------------------- |
| `...props` | `React.ComponentProps<"span">` | —       | Native `<span>` props |

### `AttachmentDescription`

Renders `<span>`.

| Prop       | Type                           | Default | Description           |
| ---------- | ------------------------------ | ------- | --------------------- |
| `...props` | `React.ComponentProps<"span">` | —       | Native `<span>` props |

### `AttachmentActions`

Renders `<div>`.

| Prop       | Type                          | Default | Description          |
| ---------- | ----------------------------- | ------- | -------------------- |
| `...props` | `React.ComponentProps<"div">` | —       | Native `<div>` props |

### `AttachmentAction`

Renders `Button`.

| Prop       | Type                                                                                 | Default     | Description                  |
| ---------- | ------------------------------------------------------------------------------------ | ----------- | ---------------------------- |
| `size`     | `"default" \| "xs" \| "sm" \| "lg" \| "icon" \| "icon-xs" \| "icon-sm" \| "icon-lg"` | `"icon-xs"` | `Button` prop — see its spec |
| `...props` | `React.ComponentProps<typeof Button>`                                                | —           | `Button` props               |

### `AttachmentTrigger`

Renders `<button>`, or its child with `asChild`.

| Prop       | Type                             | Default | Description                                                                      |
| ---------- | -------------------------------- | ------- | -------------------------------------------------------------------------------- |
| `asChild`  | `boolean`                        | `false` | Renders the first child instead, passing it the props and classes (Radix `Slot`) |
| `...props` | `React.ComponentProps<"button">` | —       | Native `<button>` props                                                          |

<!-- End of the generated part. -->

## Variants

<!-- Generated by scripts/build-spec-variants.ts from mcp-server/context/component-variants.json — do not edit by hand. -->

| Component         | Axis          | Values                    | Default |
| ----------------- | ------------- | ------------------------- | ------- |
| `Attachment`      | `size`        | `default` · `sm` · `xs`   | —       |
| `Attachment`      | `orientation` | `horizontal` · `vertical` | —       |
| `AttachmentMedia` | `variant`     | `icon` · `image`          | `icon`  |

What each axis means (appearance, intent, size…) is stated under **Props / API**.

## States

| State      | Description                                                                            |
| ---------- | -------------------------------------------------------------------------------------- |
| done       | Default: solid border, image preview in color                                          |
| idle       | Dashed border: an empty slot waiting for a file                                        |
| uploading  | The title shimmers; an image preview stays in grayscale                                |
| processing | Same as `uploading`, while the server reads the file                                   |
| error      | Border, media and description take the error color (`destructive`)                     |
| hover      | A tile holding a trigger or a link takes a `bg-muted/50` background                    |
| focus      | The tile draws the focus ring when its trigger or an action has focus (`focus-within`) |
| active     | Not applicable                                                                         |
| disabled   | Not applicable; a disabled `AttachmentAction` follows `Button`                         |

## Accessibility

**Pattern**: A button (the trigger) and its secondary buttons (the actions), in a group

**Role**: `Attachment` is a `div` with no role. `AttachmentTrigger` is a native `button`, or a link through `asChild`. Each `AttachmentAction` is a `Button`.

**Keyboard**:

| Key                        | Action                                              |
| -------------------------- | --------------------------------------------------- |
| `Tab`                      | Moves to each action, then to the trigger           |
| `Enter`/`Space`            | Opens the file (trigger) or runs the action         |
| `ArrowLeft` / `ArrowRight` | Scrolls an `AttachmentGroup` horizontally, natively |

**Accessible name**: The trigger is stretched over the tile and holds no text: name it with `aria-label` (the file name, "Open report.pdf"). Each action is named by its `aria-label`.

**Pitfalls**:

- The upload state is shown by a shimmer and a color only: announce it in `AttachmentDescription` ("Uploading, 40%") or through a `role="status"` region.
- An image preview needs `alt` text; a type icon is decorative.
- The trigger covers the tile: an action outside `AttachmentActions` sits under it and cannot be clicked.

## Code example

```tsx
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "@/components/ui/attachment"
import { Spinner } from "@/components/ui/spinner"
import { FilePdfIcon, XIcon } from "@phosphor-icons/react"

export default function Example() {
  return (
    <AttachmentGroup>
      <Attachment>
        <AttachmentMedia>
          <FilePdfIcon />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>report.pdf</AttachmentTitle>
          <AttachmentDescription>2.4 MB</AttachmentDescription>
        </AttachmentContent>
        <AttachmentActions>
          <AttachmentAction aria-label="Remove report.pdf">
            <XIcon />
          </AttachmentAction>
        </AttachmentActions>
        <AttachmentTrigger aria-label="Open report.pdf" />
      </Attachment>
      <Attachment state="uploading">
        <AttachmentMedia>
          <Spinner />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>photo.jpg</AttachmentTitle>
          <AttachmentDescription>Uploading, 40%</AttachmentDescription>
        </AttachmentContent>
      </Attachment>
    </AttachmentGroup>
  )
}
```

## Cross-references

- `Message` — the turn a file is sent in, in its `MessageContent`
- `Button` — rendered by `AttachmentAction`, with its variants and sizes
- `Spinner` — the media of a tile while it uploads
- `Item` — a row in a list of files outside a conversation
- `Progress` — a determinate upload progress, under the tile
