# Popover

## Metadata

| Champ         | Valeur                    |
| ------------- | ------------------------- |
| Nom           | Popover                   |
| Catégorie     | Overlay                   |
| Statut        | stable                    |
| figma_node_id |                           |
| code_path     | components/ui/popover.tsx |

## Rôle

Conteneur flottant interactif déclenché par un clic, permettant d'afficher du contenu riche (formulaire, sélecteur, aperçu) sans quitter le contexte.

## Usage

- Afficher un sélecteur de date ou de couleur au clic sur un champ
- Proposer un mini-formulaire de saisie rapide (ex. : renommer, ajouter une note)
- Montrer un aperçu détaillé d'un élément avec des actions
- Afficher des options de configuration contextuelles
- Ancrer un contenu flottant à un élément arbitraire via `PopoverAnchor`

<!-- rule-21 : généré depuis design-system.index.json par scripts/build-spec-choices.ts — ne pas éditer à la main. -->

- **Choix** (`rule-21`) — Choisir la surface d'après le blocage et la longueur du contenu. Décision bloquante (confirmer, détruire) : `AlertDialog`. Tâche courte, sans défilement interne : `Dialog`. Contenu long ou contexte latéral : `Sheet` à partir de `md`, `Drawer` en dessous — **sauf** la navigation latérale, qui reste un `Sheet` à toute largeur (c'est ce que fait `Sidebar` sous `md`). Contenu ancré non bloquant, sans défilement et d'au plus 3 champs : `Popover`. Aperçu informatif au survol, à partir de `md` : `HoverCard`. Libellé non interactif d'une ligne (80 caractères au plus) : `Tooltip`.

## Contraintes

- **MUST NOT** — afficher un simple texte d'aide → utiliser `Tooltip` ou `HoverCard`
- **MUST** — régler `as` de `PopoverTitle` sur la hiérarchie réelle : il rend un `<h2>` par défaut, `as="h3"` sous une section en `h2`
- **MUST NOT** — afficher une liste d'actions → utiliser `DropdownMenu`
- **Note** — un seul `Popover` s'ouvre à la fois, sauf état contrôlé à la main
- **MUST NOT** — contenir un contenu qui impose un défilement interne, ni un formulaire de plus de 3 champs → utiliser `Dialog` ou `Sheet`
- **MUST** — tester le positionnement près des bords de l'écran (retournement automatique de Radix)

## Dépendances

- `Popover` de `radix-ui` (primitives Root, Trigger, Portal, Content, Anchor)

## Anatomie

| Slot                              | Rôle                                 |
| --------------------------------- | ------------------------------------ |
| `data-slot="popover"`             | Racine du composant                  |
| `data-slot="popover-trigger"`     | Élément déclencheur au clic          |
| `data-slot="popover-content"`     | Conteneur du contenu flottant        |
| `data-slot="popover-anchor"`      | Ancre de positionnement alternative  |
| `data-slot="popover-header"`      | Zone d'en-tête (titre + description) |
| `data-slot="popover-title"`       | Titre du popover                     |
| `data-slot="popover-description"` | Description textuelle                |

## Tokens utilisés

<!-- Généré par scripts/build-spec-tokens.ts depuis le code du composant — ne pas éditer à la main. -->

| Token                            | Classes et variables                             | Où                                                        |
| -------------------------------- | ------------------------------------------------ | --------------------------------------------------------- |
| `color.background.elevated`      | `bg-popover`                                     | `PopoverContent`                                          |
| `color.text.default`             | `ring-foreground/10` · `text-popover-foreground` | `PopoverContent`                                          |
| `color.text.subtle`              | `text-muted-foreground`                          | `PopoverDescription`                                      |
| `elevation.md`                   | `shadow-md`                                      | `PopoverContent`                                          |
| `motion.duration.fast`           | `duration-fast`                                  | `PopoverContent`                                          |
| `typography.font-weight.medium`  | `font-medium`                                    | `PopoverTitle`                                            |
| `typography.line-height.relaxed` | `text-xs/relaxed`                                | `PopoverDescription`                                      |
| `typography.size.sm`             | `text-sm`                                        | `PopoverTitle`                                            |
| `typography.size.xs`             | `text-xs` · `text-xs/relaxed`                    | `PopoverContent` · `PopoverDescription` · `PopoverHeader` |
| `zindex.popover`                 | `z-popover`                                      | `PopoverContent`                                          |

Relevé dans `components/ui/popover.tsx` et les constantes de `lib/` qu'il importe ; chaque classe est résolue par Tailwind jusqu'au token sémantique. **Où** : sous-composant, chemin de variante `cva` ou constante d'origine. Les classes qui ne lisent aucun token (espacement `p-2`, tailles, mise en page) n'y figurent pas.

## Props / API

<!-- Généré par scripts/build-spec-api.ts depuis les exports TypeScript. Seules les descriptions s'éditent à la main : elles sont conservées. -->

### `Popover`

Rend `PopoverPrimitive.Root`.

| Prop           | Type                                                 | Défaut      | Description                                  |
| -------------- | ---------------------------------------------------- | ----------- | -------------------------------------------- |
| `open`         | `boolean`                                            | `undefined` | Contrôle l'état ouvert/fermé (mode contrôlé) |
| `onOpenChange` | `(open: boolean) => void`                            | —           | Callback lors du changement d'état           |
| `...props`     | `React.ComponentProps<typeof PopoverPrimitive.Root>` | —           | Props de `PopoverPrimitive.Root`             |

### `PopoverAnchor`

Rend `PopoverPrimitive.Anchor`.

| Prop       | Type                                                   | Défaut | Description                        |
| ---------- | ------------------------------------------------------ | ------ | ---------------------------------- |
| `...props` | `React.ComponentProps<typeof PopoverPrimitive.Anchor>` | —      | Props de `PopoverPrimitive.Anchor` |

### `PopoverContent`

Rend `PopoverPrimitive.Content`.

| Prop         | Type                                                    | Défaut     | Description                                                            |
| ------------ | ------------------------------------------------------- | ---------- | ---------------------------------------------------------------------- |
| `align`      | `"center" \| "end" \| "start"`                          | `"center"` | Alignement du contenu par rapport au trigger (sur `PopoverContent`)    |
| `sideOffset` | `number`                                                | `4`        | Espacement en px entre le trigger et le popover (sur `PopoverContent`) |
| `...props`   | `React.ComponentProps<typeof PopoverPrimitive.Content>` | —          | Props de `PopoverPrimitive.Content`                                    |

### `PopoverDescription`

Rend `<p>`.

| Prop       | Type                        | Défaut | Description            |
| ---------- | --------------------------- | ------ | ---------------------- |
| `...props` | `React.ComponentProps<"p">` | —      | Props natives de `<p>` |

### `PopoverHeader`

Rend `<div>`.

| Prop       | Type                          | Défaut | Description              |
| ---------- | ----------------------------- | ------ | ------------------------ |
| `...props` | `React.ComponentProps<"div">` | —      | Props natives de `<div>` |

### `PopoverTitle`

Rend `<h2>`, ou l'élément choisi par `as`.

| Prop       | Type                                           | Défaut | Description                                       |
| ---------- | ---------------------------------------------- | ------ | ------------------------------------------------- |
| `as`       | `"h1" \| "h2" \| "h3" \| "h4" \| "h5" \| "h6"` | `"h2"` | Niveau de titre rendu ; ne change pas l'apparence |
| `...props` | `React.ComponentProps<"h2">`                   | —      | Props natives de `<h2>`                           |

### `PopoverTrigger`

Rend `PopoverPrimitive.Trigger`.

| Prop       | Type                                                    | Défaut | Description                         |
| ---------- | ------------------------------------------------------- | ------ | ----------------------------------- |
| `...props` | `React.ComponentProps<typeof PopoverPrimitive.Trigger>` | —      | Props de `PopoverPrimitive.Trigger` |

<!-- Fin de la partie générée. -->

## Variantes

<!-- Généré par scripts/build-spec-variants.ts depuis mcp-server/context/component-variants.json — ne pas éditer à la main. -->

Aucun axe de variante : le composant n'appelle pas `cva()`. Son apparence se règle par ses props et, en dernier recours, par `className` avec des classes de tokens.

## États

| État     | Description                                                                  |
| -------- | ---------------------------------------------------------------------------- |
| default  | Popover fermé, trigger en attente de clic                                    |
| open     | Contenu affiché avec animation `fade-in` + `zoom-in-95` + slide directionnel |
| closing  | Animation de sortie `fade-out` + `zoom-out-95`                               |
| focus    | Le focus peut naviguer dans le contenu du popover                            |
| disabled | N/A — géré au niveau du trigger parent                                       |

## Accessibilité

**Pattern** : [Dialog (non modal)](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) (Radix Popover)

**Rôle** : Le contenu porte `role="dialog"` ; le déclencheur `aria-haspopup="dialog"` et `aria-expanded`.

**Clavier** :

| Touche            | Action                                |
| ----------------- | ------------------------------------- |
| `Enter` / `Space` | Ouvre le popover                      |
| `Tab`             | Parcourt le contenu (focus non piégé) |
| `Escape`          | Ferme et rend le focus au déclencheur |

**Nom accessible** : Le déclencheur doit être nommé ; donner un titre ou un `aria-label` au contenu s'il n'est pas évident.

**Vigilance** :

- Non modal : le reste de la page reste atteignable. Pour une décision bloquante, utiliser `Dialog`.

## Exemple de code

```tsx
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

export default function Example() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Paramètres</Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Dimensions</PopoverTitle>
          <PopoverDescription>
            Configurez les dimensions du composant.
          </PopoverDescription>
        </PopoverHeader>
        {/* Contenu interactif (inputs, sliders, etc.) */}
      </PopoverContent>
    </Popover>
  )
}
```

## Références croisées

- `HoverCard` — carte flottante déclenchée au survol (non interactive)
- `DropdownMenu` — menu d'actions déclenché par un clic
- `Tooltip` — info-bulle légère pour un texte d'aide court
- `Dialog` — modale centrée pour du contenu plus complexe
