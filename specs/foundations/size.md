# Size Foundation

> Source: `tokens/semantic.json` (`size.*`) · CSS variables: `tokens.css` Layer 2

One size so far: the smallest area a pointer has to hit. The design system
targets [WCAG 2.2 AA](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum),
whose SC 2.5.8 Target Size (Minimum) asks for a 24 × 24 CSS px target, or an
exception. The `@theme` bridge in `styles/globals.css` exposes the token in the
spacing namespace, so `min-h-target`, `min-w-target` and `size-target` exist.

---

## Token Reference

| Token             | CSS variable        | Value | Tailwind class                                | Use                                                    |
| ----------------- | ------------------- | ----- | --------------------------------------------- | ------------------------------------------------------ |
| `size.target.min` | `--size-target-min` | 24px  | `min-h-target`, `min-w-target`, `size-target` | Minimum clickable area of a control, drawn or hit area |

---

## Hit Area

A control may be drawn smaller than 24px, as long as its clickable area is
not. The area grows without moving the drawing:

- a pseudo-element on a `relative` control: the Checkbox and the Radio draw a
  16px box and click through `after:-inset-x-3 after:-inset-y-2` (40 × 32);
  the Slider thumb draws 12px and clicks through `after:-inset-2` (28 × 28);
  `SidebarGroupAction` draws 20px and clicks through `after:-inset-2` below
  `md`, `after:-inset-0.5` (24 × 24) above;
- a minimum size: `min-w-target` keeps an `InputGroupButton` of size `xs` 24px
  wide with a one-character label, and makes `SidebarMenuAction` 24 × 24
  (`-m-0.5` keeps it centered where its 20px box was). It sits on its menu
  button, so its own box has to reach 24px: a hit area on a pseudo-element
  covers the button without being measured as the action's (axe
  `target-size`);
- the library's own hit area: `ResizablePanelGroup` sets
  `resizeTargetMinimumSize` to 24px for mouse and touch (the library defaults
  to 10 and 20).

---

## Target Size Audit

Every interactive element of `components/ui`, audited on 2026-09-30;
`SidebarMenuAction` and the Slider thumbs revised on 2026-10-03. A
consumer-composed trigger (Popover, Tooltip, HoverCard, Collapsible, Dialog,
DropdownMenu) takes the size of its child, usually a `Button`.

**Conform (24px or more)** — Button every size (`xs` and `icon-xs` are 24px
exactly), Toggle and ToggleGroup items, Checkbox and Radio (hit area 40 × 32),
Switch (hit area 56 × 36, `sm` 48 × 30), Slider thumb (28), Pagination links
(32), InputOTP slots (32), Calendar day and navigation buttons (28), Carousel
previous / next (28), SidebarTrigger (28), SidebarMenuButton (28 to 48),
SidebarMenuSubButton (28), SidebarMenuAction (24), SidebarGroupAction (24 hit
area), Dialog and Sheet close buttons (28), AccordionTrigger (38), Select
trigger, items and scroll buttons, Combobox trigger, items, clear and chip
remove buttons, menu and command items (32), MenubarTrigger (24),
NavigationMenu trigger (36) and link (32), AttachmentAction (24),
QuestionnaireChoice (44), InputGroupButton (24), MessageScroller scroll button
(28), ResizableHandle (24 hit area).

**Exceptions** — below 24px, conforming through an exception of SC 2.5.8:

| Element                                         | Size                         | Exception                                                                                                                                                                                                                                      |
| ----------------------------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `TabsTrigger` (horizontal)                      | 23px tall                    | Spacing: the 24px circle overflows by half a pixel into the list's own padding, where no other target sits                                                                                                                                     |
| `BreadcrumbLink`                                | text × 16px                  | Spacing: links sit at least 26px apart; wrapped rows are 8px apart (`gap-y-2`), so the circles never meet                                                                                                                                      |
| `Badge` rendered as a link                      | 20px tall                    | Spacing: MUST keep 4px of clear space above and below; `overflow-hidden` clips a pseudo-element hit area                                                                                                                                       |
| `SidebarRail`                                   | 16px wide                    | Equivalent: `SidebarTrigger` toggles the same sidebar — a page that renders the rail MUST render the trigger too                                                                                                                               |
| Calendar month / year `Select`                  | 20px tall                    | Spacing: 6px apart, and the caption's `px-(--cell-size)` keeps them 28px away from the navigation buttons                                                                                                                                      |
| `Slider` thumbs of a range less than 24px apart | 12px drawn, 28 × 28 hit area | **Known gap**: the two hit areas overlap, and no exception applies. A pointer anywhere on the track moves the closer thumb, and the arrow keys move each one. axe `target-size` flags the thumbs only then: at rest a range's thumbs sit apart |
| `ScrollBar` and its thumb                       | 10px wide                    | **Known gap**: no exception applies. A wider hit area would cover the content along the edge; wheel, touch and keyboard scroll the same area                                                                                                   |

---

## Usage Rules

- ✅ Give every control you build a clickable area of at least 24 × 24px: `min-h-target min-w-target`, or a hit area on a pseudo-element
- ✅ Draw a control smaller than 24px only with a hit area that reaches `size.target.min` and stays inside its own row or cell
- ✅ Keep 4px of clear space around a Badge rendered as a link, and render `SidebarTrigger` wherever `SidebarRail` is rendered
- ❌ Never shrink a `Button` below size `xs` / `icon-xs`, or add a hit area that overlaps another target
- ❌ Do not use `size.target.min` as a spacing value or an icon size
- Inline links in a sentence are exempt (SC 2.5.8 "inline"): their size follows the line height of the text
