# Breakpoints Foundation

> Source: `tokens/semantic.json` (`breakpoint.*`) · CSS variables: `tokens.css` Layer 2

**Les préfixes responsive de Tailwind sont le contrat du design system.** Il n'y a
pas d'autre breakpoint que ceux-ci, et leurs valeurs sont les tokens `breakpoint.*`.

Tailwind compile `md:` en media query au build, et une media query ne peut pas lire
de variable CSS : le token ne pilote donc pas Tailwind, il **en est la valeur de
référence**. `npm run tokens:lint-bridge` échoue si les tokens et les valeurs que
Tailwind compile divergent, dans un sens comme dans l'autre.

---

## Token Reference

| Token            | Variable CSS       | Valeur         | Préfixe | Statut   |
| ---------------- | ------------------ | -------------- | ------- | -------- |
| `breakpoint.sm`  | `--breakpoint-sm`  | 40rem / 640px  | `sm:`   | active   |
| `breakpoint.md`  | `--breakpoint-md`  | 48rem / 768px  | `md:`   | active   |
| `breakpoint.lg`  | `--breakpoint-lg`  | 64rem / 1024px | `lg:`   | active   |
| `breakpoint.xl`  | `--breakpoint-xl`  | 80rem / 1280px | `xl:`   | reserved |
| `breakpoint.2xl` | `--breakpoint-2xl` | 96rem / 1536px | `2xl:`  | reserved |

`reserved` : aucun composant n'en a besoin aujourd'hui ; le préfixe existe et reste
utilisable pour une mise en page large.

---

## Modèle

- **Mobile-first** : une classe sans préfixe s'applique partout ; `md:` s'applique à
  partir de 48rem de **largeur de viewport**, et au-delà.
- `max-md:` borne par le haut (en dessous de 48rem) ; `md:max-lg:` cible un intervalle.
- Un breakpoint décrit la **fenêtre**, pas le conteneur. Pour réagir à la largeur
  d'un conteneur, utiliser les container queries (`@container`, `@md:`) — elles
  ont leur propre échelle et ne dépendent pas de ces tokens.

---

## Usage Rules

- ✅ Écrire la version mobile sans préfixe, puis ajouter `sm:` / `md:` / `lg:` pour les écrans plus larges
- ✅ Choisir le premier breakpoint où la mise en page casse, pas un appareil précis
- ❌ Ne jamais écrire de breakpoint arbitraire (`min-[600px]:`, `max-[900px]:`) — seuls les préfixes du tableau existent
- ❌ Ne jamais lire `var(--breakpoint-*)` dans une media query : elle ne résout pas les variables
- ❌ Ne pas modifier une valeur de `breakpoint.*` sans déclarer la même valeur, en littéral, dans le `@theme` de `app/globals.css` — le lint du pont le rappelle
