---
name: dsaireadable-build
description: Changes an existing React screen built with the DSAIReadable design system (shadcn/ui components, design tokens, Tailwind CSS v4, Phosphor icons) without breaking what already follows it — reads the whole file, asks the MCP server for the concise spec of each component the change touches, and validates the whole file until it is clean. Use when editing, refactoring or extending a file that imports from @/components/ui, such as adding a field, a section, a control, a state or a confirmation to a page, form, dialog, list or table that already exists. Not for building a new screen from scratch, which the MCP server's own instructions cover.
license: MIT
compatibility: Needs the DSAIReadable MCP server (npx -y @dsaireadable/mcp-server) connected as "dsaireadable", in a React project set up from the dsaireadable shadcn registry.
---

# Change a DSAIReadable screen

The screen you change already follows the design system, or most of it does.
Your change must follow it too, and must not break what holds. The MCP server
`dsaireadable` answers every question about the system: ask it about what your
change adds or touches, not about what the file already shows. What you
remember of shadcn/ui is close to this system but not the same, and every
difference is declared in the specs the server serves.

If no `dsaireadable_*` tool is available, stop and tell the user to connect the
server (`npx -y @dsaireadable/mcp-server`, stdio): without it, this skill has
nothing to read.

## Workflow

Copy this checklist and tick each step as you go:

```
Change progress:
- [ ] 1. Read the whole file; note what follows the system
- [ ] 2. Specs: the concise spec of each component the change adds or touches, in one turn
- [ ] 3. Pattern: only when the change adds a task or a state the screen lacks
- [ ] 4. Write the change, and only the change
- [ ] 5. Validate the whole file until zero errors
```

**1. Read.** Read the whole file before you change a line. Note the
components it imports from `@/components/ui`, the classes it styles with and
the voice of its strings: your change uses the same ones. Keep everything the
request does not ask to change, even where you would have written it
differently.

**2. Specs.** List the components your change adds, and those on the screen it
changes. Call `dsaireadable_get_component_specs` for each of them, all in the
same turn, and only for those: a component already on the screen has
constraints that apply to your change too. When you do not know which
component does the job, call `dsaireadable_get_components`, filtered by
`category`: a component exists for every control, so never rebuild one with a
`div`.

Keep the default concise answer: the role, the MUST / MUST NOT constraints, the
export names and how the API departs from shadcn/ui. Ask for
`response_format: "detailed"`, for that component alone, only for a composed
component whose structure its constraints do not settle (`Sidebar`,
`Combobox`, `Chart`), or for a prop, variant or size a constraint names. Every
turn sends the whole conversation again, so a detailed spec read for nothing
costs once per turn after it.

**3. Pattern.** When the change adds a task or a state the screen did not
carry — a confirmation before a deletion, a saving state, an error message, an
empty result, filters — call `dsaireadable_get_pattern` for that pattern alone
(`dsaireadable_list_patterns` when you do not know its name). Its concise
answer gives its usage rules and its components; ask for `detailed` only to
read its structure or its code example.

**4. Write.** Change what the request needs, nothing else:

- Import each component from its own module:
  `import { Button } from "@/components/ui/button"`. Icons come from
  `@phosphor-icons/react`, nothing else. Never import a stylesheet.
- Style only with the design system's Tailwind classes, which map to its
  semantic tokens. Tailwind's default palette, spacing and type scale are
  removed: `bg-blue-500`, `p-13` and `text-7xl` generate nothing. Never write a
  raw color, length or duration, nor an arbitrary value (`p-[13px]`).
- One class serves both color modes: dark mode is the `.dark` class on
  `<html>`. Never pick a color per mode.
- Never a native `<button>`, `<input>`, `<select>`, `<textarea>`, `<label>`,
  `<table>`, `<dialog>`, `<a>` or `<svg>`: each has its component. A `div` is
  for layout only.
- Keep the shadcn/ui API you know, except where the spec declares a
  divergence: the spec wins.

**5. Validate.** Call `dsaireadable_validate_code` with the whole file, not
only the lines you wrote, then `dsaireadable_validate_screen`. Fix every error
your change caused and validate again, until both report zero errors. An error
in a part you did not touch: fix it when the fix is local, and say so in your
answer. When the project has `@dsaireadable/eslint-plugin` set up, run its
ESLint on the file too.
