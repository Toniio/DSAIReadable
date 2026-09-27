# Tooltip

## Metadata

| Champ         | Valeur                    |
| ------------- | ------------------------- |
| Nom           | Tooltip                   |
| Catégorie     | Feedback                  |
| Statut        | stable                    |
| figma_node_id |                           |
| code_path     | components/ui/tooltip.tsx |

## Rôle

Bulle d'information contextuelle apparaissant au survol ou au focus d'un élément déclencheur, basée sur Radix Tooltip.

## Usage

- Décrire la fonction d'un bouton icône sans label visible
- Afficher un raccourci clavier associé à une action (via `Kbd` imbriqué)
- Préciser le sens d'une icône ou d'une abréviation
- Fournir un complément d'information sur un élément interactif
- Afficher un aperçu court au survol d'un lien ou d'un élément tronqué

<!-- rule-21 : généré depuis design-system.index.json par scripts/build-spec-choices.ts — ne pas éditer à la main. -->

- **Choix** (`rule-21`) — Choisir la surface d'après le blocage et la longueur du contenu. Décision bloquante (confirmer, détruire) : `AlertDialog`. Tâche courte, sans défilement interne : `Dialog`. Contenu long ou contexte latéral : `Sheet` à partir de `md`, `Drawer` en dessous — **sauf** la navigation latérale, qui reste un `Sheet` à toute largeur (c'est ce que fait `Sidebar` sous `md`). Contenu ancré non bloquant, sans défilement et d'au plus 3 champs : `Popover`. Aperçu informatif au survol, à partir de `md` : `HoverCard`. Libellé non interactif d'une ligne (80 caractères au plus) : `Tooltip`.

## Contraintes

- **MUST NOT** — contenir des éléments interactifs (liens, boutons) → utiliser `Popover`
- **MUST NOT** — dépasser une ligne ou 80 caractères de texte
- **MUST NOT** — être le seul support d'une information critique
- **MUST** — placer un `TooltipProvider` au-dessus dans l'arbre, par exemple dans le layout racine
- **MUST NOT** — poser un `Tooltip` directement sur un élément `disabled`, qui ne reçoit ni focus ni survol : envelopper l'élément dans un `<span tabIndex={0}>` qui porte le déclencheur

## Dépendances

- `radix-ui` — `Tooltip` primitive (Provider, Root, Trigger, Content, Portal, Arrow)
- `cn` utilitaire depuis `@/lib/utils`

## Anatomie

| Slot                           | Rôle                                                    |
| ------------------------------ | ------------------------------------------------------- |
| `data-slot="tooltip-provider"` | Fournisseur de contexte (délai, configuration)          |
| `data-slot="tooltip"`          | Racine logique du tooltip (gestion ouverture/fermeture) |
| `data-slot="tooltip-trigger"`  | Élément déclencheur (hover / focus)                     |
| `data-slot="tooltip-content"`  | Contenu de la bulle, rendu dans un `Portal`             |

## Tokens utilisés

<!-- Généré par scripts/build-spec-tokens.ts depuis le code du composant — ne pas éditer à la main. -->

| Token                      | Classes et variables                | Où               |
| -------------------------- | ----------------------------------- | ---------------- |
| `color.background.default` | `text-background`                   | `TooltipContent` |
| `color.text.default`       | `bg-foreground` · `fill-foreground` | `TooltipContent` |
| `typography.size.xs`       | `text-xs`                           | `TooltipContent` |
| `zindex.tooltip`           | `z-tooltip`                         | `TooltipContent` |

Relevé dans `components/ui/tooltip.tsx` et les constantes de `lib/` qu'il importe ; chaque classe est résolue par Tailwind jusqu'au token sémantique. **Où** : sous-composant, chemin de variante `cva` ou constante d'origine. Les classes qui ne lisent aucun token (espacement `p-2`, tailles, mise en page) n'y figurent pas.

## Props / API

<!-- Généré par scripts/build-spec-api.ts depuis les exports TypeScript. Seules les descriptions s'éditent à la main : elles sont conservées. -->

### `Tooltip`

Rend `TooltipPrimitive.Root`.

| Prop       | Type                                                 | Défaut | Description                      |
| ---------- | ---------------------------------------------------- | ------ | -------------------------------- |
| `...props` | `React.ComponentProps<typeof TooltipPrimitive.Root>` | —      | Props de `TooltipPrimitive.Root` |

### `TooltipContent`

Rend `TooltipPrimitive.Content`.

| Prop         | Type                                                    | Défaut | Description                          |
| ------------ | ------------------------------------------------------- | ------ | ------------------------------------ |
| `sideOffset` | `number`                                                | `0`    | Décalage par rapport au trigger (px) |
| `className`  | `string`                                                | —      | Classes CSS additionnelles           |
| `children`   | `React.ReactNode`                                       | —      | Contenu du tooltip                   |
| `...props`   | `React.ComponentProps<typeof TooltipPrimitive.Content>` | —      | Props de `TooltipPrimitive.Content`  |

### `TooltipProvider`

Rend `TooltipPrimitive.Provider`.

| Prop            | Type                                                     | Défaut | Description                          |
| --------------- | -------------------------------------------------------- | ------ | ------------------------------------ |
| `delayDuration` | `number`                                                 | `0`    | Délai avant apparition (ms)          |
| `...props`      | `React.ComponentProps<typeof TooltipPrimitive.Provider>` | —      | Props de `TooltipPrimitive.Provider` |

### `TooltipTrigger`

Rend `TooltipPrimitive.Trigger`.

| Prop       | Type                                                    | Défaut | Description                         |
| ---------- | ------------------------------------------------------- | ------ | ----------------------------------- |
| `...props` | `React.ComponentProps<typeof TooltipPrimitive.Trigger>` | —      | Props de `TooltipPrimitive.Trigger` |

<!-- Fin de la partie générée. -->

## Variantes

<!-- Généré par scripts/build-spec-variants.ts depuis mcp-server/context/component-variants.json — ne pas éditer à la main. -->

Aucun axe de variante : le composant n'appelle pas `cva()`. Son apparence se règle par ses props et, en dernier recours, par `className` avec des classes de tokens.

## États

| État     | Description                                                              |
| -------- | ------------------------------------------------------------------------ |
| default  | Tooltip masqué                                                           |
| hover    | Apparition après le délai configuré (animation `fade-in` + `zoom-in-95`) |
| focus    | Même comportement que hover, déclenché par la navigation clavier         |
| active   | Non applicable                                                           |
| disabled | Non applicable — le trigger ne doit pas être disabled                    |
| closing  | Animation de sortie `fade-out` + `zoom-out-95`                           |

## Accessibilité

**Pattern** : [Tooltip](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/) (Radix Tooltip)

**Rôle** : `role="tooltip"` ; le déclencheur est décrit par l'infobulle (`aria-describedby`).

**Clavier** :

| Touche               | Action              |
| -------------------- | ------------------- |
| Focus du déclencheur | Affiche l'infobulle |
| `Escape`             | La masque           |

**Nom accessible** : L'infobulle décrit, elle ne nomme pas : un bouton icône seule garde son `aria-label` même avec une infobulle.

**Vigilance** :

- Pas d'information essentielle ni de contenu interactif dans une infobulle.
- Un bouton `disabled` ne reçoit pas le focus : son infobulle est inaccessible au clavier.
- Le contenu doit rester affiché au survol de l'infobulle elle-même (WCAG 1.4.13) : ne pas raccourcir les délais.

## Exemple de code

```tsx
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Kbd } from "@/components/ui/kbd"

export default function Example() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button aria-label="Copier">📋</button>
        </TooltipTrigger>
        <TooltipContent>
          Copier <Kbd>⌘C</Kbd>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
```

## Références croisées

- `Kbd` — raccourci clavier affiché à l'intérieur du tooltip (style adapté via `in-data-[slot=tooltip-content]`)
- `Popover` — alternative pour du contenu interactif
- `Button` — déclencheur fréquent du tooltip (variantes `icon-*`)
