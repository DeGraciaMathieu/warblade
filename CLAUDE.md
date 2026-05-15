# wargame — process de développement

## stack

typescript strict, vite, pixi.js v8, zustand + immer, vitest, flatten-js.
full client-side, pas de backend.

## architecture en trois couches

- `src/domain/` : types, géométrie, données. zéro dépendance externe (ni pixi, ni zustand, ni vite).
- `src/engine/` : moteur de règles, pipeline d'événements, résolution. consomme `domain/` uniquement.
- `src/view/` : rendu pixi, store zustand, ui. consomme `engine/` via le store.

dépendance unidirectionnelle stricte : view → engine → domain. jamais l'inverse.

## démarrer une tâche

utiliser les slash commands selon le type de travail :

- `/feature` — nouvelle fonctionnalité ou évolution.
- `/fix` — correction de bug.
- `/refactor` — refactorisation sans changement de comportement.

ces commandes cadrent la session : elles recueillent le périmètre, proposent un plan, et garantissent le respect de la boucle de travail. ne pas démarrer une tâche non triviale sans passer par une commande.

## boucle de travail

pour chaque tâche, suivre ce cycle sans le raccourcir :

1. **clarifier** — reformuler la tâche en une phrase, identifier le périmètre, lister les fichiers concernés. si quelque chose est ambigu, poser une question avant de coder.
2. **plan** — proposer un plan court (3 à 6 étapes) et attendre validation pour toute tâche non triviale. trivial = un fichier, moins de 30 lignes, pas de nouvelle abstraction.
3. **tests d'abord** — pour toute logique dans `domain/` ou `engine/`, écrire les tests vitest avant l'implémentation. les tests décrivent le comportement attendu, pas l'implémentation. exception : la couche view, dont le rendu pixi n'est pas testé unitairement.
4. **implémenter** — appliquer le skill `code-conventions`. ne pas anticiper de besoins futurs.
5. **auto-review** — avant de proposer le diff, appliquer le skill `code-review` sur le code produit. corriger les points avant de présenter.
6. **commit** — un commit par étape validée par l'utilisateur. message en conventional commits. ne pas commit sans validation explicite.

## skills

charger et appliquer les skills suivants selon le contexte :

- écriture ou modification de code → `code-conventions`.
- diff non trivial ou demande explicite de relecture → `code-review`.
- bug signalé ou test rouge → `debugging`.
- refactor (modification sans changement de comportement) → `refactor`.
- clôture ou transition de phase → `phase-transition`.

les descriptions de skills listent leurs déclencheurs précis. en cas de doute, charger le skill.

## invariants architecturaux

ces règles définissent le projet. ne jamais les enfreindre sans en discuter d'abord :

- pas d'import de pixi, zustand, immer ou du dom dans `domain/` ou `engine/`.
- pas de hardcode d'unité, d'arme ou de règle spécifique dans le moteur. tout passe par data + hooks.
- toute fonction du domain est pure et déterministe. le hasard passe par un rng injecté et seedable.
- toute mutation de state passe par immer dans une action zustand. jamais de mutation directe d'objet du domain.

les conventions de code détaillées (typage, nommage, style) sont dans le skill `code-conventions`.

## ce que claude ne fait pas sans demander

- installer une nouvelle dépendance npm.
- modifier la configuration de tooling (vite, tsconfig, eslint, vitest).
- supprimer ou désactiver des tests existants.
- modifier des fichiers hors du périmètre annoncé pour la tâche en cours.
- inventer une règle de jeu ambiguë (toujours demander avant).
- élargir le scope d'une tâche en cours ("tant qu'on y est...").

## phase courante

**phase 1** — store zustand + premières entités (figurines sur le plateau).

## phases terminées

| phase | date | commit |
|-------|------|--------|
| 0 — setup projet + premier rendu pixi | 2026-05-15 | d315905 |

## quand ralentir

si la tâche touche au pipeline d'événements, à la state machine des phases, ou à la couche géométrique : prendre le temps, écrire les tests d'abord, demander en cas de doute. ces trois zones sont les fondations et toute dette technique s'y multiplie.