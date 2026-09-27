# Kbd

## Metadata

| Champ         | Valeur                |
| ------------- | --------------------- |
| Nom           | Kbd                   |
| Catégorie     | Misc                  |
| Statut        | stable                |
| figma_node_id |                       |
| code_path     | components/ui/kbd.tsx |

## Rôle

Représentation visuelle d'une touche ou combinaison de touches clavier sous forme d'étiquette inline.

## Usage

- Afficher un raccourci clavier à côté d'une action (ex. : `⌘K` pour la recherche)
- Intégrer un indicateur de touche dans un `Tooltip`
- Documenter les raccourcis dans une page d'aide ou un menu
- Grouper plusieurs touches avec `KbdGroup` pour les combinaisons (ex. : `⌘` + `Shift` + `P`)

## Contraintes

- Ne pas utiliser pour du texte générique — réservé aux touches clavier
- Composant non interactif (`pointer-events-none`) ; ne pas ajouter de gestionnaire de clic
- Vérifier le contraste dans les contextes sombres (styles adaptés automatiquement via `dark:`)
- Prévoir un libellé textuel en complément pour les lecteurs d'écran si la touche est symbolique

## Dépendances

- `cn` utilitaire depuis `@/lib/utils`

## Anatomie

| Slot                    | Rôle                                               |
| ----------------------- | -------------------------------------------------- |
| `data-slot="kbd"`       | Touche individuelle, étiquette inline              |
| `data-slot="kbd-group"` | Conteneur regroupant plusieurs `Kbd` (combinaison) |

## Tokens utilisés

<!-- Généré par scripts/build-spec-tokens.ts depuis le code du composant — ne pas éditer à la main. -->

| Token                           | Classes et variables                                        | Où    |
| ------------------------------- | ----------------------------------------------------------- | ----- |
| `color.background.default`      | `bg-background/10` · `bg-background/20` · `text-background` | `Kbd` |
| `color.background.subtle`       | `bg-muted`                                                  | `Kbd` |
| `color.text.subtle`             | `text-muted-foreground`                                     | `Kbd` |
| `typography.font-weight.medium` | `font-medium`                                               | `Kbd` |
| `typography.size.xs`            | `text-xs`                                                   | `Kbd` |

Relevé dans `components/ui/kbd.tsx` et les constantes de `lib/` qu'il importe ; chaque classe est résolue par Tailwind jusqu'au token sémantique. **Où** : sous-composant, chemin de variante `cva` ou constante d'origine. Les classes qui ne lisent aucun token (espacement `p-2`, tailles, mise en page) n'y figurent pas.

## Props / API

| Prop         | Type                          | Défaut | Description                |
| ------------ | ----------------------------- | ------ | -------------------------- |
| **Kbd**      |                               |        |                            |
| `className`  | `string`                      | —      | Classes CSS additionnelles |
| `...props`   | `React.ComponentProps<"kbd">` | —      | Props natives du `<kbd>`   |
| **KbdGroup** |                               |        |                            |
| `className`  | `string`                      | —      | Classes CSS additionnelles |
| `...props`   | `React.ComponentProps<"div">` | —      | Props natives du `<div>`   |

## Variantes

<!-- Généré par scripts/build-spec-variants.ts depuis mcp-server/context/component-variants.json — ne pas éditer à la main. -->

Aucun axe de variante : le composant n'appelle pas `cva()`. Son apparence se règle par ses props et, en dernier recours, par `className` avec des classes de tokens.

## États

| État       | Description                                                                            |
| ---------- | -------------------------------------------------------------------------------------- |
| default    | Fond `muted`, texte `muted-foreground`, hauteur fixe `h-5`                             |
| in-tooltip | Fond et texte adaptés au contexte sombre du tooltip (`in-data-[slot=tooltip-content]`) |
| hover      | Non applicable (composant non interactif)                                              |
| focus      | Non applicable (composant non interactif)                                              |
| active     | Non applicable                                                                         |
| disabled   | Non applicable                                                                         |

## Accessibilité

**Pattern** : Élément natif `kbd`

**Rôle** : `kbd` natif : désigne une touche ou une saisie clavier.

**Clavier** :

Aucune interaction ; purement informatif.

**Nom accessible** : Le texte. Un symbole (`⌘`, `⇧`) est lu de façon variable : écrire la touche en toutes lettres (« Cmd ») ou ajouter un texte `sr-only`.

**Vigilance** :

- Le raccourci documenté doit exister réellement, et ne pas entrer en conflit avec ceux du navigateur ou des lecteurs d'écran.

## Exemple de code

```tsx
import { Kbd, KbdGroup } from "@/components/ui/kbd"

export default function Example() {
  return (
    <div className="flex items-center gap-2">
      <span>Rechercher</span>
      <KbdGroup>
        <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>
    </div>
  )
}
```

## Références croisées

- `Tooltip` — hôte fréquent d'un `Kbd` pour afficher un raccourci clavier
- `DropdownMenu` — peut afficher un `Kbd` en fin de ligne d'item
