# Focus Foundation

> Source: `lib/focus.ts` · Token: `space.focus-ring-width` · CSS variable: `--space-focus-ring-width` · Linter: `npm run tokens:lint-focus`

Un seul anneau de focus, une seule largeur, une seule source. Tout élément
focalisable du système affiche le même indicateur : un anneau de **2px** en
`ring/50`, doublé d'un changement de couleur de bordure. Aucun composant ne
décrit son focus lui-même.

---

## Le problème que cette fondation résout

Avant sa mise en place, le dépôt comptait **16 patterns de focus distincts sur
30 sites**, répartis sur 21 composants — trois largeurs différentes (`ring-1`,
`ring-2`, `ring-3`), deux mécanismes de reset (`outline-none`, `outline-hidden`)
et plusieurs combinaisons de couleurs.

Plus grave : la classe `ring-focus`, utilisée par **Toggle, ScrollArea et
Calendar**, n'a jamais existé. `--ring-*` n'est pas un namespace de thème
Tailwind v4 : la déclaration `--ring-focus` dans `@theme inline` créait une
custom property et rien d'autre. Aucune règle CSS n'était émise. Ces trois
composants étaient livrés **sans aucun indicateur de focus visible** —
échec de [WCAG 2.2 SC 2.4.7 (Focus Visible), niveau A](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible).

Rien n'échouait : ni le build, ni le typecheck, ni le lint du bridge, qui
validait `--ring-focus` parce que sa _référence_ résolvait. Une référence qui
résout n'est pas une utilitaire qui existe.

---

## Le token

| Token                    | CSS Variable               | Valeur | Pourquoi                                                                                                                                                         |
| ------------------------ | -------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `space.focus-ring-width` | `--space-focus-ring-width` | `2px`  | Compromis entre les `3px` initiaux, inhabituellement épais, et le `1px` majoritairement employé dans le code, trop fin pour rester perceptible sur un fond clair |

La syntaxe Tailwind v4 qui lit un token comme longueur d'anneau est
`ring-(length:--nom-du-token)`. Elle compile bien :

```css
.focus-visible\:ring-\(length\:--space-focus-ring-width\):focus-visible {
  --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0
    calc(var(--space-focus-ring-width) + var(--tw-ring-offset-width))
    var(--tw-ring-color, currentcolor);
  box-shadow: …;
}
```

---

## Les presets

Tous exportés par `lib/focus.ts`. Un composant importe, il ne recompose pas.

| Constante                | Quand                                                                                                                   |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `FOCUS_RING`             | Cas général. Bordure + anneau + couleur. **Le défaut de tout élément focalisable.**                                     |
| `FOCUS_RING_WIDTH`       | L'épaisseur seule, quand l'élément fournit sa propre couleur d'anneau — c'est le cas de Sidebar via `ring-sidebar-ring` |
| `FOCUS_RING_DESTRUCTIVE` | Surcharge de couleur pour un état destructif ou invalide. Se compose **après** `FOCUS_RING`                             |
| `FOCUS_RING_WITHIN`      | Le même anneau, déclenché par le focus d'un descendant — InputGroup, Combobox                                           |
| `FOCUS_OUTLINE_RESET`    | Neutralise l'outline natif. **Toujours à la place de `outline-none`**                                                   |

```tsx
import { FOCUS_RING, FOCUS_OUTLINE_RESET } from "@/lib/focus"

const buttonVariants = cva(
  `inline-flex items-center ${FOCUS_OUTLINE_RESET} ${FOCUS_RING}`,
  { variants: { … } }
)
```

---

## Usage Rules

1. **Jamais de largeur d'anneau en dur sur un état de focus** — `ring-1`,
   `ring-2`, `ring-3` sont des pixels, interdits par la première règle du dépôt.
   Le linter les refuse sur tout préfixe `focus`, `focus-visible`,
   `focus-within`, `data-[active=true]`, `data-[focused=true]` et `aria-invalid`.
2. **Jamais `outline-none`** — utiliser `FOCUS_OUTLINE_RESET` (`outline-hidden`).
   En mode contrastes forcés, les `box-shadow` ne sont pas peints : `outline-none`
   laisse l'élément sans aucun indicateur, là où `outline-hidden` conserve un
   outline transparent que le mode rend visible. `outline-none` empoisonne de
   surcroît `--tw-outline-style`, ce qui désactivait silencieusement les
   `outline-1` de ScrollArea et NavigationMenu.
3. **L'anneau d'état invalide suit la largeur de l'anneau de focus** — les deux
   peuvent s'appliquer simultanément sur un champ à la fois invalide et focalisé.
   Deux largeurs différentes produisent un rendu qui dépend de l'ordre des
   utilitaires dans la feuille compilée.
4. **`ring-0` est une suppression légitime** — c'est ainsi qu'un wrapper comme
   InputGroup reprend à son compte l'indicateur de son contrôle interne.
5. **Masquer l'outline oblige à dessiner un anneau — vérifié occurrence par
   occurrence.** L'anneau doit figurer dans la _même_ chaîne de classes. Un
   composant qui neutralise l'outline à dix endroits et dessine un anneau à un
   seul ne satisfait pas la règle.

   Trois mécanismes de remplacement sont admis, chacun déclaré par un
   commentaire `// focus-managed: <mécanisme>` que le linter exige non vide :

   | Mécanisme                                                                                                                          | Composants                                                                           |
   | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
   | Focus roving : Radix déplace le tabindex et marque l'item courant par `focus:bg-accent` ou `data-highlighted:bg-accent`            | DropdownMenu, ContextMenu, Menubar, Select, Command, Combobox                        |
   | Anneau dessiné par le wrapper : le contrôle est dans un InputGroup qui porte `has-[[data-slot=input-group-control]:focus-visible]` | CommandInput, ComboboxInput                                                          |
   | Surface focalisée programmatiquement : Radix monte l'overlay avec `tabIndex={-1}` puis passe le focus à un contrôle interne        | Dialog, AlertDialog, Popover, HoverCard, DropdownMenu, ContextMenu, Menubar, Command |

   Ces mécanismes signalent le focus **par la couleur seule**. Ils restent
   acceptables parce que le focus y est toujours accompagné d'un déplacement
   visible dans une liste, mais ils ne conviennent pas à un contrôle isolé.

---

## Contraste

L'anneau est vérifié par `npm run tokens:lint-contrast` contre le seuil WCAG 2.2
SC 1.4.11 de **3:1** pour un composant d'interface, dans les deux modes :

| Paire                                       | Clair | Sombre |
| ------------------------------------------- | ----- | ------ |
| anneau de focus sur surface par défaut      | 4.61  | 4.28   |
| anneau de focus sur surface atténuée        | 4.14  | 3.21   |
| anneau de focus sidebar sur surface sidebar | 4.44  | 3.77   |

---

## Garde-fou

`scripts/lint-focus-ring.ts`, branché dans `npm run tokens-validate` et dans la
CI. Quatre règles, chacune correspondant à un bug réellement livré :

| Règle          | Ce qu'elle bloque                                                                                        |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| `dead-class`   | `ring-focus`, la classe qui n'a jamais existé                                                            |
| `raw-width`    | une largeur d'anneau de focus en pixels                                                                  |
| `outline-none` | le reset qui efface l'indicateur en contrastes forcés                                                    |
| `no-indicator` | une chaîne de classes qui masque l'outline sans rien dessiner à la place, ni déclarer ce qui s'en charge |
