# Spinner

## Metadata

| Champ         | Valeur                    |
| ------------- | ------------------------- |
| Nom           | Spinner                   |
| Catégorie     | Feedback                  |
| Statut        | stable                    |
| figma_node_id |                           |
| code_path     | components/ui/spinner.tsx |

## Rôle

Indicateur de chargement animé signalant qu'une opération asynchrone est en cours.

## Usage

- Indiquer l'état `loading` d'un `Button` pendant une soumission de formulaire
- Afficher l'attente d'une réponse réseau (authentification, chargement de données)
- Remplacer temporairement un contenu en cours de chargement (skeleton alternatif léger)
- Toujours accompagner d'un `aria-label` décrivant l'opération en cours

## Contraintes

- L'`aria-label` est obligatoire — la valeur par défaut `"Loading"` doit être remplacée par un libellé en français décrivant l'action (ex. : `"Connexion en cours"`)
- Ne pas afficher plusieurs Spinners simultanément dans la même zone de vue — utiliser un seul indicateur global
- La taille est contrôlée uniquement via `className` (ex. : `size-3`, `size-6`) — pas de prop `size` dédiée
- Ne pas utiliser pour des chargements de longue durée (> 10 s) — préférer une barre de progression avec pourcentage
- `role="status"` est déjà positionné ; ne pas en ajouter un second dans le parent
- Nom accessible par défaut en anglais issu de `UI_STRINGS.spinner` — surcharger via `aria-label`

## Dépendances

- `SpinnerIcon` de `@phosphor-icons/react` — fournit l'icône SVG animée
- `animate-spin` de Tailwind CSS — animation de rotation

## Anatomie

| Slot                 | Rôle                                                                               |
| -------------------- | ---------------------------------------------------------------------------------- |
| _(pas de data-slot)_ | `<svg>` rendu directement via `SpinnerIcon`, porte `role="status"` et `aria-label` |

## Tokens utilisés

| Token                      | Usage                                                                |
| -------------------------- | -------------------------------------------------------------------- |
| `--color-text-default`     | Couleur héritée du contexte parent (le SVG hérite de `currentColor`) |
| `--motion-duration-normal` | Durée de l'animation `animate-spin` (750 ms par défaut Tailwind)     |

## Props / API

| Prop         | Type                          | Défaut                  | Description                                                                       |
| ------------ | ----------------------------- | ----------------------- | --------------------------------------------------------------------------------- |
| `aria-label` | `string`                      | `"Loading"`             | Libellé accessible décrivant l'opération en cours — **obligatoire en production** |
| `className`  | `string`                      | `"size-4 animate-spin"` | Classes CSS pour surcharger la taille ou l'animation                              |
| `...props`   | `React.ComponentProps<"svg">` | —                       | Toutes les props natives `<svg>` (`role="status"` déjà défini)                    |

## Variantes

<!-- Généré par scripts/build-spec-variants.ts depuis mcp-server/context/component-variants.json — ne pas éditer à la main. -->

Aucun axe de variante : le composant n'appelle pas `cva()`. Son apparence se règle par ses props et, en dernier recours, par `className` avec des classes de tokens.

## États

| État       | Comportement visuel                                                                  |
| ---------- | ------------------------------------------------------------------------------------ |
| `default`  | SVG `size-4` en rotation continue (`animate-spin`), couleur héritée (`currentColor`) |
| `hover`    | Non applicable                                                                       |
| `focus`    | Non applicable                                                                       |
| `active`   | Non applicable                                                                       |
| `disabled` | Non applicable — masquer le Spinner quand l'opération est terminée                   |
| `loading`  | État unique et permanent du composant                                                |
| `error`    | Non applicable — masquer et afficher une `Alert` ou un `FieldError`                  |

## Accessibilité

**Pattern** : Statut (`role="status"`)

**Rôle** : `role="status"` avec `aria-label` = `UI_STRINGS.spinner.label` : annoncé poliment.

**Clavier** :

Aucune interaction.

**Nom accessible** : Le libellé par défaut (« Loading ») est en anglais : le remplacer par `aria-label`, qui prend le pas, et le préciser si utile (« Chargement des transactions »).

**Vigilance** :

- Un spinner dans un bouton ne remplace pas son nom : garder le texte du bouton ou mettre `aria-busy` sur le bouton.

## Exemple de code

```tsx
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

export default function Example() {
  const [isLoading, setIsLoading] = React.useState(false)

  return (
    <Button
      type="submit"
      disabled={isLoading}
      aria-busy={isLoading}
      onClick={() => setIsLoading(true)}
    >
      {isLoading ? (
        <>
          <Spinner aria-label="Connexion en cours" />
          Connexion…
        </>
      ) : (
        "Se connecter"
      )}
    </Button>
  )
}
```

## Références croisées

- `Button` — hôte principal du Spinner en état loading
- `Alert` — afficher après l'échec de l'opération signalée par le Spinner
- `Field` — désactiver les champs du formulaire (`disabled`) pendant le chargement
