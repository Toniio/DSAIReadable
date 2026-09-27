# Avatar

## Metadata

| Champ         | Valeur                   |
| ------------- | ------------------------ |
| Nom           | Avatar                   |
| Catégorie     | Misc                     |
| Statut        | stable                   |
| figma_node_id |                          |
| code_path     | components/ui/avatar.tsx |

## Rôle

Représentation visuelle d'un utilisateur ou d'une entité sous forme de photo, initiales ou icône, avec support de groupes et badges.

## Usage

- Afficher la photo de profil d'un utilisateur dans un en-tête ou une liste
- Montrer les initiales en fallback quand l'image n'est pas disponible
- Regrouper plusieurs avatars avec `AvatarGroup` pour une liste de participants
- Indiquer un statut (en ligne, notifications) via `AvatarBadge`
- Varier la taille selon le contexte (`sm` dans les listes, `lg` dans les profils)

## Contraintes

- **MUST** — fournir un `AvatarFallback`, affiché si l'image manque
- **MUST NOT** — utiliser `AvatarBadge` sans `aria-label` qui dit ce qu'il signale
- **MUST** — donner un `alt` descriptif à `AvatarImage`
- **MUST NOT** — afficher plus de 4 avatars dans un `AvatarGroup` : au-delà, montrer les 3 premiers et le reste dans `AvatarGroupCount`

## Dépendances

- `radix-ui` — `Avatar` primitive (Root, Image, Fallback)
- `cn` utilitaire depuis `@/lib/utils`

## Anatomie

| Slot                             | Rôle                                              |
| -------------------------------- | ------------------------------------------------- |
| `data-slot="avatar"`             | Racine de l'avatar, porte `data-size`             |
| `data-slot="avatar-image"`       | Image de profil (aspect-ratio carré, arrondi)     |
| `data-slot="avatar-fallback"`    | Contenu de remplacement (initiales, icône)        |
| `data-slot="avatar-badge"`       | Badge de statut positionné en bas à droite        |
| `data-slot="avatar-group"`       | Conteneur de groupe d'avatars (chevauchement)     |
| `data-slot="avatar-group-count"` | Compteur d'avatars supplémentaires dans un groupe |

## Tokens utilisés

<!-- Généré par scripts/build-spec-tokens.ts depuis le code du composant — ne pas éditer à la main. -->

| Token                                | Classes et variables      | Où                                                 |
| ------------------------------------ | ------------------------- | -------------------------------------------------- |
| `border-width.default`               | `border`                  | `Avatar`                                           |
| `color.action.background.default`    | `bg-primary`              | `AvatarBadge`                                      |
| `color.action.background.foreground` | `text-primary-foreground` | `AvatarBadge`                                      |
| `color.background.default`           | `ring-background`         | `AvatarBadge` · `AvatarGroupCount` · `AvatarGroup` |
| `color.background.subtle`            | `bg-muted`                | `AvatarFallback` · `AvatarGroupCount`              |
| `color.border.default`               | `border-border`           | `Avatar`                                           |
| `color.text.subtle`                  | `text-muted-foreground`   | `AvatarFallback` · `AvatarGroupCount`              |
| `typography.size.sm`                 | `text-sm`                 | `AvatarFallback`                                   |
| `typography.size.xs`                 | `text-xs`                 | `AvatarFallback` · `AvatarGroupCount`              |
| `zindex.dropdown`                    | `z-dropdown`              | `AvatarBadge`                                      |

Relevé dans `components/ui/avatar.tsx` et les constantes de `lib/` qu'il importe ; chaque classe est résolue par Tailwind jusqu'au token sémantique. **Où** : sous-composant, chemin de variante `cva` ou constante d'origine. Les classes qui ne lisent aucun token (espacement `p-2`, tailles, mise en page) n'y figurent pas.

## Props / API

<!-- Généré par scripts/build-spec-api.ts depuis les exports TypeScript. Seules les descriptions s'éditent à la main : elles sont conservées. -->

### `Avatar`

Rend `AvatarPrimitive.Root`.

| Prop        | Type                                                | Défaut      | Description                                          |
| ----------- | --------------------------------------------------- | ----------- | ---------------------------------------------------- |
| `size`      | `"default" \| "sm" \| "lg"`                         | `"default"` | Taille de l'avatar (`size-6` / `size-8` / `size-10`) |
| `className` | `string`                                            | —           | Classes CSS additionnelles                           |
| `...props`  | `React.ComponentProps<typeof AvatarPrimitive.Root>` | —           | Props de `AvatarPrimitive.Root`                      |

### `AvatarImage`

Rend `AvatarPrimitive.Image`.

| Prop        | Type                                                 | Défaut | Description                      |
| ----------- | ---------------------------------------------------- | ------ | -------------------------------- |
| `className` | `string`                                             | —      | Classes CSS additionnelles       |
| `...props`  | `React.ComponentProps<typeof AvatarPrimitive.Image>` | —      | Props de `AvatarPrimitive.Image` |

### `AvatarFallback`

Rend `AvatarPrimitive.Fallback`.

| Prop        | Type                                                    | Défaut | Description                         |
| ----------- | ------------------------------------------------------- | ------ | ----------------------------------- |
| `className` | `string`                                                | —      | Classes CSS additionnelles          |
| `...props`  | `React.ComponentProps<typeof AvatarPrimitive.Fallback>` | —      | Props de `AvatarPrimitive.Fallback` |

### `AvatarGroup`

Rend `<div>`.

| Prop        | Type                          | Défaut | Description                |
| ----------- | ----------------------------- | ------ | -------------------------- |
| `className` | `string`                      | —      | Classes CSS additionnelles |
| `...props`  | `React.ComponentProps<"div">` | —      | Props natives de `<div>`   |

### `AvatarGroupCount`

Rend `<div>`.

| Prop        | Type                          | Défaut | Description                |
| ----------- | ----------------------------- | ------ | -------------------------- |
| `className` | `string`                      | —      | Classes CSS additionnelles |
| `...props`  | `React.ComponentProps<"div">` | —      | Props natives de `<div>`   |

### `AvatarBadge`

Rend `<span>`.

| Prop        | Type                           | Défaut | Description                |
| ----------- | ------------------------------ | ------ | -------------------------- |
| `className` | `string`                       | —      | Classes CSS additionnelles |
| `...props`  | `React.ComponentProps<"span">` | —      | Props natives de `<span>`  |

<!-- Fin de la partie générée. -->

## Variantes

<!-- Généré par scripts/build-spec-variants.ts depuis mcp-server/context/component-variants.json — ne pas éditer à la main. -->

Aucun axe de variante : le composant n'appelle pas `cva()`. Son apparence se règle par ses props et, en dernier recours, par `className` avec des classes de tokens.

## États

| État         | Description                                                  |
| ------------ | ------------------------------------------------------------ |
| default      | Avatar affiché avec image ou fallback, taille `size-8`       |
| image-loaded | L'image est chargée, le fallback est masqué                  |
| image-error  | L'image échoue, le fallback (initiales) est affiché          |
| hover        | Non applicable directement (délégué aux parents interactifs) |
| focus        | Non applicable directement                                   |
| active       | Non applicable                                               |
| disabled     | Non applicable                                               |

## Accessibilité

**Pattern** : Image (`img`) avec repli textuel (Radix Avatar)

**Rôle** : `AvatarImage` rend une `img` ; `AvatarFallback` ne s'affiche que si l'image échoue ou est absente.

**Clavier** :

Aucune interaction clavier propre.

**Nom accessible** : `alt` obligatoire sur `AvatarImage` (le nom de la personne), ou `alt=""` si le nom est déjà écrit à côté.

**Vigilance** :

- Si le nom est affiché à côté, le repli (initiales) duplique l'information : le masquer avec `aria-hidden`.
- Un avatar cliquable doit être enveloppé dans un lien ou un bouton nommé, pas rendu cliquable directement.

## Exemple de code

```tsx
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarBadge,
  AvatarGroup,
  AvatarGroupCount,
} from "@/components/ui/avatar"

export default function Example() {
  return (
    <AvatarGroup>
      <Avatar size="default">
        <AvatarImage src="/user1.jpg" alt="Marie Dupont" />
        <AvatarFallback>MD</AvatarFallback>
        <AvatarBadge />
      </Avatar>
      <Avatar size="default">
        <AvatarImage src="/user2.jpg" alt="Jean Martin" />
        <AvatarFallback>JM</AvatarFallback>
      </Avatar>
      <AvatarGroupCount>+3</AvatarGroupCount>
    </AvatarGroup>
  )
}
```

## Références croisées

- `Item` — l'avatar est souvent utilisé comme `ItemMedia` dans une liste
- `DropdownMenu` — avatar comme déclencheur de menu utilisateur
- `Tooltip` — tooltip sur l'avatar pour afficher le nom complet
