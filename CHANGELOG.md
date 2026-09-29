# Changelog

Every notable change, in the [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
format. Nothing has been released yet: registry items install from `main`, so
every change below is live as soon as it is merged. Versions will follow
[Semantic Versioning](https://semver.org/) once the MCP server is published to
npm.

A pull request that changes behavior adds its line under **Unreleased**, in the
section that fits.

## [Unreleased]

### Added

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

- The unused `dotenv` dev dependency, the dead `sourceOf` script helper, and
  the `export` of eleven symbols only their own file uses.
- The Railway deployment: the MCP server runs locally only
  ([#25](https://github.com/Toniio/DSAIReadable/pull/25)).

### Security

- MCP server: the transitive `hono`, `fast-uri`, `ip-address`,
  `@hono/node-server` and `qs` advisories are fixed by lockfile updates
  ([#29](https://github.com/Toniio/DSAIReadable/pull/29)).
