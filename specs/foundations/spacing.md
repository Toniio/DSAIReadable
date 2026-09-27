# Spacing Foundation

> Source: `tokens/semantic.json` · CSS variables: `tokens.css` Layer 2

Le système d'espacement est divisé en deux axes distincts : l'espacement **composant** (micro) et l'espacement **layout** (macro). Ne jamais utiliser un token layout pour un espacement interne de composant, et vice versa.

---

## Component Spacing

Espace **interne** à un composant (`padding`, `gap`) ou **entre composants proches**. Gamme : 4 px → 32 px.

| Token                | CSS Variable           | Valeur rem | Valeur px | Cas d'usage typique                                                         |
| -------------------- | ---------------------- | ---------- | --------- | --------------------------------------------------------------------------- |
| `space.component.xs` | `--space-component-xs` | `0.25rem`  | 4 px      | Gap entre icône et label, padding interne de badge                          |
| `space.component.sm` | `--space-component-sm` | `0.5rem`   | 8 px      | Padding d'un bouton compact, gap d'items de liste serrés                    |
| `space.component.md` | `--space-component-md` | `1rem`     | 16 px     | Padding standard d'une card, gap entre boutons d'un groupe                  |
| `space.component.lg` | `--space-component-lg` | `1.5rem`   | 24 px     | Padding interne d'un dialog, gap entre champs d'un formulaire               |
| `space.component.xl` | `--space-component-xl` | `2rem`     | 32 px     | Padding d'une section de card large, espacement entre groupes de formulaire |

### Exemples Tailwind

```tsx
// Bouton compact — xs gap entre icône et label
<button className="flex items-center gap-1 px-3 py-1.5">
  <Icon /> Label
</button>

// Card standard — md padding
<div className="p-4 flex flex-col gap-4">
  <h2>Titre</h2>
  <p>Contenu</p>
</div>

// Dialog — lg padding
<div className="p-6 flex flex-col gap-6">
  <DialogHeader />
  <DialogContent />
</div>
```

> **Note Tailwind :** Les valeurs numériques Tailwind (`gap-1` = 4px, `gap-2` = 8px, `gap-4` = 16px, `gap-6` = 24px, `gap-8` = 32px) correspondent directement aux tokens de composants. Utiliser ces classes en priorité.

---

## Layout Spacing

Espace de **mise en page** : padding de page, gap entre sections, largeurs max de contenu.

| Token                          | CSS Variable                     | Valeur           | Cas d'usage typique                                |
| ------------------------------ | -------------------------------- | ---------------- | -------------------------------------------------- |
| `space.layout.page-padding`    | `--space-layout-page-padding`    | `1.5rem` (24 px) | Padding horizontal du conteneur de page racine     |
| `space.layout.section-gap`     | `--space-layout-section-gap`     | `4rem` (64 px)   | Espace vertical entre sections majeures d'une page |
| `space.layout.content-sm`      | `--space-layout-content-sm`      | `42rem`          | `max-width` pour colonne étroite (article, prose)  |
| `space.layout.content-default` | `--space-layout-content-default` | `64rem`          | `max-width` par défaut pour le contenu principal   |
| `space.layout.content-lg`      | `--space-layout-content-lg`      | `80rem`          | `max-width` pour les layouts larges (dashboards)   |

### Classes Tailwind générées

Via `@theme inline` dans `globals.css`, les tokens layout sont disponibles comme :

```tsx
// Page container — px-page = 1.5rem de padding horizontal
<main className="px-page mx-auto max-w-[var(--space-layout-content-default)]">
  ...
</main>

// Gap entre sections — gap-section = 4rem
<div className="flex flex-col gap-section">
  <HeroSection />
  <FeaturesSection />
  <CTASection />
</div>

// Conteneur de contenu — largeurs max
<article className="mx-auto w-full max-w-[var(--space-layout-content-sm)]">
  {/* prose / article étroit */}
</article>

<div className="mx-auto w-full max-w-[var(--space-layout-content-lg)]">
  {/* dashboard large */}
</div>
```

### Exemple de layout de page complet

```tsx
// app/layout.tsx
export default function Layout({ children }) {
  return (
    <html>
      <body>
        <Sidebar />
        <main className="flex flex-col gap-section px-page py-section">
          {children}
        </main>
      </body>
    </html>
  )
}
```

---

## Échelle visuelle

```
xs  ▌ 4px
sm  ▌▌ 8px
md  ▌▌▌▌ 16px
lg  ▌▌▌▌▌▌ 24px
xl  ▌▌▌▌▌▌▌▌ 32px
─────────────────────────────
page-padding  ████████████████████ 24px (1.5rem)
section-gap   ████████████████████████████████████████████████████████████████ 64px (4rem)
```

---

## Usage Rules

1. **Deux axes, deux vocabulaires** — `space.component.*` pour l'intérieur des composants ; `space.layout.*` pour la mise en page globale. Ne jamais inverser.
2. **Pas de valeurs arbitraires** — utiliser exclusivement les tokens. Si une valeur intermédiaire est nécessaire, en discuter d'abord avec l'équipe design.
3. **Cohérence de l'axe composant** — un formulaire utilise `lg` (24px) entre ses champs et `md` (16px) en padding interne. Rester sur cet axe partout dans le même composant.
4. **`page-padding` appliqué une seule fois** — sur le conteneur racine de la page, pas sur chaque section individuelle.
5. **`content-*` via `max-width`** — ces tokens définissent des largeurs maximales, pas des paddings. Toujours associer avec `mx-auto` pour centrer.

### Valeurs arbitraires : lire un token est gratuit, calculer ne l'est pas

Une valeur arbitraire Tailwind (`w-[…]`, `gap-[…]`, `grid-cols-[…]`…) est
autorisée sans justification tant qu'elle **lit** une décision sans en prendre
une :

| Autorisé sans justification | Pourquoi                                                  |
| --------------------------- | --------------------------------------------------------- |
| `w-[var(--sidebar-width)]`  | lecture d'un token ; changer le token change le composant |
| `gap-[--spacing(4)]`        | lecture de l'échelle d'espacement                         |
| `top-[50%]`                 | relatif à la boîte parente, pas une valeur de design      |
| `grid-cols-[auto_1fr]`      | décrit une structure, pas une taille                      |

Dès qu'il y a une **arithmétique** — `calc()`, `+`, `-`, `*`, `/` — la valeur
encode une relation inventée dans le composant, qu'aucun token n'exprime et
qu'aucun agent ne peut deviner. Elle exige alors `// allow-raw: <id>` sur la
ligne, ou juste au-dessus dans un bloc de commentaires contigu, **et** une
entrée correspondante dans `tokens/allow-raw.registry.json`.

`npm run tokens:lint-values` applique la règle. Préférer d'abord la
simplification : `top-[calc(--spacing(1.25))]` s'écrit `top-1.25` et compile à
l'identique.
