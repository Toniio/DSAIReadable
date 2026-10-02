# Changelog

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
