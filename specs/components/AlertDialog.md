# AlertDialog

## Metadata

| Champ         | Valeur                         |
| ------------- | ------------------------------ |
| Nom           | AlertDialog                    |
| Catégorie     | Overlay                        |
| Statut        | stable                         |
| figma_node_id |                                |
| code_path     | components/ui/alert-dialog.tsx |

## Rôle

Fenêtre modale de confirmation bloquante qui interrompt l'utilisateur pour valider ou annuler une action critique.

## Usage

- Confirmer une action irréversible (suppression, résiliation, envoi définitif)
- Demander une validation explicite avant un changement destructeur
- Afficher un avertissement nécessitant une réponse obligatoire de l'utilisateur
- Bloquer l'interaction avec le reste de l'interface tant que le choix n'est pas fait

<!-- rule-21 : généré depuis design-system.index.json par scripts/build-spec-choices.ts — ne pas éditer à la main. -->

- **Choix** (`rule-21`) — Choisir la surface d'après le blocage et la longueur du contenu. Décision bloquante (confirmer, détruire) : `AlertDialog`. Tâche courte, sans défilement interne : `Dialog`. Contenu long ou contexte latéral : `Sheet` à partir de `md`, `Drawer` en dessous — **sauf** la navigation latérale, qui reste un `Sheet` à toute largeur (c'est ce que fait `Sidebar` sous `md`). Contenu ancré non bloquant, sans défilement et d'au plus 3 champs : `Popover`. Aperçu informatif au survol, à partir de `md` : `HoverCard`. Libellé non interactif d'une ligne (80 caractères au plus) : `Tooltip`.

## Contraintes

- **MUST NOT** — servir à un simple message d'information → utiliser `Dialog`, ou `Sonner` pour une notification
- **MUST NOT** — ouvrir un `AlertDialog` par-dessus un autre : un seul visible à la fois
- **MUST** — proposer un bouton d'annulation (`AlertDialogCancel`)
- **MUST NOT** — réimplémenter le piège à focus : Radix le fournit
- **MUST** — rendre un `AlertDialogTitle` : c'est le nom annoncé par les lecteurs d'écran

## Dépendances

- `AlertDialog` de `radix-ui` (primitives Root, Trigger, Portal, Overlay, Content, Title, Description, Action, Cancel)
- `Button` de `@/components/ui/button` (utilisé par AlertDialogAction et AlertDialogCancel)

## Anatomie

| Slot                                   | Rôle                                                |
| -------------------------------------- | --------------------------------------------------- |
| `data-slot="alert-dialog"`             | Racine, conteneur logique du composant              |
| `data-slot="alert-dialog-trigger"`     | Élément déclencheur d'ouverture                     |
| `data-slot="alert-dialog-portal"`      | Portail de rendu hors du DOM parent                 |
| `data-slot="alert-dialog-overlay"`     | Fond semi-transparent derrière la modale            |
| `data-slot="alert-dialog-content"`     | Conteneur principal de la modale, porte `data-size` |
| `data-slot="alert-dialog-header"`      | Zone d'en-tête (titre + description)                |
| `data-slot="alert-dialog-footer"`      | Zone de pied (boutons d'action)                     |
| `data-slot="alert-dialog-media"`       | Zone média/icône optionnelle dans le header         |
| `data-slot="alert-dialog-title"`       | Titre de la modale                                  |
| `data-slot="alert-dialog-description"` | Description textuelle                               |
| `data-slot="alert-dialog-action"`      | Bouton d'action principale (confirmer)              |
| `data-slot="alert-dialog-cancel"`      | Bouton d'annulation                                 |

## Tokens utilisés

<!-- Généré par scripts/build-spec-tokens.ts depuis le code du composant — ne pas éditer à la main. -->

| Token                            | Classes et variables                                                 | Où                                                                                                                            |
| -------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `color.background.elevated`      | `bg-popover`                                                         | `AlertDialogContent` via `MODAL_CONTENT_BASE` (`lib/overlay.ts`)                                                              |
| `color.background.subtle`        | `bg-muted`                                                           | `AlertDialogMedia`                                                                                                            |
| `color.static.black`             | `bg-black/10`                                                        | `AlertDialogOverlay` via `OVERLAY_BASE` (`lib/overlay.ts`)                                                                    |
| `color.text.default`             | `ring-foreground/10` · `text-foreground` · `text-popover-foreground` | `AlertDialogContent` via `MODAL_CONTENT_BASE` (`lib/overlay.ts`) · `AlertDialogDescription`                                   |
| `color.text.subtle`              | `text-muted-foreground`                                              | `AlertDialogDescription`                                                                                                      |
| `motion.duration.fast`           | `duration-fast`                                                      | `AlertDialogContent` via `MODAL_CONTENT_BASE` (`lib/overlay.ts`) · `AlertDialogOverlay`                                       |
| `typography.font-weight.medium`  | `font-medium`                                                        | `AlertDialogTitle`                                                                                                            |
| `typography.line-height.relaxed` | `text-xs/relaxed`                                                    | `AlertDialogDescription`                                                                                                      |
| `typography.size.sm`             | `text-sm`                                                            | `AlertDialogTitle`                                                                                                            |
| `typography.size.xs`             | `text-xs/relaxed`                                                    | `AlertDialogDescription`                                                                                                      |
| `zindex.modal`                   | `z-modal`                                                            | `AlertDialogContent` via `MODAL_CONTENT_BASE` (`lib/overlay.ts`) · `AlertDialogOverlay` via `OVERLAY_BASE` (`lib/overlay.ts`) |

Relevé dans `components/ui/alert-dialog.tsx` et les constantes de `lib/` qu'il importe ; chaque classe est résolue par Tailwind jusqu'au token sémantique. **Où** : sous-composant, chemin de variante `cva` ou constante d'origine. Les classes qui ne lisent aucun token (espacement `p-2`, tailles, mise en page) n'y figurent pas.

Compose `Button` : les tokens de ce composant sont listés dans sa spec.

## Props / API

<!-- Généré par scripts/build-spec-api.ts depuis les exports TypeScript. Seules les descriptions s'éditent à la main : elles sont conservées. -->

### `AlertDialog`

Rend `AlertDialogPrimitive.Root`.

| Prop           | Type                                                     | Défaut      | Description                                  |
| -------------- | -------------------------------------------------------- | ----------- | -------------------------------------------- |
| `open`         | `boolean`                                                | `undefined` | Contrôle l'état ouvert/fermé (mode contrôlé) |
| `onOpenChange` | `(open: boolean) => void`                                | —           | Callback lors du changement d'état           |
| `...props`     | `React.ComponentProps<typeof AlertDialogPrimitive.Root>` | —           | Props de `AlertDialogPrimitive.Root`         |

### `AlertDialogAction`

Rend `AlertDialogPrimitive.Action`.

| Prop       | Type                                                                                                                        | Défaut      | Description                                  |
| ---------- | --------------------------------------------------------------------------------------------------------------------------- | ----------- | -------------------------------------------- |
| `variant`  | `"link" \| "default" \| "destructive" \| "outline" \| "secondary" \| "ghost"`                                               | `"default"` | Variante du bouton Action                    |
| `size`     | `"default" \| "xs" \| "sm" \| "lg" \| "icon" \| "icon-xs" \| "icon-sm" \| "icon-lg"`                                        | `"default"` | Taille du contenu (sur `AlertDialogContent`) |
| `...props` | `React.ComponentProps<typeof AlertDialogPrimitive.Action> & Pick<React.ComponentProps<typeof Button>, "variant" \| "size">` | —           | Props de `AlertDialogPrimitive.Action`       |

### `AlertDialogCancel`

Rend `AlertDialogPrimitive.Cancel`.

| Prop       | Type                                                                                                                        | Défaut      | Description                            |
| ---------- | --------------------------------------------------------------------------------------------------------------------------- | ----------- | -------------------------------------- |
| `variant`  | `"link" \| "default" \| "destructive" \| "outline" \| "secondary" \| "ghost"`                                               | `"outline"` | Prop de `Button`, voir sa spec         |
| `size`     | `"default" \| "xs" \| "sm" \| "lg" \| "icon" \| "icon-xs" \| "icon-sm" \| "icon-lg"`                                        | `"default"` | Prop de `Button`, voir sa spec         |
| `...props` | `React.ComponentProps<typeof AlertDialogPrimitive.Cancel> & Pick<React.ComponentProps<typeof Button>, "variant" \| "size">` | —           | Props de `AlertDialogPrimitive.Cancel` |

### `AlertDialogContent`

Rend `AlertDialogPrimitive.Content`.

| Prop       | Type                                                        | Défaut      | Description                                                                                                                                            |
| ---------- | ----------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `size`     | `"default" \| "sm"`                                         | `"default"` | `sm` garde la boîte étroite et son contenu centré à toutes les largeurs ; `default` l'élargit et aligne l'en-tête à gauche à partir du breakpoint `sm` |
| `...props` | `React.ComponentProps<typeof AlertDialogPrimitive.Content>` | —           | Props de `AlertDialogPrimitive.Content`                                                                                                                |

### `AlertDialogDescription`

Rend `AlertDialogPrimitive.Description`.

| Prop       | Type                                                            | Défaut | Description                                 |
| ---------- | --------------------------------------------------------------- | ------ | ------------------------------------------- |
| `...props` | `React.ComponentProps<typeof AlertDialogPrimitive.Description>` | —      | Props de `AlertDialogPrimitive.Description` |

### `AlertDialogFooter`

Rend `<div>`.

| Prop       | Type                          | Défaut | Description              |
| ---------- | ----------------------------- | ------ | ------------------------ |
| `...props` | `React.ComponentProps<"div">` | —      | Props natives de `<div>` |

### `AlertDialogHeader`

Rend `<div>`.

| Prop       | Type                          | Défaut | Description              |
| ---------- | ----------------------------- | ------ | ------------------------ |
| `...props` | `React.ComponentProps<"div">` | —      | Props natives de `<div>` |

### `AlertDialogMedia`

Rend `<div>`.

| Prop       | Type                          | Défaut | Description              |
| ---------- | ----------------------------- | ------ | ------------------------ |
| `...props` | `React.ComponentProps<"div">` | —      | Props natives de `<div>` |

### `AlertDialogOverlay`

Rend `AlertDialogPrimitive.Overlay`.

| Prop       | Type                                                        | Défaut | Description                             |
| ---------- | ----------------------------------------------------------- | ------ | --------------------------------------- |
| `...props` | `React.ComponentProps<typeof AlertDialogPrimitive.Overlay>` | —      | Props de `AlertDialogPrimitive.Overlay` |

### `AlertDialogPortal`

Rend `AlertDialogPrimitive.Portal`.

| Prop       | Type                                                       | Défaut | Description                            |
| ---------- | ---------------------------------------------------------- | ------ | -------------------------------------- |
| `...props` | `React.ComponentProps<typeof AlertDialogPrimitive.Portal>` | —      | Props de `AlertDialogPrimitive.Portal` |

### `AlertDialogTitle`

Rend `AlertDialogPrimitive.Title`.

| Prop       | Type                                                      | Défaut | Description                           |
| ---------- | --------------------------------------------------------- | ------ | ------------------------------------- |
| `...props` | `React.ComponentProps<typeof AlertDialogPrimitive.Title>` | —      | Props de `AlertDialogPrimitive.Title` |

### `AlertDialogTrigger`

Rend `AlertDialogPrimitive.Trigger`.

| Prop       | Type                                                        | Défaut | Description                             |
| ---------- | ----------------------------------------------------------- | ------ | --------------------------------------- |
| `...props` | `React.ComponentProps<typeof AlertDialogPrimitive.Trigger>` | —      | Props de `AlertDialogPrimitive.Trigger` |

<!-- Fin de la partie générée. -->

## Variantes

<!-- Généré par scripts/build-spec-variants.ts depuis mcp-server/context/component-variants.json — ne pas éditer à la main. -->

Aucun axe de variante : le composant n'appelle pas `cva()`. Son apparence se règle par ses props et, en dernier recours, par `className` avec des classes de tokens.

## États

| État     | Description                                                                   |
| -------- | ----------------------------------------------------------------------------- |
| default  | Modale fermée, aucun overlay visible                                          |
| open     | Overlay affiché, contenu centré avec animation `fade-in` + `zoom-in-95`       |
| closing  | Animation de sortie `fade-out` + `zoom-out-95`                                |
| focus    | Focus piégé à l'intérieur de la modale (focus trap Radix)                     |
| disabled | Boutons Action/Cancel peuvent être désactivés individuellement via `disabled` |

## Accessibilité

**Pattern** : [Alert Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/) (Radix AlertDialog)

**Rôle** : `role="alertdialog"`, `aria-modal="true"` ; étiqueté par `AlertDialogTitle`, décrit par `AlertDialogDescription`.

**Clavier** :

| Touche              | Action                                                      |
| ------------------- | ----------------------------------------------------------- |
| `Tab` / `Shift+Tab` | Parcourt les éléments focalisables, piégés dans le dialogue |
| `Escape`            | Ferme le dialogue (équivaut à Annuler)                      |
| `Enter` / `Space`   | Active le bouton focalisé                                   |

**Nom accessible** : `AlertDialogTitle` est obligatoire ; `AlertDialogDescription` doit dire la conséquence de l'action.

**Vigilance** :

- À l'ouverture, le focus va sur `AlertDialogCancel` : l'action destructrice ne doit jamais être le choix par défaut.
- À la fermeture, le focus revient au déclencheur.
- Un clic hors du dialogue ne le ferme pas : c'est voulu, la décision doit être explicite.

## Exemple de code

```tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function Example() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Supprimer</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible. Les données seront définitivement
            supprimées.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction variant="destructive">Supprimer</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
```

## Références croisées

- `Dialog` — pour les modales non-bloquantes sans obligation de réponse
- `Button` — utilisé en interne par AlertDialogAction et AlertDialogCancel
- `Drawer` — alternative modale pour mobile (panneau glissant)
