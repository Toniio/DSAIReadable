# Collapsible

## Metadata

| Champ         | Valeur                        |
| ------------- | ----------------------------- |
| Nom           | Collapsible                   |
| Catégorie     | Layout                        |
| Statut        | stable                        |
| figma_node_id |                               |
| code_path     | components/ui/collapsible.tsx |

## Rôle

Composant de divulgation qui permet d'afficher ou masquer une section de contenu via un déclencheur.

## Usage

- Afficher/masquer des détails supplémentaires dans un panneau latéral ou un formulaire
- Créer des sections repliables dans une FAQ ou une documentation
- Regrouper des options avancées sous un trigger « Plus d'options »
- Réduire la densité visuelle d'une page en masquant le contenu secondaire
- Permettre à l'utilisateur de contrôler la quantité d'information visible

## Contraintes

- Ne pas utiliser pour de la navigation multi-niveaux — préférer `Accordion` ou un menu arborescent
- Le trigger doit être clairement identifiable comme interactif (bouton ou élément cliquable)
- Le contenu masqué ne doit pas contenir d'éléments critiques pour la compréhension immédiate de la page
- Assurer que `aria-expanded` est correctement géré (Radix le fait automatiquement)

## Dépendances

- `Collapsible.Root`, `Collapsible.CollapsibleTrigger`, `Collapsible.CollapsibleContent` de `radix-ui`

## Anatomie

| Slot                              | Rôle                                                   |
| --------------------------------- | ------------------------------------------------------ |
| `data-slot="collapsible"`         | Racine du composant, gère l'état ouvert/fermé          |
| `data-slot="collapsible-trigger"` | Élément déclencheur qui bascule l'affichage du contenu |
| `data-slot="collapsible-content"` | Zone de contenu affichée ou masquée                    |

## Tokens utilisés

| Token | Usage                                                                     |
| ----- | ------------------------------------------------------------------------- |
| —     | Aucun token de design spécifique ; le style est délégué au contenu enfant |

## Props / API

| Prop           | Type                                                     | Défaut  | Description                                    |
| -------------- | -------------------------------------------------------- | ------- | ---------------------------------------------- |
| `open`         | `boolean`                                                | —       | État contrôlé d'ouverture                      |
| `defaultOpen`  | `boolean`                                                | `false` | État initial d'ouverture (non contrôlé)        |
| `onOpenChange` | `(open: boolean) => void`                                | —       | Callback déclenché au changement d'état        |
| `disabled`     | `boolean`                                                | `false` | Désactive le trigger et empêche le basculement |
| `className`    | `string`                                                 | —       | Classes CSS additionnelles                     |
| `...props`     | `React.ComponentProps<typeof CollapsiblePrimitive.Root>` | —       | Toutes les props du primitif Radix             |

## Variantes

<!-- Généré par scripts/build-spec-variants.ts depuis mcp-server/context/component-variants.json — ne pas éditer à la main. -->

Aucun axe de variante : le composant n'appelle pas `cva()`. Son apparence se règle par ses props et, en dernier recours, par `className` avec des classes de tokens.

## États

| État     | Description                                                 |
| -------- | ----------------------------------------------------------- |
| default  | Contenu masqué (`data-state="closed"`)                      |
| hover    | Style hover sur le trigger (délégué au consommateur)        |
| focus    | Focus clavier sur le trigger avec anneau de focus           |
| active   | — (pas d'état active propre)                                |
| disabled | Le trigger est inactif, le contenu ne peut pas être basculé |

## Accessibilité

**Pattern** : [Disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/) (Radix Collapsible)

**Rôle** : `CollapsibleTrigger` est un `button` avec `aria-expanded` et `aria-controls`.

**Clavier** :

| Touche            | Action                   |
| ----------------- | ------------------------ |
| `Enter` / `Space` | Ouvre / ferme le contenu |

**Nom accessible** : Le texte du déclencheur ; s'il ne contient qu'une icône (chevron), `aria-label` obligatoire.

**Vigilance** :

- Le contenu fermé est retiré de l'arbre d'accessibilité : ne pas y cacher d'information requise pour continuer.

## Exemple de code

```tsx
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

export default function Example() {
  return (
    <Collapsible>
      <CollapsibleTrigger>Afficher les détails</CollapsibleTrigger>
      <CollapsibleContent>
        <p>Contenu supplémentaire affiché au clic.</p>
      </CollapsibleContent>
    </Collapsible>
  )
}
```

## Références croisées

- `Accordion` — alternative pour plusieurs sections repliables mutuellement exclusives
- `Sidebar` — utilise des patterns similaires pour les groupes repliables
- `Sheet` — alternative pour du contenu masqué en panneau latéral
