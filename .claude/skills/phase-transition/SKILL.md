---
name: phase-transition
description: À utiliser pour clôturer proprement une phase du roadmap et passer à la suivante. Déclencher quand l'utilisateur dit "on passe à la phase X", "phase Y terminée", "on clôture", "next phase", ou quand le périmètre de la phase active du CLAUDE.md vient d'être complété. Garantit qu'on ne laisse pas de dette, que CLAUDE.md est à jour, et que la phase suivante démarre sur des bases propres.
---

# transition de phase

une transition de phase est un moment à risque : on est tenté de se précipiter sur la suite alors que la phase précédente a laissé des aspérités. cette procédure existe pour les rattraper.

## checklist de clôture

avant de déclarer une phase terminée, vérifier dans l'ordre :

1. **tests** — `npm run test` passe intégralement, aucun `.skip`, aucun `.only` oublié.
2. **typecheck** — `npm run typecheck` passe sans warning.
3. **lint** — `npm run lint` passe sans warning.
4. **build** — `npm run build` passe.
5. **couverture fonctionnelle** — chaque livrable annoncé pour la phase est démontrable en lançant l'app. lister explicitement les livrables et confirmer.
6. **dette identifiée** — relire les `TODO`, `FIXME`, `HACK` ajoutés pendant la phase. soit les résoudre, soit les transformer en issues explicites notées dans `docs/debt.md` avec phase d'origine.
7. **données de test** — si des fixtures ad-hoc ont été créées pour développer, vérifier qu'elles sont soit nettoyées, soit promues en données de référence dans `src/data/`.

## mise à jour de CLAUDE.md

- mettre à jour la section `phase courante` avec la nouvelle phase.
- ajouter une ligne dans une section `phases terminées` (à créer si absente) avec date et hash de commit du tag de clôture.

## tag git

créer un tag annoté pour la phase clôturée :