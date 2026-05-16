---
name: refactor
description: Cadre à appliquer pour toute opération de refactorisation, c'est-à-dire toute modification de code qui ne change pas le comportement observable. Déclencher quand l'utilisateur dit "refactor", "nettoie", "extrais", "renomme", "simplifie", "déduplique", ou quand le code à modifier touche plus de trois fichiers sans ajouter de fonctionnalité. Empêche les refactors qui dérapent en réécriture, et garantit qu'un refactor préserve strictement le comportement.
---

# refactor — cadre

un refactor est par définition à comportement constant. dès qu'on change le comportement, ce n'est plus un refactor mais une évolution, et ça doit être traité comme tel.

## préconditions

avant tout refactor :

1. **tests verts** — la suite de tests doit passer intégralement. on ne refactor pas du code non testé sans avoir d'abord ajouté des tests de caractérisation qui capturent le comportement actuel.
2. **commit propre** — partir d'un working tree propre. le refactor doit être isolable dans son propre commit (ou série de commits).
3. **scope explicite** — formuler en une phrase ce qui change et ce qui ne change pas. exemple : "extraire la fonction de calcul de distance vers `domain/geometry`, signature et résultats identiques."

si l'une de ces préconditions manque, la signaler et la corriger avant de commencer.

## règles d'or

- **un refactor à la fois**. ne pas mélanger "je renomme" et "je change la signature". chaque transformation est isolée et testée.
- **les tests ne sont pas modifiés** pendant un refactor, sauf si le refactor concerne explicitement la structure des tests. si un test devient rouge, le refactor est faux, pas le test.
- **petits pas**. après chaque transformation, lancer les tests. ne pas accumuler dix changements avant de vérifier.

## déclencheurs légitimes

refactorer est justifié quand :

- duplication avérée (trois occurrences au moins, pas deux).
- nommage qui ment ou qui ne reflète plus le concept.
- couche violée (logique métier dans la view, dépendance qui remonte).
- fonction trop longue ou trop liée à plusieurs responsabilités, identifiée par un besoin concret de la toucher.
- pattern qui revient et mérite d'être abstrait, sur la base d'usages réels.

déclencheurs **non** légitimes à refuser :

- "ça pourrait être plus joli".
- "on pourrait avoir besoin de la flexibilité plus tard".
- "ça ressemble à un pattern que je connais" sans besoin concret.

## démarche

1. **caractériser** — si le code à refactorer n'est pas couvert par des tests, écrire des tests de caractérisation qui capturent le comportement actuel (même les bizarreries). ces tests guideront le refactor.
2. **lister les étapes** — décomposer le refactor en transformations atomiques. exemple : (a) extraire la fonction, (b) renommer l'ancien appel, (c) déplacer la fonction dans le bon module, (d) supprimer les imports obsolètes.
3. **exécuter pas à pas** — chaque étape suivie d'un `npm run test` et `npm run typecheck`. commit intermédiaire si l'étape est non triviale.
4. **revue finale** — appliquer le skill `code-review` sur le diff complet. un refactor doit notamment vérifier qu'aucune dépendance n'a été inversée et qu'aucun comportement n'a changé.

## techniques classiques utiles

- **extract function** : extraire un bloc cohérent en fonction nommée. d'abord créer la fonction à côté, puis substituer un seul appel, tester, puis substituer les autres.
- **rename** : utiliser l'outil de renommage de l'ide (ou `tsc` + recherche) pour propager. ne jamais renommer à la main fichier par fichier.
- **move** : déplacer un symbole d'un module à un autre. d'abord ré-exporter depuis l'ancien emplacement pendant la migration, puis supprimer les ré-exports une fois tous les appelants migrés.
- **inline** : supprimer une indirection inutile, à privilégier sur l'extraction quand l'abstraction n'a qu'un seul usage.
- **introduce parameter object** : quand une fonction prend trop de paramètres liés, les regrouper en un type. attention à ne pas regrouper des paramètres qui changent indépendamment.

## anti-patterns à refuser

- refactor + nouvelle fonctionnalité dans le même commit.
- refactor qui supprime des tests "devenus inutiles" sans justification écrite.
- refactor géant en une seule passe sans étapes intermédiaires testables.
- introduction d'une abstraction sur un seul usage ("au cas où").
- "j'ai aussi nettoyé deux trois trucs au passage" → refuser, ces trucs doivent être leurs propres commits.

## format de sortie

à la fin d'un refactor :
refactor : <résumé en une phrase>
scope : <ce qui change>
hors scope : <ce qui ne change pas>
étapes effectuées : <liste>
tests : <inchangés / N tests de caractérisation ajoutés en préalable>
fichiers touchés : <liste>
comportement : strictement identique

si à un moment du refactor on découvre que le comportement doit changer pour être correct, arrêter le refactor, le finir tel quel, et traiter le changement de comportement dans un commit séparé clairement étiqueté comme tel.