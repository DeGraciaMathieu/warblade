---
name: code-conventions
description: Conventions de code à appliquer pour toute écriture ou modification de code dans le projet wargame. Utiliser systématiquement avant d'écrire ou modifier un fichier TypeScript, que ce soit dans domain, engine, view, ou les tests. Couvre le style, le nommage, la structure des modules, la gestion d'état, les tests, et les patterns spécifiques au projet (pipeline d'événements, hooks de capacités, immutabilité).
---

# conventions de code — wargame

## typescript

- mode strict activé partout. `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`.
- pas de `any`. utiliser `unknown` puis narrow.
- pas de `as` sauf cas justifié par un commentaire `// safe: <raison>`.
- préférer les `type` aux `interface` sauf pour les extensions de tiers.
- discriminated unions pour modéliser les états et événements (`type: 'attack' | 'move' | ...`).
- pas d'enum typescript, utiliser des unions de literals.

## fonctions vs classes

- fonctions pures par défaut dans `domain/` et `engine/`.
- classes uniquement quand un état mutable encapsulé apporte une vraie valeur (ex : registre de hooks). justifier en commentaire de classe.

## nommage

- fichiers en `kebab-case.ts`.
- types et types-alias en `PascalCase`.
- fonctions et variables en `camelCase`.
- constantes de configuration en `SCREAMING_SNAKE_CASE` uniquement si vraiment constantes globales.
- nommer par l'intention métier, pas par le type technique : `selectActiveModels` plutôt que `getModelsArray`.

## structure d'un module domain

```ts
// src/domain/geometry.ts
import type { Point, Circle } from './types'

export const distance = (a: Point, b: Point): number => { ... }
export const circlesOverlap = (a: Circle, b: Circle): boolean => { ... }
```

- un fichier = un concept cohérent.
- exports nommés uniquement, pas de `default`.
- pas d'effet de bord à l'import.

## state et immutabilité

- state modifié uniquement via immer dans les actions zustand.
- aucune mutation directe d'objet du domain.
- les fonctions d'engine retournent `{ state: GameState, events: GameEvent[] }`, jamais ne mutent l'entrée.

## pipeline d'événements

toute action de jeu produit une liste d'événements, jamais ne modifie le state directement :

```ts
export const resolveAttack = (
  state: GameState,
  action: AttackAction,
  rng: Rng,
): Resolution => {
  const events: GameEvent[] = []
  // emit events, run hooks, accumulate
  return { state: applyEvents(state, events), events }
}
```

- chaque type d'événement a un payload typé.
- les capacités spéciales s'enregistrent comme hooks `(event, context) => event | null` qui peuvent transformer ou annuler l'événement.

## données

- toute donnée d'unité, d'arme, de terrain, de scénario vit dans `src/data/` au format ts (pas json, pour bénéficier du typage).
- jamais de littéral de données dispersé dans le code.

## tests

- vitest, fichiers `*.test.ts` à côté du fichier testé.
- un `describe` par fonction publique, des `it` qui décrivent un comportement en français.
- tests déterministes : rng seedé, pas d'horloge, pas de `Math.random`.
- arrange / act / assert visibles, séparés par une ligne vide.
- pas de mocks dans le domain. mocks autorisés uniquement à la frontière view ↔ engine.

## interdits

- pas de `console.log` committé (utiliser un logger debug si nécessaire).
- pas de tri ou de filtre qui mute (`sort` sur place sans `[...arr]`).
- pas d'import depuis `view/` dans `engine/` ou `domain/`.
- pas de logique métier dans les composants de rendu.
- pas de "utils.ts" fourre-tout.

## quand hésiter

privilégier dans cet ordre : lisibilité > simplicité > performance. n'optimiser qu'avec une mesure à l'appui.