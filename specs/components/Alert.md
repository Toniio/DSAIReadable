# Alert

## Metadata

| Champ         | Valeur                  |
| ------------- | ----------------------- |
| Nom           | Alert                   |
| Catégorie     | Feedback                |
| Statut        | stable                  |
| figma_node_id |                         |
| code_path     | components/ui/alert.tsx |

## Rôle

Bandeau de feedback non-modal affichant un message contextuel (informatif ou d'erreur) avec titre, description et action optionnelle.

## Usage

- Afficher une erreur d'authentification suite à une tentative de connexion échouée
- Informer l'utilisateur d'un état système (session expirée, erreur réseau)
- Présenter un avertissement avant une action irréversible
- Ajouter une icône SVG comme premier enfant pour renforcer le signal visuel

## Contraintes

- **MUST NOT** — afficher un message éphémère (toast) → utiliser `Sonner`
- **MUST NOT** — servir de dialogue bloquant → utiliser `AlertDialog`
- **MUST NOT** — placer plus d'une `Alert` par section de page
- L'attribut `role="alert"` est déjà positionné ; ne pas en ajouter un second dans les enfants
- `AlertAction` est positionné en absolu dans le coin supérieur droit ; ne pas y placer de contenu de largeur variable

## Dépendances

- Aucune dépendance de composant interne obligatoire
- `Button` — action typique dans `AlertAction`
- Icône SVG (Phosphor Icons) — enfant direct de `Alert` pour activer la mise en page bi-colonnes

## Anatomie

| Slot                            | Rôle                                                                |
| ------------------------------- | ------------------------------------------------------------------- |
| `data-slot="alert"`             | `<div>` racine avec `role="alert"`, porte la variante               |
| `data-slot="alert-title"`       | `<div>` titre en gras, passe en col-start-2 si icône présente       |
| `data-slot="alert-description"` | `<div>` description en couleur subtile (`text-muted-foreground`)    |
| `data-slot="alert-action"`      | `<div>` action positionnée en absolu en haut à droite               |
| _(icône implicite)_             | Premier enfant `<svg>` : couvre 2 lignes de grille, taille `size-4` |

## Tokens utilisés

<!-- Généré par scripts/build-spec-tokens.ts depuis le code du composant — ne pas éditer à la main. -->

| Token                            | Classes et variables                       | Où                                                                    |
| -------------------------------- | ------------------------------------------ | --------------------------------------------------------------------- |
| `border-width.default`           | `border`                                   | `alertVariants`                                                       |
| `color.background.subtle`        | `bg-card`                                  | `alertVariants.variant.default` · `alertVariants.variant.destructive` |
| `color.feedback.error.default`   | `text-destructive` · `text-destructive/90` | `alertVariants.variant.destructive`                                   |
| `color.text.default`             | `text-card-foreground` · `text-foreground` | `AlertDescription` · `AlertTitle` · `alertVariants.variant.default`   |
| `color.text.subtle`              | `text-muted-foreground`                    | `AlertDescription`                                                    |
| `typography.font-weight.medium`  | `font-medium`                              | `AlertTitle`                                                          |
| `typography.line-height.relaxed` | `text-xs/relaxed`                          | `AlertDescription`                                                    |
| `typography.size.xs`             | `text-xs` · `text-xs/relaxed`              | `AlertDescription` · `alertVariants`                                  |

Relevé dans `components/ui/alert.tsx` et les constantes de `lib/` qu'il importe ; chaque classe est résolue par Tailwind jusqu'au token sémantique. **Où** : sous-composant, chemin de variante `cva` ou constante d'origine. Les classes qui ne lisent aucun token (espacement `p-2`, tailles, mise en page) n'y figurent pas.

## Props / API

<!-- Généré par scripts/build-spec-api.ts depuis les exports TypeScript. Seules les descriptions s'éditent à la main : elles sont conservées. -->

### `Alert`

Rend `<div>`.

| Prop        | Type                          | Défaut      | Description                           |
| ----------- | ----------------------------- | ----------- | ------------------------------------- |
| `variant`   | `"default" \| "destructive"`  | `"default"` | Style visuel : informatif ou d'erreur |
| `className` | `string`                      | —           | Classes CSS additionnelles            |
| `...props`  | `React.ComponentProps<"div">` | —           | Props natives de `<div>`              |

### `AlertTitle`

Rend `<div>`.

| Prop        | Type                          | Défaut | Description                |
| ----------- | ----------------------------- | ------ | -------------------------- |
| `className` | `string`                      | —      | Classes CSS additionnelles |
| `...props`  | `React.ComponentProps<"div">` | —      | Props natives de `<div>`   |

### `AlertDescription`

Rend `<div>`.

| Prop        | Type                          | Défaut | Description                |
| ----------- | ----------------------------- | ------ | -------------------------- |
| `className` | `string`                      | —      | Classes CSS additionnelles |
| `...props`  | `React.ComponentProps<"div">` | —      | Props natives de `<div>`   |

### `AlertAction`

Rend `<div>`.

| Prop        | Type                          | Défaut | Description                |
| ----------- | ----------------------------- | ------ | -------------------------- |
| `className` | `string`                      | —      | Classes CSS additionnelles |
| `...props`  | `React.ComponentProps<"div">` | —      | Props natives de `<div>`   |

<!-- Fin de la partie générée. -->

## Variantes

<!-- Généré par scripts/build-spec-variants.ts depuis mcp-server/context/component-variants.json — ne pas éditer à la main. -->

| Composant | Axe       | Valeurs                   | Défaut    |
| --------- | --------- | ------------------------- | --------- |
| `Alert`   | `variant` | `default` · `destructive` | `default` |

Le sens de chaque axe (apparence, intention, taille…) est donné dans **Props / API**.

## États

| État          | Comportement visuel                                                                                |
| ------------- | -------------------------------------------------------------------------------------------------- |
| `default`     | Fond `bg-card`, texte `text-card-foreground`, bordure subtile                                      |
| `destructive` | Texte `text-destructive`, description à `text-destructive/90`, icône hérite de la couleur courante |
| `hover`       | Non applicable (composant non interactif)                                                          |
| `focus`       | Non applicable (sauf si `AlertAction` contient un `Button`)                                        |
| `active`      | Non applicable                                                                                     |
| `disabled`    | Non applicable                                                                                     |
| `loading`     | Non applicable                                                                                     |
| `error`       | Utiliser `variant="destructive"`                                                                   |

## Accessibilité

**Pattern** : Rôle `alert` (live region assertive)

**Rôle** : `role="alert"` sur la racine : le contenu est annoncé immédiatement par les lecteurs d'écran dès son insertion.

**Clavier** :

Aucune interaction clavier propre ; seuls les éléments interactifs placés dedans sont focalisables.

**Nom accessible** : Le titre (`AlertTitle`) et la description (`AlertDescription`) forment le message annoncé.

**Vigilance** :

- `role="alert"` interrompt la lecture en cours : réserver `Alert` aux messages importants apparus en réaction à l'utilisateur, pas à un encart statique présent au chargement.
- La variante `destructive` ne porte pas seule le sens : le texte doit dire qu'il s'agit d'une erreur (icône + mot, pas la couleur seule).

## Exemple de code

```tsx
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { WarningCircleIcon } from "@phosphor-icons/react"

export default function Example() {
  return (
    <Alert variant="destructive">
      <WarningCircleIcon />
      <AlertTitle>Identifiants incorrects</AlertTitle>
      <AlertDescription>
        Vérifiez votre adresse e-mail et votre mot de passe, puis réessayez.
      </AlertDescription>
    </Alert>
  )
}
```

## Références croisées

- `Card` — peut accueillir une `Alert` dans `CardContent`
- `Button` — action dans `AlertAction`
- `AlertDialog` — alternative modale bloquante
- `Toast` — alternative éphémère non persistante
