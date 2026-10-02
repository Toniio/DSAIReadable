# Questionnaire

## Metadata

| Field         | Value                           |
| ------------- | ------------------------------- |
| Name          | Questionnaire                   |
| Category      | Conversation                    |
| Status        | beta                            |
| figma_node_id |                                 |
| code_path     | components/ui/questionnaire.tsx |

## Role

A form that asks one question at a time — single or multiple choice, or a free answer — with its progress and the controls to go back, skip, go on and submit.

## Usage

- Ask the user a few questions inside a conversation before the assistant acts (the trip's dates, the report's audience)
- Offer single choices (radio) or, with `multiple` on `QuestionnaireItem`, several choices (checkbox)
- Take a free answer with a `QuestionnaireInput`, alone or under the choices
- Let the user answer with the keyboard: `shortcuts="letters"` or `"numbers"` on `Questionnaire` labels the choices A, B, C… or 1, 2, 3…
- Show where the user is with `QuestionnaireProgress` ("Question 2 of 5")
- Read the answers from the `onSubmit` of the form, as with any `form`

<!-- rule-23: generated from design-system.index.json by scripts/build-spec-choices.ts — do not edit by hand. -->

- **Choice** (`rule-23`) — Build a conversation from its family, one component per job. The scrolling thread that follows new messages: `MessageScroller`, one `MessageScrollerItem` per message. One turn of a speaker, with avatar, header and footer: `Message`, `align="end"` for the user's own turns. The text of a turn: `Bubble` inside `MessageContent`, `variant="ghost"` for an answer that reads as a document. An event nobody said (a date, a tool call, "Conversation resumed"): `Marker`, `variant="separator"` between days. A file sent or received: `Attachment`, several in an `AttachmentGroup`. Questions the assistant asks one at a time: `Questionnaire`; a form shown all at once, outside the thread: `Field`s in a `form`.

## Constraints

- **MUST** — give each `QuestionnaireItem` a unique `name`: it is the answer's field name in the submitted form
- **MUST** — give each question a `QuestionnaireTitle`, the question itself
- **MUST** — place `QuestionnairePrevious`, `QuestionnaireSkip`, `QuestionnaireNext` and `QuestionnaireSubmit` in one `QuestionnaireActions`, after the items
- **MUST NOT** — ask more than 7 questions in one questionnaire → split the task, or use a page with `Field`s
- **MUST NOT** — offer more than 9 choices with `shortcuts="numbers"`: the digits stop at 9
- **MUST** — mark a question `required` when it cannot be skipped: `QuestionnaireSkip` then stays hidden for it
- **MUST NOT** — use a `Questionnaire` for a form whose fields are all read at once → `Field`s in a `form`
- **Note** — `@shadcn/react` provides the behavior (the current question, the keyboard, validation, the progress bar); this file styles it
- **Note** — the transparent native input of each choice lies over its indicator and label with a raw `z-10`, internal to the component, declared in `tokens/allow-raw.registry.json` (`local-stacking`) and listed in `specs/foundations/elevation.md`

## Dependencies

- `@shadcn/react/questionnaire` for the primitive
- `buttonVariants` from `@/components/ui/button` (the look of the four navigation buttons)
- `CheckIcon` from `@phosphor-icons/react`
- `UI_STRINGS.questionnaire` from `@/lib/ui-strings` for the progress name and the button labels
- The focus ring from `@/lib/focus`
- The `cn` utility from `@/lib/utils`

## Anatomy

| Slot                                           | Role                                                                                     |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `data-slot="questionnaire"`                    | The `form`                                                                               |
| `data-slot="questionnaire-progress"`           | Progress bar (`role="progressbar"`) whose text is "Question 2 of 5"                      |
| `data-slot="questionnaire-item"`               | One question, a `fieldset`; only the current one is shown                                |
| `data-slot="questionnaire-title"`              | The question, the `legend` of the `fieldset`                                             |
| `data-slot="questionnaire-description"`        | A hint under the question                                                                |
| `data-slot="questionnaire-choices"`            | Grid of the choices                                                                      |
| `data-slot="questionnaire-choice"`             | One choice, a `label` over a transparent native `input`; carries `data-checked`          |
| `data-slot="questionnaire-choice-indicator"`   | Radio dot or checkbox check, drawn from the choice's state                               |
| `data-slot="questionnaire-choice-label"`       | The choice's text                                                                        |
| `data-slot="questionnaire-choice-shortcut"`    | The key that picks the choice (A, 1), shown with `shortcuts`                             |
| `data-slot="questionnaire-choice-description"` | A second line under the choice's text                                                    |
| `data-slot="questionnaire-input"`              | A free answer, styled as `Input`                                                         |
| `data-slot="questionnaire-error"`              | The error of the current question                                                        |
| `data-slot="questionnaire-actions"`            | Row of the navigation buttons: previous at the start, skip and next or submit at the end |

## Tokens

<!-- Generated by scripts/build-spec-tokens.ts from the component's code — do not edit by hand. -->

| Token                                | Classes and variables                                                                                                  | Where                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `border-width.default`               | `border` · `outline-(length:--border-width-default)`                                                                   | `QuestionnaireChoice` · `QuestionnaireInput` · `QuestionnaireNext` via `buttonVariants` · `QuestionnairePrevious` via `buttonVariants` · `QuestionnaireSkip` via `buttonVariants` · `QuestionnaireSubmit` via `buttonVariants`                                                                                                                                                                                                                                                                                                     |
| `color.action.background.default`    | `bg-primary` · `bg-primary/80` · `border-primary`                                                                      | `QuestionnaireChoice` · `QuestionnaireInput` · `QuestionnaireNext` via `buttonVariants.variant.default` · `QuestionnaireSubmit` via `buttonVariants.variant.default`                                                                                                                                                                                                                                                                                                                                                               |
| `color.action.background.foreground` | `bg-primary-foreground` · `text-primary-foreground`                                                                    | `QuestionnaireChoice` · `QuestionnaireInput` · `QuestionnaireNext` via `buttonVariants.variant.default` · `QuestionnaireSubmit` via `buttonVariants.variant.default`                                                                                                                                                                                                                                                                                                                                                               |
| `color.background.default`           | `bg-background`                                                                                                        | `QuestionnaireChoice` · `QuestionnairePrevious` via `buttonVariants.variant.outline` · `QuestionnaireSkip` via `buttonVariants.variant.outline`                                                                                                                                                                                                                                                                                                                                                                                    |
| `color.background.subtle`            | `bg-muted` · `bg-muted/50`                                                                                             | `QuestionnaireChoice` · `QuestionnairePrevious` via `buttonVariants.variant.outline` · `QuestionnaireSkip` via `buttonVariants.variant.outline`                                                                                                                                                                                                                                                                                                                                                                                    |
| `color.border.default`               | `border-border`                                                                                                        | `QuestionnairePrevious` via `buttonVariants.variant.outline` · `QuestionnaireSkip` via `buttonVariants.variant.outline`                                                                                                                                                                                                                                                                                                                                                                                                            |
| `color.border.focus`                 | `border-ring` · `ring-ring/50`                                                                                         | `QuestionnaireChoice` · `QuestionnaireInput` via `FOCUS_RING` (`lib/focus.ts`) · `QuestionnaireNext` via `buttonVariants` via `FOCUS_RING` (`lib/focus.ts`) · `QuestionnairePrevious` via `buttonVariants.variant.outline` · `QuestionnairePrevious` via `buttonVariants` via `FOCUS_RING` (`lib/focus.ts`) · `QuestionnaireSkip` via `buttonVariants.variant.outline` · `QuestionnaireSkip` via `buttonVariants` via `FOCUS_RING` (`lib/focus.ts`) · `QuestionnaireSubmit` via `buttonVariants` via `FOCUS_RING` (`lib/focus.ts`) |
| `color.border.input`                 | `bg-input/30` · `bg-input/50` · `bg-input/80` · `border-input`                                                         | `QuestionnaireChoice` · `QuestionnaireInput` · `QuestionnairePrevious` via `buttonVariants.variant.outline` · `QuestionnaireSkip` via `buttonVariants.variant.outline`                                                                                                                                                                                                                                                                                                                                                             |
| `color.feedback.error.default`       | `border-destructive` · `border-destructive/50` · `outline-destructive` · `ring-destructive/20` · `ring-destructive/40` | `QuestionnaireChoice` · `QuestionnaireInput` · `QuestionnaireNext` via `buttonVariants` · `QuestionnairePrevious` via `buttonVariants` · `QuestionnaireSkip` via `buttonVariants` · `QuestionnaireSubmit` via `buttonVariants`                                                                                                                                                                                                                                                                                                     |
| `color.text.default`                 | `border-foreground/30` · `text-foreground`                                                                             | `QuestionnaireChoice` · `QuestionnairePrevious` via `buttonVariants.variant.outline` · `QuestionnaireSkip` via `buttonVariants.variant.outline`                                                                                                                                                                                                                                                                                                                                                                                    |
| `color.text.destructive.default`     | `text-destructive`                                                                                                     | `QuestionnaireError`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `color.text.subtle`                  | `text-muted-foreground`                                                                                                | `QuestionnaireChoiceDescription` · `QuestionnaireChoice` · `QuestionnaireDescription` · `QuestionnaireInput` · `QuestionnaireProgress`                                                                                                                                                                                                                                                                                                                                                                                             |
| `motion.duration.fast`               | `transition-all` · `transition-colors`                                                                                 | `QuestionnaireChoice` · `QuestionnaireInput` · `QuestionnaireNext` via `buttonVariants` · `QuestionnairePrevious` via `buttonVariants` · `QuestionnaireSkip` via `buttonVariants` · `QuestionnaireSubmit` via `buttonVariants`                                                                                                                                                                                                                                                                                                     |
| `motion.easing.default`              | `transition-all` · `transition-colors`                                                                                 | `QuestionnaireChoice` · `QuestionnaireInput` · `QuestionnaireNext` via `buttonVariants` · `QuestionnairePrevious` via `buttonVariants` · `QuestionnaireSkip` via `buttonVariants` · `QuestionnaireSubmit` via `buttonVariants`                                                                                                                                                                                                                                                                                                     |
| `opacity.disabled`                   | `opacity-disabled`                                                                                                     | `QuestionnaireChoice` · `QuestionnaireInput` · `QuestionnaireNext` via `buttonVariants` · `QuestionnairePrevious` via `buttonVariants` · `QuestionnaireSkip` via `buttonVariants` · `QuestionnaireSubmit` via `buttonVariants`                                                                                                                                                                                                                                                                                                     |
| `space.focus-ring-width`             | `ring-(length:--space-focus-ring-width)`                                                                               | `QuestionnaireChoice` · `QuestionnaireInput` via `FOCUS_RING` (`lib/focus.ts`) · `QuestionnaireNext` via `buttonVariants` via `FOCUS_RING` (`lib/focus.ts`) · `QuestionnairePrevious` via `buttonVariants` via `FOCUS_RING` (`lib/focus.ts`) · `QuestionnaireSkip` via `buttonVariants` via `FOCUS_RING` (`lib/focus.ts`) · `QuestionnaireSubmit` via `buttonVariants` via `FOCUS_RING` (`lib/focus.ts`)                                                                                                                           |
| `space.scale.0`                      | `inset-0` · `min-h-0` · `min-w-0` · `p-0`                                                                              | `QuestionnaireChoice` · `QuestionnaireChoices` · `QuestionnaireInput` · `QuestionnaireItem` · `QuestionnaireNext` · `QuestionnairePrevious` · `QuestionnaireSkip` · `QuestionnaireSubmit` · `Questionnaire`                                                                                                                                                                                                                                                                                                                        |
| `space.scale.0-5`                    | `gap-0.5` · `translate-y-0.5`                                                                                          | `QuestionnaireChoice`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `space.scale.1`                      | `py-1`                                                                                                                 | `QuestionnaireInput`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `space.scale.1-5`                    | `gap-1.5`                                                                                                              | `QuestionnaireActions` · `QuestionnaireNext` via `buttonVariants.size.default` · `QuestionnairePrevious` via `buttonVariants.size.default` · `QuestionnaireSkip` via `buttonVariants.size.default` · `QuestionnaireSubmit` via `buttonVariants.size.default`                                                                                                                                                                                                                                                                       |
| `space.scale.11`                     | `min-h-11`                                                                                                             | `QuestionnaireActions` · `QuestionnaireChoice` · `QuestionnaireInput` · `QuestionnaireNext` · `QuestionnairePrevious` · `QuestionnaireSkip` · `QuestionnaireSubmit`                                                                                                                                                                                                                                                                                                                                                                |
| `space.scale.2`                      | `gap-2` · `mt-2` · `pl-2` · `pr-2` · `size-2`                                                                          | `QuestionnaireChoice` · `QuestionnaireChoices` · `QuestionnaireError` · `QuestionnaireNext` via `buttonVariants.size.default` · `QuestionnairePrevious` via `buttonVariants.size.default` · `QuestionnaireSkip` via `buttonVariants.size.default` · `QuestionnaireSubmit` via `buttonVariants.size.default`                                                                                                                                                                                                                        |
| `space.scale.2-5`                    | `gap-2.5` · `px-2.5` · `py-2.5`                                                                                        | `QuestionnaireChoice` · `QuestionnaireInput` · `QuestionnaireNext` via `buttonVariants.size.default` · `QuestionnairePrevious` via `buttonVariants.size.default` · `QuestionnaireSkip` via `buttonVariants.size.default` · `QuestionnaireSubmit` via `buttonVariants.size.default`                                                                                                                                                                                                                                                 |
| `space.scale.28`                     | `min-w-28`                                                                                                             | `QuestionnaireProgress`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `space.scale.3`                      | `px-3`                                                                                                                 | `QuestionnaireChoice`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `space.scale.3-5`                    | `size-3.5`                                                                                                             | `QuestionnaireChoice`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `space.scale.4`                      | `gap-4` · `mb-4` · `size-4`                                                                                            | `QuestionnaireChoice` · `QuestionnaireItem` · `QuestionnaireNext` via `buttonVariants` · `QuestionnairePrevious` via `buttonVariants` · `QuestionnaireSkip` via `buttonVariants` · `QuestionnaireSubmit` via `buttonVariants` · `QuestionnaireTitle` · `Questionnaire`                                                                                                                                                                                                                                                             |
| `space.scale.8`                      | `h-8` · `min-h-8`                                                                                                      | `QuestionnaireActions` · `QuestionnaireInput` · `QuestionnaireNext` via `buttonVariants.size.default` · `QuestionnairePrevious` via `buttonVariants.size.default` · `QuestionnaireSkip` via `buttonVariants.size.default` · `QuestionnaireSubmit` via `buttonVariants.size.default`                                                                                                                                                                                                                                                |
| `typography.font-family.mono`        | `font-heading` · `font-mono`                                                                                           | `QuestionnaireChoice` · `QuestionnaireTitle`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `typography.font-weight.medium`      | `font-medium`                                                                                                          | `QuestionnaireChoice` · `QuestionnaireNext` via `buttonVariants` · `QuestionnairePrevious` via `buttonVariants` · `QuestionnaireProgress` · `QuestionnaireSkip` via `buttonVariants` · `QuestionnaireSubmit` via `buttonVariants` · `QuestionnaireTitle`                                                                                                                                                                                                                                                                           |
| `typography.line-height.relaxed`     | `text-xs/relaxed`                                                                                                      | `QuestionnaireDescription`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `typography.line-height.snug`        | `leading-snug`                                                                                                         | `QuestionnaireChoice`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `typography.size-line-height.sm`     | `text-sm`                                                                                                              | `QuestionnaireTitle`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `typography.size-line-height.xs`     | `text-xs`                                                                                                              | `QuestionnaireChoice` · `QuestionnaireError` · `QuestionnaireInput` · `QuestionnaireNext` via `buttonVariants` · `QuestionnairePrevious` via `buttonVariants` · `QuestionnaireProgress` · `QuestionnaireSkip` via `buttonVariants` · `QuestionnaireSubmit` via `buttonVariants`                                                                                                                                                                                                                                                    |
| `typography.size.sm`                 | `text-sm`                                                                                                              | `QuestionnaireTitle`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `typography.size.xs`                 | `text-xs` · `text-xs/relaxed`                                                                                          | `QuestionnaireChoice` · `QuestionnaireDescription` · `QuestionnaireError` · `QuestionnaireInput` · `QuestionnaireNext` via `buttonVariants` · `QuestionnairePrevious` via `buttonVariants` · `QuestionnaireProgress` · `QuestionnaireSkip` via `buttonVariants` · `QuestionnaireSubmit` via `buttonVariants`                                                                                                                                                                                                                       |

Collected from `components/ui/questionnaire.tsx`, the `lib/` constants it imports and the `buttonVariants` classes it applies (`size` `default`, `variant` `outline` or `default`); Tailwind resolves each class down to its semantic token. **Where**: the sub-component, the `cva` variant path or the constant the class comes from; for a class it applies through another component's `cva`, the part that applies it, then where the class sits there. Classes that read no token (`w-full`, `flex`, layout) are left out.

Composes `Button` — its tokens are listed in its own spec.

## Props / API

<!-- Generated by scripts/build-spec-api.ts from the TypeScript exports. Only the descriptions are edited by hand; they are kept. -->

### `Questionnaire`

Renders `QuestionnairePrimitive.Root`.

| Prop       | Type                                                       | Default | Description                         |
| ---------- | ---------------------------------------------------------- | ------- | ----------------------------------- |
| `...props` | `React.ComponentProps<typeof QuestionnairePrimitive.Root>` | —       | `QuestionnairePrimitive.Root` props |

### `QuestionnaireActions`

Renders `<div>`.

| Prop       | Type                          | Default | Description          |
| ---------- | ----------------------------- | ------- | -------------------- |
| `...props` | `React.ComponentProps<"div">` | —       | Native `<div>` props |

### `QuestionnaireChoice`

Renders `QuestionnairePrimitive.Choice`.

| Prop       | Type                                                         | Default | Description                           |
| ---------- | ------------------------------------------------------------ | ------- | ------------------------------------- |
| `...props` | `React.ComponentProps<typeof QuestionnairePrimitive.Choice>` | —       | `QuestionnairePrimitive.Choice` props |

### `QuestionnaireChoiceDescription`

Renders `<span>`.

| Prop       | Type                           | Default | Description           |
| ---------- | ------------------------------ | ------- | --------------------- |
| `...props` | `React.ComponentProps<"span">` | —       | Native `<span>` props |

### `QuestionnaireChoices`

Renders `QuestionnairePrimitive.Choices`.

| Prop       | Type                                                          | Default | Description                            |
| ---------- | ------------------------------------------------------------- | ------- | -------------------------------------- |
| `...props` | `React.ComponentProps<typeof QuestionnairePrimitive.Choices>` | —       | `QuestionnairePrimitive.Choices` props |

### `QuestionnaireDescription`

Renders `QuestionnairePrimitive.Description`.

| Prop       | Type                                                              | Default | Description                                |
| ---------- | ----------------------------------------------------------------- | ------- | ------------------------------------------ |
| `...props` | `React.ComponentProps<typeof QuestionnairePrimitive.Description>` | —       | `QuestionnairePrimitive.Description` props |

### `QuestionnaireError`

Renders `QuestionnairePrimitive.Error`.

| Prop       | Type                                                        | Default | Description                          |
| ---------- | ----------------------------------------------------------- | ------- | ------------------------------------ |
| `...props` | `React.ComponentProps<typeof QuestionnairePrimitive.Error>` | —       | `QuestionnairePrimitive.Error` props |

### `QuestionnaireInput`

Renders `QuestionnairePrimitive.Input`, inside a `<div>`.

| Prop       | Type                                                        | Default | Description                          |
| ---------- | ----------------------------------------------------------- | ------- | ------------------------------------ |
| `...props` | `React.ComponentProps<typeof QuestionnairePrimitive.Input>` | —       | `QuestionnairePrimitive.Input` props |

### `QuestionnaireItem`

Renders `QuestionnairePrimitive.Item`.

| Prop       | Type                                                       | Default | Description                         |
| ---------- | ---------------------------------------------------------- | ------- | ----------------------------------- |
| `...props` | `React.ComponentProps<typeof QuestionnairePrimitive.Item>` | —       | `QuestionnairePrimitive.Item` props |

### `QuestionnaireNext`

Renders `QuestionnairePrimitive.Next`.

| Prop       | Type                                                                                                                        | Default     | Description                         |
| ---------- | --------------------------------------------------------------------------------------------------------------------------- | ----------- | ----------------------------------- |
| `variant`  | `"link" \| "default" \| "destructive" \| "outline" \| "secondary" \| "ghost"`                                               | `"default"` | `Button` prop — see its spec        |
| `size`     | `"default" \| "xs" \| "sm" \| "lg" \| "icon" \| "icon-xs" \| "icon-sm" \| "icon-lg"`                                        | `"default"` | `Button` prop — see its spec        |
| `...props` | `React.ComponentProps<typeof QuestionnairePrimitive.Next> & Pick<React.ComponentProps<typeof Button>, "size" \| "variant">` | —           | `QuestionnairePrimitive.Next` props |

### `QuestionnairePrevious`

Renders `QuestionnairePrimitive.Previous`.

| Prop       | Type                                                                                                                            | Default     | Description                             |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------- | ----------- | --------------------------------------- |
| `variant`  | `"link" \| "default" \| "destructive" \| "outline" \| "secondary" \| "ghost"`                                                   | `"outline"` | `Button` prop — see its spec            |
| `size`     | `"default" \| "xs" \| "sm" \| "lg" \| "icon" \| "icon-xs" \| "icon-sm" \| "icon-lg"`                                            | `"default"` | `Button` prop — see its spec            |
| `...props` | `React.ComponentProps<typeof QuestionnairePrimitive.Previous> & Pick<React.ComponentProps<typeof Button>, "size" \| "variant">` | —           | `QuestionnairePrimitive.Previous` props |

### `QuestionnaireProgress`

Renders `QuestionnairePrimitive.Progress`.

| Prop       | Type                                                           | Default | Description                             |
| ---------- | -------------------------------------------------------------- | ------- | --------------------------------------- |
| `...props` | `React.ComponentProps<typeof QuestionnairePrimitive.Progress>` | —       | `QuestionnairePrimitive.Progress` props |

### `QuestionnaireSkip`

Renders `QuestionnairePrimitive.Skip`.

| Prop       | Type                                                                                                                        | Default     | Description                         |
| ---------- | --------------------------------------------------------------------------------------------------------------------------- | ----------- | ----------------------------------- |
| `variant`  | `"link" \| "default" \| "destructive" \| "outline" \| "secondary" \| "ghost"`                                               | `"outline"` | `Button` prop — see its spec        |
| `size`     | `"default" \| "xs" \| "sm" \| "lg" \| "icon" \| "icon-xs" \| "icon-sm" \| "icon-lg"`                                        | `"default"` | `Button` prop — see its spec        |
| `...props` | `React.ComponentProps<typeof QuestionnairePrimitive.Skip> & Pick<React.ComponentProps<typeof Button>, "size" \| "variant">` | —           | `QuestionnairePrimitive.Skip` props |

### `QuestionnaireSubmit`

Renders `QuestionnairePrimitive.Submit`.

| Prop       | Type                                                                                                                          | Default     | Description                           |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------- |
| `variant`  | `"link" \| "default" \| "destructive" \| "outline" \| "secondary" \| "ghost"`                                                 | `"default"` | `Button` prop — see its spec          |
| `size`     | `"default" \| "xs" \| "sm" \| "lg" \| "icon" \| "icon-xs" \| "icon-sm" \| "icon-lg"`                                          | `"default"` | `Button` prop — see its spec          |
| `...props` | `React.ComponentProps<typeof QuestionnairePrimitive.Submit> & Pick<React.ComponentProps<typeof Button>, "size" \| "variant">` | —           | `QuestionnairePrimitive.Submit` props |

### `QuestionnaireTitle`

Renders `QuestionnairePrimitive.Title`.

| Prop       | Type                                                        | Default | Description                          |
| ---------- | ----------------------------------------------------------- | ------- | ------------------------------------ |
| `...props` | `React.ComponentProps<typeof QuestionnairePrimitive.Title>` | —       | `QuestionnairePrimitive.Title` props |

<!-- End of the generated part. -->

## Variants

<!-- Generated by scripts/build-spec-variants.ts from mcp-server/context/component-variants.json — do not edit by hand. -->

No variant axis: the component does not call `cva()`. Its appearance is set through its props and, as a last resort, through `className` with token classes.

## States

<!-- Generated by scripts/build-spec-states.ts from the component's classes. Only the descriptions are edited by hand; they are kept. -->

| State         | Classes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Description                                                                                                                                                                                                                                                                                                                                              |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `default`     | —                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Choices with an `input` border and a transparent background                                                                                                                                                                                                                                                                                              |
| `hover`       | `dark:hover:bg-input/50` · `hover:bg-muted` · `hover:bg-muted/50` · `hover:bg-primary/80` · `hover:text-foreground`                                                                                                                                                                                                                                                                                                                                                                        | A choice takes `hover:bg-muted/50`; `QuestionnairePrevious` and `QuestionnaireSkip`, `outline` unless `variant` says otherwise, take `hover:bg-muted` and `hover:text-foreground` from `buttonVariants` (`dark:hover:bg-input/50` in dark mode), and `QuestionnaireNext` and `QuestionnaireSubmit`, on the `default` variant, take `hover:bg-primary/80` |
| `focus`       | `aria-invalid:focus-visible:outline-(length:--border-width-default)` · `aria-invalid:focus-visible:outline-destructive` · `aria-invalid:focus-visible:outline-solid` · `dark:focus-visible:border-ring` · `focus-visible:border-ring` · `focus-visible:ring-(length:--space-focus-ring-width)` · `focus-visible:ring-ring/50` · `has-[>input:focus-visible]:border-ring` · `has-[>input:focus-visible]:ring-(length:--space-focus-ring-width)` · `has-[>input:focus-visible]:ring-ring/50` | The choice draws the focus ring when its hidden input has focus; the input draws its own, and so do the four buttons, through `buttonVariants`                                                                                                                                                                                                           |
| `active`      | `active:not-aria-[haspopup]:translate-y-px`                                                                                                                                                                                                                                                                                                                                                                                                                                                | The four buttons shift down while pressed (`active:not-aria-[haspopup]:translate-y-px`, from `buttonVariants`)                                                                                                                                                                                                                                           |
| `checked`     | `data-checked:bg-muted` · `data-checked:border-foreground/30` · `group-data-checked/questionnaire-choice:bg-primary` · `group-data-checked/questionnaire-choice:block` · `group-data-checked/questionnaire-choice:border-primary` · `group-data-checked/questionnaire-choice:text-primary-foreground`                                                                                                                                                                                      | `data-checked`: the choice takes `bg-muted` and a `border-foreground/30` border; the indicator takes the primary fill (`bg-primary`, `border-primary`) and shows its dot or check                                                                                                                                                                        |
| `open`        | `aria-expanded:bg-muted` · `aria-expanded:text-foreground` · `dark:aria-expanded:bg-muted`                                                                                                                                                                                                                                                                                                                                                                                                 | `QuestionnairePrevious` and `QuestionnaireSkip`, on the `outline` variant, take `aria-expanded:bg-muted` and `aria-expanded:text-foreground` from `buttonVariants` when given `aria-expanded`, which the questionnaire never sets itself                                                                                                                 |
| `disabled`    | `dark:disabled:bg-input/80` · `data-disabled:cursor-not-allowed` · `data-disabled:opacity-disabled` · `data-disabled:pointer-events-none` · `disabled:bg-input/50` · `disabled:cursor-not-allowed` · `disabled:opacity-disabled` · `disabled:pointer-events-none`                                                                                                                                                                                                                          | `data-disabled` on a choice, `disabled` on the text input: `opacity-disabled`, not clickable; the text input also takes `bg-input/50`; a button given `disabled` takes `disabled:opacity-disabled` and `disabled:pointer-events-none` from `buttonVariants`                                                                                              |
| `error`       | `aria-invalid:border-destructive` · `aria-invalid:focus-visible:outline-(length:--border-width-default)` · `aria-invalid:focus-visible:outline-destructive` · `aria-invalid:focus-visible:outline-solid` · `aria-invalid:ring-destructive/20` · `dark:aria-invalid:border-destructive/50` · `dark:aria-invalid:ring-destructive/40` · `data-invalid:border-destructive`                                                                                                                    | `data-invalid` on a choice, `aria-invalid` on the input: `border-destructive` border, and a `ring-destructive/20` ring on the focused input; `QuestionnaireError` shows why; a button given `aria-invalid`, which the questionnaire never sets on one, takes the same classes from `buttonVariants`                                                      |
| `placeholder` | `placeholder:text-muted-foreground`                                                                                                                                                                                                                                                                                                                                                                                                                                                        | The text input's placeholder in `text-muted-foreground`                                                                                                                                                                                                                                                                                                  |

Collected from `components/ui/questionnaire.tsx`, the `lib/` constants it imports and the `buttonVariants` classes it applies (`size` `default`, `variant` `outline` or `default`). **Classes**: each class whose variants name the state, as written (`dark:` included); a class that stacks two states is listed under both. `—`: no class of its own — `default` is what the other states change.

Composes `Button` — its states are listed in its own spec.

<!-- End of the generated part. -->

## Accessibility

**Pattern**: A form of `fieldset`s with native radio buttons or checkboxes, and a [progress bar](https://www.w3.org/TR/wai-aria-1.2/#progressbar)

**Role**: `Questionnaire` is a `form`; each `QuestionnaireItem` is a `fieldset` named by its `legend` (`QuestionnaireTitle`); each choice is a native `radio` or `checkbox` labeled by its text. `QuestionnaireProgress` is a `progressbar` with `aria-valuetext` "Question 2 of 5".

**Keyboard**:

| Key                    | Action                                                             |
| ---------------------- | ------------------------------------------------------------------ |
| `ArrowUp`/`ArrowDown`  | Moves between the choices of the current question                  |
| `Space`                | Checks the focused choice                                          |
| `Enter`                | On a checked choice: goes to the next question (`Space` checks it) |
| `ArrowLeft`            | Goes back to the previous question                                 |
| `ArrowRight`           | Goes to the next question, once the current one is answered        |
| `A`…`Z` / `1`…`9`      | With `shortcuts`: checks the choice labeled with that key          |
| `Ctrl+Enter`/`⌘+Enter` | Goes on, or submits on the last question                           |

**Accessible name**: The progress bar is named by `UI_STRINGS.questionnaire.progress`; pass `aria-label` to name it otherwise. The navigation buttons read `UI_STRINGS.questionnaire.previous`, `skip`, `next` and `submit`; `children` replace them.

**Pitfalls**:

- The value text of the progress bar, "Question 2 of 5", is written in English by `@shadcn/react`; pass `children` to `QuestionnaireProgress` for another language, and the `aria-valuetext` stays English.
- A choice's shortcut key is announced through `aria-keyshortcuts`; a letter shortcut clashes with typing in a `QuestionnaireInput` of the same question, which `@shadcn/react` ignores keys from.

## Code example

```tsx
import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoices,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "@/components/ui/questionnaire"

export default function Example() {
  return (
    <Questionnaire
      shortcuts="letters"
      onSubmit={(event) => {
        event.preventDefault()
        const answers = new FormData(event.currentTarget)
        console.log(Object.fromEntries(answers))
      }}
    >
      <QuestionnaireProgress />
      <QuestionnaireItem name="audience" required>
        <QuestionnaireTitle>Who is the report for?</QuestionnaireTitle>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="team">My team</QuestionnaireChoice>
          <QuestionnaireChoice value="board">The board</QuestionnaireChoice>
        </QuestionnaireChoices>
      </QuestionnaireItem>
      <QuestionnaireItem name="length" required>
        <QuestionnaireTitle>How long should it be?</QuestionnaireTitle>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="page">One page</QuestionnaireChoice>
          <QuestionnaireChoice value="full">Full report</QuestionnaireChoice>
        </QuestionnaireChoices>
      </QuestionnaireItem>
      <QuestionnaireActions>
        <QuestionnairePrevious />
        <QuestionnaireNext />
        <QuestionnaireSubmit />
      </QuestionnaireActions>
    </Questionnaire>
  )
}
```

## Cross-references

- `Field` — a form whose fields are all shown at once, outside a conversation
- `RadioGroup` — one choice out of a few, in a regular form
- `Checkbox` — several choices, in a regular form
- `Input` — the look `QuestionnaireInput` takes
- `Button` — the look of the four navigation buttons
- `Message` — the assistant's turn that holds the questionnaire, in its `MessageContent`
