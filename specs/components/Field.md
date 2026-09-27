# Field

## Metadata

| Champ         | Valeur                  |
| ------------- | ----------------------- |
| Nom           | Field                   |
| Catégorie     | Forms                   |
| Statut        | stable                  |
| figma_node_id |                         |
| code_path     | components/ui/field.tsx |

## Rôle

Système de mise en page pour les champs de formulaire, gérant l'association Label/contrôle, la propagation de l'état invalide, les textes d'aide et les messages d'erreur.

## Usage

- Encapsuler chaque paire `FieldLabel` + contrôle dans un `<Field>` pour la cohérence et la gestion d'erreur
- Regrouper plusieurs `<Field>` dans un `<FieldGroup>` pour espacer uniformément les champs
- Utiliser `<FieldSet>` + `<FieldLegend>` pour les groupes sémantiques de contrôles (ex. : choix multiples)
- Passer `data-invalid="true"` sur `<Field>` pour basculer le champ en couleur d'erreur
- Utiliser `<FieldDescription>` pour un texte d'aide permanent et `<FieldError>` pour un message de validation
- Choisir l'orientation `horizontal` pour les formulaires compacts, `responsive` pour basculer de `vertical` à `horizontal` au conteneur `@md`
- Envelopper le texte d'une option (`FieldTitle` + `FieldDescription`) dans un `<FieldContent>` lorsque le contrôle est à gauche

## Contraintes

- Ne pas imbriquer des `<FieldSet>` sur plus de 2 niveaux — complexité cognitive
- `data-invalid` doit être géré côté consommateur (validation côté serveur ou client)
- `aria-invalid` doit être posé sur le contrôle lui-même : `<Field>` ne le propage pas
- L'orientation `horizontal` n'est pas recommandée sur mobile (largeur < 640 px) — préférer `responsive`
- L'orientation `responsive` exige un `<FieldGroup>` parent : elle s'appuie sur le conteneur `@container/field-group`
- `<FieldLegend variant="legend">` est réservé aux `<fieldset>` ; utiliser `variant="label"` pour les contextes non-fieldset
- `<FieldError>` ne rend rien si ni `children` ni `errors` non vide ne sont fournis
- `<FieldTitle>` n'est pas un `<label>` : il ne lie pas de contrôle. Pour une association `htmlFor`, utiliser `<FieldLabel>`

## Dépendances

- `Label` — primitive sur laquelle `FieldLabel` est construit
- `Separator` — rendu par `FieldSeparator`
- `Input` / `Checkbox` / `RadioGroup` / tout contrôle — slot contrôle de `Field`
- `class-variance-authority` pour les variantes d'orientation de `Field`

## Anatomie

| Slot                                  | Rôle                                                                                         |
| ------------------------------------- | -------------------------------------------------------------------------------------------- |
| `data-slot="field-set"`               | `<fieldset>` racine, regroupe des champs liés sémantiquement                                 |
| `data-slot="field-legend"`            | `<legend>` du fieldset, titre du groupe, porte `data-variant`                                |
| `data-slot="field-group"`             | `<div>` conteneur vertical espacé (`gap-5`), définit le conteneur `@container/field-group`   |
| `data-slot="field"`                   | `<div role="group">` principal d'un champ, porte `data-orientation` et reçoit `data-invalid` |
| `data-slot="field-label"`             | `<label>` du champ (`FieldLabel`) ou titre non interactif (`FieldTitle`)                     |
| `data-slot="field-content"`           | `<div>` colonne de texte (titre + description) à côté d'un contrôle                          |
| `data-slot="field-description"`       | `<p>` texte d'aide sous le contrôle                                                          |
| `data-slot="field-error"`             | `<div role="alert">` message d'erreur de validation                                          |
| `data-slot="field-separator"`         | `<div>` séparateur entre groupes, porte `data-content`                                       |
| `data-slot="field-separator-content"` | `<span>` libellé centré sur le séparateur                                                    |

## Tokens utilisés

<!-- Généré par scripts/build-spec-tokens.ts depuis le code du composant — ne pas éditer à la main. -->

| Token                             | Classes et variables                                                                          | Où                                                                                  |
| --------------------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `border-width.default`            | `border`                                                                                      | `FieldLabel`                                                                        |
| `color.action.background.default` | `bg-primary/10` · `bg-primary/5` · `border-primary/20` · `border-primary/30` · `text-primary` | `FieldDescription` · `FieldLabel`                                                   |
| `color.background.default`        | `bg-background`                                                                               | `FieldSeparator`                                                                    |
| `color.feedback.error.default`    | `text-destructive`                                                                            | `FieldError` · `fieldVariants`                                                      |
| `color.text.subtle`               | `text-muted-foreground`                                                                       | `FieldDescription` · `FieldSeparator`                                               |
| `typography.font-weight.medium`   | `font-medium`                                                                                 | `FieldLegend`                                                                       |
| `typography.font-weight.normal`   | `font-normal`                                                                                 | `FieldDescription` · `FieldError`                                                   |
| `typography.line-height.normal`   | `leading-normal`                                                                              | `FieldDescription`                                                                  |
| `typography.line-height.relaxed`  | `text-xs/relaxed`                                                                             | `FieldDescription` · `FieldTitle`                                                   |
| `typography.line-height.snug`     | `leading-snug`                                                                                | `FieldContent` · `FieldLabel`                                                       |
| `typography.size.sm`              | `text-sm`                                                                                     | `FieldLegend`                                                                       |
| `typography.size.xs`              | `text-xs` · `text-xs/relaxed`                                                                 | `FieldDescription` · `FieldError` · `FieldLegend` · `FieldSeparator` · `FieldTitle` |

Relevé dans `components/ui/field.tsx` et les constantes de `lib/` qu'il importe ; chaque classe est résolue par Tailwind jusqu'au token sémantique. **Où** : sous-composant, chemin de variante `cva` ou constante d'origine. Les classes qui ne lisent aucun token (espacement `p-2`, tailles, mise en page) n'y figurent pas.

Compose `Label`, `Separator` : les tokens de ces composants sont listés dans leurs specs.

## Props / API

<!-- Généré par scripts/build-spec-api.ts depuis les exports TypeScript. Seules les descriptions s'éditent à la main : elles sont conservées. -->

### `Field`

Rend `<div>`.

| Prop           | Type                                         | Défaut       | Description                                                                |
| -------------- | -------------------------------------------- | ------------ | -------------------------------------------------------------------------- |
| `orientation`  | `"vertical" \| "horizontal" \| "responsive"` | `"vertical"` | Disposition label/contrôle, exposée en `data-orientation`                  |
| `data-invalid` | —                                            | —            | Attribut posé par le consommateur : bascule le champ en `text-destructive` |
| `className`    | `string`                                     | —            | Classes CSS additionnelles                                                 |
| `...props`     | `React.ComponentProps<"div">`                | —            | Props natives de `<div>`                                                   |

### `FieldLabel`

Rend `Label`.

| Prop        | Type                                 | Défaut | Description                     |
| ----------- | ------------------------------------ | ------ | ------------------------------- |
| `htmlFor`   | `string`                             | —      | Identifiant du contrôle associé |
| `className` | `string`                             | —      | Classes CSS additionnelles      |
| `...props`  | `React.ComponentProps<typeof Label>` | —      | Props de `Label`                |

### `FieldDescription`

Rend `<p>`.

| Prop        | Type                        | Défaut | Description                |
| ----------- | --------------------------- | ------ | -------------------------- |
| `className` | `string`                    | —      | Classes CSS additionnelles |
| `...props`  | `React.ComponentProps<"p">` | —      | Props natives de `<p>`     |

### `FieldError`

Rend `<div>`.

| Prop        | Type                                       | Défaut | Description                                                                               |
| ----------- | ------------------------------------------ | ------ | ----------------------------------------------------------------------------------------- |
| `errors`    | `Array<{ message?: string } \| undefined>` | —      | Erreurs de validation ; dédupliquées par `message`, rendues en `<ul>` au-delà d'une seule |
| `children`  | `ReactNode`                                | —      | Message explicite ; prioritaire sur `errors`                                              |
| `className` | `string`                                   | —      | Classes CSS additionnelles                                                                |
| `...props`  | `React.ComponentProps<"div">`              | —      | Props natives de `<div>`                                                                  |

### `FieldGroup`

Rend `<div>`.

| Prop        | Type                          | Défaut | Description                |
| ----------- | ----------------------------- | ------ | -------------------------- |
| `className` | `string`                      | —      | Classes CSS additionnelles |
| `...props`  | `React.ComponentProps<"div">` | —      | Props natives de `<div>`   |

### `FieldLegend`

Rend `<legend>`.

| Prop        | Type                             | Défaut     | Description                                                            |
| ----------- | -------------------------------- | ---------- | ---------------------------------------------------------------------- |
| `variant`   | `"legend" \| "label"`            | `"legend"` | Style typographique, exposé en `data-variant` (`text-sm` vs `text-xs`) |
| `className` | `string`                         | —          | Classes CSS additionnelles                                             |
| `...props`  | `React.ComponentProps<"legend">` | —          | Props natives de `<legend>`                                            |

### `FieldSeparator`

Rend `<div>`.

| Prop        | Type                          | Défaut | Description                                            |
| ----------- | ----------------------------- | ------ | ------------------------------------------------------ |
| `children`  | `React.ReactNode`             | —      | Libellé centré sur la ligne ; renseigne `data-content` |
| `className` | `string`                      | —      | Classes CSS additionnelles                             |
| `...props`  | `React.ComponentProps<"div">` | —      | Props natives de `<div>`                               |

### `FieldSet`

Rend `<fieldset>`.

| Prop        | Type                               | Défaut | Description                   |
| ----------- | ---------------------------------- | ------ | ----------------------------- |
| `className` | `string`                           | —      | Classes CSS additionnelles    |
| `...props`  | `React.ComponentProps<"fieldset">` | —      | Props natives de `<fieldset>` |

### `FieldContent`

Rend `<div>`.

| Prop        | Type                          | Défaut | Description                |
| ----------- | ----------------------------- | ------ | -------------------------- |
| `className` | `string`                      | —      | Classes CSS additionnelles |
| `...props`  | `React.ComponentProps<"div">` | —      | Props natives de `<div>`   |

### `FieldTitle`

Rend `<div>`.

| Prop        | Type                          | Défaut | Description                |
| ----------- | ----------------------------- | ------ | -------------------------- |
| `className` | `string`                      | —      | Classes CSS additionnelles |
| `...props`  | `React.ComponentProps<"div">` | —      | Props natives de `<div>`   |

<!-- Fin de la partie générée. -->

## Variantes

<!-- Généré par scripts/build-spec-variants.ts depuis mcp-server/context/component-variants.json — ne pas éditer à la main. -->

| Composant | Axe           | Valeurs                                  | Défaut     |
| --------- | ------------- | ---------------------------------------- | ---------- |
| `Field`   | `orientation` | `vertical` · `horizontal` · `responsive` | `vertical` |

Le sens de chaque axe (apparence, intention, taille…) est donné dans **Props / API**.

## États

| État       | Comportement visuel                                                                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `default`  | Label et contrôle en couleurs par défaut ; `FieldDescription` en `text-muted-foreground`                                                                |
| `hover`    | Pas de style dédié sur le Field ; les liens de `FieldDescription` passent en couleur d'action                                                           |
| `focus`    | Géré par le contrôle enfant                                                                                                                             |
| `active`   | `FieldLabel` enveloppant un contrôle coché (`has-data-checked`) reçoit bordure et fond teintés                                                          |
| `disabled` | `data-disabled="true"` sur `<Field>` : `FieldLabel` et `FieldTitle` passent à 50 % d'opacité                                                            |
| `loading`  | Non applicable au niveau Field                                                                                                                          |
| `error`    | `data-invalid="true"` sur `<Field>` : le champ passe en `text-destructive` ; `FieldError` rend un `role="alert"` ; poser `aria-invalid` sur le contrôle |

## Accessibilité

**Pattern** : Groupe de champ de formulaire

**Rôle** : `Field` porte `role="group"` ; `FieldSet` / `FieldLegend` rendent `fieldset` / `legend` ; `FieldError` porte `role="alert"`.

**Clavier** :

Aucune interaction propre ; le contrôle contenu garde son comportement clavier.

**Nom accessible** : `FieldLabel` doit être associé au contrôle (`htmlFor` / `id`). Un groupe de cases à cocher ou de radios se nomme par `FieldLegend`.

**Vigilance** :

- Relier `FieldDescription` et `FieldError` au contrôle par `aria-describedby` : le composant ne le fait pas seul.
- Poser `aria-invalid` sur le contrôle en erreur ; `FieldError` annonce le message à son apparition.
- Ne pas remplacer le label par le `placeholder`.

## Exemple de code

```tsx
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export default function Example() {
  return (
    <FieldGroup>
      <Field data-invalid="true">
        <FieldLabel htmlFor="email">Email address</FieldLabel>
        <Input id="email" type="email" aria-invalid="true" />
        <FieldDescription>We only use it to send receipts.</FieldDescription>
        <FieldError>Enter a valid email address.</FieldError>
      </Field>
    </FieldGroup>
  )
}
```

## Références croisées

- `Label` — primitive sous-jacente de `FieldLabel`
- `Input` / `Checkbox` / `RadioGroup` — contrôles disposés par `Field`
- `Separator` — rendu par `FieldSeparator`
- `Button` / `Textarea` / `Select` — autres contrôles couramment disposés dans un `Field`
