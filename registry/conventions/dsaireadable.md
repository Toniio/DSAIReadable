---
description: Règles du design system DSAIReadable — à appliquer à toute UI qui utilise ses composants
alwaysApply: true
applyTo: "**"
---

# Design system DSAIReadable

Ce projet utilise les composants du registre shadcn `Toniio/DSAIReadable`.
Ces règles s'appliquent à toute interface écrite avec eux.

## Composants

- **Installer** un composant avec son adresse complète :
  `npx shadcn add Toniio/DSAIReadable/<item>`. Un nom nu (`npx shadcn add button`)
  installe celui de shadcn/ui, pas celui du design system, et l'écrase.
- **Chercher** un composant avec le serveur MCP de shadcn, registre
  `Toniio/DSAIReadable`, ou `npx shadcn search Toniio/DSAIReadable -q <mot>`.
- **Lire la spec avant de l'utiliser** :
  `https://github.com/Toniio/DSAIReadable/blob/main/specs/components/<Composant>.md`
  (props, variantes, états, accessibilité). N'inventer aucune prop : ce qui n'est
  pas dans la spec n'existe pas.
- **Ne pas modifier** les fichiers installés pour changer leur apparence :
  passer par leurs props (`variant`, `size`) et, en dernier recours, par
  `className` avec des classes de tokens. Une mise à jour
  (`npx shadcn add … --overwrite`) écrase les modifications locales.

## Tokens

- **Aucune valeur brute** dans le code UI : pas de hex, `rgb()`, `oklch()`,
  `px`, `rem`, `ms`, ni de valeur arbitraire Tailwind (`p-[13px]`,
  `bg-[#fff]`).
- **Aucune couleur de la palette Tailwind** (`bg-red-500`, `text-slate-600`) :
  seulement les couleurs sémantiques du design system — `background`,
  `foreground`, `card`, `popover`, `primary`, `secondary`, `muted`, `accent`,
  `destructive` et leurs `-foreground`, `border`, `input`, `ring`,
  `chart-1` à `chart-5`, `sidebar-*`.
- **Rayons, ombres, durées** : `rounded-sm` à `rounded-4xl`, `shadow-xs` à
  `shadow-2xl`, `duration-fast` / `normal` / `slow`, `ease-default`.
- **Jamais de variable `--ds-prim-*`** : ce sont les valeurs brutes du système,
  privées. Elles changent sans préavis.

## Icônes, thème, accessibilité

- **Icônes : `@phosphor-icons/react` uniquement.** Pas de Lucide, pas de
  Heroicons, pas de SVG inline.
- **Mode sombre : classe `.dark` sur `<html>`.** Ne pas utiliser
  `prefers-color-scheme`.
- **Un bouton sans texte visible reçoit un `aria-label`.**
- **Ne jamais retirer l'anneau de focus** (`outline-none` seul, `focus:ring-0`) :
  les composants dessinent tous le même, depuis `lib/focus`.
- **Les libellés par défaut** (bouton de fermeture, flèches de carrousel…) sont
  en anglais, dans `lib/ui-strings`. Les traduire par la prop prévue sur chaque
  composant, pas en éditant le composant.
