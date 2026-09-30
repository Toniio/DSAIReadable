# Changesets

Each file here declares the semver intent of one change, in a line an agent can
parse: the package, the bump, then a summary that starts with its category.

```md
---
"dsaireadable": minor
---

component-api: Add the `xs` size to Button.
```

The categories, the bump each one takes and when a change needs no changeset
are in [`CONTRIBUTING.md`](../CONTRIBUTING.md#versioning-and-releases).
`npm run changesets:lint` checks them.
