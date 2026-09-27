# InputOtp

## Metadata

| Champ         | Valeur                      |
| ------------- | --------------------------- |
| Nom           | InputOtp                    |
| Catégorie     | Forms                       |
| Statut        | stable                      |
| figma_node_id |                             |
| code_path     | components/ui/input-otp.tsx |

## Rôle

Champ de saisie segmenté pour les codes à usage unique (OTP), avec navigation automatique entre les cases et caret animé.

## Usage

- Saisie de codes de vérification (SMS, e-mail, 2FA)
- Codes PIN numériques
- Codes de confirmation à N chiffres/caractères
- Formulaires de double authentification

## Contraintes

- Ne pas utiliser pour des saisies longues ou libres — réservé aux codes courts (4–8 caractères)
- Chaque `InputOTPSlot` doit recevoir un `index` correspondant à sa position dans le groupe
- Le `spellCheck` est désactivé par défaut pour éviter les suggestions du navigateur
- L'accessibilité repose sur la bibliothèque `input-otp` ; ne pas surcharger les rôles ARIA
- Requiert un conteneur `"use client"` (composant client-side)

## Dépendances

- `input-otp` — `OTPInput`, `OTPInputContext` (bibliothèque de gestion OTP)
- `@phosphor-icons/react` — `MinusIcon` (séparateur par défaut)

## Anatomie

| Slot                              | Rôle                                            |
| --------------------------------- | ----------------------------------------------- |
| `data-slot="input-otp"`           | Racine du composant, conteneur flex des groupes |
| `data-slot="input-otp-group"`     | Groupe de slots adjacents (ex. : 3 + 3)         |
| `data-slot="input-otp-slot"`      | Case individuelle affichant un caractère        |
| `data-slot="input-otp-separator"` | Séparateur visuel entre groupes (tiret)         |

## Tokens utilisés

<!-- Généré par scripts/build-spec-tokens.ts depuis le code du composant — ne pas éditer à la main. -->

| Token                          | Classes et variables                                                 | Où                               |
| ------------------------------ | -------------------------------------------------------------------- | -------------------------------- |
| `border-width.default`         | `border-l` · `border-r` · `border-y`                                 | `InputOTPSlot`                   |
| `color.border.focus`           | `border-ring` · `ring-ring/50`                                       | `InputOTPSlot`                   |
| `color.border.input`           | `bg-input/30` · `border-input`                                       | `InputOTPSlot`                   |
| `color.feedback.error.default` | `border-destructive` · `ring-destructive/20` · `ring-destructive/40` | `InputOTPGroup` · `InputOTPSlot` |
| `color.text.default`           | `bg-foreground`                                                      | `InputOTPSlot`                   |
| `motion.duration.extra-slow`   | `duration-extra-slow`                                                | `InputOTPSlot`                   |
| `space.focus-ring-width`       | `ring-(length:--space-focus-ring-width)`                             | `InputOTPGroup` · `InputOTPSlot` |
| `typography.size.xs`           | `text-xs`                                                            | `InputOTPSlot`                   |
| `zindex.dropdown`              | `z-dropdown`                                                         | `InputOTPSlot`                   |

Relevé dans `components/ui/input-otp.tsx` et les constantes de `lib/` qu'il importe ; chaque classe est résolue par Tailwind jusqu'au token sémantique. **Où** : sous-composant, chemin de variante `cva` ou constante d'origine. Les classes qui ne lisent aucun token (espacement `p-2`, tailles, mise en page) n'y figurent pas.

## Props / API

| Prop                  | Type                                    | Défaut | Description                                                    |
| --------------------- | --------------------------------------- | ------ | -------------------------------------------------------------- |
| **InputOTP**          |                                         |        |                                                                |
| `containerClassName`  | `string`                                | —      | Classes CSS sur le conteneur flex externe                      |
| `className`           | `string`                                | —      | Classes CSS sur l'input caché                                  |
| `maxLength`           | `number`                                | —      | Nombre total de caractères attendus                            |
| `pattern`             | `string`                                | —      | Regex de validation par caractère (ex. : `REGEXP_ONLY_DIGITS`) |
| `...props`            | `React.ComponentProps<typeof OTPInput>` | —      | Toutes les props de `input-otp`                                |
| **InputOTPGroup**     |                                         |        |                                                                |
| `className`           | `string`                                | —      | Classes CSS additionnelles                                     |
| **InputOTPSlot**      |                                         |        |                                                                |
| `index`               | `number`                                | —      | Position du slot dans la séquence (obligatoire)                |
| `className`           | `string`                                | —      | Classes CSS additionnelles                                     |
| **InputOTPSeparator** |                                         |        |                                                                |
| `...props`            | `React.ComponentProps<"div">`           | —      | Props natives du conteneur séparateur                          |

## Variantes

<!-- Généré par scripts/build-spec-variants.ts depuis mcp-server/context/component-variants.json — ne pas éditer à la main. -->

Aucun axe de variante : le composant n'appelle pas `cva()`. Son apparence se règle par ses props et, en dernier recours, par `className` avec des classes de tokens.

## États

| État     | Description                                                                    |
| -------- | ------------------------------------------------------------------------------ |
| default  | Slots avec bordure `input`, fond transparent (dark : `bg-input/30`)            |
| hover    | — (pas de style hover spécifique)                                              |
| focus    | Slot actif : bordure `ring`, anneau `ring-ring/50`, z-index élevé, caret animé |
| active   | Caret clignotant (`animate-caret-blink`) dans le slot actif                    |
| disabled | `cursor-not-allowed`, opacité réduite (`opacity-50`) sur le conteneur          |
| error    | Bordure `destructive`, anneau `ring-destructive/20` via `aria-invalid`         |

## Accessibilité

**Pattern** : Champ texte unique (input-otp) affiché en cases

**Rôle** : Un seul `input` réel reçoit la saisie ; les cases sont visuelles ; `InputOTPSeparator` porte `role="separator"`.

**Clavier** :

| Touche                     | Action                             |
| -------------------------- | ---------------------------------- |
| Chiffres / lettres         | Saisissent le code case après case |
| `Backspace`                | Efface le caractère précédent      |
| `ArrowLeft` / `ArrowRight` | Déplace le curseur                 |
| Coller                     | Remplit toutes les cases           |

**Nom accessible** : Obligatoire : un `Label` ou `aria-label` (« Code de vérification ») sur le champ.

**Vigilance** :

- Poser `autoComplete="one-time-code"` pour le remplissage automatique.
- Annoncer l'erreur (code invalide) par un message relié, pas seulement par la couleur des cases.

## Exemple de code

```tsx
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp"

export default function Example() {
  return (
    <InputOTP maxLength={6}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  )
}
```

## Références croisées

- `Input` — alternative pour les saisies libres classiques
- `Field` — peut encapsuler un `InputOTP` pour le label et les messages d'erreur
