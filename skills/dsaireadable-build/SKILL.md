---
name: dsaireadable-build
description: Builds and changes React screens with the DSAIReadable design system (shadcn/ui components, design tokens, Tailwind CSS v4, Phosphor icons) by asking its MCP server before writing code and validating the result until it is clean. Use when creating or editing a page, screen, form, dialog, list, table or any UI in a project that imports from @/components/ui and uses DSAIReadable, or when the user mentions DSAIReadable, its tokens or its components.
license: MIT
compatibility: Needs the DSAIReadable MCP server (npx -y @dsaireadable/mcp-server) connected as "dsaireadable", in a React project set up from the dsaireadable shadcn registry.
---

# Build with DSAIReadable

The design system answers every question about itself through its MCP server
`dsaireadable`. Ask it before you write: what you remember of shadcn/ui is close
to this system but not the same, and every difference is declared in the specs
the server serves. Never copy a spec into your answer from memory.

If no `dsaireadable_*` tool is available, stop and tell the user to connect the
server (`npx -y @dsaireadable/mcp-server`, stdio): without it, this skill has
nothing to read.

## Workflow

Copy this checklist and tick each step as you go:

```
Build progress:
- [ ] 1. Pattern: the screen's task has a page pattern? Read it
- [ ] 2. Components: one detailed spec per component retained
- [ ] 3. Rules: the foundations and the copy rules the screen touches
- [ ] 4. Write the code
- [ ] 5. Validate until zero errors
- [ ] 6. UI guard review (dsaireadable-ui-guard)
```

**1. Pattern.** When the screen carries out a task — create, edit, delete,
filter, search, sign in, settings — or shows an empty, loading, saving, form or
navigation state, call `dsaireadable_list_patterns`, then
`dsaireadable_get_pattern` with `response_format: "detailed"` for each one that
applies. Its components are the ones to retain, its structure and spacing lay
the screen out, its content says what to write. A screen often combines
several: a list with filters, an empty state and a delete action is three
patterns.

**2. Components.** For anything no pattern covers, call
`dsaireadable_get_components` (filtered by `category` when you know it) and pick
the component made for the job: a component exists for every control, so never
rebuild one with a `div`. Then, for each component you retain, call
`dsaireadable_get_component_specs` with `response_format: "detailed"`: props,
variants and their defaults, sizes, constraints, and the composition rules that
cover it. One call per component, and only for those you use.

**3. Rules.** `dsaireadable_get_design_rules` with a `category` gives the rules
of a foundation (`spacing`, `color`, `focus`, `size`…) or of a component.
`dsaireadable_get_ux_writing_rules` gives the voice every visible string
follows; `dsaireadable_get_content_library` gives ready labels and messages.
Call `dsaireadable_get_tokens` only for a token no rule names.

**4. Write.** What the server will not repeat at every turn:

- Import each component from its own module:
  `import { Button } from "@/components/ui/button"`. Icons come from
  `@phosphor-icons/react`, nothing else. Never import a stylesheet.
- Style only with the design system's Tailwind classes, which map to its
  semantic tokens. Tailwind's default palette, spacing and type scale are
  removed: `bg-blue-500`, `p-13` and `text-7xl` generate nothing. An arbitrary
  value (`p-[13px]`) is not removed: it generates its raw value, and the ESLint
  plugin and `dsaireadable_validate_code` are what refuse it. A token or a
  runtime variable with no class is read through Tailwind's shorthand,
  `w-(--radix-popover-trigger-width)`, never `w-[var(--…)]`. Never write a raw
  color, length or duration.
- One class serves both color modes: dark mode is the `.dark` class on
  `<html>`, and each semantic class already resolves to its dark value under
  it. Never pick a color per mode.
- Never a native `<button>`, `<input>`, `<select>`, `<textarea>`, `<label>`,
  `<table>`, `<dialog>`, `<a>` or `<svg>`: each has its component. A `div` is
  for layout only.
- Keep the shadcn/ui API you know, except where the spec declares a
  divergence: the spec wins.

**5. Validate.** Call `dsaireadable_validate_code` with the full file (the same
ESLint rules a project runs, plus TypeScript), then
`dsaireadable_validate_screen` (composition and token rules). Fix every error,
then validate again; repeat until both report zero errors. When the project has
`@dsaireadable/eslint-plugin` set up, run its ESLint on the file too: it also
knows which Tailwind classes exist.

**6. Review.** Before you hand back, apply the `dsaireadable-ui-guard` skill:
validation proves the code follows the system; the guard checks that the screen
is usable. Do not report the work as done before its verdict is a pass.

## Changing an existing screen

Read the whole file first. Keep what already follows the system; change only
what the request needs, with the same workflow for the components you add.
When you touch a component, call `dsaireadable_get_component_specs` for it even
if it is already on the screen: its constraints apply to your change. Validate
the whole file, not only the lines you wrote.
