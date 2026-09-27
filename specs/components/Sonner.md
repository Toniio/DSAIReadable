# Sonner

## Metadata

| Champ         | Valeur                   |
| ------------- | ------------------------ |
| Nom           | Sonner                   |
| Catégorie     | Feedback                 |
| Statut        | stable                   |
| figma_node_id |                          |
| code_path     | components/ui/sonner.tsx |

## Rôle

Fournisseur de notifications toast éphémères, basé sur la librairie `sonner`, avec icônes personnalisées et thème adaptatif.

## Usage

- Confirmer la réussite d'une action utilisateur (sauvegarde, envoi, suppression)
- Signaler une erreur non bloquante après une opération
- Afficher un avertissement contextuel temporaire
- Indiquer un état de chargement asynchrone
- Fournir une information ponctuelle sans interrompre le flux

## Contraintes

- Ne pas utiliser pour des messages critiques nécessitant une action — préférer `AlertDialog`
- Placer un seul `<Toaster />` à la racine du layout
- Ne pas empiler plus de 3 toasts visibles simultanément pour préserver la lisibilité
- Le contenu du toast doit être concis (une à deux phrases maximum)
- Prévoir un moyen alternatif pour les lecteurs d'écran (`aria-live` géré par `sonner`)

## Dépendances

- `sonner` (librairie externe) — composant `Toaster` et types `ToasterProps`
- `next-themes` — hook `useTheme` pour la détection du thème
- `@phosphor-icons/react` — `CheckCircleIcon`, `InfoIcon`, `WarningIcon`, `XCircleIcon`, `SpinnerIcon`

## Anatomie

| Slot                   | Rôle                                                         |
| ---------------------- | ------------------------------------------------------------ |
| `<Sonner>` (racine)    | Point de montage des toasts, porte la classe `toaster group` |
| `cn-toast` (className) | Classe appliquée à chaque toast individuel                   |

## Tokens utilisés

| Token                        | Usage                                         |
| ---------------------------- | --------------------------------------------- |
| `--color-popover`            | Fond du toast (`--normal-bg`)                 |
| `--color-popover-foreground` | Texte du toast (`--normal-text`)              |
| `--color-border`             | Bordure du toast (`--normal-border`)          |
| `--radius-md`                | Rayon de bordure du toast (`--border-radius`) |

## Props / API

| Prop       | Type                            | Défaut                    | Description                                                     |
| ---------- | ------------------------------- | ------------------------- | --------------------------------------------------------------- |
| `theme`    | `"light" \| "dark" \| "system"` | `system` (via `useTheme`) | Thème visuel des toasts                                         |
| `...props` | `ToasterProps`                  | —                         | Toutes les props de `sonner.Toaster` (position, duration, etc.) |

## Variantes

<!-- Généré par scripts/build-spec-variants.ts depuis mcp-server/context/component-variants.json — ne pas éditer à la main. -->

Aucun axe de variante : le composant n'appelle pas `cva()`. Son apparence se règle par ses props et, en dernier recours, par `className` avec des classes de tokens.

## États

| État    | Description                                                  |
| ------- | ------------------------------------------------------------ |
| default | Aucun toast affiché                                          |
| success | Toast avec `CheckCircleIcon` — confirmation d'action réussie |
| info    | Toast avec `InfoIcon` — information neutre                   |
| warning | Toast avec `WarningIcon` — avertissement                     |
| error   | Toast avec `XCircleIcon` — signalement d'erreur              |
| loading | Toast avec `SpinnerIcon` animé — opération en cours          |

## Accessibilité

**Pattern** : Notifications (sonner)

**Rôle** : Région `section` nommée « Notifications » ; liste de toasts en `aria-live="polite"`.

**Clavier** :

| Touche  | Action                                     |
| ------- | ------------------------------------------ |
| `Alt+T` | Donne le focus à la zone des notifications |
| `Tab`   | Parcourt les actions des toasts            |

**Nom accessible** : Le texte du toast est annoncé poliment, sans interrompre.

**Vigilance** :

- Un toast disparaît seul : ne jamais y placer la seule façon d'accomplir une action (annuler doit exister ailleurs), et laisser une durée suffisante.
- Pour une erreur bloquante, utiliser `Alert` ou un message de formulaire, pas un toast.

## Exemple de code

```tsx
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"

// Dans le layout racine
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}

// Déclenchement d'un toast
function SaveButton() {
  return (
    <button onClick={() => toast.success("Enregistré avec succès")}>
      Sauvegarder
    </button>
  )
}
```

## Références croisées

- `AlertDialog` — pour les messages nécessitant une confirmation utilisateur
- `Tooltip` — pour les informations contextuelles non éphémères
