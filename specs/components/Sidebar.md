# Sidebar

## Metadata

| Champ         | Valeur                    |
| ------------- | ------------------------- |
| Nom           | Sidebar                   |
| Catégorie     | Layout                    |
| Statut        | stable                    |
| figma_node_id |                           |
| code_path     | components/ui/sidebar.tsx |

## Rôle

Panneau de navigation latéral complet avec support responsive (Sheet mobile), état collapsible, raccourci clavier et persistance d'état via cookie.

## Usage

- Navigation principale d'une application (menu latéral gauche ou droit)
- Organisation hiérarchique des liens avec groupes, sous-menus et badges
- Mode icon-only (collapsed) pour maximiser l'espace de contenu
- Navigation mobile via Sheet avec ouverture/fermeture en swipe
- Layout de type dashboard avec header, content, footer dans la sidebar

## Contraintes

- **MUST** — placer `Sidebar` dans un `SidebarProvider`, sans quoi `useSidebar` lève une erreur
- **MUST NOT** — placer plus d'une `Sidebar` par côté dans un même `SidebarProvider`
- **MUST** — vérifier qu'une mise en page imbriquée tolère les marges et ombres des variantes `floating` et `inset`
- **MUST** — donner un `tooltip` à chaque `SidebarMenuButton` réduit à son icône
- **MUST NOT** — lier `Ctrl+B` / `⌘+B` à une autre action : `SidebarProvider` l'enregistre pour replier la barre
- **MUST** — dans une interface qui n'est pas en anglais, traduire le libellé de `SidebarTrigger` et `SidebarRail` (`UI_STRINGS.sidebar`)

## Dépendances

- `Slot.Root` de `radix-ui` (pour `asChild`)
- `class-variance-authority` (variantes de `SidebarMenuButton`)
- `@/hooks/use-mobile` (hook `useIsMobile`)
- `@/lib/utils` (utilitaire `cn`)
- `@/components/ui/button` (composant `Button`)
- `@/components/ui/input` (composant `Input`)
- `@/components/ui/separator` (composant `Separator`)
- `@/components/ui/sheet` (composants `Sheet`, `SheetContent`, `SheetHeader`, `SheetTitle`, `SheetDescription`)
- `@/components/ui/skeleton` (composant `Skeleton`)
- `@/components/ui/tooltip` (composants `Tooltip`, `TooltipContent`, `TooltipTrigger`)
- `@phosphor-icons/react` (icône `SidebarIcon`)

## Anatomie

| Slot                                  | Rôle                                                                       |
| ------------------------------------- | -------------------------------------------------------------------------- |
| `data-slot="sidebar-wrapper"`         | Conteneur racine du provider, porte les variables CSS                      |
| `data-slot="sidebar"`                 | Panneau principal de la sidebar                                            |
| `data-slot="sidebar-gap"`             | Espace réservé pour la sidebar sur desktop (gère la transition de largeur) |
| `data-slot="sidebar-container"`       | Conteneur fixe positionné (fixed inset-y-0)                                |
| `data-slot="sidebar-inner"`           | Wrapper interne avec le fond et les styles de variante                     |
| `data-slot="sidebar-trigger"`         | Bouton de bascule ouvert/fermé                                             |
| `data-slot="sidebar-rail"`            | Rail cliquable fin sur le bord pour basculer la sidebar                    |
| `data-slot="sidebar-inset"`           | Zone de contenu principale (`<main>`) adjacente à la sidebar               |
| `data-slot="sidebar-input"`           | Champ de recherche dans la sidebar                                         |
| `data-slot="sidebar-header"`          | En-tête de la sidebar                                                      |
| `data-slot="sidebar-footer"`          | Pied de la sidebar                                                         |
| `data-slot="sidebar-separator"`       | Séparateur horizontal                                                      |
| `data-slot="sidebar-content"`         | Zone de contenu scrollable principale                                      |
| `data-slot="sidebar-group"`           | Groupe de navigation                                                       |
| `data-slot="sidebar-group-label"`     | Label de groupe                                                            |
| `data-slot="sidebar-group-action"`    | Action contextuelle d'un groupe                                            |
| `data-slot="sidebar-group-content"`   | Contenu d'un groupe                                                        |
| `data-slot="sidebar-menu"`            | Liste de menu (`<ul>`)                                                     |
| `data-slot="sidebar-menu-item"`       | Élément de menu (`<li>`)                                                   |
| `data-slot="sidebar-menu-button"`     | Bouton de menu interactif                                                  |
| `data-slot="sidebar-menu-action"`     | Action contextuelle d'un élément de menu                                   |
| `data-slot="sidebar-menu-badge"`      | Badge de notification sur un élément                                       |
| `data-slot="sidebar-menu-skeleton"`   | Squelette de chargement d'un élément                                       |
| `data-slot="sidebar-menu-sub"`        | Sous-menu (`<ul>` imbriqué)                                                |
| `data-slot="sidebar-menu-sub-item"`   | Élément de sous-menu                                                       |
| `data-slot="sidebar-menu-sub-button"` | Bouton de sous-menu                                                        |

## Tokens utilisés

<!-- Généré par scripts/build-spec-tokens.ts depuis le code du composant — ne pas éditer à la main. -->

| Token                             | Classes et variables                                                  | Où                                                                                                                                                                                                                                                                                                                              |
| --------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `border-width.default`            | `border-l` · `border-r`                                               | `SidebarMenuSub` · `Sidebar`                                                                                                                                                                                                                                                                                                    |
| `color.background.default`        | `bg-background`                                                       | `SidebarInput` · `SidebarInset` · `sidebarMenuButtonVariants.variant.outline`                                                                                                                                                                                                                                                   |
| `color.sidebar.accent.default`    | `bg-sidebar-accent` · `ring-sidebar-accent`                           | `SidebarGroupAction` · `SidebarMenuAction` · `SidebarMenuSubButton` · `sidebarMenuButtonVariants.variant.default` · `sidebarMenuButtonVariants.variant.outline` · `sidebarMenuButtonVariants`                                                                                                                                   |
| `color.sidebar.accent.foreground` | `text-sidebar-accent-foreground`                                      | `SidebarGroupAction` · `SidebarMenuAction` · `SidebarMenuBadge` · `SidebarMenuSubButton` · `sidebarMenuButtonVariants.variant.default` · `sidebarMenuButtonVariants.variant.outline` · `sidebarMenuButtonVariants`                                                                                                              |
| `color.sidebar.background`        | `bg-sidebar`                                                          | `SidebarProvider` · `SidebarRail` · `Sidebar`                                                                                                                                                                                                                                                                                   |
| `color.sidebar.border`            | `bg-sidebar-border` · `border-sidebar-border` · `ring-sidebar-border` | `SidebarMenuSub` · `SidebarRail` · `SidebarSeparator` · `Sidebar` · `sidebarMenuButtonVariants.variant.outline`                                                                                                                                                                                                                 |
| `color.sidebar.foreground`        | `text-sidebar-foreground` · `text-sidebar-foreground/70`              | `SidebarGroupAction` · `SidebarGroupLabel` · `SidebarMenuAction` · `SidebarMenuBadge` · `SidebarMenuSubButton` · `Sidebar`                                                                                                                                                                                                      |
| `color.sidebar.ring`              | `ring-sidebar-ring`                                                   | `SidebarGroupAction` · `SidebarGroupLabel` · `SidebarMenuAction` · `SidebarMenuSubButton` · `sidebarMenuButtonVariants`                                                                                                                                                                                                         |
| `elevation.sm`                    | `shadow-sm`                                                           | `SidebarInset` · `Sidebar`                                                                                                                                                                                                                                                                                                      |
| `motion.duration.normal`          | `duration-normal`                                                     | `SidebarGroupLabel` · `Sidebar`                                                                                                                                                                                                                                                                                                 |
| `opacity.disabled`                | `opacity-disabled`                                                    | `SidebarMenuSubButton` · `sidebarMenuButtonVariants`                                                                                                                                                                                                                                                                            |
| `space.focus-ring-width`          | `ring-(length:--space-focus-ring-width)`                              | `SidebarGroupAction` via `FOCUS_RING_WIDTH` (`lib/focus.ts`) · `SidebarGroupLabel` via `FOCUS_RING_WIDTH` (`lib/focus.ts`) · `SidebarMenuAction` via `FOCUS_RING_WIDTH` (`lib/focus.ts`) · `SidebarMenuSubButton` via `FOCUS_RING_WIDTH` (`lib/focus.ts`) · `sidebarMenuButtonVariants` via `FOCUS_RING_WIDTH` (`lib/focus.ts`) |
| `space.layout.sidebar`            | `var(--space-layout-sidebar)`                                         | `SIDEBAR_WIDTH`                                                                                                                                                                                                                                                                                                                 |
| `space.layout.sidebar-icon`       | `var(--space-layout-sidebar-icon)`                                    | `SIDEBAR_WIDTH_ICON`                                                                                                                                                                                                                                                                                                            |
| `space.layout.sidebar-mobile`     | `var(--space-layout-sidebar-mobile)`                                  | `SIDEBAR_WIDTH_MOBILE`                                                                                                                                                                                                                                                                                                          |
| `typography.font-weight.medium`   | `font-medium`                                                         | `SidebarMenuBadge` · `sidebarMenuButtonVariants`                                                                                                                                                                                                                                                                                |
| `typography.size.xs`              | `text-xs`                                                             | `SidebarGroupContent` · `SidebarGroupLabel` · `SidebarMenuBadge` · `SidebarMenuSubButton` · `sidebarMenuButtonVariants.size.default` · `sidebarMenuButtonVariants.size.lg` · `sidebarMenuButtonVariants.size.sm` · `sidebarMenuButtonVariants`                                                                                  |
| `zindex.fixed`                    | `z-fixed`                                                             | `Sidebar`                                                                                                                                                                                                                                                                                                                       |
| `zindex.sticky`                   | `z-sticky`                                                            | `SidebarRail`                                                                                                                                                                                                                                                                                                                   |

Relevé dans `components/ui/sidebar.tsx` et les constantes de `lib/` qu'il importe ; chaque classe est résolue par Tailwind jusqu'au token sémantique. **Où** : sous-composant, chemin de variante `cva` ou constante d'origine. Les classes qui ne lisent aucun token (espacement `p-2`, tailles, mise en page) n'y figurent pas.

Compose `Button`, `Input`, `Separator`, `Sheet`, `Skeleton`, `Tooltip` : les tokens de ces composants sont listés dans leurs specs.

## Props / API

<!-- Généré par scripts/build-spec-api.ts depuis les exports TypeScript. Seules les descriptions s'éditent à la main : elles sont conservées. -->

### `Sidebar`

Rend `<div>`.

| Prop          | Type                                 | Défaut        | Description                         |
| ------------- | ------------------------------------ | ------------- | ----------------------------------- |
| `side`        | `"left" \| "right"`                  | `"left"`      | Côté d'affichage                    |
| `variant`     | `"sidebar" \| "floating" \| "inset"` | `"sidebar"`   | Style visuel de la sidebar          |
| `collapsible` | `"offcanvas" \| "icon" \| "none"`    | `"offcanvas"` | Comportement de repli               |
| `dir`         | `string`                             | —             | Direction de lecture (mobile Sheet) |
| `className`   | `string`                             | —             | Classes CSS additionnelles          |
| `...props`    | `React.ComponentProps<"div">`        | —             | Props natives de `<div>`            |

### `SidebarContent`

Rend `<div>`.

| Prop       | Type                          | Défaut | Description              |
| ---------- | ----------------------------- | ------ | ------------------------ |
| `...props` | `React.ComponentProps<"div">` | —      | Props natives de `<div>` |

### `SidebarFooter`

Rend `<div>`.

| Prop       | Type                          | Défaut | Description              |
| ---------- | ----------------------------- | ------ | ------------------------ |
| `...props` | `React.ComponentProps<"div">` | —      | Props natives de `<div>` |

### `SidebarGroup`

Rend `<div>`.

| Prop       | Type                          | Défaut | Description              |
| ---------- | ----------------------------- | ------ | ------------------------ |
| `...props` | `React.ComponentProps<"div">` | —      | Props natives de `<div>` |

### `SidebarGroupAction`

Rend `<button>`, ou son enfant avec `asChild`.

| Prop       | Type                             | Défaut  | Description                                                                            |
| ---------- | -------------------------------- | ------- | -------------------------------------------------------------------------------------- |
| `asChild`  | `boolean`                        | `false` | Délègue le rendu au premier enfant, qui reçoit les props et les classes (Radix `Slot`) |
| `...props` | `React.ComponentProps<"button">` | —       | Props natives de `<button>`                                                            |

### `SidebarGroupContent`

Rend `<div>`.

| Prop       | Type                          | Défaut | Description              |
| ---------- | ----------------------------- | ------ | ------------------------ |
| `...props` | `React.ComponentProps<"div">` | —      | Props natives de `<div>` |

### `SidebarGroupLabel`

Rend `<div>`, ou son enfant avec `asChild`.

| Prop       | Type                          | Défaut  | Description                                                                            |
| ---------- | ----------------------------- | ------- | -------------------------------------------------------------------------------------- |
| `asChild`  | `boolean`                     | `false` | Délègue le rendu au premier enfant, qui reçoit les props et les classes (Radix `Slot`) |
| `...props` | `React.ComponentProps<"div">` | —       | Props natives de `<div>`                                                               |

### `SidebarHeader`

Rend `<div>`.

| Prop       | Type                          | Défaut | Description              |
| ---------- | ----------------------------- | ------ | ------------------------ |
| `...props` | `React.ComponentProps<"div">` | —      | Props natives de `<div>` |

### `SidebarInput`

Rend `Input`.

| Prop       | Type                                 | Défaut | Description      |
| ---------- | ------------------------------------ | ------ | ---------------- |
| `...props` | `React.ComponentProps<typeof Input>` | —      | Props de `Input` |

### `SidebarInset`

Rend `<main>`.

| Prop       | Type                           | Défaut | Description               |
| ---------- | ------------------------------ | ------ | ------------------------- |
| `...props` | `React.ComponentProps<"main">` | —      | Props natives de `<main>` |

### `SidebarMenu`

Rend `<ul>`.

| Prop       | Type                         | Défaut | Description             |
| ---------- | ---------------------------- | ------ | ----------------------- |
| `...props` | `React.ComponentProps<"ul">` | —      | Props natives de `<ul>` |

### `SidebarMenuAction`

Rend `<button>`, ou son enfant avec `asChild`.

| Prop          | Type                             | Défaut  | Description                                                                                                       |
| ------------- | -------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------- |
| `asChild`     | `boolean`                        | `false` | Délègue le rendu au premier enfant, qui reçoit les props et les classes (Radix `Slot`)                            |
| `showOnHover` | `boolean`                        | `false` | Masque l'action sur desktop (`md` et plus) jusqu'au survol ou au focus de l'item, ou tant que son menu est ouvert |
| `...props`    | `React.ComponentProps<"button">` | —       | Props natives de `<button>`                                                                                       |

### `SidebarMenuBadge`

Rend `<div>`.

| Prop       | Type                          | Défaut | Description              |
| ---------- | ----------------------------- | ------ | ------------------------ |
| `...props` | `React.ComponentProps<"div">` | —      | Props natives de `<div>` |

### `SidebarMenuButton`

Rend `<button>`, ou son enfant avec `asChild`.

| Prop       | Type                                                    | Défaut      | Description                                 |
| ---------- | ------------------------------------------------------- | ----------- | ------------------------------------------- |
| `asChild`  | `boolean`                                               | `false`     | Délègue le rendu au premier enfant via Slot |
| `isActive` | `boolean`                                               | `false`     | Marque l'élément comme actif                |
| `tooltip`  | `string \| React.ComponentProps<typeof TooltipContent>` | —           | Tooltip affiché en mode collapsed           |
| `variant`  | `"default" \| "outline"`                                | `"default"` | Variante visuelle                           |
| `size`     | `"default" \| "sm" \| "lg"`                             | `"default"` | Taille du bouton                            |
| `...props` | `React.ComponentProps<"button">`                        | —           | Props natives de `<button>`                 |

### `SidebarMenuItem`

Rend `<li>`.

| Prop       | Type                         | Défaut | Description             |
| ---------- | ---------------------------- | ------ | ----------------------- |
| `...props` | `React.ComponentProps<"li">` | —      | Props natives de `<li>` |

### `SidebarMenuSkeleton`

Rend `<div>`.

| Prop       | Type                          | Défaut  | Description                                                  |
| ---------- | ----------------------------- | ------- | ------------------------------------------------------------ |
| `showIcon` | `boolean`                     | `false` | Ajoute un carré d'icône avant la barre de texte du squelette |
| `...props` | `React.ComponentProps<"div">` | —       | Props natives de `<div>`                                     |

### `SidebarMenuSub`

Rend `<ul>`.

| Prop       | Type                         | Défaut | Description             |
| ---------- | ---------------------------- | ------ | ----------------------- |
| `...props` | `React.ComponentProps<"ul">` | —      | Props natives de `<ul>` |

### `SidebarMenuSubButton`

Rend `<a>`, ou son enfant avec `asChild`.

| Prop       | Type                        | Défaut      | Description                                 |
| ---------- | --------------------------- | ----------- | ------------------------------------------- |
| `asChild`  | `boolean`                   | `false`     | Délègue le rendu au premier enfant via Slot |
| `size`     | `"sm" \| "default"`         | `"default"` | Taille du bouton de sous-menu               |
| `isActive` | `boolean`                   | `false`     | Marque l'élément comme actif                |
| `...props` | `React.ComponentProps<"a">` | —           | Props natives de `<a>`                      |

### `SidebarMenuSubItem`

Rend `<li>`.

| Prop       | Type                         | Défaut | Description             |
| ---------- | ---------------------------- | ------ | ----------------------- |
| `...props` | `React.ComponentProps<"li">` | —      | Props natives de `<li>` |

### `SidebarProvider`

Rend `<div>`.

| Prop           | Type                          | Défaut | Description                             |
| -------------- | ----------------------------- | ------ | --------------------------------------- |
| `defaultOpen`  | `boolean`                     | `true` | État initial d'ouverture (non contrôlé) |
| `open`         | `boolean`                     | —      | État contrôlé d'ouverture               |
| `onOpenChange` | `(open: boolean) => void`     | —      | Callback de changement d'état           |
| `className`    | `string`                      | —      | Classes CSS additionnelles              |
| `style`        | `React.CSSProperties`         | —      | Styles inline additionnels              |
| `...props`     | `React.ComponentProps<"div">` | —      | Props natives de `<div>`                |

### `SidebarRail`

Rend `<button>`.

| Prop       | Type                             | Défaut | Description                 |
| ---------- | -------------------------------- | ------ | --------------------------- |
| `...props` | `React.ComponentProps<"button">` | —      | Props natives de `<button>` |

### `SidebarSeparator`

Rend `Separator`.

| Prop       | Type                                     | Défaut | Description          |
| ---------- | ---------------------------------------- | ------ | -------------------- |
| `...props` | `React.ComponentProps<typeof Separator>` | —      | Props de `Separator` |

### `SidebarTrigger`

Rend `Button`.

| Prop       | Type                                  | Défaut | Description       |
| ---------- | ------------------------------------- | ------ | ----------------- |
| `...props` | `React.ComponentProps<typeof Button>` | —      | Props de `Button` |

### `useSidebar()`

Retourne `SidebarContextProps`.

<!-- Fin de la partie générée. -->

### Hook exporté

| Hook         | Retour                | Description                                                                                     |
| ------------ | --------------------- | ----------------------------------------------------------------------------------------------- |
| `useSidebar` | `SidebarContextProps` | Accède à `state`, `open`, `setOpen`, `openMobile`, `setOpenMobile`, `isMobile`, `toggleSidebar` |

## Variantes

<!-- Généré par scripts/build-spec-variants.ts depuis mcp-server/context/component-variants.json — ne pas éditer à la main. -->

| Composant           | Axe       | Valeurs                 | Défaut    |
| ------------------- | --------- | ----------------------- | --------- |
| `SidebarMenuButton` | `variant` | `default` · `outline`   | `default` |
| `SidebarMenuButton` | `size`    | `default` · `sm` · `lg` | `default` |

Le sens de chaque axe (apparence, intention, taille…) est donné dans **Props / API**.

## États

| État      | Description                                                                 |
| --------- | --------------------------------------------------------------------------- |
| default   | Sidebar ouverte (`data-state="expanded"`), largeur complète                 |
| hover     | Éléments de menu changent de fond (`bg-sidebar-accent`)                     |
| focus     | Anneau `ring-2 ring-sidebar-ring` sur les éléments interactifs              |
| active    | Élément de menu marqué actif (`data-active`), fond accentué et texte medium |
| disabled  | Éléments désactivés : `pointer-events-none`, `opacity-disabled`             |
| collapsed | Sidebar réduite en mode icon-only ou hors écran selon `collapsible`         |
| mobile    | Sidebar rendue en `Sheet` overlay sur les viewports mobiles                 |

## Accessibilité

**Pattern** : Navigation latérale (composition) ; `Sheet` sur mobile

**Rôle** : Menus en `ul` / `li` de boutons ou de liens ; sur mobile, la barre s'ouvre dans un `Sheet` (dialogue modal).

**Clavier** :

| Touche             | Action                           |
| ------------------ | -------------------------------- |
| `Ctrl+B` / `Cmd+B` | Ouvre / replie la barre latérale |
| `Tab`              | Parcourt les éléments du menu    |
| `Enter` / `Space`  | Active l'élément                 |

**Nom accessible** : `SidebarTrigger` est nommé par `UI_STRINGS.sidebar.toggle`. Envelopper les menus de navigation dans une `nav` nommée.

**Vigilance** :

- `SidebarRail` n'est pas focalisable (`tabIndex={-1}`) : c'est un raccourci souris, le déclencheur reste la voie clavier.
- Repliée en icônes, chaque bouton doit garder un nom (texte masqué ou `tooltip`).
- Le raccourci `Ctrl/Cmd+B` peut entrer en conflit avec la mise en gras d'un éditeur : le désactiver dans ce contexte.

## Exemple de code

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
                <SidebarMenuButton isActive>Tableau de bord</SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>Paramètres</SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <main className="flex-1 p-4">
        <SidebarTrigger />
        <p>Contenu principal</p>
      </main>
    </SidebarProvider>
  )
}
```

## Références croisées

- `Sheet` — utilisé en interne pour le mode mobile
- `Button` — base du `SidebarTrigger`
- `Tooltip` — affiché en mode collapsed sur les `SidebarMenuButton`
- `Separator` — base du `SidebarSeparator`
- `Skeleton` — base du `SidebarMenuSkeleton`
- `Input` — base du `SidebarInput`
- `Collapsible` — pattern similaire pour les sections repliables
- `ScrollArea` — alternative pour le défilement du contenu
- `Direction` — fournit la direction de lecture pour le positionnement
