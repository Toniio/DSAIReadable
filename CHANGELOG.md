# Changelog

## 0.3.0

### Minor Changes

- 21edf4b: mcp: No answer of the MCP server passes 40,000 characters, under the 25,000 tokens Claude Code accepts from one MCP result by default (`MAX_MCP_OUTPUT_TOKENS`). Over it, the agent reads an error and the path of a file instead of the answer: in the 0.3.0 evals, 19 calls of `dsaireadable_get_design_rules` `detailed` without a category got that error.

  - `dsaireadable_get_design_rules` `detailed` without a category serves the critical rules whole, every foundation's rules (`general_rules`) and the composition rules, as `ds://guidelines` does, with the `categories` to pass and a `detail` line; it stops serving `component_rules`, the constraints of the 65 component specs (73,517 to 36,879 characters). A component's rules stay its `category`'s answer, and `dsaireadable_get_component_specs` serves them as `constraints`.
  - `dsaireadable_get_components`, `dsaireadable_get_tokens` and `dsaireadable_get_changelog` end a page before 40,000 characters, so `limit` is a maximum: `next_cursor` points at the first item left out. A page of 200 tokens came to 62,726 characters, and the changelog's default page to 61,940.
  - `dsaireadable_validate_screen` and `dsaireadable_validate_code` list the issues that fit and count the rest in `issues_not_listed`; `total_issues`, `errors` and `warnings` still count every issue.

- 2a6b96a: skills: `dsaireadable-ui-guard` opens only the reference file of the line it cannot decide, and says that a spec's concise answer holds its limits.
- e81390f: skills: `dsaireadable-build` is removed, from `skills/` and from the Claude Code plugin. The harness measured it against the MCP server alone with claude-sonnet-5-5, three passes each: on new screens (0.3.0 evals, 26 tasks) 96.8 % against 98.1 % conformance at 164,878 input tokens per screen against 95,446; narrowed to changes of an existing screen (the `skills` suite, 8 edit tasks), 21 of 24 against 23 of 24 at a median 59,206 tokens against 35,468 (+22 % once the test environment's own overhead is taken out). The server's instructions, patterns and validation tools carry the workflow: an agent that loaded the skill asks the server directly. `dsaireadable-ui-guard` now reviews a screen when asked to, instead of on every screen built or changed.
- 2ea7672: mcp: The MCP server sends less over a session, since every turn of an agent sends the whole conversation again:

  - `dsaireadable_get_component_specs` `detailed` serves what a screen writes with the component, and stops serving how it is built: `dependencies`, `anatomy`, `tokens`, `tokens_from`, `states`, `variant_sources` and `part_of`, each export's `example`, and the props rows every part has (the `...props` it spreads, a `className` that only adds classes; a `...props` that adds another library's props, and a `className` that says where its classes go, stay). The whole spec stays the resource `ds://component/{name}/spec`. The concise `detail` line names what `detailed` adds, read from it; the concise answer changes only by the constraints the specs gained.
  - `dsaireadable_get_design_rules` serves the two critical rules without their `do` list and their token chain; the prompts still print the `do` list.
  - `dsaireadable_get_pattern` `detailed` serves a relative link of its cross-references as the name it gives, `create` for `[create](./create.md)`, followed by that name in parentheses when the label differs; a link with a scheme stays whole.
  - `dsaireadable_get_components` leaves out `has_spec`, true for every component; the overview and `dsaireadable_get_stats` still count the coverage.
  - The text of every answer, error and resource is compact JSON, as `structuredContent` already was.
  - The 19 tool descriptions and their parameters say the same in fewer words (10,386 to 8,319 characters, sent with every turn), and three wrong facts are put right: `dsaireadable_get_changelog` named a `Deprecated` heading and an `Unreleased` version that do not exist, and `dsaireadable_get_icons` promised a catalog where it serves its URL. `dsaireadable_validate_screen` names the checks it runs.

### Patch Changes

- a9ae8c9: visual: The control of a choice card has a name. Inside a `FieldLabel`, `Field` now renders a plain `<div>` instead of a `<div role="group">`: Chromium and axe leave the text of a group out of the name a `<label>` gives its control, so the `Checkbox`, `RadioGroupItem` or `Switch` of a card built as the Field spec says (a `FieldLabel` wrapping a `Field` with its `FieldContent`, then the control) was announced with no name, and axe reported `button-name`. The card's text names it now, `FieldTitle` then `FieldDescription`. A `Field` outside a `FieldLabel` keeps `role="group"`; no prop, class or look changes.
- 2ea7672: docs: What six States tables asked of a screen is now a constraint of its spec, which `dsaireadable_get_component_specs` serves in both formats: `aria-invalid` on each `InputOTPSlot` (on `InputOTP` it draws nothing); no `disabled` on `PaginationLink`, `PaginationPrevious` or `PaginationNext`, which render an `<a>`; `data-disabled` on the `Field` of a disabled control, and how a choice card is built; a `Command` around the content of a `CommandDialog`, and `data-checked` on a `CommandItem`; a `Spinner` child and `aria-busy` on a pending `Button`; the `border` class for the dashed outline of an `Empty`.

## 0.2.0

### Minor Changes

- 176b028: component-api: Alert and Badge get an `info` variant, for a notice that asks for no action (a tip, a change that took effect; a Beta or Scheduled label). Alert `info` is `text-info` on the card with its description at `text-info/90`; Badge `info` is `text-info` on a `bg-info/10` tint (`/20` in dark), `bg-info-hover` as a link. Both are declared in `shadcn.divergences`, like `success` and `warning`.
- 9dfee97: component-api: Add the `color.background.input` token and its `bg-input-fill` class, the fill of a form control. `--input` stays the border, as in shadcn/ui, and the translucent fills that read it move to the new token with the same values (mist.200 in light, white at 15% in dark): `dark:bg-input/30` becomes `dark:bg-input-fill/30`, `disabled:bg-input/50` becomes `disabled:bg-input-fill/50` and `dark:disabled:bg-input/80` becomes `dark:disabled:bg-input-fill/80` in Bubble, Button, Checkbox, Combobox, Command, Input, InputGroup, InputOTP, NativeSelect, Questionnaire, RadioGroup, Select, Tabs and Textarea, and ButtonGroupSeparator's `bg-input` becomes `bg-input-fill`. Paint a field's fill with `bg-input-fill/<n>`: `bg-input/<n>` is now the 3:1 border color at that opacity.
- ddba411: token-breaking: The color primitives are generated: one OKLCH ramp of 11 steps, `50` to `950`, per hue (mist, violet, red, green, emerald, blue, yellow, amber, plum), on lightness targets every hue shares, each step with its `hex` fallback. `tokens.css` declares them, and the elevation shadows, as `oklch()`. `primitive.color.mist.0` is renamed `primitive.color.white` (`--ds-prim-color-mist-0` to `--ds-prim-color-white`), `violet.550` and `amber.450` are removed, every other color primitive changes value, and each ramp gains the steps it lacked. The primitives stay private: no semantic or component token is renamed, and code that follows the rules reads none of them.
- ddba411: mcp: `dsaireadable_get_tokens` and the token resources serve a color the way `tokens.css` declares it, as `oklch()`, where they served `#rrggbb` or `rgba()`.
- 176b028: lint: `configs.tailwind` rejects a color with an opacity modifier under a state variant: `hover:`, `active:`, `focus:`, and the open, expanded, checked, selected and pressed variants (`hover:bg-primary/80`, `data-open:bg-muted/50`, `has-data-checked:bg-primary/5`). The message names the state token to use. A focus ring keeps its halo alpha (`focus-visible:ring-ring/50`), and a resting tint (`bg-destructive/10`) is not a state.
- 176b028: component-api: Name the interaction states and add the info role. New tokens and classes: `color.action.background.hover` (`bg-primary-hover`, violet.700 light / violet.600 dark), `color.action.background.selected` (`bg-primary-selected`, violet.50 / violet.950), `color.action.secondary.hover` (`bg-secondary-hover`, mist.200 / mist.700), `color.action.tint.hover` (`bg-primary-tint-hover`, violet.200 / violet.700), `color.feedback.error.hover` (`bg-destructive-hover`), `color.feedback.success.hover` (`bg-success-hover`), `color.feedback.warning.hover` (`bg-warning-hover`) and `color.feedback.info.hover` (`bg-info-hover`), each at step 200 in light and 700 in dark; the veils `color.overlay.hover` (`bg-overlay-hover`, ink at 5% light, white at 8% dark) and `color.overlay.selected` (`bg-overlay-selected`, ink at 7% light, white at 8% dark); the info role, `color.feedback.info.default` (`bg-info`, blue.600 / blue.400), `color.feedback.info.foreground` (reserved) and `color.text.info.default` (`text-info`, blue.700 / blue.300). The pressed states `color.action.background.active`, `color.action.secondary.active`, `color.feedback.error.active` and `color.overlay.active` are named and reserved. New primitives: `ink-alpha.5`, `ink-alpha.7` and `white-alpha.8`.
- 0a1ee78: mcp: `dsaireadable_validate_screen` adds a `tooltip-provider` rule: a warning, at the line of the first `<Tooltip>`, on a file that renders a `Tooltip` with neither a `<TooltipProvider>` nor a `<SidebarProvider>`, which supplies one. A `Tooltip` throws `` `Tooltip` must be used within `TooltipProvider` `` without a provider above it. It is a warning, not an error: the provider often lives in the root layout, which a check of one file does not see.

### Patch Changes

- 1e434af: docs: The Chart spec now says that while the pointer rests over a chart, Recharts keeps the tooltip on the hovered data point: focus shows that point, and the arrow keys and `Enter` change nothing visible until the pointer leaves the chart (recharts/recharts#7905). It also says to move the pointer off the chart before a browser test of the keyboard: a pointer an earlier test left over the chart fails the test, depending on the file order.
- 9dfee97: visual: Control borders reach 3:1 (WCAG 1.4.11), and focus moves away from them:

  - `color.border.input`: light #e0e8ea (mist.200) to #708185 (mist.500), dark white at 15% to #708185 (mist.500). The resting border of Input, Textarea, Select, NativeSelect, Checkbox, RadioGroupItem, InputOTPSlot, InputGroup, ComboboxChips, a Questionnaire choice, Calendar's dropdowns and the `outline` Button in dark goes from 1.12–1.61:1 to 3.65–4.86:1 on the page, the card and the popover. The search field of a Combobox popup keeps its `border-input/30`, now mist.500 at 30%.
  - Switch: the unchecked track (`bg-input`, it has no border) moves with the token, and in dark it is solid where it was `bg-input/80`: 3.68:1 light and 3.65:1 dark on the card, where it measured 1.12:1 and 1.47:1.
  - `color.border.focus`: light #708185 (mist.500) to #21292b (mist.800), dark #95a7ab (mist.400) to #e0e8ea (mist.200). Every focus indicator (`border-ring`, `outline-ring`, the `ring-ring/50` halo) is darker in light and lighter in dark: its solid part goes from 3.68–4.06:1 to 13.41–14.82:1 in light and from 5.92–7.89:1 to 11.93–15.89:1 in dark, and it sits 3.65:1 (light) and 3.27:1 (dark) away from the resting border, so a focused field no longer reads as a resting one.

- 176b028: visual: Every state drawn with an opacity now takes a named token:

  - Primary fill on hover (Button, Badge link, default Bubble): `bg-primary/80` to `bg-primary-hover`, violet.700 light (the label goes from 4.24:1 to 9.76:1) and violet.600 dark.
  - Secondary fill on hover (Button, Badge link, secondary and muted Bubble): a 5% foreground mix or `/80` to `bg-secondary-hover`, mist.200 light and mist.700 dark; it now shows on a card too.
  - Destructive tint on hover (Button, Badge link, Bubble) and highlighted destructive menu items (ContextMenu, DropdownMenu, Menubar): `bg-destructive/20` (`/30` dark; menus `/10`, `/20` dark) to `bg-destructive-hover`, red.200 light and red.700 dark. A destructive Badge link in dark changed nothing on hover; it does now.
  - Success and warning Badge links on hover: `/20` to `bg-success-hover` and `bg-warning-hover`, step 200 light and 700 dark.
  - Tinted Bubble on hover: a relative primary color to `bg-primary-tint-hover`, violet.200 light and violet.700 dark.
  - Neutral hovers (table row, Attachment link, choice card, Questionnaire choice; ghost Button and Badge, outline Button, Select and NativeSelect triggers, outline and ghost Bubbles in dark): `bg-muted/50` or `bg-input-fill/50` to the `bg-overlay-hover` veil, ink at 5% light and white at 8% dark, visible on the page, a card and a popover.
  - Open, current and expanded (NavigationMenu trigger and link, expanded table row) and the active tab in dark: `bg-muted/50` or `bg-input-fill/30` to the `bg-overlay-selected` veil, ink at 7% light and white at 8% dark.
  - Checked choice card (FieldLabel wrapping a Field): `bg-primary/5` and `border-primary/30` (`/10` and `/20` dark) to `bg-primary-selected` (violet.50 light, violet.950 dark) and a solid `border-primary`.
  - Checked Questionnaire choice: `border-foreground/30` to a solid `border-foreground` frame, which no longer sits lighter than the resting 3:1 border.
  - Documentation site: the component cards and dependency links take `hover:border-foreground` instead of `hover:border-foreground/30`.

- ddba411: visual: The semantic colors, re-anchored on the OKLCH ramps, move as follows (light and dark hex; one value when both modes share it). The largest moves are the chart series, and the warning fill, which turns more orange:

  - `color.background.default`: dark #090b0c to #080b0c
  - `color.background.subtle`: light #f1f3f3 to #f1f4f5, dark #22292b to #21292b
  - `color.background.elevated`: dark #161b1d to #151b1d
  - `color.background.inverse` (reserved): light #090b0c to #080b0c
  - `color.text.default`: light #090b0c to #080b0c, dark #f9fbfb to #f9fafb
  - `color.text.subtle`: light #607175 to #56676b, dark #9ca8ab to #95a7ab
  - `color.text.bold` (reserved): light #090b0c to #080b0c, dark #f9fbfb to #f9fafb
  - `color.text.inverse` (reserved): dark #090b0c to #080b0c
  - `color.text.action.default`: light #432dd7 to #4c3fe6, dark #a3b3ff to #b9c3ff
  - `color.text.action.on` (reserved): #eef2ff to #f9faff
  - `color.text.destructive.default`: light #9f0712 to #8b0004, dark #ffa2a2 to #ffb0a5
  - `color.text.success.default`: light #006045 to #005639, dark #5ee9b5 to #69e2ac
  - `color.text.warning.default`: light #973c08 to #925000, dark #ffd230 to #fbba55
  - `color.border.default`: light #e3e7e8 to #e0e8ea
  - `color.border.subtle` (reserved): light #e3e7e8 to #e0e8ea
  - `color.border.input`: light #e3e7e8 to #e0e8ea
  - `color.border.focus`: light #67787c to #708185, dark #9ca8ab to #95a7ab
  - `color.icon.default` (reserved): light #090b0c to #080b0c, dark #f9fbfb to #f9fafb
  - `color.icon.subtle` (reserved): light #67787c to #708185, dark #9ca8ab to #95a7ab
  - `color.icon.action` (reserved): #eef2ff to #f9faff
  - `color.action.background.default`: light #432dd7 to #4c3fe6, dark #372aac to #3721b7
  - `color.action.background.foreground`: #eef2ff to #f9faff
  - `color.feedback.error.default`: light #e7000b to #ea0a10, dark #ff6467 to #ff6f60
  - `color.feedback.error.foreground`: dark #090b0c to #080b0c
  - `color.feedback.success.default`: light #007a55 to #00764f, dark #00d492 to #00c084
  - `color.feedback.success.foreground`: dark #090b0c to #080b0c
  - `color.feedback.warning.default`: light #fe9a00 to #df8f00, dark #ffb900 to #fbba55
  - `color.feedback.warning.foreground`: #090b0c to #080b0c
  - `color.chart.1`: light #432dd7 to #3721b7, dark #6e6cff to #6362ff
  - `color.chart.2`: light #438fbd to #3985b3, dark #8fd6fa to #61acdc
  - `color.chart.3`: light #af8526 to #b16a00, dark #e5e747 to #cdcf5b
  - `color.chart.4`: light #4d2761 to #36154a, dark #9b5f7c to #f0deff
  - `color.chart.5`: light #734e00 to #6f3600, dark #c89005 to #b16a00
  - `color.chart.sequential.1` (reserved): #bbf451 to #d3f2bf
  - `color.chart.sequential.2` (reserved): #7ccf00 to #a0dc75
  - `color.chart.sequential.3` (reserved): #5ea500 to #72ba2c
  - `color.chart.sequential.4` (reserved): #497d00 to #529100
  - `color.chart.sequential.5` (reserved): #3c6300 to #407300
  - `color.sidebar.background`: light #f9fbfb to #f9fafb, dark #161b1d to #151b1d
  - `color.sidebar.foreground`: light #090b0c to #080b0c, dark #f9fbfb to #f9fafb
  - `color.sidebar.border`: light #e3e7e8 to #e0e8ea
  - `color.sidebar.ring`: #67787c to #708185
  - `color.sidebar.primary.default`: light #4f39f6 to #4c3fe6, dark #615fff to #4c3fe6
  - `color.sidebar.primary.on`: light #eef2ff to #f9faff
  - `color.sidebar.accent.default`: light #f1f3f3 to #f1f4f5, dark #22292b to #21292b
  - `color.sidebar.accent.foreground`: light #161b1d to #151b1d, dark #f9fbfb to #f9fafb

- 0a1ee78: visual: `SidebarProvider` now wraps its children in a `TooltipProvider` (`delayDuration` 0, the default of `TooltipProvider`), so the `tooltip` of a `SidebarMenuButton` renders with no provider of the app's own. It used to throw `` `Tooltip` must be used within `TooltipProvider` `` in an app that had none: the Sidebar spec requires a `tooltip` on every button collapsed to its icon, and agents that followed it built sidebars that did not render. A `TooltipProvider` in the root layout still works, but inside the `SidebarProvider` the sidebar's is the nearer one: a `Tooltip` there, in the sidebar or in `SidebarInset`, now opens after 0 ms, whatever `delayDuration` the root provider sets. shadcn/ui's `SidebarProvider` supplies no provider: the divergence is declared in `design-system.index.json`.
- 0a1ee78: docs: The Sidebar spec now names the `TooltipProvider`. `SidebarProvider` supplies one to everything inside it, so the `tooltip` of each `SidebarMenuButton`, which the spec requires on every button collapsed to its icon, needs no provider of the app's own; a `Tooltip` outside the `SidebarProvider` still needs a `TooltipProvider` in the root layout, and throws without one. The spec's dependencies and its `Tooltip` cross-reference name the provider.

## 0.1.3

### Patch Changes

- 736be61: visual: Accessibility fixes with no change of API. AvatarBadge renders `role="img"` when it is given an `aria-label` or `aria-labelledby`, which a `span` with no role cannot carry (axe `aria-prohibited-attr`); the Avatar example labels its badge "Online". BreadcrumbEllipsis hides its icon only, so screen readers announce its `srLabel` ("More"), which `aria-hidden` on the whole ellipsis kept silent. SidebarMenuAction goes from a 20 × 20 box to 24 × 24 (`min-w-target`, `size.target.min`), grown 2px on every side so it stays centered on its menu button: axe measured a 20px target overlapping the button. Sonner toasts take the design system's typeface (`var(--font-mono)`, `typography.font-family.mono`) where they used sonner's system font stack.
- 736be61: docs: Five Anatomy tables now name the `data-slot`s their component renders. Spinner's root carries `spinner`, where the spec said it had none. Sonner's `toaster` is written on the `Toaster` but never reaches the DOM, since sonner does not forward it: target `ol[data-sonner-toaster]`, where the spec named a `<Sonner>` root. PasswordInput's toggle is an `input-group-button`, where the spec named a "toggle button". Combobox lists the `input-group`, `input-group-control`, `input-group-addon` and `input-group-button` that `ComboboxInput` renders; inside it the trigger carries `input-group-button`, and `combobox-trigger` only shows on a `ComboboxTrigger` placed on its own. Questionnaire adds the eight slots it left out: `questionnaire-choice-input`, `-choice-indicator-dot`, `-choice-indicator-check`, `-input-wrapper`, `-previous`, `-skip`, `-next` and `-submit`. `npm run specs:validate` now fails on an Anatomy that names a slot nothing renders, or leaves out one its component writes.
- 736be61: docs: Spec examples that rendered wrong or failed a project's lint. Avatar and AspectRatio load images that exist, shadcn/ui's (`https://github.com/shadcn.png`, `https://github.com/evilrabbit.png` and its Unsplash photo), where `/user1.jpg`, `/user2.jpg` and `/placeholder.jpg` returned a 404 in every project. ScrollArea renders one vertical scrollbar, where its extra `<ScrollBar orientation="vertical" />` drew a second one. InputGroup no longer imports an `InputGroupButton` it never uses. Empty and the delete, saving, search and sign-in patterns escape their `'` and `"` in JSX text (`&apos;`, `&quot;`), which `react/no-unescaped-entities` rejected. Direction documents `dir` as required, since `direction` alone does not compile (TS2741), and its example no longer marks an English sentence `lang="ar"`. Chart colors its series with `var(--color-chart-1)`, in the spec and in the component's JSDoc, where `var(--chart-1)` kept light colors inside a nested `.dark` subtree; a new Constraints line says why.
- 736be61: docs: Foundations and token descriptions that contradicted the tokens or the components. Color: `color.text.action.default` is `violet.300` in dark mode and `color.border.focus` `mist.400`, where the tables gave `violet.400` and `mist.500`, and action text on the default surface measures 9.81:1 in dark mode, not 4.93:1. Motion: the "Standard hover" example puts `hover:bg-muted` on a `bg-background` surface, where it sat on a Card whose `bg-card` reads the same token and showed no change. Content: the Overriding table adds MessageScrollerViewport, MessageScrollerButton, QuestionnaireProgress and the four Questionnaire buttons, and writes the slot `Remove {item}`. Spacing: the Layout table adds `space.layout.sidebar`, `sidebar-mobile` and `sidebar-icon`, with `w-sidebar`, `w-sidebar-mobile` and `w-sidebar-icon`. Typography: the typeface loader is `lib/fonts.ts`, not `layout.tsx`. Elevation and the `zindex.*` descriptions: menus and popovers draw `z-popover` (1500), not `z-dropdown`; seven components still raise one of their parts with `z-dropdown`, against the local-stacking rule; the Sonner `Toaster` does not read `z-toast`, so a toast is not "always visible above other layers" through it. Calendar: a Calendar in a `CardContent` loses the fill of a range's middle days and of today, since `bg-muted` and the card read the same token; place it in a `Popover`. `space.layout.content-sm` recommends `max-w-2xl`, where it recommended an arbitrary value the ESLint plugin rejects. "dropdown" is spelled one way, without a hyphen, across the specs, the component JSDoc and the token descriptions, and `npm run lint:language` rejects the hyphenated spelling.
- 736be61: mcp: Two glossary entries of `dsaireadable_get_glossary` and the stack of `ds-metadata.json` are corrected. `data-slot` is used for CSS targeting and to recognize a component in rendered markup, not for "Code Connect prop mapping" (Code Connect was removed); `foundation` names the eleven token foundations and the guidance built on them, where it listed seven. The `framework` reads "shadcn/ui", where it read "shadcn-ui", the project's GitHub organization.
- 736be61: visual: Toggle and ToggleGroupItem on state: a solid `border-foreground` frame over the muted fill, 19.72:1 on the page in light mode and 18.99:1 in dark, where the fill alone measured 1.11:1 and 1.33:1 and matched hover. The `default` variant gains a transparent 1px border at rest, so nothing moves when the frame shows, and keeps it transparent at focus, where its `outline-ring` still draws the focus; an invalid `default` toggle now shows its `destructive` border at rest, as the `outline` variant did, and a pressed invalid toggle shows the frame. On the `outline` variant, focus turns a pressed toggle's frame into the `border-ring` border, as on an unpressed one, so focus still adds a solid part; on the `default` variant the frame stays and the `outline-ring` outline is added around it. In a joined `outline` group (`spacing={0}`), the frame shows on three sides, the fourth being the neighbor's border.
- bd37f29: docs: the code examples of two specs now type-check as written. Direction passes `dir="rtl"` to `DirectionProvider`, whose Radix `dir` prop is required, where it passed `direction="rtl"` alone, in the spec and in the component's JSDoc `@example`; Logo's `Example` gives `brandName` a default (`"Acme"`), so it renders with no props, as the tests and the documentation site render it.

## 0.1.2

### Patch Changes

- b7037f4: docs: Accordion: the dead class `focus-visible:after:border-ring`, which drew nothing, is dropped from the trigger and from its States table; the focus indicator is unchanged.
- b7037f4: visual: Button `outline` in dark mode: the open state (`aria-expanded`) moves from the rest fill `dark:bg-input/30` to `bg-muted`, as in light mode, and the keyboard focus border moves from `border-input` to `border-ring` (the solid part of the focus indicator was missing).
- b7037f4: visual: Calendar: a hovered selected day (single, range start and end) keeps `bg-primary` with `text-primary-foreground` in dark mode, and a hovered range middle keeps `bg-muted`, instead of `bg-muted/50` with `text-foreground`; a disabled day moves from opacity 0.25 (`opacity-disabled` on the cell and on its button) to `opacity-disabled` once (0.5); with `captionLayout="dropdown"` the month and year dropdowns take a `border-input` border, and `border-ring` with a `ring-ring/50` ring on focus, where focusing them showed nothing (WCAG 2.4.7).
- 3032d72: visual: Chart: keyboard focus draws a `ring-ring/50` ring and a `border-ring` outline (`outline-ring`, `border-width.default`) around ChartContainer on every focus, a Pie layer and a Brush included; before, the surface had no outline and only the tooltip of the first focus showed it, so a returning focus, or a chart with no ChartTooltip, showed nothing (WCAG 2.4.7).
- 3032d72: docs: The Chart spec names the chart on the Recharts element (`aria-label` on `BarChart`, not on `ChartContainer`), asks for a visible text summary and a visible Table when readers need the values, never a Table in `sr-only`, and documents its keys (Tab, ArrowLeft / ArrowRight, Enter) and `<Pie rootTabIndex={-1}>`; the focus foundation no longer counts the Recharts tooltip as a focus indicator.
- 29d0307: visual: Checkbox: an enabled box in a `Field` that also holds a disabled control (the "Other: [text input]" pattern) is no longer dimmed to `opacity-disabled` (0.5); `group-has-disabled/field` matched any disabled control of the Field, and it now matches a disabled Checkbox only. A disabled Checkbox keeps its own `disabled:opacity-disabled`.
- 29d0307: visual: Checkbox `checked="indeterminate"`: from an unfilled box (`border-input`, no fill) with a `CheckIcon`, which read as checked while assistive technology announced "mixed", to a box filled like a checked one (`border-primary bg-primary text-primary-foreground`, `dark:bg-primary`) with a `MinusIcon`. The icons swap in CSS on the root's `data-state`, so an uncontrolled box shows the check again once clicked. At keyboard focus it takes `border-ring` like a checked box, and keeps `border-primary` in a choice card.
- 29d0307: visual: Checkbox and RadioGroupItem, checked and invalid, in dark mode: border from `border-destructive/50` to `border-primary`, as in light mode (upstream's `aria-invalid:aria-checked:border-primary` had no dark counterpart and lost to `dark:aria-invalid:border-destructive/50` on emission order).
- 29d0307: visual: Choice card (a `FieldLabel` that wraps a `Field`): Checkbox, RadioGroupItem and Switch no longer draw their own `ring-ring/50` ring and `border-ring` border inside the card's ring; the card draws the only one. A focused unchecked box or radio keeps `border-input` (Switch: transparent) instead of turning `border-ring`; an invalid one keeps `border-destructive` and its solid `outline-destructive` focus outline (it draws no halo of its own, only the card's). The classes upstream wrote for this never took effect (they tied FOCUS_RING on specificity and lost on emission order), and applied to any FieldLabel: they are scoped to a card, so a control in a `FieldLabel` with no `Field` keeps its ring, and a focused checked Checkbox or RadioGroupItem there turns `border-ring` like anywhere else, where it kept `border-primary`.
- 29d0307: docs: The Checkbox, RadioGroup, Switch and Field specs describe focus in a choice card (the card draws the only ring; a control in a plain `FieldLabel` keeps its own) and the unchecked, error and indeterminate states as drawn; the Switch spec no longer claims a switch drops its ring in any focused `FieldLabel`; the focus foundation names the choice card among the legitimate `ring-0` removals; FieldTitle's `@example`, served by the MCP, wraps its RadioGroupItem in a RadioGroup, as it threw at render without one.
- 0fd70f3: docs: The States and Tokens sections of Calendar, Questionnaire and ToggleGroup list the classes they draw through `buttonVariants` and `toggleVariants`, and the Composes line names the variant each part uses.
- 9f9365a: visual: Transitions with no duration class (the hover and focus color changes of Button, Input, Textarea, Tabs, Switch, Checkbox, Badge, Toggle, the Sidebar buttons and rail…): from 150ms, Tailwind's default, to 100ms (`motion.duration.fast`); their curve now reads `motion.easing.default`, which holds the same `cubic-bezier(0.4, 0, 0.2, 1)`. `styles/globals.css` bridges `--default-transition-duration` and `--default-transition-timing-function` in `@theme inline`, so a consumer's `transition-colors` follows. Overlays, the Sheet, the Accordion and the Tooltip keep their own timing.
- 4d78a24: visual: The browser's own focus outline, on what draws no focus style of its own (a Breadcrumb link, a HoverCard trigger link, a bare CollapsibleTrigger, the MessageScroller viewport, any plain link or control of a screen), moves from `outline-ring/50` (about 1.9:1) to `outline-ring` (4.61:1 light, 8.08:1 dark): the base layer of `styles/globals.css` colors it.
- 4d78a24: docs: The focus foundation requires a solid part at 3:1 on every focus indicator (rule 6): the border, or a 1px `outline-ring` outline on an element with no border, `outline-destructive` on an invalid control or a destructive variant, with `outline-solid` after `outline-hidden`; its contrast table gives the values as painted, the halo included. `border-width.default` describes that outline, the color foundation names the pair it measures, and `FOCUS_OUTLINE_RESET` says `outline-hidden`, like `outline-none`, sets the outline style to none.
- 4d78a24: visual: `color.border.focus` in dark mode: from `mist.500` (the light value) to `mist.400`, so every focus indicator is lighter in dark: its solid part goes from 4.28:1 to 8.08:1 on the page, 3.21:1 to 6.06:1 on a card and 3.77:1 to 7.12:1 on a popover, and an InputGroupButton (PasswordInput's "Show password") on a field's `dark:bg-input/30` fill over a card from 2.80:1, below 3:1, to 5.27:1. The `ring-ring/50` halo follows (about 1.9:1 to 2.8:1). `--ring` and every `ring`, `border-ring` and `outline-ring` class read it; light mode is unchanged.
- 4d78a24: visual: Focus indicator of the elements with no border: Toggle and ToggleGroupItem (`default` variant), MenubarTrigger, the NavigationMenu trigger and link, TabsContent, the ScrollArea viewport, the Resizable handle, the Slider thumb, a focused Calendar day and the CommandInput field. From a `ring-ring/50` halo alone (about 1.9:1, below the 3:1 of WCAG 1.4.11) to a solid 1px `outline-ring` outline (`outline-solid`, `border-width.default`: 4.61:1 light, 8.08:1 dark) inside the same 2px halo. On the Calendar day it replaces `border-ring`, which drew nothing on a `border-0` button; on the Resizable handle and the Slider thumb it replaces `focus-visible:outline-hidden`.
- 4d78a24: visual: Button and Badge `destructive` variants: keyboard focus keeps `border-destructive/40` and the `ring-destructive/20` halo (about 2.1:1 and 2.4:1) and adds a solid 1px `outline-destructive` outline (`border-width.default`: 4.77:1 light, 6.83:1 dark).
- 4d78a24: visual: Focus indicator of an invalid control (`aria-invalid`): Input, Textarea, NativeSelect, SelectTrigger, Checkbox, RadioGroupItem, Switch, Toggle, Button, Badge and the active InputOTPSlot. They keep their border at focus (`destructive`; `primary` on a checked or indeterminate Checkbox or RadioGroupItem), so focus only added a `ring-destructive/20` halo (dark `/40`), about 1.4:1 light and 1.9:1 dark; it now also draws a solid 1px `outline-destructive` outline (`border-width.default`: 4.77:1 light, 6.83:1 dark). An InputGroup (PasswordInput included) or a ComboboxChips holding an invalid control showed no change at all on focus (WCAG 2.4.7): it draws the same outline while the control has focus.
- 9f9365a: docs: The typography, radius and motion foundations describe what the radix-lyra components draw, where they described shadcn's new-york look. Typography: a field label is what `FieldLabel` draws (12px, regular, `leading-snug`), not `text-sm font-medium tracking-wide`; the headings are `<Heading level>` (24, 20, 18 and 16px, semibold, `tracking-tight`), and the Display style is gone; the type-scale, weight and letter-spacing usages follow, and Field.md forbids `text-*`, `font-*`, `tracking-*` and `leading-*` on `FieldLabel`. Radius: the components are square (`rounded-none`) except Avatar, RadioGroup and Switch (`rounded-full`) and the chart indicators (`rounded-xs`), and a surface a screen draws next to them stays square; elevation.md and the ContextMenu example drop their `rounded-*` classes. Motion: a "What the components draw" table (overlays 100ms `ease`, Sheet 200ms, Accordion 200ms, Tooltip 150ms, Drawer vaul's 500ms) replaces the 300ms modal combinations, which now apply to a transition a screen draws itself. The token descriptions of `typography.size.*`, `typography.letter-spacing.*`, `typography.font-weight.*`, `radius.*`, `motion.duration.*` and the radius and motion groups follow; `radius.none` is `active` (the Sonner toast reads it) and `motion.duration.extra-slow` is documented as drawn by no component. InputOTP's dead `duration-extra-slow` class (its caret blinks at `animate-caret-blink`'s own 1.25s) and Sonner's dead `cn-toast` marker are removed from the components and their specs.
- fd9e174: docs: PasswordInput's root carries `data-slot="password-input"` in its spec; InputGroup documents its double disabled opacity; the `opacity.placeholder` guidance and the opacity foundation name the class each field really uses for its placeholder.
- fd9e174: visual: InputGroup takes its disabled look (`opacity-disabled`, `bg-input/50`, dark `bg-input/80`) from its field only (`has-[[data-slot=input-group-control]:disabled]`, was `has-disabled`): a disabled `InputGroupButton` no longer dims the whole group and the enabled field in it (text at 3.51:1, below WCAG 1.4.3). The two inert `in-data-[slot=combobox-content]:focus-within` classes are dropped, with no rendering change.
- 10f286e: visual: DropdownMenu, ContextMenu and Menubar: an item, label, sub-trigger or checkbox or radio item with `inset={false}` no longer takes the inset left padding (`pl-7`, Menubar `pl-8`). React wrote `data-inset="false"`, which the presence selector `data-inset:` matched; the attribute is now left out when `inset` is false, so `inset={false}` and no `inset` draw the same.
- b7037f4: visual: MenubarCheckboxItem: a disabled item takes `opacity-disabled` (0.5, was full opacity), its right padding goes from `pr-28` (112px) to `pr-2` (8px) so menus holding one are no longer about 100px wider than their content, and its check icon is `size-4`, like the neighboring items.
- 10f286e: visual: Viewport gutter of the centered modals: DialogContent (and CommandDialog) below 640px, from 12px to 16px on each side (`max-w-[calc(100%-var(--space-component-lg))]` becomes `max-w-[calc(100%-var(--space-scale-8))]`, the 2rem shadcn/ui draws); AlertDialogContent below 352px, from flush with the viewport edges to 16px on each side (`w-[calc(100%-var(--space-scale-8))]`), still 320px wide from 352px. `space.component.lg` (24px) has no reader left and becomes `reserved`, so all five `space.component.*` tokens are reserved; rule-12 says so.
- fd9e174: visual: NativeSelect draws its selected empty-value option (its placeholder) in `text-muted-foreground` (`color.text.subtle`) instead of `text-foreground`, as Select does; ComboboxChipsInput's placeholder takes `text-muted-foreground` instead of Tailwind's faded default (3.70:1 on white).
- 10f286e: docs: NavigationMenu: the trigger drops `data-popup-open:bg-muted/50`, `data-popup-open:hover:bg-muted` and the caret's `group-data-popup-open:rotate-180`, Base UI attributes Radix never sets, and Resizable drops `aria-[orientation=vertical]:flex-col`, which never matched; the `data-open` classes keep drawing the open trigger and nothing changes on screen. The Tooltip spec describes the animated keyboard open, the motion foundation names the default Select, which opens with no animation by design, as the exception, the focus foundation lists the mechanisms the `focus-managed` comments name as the primitives really work (roving tabindex, active descendant, no focus scope on HoverCard), and `specs:states` refuses a Base UI-only variant on a Radix component.
- fd9e174: visual: PasswordInput disables its visibility toggle with the field and masks the value again: a disabled PasswordInput's toggle leaves the tab order and no longer responds to hover or click (its icon was at 1.91:1, below WCAG 1.4.11). With `readOnly` the toggle still works.
- 252df9f: docs: The `conventions` registry item installs and links at the release tag, not at `main`: its install line reads `npx shadcn add Toniio/DSAIReadable/<item>#vX.Y.Z` and its spec link `blob/vX.Y.Z/specs/components/<Component>.md`, so an agent reads the specs of the release these rules were written for (a pinned install still reads the items it depends on from the default branch). The link of the MCP server's README to the repository README names the tag too, and `versions:sync` writes all of them. `versions:check` now fails on a link to `main` in anything a package or a registry item distributes.
- 252df9f: lint: The documentation link of every rule of `@dsaireadable/eslint-plugin` (`meta.docs.url`, shown by editors and by `eslint --format`) points to the README of the plugin version installed, `blob/vX.Y.Z/packages/eslint-plugin/README.md#<rule>`, not to `main`, which can describe rules the installed version does not have; the plugin reads its own version at run time and exposes it as `meta.version`.
- 252df9f: skills: The `dsaireadable` Claude Code plugin installs its skills from the release tag (`ref: vX.Y.Z` of a `github` source in `.claude-plugin/marketplace.json`), the version of the MCP server it starts, instead of a snapshot of `main` frozen at install time; `npx skills add Toniio/DSAIReadable#vX.Y.Z` in the README pins the skills the same way. Until the tag is pushed after a release, installing the plugin fails.
- 9f9365a: mcp: The critical styling rule served with every prompt and `dsaireadable_get_design_rules` no longer recommends `rounded-lg rounded-md` and a `font-medium` label: it says the components are square, that `rounded-full` is for a round shape, and that `Label`, `FieldLabel` and `Heading` take no `text-*`, `font-*`, `tracking-*` or `leading-*` class; the `validate_screen` message for a raw radius says the same. The `ux-writing` context no longer serves the `// ✅` and `// ❌` titles of the radius and opacity code examples as rules without their code.
- e5678f5: visual: The base registry item no longer carries its own `prefers-reduced-motion` rule for the Attachment title shimmer (`[data-slot="attachment-title"]`): `shadcn/tailwind.css` 4.21.1 stops the shimmer itself, and the item now depends on `shadcn@^4.21.1` (was `^4.21.0`). The title still stays static, in the text color, under reduced motion.
- 9f9365a: visual: Sonner toast radius: from 8px (`radius.md`) to 0 (`radius.none`), square like every radix-lyra surface. The table of `shadcn-upstream.json` mapped the `var(--radius)` of the toast's `--border-radius` to `var(--radius-md)` for every component; it now maps it to `var(--radius-none)` for Sonner alone (a `values` entry per component).
- 8da9b04: docs: How to read a token in a class. `spacing.md` says a screen takes a class first, then Tailwind's shorthand `utility-(--variable)` (`w-(--radix-popover-trigger-width)`) for a variable with no class, never `w-[var(--…)]` or `w-[--…]`, and that a `style` prop may read a token; its components/ui table writes `w-(--sidebar-width)`, the form `sidebar.tsx` uses. `color.md` reads the sequential chart colors through `bg-(--color-chart-sequential-N)`. `llms.txt` no longer says to style "through `var(--…)` tokens".
- 8da9b04: lint: `no-raw-values` answers a bracketed CSS variable (`hover:w-[var(--x)]`, and the Tailwind v3 `w-[--x]`) with a new message, `variableShorthand`, that names the corrected class with its variants (`hover:w-(--x)`), where it named only `w-[var(--x)]` as an arbitrary value, variants dropped. `configs.tailwind` turns on `better-tailwindcss/enforce-consistent-variable-syntax`, so `eslint --fix` writes the shorthand (a bracketed variable is now reported by both rules in `recommended`, and the one `--fix` clears both; `core` reports it once): measured on `components/`, `lib/`, `hooks/` and on 106 tsx and ts blocks of the specs, foundations, page patterns, harness examples and skills, it adds no error to code that passes today.
- 8da9b04: mcp: The critical styling rule served with every prompt and `dsaireadable_get_design_rules` agrees with the ESLint plugin on variables: it teaches Tailwind's shorthand for a token with no class (`w-(--radix-popover-trigger-width)`, never `w-[var(--…)]`) and no longer forbids an inline `style` that reads a token, which the plugin has always accepted (`style={{ width: 'var(--sidebar-width)' }}`; a raw value in a style stays refused). The `dataviz` heatmap entry says to read the sequential steps through `bg-(--color-chart-sequential-N)`. `dsaireadable_validate_code` returns the new `no-raw-values` message.
- 8da9b04: skills: `dsaireadable-build` no longer says arbitrary values "generate nothing": `p-[13px]` generates `padding: 13px`, and the ESLint plugin and `dsaireadable_validate_code` are what refuse it. It names Tailwind's `(--…)` shorthand for a variable with no class.
- 10f286e: visual: Tooltip: a tooltip opened by keyboard focus, or by a hover right after another tooltip closed (Radix `instant-open`), now enters like a hover open, with `fade-in-0`, `zoom-in-95` and a `slide-in-from-*` from its side (the fade alone under reduced motion). It used to appear at once and leave with `fade-out-0` and `zoom-out-95`: the entrance classes waited for `data-state="open"`, which Radix never writes on a tooltip.

## 0.1.1

### Patch Changes

- 59bf59d: docs: Fix the drifts between specs and code: Button's hover state no longer claims 90% opacity, the foundation examples use the design system's components instead of native interactive elements (button, input, label, dialog) and pass its ESLint config, the motion foundation lists motion.duration.extra-slow, rule-12 and the spacing foundation name the spacing scale the components draw with (the space.component.* tokens draw no class, and their token docs now say so), the form, create and sign-in patterns give FieldGroup's real gap, gap-5, and the create pattern spaces its dialog form with DialogContent's own gap-4.
- 7d1bba6: docs: The States section of the 65 component specs is generated from the code: each state lists the classes that draw it, and its description can no longer contradict them. The descriptions that did are fixed (overlays enter with `fade-in-0`, not `fade-in`; Slider, RadioGroup and Field name their ring and opacity tokens instead of px and percentage values), the states the code draws without a row are described, and rows filed under the wrong state (an open popup under `active`) moved to the right one.
- 9a7c36e: docs: The links of `llms.txt` point to the release tag instead of `main`, so an agent reads the specs of the published version, the one the MCP server of the same version serves, rather than changes not yet released.
- 4e2de49: visual: Under `prefers-reduced-motion: reduce`, entrances and exits fade instead of moving. Dialog, AlertDialog, Sheet, Popover, HoverCard, Tooltip, DropdownMenu, ContextMenu, Menubar, Select, Combobox and NavigationMenu: zoom and slide to fade only. Drawer: slide to fade. Accordion: height animation to instant. Skeleton pulse, Attachment title shimmer and InputOTP caret blink: animated to static. Carousel: smooth scroll to instant jump. MessageScroller button: slide and scale to fade. Sidebar on the desktop: collapse transition to instant. Spinner keeps turning.

## 0.1.0

### Minor Changes

- 24d5c6f: skills: Add two agent skills in `skills/`, installable with `npx skills add Toniio/DSAIReadable` or as the `dsaireadable` Claude Code plugin (`.claude-plugin/marketplace.json`), which also starts the MCP server. `dsaireadable-build` builds or changes a screen MCP-first: the page pattern, one detailed spec per component, then `dsaireadable_validate_code` and `dsaireadable_validate_screen` until both report zero errors. `dsaireadable-ui-guard` reviews every screen it builds or changes for basic UI and UX errors before handing it back: a checklist in eight domains (hierarchy, forms, states, destructive actions, navigation, accessibility, microcopy, restraint), then a `file:line — severity — rule — fix` review that ends in pass or fail. Each of its rules cites the spec, pattern or foundation that writes it.
- 24d5c6f: mcp: The `generate_idea` and `suggest_next_steps` prompts drop the "senior Product Designer" persona and point at the `dsaireadable-ui-guard` skill instead, with its four questions (the main action, every state designed, irreversible actions confirmed, a way back from every view) for the clients that load no skills.

### Patch Changes

- 24d5c6f: docs: The Breadcrumb spec now shows the trail from 3 levels deep, like the navigation pattern; it said two or more.
- 4b1a98f: visual: Focus shows on invalid controls. Button, Checkbox, Input, NativeSelect, Questionnaire, RadioGroup, Select, Switch and Textarea with `aria-invalid`: the destructive ring is no longer drawn at rest (it was identical with and without focus, so keyboard focus was invisible, WCAG 2.4.7); at rest the destructive border alone marks the error, and the ring (`ring-destructive/20`, dark `/40`, `--space-focus-ring-width` wide) appears on focus, as in shadcn/ui. CommandInput: its InputGroup now draws the focus ring (none before, its selector never matched `data-slot="command-input"`).
- 4b1a98f: visual: ScrollArea's viewport is in the tab order (`tabIndex={0}`, with its focus ring), so the keyboard reaches and scrolls an area that holds nothing focusable in every browser, Safari included (WCAG 2.1.1); name the area with `role="region"` and an `aria-label`. CommandSeparator is `aria-hidden`: a listbox may own only options and groups.
- d852e1a: visual: Link text reaches 4.5:1 in dark mode. `text-primary` now reads the action text token `color.text.action.default` (active, it was reserved), and `bg-primary` keeps the action fill, as `text-destructive`, `text-success` and `text-warning` already do. Button and Badge `variant="link"`, and a hovered link in EmptyDescription, FieldDescription and ItemDescription: in dark mode, from the action fill (1.5:1 on the card) to the new `primitive.color.violet.300` (7.4:1 on the card, 8.7:1 on a popover); light mode is unchanged (`violet.600`).
- d852e1a: docs: The loading pattern's example gives its skeleton grid `role="status"`: an `aria-label` on a `div` with no role is ignored by assistive technology, and axe reports it (`aria-prohibited-attr`).
- 24d5c6f: docs: Two rules against dark patterns, which the `dsaireadable-ui-guard` skill cites: the form pattern forbids pre-checking a consent, a subscription or a paid option, and the voice and tone foundation forbids shaming a refusal (the way out reads `Not now` or `Cancel`).
- 7428fc3: visual: The components are re-anchored on shadcn/ui 4.21.0 (`radix-lyra`) and take its fixes. Button default: the hover color (`bg-primary/80`) shows on every button, not only on a link. Card: the gap and padding come from `--card-spacing` like upstream; a `sm` card's gap goes from `space.scale.2` to `space.scale.3`. CarouselPrevious and CarouselNext: centered with `inset-y-0 my-auto` instead of a `-translate-y-1/2`, which the Button's pressed `translate-y-px` overrode. Checkbox, RadioGroup and Switch inside a choice-card `FieldLabel`: the label draws the focus ring and the hover background, the control draws none. BubbleReactions: its ring takes `border-width.separation`, not the focus-ring width. Marker: links underline at offset 3 like every other link.
- 4b1a98f: docs: Every spec's code example now renders as written, with no axe violation. Select, NativeSelect and InputOtp examples name their control; ToggleGroup imports `GridFourIcon` (`GridIcon` does not exist); Direction and Sonner examples are components that render (no `<html>` layout, no required children); ScrollArea names its region.
- 4b1a98f: docs: Specs now describe what the components do, replayed in a real browser. ToggleGroup's role is `radiogroup` (single) or `toolbar` (multiple), not `group`; Calendar marks an unavailable day as a `disabled` button; Combobox points `aria-activedescendant` at the highlighted option and `aria-selected` at the chosen one; ContextMenu opens with right-click and the Menu key, `Shift+F10` only where the OS maps it (not macOS); Popover's `Tab` loops through its content; Questionnaire's `Enter` moves on from a checked choice and does not check it; Attachment's group scrolls with `ArrowLeft` / `ArrowRight`; Accordion's `Tab` visits each trigger. Resizable sizes: a number is in pixels, so the examples use percent strings (`defaultSize="50%"`). The CommandDialog example wraps its content in `Command`.
- 4b1a98f: visual: Tabs passes `orientation` to Radix. With `orientation="vertical"`, the list now carries `aria-orientation="vertical"` and `ArrowDown` / `ArrowUp` move between tabs; before, the list stayed horizontal for assistive technology and the vertical arrows did nothing.

### Added

- Component manifest from JSDoc: every runtime export of the 65 components
  carries a one-sentence description and an `@example` in its JSDoc, the single
  place they are written. `component-specs.json` serves both next to each
  export, so `dsaireadable_get_component_specs` (detailed) returns
  `description` and `example` with each `exports` entry, and an MCP test fails
  naming any export that misses one. `lint-ui-strings` ignores JSDoc lines.
- Deprecation chain: one edit tells an agent four ways. A token's
  `$deprecated`, with its `replacement` in `$extensions["design.dsaireadable"]`,
  or a JSDoc `@deprecated {@link Replacement}` on a component export, reaches
  the token docs and manifest, `dsaireadable_get_tokens`, the new
  `dsaireadable_get_deprecations` tool and the plugin's lint. The ESLint plugin
  gains `no-deprecated-token` (a deprecated token's CSS variable or Tailwind
  class), and its deprecation lists are generated by `npm run generate-context`
  instead of written by hand. `tokens:lint-lifecycle` checks a replacement
  exists and is not deprecated itself. `opacity.placeholder` now points at
  `color.text.subtle`.
- MCP server: `dsaireadable_get_changelog` serves this changelog, one entry per
  change, by version or category, from `changelog.json`.
- ESLint plugin: `@dsaireadable/eslint-plugin` (`packages/eslint-plugin/`) puts
  the design system's rules in a project's own lint. Six rules
  (`no-native-interactive-elements`, `no-external-ui-imports`, `no-inline-svg`,
  `no-class-interpolation`, `no-raw-values`, `no-deprecated-imports`) in
  `configs.core`, which reads the code alone, and `configs.recommended`, which
  adds the Tailwind lockdown through `eslint-plugin-better-tailwindcss` (an
  unknown class is an error, a disabled state reads `opacity-disabled`).
  `components/ui/` is left alone, and `createConfig({ ignores, tailwind })`
  narrows that for a project whose own components live there. `npm run plugin:test` runs each rule against
  a failing and a conforming fixture.
- MCP server: `dsaireadable_validate_code` lints and type-checks TSX with the
  plugin's `core` rules, in memory, and answers with structured diagnostics
  (rule, severity, line, column). TypeScript adds syntax errors and names that
  are not defined. `build_screen` asks for it after `validate_screen`, and
  `mcp:test` runs every component and pattern example through it.
- License: the repository and the MCP server package are released under the MIT
  License (`LICENSE`, `license` in both `package.json`). `NOTICE.md` reproduces the
  shadcn/ui copyright notice, which the components derived from it must keep.
- MCP server: `@dsaireadable/mcp-server` is a package a client runs with
  `npx -y @dsaireadable/mcp-server`, over stdio. The server is compiled to
  JavaScript (`dist/`, a `node` shebang, `tsx` and `typescript` as dev
  dependencies), and the package holds `dist/` and `context/` only: no test, no
  generator, no agent file. `npm run mcp:test-package` packs it and runs the
  tarball through `npx` from an empty folder.
- MCP server: run inside a project, `dsaireadable_list_patterns` and
  `dsaireadable_get_pattern` also serve that project's `design/patterns/*.md`
  (the working directory, or `DSAIREADABLE_PROJECT_DIR`): the same nine
  sections as a file of `specs/patterns/`, read with the same parser. The
  project's pattern wins when both share a name, and a file that does not parse
  is an error that names it.
- Versioning: [Changesets](https://github.com/changesets/changesets) and a
  semver policy (`CONTRIBUTING.md`, _Versioning and releases_). One version
  names the tokens, the components, the registry, the inventory and the MCP
  server; `versions:sync` copies the root `package.json` version everywhere it
  is served and `versions:check` fails CI when one differs. A changeset starts
  with a category (`token-breaking`, `component-api`, `mcp`, `visual`, `docs`)
  and `changesets:lint` checks the bump it takes. `release:test` runs the
  pipeline on a copy of the files, and states what the shadcn CLI pins when
  a consumer installs an item at a tag: the item, not its dependencies.
- MCP server: protocol revision 2026-07-28, on the v2 SDK
  (`@modelcontextprotocol/server`). A client opens with `server/discover`;
  2025-era clients are still served, over stdio and HTTP. `tools/list` comes
  back in one order every time.
- MCP server: every tool declares an output schema and answers with
  `structuredContent` that the server validates against it, with the same JSON
  as text. Lists and resources carry a one-hour `public` cache hint for
  2026-07-28 clients.
- Page patterns, on Primer's model: 12 hand-written pages in
  `specs/patterns/`, the tasks a screen carries out (`create`, `edit`,
  `delete`, `filter`, `search`, `sign-in`, `settings`) then the UI patterns
  they share (`empty-state`, `form`, `loading`, `navigation`, `saving`). Each
  says when to use it, its regions, its components and their variants, its
  spacing, what to write in the design system's voice, and a code example.
  The MCP server serves them with `list_patterns` and `get_pattern`
  (`response_format` concise or detailed), `build_screen` calls `get_pattern`
  for a screen that carries out one of the tasks, and `llms.txt` lists them.
  `specs:validate` checks their 9 sections and their wording;
  `generate-context` fails on a component no spec documents; `mcp:test` runs
  every code example through `validate_screen`.
- Six conversation components from shadcn/ui, in a new `Conversation`
  category: `Message`, `Bubble`, `Marker`, `Attachment`, `MessageScroller` and
  `Questionnaire`, with their specs, registry items and tests, and a
  composition rule (`rule-23`) that says which one does which job. They keep
  the shadcn/ui API with no divergence; their classes read the design system's
  tokens (focus ring, `opacity-disabled`, motion durations and easings, a
  `tinted` bubble built from `bg-primary/10`). `MessageScroller` and
  `Questionnaire` depend on `@shadcn/react`.
- shadcn/ui coverage: `shadcn-api.baseline.json` lists every `registry:ui`
  item upstream, and `npm run index:shadcn` fails when one is neither in the
  inventory nor excluded in `design-system.index.json` (`shadcn.excluded`, with
  its reason and what to use). 62/62 are covered: 61 shipped, `form` excluded
  for `Field`. `get_component_specs` and `get_component_variants` answer a
  request for an excluded component with its reason and replacement, and
  `get_design_system_overview` lists the exclusions.
- The shadcn/ui API is the contract (AGENTS.md § 1): `npm run index:shadcn`, in
  `index:validate`, compares every component with the upstream API
  (`shadcn-api.baseline.json`, refetched by `npm run shadcn:baseline`) and
  requires each divergence to be declared in `design-system.index.json`
  (`shadcn.divergences`). `get_component_specs` serves them, in the concise
  answer too. 55 components derive from shadcn/ui with 26 declared divergences:
  20 added props (translatable accessible names, heading levels, slider thumb
  names), one renamed value (`SidebarMenuSubButton` `size="md"` is
  `"default"`, following the size scale), and five changed exports
  (`EmptyTitle` and `PopoverTitle` render a heading; `EmptyDescription` and
  `KbdGroup` type their props for the element they render). 4 components are
  the design system's own.
- `npm run knip`, in `npm run check` and the CI `lint` job: no unused file,
  export or dependency in the app or in `mcp-server/`. The registry items are
  its entry points, since consumers install them even when the demo app does
  not import them.
- Checks extended: `lint:language` refuses British spellings (the repository
  writes American English), `lint-spec-wording` reads prop descriptions,
  `lint-sizes` follows sizes borrowed from another component (ToggleGroup,
  Pagination, Carousel now declare theirs; AlertDialog and Sidebar list
  Button's), `specs:tokens` lists `typography.font-family.*` behind `font-mono`
  / `font-sans` / `font-heading`, and `validate_screen`'s `ds-imports` rule has
  a failing fixture.
- Sidebar: `mobileTitle` and `mobileDescription` on `Sidebar`, `toggleLabel` on
  `SidebarTrigger` and `SidebarRail`, so every string it renders can be
  translated; `ChartTooltipProps` and `ChartLegendProps` exported. ESLint
  refuses a class assembled by interpolation (`bg-${color}`), and
  `lint-ui-strings` a literal `*Title` or `*Description` text
  ([#51](https://github.com/Toniio/DSAIReadable/pull/51)).
- A check for every rule of `AGENTS.md` § 1, each named in § 5: `lint:language`
  (English only), Primitive tokens and `prefers-color-scheme` refused in app
  code, other icon kits and inline `<svg>` refused by ESLint, raw `ms` and
  `duration-[…]` / `ease-[…]` values refused, decorative `opacity-<n>` refused,
  Tier 3 tokens held to Tier 2, and the index's status and code path held to
  each spec's Metadata ([#50](https://github.com/Toniio/DSAIReadable/pull/50)).

- `dependabot-regenerate` workflow: on a Dependabot PR, reruns
  `registry:build`, `generate-context` and Prettier, and pushes the result with
  a GitHub App token so that the required checks run again.
- Component tests: `npm run test:components` (Vitest, Testing Library, axe-core)
  covers Button, Field, Progress, Combobox, Dialog, Tabs and Select — roles,
  accessible names, keyboard, variants and zero axe violations — and runs in CI
  ([#27](https://github.com/Toniio/DSAIReadable/pull/27)).
- `llms.txt` at the root, generated from the specs; `SECURITY.md`, `CHANGELOG.md`
  and `.github/CODEOWNERS`.
- `npm run check`: every CI check in one call, printing only the failures
  ([#24](https://github.com/Toniio/DSAIReadable/pull/24)).
- MCP server: resources, read-only annotations, concise answers and pagination
  ([#16](https://github.com/Toniio/DSAIReadable/pull/16)); the composition rules
  through `get_design_rules` ([#13](https://github.com/Toniio/DSAIReadable/pull/13));
  every version and identity field served from its source
  ([#20](https://github.com/Toniio/DSAIReadable/pull/20)).
- Specs: the **Tokens** and **Props / API** sections are generated from the code
  ([#5](https://github.com/Toniio/DSAIReadable/pull/5),
  [#6](https://github.com/Toniio/DSAIReadable/pull/6)); one choice rule per
  component family, in the index and the specs
  ([#11](https://github.com/Toniio/DSAIReadable/pull/11)).
- Tokens: disabled states drawn with `opacity.disabled`
  ([#8](https://github.com/Toniio/DSAIReadable/pull/8)); font-family tokens held
  to the fonts `next/font` loads ([#7](https://github.com/Toniio/DSAIReadable/pull/7)).

### Changed

- The repository is an npm workspace (`packages/eslint-plugin/`, `mcp-server/`,
  and the root, which Changesets versions): `npm ci` at the root installs all of
  it, with one lockfile. The version is now also the plugin's, which the server
  pins exactly; `versions:sync` and `versions:check` cover both. The MCP server
  needs Node.js 20.19 or later (ESLint 10) and ships `typescript`, `eslint` and
  `@typescript-eslint/parser` as runtime dependencies. `mcp:test-package` installs
  the server's tarball with the plugin's.
- The code examples of `Chart`, `Resizable` and `Skeleton` no longer teach an
  arbitrary value (`min-h-[200px]`, `w-[200px]`): they use the spacing scale
  (`min-h-52`, `w-52`, `w-36`).
- The design system, its inventory and the MCP server now share one version,
  `0.0.1`, until the first release. They were `1.1.0` (`design-system.index.json`,
  served as `design_system_version`) and `1.0.0` (`mcp-server/package.json`,
  served as `mcp_server_version`), two numbers for nothing that had been released.
- MCP server: every tool name starts with `dsaireadable_`
  (`dsaireadable_get_component_specs`, `dsaireadable_validate_screen`…), so it
  stays distinct among the tools of other servers. `get_component_specs` in
  `detailed` answers everything needed to write a component in one call: the
  full spec, its cva variants with their defaults, the sizes its size prop
  accepts (from `design-system.index.json`, served nowhere before) and the
  composition rules that cover it; `get_components` lists the sizes too.
  `get_ux_writing_rules` serves the voice and tone and content rules only.
- MCP server: `get_glossary` without a term answers `{ terms }` rather than a
  bare list; `get_dataviz_recommendation` answers an objective missing from
  the decision tree with an error rather than every objective.
- The spacing and type scales are locked, like colors, radii and shadows:
  `styles/globals.css` resets Tailwind's `--spacing`, `--text-*`, `--font-*`,
  `--font-weight-*`, `--leading-*` and `--tracking-*` and declares only the
  design system's steps, each read from a token. `p-13`, `text-7xl`,
  `font-serif` and `tracking-tighter` generate no CSS and ESLint rejects them.
  The spacing scale is Tailwind v3's plus `1.25`, `5.25` and `18`
  (`space.scale.*`); container widths (`max-w-sm`) keep Tailwind's values,
  checked equal to `space.container.*`. New tokens:
  `typography.letter-spacing.widest` and `typography.size-line-height.*`.
  Nothing moves on screen. `--spacing()` no longer compiles in an arbitrary
  value: read the step's token, `var(--space-scale-7)`.

- ToggleGroup: the items are spaced out by default (`spacing` 2, shadcn/ui's
  default); pass `spacing={0}` for a segmented control with merged borders.
- Combobox: `Combobox` is Base UI's `Combobox.Root`, as in shadcn/ui, so it
  takes the root's third type parameter, `Item`.
- The design system's stylesheet moved out of the demo app:
  `app/globals.css` → `styles/globals.css` (the `@theme` bridge, and the
  `css` entry of `components.json`), and the `next/font` typefaces from
  `app/layout.tsx` to `lib/fonts.ts`. `app/` now holds test pages only.
- **Breaking**: `UI_STRINGS.combobox.remove` is a function of the item,
  `remove("Apple")` → `"Remove Apple"`; `Combobox` no longer passes a
  `data-slot` to a Root that renders no element ([#51](https://github.com/Toniio/DSAIReadable/pull/51)).
- ButtonGroup, Combobox, Direction, Empty, Field, InputGroup, Item, Kbd and
  Spinner are `beta` in their specs, as in the index; Command's search icon and
  Combobox's chip remove button are dimmed with `text-muted-foreground` instead
  of `opacity-50`; NavigationMenu content eases with `ease-out` ([#50](https://github.com/Toniio/DSAIReadable/pull/50)).

- Tooling: ESLint 10. `eslint-plugin-react` reads the installed React version
  instead of detecting it, which relies on an API ESLint 10 removed; the unused
  `@eslint/eslintrc` is removed.
- **Breaking** — `Calendar` runs on react-day-picker 10. Its own props and its
  rendering are unchanged, but it passes every `DayPicker` prop through, so the
  props react-day-picker 10 removed are gone from `Calendar` too: `fromDate`,
  `toDate`, `fromMonth`, `toMonth`, `fromYear`, `toYear` (use `startMonth`,
  `endMonth` and `hidden`), `initialFocus` (use `autoFocus`),
  `onWeekNumberClick`, the `onDayKeyUp`/`onDayKeyPress`/`onDayPointer*`/
  `onDayTouch*` handlers, the `formatMonthCaption`/`formatYearCaption`
  formatters, the `labelDay` label, `components.Button` and the deprecated
  `classNames` keys. See the [upgrade guide](https://daypicker.dev/upgrading).
- The whole repository is written in native English
  ([#21](https://github.com/Toniio/DSAIReadable/pull/21),
  [#22](https://github.com/Toniio/DSAIReadable/pull/22),
  [#23](https://github.com/Toniio/DSAIReadable/pull/23)).
- Spec rules are testable: every constraint opens with MUST, MUST NOT, SHOULD
  or Note ([#9](https://github.com/Toniio/DSAIReadable/pull/9),
  [#10](https://github.com/Toniio/DSAIReadable/pull/10)).
- `build_screen` asks for 4 calls plus one per retained component
  ([#17](https://github.com/Toniio/DSAIReadable/pull/17)).
- Tooling: `engines` requires Node.js 22.12 or later; CI validates the registry
  with the `shadcn` version from the lockfile instead of `@latest`; Dependabot
  opens weekly grouped updates for npm and GitHub Actions; Prettier skips the
  generated JSON ([#29](https://github.com/Toniio/DSAIReadable/pull/29)).

### Fixed

- Registry consumers get the design system as it renders here. The base item
  now ships the lockdown (Tailwind's default colors, radii and shadows reset:
  `bg-red-500` generated CSS in every consumer's app), the `z-modal`…
  utilities (overlays had no z-index), `tw-animate-css` and
  `shadcn/tailwind.css`, and the base layer. The tokens moved from `cssVars` to
  `css`: the CLI mirrored each variable into `@theme`, which compiled `sm:` into
  `@media (width >= var(--breakpoint-sm))` — every responsive variant was dead —
  and turned each primitive into a class. The fonts are two new `registry:font`
  items, `font-jetbrains-mono` and `font-geist`: `--font-mono` referred to
  itself, so the whole interface fell back to the browser's font. README
  _After install_; `registry:test-install` builds the consumer's stylesheet
  and checks it.
- Specs, index and docs brought in line with the code: seven specs described a
  `ring-1` / `ring-2` focus the components no longer draw; README called the
  MCP server's npm package published (it is not) and listed no Dataviz or Admin
  tool; `styles/globals.css` pointed to a lockdown rationale the foundations
  did not have (now in `spacing.md` and `typography.md`).
- Accessibility: each Combobox chip's remove button names its item instead of
  a bare `Remove`. `/banking`: the budget bars take their series color — the
  class was built at runtime, so Tailwind never generated it and all four
  stayed `bg-primary` ([#51](https://github.com/Toniio/DSAIReadable/pull/51)).
- Accessibility: NavigationMenu links show the focus ring again — the content
  removed it from every link with `**:data-[slot=navigation-menu-link]:focus:ring-0`
  ([#50](https://github.com/Toniio/DSAIReadable/pull/50)).

- Specs: Dialog, AlertDialog, Drawer and Sheet no longer claim
  `aria-modal="true"`; Radix hides the rest of the page with `aria-hidden`
  instead ([#27](https://github.com/Toniio/DSAIReadable/pull/27)).
- MCP server: closed HTTP sessions are dropped instead of blocking the next
  request ([#25](https://github.com/Toniio/DSAIReadable/pull/25)); an expired or
  unknown session is refused with `404`
  ([#18](https://github.com/Toniio/DSAIReadable/pull/18)); an empty lookup is a
  tool error ([#19](https://github.com/Toniio/DSAIReadable/pull/19)).
- Accessibility: `ItemGroup` children get the `listitem` role
  ([#1](https://github.com/Toniio/DSAIReadable/pull/1)); `Slider` names its
  thumbs ([#2](https://github.com/Toniio/DSAIReadable/pull/2)); `EmptyTitle` and
  `PopoverTitle` render real headings
  ([#3](https://github.com/Toniio/DSAIReadable/pull/3),
  [#15](https://github.com/Toniio/DSAIReadable/pull/15)).
- Two composition rules the repository contradicted
  ([#12](https://github.com/Toniio/DSAIReadable/pull/12)); facts the
  documentation got wrong ([#14](https://github.com/Toniio/DSAIReadable/pull/14)).
- Combobox reads the default names of its icon buttons from
  `UI_STRINGS.combobox`, as its spec says; `index:strings` now reports a
  literal default on a `label` or `*Label` prop
  ([#28](https://github.com/Toniio/DSAIReadable/pull/28)).

### Removed

- MCP server: `get_component_variants`, served by `get_component_specs` in
  `detailed`; the `detailed` form of `get_ux_writing_rules`, which repeated
  `get_design_rules`.
- MCP server: HTTP sessions. Every request is served on its own, so
  `Mcp-Session-Id`, `MCP_SESSION_TTL_MS` and `MCP_MAX_SESSIONS` are gone, and
  `GET` or `DELETE` on `/mcp` receives a `405`.
- The unused `dotenv` dev dependency, the dead `sourceOf` script helper, and
  the `export` of eleven symbols only their own file uses.
- The Railway deployment: the MCP server runs locally only
  ([#25](https://github.com/Toniio/DSAIReadable/pull/25)).
- The test pages in `app/` (home, banking, four sign-in layouts), the Next.js
  app shell around them (`next.config.mjs`, `postcss.config.mjs`, the `dev`,
  `build` and `start` scripts, the CI `build` job) and
  `components/theme-provider.tsx`, which only they used. Nothing in the
  design system, its checks or the MCP server reads a page any more.
- The `get_page_patterns` MCP tool: it described two test pages. Page patterns
  come back as hand-written guidance keyed by task. `get_content_library` now
  draws only on the specs' code examples and the common strings.

### Security

- MCP server: the transitive `hono`, `fast-uri`, `ip-address`,
  `@hono/node-server` and `qs` advisories are fixed by lockfile updates
  ([#29](https://github.com/Toniio/DSAIReadable/pull/29)).
