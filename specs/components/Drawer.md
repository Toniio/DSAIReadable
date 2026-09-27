# Drawer

## Metadata

| Champ         | Valeur                   |
| ------------- | ------------------------ |
| Nom           | Drawer                   |
| Catégorie     | Overlay                  |
| Statut        | stable                   |
| figma_node_id |                          |
| code_path     | components/ui/drawer.tsx |

## Rôle

Panneau glissant ancré à un bord de l'écran, contrôlé par geste de glissement (swipe), idéal pour les interactions mobiles.

## Usage

- Afficher un formulaire ou des options depuis le bas de l'écran sur mobile
- Proposer un panneau de filtres ou de paramètres latéral
- Offrir une navigation secondaire glissante depuis la gauche ou la droite
- Remplacer un Dialog sur les écrans tactiles pour une meilleure ergonomie
- Afficher du contenu complémentaire sans quitter le contexte actuel

## Contraintes

- Ne pas utiliser sur desktop quand un `Dialog` ou un `Sheet` est plus adapté
- Limiter la hauteur à 80vh pour les directions top/bottom (appliqué par défaut)
- Ne pas empiler plusieurs Drawers — un seul visible à la fois
- `DrawerTitle` est requis pour l'accessibilité (lecteurs d'écran)
- Le geste de fermeture par swipe peut interférer avec le scroll interne : tester sur mobile

## Dépendances

- `Drawer` de `vaul` (primitives Root, Trigger, Portal, Overlay, Content, Close, Title, Description)

## Anatomie

| Slot                             | Rôle                                     |
| -------------------------------- | ---------------------------------------- |
| `data-slot="drawer"`             | Racine du composant                      |
| `data-slot="drawer-trigger"`     | Élément déclencheur d'ouverture          |
| `data-slot="drawer-portal"`      | Portail de rendu                         |
| `data-slot="drawer-overlay"`     | Fond semi-transparent avec backdrop-blur |
| `data-slot="drawer-content"`     | Conteneur principal, ancré à un bord     |
| `data-slot="drawer-header"`      | Zone d'en-tête (titre + description)     |
| `data-slot="drawer-footer"`      | Zone de pied (boutons d'action)          |
| `data-slot="drawer-title"`       | Titre du panneau                         |
| `data-slot="drawer-description"` | Description textuelle                    |
| `data-slot="drawer-close"`       | Élément de fermeture                     |

## Tokens utilisés

<!-- Généré par scripts/build-spec-tokens.ts depuis le code du composant — ne pas éditer à la main. -->

| Token                            | Classes et variables                              | Où                                                                                                                       |
| -------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `border-width.default`           | `border-b` · `border-l` · `border-r` · `border-t` | `DrawerContent`                                                                                                          |
| `color.background.elevated`      | `bg-popover`                                      | `DrawerContent` via `SIDE_PANEL_CONTENT_BASE` (`lib/overlay.ts`)                                                         |
| `color.background.subtle`        | `bg-muted`                                        | `DrawerContent`                                                                                                          |
| `color.static.black`             | `bg-black/10`                                     | `DrawerOverlay` via `OVERLAY_BASE` (`lib/overlay.ts`)                                                                    |
| `color.text.default`             | `text-foreground` · `text-popover-foreground`     | `DrawerContent` via `SIDE_PANEL_CONTENT_BASE` (`lib/overlay.ts`) · `DrawerTitle`                                         |
| `color.text.subtle`              | `text-muted-foreground`                           | `DrawerDescription`                                                                                                      |
| `typography.font-weight.medium`  | `font-medium`                                     | `DrawerTitle`                                                                                                            |
| `typography.line-height.relaxed` | `text-xs/relaxed`                                 | `DrawerContent` via `SIDE_PANEL_CONTENT_BASE` (`lib/overlay.ts`) · `DrawerDescription`                                   |
| `typography.size.sm`             | `text-sm`                                         | `DrawerTitle`                                                                                                            |
| `typography.size.xs`             | `text-xs/relaxed`                                 | `DrawerContent` via `SIDE_PANEL_CONTENT_BASE` (`lib/overlay.ts`) · `DrawerDescription`                                   |
| `zindex.modal`                   | `z-modal`                                         | `DrawerContent` via `SIDE_PANEL_CONTENT_BASE` (`lib/overlay.ts`) · `DrawerOverlay` via `OVERLAY_BASE` (`lib/overlay.ts`) |

Relevé dans `components/ui/drawer.tsx` et les constantes de `lib/` qu'il importe ; chaque classe est résolue par Tailwind jusqu'au token sémantique. **Où** : sous-composant, chemin de variante `cva` ou constante d'origine. Les classes qui ne lisent aucun token (espacement `p-2`, tailles, mise en page) n'y figurent pas.

## Props / API

| Prop                    | Type                                     | Défaut      | Description                                                               |
| ----------------------- | ---------------------------------------- | ----------- | ------------------------------------------------------------------------- |
| `open`                  | `boolean`                                | `undefined` | Contrôle l'état ouvert/fermé (mode contrôlé)                              |
| `onOpenChange`          | `(open: boolean) => void`                | —           | Callback lors du changement d'état                                        |
| `direction`             | `"top" \| "right" \| "bottom" \| "left"` | `"bottom"`  | Direction d'apparition du panneau (via vaul `data-vaul-drawer-direction`) |
| `shouldScaleBackground` | `boolean`                                | —           | Réduit l'arrière-plan lors de l'ouverture                                 |
| `className`             | `string`                                 | —           | Classes CSS additionnelles (sur chaque sous-composant)                    |

## Variantes

<!-- Généré par scripts/build-spec-variants.ts depuis mcp-server/context/component-variants.json — ne pas éditer à la main. -->

Aucun axe de variante : le composant n'appelle pas `cva()`. Son apparence se règle par ses props et, en dernier recours, par `className` avec des classes de tokens.

## États

| État     | Description                                                   |
| -------- | ------------------------------------------------------------- |
| default  | Drawer fermé, aucun overlay visible                           |
| open     | Overlay affiché, panneau glissé depuis le bord avec animation |
| dragging | L'utilisateur fait glisser le panneau (geste tactile)         |
| closing  | Animation de fermeture par glissement ou par l'overlay        |
| focus    | Focus piégé à l'intérieur du panneau                          |
| disabled | N/A — les contrôles internes gèrent leur propre état          |

## Accessibilité

**Pattern** : [Dialog (Modal)](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) (vaul, sur Radix Dialog)

**Rôle** : `role="dialog"`, `aria-modal="true"` ; étiqueté par `DrawerTitle`.

**Clavier** :

| Touche              | Action                                                    |
| ------------------- | --------------------------------------------------------- |
| `Tab` / `Shift+Tab` | Parcourt les éléments focalisables, piégés dans le tiroir |
| `Escape`            | Ferme le tiroir                                           |

**Nom accessible** : `DrawerTitle` est obligatoire, même masqué visuellement.

**Vigilance** :

- Le glissement pour fermer n'existe pas au clavier ni pour tous les utilisateurs : prévoir un bouton de fermeture visible (`DrawerClose`).
- À la fermeture, le focus revient au déclencheur.

## Exemple de code

```tsx
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"

export default function Example() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Ouvrir le panneau</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Filtres</DrawerTitle>
          <DrawerDescription>
            Affinez votre recherche avec les filtres ci-dessous.
          </DrawerDescription>
        </DrawerHeader>
        {/* Contenu des filtres */}
        <DrawerFooter>
          <Button>Appliquer</Button>
          <DrawerClose asChild>
            <Button variant="outline">Annuler</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
```

## Références croisées

- `Sheet` — panneau latéral similaire mais sans geste de glissement, basé sur Radix Dialog
- `Dialog` — modale centrée pour desktop
- `AlertDialog` — modale de confirmation bloquante
