---
name: combat
description: Use when modifying combat mechanics, attack resolution, weapon systems, damage pipeline, or activation/turn logic in the warhammer project
auto_invoke: true
---

# Combat — Warhammer

## Pipeline de résolution actuel

Le combat est résolu dans `src/engine/combat.ts` via `resolveAttack`. La séquence :

1. **Validation** — vérifie que l'attaquant et la cible existent.
2. **Portée** — `distance(attacker, target) <= weapon.range`.
3. **Ligne de vue** — `hasLineOfSight(attacker, target, [...losBlockers(state), ...enemyObstacles])` — seuls les `walls` bloquent la LOS.
4. **Couvert** — `isInCover(attacker, target, radius, solidTerrain(state))` — `walls` et `obstacles` donnent tous les deux du couvert.
5. **Jets pour toucher** — `weapon.attacks` jets de d6, chaque résultat ≥ `weapon.toHit` = hit.
6. **Jets de sauvegarde** — pour chaque hit, la cible jette un d6 ; résultat < `target.save` = dégât appliqué.
7. **Dégâts** — chaque sauvegarde ratée inflige `weapon.damage` ; `remainingWounds` est décrémenté (min 0).

Retour : `{ state: GameState, events: GameEvent[] }` avec un `AttackResolvedEvent`.

## Modèle de données

```ts
// src/domain/weapon.ts
type Weapon = { name: string; range: number; attacks: number; toHit: number; damage: number }

// src/domain/unit.ts (champs combat)
Unit = { weapon: Weapon; availableWeapons: Weapon[]; wounds: number; remainingWounds: number; save: number }

// src/domain/game-event.ts
AttackResolvedEvent = { type: 'attack-resolved'; attackerId; targetId; hits; damageDealt; hitRolls; saveRolls }
```

## Système de tours et activation

- `GameState.activePlayerId` — le joueur dont c'est le tour (1 ou 2).
- `GameState.activatedUnitId` — l'unité en cours d'activation (une seule à la fois, `null` sinon).
- `endActivation` (`src/engine/turn.ts`) — passe au joueur suivant et reset `activatedUnitId`.
- Contraintes dans le store : seule une unité du joueur actif peut être sélectionnée ; une fois activée, seule cette unité peut agir jusqu'à fin d'activation.

## Aléatoire

Le rng est **injecté** via le type `Rng = () => number` (`src/domain/rng.ts`).

- **Engine** : toute fonction utilisant l'aléatoire reçoit un `rng` en paramètre.
- **Tests** : utiliser `seededRng(seed)` pour des résultats déterministes.
- **View** : passe `Math.random` au moment de l'appel dans le store.

## Ajouter une nouvelle mécanique de combat

### Nouvelle arme ou profil d'arme

1. Ajouter les données dans `src/data/weapons.ts` (ou le fichier data approprié).
2. Référencer l'arme dans `availableWeapons` de l'unité concernée.
3. Si nouveaux champs sur `Weapon` → mettre à jour le type dans `domain/weapon.ts`.

### Nouveau modificateur (ex : bonus/malus au hit)

1. Définir le type du modificateur dans `domain/` (type pur).
2. Appliquer dans `resolveAttack` au moment du jet concerné.
3. Émettre l'info dans `AttackResolvedEvent` pour que la view puisse l'afficher.
4. Tester avec `seededRng` — vérifier le comportement, pas l'implémentation.

### Nouvelle étape dans le pipeline (ex : wound roll, armour penetration)

1. Ajouter l'étape entre les étapes existantes dans `resolveAttack`.
2. Enrichir `AttackResolvedEvent` avec les nouveaux jets.
3. Mettre à jour `Weapon` ou `Unit` si de nouveaux champs sont nécessaires.
4. Tests d'abord : écrire les cas avant d'implémenter.

### Nouvelle capacité spéciale (ex : feel no pain, invulnerable save)

1. Modéliser comme un champ optionnel sur `Unit` dans `domain/unit.ts`.
2. Appliquer dans `resolveAttack` à l'étape appropriée.
3. Ne pas hardcoder la règle — la capacité est une donnée sur l'unité, le moteur la lit.

## Sémantique du terrain

**Ne jamais accéder directement à `state.walls` ou `state.obstacles` pour la LOS ou le couvert.** Utiliser les helpers du domain :

```ts
import { losBlockers, solidTerrain } from '../domain/game-state'

// LOS : walls seulement
hasLineOfSight(from, to, [...losBlockers(state), ...enemyObstacles])

// Couvert : walls + obstacles
isInCover(from, to, radius, solidTerrain(state))
```

| | Bloque LOS | Bloque mouvement | Donne couvert |
|---|---|---|---|
| `walls` | ✅ | ✅ | ✅ |
| `obstacles` | ❌ | ✅ | ✅ |

## Invariants à respecter

- `resolveAttack` est **pure** : pas de mutation, pas d'effet de bord, pas de `Math.random`.
- Le rng est toujours injecté — jamais importé ou capturé dans une closure.
- Tout résultat de combat passe par un `GameEvent` — la view ne lit que les événements.
- Pattern retour obligatoire pour l'engine : `{ state: GameState, events: GameEvent[] }`.
- Pas de hardcode de profil d'arme ou de règle spécifique dans le moteur — tout vient de `data/` ou des champs de l'unité.
- Les données d'unités et d'armes sont dans `src/data/`, pas dans `engine/` ni `view/`.
