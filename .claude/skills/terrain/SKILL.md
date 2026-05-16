---
name: terrain
description: Use when modifying terrain types, movement geometry, obstacle collision, line of sight, or adding new terrain types in the warhammer project
auto_invoke: true
---

# Terrain — Warhammer

## Modèle de terrain actuel

Le plateau est un espace 2D continu de **48" × 48"** (`BOARD_WIDTH_IN`, `BOARD_HEIGHT_IN` dans `src/domain/board.ts`).

Un terrain est un rectangle AABB défini par :

```ts
// src/domain/obstacle.ts
type Obstacle = { x: number; y: number; width: number; height: number }
```

Le `GameState` (`src/domain/game-state.ts`) contient un champ `obstacles: Obstacle[]`.  
Les données de carte sont dans `src/data/maps.ts` sous le type `MapData`.

## Géométrie du mouvement

Deux fonctions dans `src/domain/position.ts` :

- **`capPosition(from, rawTarget, maxDist)`** — plafonne la destination à la portée max.
- **`resolveTarget(from, rawTarget, maxDist, obstacles)`** — applique `capPosition` puis stoppe le déplacement au bord de l'obstacle le plus proche (algorithme slab AABB).

Le moteur (`src/engine/move.ts` — `applyMove`) :
1. Vérifie que la cible est dans le plateau.
2. Vérifie que la distance `from → target` ne dépasse pas `unit.remainingMove`.
3. Met à jour `position` et décrémente `remainingMove`.

> `applyMove` ne fait pas de résolution d'obstacle — c'est `resolveTarget` (domain) qui le fait en amont, côté view.

## Ajouter un nouveau type de terrain

### 1. Définir le type dans `domain/`

Créer `src/domain/<terrain>.ts` avec le type et ses propriétés spécifiques.  
Ajouter le champ dans `GameState`.

### 2. Effet sur le mouvement

| Comportement souhaité | Où modifier |
|---|---|
| Bloquer complètement (infranchissable) | `resolveTarget` dans `position.ts` — traiter comme obstacle AABB |
| Stopper le mouvement du tour à l'entrée | `applyMove` dans `move.ts` — détecter l'entrée dans la zone, mettre `remainingMove` à 0 |
| Coût supplémentaire (ex : ×2) | `applyMove` — majorer la distance consommée |
| Dégât à l'entrée | Nouveau `GameEvent` émis depuis `applyMove` |

### 3. Ligne de vue (si applicable)

La LOS n'est pas encore implémentée. Quand elle le sera, les terrains bloquants devront alimenter le set de blocage, à l'image de `resolveTarget` pour le mouvement.

### 4. Données de carte

Ajouter le nouveau terrain dans `MapData` (`src/data/maps.ts`) et le renseigner dans les maps existantes.

### 5. Rendu

Ajouter le rendu du terrain dans `src/view/Board.tsx` (couche pixi).  
Ne pas tester le rendu unitairement (exception documentée dans CLAUDE.md).

## Invariants à respecter

- `position.ts` et `obstacle.ts` ne dépendent d'aucune lib externe (pure domain).
- Toute logique de règle (coût, dégât) passe par `applyMove` et des `GameEvent`, jamais directement dans la view.
- Les données de terrain sont dans `src/data/`, pas hardcodées dans le moteur.
