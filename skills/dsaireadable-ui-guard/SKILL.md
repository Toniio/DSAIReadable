---
name: dsaireadable-ui-guard
description: Reviews every screen built or changed with the DSAIReadable design system for basic UI and UX errors before handing it back — hierarchy, forms, empty, loading and error states, destructive actions, navigation, accessibility, microcopy and dark patterns — with a checklist and a file:line review that ends in pass or fail. Use whenever you create, edit or refactor a page, screen, form, dialog, list, table, empty state, settings page or any React UI that imports from @/components/ui, even when the user did not ask for a review.
license: MIT
compatibility: Reads its sources through the DSAIReadable MCP server (npx -y @dsaireadable/mcp-server) connected as "dsaireadable".
---

# UI guard

A screen can pass every lint and still be hard to use: two buttons fight for
attention, a list goes blank with no next step, a delete happens without a
word. This guard catches those before you hand the work back. Apply it on your
own, every time you create or change UI with the design system: it is part of
the work, not an extra the user has to ask for.

## How to apply it

1. **Run the deterministic checks first.** `dsaireadable_validate_code` and
   `dsaireadable_validate_screen` on every file you touched, and the project's
   ESLint when it has `@dsaireadable/eslint-plugin`. Fix until they report zero
   errors: what a tool checks, this guard does not repeat.
2. **Copy the checklist below** into your working notes and tick each line
   against the screen. A line that does not apply is ticked with `n/a`. When a
   line is unclear, open its reference file: each rule there says why it
   holds and where the design system writes it.
3. **Write the review**, one line per finding, then the verdict.
4. **Fix every blocking finding, then review again.** Hand back only on a pass.

Every rule cites its source: `spec:<Component>` is read with
`dsaireadable_get_component_specs` (`component_name`), `pattern:<name>` with
`dsaireadable_get_pattern` (`name`), `foundation:<name>` with
`dsaireadable_get_design_rules` (`category`). Limits and thresholds live in
those sources, never in this skill: read the source when a count matters.

## Checklist

```
UI guard:
Hierarchy and layout — references/layout.md
- [ ] One h1, levels in order; the page's main action sits by the title
- [ ] Primary buttons within the Button spec's limit; the rest outline or ghost
- [ ] Related content grouped (one Card per group); spacing from the scale only
Forms — references/forms.md
- [ ] Every control has a visible label (FieldLabel); placeholders only hint
- [ ] Optional fields say "(optional)"; required ones carry no asterisk
- [ ] Errors under their field say what to change; focus moves to the first
- [ ] Submit names the task, never disabled to signal a missing value
States — references/states.md
- [ ] Empty, loading, error and success each designed; never a blank area
- [ ] Indicator matches the wait (Skeleton, Spinner in the button, Progress)
- [ ] A failure keeps what the person typed and says how to recover
Feedback and destructive actions — references/feedback.md
- [ ] Irreversible action confirmed in an AlertDialog that names the object
- [ ] Reversible action done at once, with Undo; no confirmation
- [ ] Toasts for confirmations only, within Sonner's limits
Navigation and orientation — references/navigation.md
- [ ] The person can tell where they are (active item, title, breadcrumb)
- [ ] Every view has a way back or onward; no dead end
- [ ] Tabs switch views of one object only, within the Tabs limit
Accessibility — references/accessibility.md
- [ ] Every control and region named (icon buttons, dialogs, tables, status)
- [ ] Focus visible on every control; back on the trigger when a dialog closes
- [ ] Targets at the minimum size; state never shown by color alone
- [ ] Checked in light and dark
Microcopy — references/copy.md
- [ ] Sentence case; buttons start with a verb that names the result
- [ ] Errors say what happened and how to fix it, without blame
- [ ] Component strings come from UI_STRINGS or their override prop
Restraint and dark patterns — references/restraint.md
- [ ] Nothing the task does not need; counts within each spec's limits
- [ ] No shamed refusal, no pre-checked consent or paid option
```

## Review format

One line per finding, most severe first:

```
<file>:<line> — <blocking|should-fix> — <domain>/<rule> — <what to change>
```

```
app/projects/page.tsx:42 — blocking — feedback/irreversible — Delete runs on click: confirm in an AlertDialog titled with the project name
app/projects/page.tsx:18 — should-fix — copy/verb — "Submit" says nothing: "Create project"
```

**Blocking** is a rule marked MUST or NEVER; **should-fix** is a SHOULD. End
with exactly one verdict line:

```
UI guard: pass
UI guard: fail — 2 blocking, 1 should-fix
```

The verdict is a pass only with zero blocking findings. Never soften a blocking
finding into a should-fix to reach a pass: fix it, or say why it cannot be
fixed and leave the verdict at fail.
