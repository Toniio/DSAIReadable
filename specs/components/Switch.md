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
- Choix binaire on/off dans un formulaire de préférences
- Contrôle d'état avec effet immédiat (pas de soumission requise)
- Alternative visuelle à un checkbox unique

## Contraintes

- Ne pas utiliser pour des choix multiples — préférer `Checkbox`
- Ne pas utiliser pour un choix entre deux options nommées — préférer `RadioGroup`
- Toujours associer un `<Label>` pour l'accessibilité
- La zone de clic étendue (`after:absolute after:-inset-x-3 after:-inset-y-2`) est intégrée — ne pas ajouter de padding supplémentaire
- Requiert un conteneur `"use client"` (composant client-side)

## Dépendances

- `radix-ui` — `Switch` primitive (Root, Thumb)

## Anatomie

| Slot                       | Rôle                                        |
| -------------------------- | ------------------------------------------- |
| `data-slot="switch"`       | Racine de l'interrupteur, porte `data-size` |
| `data-slot="switch-thumb"` | Poignée coulissante de l'interrupteur       |

## Tokens utilisés

| Token                        | Usage                                                                  |
| ---------------------------- | ---------------------------------------------------------------------- |
| `--color-primary`            | Fond de l'interrupteur activé (`bg-primary`)                           |
| `--color-primary-foreground` | Thumb activé en mode dark (`bg-primary-foreground`)                    |
| `--color-input`              | Fond de l'interrupteur désactivé (`bg-input`)                          |
| `--color-background`         | Fond du thumb (`bg-background`)                                        |
| `--color-foreground`         | Thumb désactivé en mode dark (`bg-foreground`)                         |
| `--color-ring`               | Anneau de focus (`ring-ring/50`, `border-ring`)                        |
| `--color-destructive`        | Bordure et anneau erreur (`border-destructive`, `ring-destructive/20`) |

## Props / API

| Prop              | Type                                                | Défaut      | Description                                                  |
| ----------------- | --------------------------------------------------- | ----------- | ------------------------------------------------------------ |
| `size`            | `"sm" \| "default"`                                 | `"default"` | Taille de l'interrupteur (`h-5 w-8` default, `h-3.5 w-6` sm) |
| `checked`         | `boolean`                                           | —           | État contrôlé de l'interrupteur                              |
| `defaultChecked`  | `boolean`                                           | —           | État par défaut (non contrôlé)                               |
| `onCheckedChange` | `(checked: boolean) => void`                        | —           | Callback de changement d'état                                |
| `disabled`        | `boolean`                                           | `false`     | Désactive l'interrupteur                                     |
| `className`       | `string`                                            | —           | Classes CSS additionnelles                                   |
| `...props`        | `React.ComponentProps<typeof SwitchPrimitive.Root>` | —           | Props Radix Switch.Root                                      |

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
| disabled      | `cursor-not-allowed`, opacité réduite (`opacity-50`)                   |
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
