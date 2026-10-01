<!--
PR title in Conventional Commits format — it becomes the commit message on
`main` with a squash merge. Example: `fix(tokens): add destructive-foreground token`
-->

## Backlog item

<!-- 1 PR = 1 item. Example: P0-03 -->

## What this PR changes

<!-- The what and the why. Not the how: the diff already says it. -->

## Acceptance criteria

<!-- Copy the item's criteria and tick what is proven. -->

- [ ]
- [ ]

## Validation run

<!-- Paste the item's validation command and its output. -->

```

```

## Checklist

- [ ] `npm run check` passes
- [ ] A changeset declares the semver intent of a public-surface change (or none is needed: CONTRIBUTING → Versioning and releases)
- [ ] `npm run tokens-validate` passes (if tokens were touched)
- [ ] `npm run typecheck:all` passes
- [ ] `npm run lint` reports no error
- [ ] `npm run generate-context` produces no diff (if the design system changed)
- [ ] No raw value (hex, px, rem) added outside `tokens/primitive.json`
- [ ] The component's spec was read before the change, and updated if the API changed
- [ ] Any divergence from the shadcn/ui API is additive, or justified, and declared in `design-system.index.json` (`npm run index:shadcn`)
- [ ] Phosphor icons only
- [ ] Everything written in American English
