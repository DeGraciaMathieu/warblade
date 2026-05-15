# Drag-to-move — Design spec

**Date :** 2026-05-15

## Résumé

Remplacer le mécanisme click-to-select + click-to-move par un drag-to-move : l'utilisateur clique sur une unité, maintient et déplace la souris pour voir une flèche apparaître, puis relâche pour déplacer l'unité.

---

## Comportement

- `pointerdown` sur une unité démarre le drag.
- Pendant le drag, une flèche est dessinée depuis le centre de l'unité vers la position cible.
- La flèche est **toujours cappée** à la portée maximale de l'unité (`unit.move`). Si le curseur dépasse cette portée, la flèche s'arrête au maximum dans la direction indiquée.
- `pointerup` sur le board déplace l'unité vers `dragState.target` (la position cappée) et efface la flèche.
- Le mécanisme `selectedUnitId` / `selectUnit` est supprimé entièrement.

---

## Store Zustand (`game-store.ts`)

### Nouvelles additions

```ts
type DragState = {
  unitId: UnitId
  target: Position   // toujours cappée à la portée max
}

dragState: DragState | null

startDrag(unitId: UnitId, rawTarget: Position): void
updateDrag(rawTarget: Position): void
endDrag(): void
```

### Logique de capping (dans `updateDrag` et `startDrag`)

```
dir = normalize(rawTarget - unit.pos)
dist = min(distance(rawTarget, unit.pos), unit.move)
target = unit.pos + dir * dist
```

Cas dégénéré : si `rawTarget === unit.pos`, pas de déplacement possible — `target = unit.pos`.

### `endDrag`

Appelle `applyMove(game, dragState.unitId, dragState.target)` puis reset `dragState = null`.

### Suppressions

- `selectedUnitId: UnitId | null`
- `selectUnit(id: UnitId): void`

---

## Board.tsx

### Interactions Pixi

| Événement | Cible | Action |
|-----------|-------|--------|
| `pointerdown` | Graphics d'une unité | `startDrag(unitId, cursorPos)` |
| `pointermove` | boardGfx | `updateDrag(cursorPos)` si dragState actif |
| `pointerup` | boardGfx | `endDrag()` si dragState actif |

L'ancien handler `pointerdown` sur `boardGfx` (qui appelait `moveUnit`) est supprimé.

### Rendu flèche

- Un `Graphics` dédié `arrowGfx` est ajouté dans une couche entre board et unités.
- À chaque mise à jour du store :
  - Si `dragState !== null` : dessiner une ligne + tête de flèche de `unit.position * PIXELS_PER_INCH` vers `dragState.target * PIXELS_PER_INCH`.
  - Si `dragState === null` : effacer `arrowGfx`.
- La tête de flèche est un triangle simple orienté dans la direction du vecteur.

### Suppressions

- Coloration jaune de sélection (`UNIT_SELECTED_COLOR`) supprimée.
- `selectedUnitId` et `selectUnit` retirés des paramètres de `drawUnits`.

---

## Tests

Couche **engine/domain** uniquement (pas de tests Pixi).

- `startDrag` : calcule correctement la target cappée.
- `updateDrag` : recalcule la target cappée à chaque mouvement.
- `endDrag` : appelle `applyMove` et reset `dragState`.
- Cas limites : target hors portée, target identique à la position actuelle.

---

## Fichiers concernés

| Fichier | Modification |
|---------|-------------|
| `src/view/game-store.ts` | Ajout `dragState`, `startDrag`, `updateDrag`, `endDrag` ; suppression `selectedUnitId`, `selectUnit` |
| `src/view/Board.tsx` | Remplacement des handlers clic par drag ; ajout rendu flèche ; suppression coloration sélection |
