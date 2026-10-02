# Sidebar

## Metadata

| Field         | Value                     |
| ------------- | ------------------------- |
| Name          | Sidebar                   |
| Category      | Layout                    |
| Status        | stable                    |
| figma_node_id |                           |
| code_path     | components/ui/sidebar.tsx |

## Role

A complete side navigation panel: responsive (a Sheet on mobile), collapsible, with a keyboard shortcut and its state persisted in a cookie.

## Usage

- The primary navigation of an application (a left or right side menu)
- Organize links hierarchically, with groups, submenus and badges
- An icon-only (collapsed) mode that frees up space for the content
- Mobile navigation in a Sheet that opens and closes with a swipe
- Dashboard-style layouts with a header, content and a footer inside the sidebar

## Constraints

- **MUST** — place `Sidebar` inside a `SidebarProvider`, otherwise `useSidebar` throws
- **MUST NOT** — place more than one `Sidebar` per side in the same `SidebarProvider`
- **MUST** — check that a nested layout copes with the margins and shadows of the `floating` and `inset` variants
- **MUST** — give a `tooltip` to every `SidebarMenuButton` collapsed to its icon
- **MUST NOT** — bind `Ctrl+B` / `⌘+B` to another action: `SidebarProvider` registers it to collapse the bar
- **MUST** — in an interface that is not in English, translate the strings the sidebar renders for screen readers: `toggleLabel` on `SidebarTrigger` and `SidebarRail`, `mobileTitle` and `mobileDescription` on `Sidebar` (defaults in `UI_STRINGS.sidebar`)

## Dependencies

- `Slot.Root` from `radix-ui` (for `asChild`)
- `class-variance-authority` (the `SidebarMenuButton` variants)
- `@/hooks/use-mobile` (the `useIsMobile` hook)
- `@/lib/utils` (the `cn` utility)
- `@/components/ui/button` (the `Button` component)
- `@/components/ui/input` (the `Input` component)
- `@/components/ui/separator` (the `Separator` component)
- `@/components/ui/sheet` (the `Sheet`, `SheetContent`, `SheetHeader`, `SheetTitle`, `SheetDescription` components)
- `@/components/ui/skeleton` (the `Skeleton` component)
- `@/components/ui/tooltip` (the `Tooltip`, `TooltipContent`, `TooltipTrigger` components)
- `@phosphor-icons/react` (the `SidebarIcon` icon)

## Anatomy

| Slot                                  | Role                                                                     |
| ------------------------------------- | ------------------------------------------------------------------------ |
| `data-slot="sidebar-wrapper"`         | The provider's root container; carries the CSS variables                 |
| `data-slot="sidebar"`                 | The sidebar's main panel                                                 |
| `data-slot="sidebar-gap"`             | Space reserved for the sidebar on desktop (handles the width transition) |
| `data-slot="sidebar-container"`       | Fixed-position container (`fixed inset-y-0`)                             |
| `data-slot="sidebar-inner"`           | Inner wrapper with the background and the variant styles                 |
| `data-slot="sidebar-trigger"`         | Button that opens and closes the sidebar                                 |
| `data-slot="sidebar-rail"`            | Thin clickable rail on the edge that toggles the sidebar                 |
| `data-slot="sidebar-inset"`           | Main content area (`<main>`) next to the sidebar                         |
| `data-slot="sidebar-input"`           | Search field inside the sidebar                                          |
| `data-slot="sidebar-header"`          | The sidebar's header                                                     |
| `data-slot="sidebar-footer"`          | The sidebar's footer                                                     |
| `data-slot="sidebar-separator"`       | Horizontal separator                                                     |
| `data-slot="sidebar-content"`         | Main scrolling content area                                              |
| `data-slot="sidebar-group"`           | A navigation group                                                       |
| `data-slot="sidebar-group-label"`     | Group label                                                              |
| `data-slot="sidebar-group-action"`    | Contextual action of a group                                             |
| `data-slot="sidebar-group-content"`   | Content of a group                                                       |
| `data-slot="sidebar-menu"`            | Menu list (`<ul>`)                                                       |
| `data-slot="sidebar-menu-item"`       | Menu item (`<li>`)                                                       |
| `data-slot="sidebar-menu-button"`     | Interactive menu button                                                  |
| `data-slot="sidebar-menu-action"`     | Contextual action of a menu item                                         |
| `data-slot="sidebar-menu-badge"`      | Notification badge on an item                                            |
| `data-slot="sidebar-menu-skeleton"`   | Loading skeleton of an item                                              |
| `data-slot="sidebar-menu-sub"`        | Submenu (a nested `<ul>`)                                                |
| `data-slot="sidebar-menu-sub-item"`   | Submenu item                                                             |
| `data-slot="sidebar-menu-sub-button"` | Submenu button                                                           |

## Tokens

<!-- Generated by scripts/build-spec-tokens.ts from the component's code — do not edit by hand. -->

| Token                             | Classes and variables                                                                                                                                                    | Where                                                                                                                                                                                                                                                                                                                           |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `border-width.default`            | `border-l` · `border-r` · `ring-(length:--border-width-default)`                                                                                                         | `SidebarMenuSub` · `Sidebar` · `sidebarMenuButtonVariants.variant.outline` via `SURFACE_OUTLINE` (`lib/surface.ts`)                                                                                                                                                                                                             |
| `color.background.default`        | `bg-background`                                                                                                                                                          | `SidebarInput` · `SidebarInset` · `sidebarMenuButtonVariants.variant.outline`                                                                                                                                                                                                                                                   |
| `color.sidebar.accent.default`    | `bg-sidebar-accent` · `ring-sidebar-accent`                                                                                                                              | `SidebarGroupAction` · `SidebarMenuAction` · `SidebarMenuSubButton` · `sidebarMenuButtonVariants.variant.default` · `sidebarMenuButtonVariants.variant.outline` · `sidebarMenuButtonVariants`                                                                                                                                   |
| `color.sidebar.accent.foreground` | `text-sidebar-accent-foreground`                                                                                                                                         | `SidebarGroupAction` · `SidebarMenuAction` · `SidebarMenuBadge` · `SidebarMenuSubButton` · `sidebarMenuButtonVariants.variant.default` · `sidebarMenuButtonVariants.variant.outline` · `sidebarMenuButtonVariants`                                                                                                              |
| `color.sidebar.background`        | `bg-sidebar`                                                                                                                                                             | `SidebarProvider` · `SidebarRail` · `Sidebar`                                                                                                                                                                                                                                                                                   |
| `color.sidebar.border`            | `bg-sidebar-border` · `border-sidebar-border` · `ring-sidebar-border`                                                                                                    | `SidebarMenuSub` · `SidebarRail` · `SidebarSeparator` · `Sidebar` · `sidebarMenuButtonVariants.variant.outline`                                                                                                                                                                                                                 |
| `color.sidebar.foreground`        | `text-sidebar-foreground` · `text-sidebar-foreground/70`                                                                                                                 | `SidebarGroupAction` · `SidebarGroupLabel` · `SidebarMenuAction` · `SidebarMenuBadge` · `SidebarMenuSubButton` · `Sidebar`                                                                                                                                                                                                      |
| `color.sidebar.ring`              | `ring-sidebar-ring`                                                                                                                                                      | `SidebarGroupAction` · `SidebarGroupLabel` · `SidebarMenuAction` · `SidebarMenuSubButton` · `sidebarMenuButtonVariants`                                                                                                                                                                                                         |
| `elevation.sm`                    | `shadow-sm`                                                                                                                                                              | `SidebarInset` · `Sidebar`                                                                                                                                                                                                                                                                                                      |
| `motion.duration.fast`            | `transition-[left,right,width]` · `transition-[margin,opacity]` · `transition-[width,height,padding]` · `transition-[width]` · `transition-all` · `transition-transform` | `SidebarGroupAction` · `SidebarGroupLabel` · `SidebarMenuAction` · `SidebarRail` · `Sidebar` · `sidebarMenuButtonVariants`                                                                                                                                                                                                      |
| `motion.duration.normal`          | `duration-normal`                                                                                                                                                        | `SidebarGroupLabel` · `Sidebar`                                                                                                                                                                                                                                                                                                 |
| `motion.easing.default`           | `transition-[left,right,width]` · `transition-[margin,opacity]` · `transition-[width,height,padding]` · `transition-[width]` · `transition-all` · `transition-transform` | `SidebarGroupAction` · `SidebarGroupLabel` · `SidebarMenuAction` · `SidebarRail` · `Sidebar` · `sidebarMenuButtonVariants`                                                                                                                                                                                                      |
| `opacity.disabled`                | `opacity-disabled`                                                                                                                                                       | `SidebarMenuSubButton` · `sidebarMenuButtonVariants`                                                                                                                                                                                                                                                                            |
| `space.focus-ring-width`          | `ring-(length:--space-focus-ring-width)`                                                                                                                                 | `SidebarGroupAction` via `FOCUS_RING_WIDTH` (`lib/focus.ts`) · `SidebarGroupLabel` via `FOCUS_RING_WIDTH` (`lib/focus.ts`) · `SidebarMenuAction` via `FOCUS_RING_WIDTH` (`lib/focus.ts`) · `SidebarMenuSubButton` via `FOCUS_RING_WIDTH` (`lib/focus.ts`) · `sidebarMenuButtonVariants` via `FOCUS_RING_WIDTH` (`lib/focus.ts`) |
| `space.layout.sidebar`            | `var(--space-layout-sidebar)`                                                                                                                                            | `SIDEBAR_WIDTH`                                                                                                                                                                                                                                                                                                                 |
| `space.layout.sidebar-icon`       | `var(--space-layout-sidebar-icon)`                                                                                                                                       | `SIDEBAR_WIDTH_ICON`                                                                                                                                                                                                                                                                                                            |
| `space.layout.sidebar-mobile`     | `var(--space-layout-sidebar-mobile)`                                                                                                                                     | `SIDEBAR_WIDTH_MOBILE`                                                                                                                                                                                                                                                                                                          |
| `space.scale.0`                   | `gap-0` · `inset-y-0` · `left-0` · `min-h-0` · `min-w-0` · `ml-0` · `p-0` · `right-0` · `translate-x-0` · `w-0`                                                          | `SidebarContent` · `SidebarGroupAction` · `SidebarGroup` · `SidebarInset` · `SidebarMenuAction` · `SidebarMenuSubButton` · `SidebarMenuSub` · `SidebarMenu` · `SidebarRail` · `Sidebar` · `sidebarMenuButtonVariants.size.lg`                                                                                                   |
| `space.scale.0-5`                 | `-inset-0.5` · `py-0.5` · `w-0.5`                                                                                                                                        | `SidebarGroupAction` · `SidebarMenuAction` · `SidebarMenuSub` · `SidebarRail`                                                                                                                                                                                                                                                   |
| `space.scale.1`                   | `gap-1` · `px-1` · `right-1` · `top-1`                                                                                                                                   | `SidebarMenuAction` · `SidebarMenuBadge` · `SidebarMenuSub`                                                                                                                                                                                                                                                                     |
| `space.scale.1-5`                 | `top-1.5`                                                                                                                                                                | `SidebarMenuAction` · `SidebarMenuBadge`                                                                                                                                                                                                                                                                                        |
| `space.scale.12`                  | `h-12`                                                                                                                                                                   | `sidebarMenuButtonVariants.size.lg`                                                                                                                                                                                                                                                                                             |
| `space.scale.2`                   | `-inset-2` · `-left-2` · `-right-2` · `gap-2` · `m-2` · `ml-2` · `mx-2` · `p-2` · `px-2`                                                                                 | `SidebarFooter` · `SidebarGroupAction` · `SidebarGroupLabel` · `SidebarGroup` · `SidebarHeader` · `SidebarInset` · `SidebarMenuAction` · `SidebarMenuSkeleton` · `SidebarMenuSubButton` · `SidebarRail` · `SidebarSeparator` · `Sidebar` · `sidebarMenuButtonVariants`                                                          |
| `space.scale.2-5`                 | `px-2.5` · `top-2.5`                                                                                                                                                     | `SidebarMenuAction` · `SidebarMenuBadge` · `SidebarMenuSub`                                                                                                                                                                                                                                                                     |
| `space.scale.3`                   | `right-3`                                                                                                                                                                | `SidebarGroupAction`                                                                                                                                                                                                                                                                                                            |
| `space.scale.3-5`                 | `mx-3.5` · `top-3.5`                                                                                                                                                     | `SidebarGroupAction` · `SidebarMenuSub`                                                                                                                                                                                                                                                                                         |
| `space.scale.4`                   | `-right-4` · `h-4` · `size-4` · `w-4` · `w-[calc(var(--sidebar-width-icon)+var(--space-scale-4))]` · `w-[calc(var(--sidebar-width-icon)+var(--space-scale-4)+2px)]`      | `SidebarGroupAction` · `SidebarGroupLabel` · `SidebarMenuAction` · `SidebarMenuSkeleton` · `SidebarMenuSubButton` · `SidebarRail` · `Sidebar` · `sidebarMenuButtonVariants`                                                                                                                                                     |
| `space.scale.5`                   | `h-5` · `min-w-5` · `w-5`                                                                                                                                                | `SidebarGroupAction` · `SidebarMenuAction` · `SidebarMenuBadge`                                                                                                                                                                                                                                                                 |
| `space.scale.7`                   | `h-7`                                                                                                                                                                    | `SidebarMenuSubButton` · `sidebarMenuButtonVariants.size.sm`                                                                                                                                                                                                                                                                    |
| `space.scale.8`                   | `-mt-8` · `h-8` · `pr-8` · `size-8`                                                                                                                                      | `SidebarGroupLabel` · `SidebarInput` · `SidebarMenuSkeleton` · `sidebarMenuButtonVariants.size.default` · `sidebarMenuButtonVariants`                                                                                                                                                                                           |
| `typography.font-weight.medium`   | `font-medium`                                                                                                                                                            | `SidebarMenuBadge` · `sidebarMenuButtonVariants`                                                                                                                                                                                                                                                                                |
| `typography.size-line-height.xs`  | `text-xs`                                                                                                                                                                | `SidebarGroupContent` · `SidebarGroupLabel` · `SidebarMenuBadge` · `SidebarMenuSubButton` · `sidebarMenuButtonVariants.size.default` · `sidebarMenuButtonVariants.size.lg` · `sidebarMenuButtonVariants.size.sm` · `sidebarMenuButtonVariants`                                                                                  |
| `typography.size.xs`              | `text-xs`                                                                                                                                                                | `SidebarGroupContent` · `SidebarGroupLabel` · `SidebarMenuBadge` · `SidebarMenuSubButton` · `sidebarMenuButtonVariants.size.default` · `sidebarMenuButtonVariants.size.lg` · `sidebarMenuButtonVariants.size.sm` · `sidebarMenuButtonVariants`                                                                                  |
| `zindex.fixed`                    | `z-fixed`                                                                                                                                                                | `Sidebar`                                                                                                                                                                                                                                                                                                                       |
| `zindex.sticky`                   | `z-sticky`                                                                                                                                                               | `SidebarRail`                                                                                                                                                                                                                                                                                                                   |

Collected from `components/ui/sidebar.tsx` and the `lib/` constants it imports; Tailwind resolves each class down to its semantic token. **Where**: the sub-component, the `cva` variant path or the constant the class comes from. Classes that read no token (`w-full`, `flex`, layout) are left out.

Composes `Button`, `Input`, `Separator`, `Sheet`, `Skeleton`, `Tooltip` — Button in SidebarTrigger: variant ghost, size icon-sm; their tokens are listed in their own specs.

## Props / API

<!-- Generated by scripts/build-spec-api.ts from the TypeScript exports. Only the descriptions are edited by hand; they are kept. -->

### `Sidebar`

Renders `<div>`.

| Prop                | Type                                 | Default                                | Description                                                  |
| ------------------- | ------------------------------------ | -------------------------------------- | ------------------------------------------------------------ |
| `side`              | `"left" \| "right"`                  | `"left"`                               | Side the sidebar sits on                                     |
| `variant`           | `"sidebar" \| "floating" \| "inset"` | `"sidebar"`                            | Visual style of the sidebar                                  |
| `collapsible`       | `"offcanvas" \| "icon" \| "none"`    | `"offcanvas"`                          | How the sidebar collapses                                    |
| `mobileTitle`       | `string`                             | `UI_STRINGS.sidebar.mobileTitle`       | Title of the mobile Sheet, read by screen readers only       |
| `mobileDescription` | `string`                             | `UI_STRINGS.sidebar.mobileDescription` | Description of the mobile Sheet, read by screen readers only |
| `dir`               | `string`                             | —                                      | Reading direction (mobile Sheet)                             |
| `className`         | `string`                             | —                                      | Additional CSS classes                                       |
| `...props`          | `React.ComponentProps<"div">`        | —                                      | Native `<div>` props                                         |

### `SidebarContent`

Renders `<div>`.

| Prop       | Type                          | Default | Description          |
| ---------- | ----------------------------- | ------- | -------------------- |
| `...props` | `React.ComponentProps<"div">` | —       | Native `<div>` props |

### `SidebarFooter`

Renders `<div>`.

| Prop       | Type                          | Default | Description          |
| ---------- | ----------------------------- | ------- | -------------------- |
| `...props` | `React.ComponentProps<"div">` | —       | Native `<div>` props |

### `SidebarGroup`

Renders `<div>`.

| Prop       | Type                          | Default | Description          |
| ---------- | ----------------------------- | ------- | -------------------- |
| `...props` | `React.ComponentProps<"div">` | —       | Native `<div>` props |

### `SidebarGroupAction`

Renders `<button>`, or its child with `asChild`.

| Prop       | Type                             | Default | Description                                                                      |
| ---------- | -------------------------------- | ------- | -------------------------------------------------------------------------------- |
| `asChild`  | `boolean`                        | `false` | Renders the first child instead, passing it the props and classes (Radix `Slot`) |
| `...props` | `React.ComponentProps<"button">` | —       | Native `<button>` props                                                          |

### `SidebarGroupContent`

Renders `<div>`.

| Prop       | Type                          | Default | Description          |
| ---------- | ----------------------------- | ------- | -------------------- |
| `...props` | `React.ComponentProps<"div">` | —       | Native `<div>` props |

### `SidebarGroupLabel`

Renders `<div>`, or its child with `asChild`.

| Prop       | Type                          | Default | Description                                                                      |
| ---------- | ----------------------------- | ------- | -------------------------------------------------------------------------------- |
| `asChild`  | `boolean`                     | `false` | Renders the first child instead, passing it the props and classes (Radix `Slot`) |
| `...props` | `React.ComponentProps<"div">` | —       | Native `<div>` props                                                             |

### `SidebarHeader`

Renders `<div>`.

| Prop       | Type                          | Default | Description          |
| ---------- | ----------------------------- | ------- | -------------------- |
| `...props` | `React.ComponentProps<"div">` | —       | Native `<div>` props |

### `SidebarInput`

Renders `Input`.

| Prop       | Type                                 | Default | Description   |
| ---------- | ------------------------------------ | ------- | ------------- |
| `...props` | `React.ComponentProps<typeof Input>` | —       | `Input` props |

### `SidebarInset`

Renders `<main>`.

| Prop       | Type                           | Default | Description           |
| ---------- | ------------------------------ | ------- | --------------------- |
| `...props` | `React.ComponentProps<"main">` | —       | Native `<main>` props |

### `SidebarMenu`

Renders `<ul>`.

| Prop       | Type                         | Default | Description         |
| ---------- | ---------------------------- | ------- | ------------------- |
| `...props` | `React.ComponentProps<"ul">` | —       | Native `<ul>` props |

### `SidebarMenuAction`

Renders `<button>`, or its child with `asChild`.

| Prop          | Type                             | Default | Description                                                                                                |
| ------------- | -------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------- |
| `asChild`     | `boolean`                        | `false` | Renders the first child instead, passing it the props and classes (Radix `Slot`)                           |
| `showOnHover` | `boolean`                        | `false` | On desktop (`md` and up), hides the action until the item is hovered or focused, or while its menu is open |
| `...props`    | `React.ComponentProps<"button">` | —       | Native `<button>` props                                                                                    |

### `SidebarMenuBadge`

Renders `<div>`.

| Prop       | Type                          | Default | Description          |
| ---------- | ----------------------------- | ------- | -------------------- |
| `...props` | `React.ComponentProps<"div">` | —       | Native `<div>` props |

### `SidebarMenuButton`

Renders `<button>`, or its child with `asChild`.

| Prop       | Type                                                    | Default     | Description                                   |
| ---------- | ------------------------------------------------------- | ----------- | --------------------------------------------- |
| `asChild`  | `boolean`                                               | `false`     | Renders the first child instead, through Slot |
| `isActive` | `boolean`                                               | `false`     | Marks the item as active                      |
| `tooltip`  | `string \| React.ComponentProps<typeof TooltipContent>` | —           | Tooltip shown in collapsed mode               |
| `variant`  | `"default" \| "outline"`                                | `"default"` | Visual variant                                |
| `size`     | `"default" \| "sm" \| "lg"`                             | `"default"` | Button size                                   |
| `...props` | `React.ComponentProps<"button">`                        | —           | Native `<button>` props                       |

### `SidebarMenuItem`

Renders `<li>`.

| Prop       | Type                         | Default | Description         |
| ---------- | ---------------------------- | ------- | ------------------- |
| `...props` | `React.ComponentProps<"li">` | —       | Native `<li>` props |

### `SidebarMenuSkeleton`

Renders `<div>`.

| Prop       | Type                          | Default | Description                                        |
| ---------- | ----------------------------- | ------- | -------------------------------------------------- |
| `showIcon` | `boolean`                     | `false` | Adds an icon square before the skeleton's text bar |
| `...props` | `React.ComponentProps<"div">` | —       | Native `<div>` props                               |

### `SidebarMenuSub`

Renders `<ul>`.

| Prop       | Type                         | Default | Description         |
| ---------- | ---------------------------- | ------- | ------------------- |
| `...props` | `React.ComponentProps<"ul">` | —       | Native `<ul>` props |

### `SidebarMenuSubButton`

Renders `<a>`, or its child with `asChild`.

| Prop       | Type                        | Default     | Description                                   |
| ---------- | --------------------------- | ----------- | --------------------------------------------- |
| `asChild`  | `boolean`                   | `false`     | Renders the first child instead, through Slot |
| `size`     | `"sm" \| "default"`         | `"default"` | Size of the submenu button                    |
| `isActive` | `boolean`                   | `false`     | Marks the item as active                      |
| `...props` | `React.ComponentProps<"a">` | —           | Native `<a>` props                            |

### `SidebarMenuSubItem`

Renders `<li>`.

| Prop       | Type                         | Default | Description         |
| ---------- | ---------------------------- | ------- | ------------------- |
| `...props` | `React.ComponentProps<"li">` | —       | Native `<li>` props |

### `SidebarProvider`

Renders `<div>`.

| Prop           | Type                          | Default | Description                        |
| -------------- | ----------------------------- | ------- | ---------------------------------- |
| `defaultOpen`  | `boolean`                     | `true`  | Initial open state (uncontrolled)  |
| `open`         | `boolean`                     | —       | Open state (controlled)            |
| `onOpenChange` | `(open: boolean) => void`     | —       | Called when the open state changes |
| `className`    | `string`                      | —       | Additional CSS classes             |
| `style`        | `React.CSSProperties`         | —       | Additional inline styles           |
| `...props`     | `React.ComponentProps<"div">` | —       | Native `<div>` props               |

### `SidebarRail`

Renders `<button>`.

| Prop          | Type                             | Default                     | Description                             |
| ------------- | -------------------------------- | --------------------------- | --------------------------------------- |
| `toggleLabel` | `string`                         | `UI_STRINGS.sidebar.toggle` | Accessible name and `title` of the rail |
| `...props`    | `React.ComponentProps<"button">` | —                           | Native `<button>` props                 |

### `SidebarSeparator`

Renders `Separator`.

| Prop       | Type                                     | Default | Description       |
| ---------- | ---------------------------------------- | ------- | ----------------- |
| `...props` | `React.ComponentProps<typeof Separator>` | —       | `Separator` props |

### `SidebarTrigger`

Renders `Button`.

| Prop          | Type                                  | Default                     | Description                 |
| ------------- | ------------------------------------- | --------------------------- | --------------------------- |
| `toggleLabel` | `string`                              | `UI_STRINGS.sidebar.toggle` | Text read by screen readers |
| `...props`    | `React.ComponentProps<typeof Button>` | —                           | `Button` props              |

### `useSidebar()`

Returns `SidebarContextProps`.

<!-- End of the generated part. -->

### Exported hook

| Hook         | Returns               | Description                                                                                            |
| ------------ | --------------------- | ------------------------------------------------------------------------------------------------------ |
| `useSidebar` | `SidebarContextProps` | Gives access to `state`, `open`, `setOpen`, `openMobile`, `setOpenMobile`, `isMobile`, `toggleSidebar` |

## Variants

<!-- Generated by scripts/build-spec-variants.ts from mcp-server/context/component-variants.json — do not edit by hand. -->

| Component           | Axis      | Values                  | Default   |
| ------------------- | --------- | ----------------------- | --------- |
| `SidebarMenuButton` | `variant` | `default` · `outline`   | `default` |
| `SidebarMenuButton` | `size`    | `default` · `sm` · `lg` | `default` |

What each axis means (appearance, intent, size…) is stated under **Props / API**.

## States

<!-- Generated by scripts/build-spec-states.ts from the component's classes. Only the descriptions are edited by hand; they are kept. -->

| State       | Classes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Description                                                                                                                                                                                                                                                        |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `default`   | —                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Sidebar open (`data-state="expanded"`), full width                                                                                                                                                                                                                 |
| `hover`     | `data-open:hover:bg-sidebar-accent` · `data-open:hover:text-sidebar-accent-foreground` · `group-hover/menu-item:opacity-100` · `hover:after:bg-sidebar-border` · `hover:bg-sidebar-accent` · `hover:group-data-[collapsible=offcanvas]:bg-sidebar` · `hover:ring-sidebar-accent` · `hover:text-sidebar-accent-foreground` · `peer-hover/menu-button:text-sidebar-accent-foreground`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Menu items take the accent background and text (`bg-sidebar-accent`, `text-sidebar-accent-foreground`); a `showOnHover` action appears; the rail shows its `bg-sidebar-border` line                                                                                |
| `focus`     | `focus-visible:ring-(length:--space-focus-ring-width)` · `group-focus-within/menu-item:opacity-100`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | `ring-sidebar-ring` ring `--space-focus-ring-width` wide (`FOCUS_RING_WIDTH`, `lib/focus.ts`) on interactive elements; a `showOnHover` action appears while its item holds the focus                                                                               |
| `active`    | `active:bg-sidebar-accent` · `active:text-sidebar-accent-foreground` · `data-active:bg-sidebar-accent` · `data-active:font-medium` · `data-active:text-sidebar-accent-foreground` · `peer-data-active/menu-button:text-sidebar-accent-foreground`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Menu item marked active (`data-active`): accent background and text, in medium weight on a `SidebarMenuButton` (`font-medium`); a pressed item also takes `bg-sidebar-accent`                                                                                      |
| `open`      | `aria-expanded:opacity-100` · `data-open:hover:bg-sidebar-accent` · `data-open:hover:text-sidebar-accent-foreground`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | A menu button whose menu is open has no style of its own and takes the accent background and text only on hover (`bg-sidebar-accent`, `text-sidebar-accent-foreground`); a `showOnHover` action stays visible while its menu is open (`aria-expanded:opacity-100`) |
| `collapsed` | `[[data-side=left][data-collapsible=offcanvas]_&]:-right-2` · `[[data-side=left][data-state=collapsed]_&]:cursor-e-resize` · `[[data-side=right][data-collapsible=offcanvas]_&]:-left-2` · `[[data-side=right][data-state=collapsed]_&]:cursor-w-resize` · `data-[side=left]:group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]` · `data-[side=right]:group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]` · `group-data-[collapsible=icon]:-mt-8` · `group-data-[collapsible=icon]:hidden` · `group-data-[collapsible=icon]:opacity-0` · `group-data-[collapsible=icon]:overflow-hidden` · `group-data-[collapsible=icon]:p-0!` · `group-data-[collapsible=icon]:p-2!` · `group-data-[collapsible=icon]:size-8!` · `group-data-[collapsible=icon]:w-(--sidebar-width-icon)` · `group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+var(--space-scale-4))]` · `group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+var(--space-scale-4)+2px)]` · `group-data-[collapsible=offcanvas]:after:left-full` · `group-data-[collapsible=offcanvas]:translate-x-0` · `group-data-[collapsible=offcanvas]:w-0` · `hover:group-data-[collapsible=offcanvas]:bg-sidebar` · `md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2` | Sidebar reduced to icons, or moved off-screen, depending on `collapsible`                                                                                                                                                                                          |
| `disabled`  | `aria-disabled:opacity-disabled` · `aria-disabled:pointer-events-none` · `disabled:opacity-disabled` · `disabled:pointer-events-none`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Disabled items: `pointer-events-none`, `opacity-disabled`                                                                                                                                                                                                          |
| `mobile`    | —                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Sidebar rendered as an overlay `Sheet` on mobile viewports                                                                                                                                                                                                         |

Collected from `components/ui/sidebar.tsx` and the `lib/` constants it imports. **Classes**: each class whose variants name the state, as written (`dark:` included); a class that stacks two states is listed under both. `—`: no class of its own — `default` is what the other states change.

Composes `Button`, `Input`, `Separator`, `Sheet`, `Skeleton`, `Tooltip` — Button in SidebarTrigger: variant ghost, size icon-sm; their states are listed in their own specs.

<!-- End of the generated part. -->

## Accessibility

**Pattern**: Side navigation (a composition); a `Sheet` on mobile

**Role**: Menus are `ul` / `li` lists of buttons or links; on mobile, the bar opens in a `Sheet` (a modal dialog).

**Keyboard**:

| Key                | Action                        |
| ------------------ | ----------------------------- |
| `Ctrl+B` / `Cmd+B` | Opens / collapses the sidebar |
| `Tab`              | Moves through the menu items  |
| `Enter` / `Space`  | Activates the item            |

**Accessible name**: `SidebarTrigger` and `SidebarRail` are named by `toggleLabel`; on mobile, the Sheet is named by `mobileTitle` and described by `mobileDescription` (defaults in `UI_STRINGS.sidebar`). Wrap navigation menus in a named `nav`.

**Pitfalls**:

- `SidebarRail` is not focusable (`tabIndex={-1}`): it is a mouse shortcut; the trigger remains the keyboard path.
- Collapsed to icons, every button must keep a name (hidden text or a `tooltip`).
- The `Ctrl/Cmd+B` shortcut can clash with an editor's bold command: turn it off in that context.

## Code example

```tsx
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export default function Example() {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive>Dashboard</SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>Settings</SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <main className="flex-1 p-4">
        <SidebarTrigger />
        <p>Main content</p>
      </main>
    </SidebarProvider>
  )
}
```

## Cross-references

- `Sheet` — used internally for the mobile mode
- `Button` — the base of `SidebarTrigger`
- `Tooltip` — shown on `SidebarMenuButton`s in collapsed mode
- `Separator` — the base of `SidebarSeparator`
- `Skeleton` — the base of `SidebarMenuSkeleton`
- `Input` — the base of `SidebarInput`
- `Collapsible` — a similar pattern for collapsible sections
- `ScrollArea` — the alternative for scrolling the content
- `Direction` — provides the reading direction used for positioning
