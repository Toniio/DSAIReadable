# Label

## Metadata

| Champ         | Valeur                  |
| ------------- | ----------------------- |
| Nom           | Label                   |
| Catégorie     | Forms                   |
| Statut        | stable                  |
| figma_node_id |                         |
| code_path     | components/ui/label.tsx |

## Rôle

Étiquette accessible associée à un contrôle de formulaire, basée sur Radix `Label.Root`.

## Usage

- Nommer chaque contrôle de formulaire (`Input`, `Checkbox`, `Select`, etc.) via `htmlFor`
- Grouper visuellement une icône et un texte grâce au `gap-2` natif
- Refléter l'état désactivé du contrôle associé (via `peer-disabled`)

## Contraintes

- **MUST NOT** — remplacer un `Label` par un `placeholder`
- **MUST** — relier chaque `Label` à son contrôle (`htmlFor` ou `aria-labelledby`) ; aucun champ sans libellé visible
- **MUST NOT** — servir de titre de section → utiliser `FieldLegend` ou `Heading`
- **MUST NOT** — associer plus d'un `Label` à un contrôle

## Dépendances

- `Label.Root` de `radix-ui` — fournit la liaison sémantique native
- `Field` — coordonne l'état `disabled` via la classe `group/field`
- `Input` / `Checkbox` — contrôles typiquement ciblés

## Anatomie

| Slot                | Rôle                                      |
| ------------------- | ----------------------------------------- |
| `data-slot="label"` | Élément `<label>` natif enrichi par Radix |

## Tokens utilisés

<!-- Généré par scripts/build-spec-tokens.ts depuis le code du composant — ne pas éditer à la main. -->

| Token                | Classes et variables | Où      |
| -------------------- | -------------------- | ------- |
| `opacity.disabled`   | `opacity-disabled`   | `Label` |
| `typography.size.xs` | `text-xs`            | `Label` |

Relevé dans `components/ui/label.tsx` et les constantes de `lib/` qu'il importe ; chaque classe est résolue par Tailwind jusqu'au token sémantique. **Où** : sous-composant, chemin de variante `cva` ou constante d'origine. Les classes qui ne lisent aucun token (espacement `p-2`, tailles, mise en page) n'y figurent pas.

## Props / API

<!-- Généré par scripts/build-spec-api.ts depuis les exports TypeScript. Seules les descriptions s'éditent à la main : elles sont conservées. -->

### `Label`

Rend `LabelPrimitive.Root`.

| Prop        | Type                                               | Défaut | Description                                               |
| ----------- | -------------------------------------------------- | ------ | --------------------------------------------------------- |
| `htmlFor`   | `string`                                           | —      | ID du contrôle associé (obligatoire pour l'accessibilité) |
| `className` | `string`                                           | —      | Classes CSS additionnelles                                |
| `...props`  | `React.ComponentProps<typeof LabelPrimitive.Root>` | —      | Props de `LabelPrimitive.Root`                            |

<!-- Fin de la partie générée. -->

## Variantes

<!-- Généré par scripts/build-spec-variants.ts depuis mcp-server/context/component-variants.json — ne pas éditer à la main. -->

Aucun axe de variante : le composant n'appelle pas `cva()`. Son apparence se règle par ses props et, en dernier recours, par `className` avec des classes de tokens.

## États

| État       | Comportement visuel                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------- |
| `default`  | Texte `text-xs leading-none`, couleur `text-default`                                              |
| `hover`    | Pas de style dédié                                                                                |
| `focus`    | Pas de style dédié (le focus est sur le contrôle)                                                 |
| `active`   | Pas de style dédié                                                                                |
| `disabled` | `peer-disabled: cursor-not-allowed opacity-disabled` — lorsque le contrôle associé est `disabled` |
| `loading`  | Non applicable                                                                                    |
| `error`    | Pas de style propre — c'est `FieldError` qui porte la couleur d'erreur                            |

## Accessibilité

**Pattern** : Élément natif `label` (Radix Label)

**Rôle** : `label` natif associé à un contrôle par `htmlFor` ; cliquer le label active le contrôle.

**Clavier** :

Aucune interaction clavier propre.

**Nom accessible** : Le texte du label nomme le contrôle associé.

**Vigilance** :

- `htmlFor` doit correspondre à l'`id` du contrôle ; un label non associé ne nomme rien.
- Le label reste visible : ne pas le remplacer par un `placeholder`.

## Exemple de code

```tsx
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export default function Example() {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="password">Mot de passe</Label>
      <Input id="password" type="password" />
    </div>
  )
}
```

## Références croisées

- `Field` — wrapper qui coordonne label et contrôle
- `Input` — contrôle le plus courant associé à Label
- `Checkbox` — nécessite un Label pour l'accessibilité
- `FieldLegend` — alternative pour groupes de contrôles (`fieldset`)
