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

- `Sidebar` doit être enfant d'un `SidebarProvider` — sinon `useSidebar` lèvera une erreur
- Ne pas utiliser plus d'une `Sidebar` par côté (left/right) dans un même `SidebarProvider`
- Les variantes `floating` et `inset` ajoutent des padding et ombres qui peuvent entrer en conflit avec des layouts imbriqués
- Les boutons icône-seuls en mode collapsed nécessitent un `tooltip` pour l'accessibilité
- Le raccourci clavier `Ctrl+B` / `⌘+B` est automatiquement enregistré — éviter les conflits avec d'autres raccourcis
- Libellé de `SidebarTrigger` et `SidebarRail` en anglais issu de `UI_STRINGS.sidebar`

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

| Token                            | Usage                                                    |
| -------------------------------- | -------------------------------------------------------- |
| `--space-layout-sidebar`         | Largeur de la sidebar desktop                            |
| `--space-layout-sidebar-mobile`  | Largeur de la sidebar mobile                             |
| `--space-layout-sidebar-icon`    | Largeur de la sidebar en mode icon-only                  |
| `bg-sidebar`                     | Fond de la sidebar                                       |
| `text-sidebar-foreground`        | Couleur du texte principal                               |
| `bg-sidebar-accent`              | Fond des éléments au hover/active                        |
| `text-sidebar-accent-foreground` | Texte des éléments au hover/active                       |
| `ring-sidebar-ring`              | Anneau de focus des éléments interactifs                 |
| `border-sidebar-border`          | Bordure de la sidebar et des sous-menus                  |
| `bg-background`                  | Fond de l'input et de la variante outline du menu button |
| `duration-normal`                | Durée des transitions de largeur et d'opacité            |

## Props / API

### SidebarProvider

| Prop           | Type                      | Défaut | Description                             |
| -------------- | ------------------------- | ------ | --------------------------------------- |
| `defaultOpen`  | `boolean`                 | `true` | État initial d'ouverture (non contrôlé) |
| `open`         | `boolean`                 | —      | État contrôlé d'ouverture               |
| `onOpenChange` | `(open: boolean) => void` | —      | Callback de changement d'état           |
| `className`    | `string`                  | —      | Classes CSS additionnelles              |
| `style`        | `React.CSSProperties`     | —      | Styles inline additionnels              |

### Sidebar

| Prop          | Type                                 | Défaut        | Description                         |
| ------------- | ------------------------------------ | ------------- | ----------------------------------- |
| `side`        | `"left" \| "right"`                  | `"left"`      | Côté d'affichage                    |
| `variant`     | `"sidebar" \| "floating" \| "inset"` | `"sidebar"`   | Style visuel de la sidebar          |
| `collapsible` | `"offcanvas" \| "icon" \| "none"`    | `"offcanvas"` | Comportement de repli               |
| `dir`         | `"ltr" \| "rtl"`                     | —             | Direction de lecture (mobile Sheet) |
| `className`   | `string`                             | —             | Classes CSS additionnelles          |

### SidebarMenuButton

| Prop       | Type                            | Défaut      | Description                                 |
| ---------- | ------------------------------- | ----------- | ------------------------------------------- |
| `variant`  | `"default" \| "outline"`        | `"default"` | Variante visuelle                           |
| `size`     | `"default" \| "sm" \| "lg"`     | `"default"` | Taille du bouton                            |
| `asChild`  | `boolean`                       | `false`     | Délègue le rendu au premier enfant via Slot |
| `isActive` | `boolean`                       | `false`     | Marque l'élément comme actif                |
| `tooltip`  | `string \| TooltipContentProps` | —           | Tooltip affiché en mode collapsed           |

### SidebarMenuSubButton

| Prop       | Type           | Défaut  | Description                                 |
| ---------- | -------------- | ------- | ------------------------------------------- |
| `asChild`  | `boolean`      | `false` | Délègue le rendu au premier enfant via Slot |
| `size`     | `"sm" \| "md"` | `"md"`  | Taille du bouton de sous-menu               |
| `isActive` | `boolean`      | `false` | Marque l'élément comme actif                |

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
| disabled  | Éléments désactivés : `pointer-events-none`, `opacity-50`                   |
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
