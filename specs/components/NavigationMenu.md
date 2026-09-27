# NavigationMenu

## Metadata

| Champ         | Valeur                            |
| ------------- | --------------------------------- |
| Nom           | NavigationMenu                    |
| Catégorie     | Navigation                        |
| Statut        | stable                            |
| figma_node_id |                                   |
| code_path     | components/ui/navigation-menu.tsx |

## Rôle

Menu de navigation principal permettant d'organiser les liens du site en catégories avec des panneaux de contenu déroulants et des animations de transition.

## Usage

- Navigation principale d'un site ou d'une application (header)
- Regrouper les liens par catégorie avec des panneaux de contenu riche
- Proposer des mega-menus avec descriptions et icônes
- Navigation horizontale avec indicateur visuel de la section active
- Liens directs sans sous-menu via `NavigationMenuLink`

## Contraintes

- Ne pas utiliser pour des menus d'actions (commandes) — préférer `Menubar` ou `DropdownMenu`
- Limiter le nombre de triggers de premier niveau à 5-7 pour la lisibilité
- Le viewport peut être désactivé via `viewport={false}` pour un rendu inline
- Les liens doivent utiliser `NavigationMenuLink` pour bénéficier de la gestion `data-active`
- L'indicateur nécessite un positionnement relatif du parent pour fonctionner correctement

## Dépendances

- `NavigationMenu` (Root, List, Item, Trigger, Content, Link, Indicator, Viewport) de `radix-ui`
- `class-variance-authority` pour le style du trigger (`navigationMenuTriggerStyle`)
- `CaretDownIcon` de `@phosphor-icons/react`

## Anatomie

| Slot                                    | Rôle                                             |
| --------------------------------------- | ------------------------------------------------ |
| `data-slot="navigation-menu"`           | Racine du composant, porte `data-viewport`       |
| `data-slot="navigation-menu-list"`      | Liste de navigation flex horizontale             |
| `data-slot="navigation-menu-item"`      | Élément de navigation individuel                 |
| `data-slot="navigation-menu-trigger"`   | Bouton déclencheur du panneau de contenu         |
| `data-slot="navigation-menu-content"`   | Panneau de contenu animé avec liens              |
| `data-slot="navigation-menu-link"`      | Lien de navigation individuel                    |
| `data-slot="navigation-menu-viewport"`  | Zone de rendu partagée pour le contenu actif     |
| `data-slot="navigation-menu-indicator"` | Indicateur visuel (flèche) sous le trigger actif |

## Tokens utilisés

<!-- Généré par scripts/build-spec-tokens.ts depuis le code du composant — ne pas éditer à la main. -->

| Token                           | Classes et variables                             | Où                                                                                                                      |
| ------------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `color.background.elevated`     | `bg-popover`                                     | `NavigationMenuContent` · `NavigationMenuViewport`                                                                      |
| `color.background.subtle`       | `bg-muted` · `bg-muted/50`                       | `NavigationMenuLink` · `navigationMenuTriggerStyle`                                                                     |
| `color.border.default`          | `bg-border`                                      | `NavigationMenuIndicator`                                                                                               |
| `color.border.focus`            | `border-ring` · `ring-ring/50`                   | `NavigationMenuLink` via `FOCUS_RING` (`lib/focus.ts`) · `navigationMenuTriggerStyle` via `FOCUS_RING` (`lib/focus.ts`) |
| `color.text.default`            | `ring-foreground/10` · `text-popover-foreground` | `NavigationMenuContent` · `NavigationMenuViewport`                                                                      |
| `elevation.md`                  | `shadow-md`                                      | `NavigationMenuIndicator`                                                                                               |
| `elevation.sm`                  | `shadow-sm`                                      | `NavigationMenuContent` · `NavigationMenuViewport`                                                                      |
| `motion.duration.fast`          | `duration-fast`                                  | `NavigationMenuViewport`                                                                                                |
| `motion.duration.slow`          | `duration-slow`                                  | `NavigationMenuContent` · `NavigationMenuTrigger`                                                                       |
| `space.focus-ring-width`        | `ring-(length:--space-focus-ring-width)`         | `NavigationMenuLink` via `FOCUS_RING` (`lib/focus.ts`) · `navigationMenuTriggerStyle` via `FOCUS_RING` (`lib/focus.ts`) |
| `typography.font-weight.medium` | `font-medium`                                    | `navigationMenuTriggerStyle`                                                                                            |
| `typography.size.xs`            | `text-xs`                                        | `NavigationMenuLink` · `navigationMenuTriggerStyle`                                                                     |
| `zindex.popover`                | `z-popover`                                      | `NavigationMenuViewport`                                                                                                |

Relevé dans `components/ui/navigation-menu.tsx` et les constantes de `lib/` qu'il importe ; chaque classe est résolue par Tailwind jusqu'au token sémantique. **Où** : sous-composant, chemin de variante `cva` ou constante d'origine. Les classes qui ne lisent aucun token (espacement `p-2`, tailles, mise en page) n'y figurent pas.

## Props / API

| Prop            | Type                                                 | Défaut         | Description                                          |
| --------------- | ---------------------------------------------------- | -------------- | ---------------------------------------------------- |
| `viewport`      | `boolean`                                            | `true`         | Active/désactive le viewport partagé pour le contenu |
| `orientation`   | `"horizontal" \| "vertical"`                         | `"horizontal"` | Orientation du menu de navigation                    |
| `value`         | `string`                                             | —              | Item actif (contrôlé)                                |
| `defaultValue`  | `string`                                             | —              | Item actif par défaut                                |
| `onValueChange` | `(value: string) => void`                            | —              | Callback lors du changement d'item actif             |
| `className`     | `string`                                             | —              | Classes CSS additionnelles                           |
| `...props`      | `React.ComponentProps<NavigationMenuPrimitive.Root>` | —              | Props natives Radix NavigationMenu                   |

## Variantes

<!-- Généré par scripts/build-spec-variants.ts depuis mcp-server/context/component-variants.json — ne pas éditer à la main. -->

Aucun axe de variante : le composant n'appelle pas `cva()`. Son apparence se règle par ses props et, en dernier recours, par `className` avec des classes de tokens.

## États

| État     | Description                                                               |
| -------- | ------------------------------------------------------------------------- |
| default  | Triggers au repos, texte en couleur standard                              |
| hover    | Fond `bg-muted` sur le trigger et le lien survolés                        |
| focus    | Fond `bg-muted` + anneau `ring-1 ring-ring/50` + outline sur trigger/lien |
| active   | Fond `bg-muted/50` sur le trigger/lien actif, panneau de contenu ouvert   |
| disabled | `pointer-events-none`, `opacity-50` — interaction impossible              |

## Accessibilité

**Pattern** : Navigation de site (Radix NavigationMenu)

**Rôle** : `nav` (nommée « Main » par Radix) ; déclencheurs `button` avec `aria-expanded` ; liens natifs.

**Clavier** :

| Touche                     | Action                                           |
| -------------------------- | ------------------------------------------------ |
| `Tab` / `Shift+Tab`        | Déclencheur ou lien suivant / précédent          |
| `Enter` / `Space`          | Ouvre le contenu du déclencheur                  |
| `ArrowDown`                | Entre dans le contenu ouvert                     |
| `ArrowLeft` / `ArrowRight` | Déclencheur précédent / suivant                  |
| `Escape`                   | Ferme le contenu et rend le focus au déclencheur |

**Nom accessible** : Radix nomme le repère « Main », en anglais : si la page a plusieurs `nav`, leur donner des `aria-label` distincts et localisés.

**Vigilance** :

- Le lien de la page courante porte `aria-current="page"` (prop `active` de `NavigationMenuLink`).

## Exemple de code

```tsx
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu"

export default function Example() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Produits</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink href="/produits/catalogue">
              Catalogue
            </NavigationMenuLink>
            <NavigationMenuLink href="/produits/nouveautes">
              Nouveautés
            </NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="/a-propos">À propos</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}
```

## Références croisées

- `Menubar` — barre de menus d'actions (commandes, raccourcis)
- `Breadcrumb` — fil d'Ariane pour la navigation contextuelle
- `Tabs` — navigation par onglets pour du contenu mutuellement exclusif
