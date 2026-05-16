Analyse complète de la feature en cours : conventions, tests, maintenabilité et cohérence système.

1. Lis le fichier `CLAUDE.md` à la racine du projet pour charger les conventions et l'architecture.
2. Récupère les modifications en cours avec `git diff`, `git diff --cached`, `git status` et `git log --oneline -5` pour comprendre le périmètre de la feature.
3. S'il n'y a aucune modification (staged, unstaged ou commits récents non pushés), indique-le et arrête-toi.

## Conventions

4. Pour chaque convention du `CLAUDE.md`, vérifie si les modifications la respectent. En particulier :
   - Stack utilisée (TypeScript strict, Vite, Pixi.js v8, Zustand + Immer, Vitest)
   - Architecture en trois couches respectée : `domain/` → `engine/` → `view/`, jamais l'inverse
   - Pas d'import de Pixi, Zustand, Immer ou du DOM dans `domain/` ou `engine/`
   - Fonctions du domain pures et déterministes (pas de `Math.random`, pas d'effet de bord)
   - Toute mutation de state via Immer dans une action Zustand, jamais de mutation directe
   - Pas de hardcode d'unité, d'arme ou de règle dans le moteur — tout passe par data + hooks
   - Typage TypeScript strict : pas de `any`, pas de `as` sans commentaire `// safe:`
   - Nommage : `kebab-case` fichiers, `PascalCase` types, `camelCase` fonctions, `SCREAMING_SNAKE_CASE` constantes globales
   - Pas d'imports inutilisés, constantes mortes, `console.log` committés ou lignes blanches superflues

## Tests

5. Vérifie la couverture de tests :
   - Chaque nouveau comportement dans `domain/` ou `engine/` a-t-il un test `*.test.ts` correspondant ?
   - Les tests existants sont-ils à jour avec les modifications ?
   - Les tests décrivent-ils le comportement (pas l'implémentation) ?
   - Les tests sont-ils déterministes (rng seedé, pas de `Math.random`, pas d'horloge) ?
   - La couche `view/` est exclue des tests unitaires (rendu Pixi non testé) — vérifier qu'aucun test view n'a été ajouté inutilement.
6. Lance les tests avec `source ~/.nvm/nvm.sh && nvm use 22 && npx vitest run` et vérifie qu'ils passent tous.

## Maintenabilité et dette technique

7. Analyse les modifications sous l'angle maintenabilité :
   - **Couplage** : les modifications introduisent-elles des dépendances entre couches non autorisées ?
   - **Responsabilité unique** : chaque fonction/module garde-t-il une responsabilité claire ?
   - **Duplication** : y a-t-il du code dupliqué qui devrait être factorisé ?
   - **Complexité** : des fonctions deviennent-elles trop longues ou trop imbriquées (> 40 lignes, > 3 niveaux) ?
   - **Nommage** : les noms sont-ils explicites et cohérents avec l'existant ?
   - **Magic values** : des valeurs en dur qui devraient être des constantes nommées dans `constants.ts` ou `data/` ?

## Cohérence système

8. Vérifie la cohérence globale :
   - Les modifications s'intègrent-elles bien dans les trois couches sans briser la dépendance unidirectionnelle ?
   - Le `GameState` reste-t-il cohérent et prévisible ?
   - Les nouvelles fonctions suivent-elles les patterns existants (retour `{ state, events }` pour l'engine, fonctions pures pour le domain) ?
   - Les données de terrain, d'unité ou de carte nouvelles sont-elles dans `src/data/`, pas hardcodées dans le moteur ou la view ?

## Rapport

9. Produis un rapport structuré :
   - **Conventions** : statut par convention (OK / VIOLATION / N/A)
   - **Tests** : résultat des tests + couverture manquante identifiée
   - **Maintenabilité** : problèmes détectés avec le code concerné
   - **Cohérence** : incohérences ou risques identifiés
   - **Verdict** : résumé en une phrase + liste d'actions correctives si nécessaire
