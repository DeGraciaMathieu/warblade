---
name: ai
description: Use when modifying AI decision logic, adding new AI behaviors, changing AI strategy, or touching src/ai/ in the warhammer project
auto_invoke: true
---

# IA — Warhammer

## Architecture du module

`src/ai/` est un **module terminal** : il consomme `domain/` et `view/`, mais rien ne l'importe. Le cœur du système (`domain/`, `engine/`, `view/`) ignore totalement son existence.

```
domain/ ← engine/ ← view/ ← ai/
                     ↑
              ai/ consomme aussi domain/
```

Deux fichiers distincts avec des responsabilités séparées :

- `src/ai/ai-player.ts` — logique de décision pure. Consomme `domain/` uniquement. Pas de React, pas de Zustand.
- `src/ai/useAiPlayer.ts` — hook React. Lit le store `view/game-store`, appelle `decide()`, dispatche les actions du store.

## Pipeline de décision

`decide(state: GameState): AiDecision | null`

Séquence pour le joueur 2 :

1. Si `activePlayerId !== 2` → `null`.
2. Choisir l'unité à activer (`getUnitToAct`) — unité en cours d'activation ou première unité P2 non encore activée.
3. Si aucun ennemi vivant → `null`.
4. Si un ennemi est à portée arme avec LOS → `{ type: 'attack' }`.
5. Si l'unité n'a pas encore été activée ce tour → `{ type: 'move' }` vers l'ennemi le plus proche.
6. Sinon → `{ type: 'end-turn' }`.

## Types

```ts
// src/ai/ai-player.ts
type AiDecision =
  | { type: 'move'; unitId: UnitId; target: Position }
  | { type: 'attack'; attackerId: UnitId; targetPosition: Position }
  | { type: 'end-turn' }
```

## Hook — useAiPlayer

- S'abonne aux changements de `game` via le store.
- Déclenche un `setTimeout` (délai `AI_DELAY_MS = 800ms`) pour simuler une réflexion.
- Re-appelle `decide()` dans le timeout avec l'état courant (l'état peut avoir changé entre temps).
- Dispatche vers les mêmes actions que le joueur humain : `startDrag/endDrag`, `startAttackDrag/endAttackDrag`, `endTurn`.
- N'est activé que si `enabled === true` (mode `vs-ai`).

## Terrain : règle obligatoire

**Ne jamais accéder directement à `state.walls` ou `state.obstacles`** dans `ai-player.ts`. Utiliser les helpers du domain :

```ts
import { losBlockers, solidTerrain } from '../domain/game-state'

// LOS IA : walls seulement
hasLineOfSight(unit.position, e.position, losBlockers(state))

// Pathfinding IA : walls + obstacles
moveToward(from, to, maxDist, solidTerrain(state))
```

## Invariants à respecter

- `decide()` est **pure** : pas de mutation, pas d'effet de bord, pas de `Math.random`.
- `ai-player.ts` n'importe jamais depuis `view/`, `engine/` ou le DOM.
- Les coordonnées de déplacement retournées par `moveToward` sont **entières** (`Math.round`).
- Le module `ai/` ne doit pas être importé depuis `domain/`, `engine/` ou `view/`.
- Tout nouveau comportement IA passe par `AiDecision` — pas de dispatch direct dans `ai-player.ts`.

## Ajouter un nouveau comportement IA

1. Ajouter le cas dans `decide()` en respectant la séquence existante.
2. Si nécessaire, ajouter un nouveau variant dans `AiDecision`.
3. Gérer le nouveau variant dans `useAiPlayer.ts` (dispatch vers l'action store appropriée).
4. Tests d'abord : écrire les cas dans `ai-player.test.ts` via `decide()`, pas via le hook.

## Tests

- Tester uniquement via `decide()` — le hook n'est pas testé unitairement (React + timers).
- Construire les états avec les helpers `makeUnit` / `makeState` définis dans `ai-player.test.ts`.
- Pas de `Math.random` dans les tests — `decide()` est déterministe.
- Vérifier que les coordonnées de déplacement sont entières (`Number.isInteger`).
