<!--
Titre de PR au format Conventional Commits — il devient le message de commit
sur `main` en squash merge. Ex. : `fix(tokens): add destructive-foreground token`
-->

## Item du backlog

<!-- 1 PR = 1 item. Ex. : P0-03 -->

## Ce que change cette PR

<!-- Le quoi et le pourquoi. Pas le comment : le diff le dit deja. -->

## Critères d'acceptation

<!-- Recopier ceux de l'item du backlog et cocher ce qui est prouvé. -->

- [ ]
- [ ]

## Validation exécutée

<!-- Coller la commande de validation de l'item et sa sortie. -->

```

```

## Checklist

- [ ] `npm run tokens-validate` passe (si des tokens ont été touchés)
- [ ] `npm run typecheck:all` passe
- [ ] `npm run lint` ne remonte aucune erreur
- [ ] `npm run generate-context` ne produit aucun diff (si le DS a changé)
- [ ] Aucune valeur brute (hex, px, rem) ajoutée hors de `tokens/primitive.json`
- [ ] La spec du composant a été lue avant modification, et mise à jour si l'API change
- [ ] Icônes Phosphor uniquement
