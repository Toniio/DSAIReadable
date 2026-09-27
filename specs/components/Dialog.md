# Dialog

## Metadata

| Champ         | Valeur                   |
| ------------- | ------------------------ |
| Nom           | Dialog                   |
| Catégorie     | Overlay                  |
| Statut        | stable                   |
| figma_node_id |                          |
| code_path     | components/ui/dialog.tsx |

## Rôle

Fenêtre modale polyvalente pour afficher du contenu interactif (formulaire, détail, confirmation) au-dessus de l'interface principale.

## Usage

- Afficher un formulaire de création ou d'édition sans quitter la page
- Présenter des détails complémentaires dans une fenêtre superposée
- Demander une saisie utilisateur avant de poursuivre un flux
- Afficher un contenu riche nécessitant une attention focalisée
- Alternative desktop aux écrans plein-écran sur mobile

## Contraintes

- **MUST NOT** — servir à une confirmation destructrice → utiliser `AlertDialog`
- **MUST NOT** — ouvrir un `Dialog` par-dessus un autre : un seul visible à la fois
- **MUST** — rendre un `DialogTitle` : c'est le nom annoncé par les lecteurs d'écran
- **MUST NOT** — contenir un contenu qui impose un défilement interne → utiliser `Sheet` ou une page dédiée
- **MUST** — garder un moyen de fermer le dialogue quand `showCloseButton={false}` masque le bouton
- **MUST** — dans une interface qui n'est pas en anglais, traduire `UI_STRINGS.dialog` via `closeLabel`

## Dépendances

- `Dialog` de `radix-ui` (primitives Root, Trigger, Portal, Overlay, Content, Close, Title, Description)
- `Button` de `@/components/ui/button` (bouton de fermeture et bouton dans le footer)
- `@phosphor-icons/react` — icône `XIcon` pour le bouton de fermeture

## Anatomie

| Slot                             | Rôle                                     |
| -------------------------------- | ---------------------------------------- |
| `data-slot="dialog"`             | Racine du composant                      |
| `data-slot="dialog-trigger"`     | Élément déclencheur d'ouverture          |
| `data-slot="dialog-portal"`      | Portail de rendu hors du DOM parent      |
| `data-slot="dialog-overlay"`     | Fond semi-transparent avec backdrop-blur |
| `data-slot="dialog-content"`     | Conteneur principal de la modale         |
| `data-slot="dialog-close"`       | Bouton de fermeture (icône ×)            |
| `data-slot="dialog-header"`      | Zone d'en-tête (titre + description)     |
| `data-slot="dialog-footer"`      | Zone de pied (boutons d'action)          |
| `data-slot="dialog-title"`       | Titre de la modale                       |
| `data-slot="dialog-description"` | Description textuelle                    |

## Tokens utilisés

<!-- Généré par scripts/build-spec-tokens.ts depuis le code du composant — ne pas éditer à la main. -->

| Token                            | Classes et variables                                                 | Où                                                                                                                  |
| -------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `color.background.elevated`      | `bg-popover`                                                         | `DialogContent` via `MODAL_CONTENT_BASE` (`lib/overlay.ts`)                                                         |
| `color.static.black`             | `bg-black/10`                                                        | `DialogOverlay` via `OVERLAY_BASE` (`lib/overlay.ts`)                                                               |
| `color.text.default`             | `ring-foreground/10` · `text-foreground` · `text-popover-foreground` | `DialogContent` via `MODAL_CONTENT_BASE` (`lib/overlay.ts`) · `DialogDescription`                                   |
| `color.text.subtle`              | `text-muted-foreground`                                              | `DialogDescription`                                                                                                 |
| `motion.duration.fast`           | `duration-fast`                                                      | `DialogContent` via `MODAL_CONTENT_BASE` (`lib/overlay.ts`) · `DialogOverlay`                                       |
| `space.component.lg`             | `max-w-[calc(100%-var(--space-component-lg))]`                       | `DialogContent`                                                                                                     |
| `typography.font-weight.medium`  | `font-medium`                                                        | `DialogTitle`                                                                                                       |
| `typography.line-height.relaxed` | `text-xs/relaxed`                                                    | `DialogContent` · `DialogDescription`                                                                               |
| `typography.size.sm`             | `text-sm`                                                            | `DialogTitle`                                                                                                       |
| `typography.size.xs`             | `text-xs/relaxed`                                                    | `DialogContent` · `DialogDescription`                                                                               |
| `zindex.modal`                   | `z-modal`                                                            | `DialogContent` via `MODAL_CONTENT_BASE` (`lib/overlay.ts`) · `DialogOverlay` via `OVERLAY_BASE` (`lib/overlay.ts`) |

Relevé dans `components/ui/dialog.tsx` et les constantes de `lib/` qu'il importe ; chaque classe est résolue par Tailwind jusqu'au token sémantique. **Où** : sous-composant, chemin de variante `cva` ou constante d'origine. Les classes qui ne lisent aucun token (espacement `p-2`, tailles, mise en page) n'y figurent pas.

Compose `Button` : les tokens de ce composant sont listés dans sa spec.

## Props / API

<!-- Généré par scripts/build-spec-api.ts depuis les exports TypeScript. Seules les descriptions s'éditent à la main : elles sont conservées. -->

### `Dialog`

Rend `DialogPrimitive.Root`.

| Prop           | Type                                                | Défaut      | Description                                  |
| -------------- | --------------------------------------------------- | ----------- | -------------------------------------------- |
| `open`         | `boolean`                                           | `undefined` | Contrôle l'état ouvert/fermé (mode contrôlé) |
| `onOpenChange` | `(open: boolean) => void`                           | —           | Callback lors du changement d'état           |
| `...props`     | `React.ComponentProps<typeof DialogPrimitive.Root>` | —           | Props de `DialogPrimitive.Root`              |

### `DialogClose`

Rend `DialogPrimitive.Close`.

| Prop       | Type                                                 | Défaut | Description                      |
| ---------- | ---------------------------------------------------- | ------ | -------------------------------- |
| `...props` | `React.ComponentProps<typeof DialogPrimitive.Close>` | —      | Props de `DialogPrimitive.Close` |

### `DialogContent`

Rend `DialogPrimitive.Content`.

| Prop              | Type                                                   | Défaut                    | Description                                                                |
| ----------------- | ------------------------------------------------------ | ------------------------- | -------------------------------------------------------------------------- |
| `showCloseButton` | `boolean`                                              | `true`                    | Affiche un bouton « Close » dans le footer (sur `DialogFooter`)            |
| `closeLabel`      | `string`                                               | `UI_STRINGS.dialog.close` | Nom accessible du bouton de fermeture ; remplace la valeur de `UI_STRINGS` |
| `...props`        | `React.ComponentProps<typeof DialogPrimitive.Content>` | —                         | Props de `DialogPrimitive.Content`                                         |

### `DialogDescription`

Rend `DialogPrimitive.Description`.

| Prop       | Type                                                       | Défaut | Description                            |
| ---------- | ---------------------------------------------------------- | ------ | -------------------------------------- |
| `...props` | `React.ComponentProps<typeof DialogPrimitive.Description>` | —      | Props de `DialogPrimitive.Description` |

### `DialogFooter`

Rend `<div>`.

| Prop              | Type                          | Défaut                    | Description                                                                |
| ----------------- | ----------------------------- | ------------------------- | -------------------------------------------------------------------------- |
| `showCloseButton` | `boolean`                     | `false`                   | Affiche le bouton de fermeture                                             |
| `closeLabel`      | `string`                      | `UI_STRINGS.dialog.close` | Nom accessible du bouton de fermeture ; remplace la valeur de `UI_STRINGS` |
| `...props`        | `React.ComponentProps<"div">` | —                         | Props natives de `<div>`                                                   |

### `DialogHeader`

Rend `<div>`.

| Prop       | Type                          | Défaut | Description              |
| ---------- | ----------------------------- | ------ | ------------------------ |
| `...props` | `React.ComponentProps<"div">` | —      | Props natives de `<div>` |

### `DialogOverlay`

Rend `DialogPrimitive.Overlay`.

| Prop       | Type                                                   | Défaut | Description                        |
| ---------- | ------------------------------------------------------ | ------ | ---------------------------------- |
| `...props` | `React.ComponentProps<typeof DialogPrimitive.Overlay>` | —      | Props de `DialogPrimitive.Overlay` |

### `DialogPortal`

Rend `DialogPrimitive.Portal`.

| Prop       | Type                                                  | Défaut | Description                       |
| ---------- | ----------------------------------------------------- | ------ | --------------------------------- |
| `...props` | `React.ComponentProps<typeof DialogPrimitive.Portal>` | —      | Props de `DialogPrimitive.Portal` |

### `DialogTitle`

Rend `DialogPrimitive.Title`.

| Prop       | Type                                                 | Défaut | Description                      |
| ---------- | ---------------------------------------------------- | ------ | -------------------------------- |
| `...props` | `React.ComponentProps<typeof DialogPrimitive.Title>` | —      | Props de `DialogPrimitive.Title` |

### `DialogTrigger`

Rend `DialogPrimitive.Trigger`.

| Prop       | Type                                                   | Défaut | Description                        |
| ---------- | ------------------------------------------------------ | ------ | ---------------------------------- |
| `...props` | `React.ComponentProps<typeof DialogPrimitive.Trigger>` | —      | Props de `DialogPrimitive.Trigger` |

<!-- Fin de la partie générée. -->

## Variantes

<!-- Généré par scripts/build-spec-variants.ts depuis mcp-server/context/component-variants.json — ne pas éditer à la main. -->

Aucun axe de variante : le composant n'appelle pas `cva()`. Son apparence se règle par ses props et, en dernier recours, par `className` avec des classes de tokens.

## États

| État     | Description                                                             |
| -------- | ----------------------------------------------------------------------- |
| default  | Modale fermée, aucun overlay visible                                    |
| open     | Overlay affiché, contenu centré avec animation `fade-in` + `zoom-in-95` |
| closing  | Animation de sortie `fade-out` + `zoom-out-95`                          |
| focus    | Focus piégé à l'intérieur de la modale (focus trap Radix)               |
| disabled | N/A — les contrôles internes gèrent leur propre état disabled           |

## Accessibilité

**Pattern** : [Dialog (Modal)](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) (Radix Dialog)

**Rôle** : `role="dialog"`, `aria-modal="true"` ; étiqueté par `DialogTitle`, décrit par `DialogDescription`.

**Clavier** :

| Touche              | Action                                                      |
| ------------------- | ----------------------------------------------------------- |
| `Tab` / `Shift+Tab` | Parcourt les éléments focalisables, piégés dans le dialogue |
| `Escape`            | Ferme le dialogue                                           |

**Nom accessible** : `DialogTitle` est obligatoire (Radix avertit en son absence) ; le masquer visuellement si besoin, jamais le supprimer. Le bouton de fermeture est nommé par `closeLabel` (`UI_STRINGS.dialog.close`).

**Vigilance** :

- À la fermeture, le focus revient au déclencheur : ne pas démonter le déclencheur pendant que le dialogue est ouvert.
- La surface elle-même n'affiche pas d'anneau de focus (`focus-managed`) : le focus va sur un contrôle à l'intérieur.

## Exemple de code

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export default function Example() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Modifier le profil</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier le profil</DialogTitle>
          <DialogDescription>
            Modifiez vos informations personnelles ci-dessous.
          </DialogDescription>
        </DialogHeader>
        {/* Contenu du formulaire */}
        <DialogFooter>
          <Button type="submit">Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

## Références croisées

- `AlertDialog` — pour les confirmations bloquantes nécessitant une réponse obligatoire
- `Sheet` — panneau latéral pour du contenu étendu ou des formulaires longs
- `Drawer` — alternative mobile au Dialog, panneau glissant depuis un bord
- `Button` — utilisé en interne pour le bouton de fermeture
