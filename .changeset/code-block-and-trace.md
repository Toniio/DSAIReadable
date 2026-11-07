---
"dsaireadable": minor
---

component-api: Add two `beta` components from shadcn/ui, with their registry items: `CodeBlock` (`code-block`, on `button`) and `Trace` (`trace`, on `collapsible`).

- `CodeBlock` shows code, terminal output or a diff in one color, with a header, a title, line numbers, wrapping and a copy button. It has no syntax highlighting: shadcn/ui's `use-highlighted-code` hook is not shipped, because shiki's theme colors put some tokens under 4.5:1 and the design system has no syntax tokens.
- `CodeBlockCopyButton` adds two optional props to shadcn/ui's, `copyLabel` and `copiedLabel`, which replace its default names, `UI_STRINGS.codeBlock.copy` ("Copy") and `UI_STRINGS.codeBlock.copied` ("Copied").
- `Trace` lists the steps of an assistant's work, one `TraceLine` each, with a `running`, `error` or `pending` status and details that open under the line in a `TraceCollapsible`. A pending step keeps the muted text of a done one instead of fading to 60% opacity (2.55:1), and `TraceDescription` is `text-muted-foreground` instead of 70% of it (3.08:1).
- The details of a Trace step open and close at once under `prefers-reduced-motion`, like an Accordion panel.
