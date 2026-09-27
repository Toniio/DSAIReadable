# HoverCard

## Metadata

| Champ         | Valeur                       |
| ------------- | ---------------------------- |
| Nom           | HoverCard                    |
| Catégorie     | Overlay                      |
| Statut        | stable                       |
| figma_node_id |                              |
| code_path     | components/ui/hover-card.tsx |

## Rôle

Carte flottante de prévisualisation apparaissant au survol d'un élément, affichant des informations complémentaires sans clic.

## Usage

- Prévisualiser le profil d'un utilisateur au survol de son nom ou avatar
- Afficher un résumé d'un lien ou d'une ressource avant navigation
- Montrer des métadonnées complémentaires sans encombrer l'interface
- Fournir un aperçu rapide d'un élément dans une liste

## Contraintes

- **MUST NOT** — contenir des éléments interactifs (formulaires, boutons) → utiliser `Popover`
- Ne pas utiliser sur mobile (le survol n'existe pas sur tactile) — prévoir un fallback
- Le contenu doit être purement informatif et non essentiel
- **MUST NOT** — poser des `HoverCard` sur deux déclencheurs adjacents (liste dense) : le survol de l'un ouvre l'autre
- Ne pas y placer de contenu critique que l'utilisateur doit impérativement voir

## Dépendances

- `HoverCard` de `radix-ui` (primitives Root, Trigger, Portal, Content)

## Anatomie

| Slot                             | Rôle                          |
| -------------------------------- | ----------------------------- |
| `data-slot="hover-card"`         | Racine du composant           |
| `data-slot="hover-card-trigger"` | Élément déclencheur au survol |
| `data-slot="hover-card-portal"`  | Portail de rendu              |
| `data-slot="hover-card-content"` | Conteneur du contenu flottant |

## Tokens utilisés

<!-- Généré par scripts/build-spec-tokens.ts depuis le code du composant — ne pas éditer à la main. -->

| Token                            | Classes et variables                             | Où                 |
| -------------------------------- | ------------------------------------------------ | ------------------ |
| `color.background.elevated`      | `bg-popover`                                     | `HoverCardContent` |
| `color.text.default`             | `ring-foreground/10` · `text-popover-foreground` | `HoverCardContent` |
| `elevation.md`                   | `shadow-md`                                      | `HoverCardContent` |
| `motion.duration.fast`           | `duration-fast`                                  | `HoverCardContent` |
| `typography.line-height.relaxed` | `text-xs/relaxed`                                | `HoverCardContent` |
| `typography.size.xs`             | `text-xs/relaxed`                                | `HoverCardContent` |
| `zindex.popover`                 | `z-popover`                                      | `HoverCardContent` |

Relevé dans `components/ui/hover-card.tsx` et les constantes de `lib/` qu'il importe ; chaque classe est résolue par Tailwind jusqu'au token sémantique. **Où** : sous-composant, chemin de variante `cva` ou constante d'origine. Les classes qui ne lisent aucun token (espacement `p-2`, tailles, mise en page) n'y figurent pas.

## Props / API

<!-- Généré par scripts/build-spec-api.ts depuis les exports TypeScript. Seules les descriptions s'éditent à la main : elles sont conservées. -->

### `HoverCard`

Rend `HoverCardPrimitive.Root`.

| Prop           | Type                                                   | Défaut      | Description                                  |
| -------------- | ------------------------------------------------------ | ----------- | -------------------------------------------- |
| `open`         | `boolean`                                              | `undefined` | Contrôle l'état ouvert/fermé (mode contrôlé) |
| `onOpenChange` | `(open: boolean) => void`                              | —           | Callback lors du changement d'état           |
| `openDelay`    | `number`                                               | `700`       | Délai en ms avant l'ouverture au survol      |
| `closeDelay`   | `number`                                               | `300`       | Délai en ms avant la fermeture à la sortie   |
| `...props`     | `React.ComponentProps<typeof HoverCardPrimitive.Root>` | —           | Props de `HoverCardPrimitive.Root`           |

### `HoverCardTrigger`

Rend `HoverCardPrimitive.Trigger`.

| Prop       | Type                                                      | Défaut | Description                           |
| ---------- | --------------------------------------------------------- | ------ | ------------------------------------- |
| `...props` | `React.ComponentProps<typeof HoverCardPrimitive.Trigger>` | —      | Props de `HoverCardPrimitive.Trigger` |

### `HoverCardContent`

Rend `HoverCardPrimitive.Content`.

| Prop         | Type                                                      | Défaut     | Description                                                            |
| ------------ | --------------------------------------------------------- | ---------- | ---------------------------------------------------------------------- |
| `align`      | `"center" \| "end" \| "start"`                            | `"center"` | Alignement du contenu par rapport au trigger (sur `HoverCardContent`)  |
| `sideOffset` | `number`                                                  | `4`        | Espacement en px entre le trigger et la carte (sur `HoverCardContent`) |
| `...props`   | `React.ComponentProps<typeof HoverCardPrimitive.Content>` | —          | Props de `HoverCardPrimitive.Content`                                  |

<!-- Fin de la partie générée. -->

## Variantes

<!-- Généré par scripts/build-spec-variants.ts depuis mcp-server/context/component-variants.json — ne pas éditer à la main. -->

Aucun axe de variante : le composant n'appelle pas `cva()`. Son apparence se règle par ses props et, en dernier recours, par `className` avec des classes de tokens.

## États

| État     | Description                                                            |
| -------- | ---------------------------------------------------------------------- |
| default  | Carte masquée, trigger en attente de survol                            |
| hover    | Carte affichée après le délai, avec animation `fade-in` + `zoom-in-95` |
| closing  | Animation de sortie `fade-out` + `zoom-out-95` après sortie du survol  |
| focus    | N/A — la carte réagit au survol, pas au focus clavier par défaut       |
| disabled | N/A — géré au niveau du trigger parent                                 |

## Accessibilité

**Pattern** : Aperçu au survol (Radix HoverCard) — pas de pattern APG

**Rôle** : Contenu flottant ouvert au survol ou au focus du déclencheur.

**Clavier** :

| Touche                       | Action         |
| ---------------------------- | -------------- |
| `Tab` (focus du déclencheur) | Ouvre l'aperçu |
| Perte du focus               | Ferme l'aperçu |

**Nom accessible** : Celui du déclencheur, le plus souvent un lien nommé par son texte.

**Vigilance** :

- Le contenu n'est pas atteignable de façon fiable au clavier ni annoncé : n'y mettre que de l'information déjà accessible ailleurs (la page cible du lien).
- Ne pas y placer d'action ; pour un contenu interactif, utiliser `Popover`.

## Exemple de code

```tsx
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"

export default function Example() {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <a href="/profil" className="underline">
          @utilisateur
        </a>
      </HoverCardTrigger>
      <HoverCardContent>
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Jean Dupont</p>
          <p className="text-xs text-muted-foreground">
            Développeur front-end · Rejoint en mars 2024
          </p>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
```

## Références croisées

- `Popover` — contenu flottant interactif déclenché par un clic
- `Tooltip` — info-bulle plus légère pour un texte court
- `DropdownMenu` — menu d'actions déclenché par un clic
