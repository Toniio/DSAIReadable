# Accordion

## Metadata

| Champ         | Valeur                      |
| ------------- | --------------------------- |
| Nom           | Accordion                   |
| Catégorie     | Navigation                  |
| Statut        | stable                      |
| figma_node_id |                             |
| code_path     | components/ui/accordion.tsx |

## Rôle

Composant de navigation verticale permettant d'afficher et masquer des sections de contenu via des panneaux repliables.

## Usage

- Organiser du contenu long en sections repliables (FAQ, documentation)
- Afficher des détails progressivement sans surcharger la vue initiale
- Regrouper des paramètres ou options par catégorie
- Présenter des questions/réponses dans un format compact
- Naviguer dans une arborescence de contenu hiérarchique

## Contraintes

- **MUST NOT** — porter un contenu critique qui doit rester visible en permanence
- **MUST NOT** — imbriquer un `Accordion` dans un autre : un seul niveau
- **MUST** — donner au trigger un texte explicite, jamais une icône seule
- **Note** — l'état `disabled` d'un trigger supprime les événements pointer et applique `opacity-disabled`
- **MUST NOT** — servir de navigation principale → utiliser `NavigationMenu` ou `Tabs`

## Dépendances

- `Accordion` (Root, Item, Header, Trigger, Content) de `radix-ui`
- `CaretDownIcon`, `CaretUpIcon` de `@phosphor-icons/react`

## Anatomie

| Slot                                 | Rôle                                         |
| ------------------------------------ | -------------------------------------------- |
| `data-slot="accordion"`              | Racine du composant, conteneur flex vertical |
| `data-slot="accordion-item"`         | Élément individuel avec bordure inférieure   |
| `data-slot="accordion-trigger"`      | Bouton déclencheur d'ouverture/fermeture     |
| `data-slot="accordion-trigger-icon"` | Icône chevron indiquant l'état ouvert/fermé  |
| `data-slot="accordion-content"`      | Zone de contenu animée en accordéon          |

## Tokens utilisés

<!-- Généré par scripts/build-spec-tokens.ts depuis le code du composant — ne pas éditer à la main. -->

| Token                           | Classes et variables                     | Où                                                                        |
| ------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------- |
| `border-width.default`          | `border` · `border-b`                    | `AccordionItem` · `AccordionTrigger`                                      |
| `color.border.focus`            | `border-ring` · `ring-ring/50`           | `AccordionTrigger` · `AccordionTrigger` via `FOCUS_RING` (`lib/focus.ts`) |
| `color.text.default`            | `text-foreground`                        | `AccordionContent`                                                        |
| `color.text.subtle`             | `text-muted-foreground`                  | `AccordionTrigger`                                                        |
| `opacity.disabled`              | `opacity-disabled`                       | `AccordionTrigger`                                                        |
| `space.focus-ring-width`        | `ring-(length:--space-focus-ring-width)` | `AccordionTrigger` via `FOCUS_RING` (`lib/focus.ts`)                      |
| `typography.font-weight.medium` | `font-medium`                            | `AccordionTrigger`                                                        |
| `typography.size.xs`            | `text-xs`                                | `AccordionContent` · `AccordionTrigger`                                   |

Relevé dans `components/ui/accordion.tsx` et les constantes de `lib/` qu'il importe ; chaque classe est résolue par Tailwind jusqu'au token sémantique. **Où** : sous-composant, chemin de variante `cva` ou constante d'origine. Les classes qui ne lisent aucun token (espacement `p-2`, tailles, mise en page) n'y figurent pas.

## Props / API

<!-- Généré par scripts/build-spec-api.ts depuis les exports TypeScript. Seules les descriptions s'éditent à la main : elles sont conservées. -->

### `Accordion`

Rend `AccordionPrimitive.Root`.

| Prop            | Type                                                       | Défaut  | Description                                                 |
| --------------- | ---------------------------------------------------------- | ------- | ----------------------------------------------------------- |
| `type`          | `"single" \| "multiple"`                                   | —       | Mode d'ouverture : un seul ou plusieurs panneaux simultanés |
| `value`         | `string \| string[]`                                       | —       | Valeur(s) du/des panneau(x) ouvert(s) (contrôlé)            |
| `defaultValue`  | `string \| string[]`                                       | —       | Valeur(s) initiale(s) du/des panneau(x) ouvert(s)           |
| `onValueChange` | `((value: string) => void) \| ((value: string[]) => void)` | —       | Callback lors du changement de panneau ouvert               |
| `collapsible`   | `boolean`                                                  | `false` | Permet de refermer tous les panneaux (mode `single`)        |
| `disabled`      | `boolean`                                                  | `false` | Désactive tous les triggers de l'accordéon                  |
| `className`     | `string`                                                   | —       | Classes CSS additionnelles sur la racine                    |
| `...props`      | `React.ComponentProps<typeof AccordionPrimitive.Root>`     | —       | Props de `AccordionPrimitive.Root`                          |

### `AccordionItem`

Rend `AccordionPrimitive.Item`.

| Prop       | Type                                                   | Défaut | Description                        |
| ---------- | ------------------------------------------------------ | ------ | ---------------------------------- |
| `...props` | `React.ComponentProps<typeof AccordionPrimitive.Item>` | —      | Props de `AccordionPrimitive.Item` |

### `AccordionTrigger`

Rend `AccordionPrimitive.Trigger`.

| Prop       | Type                                                      | Défaut | Description                           |
| ---------- | --------------------------------------------------------- | ------ | ------------------------------------- |
| `...props` | `React.ComponentProps<typeof AccordionPrimitive.Trigger>` | —      | Props de `AccordionPrimitive.Trigger` |

### `AccordionContent`

Rend `AccordionPrimitive.Content`.

| Prop       | Type                                                      | Défaut | Description                           |
| ---------- | --------------------------------------------------------- | ------ | ------------------------------------- |
| `...props` | `React.ComponentProps<typeof AccordionPrimitive.Content>` | —      | Props de `AccordionPrimitive.Content` |

<!-- Fin de la partie générée. -->

## Variantes

<!-- Généré par scripts/build-spec-variants.ts depuis mcp-server/context/component-variants.json — ne pas éditer à la main. -->

Aucun axe de variante : le composant n'appelle pas `cva()`. Son apparence se règle par ses props et, en dernier recours, par `className` avec des classes de tokens.

## États

| État     | Description                                                           |
| -------- | --------------------------------------------------------------------- |
| default  | Panneau fermé, icône chevron vers le bas                              |
| hover    | Soulignement du texte du trigger                                      |
| focus    | Anneau `ring-1 ring-ring/50` + bordure `border-ring` sur le trigger   |
| active   | Panneau ouvert, icône chevron vers le haut, contenu animé vers le bas |
| disabled | `pointer-events-none`, `opacity-disabled` — interaction impossible    |

## Accessibilité

**Pattern** : [Accordion](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/) (Radix Accordion)

**Rôle** : Chaque déclencheur est un `button` dans un titre, avec `aria-expanded` et `aria-controls` ; chaque panneau est une `region` étiquetée par son déclencheur.

**Clavier** :

| Touche                  | Action                                                    |
| ----------------------- | --------------------------------------------------------- |
| `Enter` / `Space`       | Ouvre ou ferme le panneau du déclencheur focalisé         |
| `ArrowDown` / `ArrowUp` | Déclencheur suivant / précédent                           |
| `Home` / `End`          | Premier / dernier déclencheur                             |
| `Tab`                   | Sort des déclencheurs vers le contenu focalisable suivant |

**Nom accessible** : Le texte de `AccordionTrigger` nomme le bouton et étiquette le panneau : il doit décrire le contenu, pas « Voir plus ».

**Vigilance** :

- Ne pas placer d'élément interactif dans `AccordionTrigger` : un bouton ne peut pas en contenir un autre.
- Le niveau de titre qui enveloppe le déclencheur doit s'inscrire dans la hiérarchie de la page.

## Exemple de code

```tsx
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"

export default function Example() {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger>Section 1</AccordionTrigger>
        <AccordionContent>Contenu de la première section.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Section 2</AccordionTrigger>
        <AccordionContent>Contenu de la deuxième section.</AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
```

## Références croisées

- `Tabs` — alternative pour du contenu mutuellement exclusif affiché horizontalement
- `NavigationMenu` — pour une navigation structurée avec sous-menus
- `Collapsible` — pour un seul panneau repliable sans structure d'accordéon
