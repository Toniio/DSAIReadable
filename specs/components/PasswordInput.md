# PasswordInput

## Metadata

| Champ         | Valeur                           |
| ------------- | -------------------------------- |
| Nom           | PasswordInput                    |
| Catégorie     | Forms                            |
| Statut        | stable                           |
| figma_node_id |                                  |
| code_path     | components/ui/password-input.tsx |

## Rôle

Champ de saisie de mot de passe avec bouton de bascule de visibilité (œil ouvert / barré). Composition de `InputGroup`, `InputGroupInput` et `InputGroupButton`.

## Usage

- Formulaire de login
- Formulaire de création de compte
- Changement / réinitialisation de mot de passe

## Contraintes

- Toujours envelopper dans un `Field` avec un `FieldLabel` associé
- Ne pas utiliser pour des champs de texte classiques — préférer `Input`
- La prop `type` n'est pas acceptée : le composant la pilote lui-même
- Composant client (`"use client"`) — il porte l'état de visibilité
- Libellés de la bascule en anglais issus de `UI_STRINGS.passwordInput`

## Dépendances

- `InputGroup` — conteneur structurant
- `InputGroupInput` — l'input sous-jacent
- `InputGroupAddon` — zone du bouton toggle
- `InputGroupButton` — bouton ghost `icon-xs`
- `@phosphor-icons/react` (`Eye`, `EyeSlash`) — icônes exclusives

## Anatomie

| Slot                              | Rôle                                                  |
| --------------------------------- | ----------------------------------------------------- |
| `data-slot="input-group"`         | Conteneur racine                                      |
| `data-slot="input-group-control"` | Input, `type` piloté par l'état de visibilité         |
| `data-slot="input-group-addon"`   | Zone `align="inline-end"` du bouton toggle            |
| toggle button                     | Bouton `Eye` / `EyeSlash` avec `aria-label` dynamique |

## Tokens utilisés

| Token                  | Usage                                                     |
| ---------------------- | --------------------------------------------------------- |
| Hérités d'`InputGroup` | Bordure, fond, anneau de focus, état d'erreur             |
| `--muted-foreground`   | Couleur des icônes `Eye` / `EyeSlash`, portée par l'addon |

## Props / API

| Prop           | Type                                          | Défaut | Description                                               |
| -------------- | --------------------------------------------- | ------ | --------------------------------------------------------- |
| `id`           | `string`                                      | —      | ID pour l'association avec le label                       |
| `placeholder`  | `string`                                      | —      | Texte indicatif                                           |
| `autoComplete` | `string`                                      | —      | Hint navigateur (`current-password`, `new-password`)      |
| `className`    | `string`                                      | —      | Classes CSS additionnelles, appliquées sur l'`InputGroup` |
| `...props`     | `Omit<React.ComponentProps<"input">, "type">` | —      | Props natives de l'`<input>`, `type` exclu                |

## Variantes

<!-- Généré par scripts/build-spec-variants.ts depuis mcp-server/context/component-variants.json — ne pas éditer à la main. -->

Aucun axe de variante : le composant n'appelle pas `cva()`. Son apparence se règle par ses props et, en dernier recours, par `className` avec des classes de tokens.

## États

| État       | Comportement visuel                                                                          |
| ---------- | -------------------------------------------------------------------------------------------- |
| `default`  | Mot de passe masqué, icône `Eye`, libellé « Afficher le mot de passe »                       |
| `visible`  | Mot de passe en clair (`type="text"`), icône `EyeSlash`, libellé « Masquer le mot de passe » |
| `hover`    | Bouton toggle en survol ghost                                                                |
| `focus`    | Anneau de focus sur le conteneur, hérité d'`InputGroup`                                      |
| `active`   | Bascule de visibilité au clic, sans soumission du formulaire                                 |
| `disabled` | Opacité réduite et interactions bloquées, héritées d'`InputGroup`                            |
| `error`    | `aria-invalid="true"` : bordure et anneau `destructive`                                      |

## Accessibilité

**Pattern** : Champ natif `input` + bouton de visibilité

**Rôle** : `input` natif (`type="password"` ou `text`) ; un `button` bascule la visibilité.

**Clavier** :

| Touche            | Action                           |
| ----------------- | -------------------------------- |
| `Tab`             | Du champ au bouton de visibilité |
| `Enter` / `Space` | Affiche / masque le mot de passe |

**Nom accessible** : Le champ s'étiquette comme un `Input`. Le bouton est nommé par `UI_STRINGS.passwordInput.show` / `.hide`, selon l'état.

**Vigilance** :

- Poser `autocomplete="current-password"` ou `"new-password"`.
- Afficher les règles du mot de passe avant la saisie, reliées par `aria-describedby`.

## Exemple de code

```tsx
import { Field, FieldLabel } from "@/components/ui/field"
import { PasswordInput } from "@/components/ui/password-input"

export default function Example() {
  return (
    <Field>
      <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
      <PasswordInput id="password" autoComplete="current-password" />
    </Field>
  )
}
```

## Références croisées

- `Field` — encadrement obligatoire (label, description, erreur)
- `InputGroup` — socle de composition du champ
- `Input` — à préférer pour tout champ non sensible
