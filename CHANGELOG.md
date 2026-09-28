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

- The Railway deployment: the MCP server runs locally only
  ([#25](https://github.com/Toniio/DSAIReadable/pull/25)).

### Security

- MCP server: the transitive `hono`, `fast-uri`, `ip-address`,
  `@hono/node-server` and `qs` advisories are fixed by lockfile updates
  ([#29](https://github.com/Toniio/DSAIReadable/pull/29)).
