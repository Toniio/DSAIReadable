---
"dsaireadable": patch
---

docs: The foundation specs keep in their rules what a screen does, and name the class it writes.

- Rules said twice: Color drops "Never fake subtlety with opacity", which its ❌ line on `text.subtle` says, and "Follow the surface hierarchy", which its `background.*` lines say. Motion merges "Always use the CSS tokens" into "Never work around the tokens".
- Steps of the design system's own upkeep leave the rules: Color's "Always test both modes", "Contrast is checked mechanically" and "APCA is advisory, WCAG 2 decides" move to a new "Checking a change" section, Elevation's "Always test in dark mode" to its note on dark-mode shadows, and Border width's "Add a `border-width.*` token" and Breakpoints' "Do not change a `breakpoint.*` value" to the prose of their pages.
- Rules that sent a screen to a reserved token no class reads now name the class: text on `bg-primary` is `text-primary-foreground`, not `text.action.on`; a divider between sections is a `Separator`, not `border.subtle`; an icon takes the color of its text, not `icon.action` or `icon.default`; a content column is `max-w-2xl`, `max-w-5xl` or `max-w-7xl`, not `content-*`; and the sequential chart palette is read through `bg-(--color-chart-sequential-N)`.
- Color's "Accessibility first" cites SC 1.4.3 for 3:1 on large text, and SC 1.4.11 for UI components only.
- Radius's decision rule gives content `radius.sm` to `radius.4xl`, as its token table and rules do; it said `radius.lg`.
