# Switch

## Metadata

| Champ         | Valeur                   |
| ------------- | ------------------------ |
| Nom           | Switch                   |
| Catégorie     | Forms                    |
| Statut        | stable                   |
| figma_node_id |                          |
| code_path     | components/ui/switch.tsx |

## Rôle

Interrupteur à bascule pour activer ou désactiver un paramètre binaire, avec retour visuel immédiat.

## Usage

- Activation/désactivation d'un paramètre (ex. : notifications, mode sombre)
- Choix binaire on/off dans un formulaire de réglages
- Contrôle d'état avec effet immédiat (pas de soumission requise)
- Alternative visuelle à un checkbox unique

## Contraintes

- **MUST NOT** — servir à des choix multiples → utiliser `Checkbox`
- **MUST NOT** — servir à choisir entre deux options nommées → utiliser `RadioGroup`
- **MUST** — associer un `Label`
- **MUST NOT** — ajouter de padding pour agrandir la zone de clic : elle est déjà étendue (`after:-inset-x-3 after:-inset-y-2`)
- **MUST NOT** — lui passer une fonction (callback, gestionnaire d'événement) depuis un composant serveur : c'est un composant client (`"use client"`), seules des props sérialisables lui parviennent d'un composant serveur

## Dépendances

- `radix-ui` — `Switch` primitive (Root, Thumb)

## Anatomie

| Slot                       | Rôle                                        |
| -------------------------- | ------------------------------------------- |
| `data-slot="switch"`       | Racine de l'interrupteur, porte `data-size` |
| `data-slot="switch-thumb"` | Poignée coulissante de l'interrupteur       |

## Tokens utilisés

<!-- Généré par scripts/build-spec-tokens.ts depuis le code du composant — ne pas éditer à la main. -->

| Token                                | Classes et variables                                                                           | Où                                                    |
| ------------------------------------ | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `border-width.default`               | `border`                                                                                       | `Switch`                                              |
| `color.action.background.default`    | `bg-primary`                                                                                   | `Switch`                                              |
| `color.action.background.foreground` | `bg-primary-foreground`                                                                        | `Switch`                                              |
| `color.background.default`           | `bg-background`                                                                                | `Switch`                                              |
| `color.border.focus`                 | `border-ring` · `ring-ring/50`                                                                 | `Switch` via `FOCUS_RING` (`lib/focus.ts`)            |
| `color.border.input`                 | `bg-input` · `bg-input/80`                                                                     | `Switch`                                              |
| `color.feedback.error.default`       | `border-destructive` · `border-destructive/50` · `ring-destructive/20` · `ring-destructive/40` | `Switch`                                              |
| `color.text.default`                 | `bg-foreground`                                                                                | `Switch`                                              |
| `opacity.disabled`                   | `opacity-disabled`                                                                             | `Switch`                                              |
| `space.focus-ring-width`             | `ring-(length:--space-focus-ring-width)`                                                       | `Switch` · `Switch` via `FOCUS_RING` (`lib/focus.ts`) |

Relevé dans `components/ui/switch.tsx` et les constantes de `lib/` qu'il importe ; chaque classe est résolue par Tailwind jusqu'au token sémantique. **Où** : sous-composant, chemin de variante `cva` ou constante d'origine. Les classes qui ne lisent aucun token (espacement `p-2`, tailles, mise en page) n'y figurent pas.

## Props / API

<!-- Généré par scripts/build-spec-api.ts depuis les exports TypeScript. Seules les descriptions s'éditent à la main : elles sont conservées. -->

### `Switch`

Rend `SwitchPrimitive.Root`.

| Prop              | Type                                                | Défaut      | Description                                                  |
| ----------------- | --------------------------------------------------- | ----------- | ------------------------------------------------------------ |
| `size`            | `"sm" \| "default"`                                 | `"default"` | Taille de l'interrupteur (`h-5 w-8` default, `h-3.5 w-6` sm) |
| `checked`         | `boolean`                                           | —           | État contrôlé de l'interrupteur                              |
| `defaultChecked`  | `boolean`                                           | —           | État par défaut (non contrôlé)                               |
| `onCheckedChange` | `(checked: boolean) => void`                        | —           | Callback de changement d'état                                |
| `disabled`        | `boolean`                                           | `false`     | Désactive l'interrupteur                                     |
| `className`       | `string`                                            | —           | Classes CSS additionnelles                                   |
| `...props`        | `React.ComponentProps<typeof SwitchPrimitive.Root>` | —           | Props de `SwitchPrimitive.Root`                              |

<!-- Fin de la partie générée. -->

## Variantes

<!-- Généré par scripts/build-spec-variants.ts depuis mcp-server/context/component-variants.json — ne pas éditer à la main. -->

Aucun axe de variante : le composant n'appelle pas `cva()`. Son apparence se règle par ses props et, en dernier recours, par `className` avec des classes de tokens.

## États

| État          | Description                                                            |
| ------------- | ---------------------------------------------------------------------- |
| default (off) | Fond `input`, thumb à gauche (`translate-x-0`), bordure transparente   |
| default (on)  | Fond `primary`, thumb à droite (`translate-x-[calc(100%-2px)]`)        |
| hover         | — (pas de style hover spécifique)                                      |
| focus         | Bordure `ring` + anneau `ring-ring/50` via `focus-visible`             |
| active        | Transition du thumb entre les positions                                |
| disabled      | `cursor-not-allowed`, opacité réduite (`opacity-disabled`)             |
| error         | Bordure `destructive`, anneau `ring-destructive/20` via `aria-invalid` |

## Accessibilité

**Pattern** : [Switch](https://www.w3.org/WAI/ARIA/apg/patterns/switch/) (Radix Switch)

**Rôle** : `role="switch"` sur un `button`, `aria-checked`.

**Clavier** :

| Touche            | Action         |
| ----------------- | -------------- |
| `Space` / `Enter` | Bascule l'état |
| `Tab`             | Focus suivant  |

**Nom accessible** : Obligatoire : `Label` associé ou `aria-label`. Le label nomme le réglage, pas l'état (« Notifications », pas « Activé »).

**Vigilance** :

- Un interrupteur agit immédiatement ; si le réglage n'est appliqué qu'à l'envoi d'un formulaire, utiliser une `Checkbox`.

## Exemple de code

```tsx
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function Example() {
  return (
    <div className="flex items-center gap-2">
      <Switch id="notifications" defaultChecked />
      <Label htmlFor="notifications">Activer les notifications</Label>
    </div>
  )
}
```

## Références croisées

- `Label` — associé au switch pour l'accessibilité
- `Field` — encapsule le switch avec label et messages d'erreur
- `Checkbox` — alternative pour les choix multiples ou les formulaires
- `RadioGroup` — alternative pour les choix entre options nommées
- `Toggle` — alternative pour un bouton avec état pressé/non pressé
