# Tabs

## Metadata

| Champ         | Valeur                 |
| ------------- | ---------------------- |
| Nom           | Tabs                   |
| Catégorie     | Navigation             |
| Statut        | stable                 |
| figma_node_id |                        |
| code_path     | components/ui/tabs.tsx |

## Rôle

Composant de navigation par onglets permettant d'alterner entre des panneaux de contenu mutuellement exclusifs, disponible en orientation horizontale ou verticale et en variante par défaut ou ligne.

## Usage

- Organiser du contenu connexe en panneaux accessibles par onglets
- Alterner entre des vues différentes sans changement de page (ex. : Aperçu / Code)
- Regrouper des formulaires ou paramètres par catégorie avec des onglets verticaux
- Proposer une navigation par onglets avec indicateur de ligne active (variante `line`)
- Afficher du contenu conditionnel dans un espace restreint

## Contraintes

- Ne pas utiliser pour de la navigation entre pages distinctes — préférer `NavigationMenu`
- Limiter le nombre d'onglets à 5-7 par groupe pour la lisibilité
- Un seul onglet actif à la fois — pour du contenu cumulatif, préférer `Accordion`
- L'état `disabled` sur un trigger supprime les événements pointer et réduit l'opacité
- Le contenu de chaque panneau doit être autosuffisant (pas de dépendance entre onglets)

## Dépendances

- `Tabs` (Root, List, Trigger, Content) de `radix-ui`
- `class-variance-authority` pour les variantes de `TabsList` (`tabsListVariants`)

## Anatomie

| Slot                       | Rôle                                          |
| -------------------------- | --------------------------------------------- |
| `data-slot="tabs"`         | Racine du composant, porte `data-orientation` |
| `data-slot="tabs-list"`    | Conteneur des onglets, porte `data-variant`   |
| `data-slot="tabs-trigger"` | Onglet individuel cliquable                   |
| `data-slot="tabs-content"` | Panneau de contenu associé à un onglet        |

## Tokens utilisés

<!-- Généré par scripts/build-spec-tokens.ts depuis le code du composant — ne pas éditer à la main. -->

| Token                            | Classes et variables                                       | Où                                                                                                      |
| -------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `border-width.default`           | `border`                                                   | `TabsTrigger`                                                                                           |
| `color.background.default`       | `bg-background`                                            | `TabsTrigger`                                                                                           |
| `color.background.subtle`        | `bg-muted`                                                 | `tabsListVariants.variant.default`                                                                      |
| `color.border.focus`             | `border-ring` · `outline-ring` · `ring-ring/50`            | `TabsContent` via `FOCUS_RING` (`lib/focus.ts`) · `TabsTrigger`                                         |
| `color.border.input`             | `bg-input/30` · `border-input`                             | `TabsTrigger`                                                                                           |
| `color.text.default`             | `bg-foreground` · `text-foreground` · `text-foreground/60` | `TabsTrigger`                                                                                           |
| `color.text.subtle`              | `text-muted-foreground`                                    | `TabsTrigger` · `tabsListVariants`                                                                      |
| `space.focus-ring-width`         | `ring-(length:--space-focus-ring-width)`                   | `TabsContent` via `FOCUS_RING` (`lib/focus.ts`) · `TabsTrigger` via `FOCUS_RING_WIDTH` (`lib/focus.ts`) |
| `typography.font-weight.medium`  | `font-medium`                                              | `TabsTrigger`                                                                                           |
| `typography.line-height.relaxed` | `text-xs/relaxed`                                          | `TabsContent`                                                                                           |
| `typography.size.xs`             | `text-xs` · `text-xs/relaxed`                              | `TabsContent` · `TabsTrigger`                                                                           |

Relevé dans `components/ui/tabs.tsx` et les constantes de `lib/` qu'il importe ; chaque classe est résolue par Tailwind jusqu'au token sémantique. **Où** : sous-composant, chemin de variante `cva` ou constante d'origine. Les classes qui ne lisent aucun token (espacement `p-2`, tailles, mise en page) n'y figurent pas.

## Props / API

| Prop            | Type                                       | Défaut         | Description                               |
| --------------- | ------------------------------------------ | -------------- | ----------------------------------------- |
| `orientation`   | `"horizontal" \| "vertical"`               | `"horizontal"` | Orientation de la disposition des onglets |
| `value`         | `string`                                   | —              | Onglet actif (contrôlé)                   |
| `defaultValue`  | `string`                                   | —              | Onglet actif par défaut                   |
| `onValueChange` | `(value: string) => void`                  | —              | Callback lors du changement d'onglet      |
| `variant`       | `"default" \| "line"`                      | `"default"`    | Variante visuelle de `TabsList`           |
| `className`     | `string`                                   | —              | Classes CSS additionnelles                |
| `...props`      | `React.ComponentProps<TabsPrimitive.Root>` | —              | Props natives Radix Tabs                  |

> **Axes de variantes** — `Tabs` n'a pas de `variant`. Seul `TabsList` en porte un, sur l'axe **apparence** : `default` dessine un conteneur plein, `line` un simple soulignement de l'onglet actif. Les deux décrivent le même comportement de navigation.

## Variantes

<!-- Généré par scripts/build-spec-variants.ts depuis mcp-server/context/component-variants.json — ne pas éditer à la main. -->

| Composant  | Axe       | Valeurs            | Défaut    |
| ---------- | --------- | ------------------ | --------- |
| `TabsList` | `variant` | `default` · `line` | `default` |

Le sens de chaque axe (apparence, intention, taille…) est donné dans **Props / API**.

## États

| État     | Description                                                                               |
| -------- | ----------------------------------------------------------------------------------------- |
| default  | Onglets inactifs en `text-foreground/60`, fond `bg-muted` sur la liste                    |
| hover    | Texte passe à `text-foreground` sur le trigger survolé                                    |
| focus    | Anneau `ring-focus ring-ring/50` + bordure `border-ring` + outline                        |
| active   | Fond `bg-background`, texte `text-foreground`, barre indicateur visible (variante `line`) |
| disabled | `pointer-events-none`, `opacity-50` — interaction impossible                              |

## Accessibilité

**Pattern** : [Tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) (Radix Tabs)

**Rôle** : `tablist`, `tab` (`aria-selected`, `aria-controls`), `tabpanel`.

**Clavier** :

| Touche                     | Action                                                       |
| -------------------------- | ------------------------------------------------------------ |
| `Tab`                      | Entre dans la liste sur l'onglet actif, puis va au panneau   |
| `ArrowRight` / `ArrowLeft` | Onglet suivant / précédent, activé (orientation horizontale) |
| `ArrowDown` / `ArrowUp`    | Idem en orientation verticale                                |
| `Home` / `End`             | Premier / dernier onglet                                     |

**Nom accessible** : Le texte de chaque onglet ; nommer la `TabsList` (`aria-label`) si plusieurs listes d'onglets coexistent.

**Vigilance** :

- Activation automatique au déplacement : si l'affichage d'un panneau est coûteux, passer `activationMode="manual"`.
- Des onglets ne servent pas à naviguer entre des pages : pour cela, des liens.

## Exemple de code

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

export default function Example() {
  return (
    <Tabs defaultValue="apercu">
      <TabsList variant="line">
        <TabsTrigger value="apercu">Aperçu</TabsTrigger>
        <TabsTrigger value="code">Code</TabsTrigger>
        <TabsTrigger value="parametres">Paramètres</TabsTrigger>
      </TabsList>
      <TabsContent value="apercu">Contenu de l'aperçu.</TabsContent>
      <TabsContent value="code">Contenu du code.</TabsContent>
      <TabsContent value="parametres">Contenu des paramètres.</TabsContent>
    </Tabs>
  )
}
```

## Références croisées

- `Accordion` — alternative pour du contenu cumulatif (plusieurs sections ouvertes)
- `NavigationMenu` — navigation principale avec sous-menus déroulants
- `Card` — souvent utilisé comme conteneur du contenu d'un onglet
