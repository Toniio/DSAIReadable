# Sheet

## Metadata

| Champ         | Valeur                  |
| ------------- | ----------------------- |
| Nom           | Sheet                   |
| Catégorie     | Overlay                 |
| Statut        | stable                  |
| figma_node_id |                         |
| code_path     | components/ui/sheet.tsx |

## Rôle

Panneau latéral glissant (ou depuis le haut/bas) superposé à l'interface, basé sur Radix Dialog, pour afficher du contenu étendu sans quitter la page.

## Usage

- Afficher un formulaire d'édition détaillé dans un panneau latéral
- Proposer un panier, un historique ou une liste de notifications
- Afficher une navigation secondaire ou des filtres avancés
- Présenter des détails d'un élément sélectionné dans un tableau
- Remplacer une page dédiée pour des flux courts (création rapide)

## Contraintes

- Ne pas utiliser pour des confirmations courtes — préférer `AlertDialog` ou `Dialog`
- Limiter à 1 Sheet visible par vue (éviter l'empilement)
- `SheetTitle` est requis pour l'accessibilité (lecteurs d'écran)
- La largeur est limitée à `sm:max-w-sm` pour les côtés gauche/droite
- Le bouton de fermeture peut être masqué via `showCloseButton={false}` mais un moyen de fermer doit rester disponible
- Sur mobile, considérer `Drawer` (avec geste swipe) comme alternative
- Chaînes par défaut en anglais issues de `UI_STRINGS.sheet` — surcharger via `closeLabel`

## Dépendances

- `Dialog` de `radix-ui` (utilisé comme `SheetPrimitive` — primitives Root, Trigger, Portal, Overlay, Content, Close, Title, Description)
- `Button` de `@/components/ui/button` (bouton de fermeture)
- `@phosphor-icons/react` — icône `XIcon` pour le bouton de fermeture

## Anatomie

| Slot                            | Rôle                                                    |
| ------------------------------- | ------------------------------------------------------- |
| `data-slot="sheet"`             | Racine du composant                                     |
| `data-slot="sheet-trigger"`     | Élément déclencheur d'ouverture                         |
| `data-slot="sheet-portal"`      | Portail de rendu                                        |
| `data-slot="sheet-overlay"`     | Fond semi-transparent avec backdrop-blur                |
| `data-slot="sheet-content"`     | Conteneur principal, ancré à un bord, porte `data-side` |
| `data-slot="sheet-close"`       | Bouton de fermeture (icône ×)                           |
| `data-slot="sheet-header"`      | Zone d'en-tête (titre + description)                    |
| `data-slot="sheet-footer"`      | Zone de pied (boutons d'action)                         |
| `data-slot="sheet-title"`       | Titre du panneau                                        |
| `data-slot="sheet-description"` | Description textuelle                                   |

## Tokens utilisés

<!-- Généré par scripts/build-spec-tokens.ts depuis le code du composant — ne pas éditer à la main. -->

| Token                            | Classes et variables                              | Où                                                                                                                     |
| -------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `border-width.default`           | `border-b` · `border-l` · `border-r` · `border-t` | `SheetContent`                                                                                                         |
| `color.background.elevated`      | `bg-popover`                                      | `SheetContent` via `SIDE_PANEL_CONTENT_BASE` (`lib/overlay.ts`)                                                        |
| `color.static.black`             | `bg-black/10`                                     | `SheetOverlay` via `OVERLAY_BASE` (`lib/overlay.ts`)                                                                   |
| `color.text.default`             | `text-foreground` · `text-popover-foreground`     | `SheetContent` via `SIDE_PANEL_CONTENT_BASE` (`lib/overlay.ts`) · `SheetTitle`                                         |
| `color.text.subtle`              | `text-muted-foreground`                           | `SheetDescription`                                                                                                     |
| `elevation.lg`                   | `shadow-lg`                                       | `SheetContent`                                                                                                         |
| `motion.duration.fast`           | `duration-fast`                                   | `SheetOverlay`                                                                                                         |
| `motion.duration.normal`         | `duration-normal`                                 | `SheetContent`                                                                                                         |
| `typography.font-weight.medium`  | `font-medium`                                     | `SheetTitle`                                                                                                           |
| `typography.line-height.relaxed` | `text-xs/relaxed`                                 | `SheetContent` via `SIDE_PANEL_CONTENT_BASE` (`lib/overlay.ts`) · `SheetDescription` · `SheetOverlay`                  |
| `typography.size.sm`             | `text-sm`                                         | `SheetTitle`                                                                                                           |
| `typography.size.xs`             | `text-xs/relaxed`                                 | `SheetContent` via `SIDE_PANEL_CONTENT_BASE` (`lib/overlay.ts`) · `SheetDescription` · `SheetOverlay`                  |
| `zindex.modal`                   | `z-modal`                                         | `SheetContent` via `SIDE_PANEL_CONTENT_BASE` (`lib/overlay.ts`) · `SheetOverlay` via `OVERLAY_BASE` (`lib/overlay.ts`) |

Relevé dans `components/ui/sheet.tsx` et les constantes de `lib/` qu'il importe ; chaque classe est résolue par Tailwind jusqu'au token sémantique. **Où** : sous-composant, chemin de variante `cva` ou constante d'origine. Les classes qui ne lisent aucun token (espacement `p-2`, tailles, mise en page) n'y figurent pas.

Compose `Button` : les tokens de ce composant sont listés dans sa spec.

## Props / API

<!-- Généré par scripts/build-spec-api.ts depuis les exports TypeScript. Seules les descriptions s'éditent à la main : elles sont conservées. -->

### `Sheet`

Rend `SheetPrimitive.Root`.

| Prop           | Type                                               | Défaut      | Description                                  |
| -------------- | -------------------------------------------------- | ----------- | -------------------------------------------- |
| `open`         | `boolean`                                          | `undefined` | Contrôle l'état ouvert/fermé (mode contrôlé) |
| `onOpenChange` | `(open: boolean) => void`                          | —           | Callback lors du changement d'état           |
| `...props`     | `React.ComponentProps<typeof SheetPrimitive.Root>` | —           | Props de `SheetPrimitive.Root`               |

### `SheetTrigger`

Rend `SheetPrimitive.Trigger`.

| Prop       | Type                                                  | Défaut | Description                       |
| ---------- | ----------------------------------------------------- | ------ | --------------------------------- |
| `...props` | `React.ComponentProps<typeof SheetPrimitive.Trigger>` | —      | Props de `SheetPrimitive.Trigger` |

### `SheetClose`

Rend `SheetPrimitive.Close`.

| Prop       | Type                                                | Défaut | Description                     |
| ---------- | --------------------------------------------------- | ------ | ------------------------------- |
| `...props` | `React.ComponentProps<typeof SheetPrimitive.Close>` | —      | Props de `SheetPrimitive.Close` |

### `SheetContent`

Rend `SheetPrimitive.Content`.

| Prop              | Type                                                  | Défaut                   | Description                                                                |
| ----------------- | ----------------------------------------------------- | ------------------------ | -------------------------------------------------------------------------- |
| `side`            | `"top" \| "right" \| "bottom" \| "left"`              | `"right"`                | Côté d'apparition du panneau (sur `SheetContent`)                          |
| `showCloseButton` | `boolean`                                             | `true`                   | Affiche le bouton × en haut à droite (sur `SheetContent`)                  |
| `closeLabel`      | `string`                                              | `UI_STRINGS.sheet.close` | Nom accessible du bouton de fermeture ; remplace la valeur de `UI_STRINGS` |
| `...props`        | `React.ComponentProps<typeof SheetPrimitive.Content>` | —                        | Props de `SheetPrimitive.Content`                                          |

### `SheetHeader`

Rend `<div>`.

| Prop       | Type                          | Défaut | Description              |
| ---------- | ----------------------------- | ------ | ------------------------ |
| `...props` | `React.ComponentProps<"div">` | —      | Props natives de `<div>` |

### `SheetFooter`

Rend `<div>`.

| Prop       | Type                          | Défaut | Description              |
| ---------- | ----------------------------- | ------ | ------------------------ |
| `...props` | `React.ComponentProps<"div">` | —      | Props natives de `<div>` |

### `SheetTitle`

Rend `SheetPrimitive.Title`.

| Prop       | Type                                                | Défaut | Description                     |
| ---------- | --------------------------------------------------- | ------ | ------------------------------- |
| `...props` | `React.ComponentProps<typeof SheetPrimitive.Title>` | —      | Props de `SheetPrimitive.Title` |

### `SheetDescription`

Rend `SheetPrimitive.Description`.

| Prop       | Type                                                      | Défaut | Description                           |
| ---------- | --------------------------------------------------------- | ------ | ------------------------------------- |
| `...props` | `React.ComponentProps<typeof SheetPrimitive.Description>` | —      | Props de `SheetPrimitive.Description` |

<!-- Fin de la partie générée. -->

## Variantes

<!-- Généré par scripts/build-spec-variants.ts depuis mcp-server/context/component-variants.json — ne pas éditer à la main. -->

Aucun axe de variante : le composant n'appelle pas `cva()`. Son apparence se règle par ses props et, en dernier recours, par `className` avec des classes de tokens.

## États

| État     | Description                                                                       |
| -------- | --------------------------------------------------------------------------------- |
| default  | Panneau fermé, aucun overlay visible                                              |
| open     | Overlay affiché, panneau glissé depuis le bord avec `fade-in` + `slide-in-from-*` |
| closing  | Animation de sortie `fade-out` + `slide-out-to-*`                                 |
| focus    | Focus piégé à l'intérieur du panneau (focus trap Radix)                           |
| disabled | N/A — les contrôles internes gèrent leur propre état disabled                     |

## Accessibilité

**Pattern** : [Dialog (Modal)](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) (Radix Dialog)

**Rôle** : `role="dialog"`, `aria-modal="true"` ; étiqueté par `SheetTitle`.

**Clavier** :

| Touche              | Action                                                     |
| ------------------- | ---------------------------------------------------------- |
| `Tab` / `Shift+Tab` | Parcourt les éléments focalisables, piégés dans le panneau |
| `Escape`            | Ferme le panneau                                           |

**Nom accessible** : `SheetTitle` est obligatoire, même masqué visuellement. Le bouton de fermeture est nommé par `closeLabel` (`UI_STRINGS.sheet.close`).

**Vigilance** :

- À la fermeture, le focus revient au déclencheur.
- Un panneau latéral de navigation reste un dialogue modal : sur grand écran, préférer une `Sidebar` permanente.

## Exemple de code

```tsx
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

export default function Example() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Ouvrir le panneau</Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Détails du compte</SheetTitle>
          <SheetDescription>
            Consultez et modifiez les informations de votre compte.
          </SheetDescription>
        </SheetHeader>
        {/* Contenu du panneau */}
        <SheetFooter>
          <Button type="submit">Enregistrer</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
```

## Références croisées

- `Drawer` — panneau glissant avec geste swipe (basé sur vaul), idéal pour mobile
- `Dialog` — modale centrée pour du contenu plus court
- `AlertDialog` — modale de confirmation bloquante
- `Button` — utilisé en interne pour le bouton de fermeture
