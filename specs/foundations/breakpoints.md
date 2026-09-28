# Breakpoints Foundation

> Source: `tokens/semantic.json` (`breakpoint.*`) · CSS variables: `tokens.css` Layer 2

**Tailwind's responsive prefixes are the design system's contract.** There is no
breakpoint other than these, and their values are the `breakpoint.*` tokens.

Tailwind compiles `md:` into a media query at build time, and a media query
cannot read a CSS variable: the token therefore does not drive Tailwind — it is
**the reference value** Tailwind must match. `npm run tokens:lint-bridge` fails
when the tokens and the values Tailwind compiles drift apart, in either
direction.

---

## Token Reference

| Token            | CSS variable       | Value          | Prefix | Status   |
| ---------------- | ------------------ | -------------- | ------ | -------- |
| `breakpoint.sm`  | `--breakpoint-sm`  | 40rem / 640px  | `sm:`  | active   |
| `breakpoint.md`  | `--breakpoint-md`  | 48rem / 768px  | `md:`  | active   |
| `breakpoint.lg`  | `--breakpoint-lg`  | 64rem / 1024px | `lg:`  | active   |
| `breakpoint.xl`  | `--breakpoint-xl`  | 80rem / 1280px | `xl:`  | reserved |
| `breakpoint.2xl` | `--breakpoint-2xl` | 96rem / 1536px | `2xl:` | reserved |

`reserved`: no component needs it today; the prefix exists and stays available
for wide layouts.

---

## Model

- **Mobile-first**: a class without a prefix applies everywhere; `md:` applies
  from a **viewport width** of 48rem up.
- `max-md:` caps from above (below 48rem); `md:max-lg:` targets a range.
- A breakpoint describes the **window**, not the container. To react to a
  container's width, use container queries (`@container`, `@md:`) — they have
  their own scale and do not depend on these tokens.

---

## Usage Rules

- ✅ Write the mobile version without a prefix, then add `sm:` / `md:` / `lg:` for wider screens
- ✅ Pick the first breakpoint at which the layout breaks, not a specific device
- ❌ Never write an arbitrary breakpoint (`min-[600px]:`, `max-[900px]:`) — only the prefixes in the table exist
- ❌ Never read `var(--breakpoint-*)` inside a media query: media queries do not resolve variables
- ❌ Do not change a `breakpoint.*` value without declaring the same value, as a literal, in the `@theme` of `app/globals.css` — the bridge lint will remind you
