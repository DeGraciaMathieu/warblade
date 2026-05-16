---
name: debugging
description: Méthodologie de debug à appliquer quand un bug est signalé ou suspecté. Déclencher quand l'utilisateur dit "ça plante", "ça ne marche pas", "bug", "le test échoue", "comportement bizarre", ou quand un test rouge apparaît. Impose une démarche d'investigation reproductible avant toute correction et évite les "fix au pifomètre" qui masquent le vrai problème.
---

# debugging — méthodologie

ne jamais corriger un bug sans avoir d'abord compris pourquoi il se produit. un fix sans diagnostic crée souvent un second bug.

## étapes obligatoires

### 1. reproduire

avant tout : reproduire le bug de manière déterministe.

- si possible, écrire un test vitest rouge qui démontre le bug. ce test deviendra la garantie de non-régression.
- pour un bug dépendant du hasard, fixer la seed du rng et confirmer la reproduction.
- pour un bug d'ui, décrire la séquence d'actions exacte qui le déclenche.

si le bug n'est pas reproductible de manière fiable, le dire explicitement et ne pas corriger à l'aveugle. proposer plutôt d'ajouter du logging ciblé pour le capturer la prochaine fois.

### 2. localiser

une fois le bug reproductible, localiser la source avant toute modification :

- lire le code suspect plutôt que deviner.
- utiliser `console.log` ou le debugger pour confirmer les valeurs intermédiaires, ne pas supposer.
- vérifier si le bug est dans la couche annoncée. souvent, un bug d'affichage vient en réalité du domain ou de l'engine.
- formuler une hypothèse précise sur la cause avant de toucher au code : "le bug vient de X parce que Y".

### 3. confirmer l'hypothèse

avant de coder le fix :

- expliquer en une ou deux phrases pourquoi cette hypothèse explique tous les symptômes.
- si l'hypothèse n'explique pas tout, elle est probablement fausse ou incomplète. revenir à l'étape 2.

### 4. corriger

- le fix doit traiter la cause, pas le symptôme.
- si la cause est profonde et le fix coûteux, le dire à l'utilisateur et proposer le choix entre fix profond et workaround temporaire (ce dernier avec entrée dans `docs/debt.md`).
- toute correction est accompagnée du test rouge écrit en étape 1, qui devient vert.

### 5. élargir

après le fix, se poser ces questions :

- la même cause peut-elle produire d'autres bugs ailleurs ? auditer rapidement.
- un test plus général aurait-il attrapé ce bug ? si oui, l'ajouter.
- une convention manque-t-elle pour éviter ce genre de bug à l'avenir ? si oui, proposer un ajout à `code-conventions`.

## anti-patterns à refuser

- ajouter un `try/catch` sans comprendre l'erreur, juste pour la faire taire.
- changer un type pour le faire correspondre à la valeur reçue, sans comprendre pourquoi la valeur a cette forme.
- "ça marche maintenant, je ne sais pas pourquoi" → ne pas commit, continuer à creuser.
- modifier le test pour qu'il passe au lieu de modifier le code.
- multiplier les fix tentatifs sans rolback entre chaque (le code devient illisible et plus rien n'est attribuable).

## bugs typiques du projet

quelques pistes spécifiques à regarder en premier selon le symptôme :

- **figurine qui saute ou disparaît** → mutation accidentelle du state, vérifier les sélecteurs et l'usage d'immer.
- **distance ou lof incorrecte** → probablement une confusion px ↔ pouces, vérifier la conversion view → domain.
- **capacité spéciale qui ne s'applique pas** → ordre d'enregistrement des hooks, ou hook qui consomme l'événement au lieu de le transformer.
- **test non déterministe** → rng non seedé, ou ordre d'itération sur un objet (utiliser des `Map` ou des tableaux).
- **typescript content mais bug runtime** → présence d'un `as` ou d'une donnée externe non validée.

## format de sortie

documenter le debug dans la réponse :

```
symptôme : <description>
reproduction : <étapes ou test>
hypothèse : <cause supposée>
confirmation : <ce qui valide l'hypothèse>
fix : <ce qui a été modifié et pourquoi>
test de non-régression : <fichier:test>
audit élargi : <autres endroits vérifiés>
```